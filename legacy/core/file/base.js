define('file', ['events'], function FileBase( Events ){

	var app = this.app;
	var exports = this.exports;
	
	exports.id = null;
	exports.guid = null;
	exports.type = null;
	exports.subtype = null;
	exports.name = null;
	exports.size = null;
	exports.mime = null;
	exports.ext = null;
	exports._source = null;
	
	Object.defineProperty( exports, 'source', {
		get: function(){
			return this._source;
		},
		set: function( src ){
			this._source = src;
			this.name = src.name;
			this.size = src.size;
			this.mime = src.type;
			this.type = this.mime.split('/').shift();
			this.subtype = this.mime.split('/').pop();
			this.ext = this.name.split('.').pop();
		}
	});
	
	exports.describe = function(){
		var f = this;
		return {
			name: f.name,
			size: f.size,
			mime: f.mime,
			ext: f.ext
		};
	};
	
	exports.slice = function( s, e ){
		var self = this;
		var blob;
		if(self._source.slice){
			blob = self._source.slice( s, e, self.mime );
		}else if( self._source.webkitSlice ){
			blob = self._source.webkitSlice( s, e, self.mime );
		}else if( self._source.mozSlice ){
			blob = self._source.mozSlice( s, e, self.mime );
		}
		return blob;
	};
	
	exports.readAsBase64 = function( start, end, callback ){
		var blob = this.slice( start, end );
		return this.readBlob( blob, 'base64', callback );
	};
	
	exports.readAsBinaryString = function( start, end, callback ){
		var blob = this.slice( start, end );
		return this.readBlob( blob, 'binaryString', callback );
	};
	
	exports.readAsBuffer = function( start, end, callback ){
		var blob = this.slice( start, end );
		return this.readBlob( blob, 'arrayBuffer', callback );
	};
	
	exports.readBlob = function( blob, output, callback ){
		
		var outtypes = ['base64', 'binaryString', 'arrayBuffer'];
		if( output && outtypes.indexOf(output) !== -1 ){
			
			(function( buf, output, cb ) {
				var reader = new FileReader();
				
				reader.onload = function( e ){
					return cb( e.target.result );
				};
				
				switch(output){
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
			})( blob, output, callback );
			
		}
	};
	
	/*
	
	FileBase.prototype.getView = function( callback ){
		var self = this;
		require("file/view").then(function( view ){
			callback(view);
		});
	}
	
	FileBase.prototype.view = function( type, callback ){
		var self = this;
		require("file/view").then(function( view ){
			callback(view[type]( self ));
		});
	}
	*/
	/*
	
	FileBase.prototype.buffers = function( callback, chunkSize ){
		var self = this;
		require(['file/buffer'], function( buffers ){
			buffers.source =  self;
			callback( buffers );
		}, { chunkSize:  chunkSize ? chunkSize : 524288 } );
	}
	
	/*
	
	FileBase.prototype.pipeStream = function( socket ){
		
		var self = this;
		var stream = null;
		self.socket = socket;
		require(['file/stream']).then(function( _stream ){
			
			stream = _stream;
			stream.chunkSize = 524288;
			stream.dataType = 'arrayBuffer';
			stream.source = self;
			stream.writable = false;
			
			socket.on('pause', function(pos){
				console.log('SOCKET EMIT PAUSE');
				if(!stream.paused) stream.pause();
			});
			
			socket.on('resume', function(pos){
				console.log('SOCKET EMIT RESUME');
				if(stream.paused) stream.resume();
			});
			
			socket.on('seek', function(pos){
				console.log('SOCKET EMIT END');
				stream.seek(pos);
			});
			
			socket.on('end', function(){
				console.log('SOCKET EMIT END');
				stream.end();
			});
						
			stream.data(function( chunk, start, end ){
				//Data Ready to Send
				//console.log('STREAM DATA', chunk);
				socket.emit( 'data', chunk, function( writable ){
					console.log('DATA WRITABLE', writable);
					stream.writable = writable;
					if( !stream.complete && writable ){
						stream.send();
					}
				});
			});  
			socket.emit( 'ready', self.token, self.bytes );
			self.emit('piped');
			
		});
		
		socket.on('writable', function(){
			console.log('STREAM EMIT WRITABLE');
			if( stream.writable ) return false;
			stream.writable = true;
			stream.send();
			return false;
		});
				
	}
		*/
	
	return exports;
	
	
}, { extend: 'events' });