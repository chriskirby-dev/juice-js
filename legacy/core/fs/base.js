define('fs', ['fs/filesystem','fs/errors'], function FileSystem( filesystem, errors ){
	
	var exports = this.exports;
	var app = this.app;
	
	exports.current = null;
	
	var rootPath = window.location.pathname;
	exports.root = rootPath.substr( rootPath, rootPath.length - 10 );
	exports.cache = {};
	// Handle vendor prefixes.
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	
	try{
		var tmp = LocalFileSystem.PERSISTENT;
		tmp = null;
	}catch(e){
		var LocalFileSystem = { PERSISTENT : window.PERSISTENT, TEMPORARY: window.TEMPORARY }; 
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	}
	
	var onFileSystemReady = function( fsType ){
		exports.emit( 'ready', fsType );
		return false;
	};
	
	exports.load = filesystem.load;
	
	exports.resolve = function( uri, callback ){
		console.log('Resolve: '+uri);
		window.resolveLocalFileSystemURL( uri, function( entry ){
			filesystem.load( { entry: entry }, function( fs ){
				callback( fs );
				return false;
			});
			return false;
		});
		return false;
	};
	
	
	return exports;
});