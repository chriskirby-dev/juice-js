define('file.codecs.base', function FileCodecsBase(){
	
	var exports = this.exports;
	
	exports.types = {
		mpeg: ['isom', 'iso2', 'avc1', 'mp41']	
	};
	
	exports.getCodec = function( type, callback ){
		var compat = null;
		for( typ in exports.types ){
			if(exports.types[typ].indexOf( type ) != -1 ) compat = typ;
		}
		require('file/codecs/'+compat, function( codec ){
			callback( codec );
		});
	};
	
	return exports;
});