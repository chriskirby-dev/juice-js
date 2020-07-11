define('animation.physics', ['math/geom'], function AnimationPhysics( geom ){
	
	var exports = this.exports;
	
	var DIMENSIONLESS = 0.47; 
	exports.dimention = '2d';
	
	exports.cod = DIMENSIONLESS;
	exports.forces = [];
	
	//bounciness
	exports.restitution = -0.7;
	exports.acceloration = geom.vector('2d');
	exports.velocity = geom.vector('2d');
	self.mass = 0.1; //kg
	
	exports.last = { 
		velocity: { x: 0, y: 0 },
		acceloration: { x: 0, y: 0 }
	};
	
	exports.addForce = function( vector ){
		exports.forces.push( vector );
	};
	
	exports.applyForces = function(){
		
	};
	
	exports.update = function(/* */){
		exports.last = { 
			velocity: { x: exports.velocity.x, y: exports.velocity.y },
			acceloration: { x: exports.acceloration.x, y: exports.acceloration.y },
		};
	};
	
	exports.environment = function(/**/){
		environment.set( arguments );
	};
	
	return exports;
	
});