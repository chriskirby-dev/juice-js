// JavaScript Document
define('fs/filesystem', ['events', 'crypto/md5', 'fs/errors'], function( events, MD5, errors ){
	
	var exports = this.exports;
	var app = this.app;
	
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	var resolveLocalFileSystemURL = window.resolveLocalFileSystemURL;
	
	try{
		var tmp = LocalFileSystem.PERSISTENT;
		tmp = null;
	}catch(e){
		var LocalFileSystem = { PERSISTENT : window.PERSISTENT, TEMPORARY: window.TEMPORARY }; 
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	}
	
	var Path = function( path ){
		var self = this;
		self.full = path;
		if( path.indexOf('/') === 0 ) path = path.substr(1);
		if( path.indexOf('/') !== -1 ){
			var parts = path.split('/');
			parts.pop();
			if(parts.length > 1)
			self.dir = '/'+parts.join('/');
			else
			self.dir = '/'+parts[0];
		}else{
			self.dir = '/';
		}
		self.filename = path.split('/').pop();
	};
	
	var EntryWriter = function( entry ){
		events._extend( this );
		var self = this;
		self.entry = entry;
		self.writer = null;
		self.running = false;
		self.queue = [];
		self.entry.createWriter( function( writer ){
			self.writer = writer;
			self.emit('ready');
			if(self.queue.length > 0){
				self.execute();
			}
			return false;
		}, self.errors );
		
		self.hook = {
			clear: function(){
				var command = {};
				command.type = 'clear';
				self.queue.push( command );
				return self.hook;
			},
			write: function( content, contentType ){
				var command = {};
				command.type = 'write';
				command.content = content;
				if(contentType) command.contentType = contentType;
				self.queue.push( command );
				return self.hook;
			},
			success: function( fn ){
				self.completeCB = fn;
				return self.hook;
			},
			fail: function( fn ){
				self.failCB = fn;
				return self.hook;
			}
		};
		return self.hook;	
	};
	
	EntryWriter.prototype.getWriter = function( next ){
		var self = this;
		this.entry.createWriter( function( writer ){
			self.writer = writer;
			next();
		}, self.errors );
	};
	
	EntryWriter.prototype.error = function(e){
		errors.handle(e);
	};
	
	EntryWriter.prototype.execute = function(){
		
		var self = this;
		self.running = true;
		
		var runCommand = function( ready ){
			
			if(!ready){
				self.running = false;
				if( self.failCB ) self.failCB();
				return false;
			}
			
			if( self.queue.length == 0 ){
				self.running = false;
				if( self.completeCB ) self.completeCB();
				return false;
			}
			
			var cmd = self.queue.shift();
			var cmdType = cmd.type;

			switch( cmdType ){
				case 'write':
					if(!cmd.content){
						runCommand( false );
					}
					self.writer.onwriteend = function() {
			            runCommand( true );
			        };
			        self.writer.onerror = function (e) {
			           runCommand( null );
			        };
			        
			        // If data object is not passed in,
			        if ( cmd.content ) {
			        	if(typeof cmd.content == 'object'){
			        		cmd.content = JSON.stringify( cmd.content );
			        	}
			        	var blob = new Blob([ cmd.content ], { type: cmd.contentType ? cmd.contentType : 'text/plain' });
			        	self.writer.write(blob);
			        }
				break;
				case 'clear':
					self.writer.onwriteend = function(evt) {
						self.writer.seek(0);
						runCommand( true );
					};
					self.writer.truncate(0);
				break;
			}
		};
		
		runCommand( true );
		
	};
	
	var FileSystem = function( options ){
		
		events._extend( this );
		var self = this;
		self.options = options;
		self.cache = {};
		
		if( !self.options.size ) self.options.size = 0;
		
		if( options.local ){
			self.load( 'local', options.local );
		}else if( options.uri ){
			self.load( 'uri', options.uri );
		}else if( options.entry ){
			self.load( 'entry', options.entry );
		}
		
	};
	
	FileSystem.prototype.load = function( loadType, param ){
		
		var self = this;
		
		if(!self.options.root)self.options.root = '/';
		
		var setRootEntry = function( entry ){
			self.rootPath = entry.fullPath;
			self.nativePath = entry.nativeURL ? entry.nativeURL : self.options.root;
			self.root = entry;
			self.cache['/'] = self.root;
			console.log(self);
			self.emit('ready');
		};
		
		var loadLocal = function( param ){
			var type = param.toUpperCase();
			console.log('Load Local: '+type +'  '+ LocalFileSystem[type] );
			if( LocalFileSystem[type] ){
				window.requestFileSystem( LocalFileSystem[type], self.options.size, function( fs ){
					if( self.options.root ){
						self.root = fs.root;
						self.dir( self.options.root, function( entry ){
							setRootEntry( entry );
							return false;	
						}, true );
					}else{
						setRootEntry( fs.root );
					}
					return false;
				}, errors.handle );
			}else{
				self.emit('error', 404 );
			}
			return false;
		};
		
		switch( loadType ){
			case 'local':
				loadLocal( param );
			break;
			case 'uri':
			console.log('FS Uri:: '+param);
			resolveLocalFileSystemURL( param, function( entry ){
				console.log(JSON.stringify(entry));
				setRootEntry( entry );
				return false;
			});
			break;
			case 'entry':
				setRootEntry( param );
			break;
		}
		return false;
	};
	
	
	
	FileSystem.prototype.map = function( callback, rootEntry ){
	
		var self = this;
		var map = {};
		var currentPath = map;
		var root = rootEntry || self.root;
		var path = '/';
		var files = {};	
		var mapEntries = function( dirEntry, parent, next ){
			
			var reader = dirEntry.createReader();
			
			reader.readEntries(function( entries ){
				
				var processNext = function(){
					if(entries.length == 0) return next();
					var entry = entries.shift();
					if(entry.isDirectory){
						self.cache[entry.fullPath] = entry;
						parent[entry.name] = {};
						mapEntries( entry, parent[entry.name], function(){
							processNext();
						});
					}else if(entry.isFile){
						entry.file(function (file) {
					        var reader = new FileReader();
					        reader.onloadend = function() {
					        	var md5 = MD5.hashBinary( this.result );
					        	var fileObj = {
									md5: md5,
									path: entry.fullPath
								};
								if(!app.platform == 'browser'){
									fileObj.native = self.nativePath + entry.fullPath.slice(1);
								}
					            files[entry.fullPath.replace(self.rootPath, '')] = fileObj;
					            parent[entry.name] = md5;
								processNext();
					        };
					        reader.readAsBinaryString(file);
					    }, function(){
					    	console.log('Error Md5');
					    });
					}
				};
				processNext();
			});
			
			return false;
		};
		
		mapEntries( root, map, function(){
	  		console.log('FS Map :: '+JSON.stringify(files));
			callback( files );
		});
	
	};
	
	FileSystem.prototype.file = function( path, callback, create ){
		var self = this;
		var _path = new Path( path );
		console.log(_path);
		if( !create ) create = false;
		self.dir( _path.dir, function( dir ){
			console.log(dir);
			//Get Dir
			console.log(_path.dir+''+_path.filename+' '+create);
			dir.getFile( _path.filename, { create: create }, function ( entry ) {
				//Get File
				console.log(entry);
				callback( entry );
			}, function(e){
				console.log( e );
				callback( null );
			});
		}, true );
	};
	
	FileSystem.prototype.save = function( path, contents, callback ){
	
		var self = this;
		var _path = new Path( path );
		console.log('Save file');
		console.log(_path);	
		self.dir( _path.dir, function( dir ){
			
			dir.getFile( _path.filename, { create: true }, function ( fe ) {
				new EntryWriter( fe ).clear().write(contents).success(function(){
					callback( true );
				}).fail(function(){
					callback( false );
				});
			});
		}, true );
		
	};
	
	FileSystem.prototype.read = function( path, callback, dataType ){
		var self = this;
		self.file( path, function( entry ){
			self.readEntry( entry, callback, dataType);
			return false;
		}, dataType );
		return;
	};
	
	FileSystem.prototype.readEntry = function( entry, callback, dataType ){
	
		var self = this;
		if( !dataType ) dataType = 'text';
		var file;
		
		var read = function( cb, type ){
			var readAs = 'readAsText';
			var reader = new FileReader();
	        reader.onloadend = function() {
	        	//console.log('READ :: '+this.result);
	            cb( this.result );
	            return false;
	        };
	        reader[readAs]( file );
	        return false;
		};
		
		entry.file(function ( _file ) {
			file = _file;
			read(function( resp ){
	        	if(dataType == 'json'){
					callback( JSON.parse( resp ) );
				}else{
					callback( resp );
				}
				return false;
	        });
	    }, function(){
	    	console.log('Error JSON');
	    });
	    
	};

	
	FileSystem.prototype.hasDir = function( dir, callback ){
		var self = this;
		var root = self.root; 
		self.root.getDirectory( dir, { create: false, exclusive: false }, 
			function(entry){
				callback( true );
			}, 
			function(err){
				callback( false );
			}
		);
		return false;
	};
	
	FileSystem.prototype.dir = function( path, callback, force ){
		var self = this;
		//console.log( 'Dir: '+path);
		if( self.cache[path] ){
			callback(self.cache[path]); 
		}else{
			self.root.getDirectory( path, { 
				create: self.private ? false : true, 
				exclusive: false
			}, function( entry ){
				callback( entry );
				return false;
			}, function(){
				if( force ){
					self.mkdir( path, callback );
				}else{
					callback( null );
				}
			});
		}
	};
	
	FileSystem.prototype.mkdir = function( path, callback ){
		var self = this;
		if(path){
			
			if(path.indexOf('/') == 0){
				path = path.substr(1);
			}
			
			var entry = self.root; 
			var parts = path.split('/');
			
			var createDir = function(){
				var part = parts.shift();
				
				entry.getDirectory( part, { create: true, exclusive: false }, 
					function(_entry){
						console.log(_entry.fullPath+' Created Successfully');
						self.cache[_entry.fullPath] = _entry;
						entry = _entry;
						if( parts.length > 0 ){
							createDir();
						}else{
							callback( entry );
						}
					}, 
					function(err){
	 					callback( null );
					}
				);
			};
			
			createDir();
		
		}else{
			callback();
		}
	};
	
	FileSystem.prototype.clear = function(entry){
		
		var reader = this.root.createReader();
	
		reader.readEntries(function( entries ){
			for(var i=0;i<entries.length;i++){
				var _entry = entries[i];
				_entry.removeRecursively(function() {
			        console.log("Remove Recursively Succeeded");
			    }, function(){
			    	
			    });	
			}
		});
	
	};

	FileSystem.prototype.destroy = function(){
		
		var self = this;
		var files;
		
		console.log('Destroy');
		var poof = function(){
			
			if(files.length == 0){
				console.log('Destroyed');
				self.clear();
				return;
			}
			
			var path = files.shift();
			self.file(path, function( entry ){
				if(entry){
					entry.remove(function ( ) {
						console.log('Deleted '+path);
						poof();
					}, function(e){
						console.log('Delete Error');
						console.log(e);
						poof();
					});
				}else{
					poof();
				}
				return false;
			});
			return false;
		};
		
		self.map(function( filesData ){
			files = Object.keys(filesData);
			poof();
		});
		
		return false;
		
	};

	
	exports.load = function( options, callback ){
		console.log('Load FS:');
		console.log(JSON.stringify(options));
		var fs = new FileSystem( options );
		fs.on('ready', function(){
			callback( fs );
			return false;
		});
		return false;
	};
	
	return exports;

}, { persistant: true });