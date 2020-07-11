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
    "ctts": 'composition offset', # The composition offset atom contains a sample-by-sample mapping of the decode-to-presentation time
    "stss": "sync sample", # The sync sample atom identifies the key frames
    
 */
define('file/codecs/quicktime', ['file/buffer', 'file/reader', 'utils' ], function FileCodecsQuicktime( buffer, readers, utils ){
	
	var exports = this.exports;
	console.log('Quicktime Helper');
	var block_size = 4;
	
	var BinaryReader = readers.BinaryReader;
	
	exports.source = null;
	exports.atoms = {};
	exports.root = null;
	
	var atomMapps = {
		
		moov: { 
			type: 'container'
		},
		prfl: {
			type: 'list',
			fields: [{
				reserved: 2,
				part_id: 4,
				feature: 4,
				value: 4
			}]
		},
		mvhd: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: "3",
				creation_time: 4,
				modification_time: 4,
				time_scale: 4,
				duration: 4,
				preferred_rate: 4,
				preferred_volume: 2,
				reserved: "10",
				matrix: "36",
				preview_time: 4,
				preview_duration: 4,
				poster_time: 4,
				selection_time: 4,
				selection_duration: 4,
				current_time: 4,
				next_track_id: 4
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
		udta: {
			type: 'list',
			fields: [{
				atomlength: 4,
				atomtype: "4",
				data: "atomlength"
			}]
		},
		trak: {
			type: 'container'
		},
		
		tkhd: {
			type: 'container'
		},
		tapt: {
			type: 'container'
		},
		mdia: {
			type: 'container'
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
				flags: 3,
				width: 4,
				height: 4
			}
		},
		prof: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: 3,
				width: 4,
				height: 4
			}
		},
		enof: {
			type: 'leaf',
			fields: {
				version: 1,
				flags: 3,
				width: 4,
				height: 4
			}
		},
		ftyp: {
			type: 'leaf',
			fields: {
				brand_major: "4",
				version: [1,1,1,1],
				compatible: [{ brand: "4" }]
			}
		}
		
	};
	
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
	
	function parseAtoms( start, callback ){
		
		console.log('PARSE ATOM @ '+start);
		var max_header_size = 12;
		var type_count = {};
		var atoms = {};
		var reader;
		
		var readArray = function( varr ){
			console.log('READ ARRAY', varr);
			var fdata = [];
			if(varr.length == 1){
				while(reader.streamPosition < reader.length){
					fdata.push(readField(varr[0]));
					console.log(reader.streamPosition);
				}
				return fdata;
			}else{
				return varr.map(function( v ){
					return readField(v);
				});
			}
		};
		
		var readValue = function( value ){
			if( utils.type( value, 'string' ) && value == ""+parseInt( value )+"" ){
				return reader.readString( parseInt( value ) );
			}else if( utils.type( value, 'number' ) && value <= 8 ){
				return reader['readUint'+(8*value)]();
			}else if( utils.type( value, 'string' )){
				
			}
		};
		
		var readField = function( field ){
			//console.log('READ FIELD',field);
			var value = null;
			if( utils.type( field, 'array' ) ){
				value = readArray( field );
			}else if( utils.type( field, 'object' ) ){
				value = readFields( field );
			}else{
				value = readValue( field );
			}
			return value;
		};
		
		var readFields = function( fields ){
			//Read Field Object
			var fdata = {};
			for( var field in fields ){
				if( utils.type( fields[field], 'string' ) && fields[field].length > 2 ){
					fields[field] = ""+fdata[fields[field]]+"";
				}
				console.log('READ FIELDS', field, fields[field]);
				fdata[field] = readField( fields[field] );
			}
			return fdata;
		};
		
		function parseLeafList( leaf, cb ){
			console.log('PARSE_LEAF LIST', leaf);
			var start = leaf.offset + leaf.headerSize;
			var end =  leaf.offset + leaf.length;
			var data = {};
			
			buffer.read( start, end, function( data ){
				
				reader = new BinaryReader( new Uint8Array( data ) );
				console.log('READER LENGTH', reader.length );
				
				
				if( utils.type( leaf.mapping.fields, 'array' ) ){
					
					if(leaf.mapping.fields.length == 1){
						var fields = leaf.mapping.fields[0];
						
						while(reader.streamPosition < reader.length){
							console.log(reader.streamPosition);
							var atomlen = null;
							var atom_type = null;
							var header_size = 0;
							for(var field in fields){

								var value = fields[field];
								
								if(field == "atomlength"){
									var start = reader.streamPosition;
									atomlen = getAtomLength(reader);
									header_size=reader.streamPosition-start;
								}else if(field == "atomtype"){
									header_size=header_size+value;
									atom_type = readValue(value);
								}else if(value == "atomlength"){
									value = atomlen-header_size;
									console.log(atom_type, value);
									data[atom_type] = readValue(""+value+"");
								}
								
							}
						
						}
						cb(data);
					}
				}
				
				
			});
		}
		
		function parseLeaf( leaf, cb ){
			
			console.log('PARSE_LEAF', leaf);
			var start = leaf.offset + leaf.headerSize;
			var end =  leaf.offset + leaf.length;
			var data = {};
			
			buffer.read( start, end, function( data ){
				
				reader = new BinaryReader( new Uint8Array( data ) );
				
				if( utils.type( leaf.mapping.fields, 'object' ) ){
					
					var field_data = readFields( leaf.mapping.fields );
					cb(field_data);
					console.log(field_data);
				}else if( utils.type( leaf.mapping.fields, 'array' ) ){
					var field_data = readArray( leaf.mapping.fields );
					cb(field_data);
					console.log(field_data);
					
				}
				
			});
		}
		
		function parseContainer( container, cb ){
			
			var start = container.offset + container.headerSize;
			var EOC =  container.offset + container.length;
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
					reader = new BinaryReader( new Uint8Array( data ) );
					alength = getAtomLength( reader );
					atype = reader.readString( 4 );
					var headerSize = reader.streamPosition;
					
					if(!type_count[atype]) type_count[atype] = 1;
					else type_count[atype]++;
					
					var count = type_count[atype];
					if( reader.streamPosition < ( end - 4 ) ){
						var trail = reader.readUint32();
					}
					
					if(atomMapps[atype]){
						catoms[count > 1 ? atype+'_'+count : atype] = {
							offset: start, 
							headerSize:headerSize,
							length: alength,
							type: atype,
							mapping: atomMapps[atype],
							trail: trail
						};
					}
					
					start = start+alength;
					parseContainerAtom();
					
				});
				
			}
			parseContainerAtom();
		}
		
		function onRootReady(){
			
			var akeys = Object.keys(atoms);
			
			
			function processAtom( cb ){
				console.log('ATOM KEYS', akeys);
				if(akeys.length == 0){
					console.log('ATOMS Processed', exports.atoms);
					return;
				};
				var atomId = akeys.shift();
				var atom = atoms[atomId];
				
				switch( atom.mapping.type ){
					case 'container':
						parseContainer( atom, function( atms ){ 
							akeys.push.apply(akeys, Object.keys(atms));
							for(var atm in atms ){
								atoms[atm] = atms[atm];
							}
							processAtom(); 
						});
					break;
					case 'leaf':
						exports.atoms[atomId] = parseLeaf( atom, function(){ processAtom(); } );
					break;
					case 'list':
						exports.atoms[atomId] = parseLeafList( atom, function(){ processAtom(); } );
					break;
					case 'freespace':
						exports.atoms[atomId] = { freespace: atom.length };
						console.log( 'ATOM ', atomId,  atom );
						processAtom();
					break;
					case 'data':
						exports.atoms[atomId] = { freespace: atom.length };
						console.log( 'ATOM ', atomId,  atom );
						processAtom();
					break;
				}
				
				return false;
			}
			processAtom();
		}
		
		function parseRootAtoms(){
			
			var extended = false;
			var alength = null;
			var atype = null;
			var end = start + max_header_size;
			
			if( start >= exports.source.size){
				console.log( 'COMPLETE', atoms );
				onRootReady();
				return false;
			}
			
			if( end > buffer.source.size ) end = buffer.source.size;
			
			buffer.read( start, end, function( data ){

				var reader = new BinaryReader( new Uint8Array( data ) );
				
				alength = getAtomLength( reader );
				
				atype = reader.readString( 4 );
				var headerSize = reader.streamPosition;
				
				if(!type_count[atype]) type_count[atype] = 1;
				else type_count[atype]++;
				
				var count = type_count[atype];
				
				if( reader.streamPosition < ( end - 4 ) ){
					var trail = reader.readUint32();
				}
				if(atomMapps[atype]){
					
					
					atoms[count > 1 ? atype+'_'+count : atype] = {
						offset: start, 
						headerSize:headerSize,
						length: alength,
						type: atype,
						mapping: atomMapps[atype]
					};
				}
				
				console.log('ATOM', atype, start, alength);
				
				
				start = start+alength;
				
				parseRootAtoms();
				
				
			});
		}
		//Start Parsing Root Atoms
		parseRootAtoms();
		
	}
	
	exports.verify = function( source ){
		console.log('quicktime verify');
		buffer.source = exports.source = source;
		//buffer.dataType = 'binaryString';
		buffer.dataType = 'arrayBuffer';
		var atoms = [];
		var head = 0;
		var complete = false;
		
		parseAtoms(0, function( atoms ){
			console.log( atoms );
		});
		
	};
	
	
	return exports;
	
});