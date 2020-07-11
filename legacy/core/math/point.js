define('math.point', function MathBase(){
	
	var math = this.exports;
	
	var point = function(d){
		return d == '3d' ? { x: 0, y: 0, z: 0 } : { x: 0, y: 0 };
	}
	
	exports.point = function( d ){
		return point(d);
	}
	
});