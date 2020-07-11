define('progress', function(){
	
	var exports = this.exports;
	exports.started = false;
	exports.time = {
		start: null,
		current: null,
		last: null,
		gap: null
	};
	
	exports._value = {
		last: 0,
		current: 0,
		end: 0
	};
	
	Object.defineProperty( exports, 'percent', {
		set: function(){
			return false;
		},
		get: function( mv ){
			//console.log(exports._value.current);
			return exports._value.current/exports._value.end;
		}
	});
	
	Object.defineProperty( exports, 'maxValue', {
		set: function( mv ){
			this._value.end = mv;
		},
		get: function( mv ){
			return this._value.end;
		}
	});
	
	Object.defineProperty( exports, 'speed', {
		set: function(){
			return false;
		},
		get: function(){
			var time = new Date().getTime() - this.time.start;
			var secs = time/1000;
			return exports._value.current/secs;
		}
	});
	
	Object.defineProperty( exports, 'value', {
		set: function( mv ){
			if(!exports.started) this.start();
			this._value.current = mv;
		},
		get: function( mv ){
			return this._value.current;
		}
	});
	
	exports.start = function(){
		var time = new Date().getTime();
		exports.time.last = time;
		exports.time.start = time;
		exports.started = true;
	};
	
	exports.update = function(){
		var time = new Date().getTime();
		if( time == this.time.current ) return false;
		//Update Time
		this.time.last = this.time.current;
		this.time.current = time;
		this.time.gap = this.time.current - this.time.last;
		//Update Value
		this._value.gap = this._value.current - this._value.last;
		this._value.last = this._value.current;
	};
	
	exports.currentSpeedPerSecond = function(){
		this.update();
		if( exports.time.gap == 0 )  return false;
		var secondSample = 1000 / exports.time.gap;
		this._value.speed = secondSample*exports._value.gap;
		return this._value.speed;
	};
		
	exports.add = function( value ){
		this.value = this._value.current + value;
	};
	
	exports.progress = function( percent ){
		if(this.onProgres) this.onProgres( percent );
	};
		
	return exports;

});