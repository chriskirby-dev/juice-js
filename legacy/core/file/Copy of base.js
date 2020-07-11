define('file', ['file/buffers', 'file/binary'], function FileBase( buffers, Binary ){
	var App = this.app;
	var file = {};
	var exports = this.exports;
	exports.id = null;
	exports.type = {};
	exports.src = null;
	exports.transferType = 'post';
	exports.record = null;
	
	var Buffer = buffers.Buffer;
	
	exports.source = function(_source){
		if(_source){
			console.log('_source');
			exports.src = _source;
			exports.type.minor = exports.src.type.split('/').pop();
			exports.type.major = exports.src.type.split('/').shift();
			exports.size = convertBytes( exports.src.size );
			if( ( exports.size.units == 'MB' && exports.size.value > 20 ) 
			&& ( window.File && window.FileReader ) ){
				exports.transferType = 'socket';
			}
		}else{
			return 	exports.src;
		}
	};
	
	
	exports.setServer = function( _server ){
		server = _server;
	};
	/*
	exports.buffers = function( callback, chunkSize ){
		require(['file/buffers'], function( buffers ){
			buffers.setSource( exports );
			callback( buffers );
		}, { file: exports, chunkSize:  chunkSize ? chunkSize : 524288 } );
	}
	*/
	exports.process = function(){
		
		var atomTypes = [''];
		
		Binary.source( exports.src );
		
		Binary.findMetaData();
		
		
		console.log('exports.process');
		var start = new Date().getTime();
		var atom = '';
		var isatom = false;
		/*
		var tmp = document.createElement('div');
		tmp.style = "position:fixed;z-index:500; top:150px;left:50px;bottom: 50px;right:50px; background:#FFF; color:#333;overflow:auto;"
		document.getElementsByTagName('body')[0].appendChild(tmp);
		
		var buf = new Buffer();
		buf.source(exports);
		buf.dataType = 'arrayBuffer';
		
		buf.on('complete', function(){
			var time = new Date().getTime() - start;
			console.log('Proces Took '+time+'ms :: Atom Length: '+atom.length);
		});
		
		var atom = function( r ){
			var a = {};
			a.size = r.readUint32();
			a.type = r.readString( 4 );
			a.val = r.readString( a.size - 8 );
			console.log( a.type +' '+a.size+' bytes '+a.val);
			return a;
		}
		
		buf.stream(function BufferStream( data, end ){
			var str = data.toString('utf-8');
			console.log(str);
			if( str.indexOf('ftyp') != -1 ){
				console.log('Found ftyp @ '+ str.indexOf('ftyp') );
				
			}
			
			var uint32 = new Uint32Array(data);
			var reader = new BinaryReader( uint32 );
			
			var ints = [];
			for (var i = 0; i < uint32.length; i++) {
				if( reader.readUint32() == 1718909296 ){
					console.log('Found 1718909296 @ '+ i );
				}
			}
			
			
			//1718909296
		
			
			/*
			var uint32 = new Uint32Array(data);
			var reader = new BinaryReader( uint32 );
			reader.LITTLE_ENDIAN = false;
			
			
			/* binaryArray big-endian */
			//.log(reader.dataView.byteLength);
			//atom( reader );
			//atom( reader );
			/*
			var ints = [];
			for (var i = 0; i < uint32.length; i++) {
				ints[i] = reader.readUint8();
			}
			if(!end) buf.emit('continue');
			*/
			//tmp.innerHTML += ints.join(' ');
			/*
			//console.log(reader.readString(256));
			/*
			var ints = new Uint8Array(data);
			console.log('Ints: '+ints);
			for (var i = 0; i < ints.length; i++) {
				ints[i] = dv.getUint8(i * 1);
			}
			
			console.log(ints);
			
			//buff.emit('continue');
		}, 524288 );
		/*
		exports.buffers( function( buffers ){
			
			
			buffers.on('buffer', function(buff){
				//var dv = new DataView(buff);
				//dv.getUint16(1);
				//tmp.innerHTML += ' '+dv.getUint16(0);
				/*
				console.log(buff.length);
				var idx = buff.indexOf('moov');
				if(idx != -1){
					if(!isatom){
						isatom = true;
						var part = buff.substring(idx, buff.length);
						var end = part.substring(4, part.length).indexOf('moov');
						if(end != -1){
							console.log('1st has END');
							part = part.substring(0, end+8);
							isatom = false;
						}
						atom += part;
					}else{
						console.log('This has END');
						isatom = false;
						atom += buff.substring(0, idx+4);
					}
					
				}
				if(isatom && idx == -1){
					console.log('Atom Chunk');
					atom += buff;
				}
				
					buffers.emit('continue');
				*/
		return false;
		
	};
	
	exports.upload = function(){
		if(exports.transferType == 'socket'){
			exports.buffers( function( buffers ){
				buffers.send();
			});
		}else{
			
		}
		exports.emit('upload.started', exports.id );
	};
	
	exports.probe = function(){
		
		exports.emit('probe.started', exports.id );
		
		exports._socket.on('probe.complete', function( codec ){
			//Probe Completed
			if(codec && codec.durationsec){
				exports.codec = codec;
				exports.duration = Number(codec.durationsec);
				exports.emit('file.codec', codec );
			}else{
				alert('??No Codec');	
			}
		});
		
		exports._socket.on('probe.error', function( err ){
			exports.emit('file.error', err );
		});
		
		if(exports.transferType == 'socket'){
			exports.buffers( function( buffers ){
				buffers.send();
			});
		}else{
			
		}
		exports._socket.emit('probe');
	};
	
	exports.preview = function(){
		
		exports.emit('preview.started', exports.id );
		
		exports._socket.on('preview.complete', function( codec ){
			//Probe Completed
			if(codec && codec.durationsec){
				exports.codec = codec;
				exports.duration = Number(codec.durationsec);
				exports.emit('codec', codec );
			}else{
				alert('??No Codec');
			}
		});
		
		exports._socket.on('preview', function( b64 ){
			exports.emit('preview', b64 );
			return;
		});
		
		exports._socket.on('codec', function( codec ){
			exports.emit('codec', codec );
		});
		
		exports._socket.on('preview.error', function( err ){
			exports.emit('file.error', err );
		});
		
		if(exports.transferType == 'socket'){
			exports.buffers( function( buffers ){
				buffers.send();
			});
		}else{
			
		}
		exports._socket.emit('preview', 12 );
	};
	
	function onCodec( codecdata ){
		alert(codecdata.durationsec);
		exports.duration = codecdata.durationsec;
		if(codecdata.video){
			if(codecdata.video.aspect){
				var aspect_percent = ( 1 / codecdata.video.aspect) * 100;
				$('.file[data-id="'+exports.id+'"] .preview .thumb').css({ paddingBottom :  aspect_percent+'%'});
			}
		}
		
	}
	
	exports.socket = function( port ){
		flux.createSocket( port, function( _socket ){
			console.log('File Socket');
			exports._socket = _socket;
			_socket.once('ready', function(){
				
				exports._socket.on('thumbnail', function( base64Thumb ){
					exports.emit('preview', base64Thumb );
				});
				
				exports._socket.on('encode.progress', function( _progress ){
					console.log(_progress);
					var t = convertTimeCodeToSeconds( _progress.toString() );
					var encProg = t / exports.duration;
					console.log(encProg);
					exports.emit('encode.progress', encProg );
				});
				
				exports._socket.on('codec', function( codec ){
					exports.codec = codec;
					if(codec.durationsec) exports.duration = Number(codec.durationsec);
					exports.emit('file.codec', codec );
				});
				
				exports._socket.on('upload.complete', function(){
					exports.emit('upload.complete', exports.id );
				});
				
				exports._socket.on('encode.complete', function(){
					exports.emit('encode.complete', exports.id );
				});
				
				exports.emit('socket.ready', exports._socket );
			});
			_socket.emit('file', exports.record.path);
		});
	};
	
	console.log('file.base');

	return exports;
	
}, { extend: 'events' });
