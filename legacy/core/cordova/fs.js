// JavaScript Document
define('cordova/fs', ['events'], function( events ){
	
	console.log('cordova fs starting');
	var exports = this.exports;
	var app = this.app;
	
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	
	var cordova = window.cordova;
	exports.usage = {
		persistant: { remaining: 0, used: 0 },
		temporary: { remaining: 0, used: 0 }
	};
	
	
	exports.wwwDir = window.location.href.split('/www/').shift()+'/www';
	
	exports.appDir = cordova.file.applicationDirectory; //Read-only
	exports.storageDir = cordova.file.applicationStorageDirectory; 
	exports.dataDir = cordova.file.dataDirectory;
	
	
	
	exports.cacheDir = cordova.file.cacheDirectory;
	exports.tmpDir = cordova.file.tempDirectory;
	
	if(cordova.file.syncedDataDirectory)
		exports.syncedDir = cordova.file.syncedDataDirectory;
	
	if(cordova.file.externalDataDirectory)
		exports.externalDataDir = cordova.file.externalDataDirectory;
	
	
	/*
	 * cordova.file.applicationDirectory - Read-only directory where the application is installed. (iOS, Android, BlackBerry 10, OSX, windows)
	cordova.file.applicationStorageDirectory - Root directory of the application's sandbox; on iOS & windows this location is read-only (but specific subdirectories [like /Documents on iOS or /localState on windows] are read-write). All data contained within is private to the app. (iOS, Android, BlackBerry 10, OSX)
	cordova.file.dataDirectory - Persistent and private data storage within the application's sandbox using internal memory (on Android, if you need to use external memory, use .externalDataDirectory). On iOS, this directory is not synced with iCloud (use .syncedDataDirectory). (iOS, Android, BlackBerry 10, windows)
	cordova.file.cacheDirectory - Directory for cached data files or any files that your app can re-create easily. The OS may delete these files when the device runs low on storage, nevertheless, apps should not rely on the OS to delete files in here. (iOS, Android, BlackBerry 10, OSX, windows)
	cordova.file.externalApplicationStorageDirectory - Application space on external storage. (Android)
	cordova.file.externalDataDirectory - Where to put app-specific data files on external storage. (Android)
	cordova.file.externalCacheDirectory - Application cache on external storage. (Android)
	cordova.file.externalRootDirectory - External storage (SD card) root. (Android, BlackBerry 10)
	cordova.file.tempDirectory - Temp directory that the OS can clear at will. Do not rely on the OS to clear this directory; your app should always remove files as applicable. (iOS, OSX, windows)
	cordova.file.syncedDataDirectory - Holds app-specific files that should be synced (e.g. to iCloud). (iOS, windows)
	cordova.file.documentsDirectory - Files private to the app, but that are meaningful to other application (e.g. Office files). Note that for OSX this is the user's ~/Documents directory. (iOS, OSX)
	cordova.file.sharedDirectory - Files globally available to all applications (BlackBerry 10)
	 */
	
	function errorHandler(e) {
	  var msg = '';
	
	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };
	
	  console.log('Error: ' + msg);
	}
	
	exports.requestPersistant = function( size, next ){
		window.webkitStorageInfo.requestQuota( window.PERSISTENT, size, function(grantedBytes) {
			next( grantedBytes );
			return false;
		}, function(e) {
		  	errorHandler(e);
		  	return false;
		});
		return false;
	};
	
	var FsFile = function( fs, path ){
		var self = this;
		events._extend(self);
		this.fs = fs;
		this.path = path;
		this.entry = null;
		self.exists = false;
		self.getEntry({}, function( file ){
			if( file ){
				self.entry = file;
			 	self.exists = true;
			}
		 	self.emit('ready');
		 	return false;
		}, function(){
			self.emit('ready');
			return false;
		});
	};
	
	FsFile.prototype.create = function( next ){
		var self = this;
		if( !self.exists ){
			self.getEntry({create: true, exclusive: true}, function( fileEntry ) {
		
		    // fileEntry.isFile === true
		    // fileEntry.name == 'log.txt'
		    // fileEntry.fullPath == '/log.txt'
			if(next) next();
		  }, errorHandler);
	 	}
	};
	
	FsFile.prototype.write = function( content, next  ){
		var self = this;

		 self.entry.createWriter(function(fileWriter) {

	      fileWriter.onwriteend = function(e) {
	        console.log('Write completed.');
	         next(true);
	      };
	
	      fileWriter.onerror = function(e) {
	        console.log('Write failed: ' + e.toString());
	        next(null, e);
	      };
	
	      // Create a new Blob and write it to log.txt.
	      var blob = new Blob([content], {type: 'text/plain'});
	
	      fileWriter.write(blob);
	
	    }, function( e ){
	    	//Error
	    });

	};
	
	FsFile.prototype.remove = function( next ){
		var self = this;
		self.getEntry({ create: false }, function( fileEntry ) {
			fileEntry.remove(function() {
		        next( true );
		        return false;
		    }, function(){
		    	next( false );
		    	return false;
		    });
		    return false;
		});
		return false;
	};
	
	FsFile.prototype.append = function( content, next ){
		
		self.getEntry({ create: false }, function( fileEntry ) {
			// Create a FileWriter object for our FileEntry (log.txt).
		    fileEntry.createWriter(function(fileWriter) {
		
		      fileWriter.seek(fileWriter.length); // Start write position at EOF.
		      // Create a new Blob and write it to log.txt.
		      var blob = new Blob(['Hello World'], {type: 'text/plain'});
		      fileWriter.write(blob);
				next( true );
		    }, function(){
		    	next( null );
		    });
		});
		return false;
	};
	
	FsFile.prototype.read = function( next ){
		
		var reader = new FileReader();

       	reader.onloadend = function(e) {
			var contents = this.result;
			next(contents);
			return false;
       	};
       	
		this.entry.file( function( file ) {
			reader.readAsText(file);
			return false;
		});
		
		return false;
	};
	
	FsFile.prototype.get = function( next ){
		this.entry.file(function( file ) {
			next( file );
		});
		return false;
	};
	
	FsFile.prototype.getEntry = function( options, next ){
		var self = this;
		if(!options) options = {};
		fs.root.getFile( self.path, options, function( fileEntry ){
		 	self.entry = fileEntry;
			next( fileEntry );
		 	return false;
		}, function(){
			next( null );
			return false;
		});
	};
	
	var FileSystem = function( persistant ){
		var self = this;
		events._extend(self);
		this.persistant = persistant ? true : false;
		this.usage = ( persistant ? exports.usage.persistant : exports.usage.temporary );
		exports.filesystem({ persist: persistant }, function( fs ){
			self.fs = fs;
			self.emit('ready');
		}, function(){
			self.emit('error');
		});
	};
	
	FileSystem.prototype.file = function( path ){
		var file = new FsFile( fs, path );
		return file;
	};
	
	exports.filesystem = function( options, next ){
		
		var size = options.size ? options.size : 0;
		var fsName = options.persist ? window.PERSISTENT : window.TEMPORARY;
		
		var onFsReady = function( fs ){
			console.log('file system open: ' + fs.name);
			next(fs);
			return false;
		};
		
		var onFsError = function( e ){
			errorHandler(e);
			next(null);
			return false;
		};
				
		if( options.persist && exports.usage.persistant.remaining < size ){
			exports.requestPersistant( size, function( granted ){
				window.requestFileSystem( fsName, size, onFsReady, onFsError );
				return false;
			});
		}else{
			window.requestFileSystem( fsName, size, onFsReady, onFsError );
		}
		
		return false;
	};
	
	exports.updateQuotas = function( next ){
		var temp = false;
		var persist = false;
		
		if(navigator.webkitTemporaryStorage){
			navigator.webkitTemporaryStorage.queryUsageAndQuota(function( used, remaining ){
			 	exports.usage.temporary = { total: ( used + remaining ), remaining: remaining, used: used };
			 	temp = true;
			 	if(persist && next) next();
				return false;
			}, function(e) {
			  	console.log('Error', e); 
			});
			
			navigator.webkitPersistentStorage.queryUsageAndQuota( function( used, remaining ) {
				exports.usage.persistant = { total: ( used + remaining ), remaining: remaining, used: used };
				persist = true;
				if(temp && next) next();
				return false;
			}, function(e) {
			  	console.log('Error', e);
			});
		}else if(window.webkitStorageInfo){
			window.webkitStorageInfo.queryUsageAndQuota( window.TEMPORARY, function( used, remaining ){
			 	exports.usage.temporary = { total: ( used + remaining ), remaining: remaining, used: used };
			 	temp = true;
			 	if(persist && next) next();
				return false;
			}, function(e) {
			  	console.log('Error', e); 
			});
			
			window.webkitStorageInfo.queryUsageAndQuota( window.PERSISTENT, function( used, remaining ) {
				exports.usage.persistant = { total: ( used + remaining ), remaining: remaining, used: used };
				persist = true;
				if(temp && next) next();
				return false;
			}, function(e) {
			  	console.log('Error', e);
			});
		
		}
	
		return false;
	};
	
	exports.exists = function( fs ){
		fs.root.getFile('log.txt', {}, function(fileEntry) {
		
		}, function(){
				
		});

	};
	
	exports.write = function(){
		/*
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

		    console.log('file system open: ' + fs.name);
		    fs.root.getFile("newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry) {
		
		        console.log("fileEntry is file?" + fileEntry.isFile.toString());
		        // fileEntry.name == 'someFile.txt'
		        // fileEntry.fullPath == '/someFile.txt'
		        writeFile(fileEntry, null);
		
		    }, onErrorCreateFile);
		
		}, onErrorLoadFs);
		*/
	};
	
	exports.exists = function( path ){
		
	};
	
	exports.getDir = function( size ){
		window.requestFileSystem(window.TEMPORARY, size, function (fs) {
		
		    console.log('file system open: ' + fs.name);
		    getSampleFile(fs.root);
		
		}, onErrorLoadFs);
		return false;
	};
	
	exports.save = function( dir, blob, name ){
		dir.getFile( name, { create: true, exclusive: false }, function (fileEntry) {
	        writeFile(fileEntry, fileData);
	
	    }, onErrorCreateFile);
	};
	
	exports.writeTmp = function(){
		
	};
	
	exports.getExternalBlob = function( url, next ){
		var xhr = new XMLHttpRequest();
	    xhr.open('GET', url, true);
	    xhr.responseType = 'blob';
	
	    xhr.onload = function() {
	        if (this.status == 200) {
	            var blob = new Blob([this.response], { type: 'image/png' });
	            next( blob );
	        }
	    };
	    xhr.send();

	};
	
	exports.read = function( fileEntry ){

		    fileEntry.file(function (file) {
		        var reader = new FileReader();
		
		        reader.onloadend = function() {
		            console.log("Successful file read: " + this.result);
		            displayFileData(fileEntry.fullPath + ": " + this.result);
		        };
		
		        reader.readAsText(file);
		
		    }, onErrorReadFile);

	};
	console.log('cordova fs updateQuotas');
	exports.updateQuotas();
	
	return exports;
	
}, { extend: 'events'});