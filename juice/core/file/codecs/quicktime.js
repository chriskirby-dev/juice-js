/*
 *  "vmhd": "video information media header",
    "mvhd": 'movie header',
    "tkhd": 'track header',
    "mdhd": 'media header', # The media header atom specifies the characteristics of a media, including time scale and duration
    "smhd": 'sound media information header', 
    "hdlr": 'handler reference', # The handler reference atom specifies the media handler component that is to be used to interpret the media’s data

    "stsd": "sample description", # The sample description atom contains a table of sample descriptions
    "stts": "time-to-sample", # Time-to-sample atoms store duration information for a media’s samples, providing a mapping from a time in a media to the corresponding data sample
    "stsc": "sample-to-chunk", # The sample-to-chunk atom contains a table that maps samples to chunks
    "stco": 'chunk offset', # Chunk offset atoms identify the location of each chunk of data
    "stsz": 'sample size', # You use sample size atoms to specify the size of each sample
    "ctts": 'composition offset', # The composition offset bnv  atom contains a sample-by-sample mapping of the decode-to-presentation time
    "stss": "sync sample", # The sync sample atom identifies the key frames
    
 */
define('file/codecs/quicktime', ['file/buffer', 'file/reader', 'utils' ], function FileCodecsQuicktime( buffer, readers, utils ){
	
	var exports = this.exports;
	console.log('Quicktime Helper');
	var block_size = 4;
	var type_count = {};
	var BinaryReader = readers.BinaryReader;
	
	exports.source = null;
	exports.atoms = {};
	exports.root = null;
		
	var atomMapps = {
		
		pnot: {
			modification_time: "DATE:4",
			version: 2,
			atom_type: 4,
			atom_index: 2
		},
		prfl: {
			type: 'leaf',
			fields: [{
				reserved: 2,
				part_id: 4,
				feature: 4,  
				value: 4
			}]
		},
		mdhd: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: "3",
				creation_time: "DATE:4",
				modification_time: "DATE:4",
				time_scale: 4,
				duration: "TIME:4",
				language: "INT:2",
				quality: "INT:2"
			}
		},
		smhd: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: "3",
				balance: "INT:2",
				reserved: 2
			}
		},
		ctab: {
			type: 'leaf',
			fields: [{
				table_seed: 2,
				table_flags: 4,
				table_size: 4,
				colors: [{ reserved: 2, red: 2, green: 2, blue: 2 }]
			}]
		},
		free: {
			type: 'freespace'
		},
		skip: {
			type: 'freespace'
		},
		mdat: {
			type: 'data'
		},
		clef: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: "3",
				width: "FIXED:4",
				height: "FIXED:4"
			}
		},
		stsd: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: "3",
				entries: 4,
				description_table: { size: 4, type: "4", reserved: "6", data_index: 2 },
				out: "EOF"
			}
		},
		prof: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: "3",
				width: "FIXED:4",
				height: "FIXED:4"
			}
		},
		enof: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: "3",
				width: "FIXED:4",
				height: "FIXED:4"
			}
		},
		ftyp: {
			type: 'leaf',
			fields: {
				brand_major: "4",
				version: [1,1,1,1],
				compatible: ["4"]
			}
		}
		
		
	};
	
	var routed = ['stsd', 'tkhd', 'hdlr', 'mdhd', 'vmhd', 'smhd', 'dref', 'mvhd', 'udta'];

	function readAtomType( atom, callback ){
		
		console.log('READ ATOM TYPE',atom);
		
		var params = atom._params;
		var start = params.offset;
		var end =  params.offset + params.length;
		var atomData = {};
		
		buffer.read( start, end, function( data ){
			
			var reader = new BinaryReader( new Uint8Array( data ) );
			
			function defaultOpen(){
				atomData.length = getAtomLength( reader );
				atomData.atom = reader.readString(4);
				atomData.version = reader.readString(1);
				atomData.flags = reader.readString(3);
				reader.getMovement();
			}
			
			switch(params.type){
				case 'udta':
					atomData.length = getAtomLength( reader );
					atomData.atom = reader.readString(4);
					atomData.data = {};
					while( reader.streamPosition < reader.length ){
						var item = {};
						reader.trackMovement();
						item.size = reader.readInt32();
						if(item.size > 0){ 
							item.name = reader.readString(4);
							item.data = reader.readString( item.size - reader.getMovement() );
							atomData.data[item.name] = item.data;
						}else{
							reader.streamPosition = reader.length;
						}
					}

				break;
				case 'dref':
					defaultOpen();
					atomData.entries = reader.readInt32();
					
					
					console.log('ENTRIES', atomData.entries);
					
					atomData.table = [];
					while( reader.streamPosition < reader.length ){
						var item = {};
						reader.trackMovement();
						item.length = reader.readInt32();
						console.log('LEN',item.length);
						item.type = reader.readString(4);
						item.version = reader.readString(1);
						item.flags = reader.readString(3);
						item.data = reader.readString( item.length - reader.getMovement() );
						console.log(item);
						atomData.table.push(item);
					}
				break;
				case 'smhd':
					defaultOpen();
					atomData.balance = reader.readInt16();
					atomData.reserved = reader.readInt16();
				break;
				case 'vmhd':
					defaultOpen();
					atomData.graphics_mode = reader.readInt16();
					atomData.op_color = [ reader.readInt16(), reader.readInt16(), reader.readInt16() ];
				break;
				case 'mvhd':
					defaultOpen();
					atomData.creation_time = readValue( 'DATE:4', reader );
					atomData.modification_time = readValue( 'DATE:4', reader );
					atomData.time_scale = reader.readInt32();
					atomData.duration = reader.readInt32();
					atomData.preferred_rate = readValue( 'FIXED:4', reader );
					atomData.preferred_volume = readValue( 'FIXED:2', reader );
					atomData.reserved = reader.readString(10);
					atomData.matrix = reader.readString(36);
					atomData.preview_time = reader.readInt32();
					atomData.preview_duration = reader.readInt32();
					atomData.poster_time = reader.readInt32();
					atomData.selection_time = reader.readInt32();
					atomData.selection_duration = reader.readInt32();
					atomData.current_time = reader.readInt32();
					atomData.next_track_id = reader.readInt32();
				break;
				case 'mdhd':
					defaultOpen();
					atomData.creation_time = readValue( 'DATE:4', reader );
					atomData.modification_time = readValue( 'DATE:4', reader );
					atomData.time_scale = reader.readInt32();
					atomData.duration = reader.readInt32();
					atomData.language = reader.readInt16();
					atomData.quality = reader.readInt16();
					atomData.seconds = atomData.duration/atomData.time_scale;
				break;
				case 'hdlr':
					defaultOpen();
					atomData.component_type = reader.readString(4);
					atomData.component_subtype = reader.readString(4);
					atomData.component_manufacturer = reader.readInt32();
					atomData.component_flags = reader.readInt32();
					atomData.component_flags_mask = reader.readInt32();
					atomData.component_name = reader.readString();
				break;
				case 'tkhd':
					defaultOpen();
					atomData.creation_time = readValue( 'DATE:4', reader );
					atomData.modification_time = readValue( 'DATE:4', reader );
					atomData.track_id = reader.readInt32();
					atomData.reserved = reader.readInt32();
					atomData.duration = reader.readInt32();
					atomData.reserved2 = reader.readString(8);
					atomData.layer = reader.readInt16();
					atomData.alt_group = reader.readInt16();
					if(atomData.alt_group == 0){
						atomData.track_type = 'video';
					}else if(atomData.alt_group == 1){
						atomData.track_type = 'sound';
					}else if(atomData.alt_group == 2){
						atomData.track_type = 'subtitle';
					}
					atomData.volume = readValue( 'FIXED:2', reader );
					atomData.reserved3 = reader.readInt16();
					atomData.matrix = reader.readString(36);
					atomData.width = readValue( 'FIXED:4', reader );
					atomData.height = readValue( 'FIXED:4', reader );
					
				break;
				case 'stsd':
				
					atomData.length = getAtomLength( reader );
					atomData.type = reader.readString(4);
					atomData.version = reader.readInt8();
					atomData.flags = reader.readString(3);
					atomData.entries = reader.readInt32();
					atomData.samples = {};
					console.log(atomData);
					while( reader.streamPosition < reader.length ){
						var item = {};
						reader.trackMovement();
						item.descr_size = reader.readInt32();
						item.format = reader.readString(4);
						item.reserved = reader.readString(6);
						item.index = reader.readInt16();
						
						//Description Atoms
						item.version = reader.readInt16();
						item.revision = reader.readInt16();
						item.vendor = reader.readString(4);
						
						item.temporal = reader.readInt32();
						item.spatial = reader.readInt32();
						
						item.width = reader.readInt16();
						item.height = reader.readInt16();
						
						item.hres = readValue( 'FIXED:4', reader );
						item.vres = readValue( 'FIXED:4', reader );
						
						item.datasize = reader.readInt32();
						
						item.frames = reader.readInt16();
						
						item.compressor = reader.readString(4);
						
						item.depth = reader.readInt16();
						
						item.color_table_id = reader.readInt16();
						item.color_table = {};
						console.log('DESC MOVEMENT',reader.getMovement());
						
						
						
						if(item.color_table_id == 0){
							item.color_table.size = reader.readInt32();
							item.color_table.type = reader.readString(4);
							if(item.color_table.type != 'ctab'){
								reader.seek(-8, 2);
							}else{
								item.color_table.seed = reader.readInt32();
								item.color_table.flags = reader.readInt16();
								item.color_table.tsize = reader.readInt16();
								item.color_table.colors = [];
								
								for(var i=0;i<=item.color_table.tsize;i++){
									item.color_table.colors.push([reader.readInt16(),reader.readInt16(),reader.readInt16(),reader.readInt16()]);
								}
							}
						}
						
						item.data = JSON.stringify( reader.readString( item.descr_size - reader.getMovement() ) );
						
						atomData.samples[item.format] = item;
						console.log('TABLE FINISH ', reader.streamPosition, reader.length, atomData );
					}
					
					//atomData.eof = reader.readString();
					
				break;
				
			}
			
			callback( atomData );
		});
	}
	
	function getAtomLength( reader ){
		var length = reader.readUint32();
		if( length == 1 ){
			console.log('IS EXTENDED LENGTH');
			length = reader.readUint64();
		}else if( length == 0 ){
			length = 'EOF';
		}
		return length;
	}
	
	var stringToTyped = function( str ){
		var codes = new Uint8Array(str.length);
		for(var i=0;i<str.length;i++) codes[i] = str.charCodeAt(i);		
		return codes;
	};
	
	var readValue = function( value, reader ){
		if( utils.type( value, 'string' ) && value == ""+parseInt( value )+"" ){
			return reader.readString( parseInt( value ) );
		}else if( utils.type( value, 'number' ) && value <= 8 ){
			return reader['readUint'+(8*value)]();
		}else if( utils.type( value, 'string' )){
			if(value.indexOf(':') != -1){
				
				var type = value.split(':').shift();
				var val = parseInt( value.split(':').pop() );
				
				if(type == "EOF")
					return reader.readString();
				
							
				switch( type ){
					
					case 'FLOAT':
						return reader['readFloat'+(8*val)]();
					break;
					case 'TIME':
						return reader['readInt'+(8*val)]();
					break;
					case 'INT':
						return reader['readInt'+(8*val)]();
					break;
					case 'UINT':
						return reader['readUint'+(8*val)]();
					break;
					case 'FIXED':
						var hi =  reader['readInt'+(8*(val/2))]();
						var low =  reader['readInt'+(8*(val/2))]();
						return Number(hi+'.'+low).toFixed(2);
					break;
					case 'DATE':
						var startDate = new Date(1904, 0, 1, 24, 0);
						var startTime = startDate.getTime();
						var timeSince =  reader['readUint'+(8*val)]();
						var field_date = new Date( startTime + (timeSince*1000) );
						return field_date.toUTCString();
					break;
				}
			}
		}
	};
	
	var readArray = function( varr, reader ){

		var fdata = [];
		if(varr.length == 1){
			while(reader.streamPosition < reader.length){
				fdata.push(readField(varr[0], reader));
			}
			return fdata;
		}else{
			return varr.map(function( v ){
				return readField(v, reader);
			});
		}
	};
	
	var readField = function( field, reader ){

		var value = null;
		if( utils.type( field, 'array' ) ){
			value = readArray( field, reader);
		}else if( utils.type( field, 'object' ) ){
			value = readFields( field, reader );
		}else{
			value = readValue( field, reader );
		}
		return value;
	};
	
	var readFields = function( fields, reader ){
		//Read Field Object
		var fdata = {};
		for( var field in fields ){
			//console.log('READ FIELDS', field, fields[field]);
			fdata[field] = readField( fields[field], reader );
		}
		return fdata;
	};
	
	function parseLeaf( leaf, cb ){
		
		var start = leaf._params.offset + leaf._params.headerSize;
		var end =  leaf._params.offset + leaf._params.length;
		var data = {};
				
		buffer.read( start, end, function( data ){
			
			var reader = new BinaryReader( new Uint8Array( data ) );
			
			if(leaf._params.mapping){
				
				if(leaf._params.mapping.type == 'freespace'){
					return cb("FREE:"+leaf._params.length);
				}
			
				if( utils.type( leaf._params.mapping.fields, 'object' ) ){
					
					var field_data = readFields( leaf._params.mapping.fields, reader );
					return cb(field_data);
					console.log(field_data);
				}else if( utils.type( leaf._params.mapping.fields, 'array' ) ){
					var field_data = readArray( leaf._params.mapping.fields, reader );
					return cb(field_data);
					console.log(field_data);
					
				}
			
			}else{
				
				return cb( reader.readString() );
			}
			
		});
	}
	
	function parseContainer( container, cb ){

		var start = container._params.offset + container._params.headerSize;
		var EOC =  container._params.offset + container._params.length;
		var max_header_size = 32;
		var end = start + max_header_size;
		var catoms = {};
		
		function parseContainerAtom(){
			
			if(start >= EOC){
				cb(catoms);
				return;
			}
			
			var extended = false;
			var alength = null;
			var atype = null;
			
			var end = start + max_header_size;
			
			buffer.read( start, end, function( data ){
				
				var reader = new BinaryReader( new Uint8Array( data ) );
				alength = getAtomLength( reader );
				atype = reader.readString( 4 );
				
				var headerSize = reader.streamPosition;
				
				if(!type_count[atype]) type_count[atype] = 1;
				else type_count[atype]++;
				
				var count = type_count[atype];
				if( reader.streamPosition < ( end - 4 ) ){
					var trail = [];
					trail.push( reader.readUint16( ) );
					trail.push( reader.readUint16( ) );
					trail.push( reader.readString( 4 ) );
				}
				var is_container = false;
				var regex = new RegExp("([a-z]{4})");
				if(trail[0] == 0 && regex.test(trail[2]) ){
					is_container = true;
				}
				var atom_id = count > 1 ? atype+'_'+count : atype;
				catoms[atom_id] = {
					_params: {
						type: atype,
						offset: start, 
						headerSize:headerSize,
						length: alength,
						mapping: atomMapps[atype] ? atomMapps[atype] : null,
					}
				};
				start = start+alength;
				
				console.log('IS MDAT', catoms[atom_id]._params.length);
				if(atype == "mdat"){
					if(catoms[atom_id]._params.length == 'EOF'){
						cb(catoms);
						return false;
					}
					parseContainerAtom();
					return;
				}
				
				
				if(routed.indexOf( atype ) !== -1){
					readAtomType( catoms[atom_id], function( data ){
						catoms[atom_id] = data;
						parseContainerAtom();
					});
					return false;
				}
			
				console.log('ATOMID',atype);
				if( is_container ){
					parseContainer(catoms[atom_id], function(childs){
						if( catoms[atom_id]._params ) delete catoms[atom_id]._params;
						for(var child in childs){
							catoms[atom_id][child] = childs[child];
						}
						parseContainerAtom();
					});
					return;
				}
				
				parseLeaf(catoms[atom_id], function( values ){
					if( catoms[atom_id]._params ) delete catoms[atom_id]._params;
					if( utils.type( values, 'object' ) ){
						for(var value in values){
							catoms[atom_id][value] = values[value];
						}
					}else{
						catoms[atom_id] = values;
					}
					parseContainerAtom();
				});

				
				
				
			});
			
		}
		parseContainerAtom();
	}
		
	exports.parseAtoms = function( atoms ){
		
	};
		
	exports.verify = function( source ){
		console.log('quicktime verify');
		buffer.source = exports.source = source;
		//buffer.dataType = 'binaryString';
		buffer.dataType = 'arrayBuffer';
		var atoms = [];
		var head = 0;
		var complete = false;
		var container = { _params: { type: 'qt', offset: 0, length: source.size, headerSize: 0 } };

		parseContainer( container, function( atoms ){
			console.log(atoms);
			//console.log( JSON.stringify( atoms ) );
			exports.atoms = atoms;
			//exports.parseAtoms(exports.atoms);
		});
		
	};
	
	
	return exports;
	
});