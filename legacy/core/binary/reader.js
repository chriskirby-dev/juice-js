define('binary/reader', ['binary/util'], function BinaryReader( util ){
	
	var exports = this.exports;
	
	var readTypes = {};
	
    var BinaryReader = function (typedArray, offset ) {
		this.length = typedArray.length;
		this.dataView = new DataView(typedArray.buffer);
		this.streamPosition = 0;
		this.LITTLE_ENDIAN = false;
		this.movement = 0;
		this.offset = offset || 0;
    };

    var exception = {
        readPastEnd: 0
    };

    var throwException = function (errorCode) {
        switch (errorCode) {
            case exception.readPastEnd:
                throw {
                    name: 'readPastEnd',
                    message: 'Read past the end of the file'
                };
                break;
        }
    };

    BinaryReader.prototype = {
    	customTypes: {},
    	position: function(){
    		return this.offset + this.streamPosition;
    	},
    	bytesLeft: function(){
    		return this.length - this.streamPosition;
    	},
    	getMovement: function(){
			return Math.abs( this.movement - this.streamPosition );
		},
		trackMovement: function(){
			this.movement = this.streamPosition;
		},
		readBits: function( bits ){
			var bytes = bits / 8;
			var sbytes = this.readBytes( bytes );
			return util.toArray( sbytes ).map( util.map.toBits ).join('').split('');
		},
		readUint: function ( bits ) { 
			var bytes = bits / 8;
			var sbytes = this.readBytes( bytes );
			var sbits = util.toArray( sbytes ).map( util.map.toBits );
			var bitstr = sbits.join(' ').split(' ').join('');
			return Number( parseInt( bitstr, 2 ) );
		},
		readUint8: function () { 
			var result = this.dataView.getUint8(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 1); return result; 
		},
        readInt8: function () { 
			var result = this.dataView.getInt8(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 1); return result; 
		},
        readUint16: function () { 
			var result = this.dataView.getUint16(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 2); return result; 
		},
        readInt16: function () { 
			var result = this.dataView.getInt16(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 2); return result; 
		},
		readFloat16: function () { 
			var result = this.dataView.getFloat16(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 2); return result; 
		},
       readUint32: function () { 
			var result = this.dataView.getUint32(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 4); return result; 
		},
       readInt32: function () { 
			var result = this.dataView.getInt32(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 4); return result; 
		},
		readFloat32: function () { 
			var result = this.dataView.getFloat32(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 4); return result; 
		},
		readUint64: function () { 
			var result = this.dataView.readUInt64(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 8); return result; 
		},
       	readInt64: function () { 
			var result = this.dataView.getInt64(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 8); return result; 
		},
		readFloat64: function () { 
			var result = this.dataView.getFloat64(this.streamPosition, this.LITTLE_ENDIAN); 
			this._movePointerTo(this.streamPosition + 8); return result; 
		},
       skipBytes: function (n) { this._movePointerTo(this.streamPosition + n); },
       seek: function (offset, origin) {
            /// <summary>Moves the stream offset to the location in relation to the origina</summary>
            /// <param name="offset" type="Number">The location to move to</param>
            /// <param name="origin" type="seekOrigin">The relative position to start the seek from</param>
				var seek = offset;
				if(!origin) origin = 2;
            switch (origin) {
                case seekOrigin.begin:
                    seek = offset;
                    break;
                case seekOrigin.current:
                    seek = this.streamPosition + Number( offset );
				  break;
                case seekOrigin.end:
                    seek = this.dataView.byteLength + Number( offset );
                break;
            }
			//console.log('Seek From: '+this.streamPosition+' To: '+seek);
            this._movePointerTo(seek);
			
        },
        skipNull: function ( chunk ) {
        	var b = 0;
        	while(b == 0 && this.bytesLeft() > 0){
        		if(!chunk || chunk == 1) 
        			b = this.readByte();
        		else if( chunk == 2 ){
        			b = this.readInt16();
        		}else if( chunk == 4 ){
        			b = this.readInt32();
        		}
        		
        	}
        	if(b !== 0) this.seek(-chunk);
        	return true;
        },
        readType: function ( type ) {
         	switch(type){
         		case 'WCHAR':
         		break;
         		case 'WORD':
         		break;
         		case 'DWORD':
         		break;
         		case 'QWORD':
         		break;
         	}
        },
        setTypes: function( types ){
        	for(var type in types){
        		this.customTypes = types[type];
        	}
        	return false;
        },
        readString: function (numChars) {
            var chars = [];
            if(!numChars){
            	numChars = this.length - this.streamPosition;
            }
            for (var i = 0; i < numChars; i++) {
                chars[i] = this.readUint8();
            }
            return String.fromCharCode.apply(null, chars);
        },
        _movePointerTo: function(offset) {
            if (offset < 0)
                this.streamPosition = 0;
            else if (offset > this.dataView.byteLength)
                throwException(exception.readPastEnd);
            else
                this.streamPosition = offset;
        }
    };

    BinaryReader.prototype.readByte = BinaryReader.prototype.readUint8;
	
	BinaryReader.prototype.readHex = function( i ){
		var self = this;
		var hex = util.toArray( this.readBytes(i) ).map( util.map.toHex );
		return hex.length == 1 ? hex[0] : hex;
	};
	
	BinaryReader.prototype.readBytes = function( i ){
		var self = this;
		var bytes = new Uint8Array(i);
		var b = 0;
		while(b<i){
			bytes[b] = self.readByte();
			b++;
		}
		return bytes;
	};
	 
    exports.BinaryReader = BinaryReader;

    window.seekOrigin = {
        begin: 1,
        current: 2,
        end: 3
    };
	
	return exports;

});