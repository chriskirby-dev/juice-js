define('math', function MathBase(){
	
	var exports = this.exports;
	
	exports.random = function(){
		return Math.random()*arguments[0];
	}
	
	exports.round = function(){
		return (arguments[0]) << 0;
	}
	
	return exports;
});