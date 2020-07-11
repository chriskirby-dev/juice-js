define('file/buffer', function FileBuffer( ){
	
	var exports = this.exports;

	exports._source = null;
	exports.type = null;
	exports.size = null;
	exports.chunkSize = 524288;
	exports.head = 0;
	exports.dataType = 'base64';
	exports.complete = false;
	
	Object.defineProperty( exports, 'source', {
		set: function( source ){
			this.size = source.size;
			this.type = source.type;
			this._source = source;
		},
		get: function(){
			return this._source;
		}
	});
	
	exports.stringToTyped = function( str ){
		var codes = new Uint8Array(str.length);
		for(var i=0;i<str.length;i++) codes[i] = str.charCodeAt(i);		
		return codes;
	};
	

	exports.stream = function( callback, chunkSize  ){
		var self = this;
		console.log('BUFFER STREAM @', chunkSize);
		if(chunkSize) self.chunkSize = chunkSize;
		var next = function( cb ){
			self.read( self.head, Math.min( self.head+self.chunkSize, self.size ), function( buff ){
				self.head += self.chunkSize;
				self.emit( 'buffer', buff );
				if( typeof callback == 'function' ) callback( buff, self.complete );
				if(self.complete){
					self.emit( 'complete' );
				}
			});
		};
		self.on('continue', function(){
			next();
		});
		next();
	};
	

	exports.read = function( start, end, callback ){
		
		var self = this;
		if(!self.complete){
			
			//Get Next Buffer
			var buffer;
			if(self.source.slice){
				buffer = self.source.slice( start, end, self.type );
			}else if( buffer.source.webkitSlice ){
				buffer = self.source.webkitSlice( start, end, self.type );
			}else if( buffer.source.mozSlice ){
				buffer = self.source.mozSlice( start, end, self.type );
			}
			
			if( end >= self.size ) self.complete = true;
			
			(function( buf, cb, scope ) {
				var reader = new FileReader();
				reader.onload = function( e ){
					return cb( e.target.result );
				};
				switch(scope.dataType){
					case 'base64':
						reader.readAsDataURL( buf );
					break;
					case 'binaryString':
						reader.readAsBinaryString( buf );
					break;
					case 'arrayBuffer':
						reader.readAsArrayBuffer( buf );
					break;
				}
			})( buffer, callback, self );
		}
	};
	
	return exports;
	
}, { extend: 'events' });