define('file/stream', ['file/buffer'], function FileBase( buffer ){
	
	var exports = this.exports;
	
	exports.head = 0;
	exports.mime = null;
	exports.bytes = null;
	exports.chunkSize = null;
	exports.paused = false;
	
	Object.defineProperty( exports, 'dataType', {
		set: function( dtype ){
			buffer.dataType = dtype;
		},
		get: function(){
			return buffer.dataType;
		}
	});
	
	Object.defineProperty( exports, 'source', {
		set: function( file ){
			this.construct = file;
			this.name = file.name;
			this.bytes = file.bytes;
			this.mime = file.type;
			_source = file;
			buffer.source = _source;
		},
		get: function(){
			return _source;
		}
	});
	exports.dataCB = null;
	exports.transport = 'socket';
	exports.data = function(cb){
		exports.dataCB = cb;
	};
	exports.complete = false;
	
	exports.end = function(){
		exports.complete = true;
		return true;
	};
	
	exports.pause = function(){
		exports.paused = true;
		return true;
	};
	
	exports.resume = function(){
		exports.paused = false;
		exports.send();
		return true;
	};
	
	exports.seek = function( pos ){
		exports.head = pos;
	};
	
	exports.send = function(){
		
		if(exports.complete || exports.paused) return null;
		var start = exports.head;
		var end = exports.head+exports.chunkSize;
		
		if(end > exports.bytes){
			end = exports.bytes;
		}
		
		if(start == end){
			exports.dataCB( null, start, end );
			return false;
		}
		
	
		function onReadData( data ){
			if(exports.dataCB) exports.dataCB( data, start, end );
			exports.head = end;
			if(end >= exports.bytes){
				exports.complete = true;
				console.log('STREAM COMPLETE');
			}
			return false;
		}
		//console.log('BUFFER READ',start, end, exports.bytes );
		buffer.read( start, end, onReadData );
		return false;
	};

	
	return exports;
});