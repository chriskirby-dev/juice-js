define('binary', ['binary/reader', 'binary/util'], function Binary(bReader, bUtil){
	
	var exports = this.exports;
	
	exports.Reader = bReader.BinaryReader;
	exports.Util = bUtil;
	
	return exports;
	
});