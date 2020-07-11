define('file.progress', function FileProgress(){
	var self = this;
	//console.log(this);
	var exports = this.exports;
	
	var Progress = function( file ){
		
		this.file =  file;
		this.started = false;
		
		this.time = {
			start: null,
			last: null,
			current: null,
			total: 0
		};
		
		this.bytes = {
			total: 0,
			last: 0,
			current: null,
			sent: 0
		};
		
		this._stat = {
			percent: 0,
			speed: null,
			avgSpeed: null,
			sent: 0
		};
		
		this.bytes.total = this.file.bytes;
		
	};
	
	Progress.prototype.start = function(){
		console.log('START PROGRESS');
		this.started = true;
		this.time.start = new Date().getTime();
	};
	
	Progress.prototype.complete = function(){
		this.update( this.bytes.total - this.bytes.sent );
	};
	
	Progress.prototype.stat = function(){
		return this._stat;
	};
	
	Progress.prototype.update = function( bytes ){
		
		if(!this.started) this.start();
		this._stat.sent = this.bytes.sent += bytes;
		if( this.bytes.current ) this.bytes.last = this.bytes.current;
		this.bytes.current = bytes;
		
		if( this.time.current ) this.time.last = this.time.current;
		this.time.current = new Date().getTime();
		if( this.time.last ) this.time.total += ( this.time.current - this.time.last );
		
		this._stat.percent = this.bytes.sent / this.bytes.total;
		this._stat.speed = this.bytes.last / ( ( this.time.current - this.time.last ) / 1000 );
		this._stat.avgSpeed = this._stat.sent / ( this.time.total / 1000 );
		
		//console.log(this.file.name+' :: '+this._stat.percent);
	};
	
	Progress.prototype.pause = function(){
		this.time.last = null;
		this.time.current = null;
	};
	
	exports.create = function( file ){
		return new Progress( file );
	};
	
	return exports;
	
});