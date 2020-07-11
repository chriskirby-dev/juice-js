define('browser', function(){
	
	var global = this.global;
	var exports = this.exports;
	global.browser = global.browser || {};
	
	var platforms = {
		mac: { str: navigator.platform.toLowerCase(), terms: ['mac'] },
		win: { str: navigator.platform.toLowerCase(), terms: ['win'] },
		ios: { str: navigator.platform.toLowerCase(), terms: ['ipad','iphone','ipod'] },
		andriod: { str: navigator.userAgent.toLowerCase(), terms: ['android'] },
		iemoble: { str: navigator.userAgent.toLowerCase(), terms: ['iemobile'] }
	};
		
		
	var vendors = 'Webkit Moz O ms Khtml'.split(' ');	
	exports.prefix = { js: null, css: null };

	if( !global.browser.prefix ){
		(function( ex ){
			var prop = 'BorderRadius';
			var tmp = document.createElement('div'),
			len = vendors.length;
			while(len--){
				if( vendors[len] + prop in tmp.style ){
					exports.prefix.js = vendors[len];
					exports.prefix.css = '-'+vendors[len].toLowerCase()+'-';
					global.browser.prefix = exports.prefix;
					document.body.classList.add( exports.prefix.css );
					break;
				}
			}
		})( exports );
	}else{
		exports.prefix = global.browser.prefix;
	}
	
	exports.supports = function( property ){
		var _ven = vendors;
		if(exports.prefix.js) _ven = ['', exports.prefix.js];
		for (var i = 0; i < _ven.length; i++) {
			var prop = _ven[i] + ( property.charAt(0).toUpperCase() + property.slice(1) );
			if (typeof document.body.style[prop] != "undefined") return prop;
		}
		return null;
	};
	
	exports.isTouch = 'ontouchstart' in document.documentElement;
	document.body.classList.add( exports.isTouch ? 'touch' : 'not-touch' );
	
	var getPlatform = function(){
		var platform;
		for(p in platforms){
			for(var i=0;i<platforms[p].terms.length;i++){
				if(platforms[p].str.indexOf(platforms[p].terms[i]) != -1)
					platform = p;
			}
		}
		return platform;
	};
	
	exports.platform = getPlatform();
	
	document.body.classList.add( exports.platform );
	
			
	return exports;
	
});
