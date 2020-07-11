define('file.binary', ['file/reader', 'file/buffer'], function FileBinary( readers, FileBuffer ){
	
	var exports = this.exports;
	//var Buffer = buffers.Buffer;
	var BinaryReader = readers.BinaryReader;
	
	var codecs = {
		quicktime: ['video/quicktime', 'video/mp4']
	};
	
	var quicktime = {
		'top_level': ['ftype', 'moov', 'skip', 'mdat'],
		'CONTAINER_ATOMS': ["moov", "trak", "mdia", "minf","dinf","stbl"],
	};
	
	var atomTypes = {
		'ftyp': { },
	};
	
	exports._source = null;
	exports.mime = null;
	exports.codec = null;
	
	var matchCodecByMime = function(){
		for(var codec in codecs ){
			if(codecs[codec].indexOf( exports.mime ) != -1){
				return codec;
			}
		}
		return false;
	};
	
	var initializeSource = function( source ){
		exports.mime = source.type;
		exports.codec = matchCodecByMime();
		FileBuffer.source = source;
		
		console.log('FOUND CODEC', exports.codec );
	};
	
	Object.defineProperty( exports, 'source', {
		set: function( source ){
			initializeSource(source);
			this._source = source;
		},
		get: function(){
			return this._source;
		}
	});
	
	
	
	var readAtom = function( r ){
		var a = {};
		a.size = r.readUint32();
		a.type = r.readString( 4 );
		a.val = r.readString( a.size - 8 );
		console.log( a.type +' '+a.size+' bytes '+a.val);
		return a;
	};


	exports.stringToTyped = function( str ){
		var codes = new Uint8Array(str.length);
		for(var i=0;i<str.length;i++) codes[i] = str.charCodeAt(i);		
		return codes;
	};
	
	
	
	exports.findMetaData = function(){
		
		var start = new Date().getTime();
		console.log( exports.source );
		
		var atoms = {};
		
		console.log( exports.codec );
		
		FileBuffer.dataType = 'binaryString';
		require('file/codecs/'+exports.codec, function( codecHelper ){
			if( codecHelper.verify( exports.source ) ){
				
			}else{
				//Could Not verify Codec
			}
			
		});
		
		return false;

		var collectAtom = function( _atom, callback ){
			console.log('COLLECT ATOM');
			FileBuffer.dataType = 'arrayBuffer';
			for(atom in atoms){
				FileBuffer.read(atoms[atom].start, atoms[atom].end, function( atomData ){
					console.log( atomData.byteLength );
					var uint32 = new Uint8Array(atomData);
					var reader = new BinaryReader( uint32 );
					reader.LITTLE_ENDIAN = false;
					atoms[atom].reader = reader;
					callback();
				});
			}
		};
		
		var getChildren = function( reader ){
			var children = [];
			var clen = reader.readUint32();
			var ctyp = reader.readString( 4 );
			return { 
				length: clen, 
				type: ctyp,
				data: reader.readString( clen - 8 )
			};
			return children;
		};
		
		function parseSize(){
			var a = {};
			a.length = reader.readUint32();
			if( a.length == 1 ){
				//Extended Size
				a.length = reader.readUint64();
			}
			if( a.length == 0 ){
				//To EOF
			}
		}
		
		var atomParts = function( reader, container ){
			var a = {
				children: []
			};
			var i = 8;
			//Atom Length 
			a.length = reader.readUint32();
			//Atom Name
			a.type = reader.readString( 4 );
			console.log( 'ATOM TYPE', a.type );
			if( a.length == 1 ){
				//Extended Size
				a.length = reader.readUint64();
				i += 8;
			}
			console.log( 'ATOM LENGTH', a.length );
			
			if(a.type == 'moov'){
				while( reader.streamPosition < a.length ){
					console.log(reader.streamPosition);
					//Child Atom Length
					var clen = reader.readUint32();
					//Child Atom Type
					var ctyp = reader.readString( 4 );
					console.log(clen+' :; '+ctyp+' to: '+(clen - 8));
					var adata = {
						len: clen, 
						type: ctyp,
						data: reader.readString( clen - 8 )
					};
					
					a.children[a.children.length] = adata;
				}
			}else if(a.type == 'ftyp'){
					
					a.type_major = reader.readString( 4 );
					a.compatible = [];
					a.version = reader.readUint32();
					var c = 0;
					while( reader.streamPosition < a.Length ){
						console.log(reader.streamPosition);
						a.compatible[c] = reader.readString( 4 );
						c++;
					}
					
			}else{
				a.id = reader.readString( 4 );
				i += 4;
				a.data = reader.readString( a.length - i );
			}
			//console.log(a.length - i );
			//a.data = reader.readString( a.length - i );
			
			return a;
		};
		
		var processAtom = function( atom ){
			//var buffer = new Buffer();
			
			console.log('PROCESS_ATOM', atom );
			
			FileBuffer.source = exports.source;
			FileBuffer.dataType = 'arrayBuffer';
			
			FileBuffer.read( atom.start, atom.end, function( data ){
				console.log( data.byteLength );
				var reader = new BinaryReader( new Uint8Array( data ) );
				reader.LITTLE_ENDIAN = false;
				var a = new atomParts( reader );
				
				//a.id = reader.readString( 4 );
				if(a.type == 'ftyp'){
					/*
					a.type_major = reader.readString( 4 );
					a.compatible = [];
					a.version = reader.readUint32();
					var c = 0;
					while( reader.streamPosition < data.byteLength ){
						a.compatible[c] = reader.readString( 4 );
						c++;
					}
					*/
				}
				
				if(a.type == 'moov'){
					/*
					while( reader.streamPosition < data.byteLength ){
						a.children.push(atomParts( reader ));
					}
					*/
				}
				
				console.log(a);
			});
		};
		
		var processHeader = function( start, end, type ){
			var buffer = new Buffer();
			buffer.source( exports.source );
			buffer.dataType = 'arrayBuffer';
			buffer.read( start, end, function( headerData ){
				var reader = new BinaryReader( new Uint8Array( headerData ) );
				reader.LITTLE_ENDIAN = false;
				
				
			});
		};
		
		FileBuffer.stream(function BufferStream( data, end ){
			console.log('FileBuffer.stream :: '+end);
			var typeAtoms = data.match(/(ftyp)/g);
			//console.log(data);

			if(typeAtoms){
				
				console.log('TYPE ATOM', typeAtoms);
				var atom_size_len = 4;
				for( var i = 0; i<typeAtoms.length; i++){
					
					var atomindex = data.indexOf(typeAtoms[i]) - atom_size_len;
					//Atom Length String
					
					var codes = exports.stringToTyped(data.substring( atomindex, atomindex+atom_size_len));
					console.log('LENGTH CODES',codes);
					
					//GET Length from CODES
					var len = new DataView(codes.buffer).getUint32(0);
					console.log('TYPE ATOM LENGTH', len);
					atoms[typeAtoms[i]] = { start: atomindex, end: atomindex+len };
					console.log(atoms);
					
					
					processAtom(atoms[typeAtoms[i]], function( a ){
						console.log(a);
						return false;
					});
					
				}
			}else{
				console.log('NO TYPE ATOM DETCECTED');
			}
			
			console.log(atoms);
		
			
			if(end){
				var time = new Date().getTime() - start;
				console.log('Proces Took '+time+'ms :: Atom Length: '+atom.length);
			}
			
		}, 262144 );
		
		/*
		var buf = new Buffer();
		buf.source(exports.source());
		buf.dataType = 'arrayBuffer';
		
		var markAtom = function( p ){
			
		}
		
		buf.on('complete', function(){
			var time = new Date().getTime() - start;
			console.log('Proces Took '+time+'ms :: Atom Length: '+atom.length);
		});
		
		buf.stream(function BufferStream( data, end ){
			
			var uint32 = new Uint32Array(data);
			
			var reader = new BinaryReader( uint32 );
			reader.LITTLE_ENDIAN = false;
			
			var found = false;
			var i = 0;
			while(found == false){
				var position = i*4;
				console.log('position: '+position);
				if( reader.readUint32() == 1718909296 ){
					found = true;
					markAtom( position );
					console.log('Found 1718909296 ftyp @ '+ position );
					reader.seek(-8, 2);
					readAtom(reader);
				}
			}
			
			//buf.emit('continue');

		}, 524288 );
		
		*/
		
		
		
	};
		
	return exports;

});