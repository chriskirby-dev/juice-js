define('file/upload', ['progress'], function FileUpload( progress ){
	
	var exports = this.exports;
	
	var MB = 1048576;
	
	exports._source = null;
	exports.endpoint = null;
	exports.bytesTotal = null;
	exports.chunkSize = MB * 6;
	exports.bytesSent = 0;
	exports.head = 0;
	exports.index = 0;
	exports.activePosts = [];
	exports.postQueue = [];
	exports.uploads = [];
	exports.ports = null;
	exports.progress = progress;
	
	Object.defineProperty( exports, 'source', {
		set: function( file ){
			exports.bytesTotal = file.size;
			progress.maxValue = exports.bytesTotal;
			exports._source = file;
			console.log('UPLOAD SOURCE', exports._source );
		},
		get: function(){
			return exports._source;
		}
	});
	var lp = 0;
	var showProgress = function(  ){
		lp = new Date().getTime();
		//console.log('progress', exports.progress.percent, (exports.progress.speed/MB) + ' MB/s' );
		exports.emit('progress', exports.progress );
	};
	
	var updateProgress = function( bytesLoaded  ){
		var time = new Date().getTime();
		//console.log('updateProgress', bytesLoaded );
		exports.progress.add( bytesLoaded );
		if(time - lp > 100 ){
			showProgress();
		}
	};
	
	var blobFinished = function( index ){
		for(var i=0;i<exports.activePosts.length;i++){
			if( exports.activePosts[i].index == index ){
				//console.log( 'Removing Post @ ', index);
				exports.activePosts.splice( index, 1 );
				break;
			}
		}
		if(exports.postQueue.length > 0){
			sendBlob();
		}else{
			console.log('exports.postQueue FINISHED');
			exports.emit('complete');
			showProgress();
		}
	};
	
	var nextPort = function(){
		var port = exports.ports.shift();
		exports.ports.push( port );
		return port;
	};
	
	
	var sendBlob = function(){
		
		var self = this;
		var last = 0;
		var sent = 0;
		if(exports.postQueue.length == 0){
			return false;
		}
		var dataBlob = exports.postQueue.shift();
		var blob = exports._source.slice( dataBlob.start, dataBlob.end );
		
		var endpoint_url = exports.endpoint+':'+nextPort();
		endpoint_url += '/'+dataBlob.start+'/'+dataBlob.end;
		//console.log('endpoint_url', endpoint_url);
		
		var xhr = new window.XMLHttpRequest();
		xhr.open('POST', endpoint_url, true);

		xhr.onload = function(e){ 
			//console.log('xhr.onload',e);
			if( xhr.status === 200 ){
				//Request is Successfull
				console.log('size sent', blob.size, sent );
				//updateProgress(e.loaded);
				blobFinished(dataBlob.index);
			}
		};
		
		xhr.onreadystatechange = function( e ){
			//console.log('xhr.onreadystatechange', xhr.readyState, xhr.status );
			switch( xhr.readyState ){
				case 0:
				//request not initialized 
				break;
				case 1:
				//server connection established
				break;
				case 2:
				//request received 
				break;
				case 3:
				//processing request 
				break;
				case 4:
				//request finished and response is ready
					
				break;
			}
		};
		
		xhr.upload.addEventListener('progress', function( e ) {
			if(e.lengthComputable){
				if(last != e.loaded){
					var bs = e.loaded - last;
					sent += bs;
					updateProgress( bs );
					last = e.loaded;
				}
				return;
			}
		});
			
		xhr.send( blob );
		
		exports.activePosts.push( dataBlob );
		
	};
	
	
	
	exports.send = function( params ){
		
		var self = this;
		var head = 0;
		
		console.log('Starting Upload of', exports.bytesTotal, 'Bytes' );
		if( params.chunked ){
			while( head < exports.bytesTotal ){
				var chunkSize = Math.min( exports.chunkSize, exports.bytesTotal - head );
				var start = head;
				var end = head + chunkSize;
				var dataBlob = { 
					index: exports.index,
					start: start,
					end: end
				};
				exports.postQueue.push( dataBlob );
				head = end;
				exports.index++;
			}
		}else{
			
		}
		
		for(var i=0;i<self.ports.length;i++){
			setTimeout(function(){
				sendBlob();
			}, 250 * i );
		}
		
		console.log(exports.postQueue);
		
		return false;
	};

	return exports;
	
}, { extend: 'events' });