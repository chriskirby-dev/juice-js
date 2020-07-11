define('utils/timer', function(){
	
	function Timer( delay, interval ){
		this.time = {};
		this.delay = delay;
		if(interval) this.interval = true;
	}
	
	Timer.prototype.complete = function( cb ){
		if(this.fn) this.fn();
	};
	
	Timer.prototype.start = function( cb ){
		var t = this;
		if(cb) t.fn = cb;
		t.time.start = new Date().getTime();
		t.timeout = setTimeout( function(){
			t.complete();	
		}, t.delay );
		console.log('setTimeout Started');
	};
	
	Timer.prototype.restart = function(){
		var t = this;
		clearTimeout(t.timeout);
		this.start();
	};
	
	Timer.prototype.stop = function(){
		var t = this;
		clearTimeout(t.timeout);
		delete t.fn;
		t.time.end = new Date().getTime();
	};
	
	return {
		create: function( delay, cycle ){
			return new Timer( delay, cycle );
		}
	};
});