define('animation/easing', function(){
	
	var exports = this.exports;
	
//x: time passed in animation 0 start to 1 end
//t: time that has passed in the animation milliseconds
//b: the beginning value
//c: the change in value
//d: and duration of the animation

	exports.linear = function(){
		return arguments[0];
	};
	
	exports.easeIn = function( t, d ){
		return 1*(t/=d)*t + 0; 
	};
	
	exports.easeOut = function( t, d ){
		var b = 0, c = 1;
		return -c*t*t/(d*d) + 2*c*t/d + b;
	};
	
	exports.easeInOut = function( t, d ){
		var b = 0, c = 1;
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		if (t < d/2) return 2*c*t*t/(d*d) + b;
		var ts = t - d/2;
		return -2*c*ts*ts/(d*d) + 2*c*ts/d + c/2 + b; 
	};
	
	exports.easeInQuint = function( t, d ){
		var b = 0, c = 1;
		t /= d;
		return c*t*t*t*t*t + b;
	};
	
	exports.easeOutQuint = function( t, d ){
		var b = 0, c = 1;
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	};
	
	exports.easeInOutCubic = function( t, d ){
		var b = 0, c = 1;
		t /= d;
		return c*t*t*t + b;
	};
	
	return exports;
	
});