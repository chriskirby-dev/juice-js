define('geom/line', ['geom/calc'], function( calc ){

	var exports = this.exports;

	var Line = function(){
		this.length = 100;
		this.x = null;
		this.y = null;
		this._angle = 0;
		this.support = { x: null, y: null };
	};

	Line.prototype.angle = function( angle ){
		this._angle = angle;
	};
	
	exports.create = function(){
		return new Line();
	};
	
	return exports;
});
