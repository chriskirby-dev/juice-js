define('browser/support', function(){
	
	var global = this.global;
	var exports = this.exports;
	global.browser = global.browser || {};
		
	var vendors = 'Webkit Moz O ms Khtml'.split(' ');
	var body = document.getElementsByTagName('body')[0];
	var html = document.getElementsByTagName('html')[0];
	
	var styleKeys = [];
	
	div = document.createElement('div');
	for(prop in div.style) styleKeys.push(prop);

	var vends = vendor_str.toLowerCase().split(' ');
	
	for(var i=0;i<styleKeys.length;i++){
		var sKey = styleKeys[i].replace(/([a-z])([A-Z])(.*)/g, '$1');
		if(vendors.indexOf(sKey) !== -1){
			var vendor = sKey;
			browser.prefix = vendor.toLowerCase();
			browser.jsPrefix = vendor;
			browser.cssPrefix = '-'+vendor.toLowerCase()+'-';
			html.$.class(browser.cssPrefix);
			html.$.class(vendor);
			console.log(browser);
			return true;
			break;
		}
		
	}
	
	return exports;
	
});
