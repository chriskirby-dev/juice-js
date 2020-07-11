define('file.reader', function FileReader(){
	
	var exports = this.exports;
	
    var exports = this.exports;
	
	var FileReader = function( source ){
		
		this._source = null;
		this.type = null;
		this.size = null;
		this.chunkSize = 524288;
		this.head = 0;
		this.dataType = 'base64';
		this.complete = false;
		
		if(source) this.source = source;
	};
	
	Object.defineProperty( FileReader.prototype, 'source', {
		set: function( source ){
			this.size = source.size;
			this.type = source.type;
			this._source = source;
		},
		get: function(){
			return this._source;
		}
	});
	
	FileReader.prototype.stringToTyped = function( str ){
		var codes = new Uint8Array(str.length);
		for(var i=0;i<str.length;i++) codes[i] = str.charCodeAt(i);		
		return codes;
	};
	
	FileReader.prototype.read = function( start, end, callback ){
		
		var self = this;
		if(!self.complete){
			
			//Get Next FileReader
			var buffer;
			if(self.source.slice){
				buffer = self.source.slice( start, end, self.type );
			}else if( buffer.source.webkitSlice ){
				buffer = self.source.webkitSlice( start, end, self.type );
			}else if( buffer.source.mozSlice ){
				buffer = self.source.mozSlice( start, end, self.type );
			}
			
			if( end >= self.size ){
				end = self.size;
				self.complete = true;
			}
			
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
	
	exports.FileReader = FileReader;
		
	return exports;

});