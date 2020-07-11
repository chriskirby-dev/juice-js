define('stream', ['events', 'utils'], function StreamBase( Events, utils ){
	
	var Stream = function(){
		
		this.chunkSize = 1024;
		this.paused = false;
		this.started = false;
		this.finished = false;
		this.bytesSent = 0;
		this.buffer = null;
		
		
	};
	
	utils.inherits( Stream, Events );
	
	
	var WritableStream = function(){
		
	};
	
	utils.inherits( WritableStream, Stream );
	
	WritableStream.prototype.write = function( data ){
		var uData = new Uint8Array( data );
		
	};
	
	var ReadableStream = function(){
		
	};
	
	utils.inherits( ReadableStream, Stream );
	
	ReadableStream.prototype.read = function(){
		
	};
	
	exports.Writable = WritableStream;
	
	exports.Readable = ReadableStream;
	
	
});