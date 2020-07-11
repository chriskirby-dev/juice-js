define('file/compatibility', function(){
	var compat = this.exports;
	
	compat.browsers = ['ie','chrome','firefox','safari','flash','android_chrome'];
	compat.videoFormats = ['h264', 'webm', 'ogg'];
	compat.normalize = function( str ){
		return str.replace('.','').replace('-','').toLowerCase();
	};
	compat.normalizeVideoFormat = function( format ){
		var fmt;
		var norm = compat.normalize( format );
		var formats = compat.videoFormats.slice(0);
		while(formats.length > 0){
			var f = formats.shift();
			var regex = new RegExp( ""+f+"" );
			if(regex.test(norm)){
				fmt = f;
				break;
			}
		}
		return fmt ? fmt : norm;
	};
	
	compat.online = {
		h264: {
			ie: { version: '9+' },
			chrome: { version: '4+' },
			firefox: { version: '35+' },
			safari: { version: '3.2+' },
			flash: { version: '*' },
			android_chrome: { version: '42+' }
		},
		webm: {
			firefox: { version: '35+' },
			opera: { version: '30+' },
			chrome: { version: '4+' }
		},
		ogg: {
			firefox: { version: '31+' },
			chrome: { version: '4+' },
			opera: { version: '11.5+' },
		}
	};
	
	
	compat.players = {
		chrome: {
			acodecs: ["aac", "vorbis" ],
			vcodecs: [ "h264", "theora", "vp8" ]
		},
		flash: {
			acodecs: [ "aac" ],
			vcodecs: [ "h264" ]
		},
		firefox: {
			acodecs: ["aac", "vorbis" ],
			vcodecs: [ "h264", "theora", "vp8" ]
		},
		ie: {
			acodecs: [ "aac" ],
			vcodecs: [ "h264" ]
		},
		safari: {
			acodecs: [ "aac" ],
			vcodecs: [ "h264" ]
		},
		opera : {
			acodecs: [],
			vcodecs: []
		}
	};
	
	compat.codecs = function( video, audio ){
		var ret = {};
		for( player in compat.players ){
			if( compat.players[player].vcodecs.indexOf( video.toLowerCase() ) != -1 
			&& compat.players[player].acodecs.indexOf( audio.toLowerCase() ) != -1 ){
				ret[player] = true;
			}else ret[player] = false;
		}
		return ret;
	};
	
	compat.containers = {
		audio: { 
			wav:{},
			mp3: {},
			mp4: {},
			ogg: {},
			webm: {}
		},
		video: { 
			mp4: { vcodec: "h264", acodec: "aac" },
			ogg: { vcodec: "theora", acodec: "vorbis" },
			webm: { vcodec: "vp8", acodec: "vorbis" }
		}
	};

	return compat;	
});
