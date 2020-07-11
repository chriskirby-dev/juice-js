define('client/cookies', function Cookies(){
	var self = this;
	var encode = encodeURIComponent;
	var decode = decodeURIComponent;
	
	var parseString = function(str, opt) {
		opt = opt || {};
		var obj = {};
		var pairs = str.split(/[;,] */);
		var dec = opt.decode || decodeURIComponent;
	
		pairs.forEach(function(pair) {
			var eq_idx = pair.indexOf('=');
			// skip things that don't look like key=value
			if (eq_idx < 0) return;
			var key = pair.substr(0, eq_idx).trim();
			var val = pair.substr(++eq_idx, pair.length).trim();
			// quoted values
			if ('"' == val[0]) {
				val = val.slice(1, -1);
			}
			// only assign once
			if (undefined == obj[key]) {
				try {
					obj[key] = dec(val);
				} catch (e) {
					obj[key] = val;
				}
			}
		});
	
		return obj;
	};
	
	function serialize(name, val, opt){
		opt = opt || {};
		var enc = opt.encode || encodeURIComponent;
		var pairs = [name + '=' + enc(val)];
	
		if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
		if (opt.domain) pairs.push('Domain=' + opt.domain);
		if (opt.path) pairs.push('Path=' + opt.path);
		if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
		if (opt.httpOnly) pairs.push('HttpOnly');
		if (opt.secure) pairs.push('Secure');
	
		return pairs.join('; ');
	};
	
	return {
		data: parseString(document.cookie),
		set: function(key, val, params){
			if(!params) params = {};
			if(!params.path) params.path = '/';
			document.cookie = serialize(key, val, params);
			this.data = parseString(document.cookie);
		},
		get: function(key){
			if(this.data[key]){
				return this.data[key];
			}else{
				return false;
			}
		},
		clear: function(key, params ){
			if(!params) params = {};
			if(!params.path) params.path = '/';
			params.expires = new Date(new Date().getTime()-86409000);
			document.cookie = serialize(key, 'expired', params );
			this.data = parseString(document.cookie);
		},
		hasValue: function(key){
			if(typeof this.data[key] != 'undefined' && this.data[key] != ''){
				return true;
			}else{
				return false;
			}
		}
	};
});
