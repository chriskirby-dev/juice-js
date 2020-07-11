define('math.trig', function MathTrig(){
	
	var exports = this.exports;
	
	exports.angle = function(dy, dx){
		var radians = Math.atan2(dy, dx);
		var degrees = radians * 180 / Math.PI;
		return { rad: radians, deg: degrees };
	},
	exports.applyFriction = function(velocity, friction){
		var neg = velocity < 0 ? true : false;
		var vel = Math.abs(velocity);
		var nvel = vel >= friction ? vel - friction : 0;
		return neg == true ? -nvel : nvel;
	},
	//Radians to Degrees
	exports.radToDeg = function(radians){
		return radians * 180 / Math.PI;
	},
	//Degrees to Radians
	exports.degToRad = function(degrees){
		return degrees * Math.PI / 180;
	}
	
	exports.projectPoint = function( start, radians, dist ){
		var project = {};
		project.x = start.x + Math.cos( radians ) * dist;
		project.y = start.y + Math.sin( radians ) * dist;
		return project;
	}
	
	return exports;
	
});