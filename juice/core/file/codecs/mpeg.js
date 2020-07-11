define('file/codecs/mpeg', function FileCodecsMpeg(){
	var exports = this.exports;
	
	exports.atoms = {
		'moov': { 
			container: true,
			children: {
				'mvhd': { 
					container: true
				},
				'trak': { 
					container: true
				},
				'udata': { 
					container: true
				}
			}
		}
	};

	return exports;
	
});