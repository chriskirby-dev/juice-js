define( 'time', ['events'], function( events ){
	
	var exports = this.exports;
	var app = this.app;
	
	var countUp = function( t ){
		if(!countDownStart) countDownStart = t;
		var time = t - countDownStart;
		if(!countDownStop) window.requestAnimationFrame( countDown );
	};

	
	function Timer( delay, start ){
		events._extend(this);
		if(delay) this.delay = delay;
		this.elapsed = 0;
		this.time = {};
		this.paused = false;
		this.running = false;
		if( start ){
			this.start();
		}
	}
	
	Timer.prototype.progress = null;
	
	Timer.prototype.pause = function(){
		var self = this;
		self.paused = true;
		if(self.TO) clearTimeout( self.TO );
		self.time.paused = Date.now();
		self.elapsed = self.time.paused - self.time.start;
	};
	
	Timer.prototype.trackProgress = function(){
		var self = this;
		var progressStart = null;
		var update = function( t ){
			if(!progressStart) progressStart = t;
			var time = self.elapsed + ( t - progressStart );
			self.emit('progress', time );
			if( self.running && !self.paused ) 
				window.requestAnimationFrame( update );
			return false;
		};
		update();
		return false;
	};
	
	Timer.prototype.start = function(){
		var self = this;
		self.paused = false;
		self.running = true;
		self.time.start = Date.now();
		if(self.progress) self.trackProgress();
		if(self.delay){
			self.TO = setTimeout(function(){
				self.stop( true );
				return false;
			}, self.delay );
		}
		return false;
	};
	
	Timer.prototype.stop = function( emit ){
		console.log('STOP');
		this.paused = false;
		this.running = false;
		if(emit) this.emit('complete');
		return false;
	};
	
	Timer.prototype.reset = function( delay ){
		if(delay) this.delay = delay;
		this.elapsed = 0;
		this.time = {};
		this.paused = false;
		this.running = false;
		return false;
	};
	
	exports.Timer = Timer;
	
	return exports;
	
});