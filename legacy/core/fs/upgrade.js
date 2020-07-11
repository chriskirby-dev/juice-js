define('fs/upgrade', ['http/xhr', 'fs', 'crypto/md5'], function MobileUpgrade( xhr, fs, md5 ){
	
	var exports = this.exports;
	var app = this.app;
	
	var rootPath = window.location.pathname;
	rootPath = 'file://'+rootPath.substr( rootPath, rootPath.length - 10 );
	
	var _version;
	
	exports.paths = {};
	exports.version = null;
	exports.rewritePath = null;
	exports.remote = null;
	exports.router = null;	
	exports.index = 'index.html';
	exports.current = {};
	exports.installed = {};
	exports.fs = {};
	
	Object.defineProperty( exports, 'version', {
		get: function(){
			return exports.installed.version;
		},
		set: function( v ){
			exports.installed.version = v;
			exports.emit( 'version', exports.installed.version );
		}
	});
	
	var getRemote = function( type, callback ){
		var self = this;
		var remote = exports.remote;
		if(type == 'version') remote+='/version';
	    xhr.get( remote, { dataType: 'json' } ).success(function( resp ){
			if(!resp){
				callback(null);
				return;
			}	    	
	    	
	    	if(type == 'version'){
	    		callback(resp.version);
	    	}else{
	    		callback(resp);
	    	}
	    	return false;
	    }).fail(function(){
	    	callback(null);
	    	return false;
	    });
		return false;
	};
	
	var copyRemoteFile = function( src, dest, callback ){
		
		var uri = encodeURI( src );
		console.log('copyRemoteFile '+uri+' :: '+dest);
		exports.fs.upgrade.file( dest, function( fileEntry ){
			var fileURL = fileEntry.toURL();
			console.log('Saving '+fileURL);
			
			var fileTransfer = new FileTransfer();
			fileTransfer.download( uri, fileURL, function(entry) {
				//Success
				console.log('SAVED:: '+fileURL);
				callback( entry );
			}, function(){
				//Error
				callback( null );
			}, false );
			
		}, true );
		
	};
	
	var createLocalManifest = function( callback ){
		
		var saveManifestFile = function( manifest ){
			exports.fs.upgrade.save( '.manifest', manifest, function( saved ){
				console.log('Manifest Saved');
				callback( saved ? true : false );
				return false;
			}); 
			return false;
		};
		
		if( app.platform == 'browser' ){
			//Browser Only Map Upgrade FS
			exports.fs.upgrade.map(function( upgradeMap ){
				console.log(upgradeMap);
				saveManifestFile( upgradeMap );
			});		
		}else{
			//Map Application Directory
			fs.load( { uri: exports.paths.application }, function( app_fs ){
				exports.fs.app = app_fs;
				exports.fs.app.map(function( applicationMap ){
					exports.fs.upgrade.map(function( upgradeMap ){
						//Apply Upgrade Files to App Map
						for( var localPath in upgradeMap ){
							applicationMap[localPath] = upgradeMap[localPath];
						}
						saveManifestFile( applicationMap );
						return false;
					});	
					return false;
				});
				return false;
			});
		}
		return false;
	};
	
	exports.getManifest = function( callback ){
		exports.fs.upgrade.file('.manifest', function( manifestEntry ){
			if( manifestEntry ){
				exports.fs.upgrade.readEntry( manifestEntry, function( data ){
					callback( data );
				}, 'json');
			}else{
				callback( null );
			}
		});
	};
	
	exports.upgrade = function( callback ){
		
		console.log('Upgrade to '+exports.upgradeVersion);

		var files = [];
		var upgrade = {};
		console.log('Update');
		
		var onUpgradeComplete = function(){
			console.log('onUpdateComplete');
			exports.installed.version = exports.version = upgrade.version;
			exports.installed.upgraded = Date.now();
			
			console.log(manifest);
			console.log(upgrade);	
			
			createLocalManifest(function( msaved ){
				console.log('Manifest Saved');
				exports.fs.upgrade.save( '.app', exports.installed, function( saved ){
					exports.emit('upgraded', upgrade.version );
					console.log('Updated App Saved');
					return false;
				});
				return false;
			});
			
		};
		
		var nextFile = function(){
			if( files.length == 0 ){
				onUpgradeComplete();
				return false;
			}
			var updateFile = files.shift();
			console.log('UPDATE FILE  '+JSON.stringify(updateFile));
			if( manifest[updateFile.path] && updateFile.md5 == manifest[updateFile.path].md5 ){
				//File Up To Date
				console.log('SKIP: '+updateFile.path);
				nextFile( );
			}else{
				console.log('UPDATE: '+updateFile.remote +' '+updateFile.path);
				
				var uri = encodeURI( updateFile.remote );
				var local = updateFile.path;
				copyRemoteFile( uri, local, function( copied ){
					if(copied){
						if(!manifest[updateFile.path]) manifest[updateFile.path] = {};
						manifest[updateFile.path].md5 = updateFile.md5;
						nextFile();
					}else{
						
						console.log('Failed');
						return false;
						exports.emit('fail');
					}
				});
			}
		
			return false;
		};
		
		exports.getManifest(function( _manifest ){
			manifest = _manifest;
			getRemote('manifest', function( params ){
				upgrade.version = params.version;
				upgrade.index = params.index;
				files = params.files;
				nextFile( );
				return false;
			});
			return false;
		});
		return false;
	};
	
	exports.check = function( callback ){
		console.log(callback);
		getRemote('version', function( rversion ){
			if(rversion){
				console.log('Update Version'+rversion);
				if( rversion > exports.version ){
					exports.upgradeVersion = rversion;
					exports.emit('upgrade', rversion );
				}else{
					console.log('Up to date');
					exports.emit('finish', exports.version );
				}
			}else{
				exports.emit('finish', exports.version );
			}
			return false;
		});
		return false;
	};
	
	//Start Upgrade
	var onFileSystemReady = function(){
		//return exports.fs.upgrade.destroy();
		console.log('Upgrade FileSystem Ready');
		exports.fs.upgrade.file('.app', function( appEntry ){
			if( appEntry ){
				//FILE .app Exists
				console.log('AppCache File Exists');
				exports.fs.upgrade.readEntry( appEntry, function( appData ){
					console.log(appData);
					exports.installed = appData;
					exports.version = appData.version;
					exports.check();
 					return false;
				}, 'json');
			}else{
				//Initialize App File
				console.log('AppCache File Not Found');
				 var current = { version: exports.version, installed: Date.now(), index: "index.html"  };
				exports.fs.upgrade.save( '.app', current, function( saved ){
					console.log('App Saved');
					createLocalManifest(function( created ){
						onFileSystemReady();
						return false;
					});
					return false;
				});
				return false;
			}
			return false;
		});
		return false;
	};

	
	//Initialize Upgrade
	exports.init = function(){
		
		exports.paths.root = rootPath;
		exports.paths.application = rootPath+'app-root/';
			
		if(window.cordova){
			exports.paths.upgrade = window.cordova.file.dataDirectory;
		}else{
			exports.paths.upgrade = '/';
		}
				
		if(  window.cordova.plugins && window.cordova.plugins.urlrouter ){
			exports.router = window.cordova.plugins.urlrouter;
			console.log('Has Router');
			if( exports.rewritePath ){
				console.log('Add Alias: '+exports.rewritePath);
				exports.router.addAlias( exports.rewritePath, [ exports.paths.upgrade+'.appcache/', exports.paths.application, rootPath ].join(",") );
			}
		}
		
		if( app.platform == 'browser' ){
			fs.load(  { root: '/.appcache', local: 'PERSISTENT' }, function( upgrade_fs ){
				exports.fs.upgrade = upgrade_fs;
				onFileSystemReady();
				return;
			});
		}else{
			fs.load( { root: '/.appcache', uri: window.cordova.file.dataDirectory }, function( upgrade_fs ){
				exports.fs.upgrade = upgrade_fs;
				onFileSystemReady();
				return;
			});
		}
				
	};

	return exports;

}, { extend: 'events' });