define('animation.object', ['math/trig', 'geom'], function( trig, geom ){
	
	var exports = this.exports;
	
	//Coefficient of Drag
	var DIMENSIONLESS = 0.47; 
	exports.dimention = '2d';
	exports.last = null;
	exports.width = null;
	exports.height = null;
	
	exports.acceloration = geom.point( exports.dimention );
	exports.drag = geom.point( exports.dimention );
	exports.position = geom.point( exports.dimention );
	exports.velocity = geom.point( exports.dimention );

	exports.cod = DIMENSIONLESS;
	
	exports.mass = 0.1; //kg
	exports.radius = 15; // 1px = 1cm
	exports.restitution = -0.7;
	exports.friction = 0;
	exports.speed = 0;
	exports.rotation = 0;
	exports.tilt = 0;
	exports.angle = 0;
	
	exports.set = function( k, v ){
		exports[k] = v;
	};
	
	exports.environment = function(){
		
	};
	
	exports.update = function(){
		exports.last = exports;
	};
	
	exports.init = function( d ){
		if( d == '3d' ){
			exports.dimention = '3d';
		}
	};
	
	return exports;
	
});