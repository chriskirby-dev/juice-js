define( 'time/span', ['events'], function( events ){
	
	var exports = this.exports;
	var app = this.app;
	
	var TimeSpan = function( duration ){

		var self = this;
		events._extend( self );
		self.defined = { offset: 0 };
		self.setup();

		self.duration = duration;

	};

	TimeSpan.prototype.setup = function(){

		var self = this;

		Object.defineProperty( self, 'duration', {
			get: function(){
				return self.defined.duration;
			},
			set: function( v ){
				if( v == self.defined.duration ) return;
				self.defined.duration = v;
				self.emit('duration-change');
			}
		});

		Object.defineProperty( self, 'offset', {
			get: function(){
				return self.defined.offset;
			},
			set: function( v ){
				if( v == self.defined.offset ) return;
				self.defined.offset = v;
				self.emit('offset-change');
			}
		});

		Object.defineProperty( self, 'end', {
			get: function( v ){
				var now = Date.now();
				return self.offset ? now - self.offset : now;
			},
			set: app.utils.cancel
		});
	
		Object.defineProperty( self, 'start', {
			get: function( v ){
				return self.end - self.duration;
			},
			set: app.utils.cancel
		});
	};

	
	
	return TimeSpan;
	
});