define('style', [ 'style/sheets'], function StyleSheet( sheets ){
	
	var { exports } = this;

	exports.sheets = sheets;
	
	return exports;
	
}, { persistant: true });