define('geom/calc', [], function(){

	var exports = this.exports;

	exports.intersect = function( x1, y1, x2, y2, x3, y3, x4, y4){
		var a_dx = x2 - x1;
		var a_dy = y2 - y1;
		var b_dx = x4 - x3;
		var b_dy = y4 - y3;
		var s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
		var t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
		return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
	}

	exports.angleOfPoints = function( p1, p2, deg ){
		var dy = p2.y - p1.y;
        var dx = p2.x - p1.x;
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        if( deg ) theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        return theta;
	};
	
	return exports;
});
