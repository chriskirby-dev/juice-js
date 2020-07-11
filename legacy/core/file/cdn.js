define('file/cdn', ['events', 'http/xhr'], function FileUpload( events, xhr ){
	
	var exports = this.exports;
	
	exports.getTempUrl = function( path, method, next ){
		xhr.post('/cdn/tempurl', { data: { path: path, method: method } }).success(function( resp ){
			 next(resp);
		});
	};
	
	
	
	var xhrRequest = function( url, method, params ){
		
		var self = this;
		events._extend( self );
		var loaded = 0;
		var last = 0;
				
		var req = xhr.newRequest();
		req.open( method, url, true);

		req.onload = function(e){ 
			console.log('xhr.onload',e);
			if( req.status === 200 ){
				self.emit('finish');
			}
		};
		
		req.upload.addEventListener('progress', function( e ) {
			if( e.lengthComputable && loaded != e.loaded ){
				loaded = e.loaded;
				self.emit('progress', loaded );
			}
		});
			
		req.send( params.data ? params.data : null );
				
	};
	
	var chunkSize = 1048576*4;
	
	var Transfer = function( turl, buffer ){
		var self = this;
		events._extend( self );
		var last = 0;
		var loaded = 0;
		var report = function(){
			var bytes = loaded - last;
			self.emit( 'progress', bytes );
		};
		
		var x = new xhrRequest(turl, 'PUT', {
			data: buffer
		});
		
		x.on('progress', function( progress ){
			console.log('PUT PROGRESS', progress );
			loaded = progress;
		});
		
		x.on('finish', function(){
			console.log('PUT FINISH' );
		});
		
		self.emit('progress');
	};
	
	
	exports.putChunked = function( file, path  ){
		var start = 0;
		var total = file.size;
		
		function sendChunk(){
			var cs = Math.min(chunkSize, total - start );
			var end = start + cs;
			var buffer = file.slice( start, start+cs );
			var filename = start+'-'+end+'.chunk';
			var dest = path+'/'+filename;
			
			exports.getTempUrl( path, 'PUT', function( turl ){
				var trans = new Transfer( turl, buffer );
				start = end;
				sendChunk();
			});
		}
		sendChunk();
		
	};
	
	exports.put = function( path, params, callback  ){
		exports.getTempUrl( path, 'PUT', function( tmpurl ){
			callback( new xhrRequest(tmpurl, 'PUT', params ) );
		});
	};
	
	
	return exports;
	
});