define('animation.time', function AnimationTime(){
	
	var exports = this.exports;
	
	exports.start = null;
	exports.last = 0;
	exports.now = 0;
	exports.delta = 0;
	exports.frame = 0;

	exports.startTime = function(){
		exports.start = exports.now;
	};
	
	exports.set = function( _t ){ 
		exports.last = exports.now;
		exports.now = _t;
		exports.frame++;
		exports.delta = (exports.now - exports.last)/1000;
	};
	
	return exports;
	
});