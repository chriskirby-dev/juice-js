define('event/emitter', function Events( obj ){

	const { app, exports } = this;

	function cancel(){ return false; }

	function EventTrigger(){

	}

	function EventEmitter( parent ){

		const self = this;
		self.listeners = {};

		if(parent)
			self.extend( parent );
		
	}

	EventEmitter.prototype.addListener = function( event, fn, params ){

		const self = this.emitter || this;

		self.listeners[event] = self.listeners[event] || [];
		var e = Object.assign( { fn: fn }, params );
		self.listeners[event].push( e );
		
		if(self.listeners['listener'] && event !== 'listener'){
			self.emit( 'listener', event, fn, params );
		}

		if( params.trigger ){
			var triggered = false;
			if( params.trigger.equals && self[params.trigger.equals[0]] ){
				triggered = true;
			}
			if(triggered) return self.emit( event );
		}

		return false;
	}

	EventEmitter.prototype.removeListener = function( event, fn ){
		const self = this;
		if( self.listeners[event] ){
			if( fn ){
				for(var i=0;i<self.listeners[event].length;i++){
					if( self.listeners[event][i].fn === fn ){
						self.listeners[event].splice( i, 1 );
						i--;
						return true;
					}
				}
			}else if( self.listeners[event] ){
				delete self.listeners[event];
				return true;
			}
		}
		return false;
	}
	
	EventEmitter.prototype.hasListener = function( event ){
		return this.listeners[event] ? true : false;
	};

	EventEmitter.prototype.emit = function( event, ...args ){
		const self = this.emitter || this;
		if( self.listeners[event] && self.listeners[event].length > 0){
			var i=0;
			while( i < self.listeners[event].length ){
				self.listeners[event][i].fn.apply( self, args );
				if( self.listeners[event][i].once ){
					self.listeners[event].splice( i, 1 );
					i--;
				}
				i++;
			}
			if( self.listeners[event].length == 0 ){
				delete self.listeners[event];
			}
		}
		return false;
	};

	EventEmitter.prototype.once = function( event, fn ){
		const self = this.emitter || this;
		return self.addListener( event, fn, { once: true } );
	};
	
	EventEmitter.prototype.on = function( event, fn, options ){
		const self = this.emitter || this;
		console.log(self);
		var eventType = typeof event;
		if( eventType == 'array' ){
			for(var i=0;i<event.length;i++) self.on( event[i], fn, options );
		}
		return self.addListener( event, fn, options || {} );
	};

	EventEmitter.prototype.trigger = function( event, ...args ){
		return exports.emit( event, ...args );
	}

	EventEmitter.prototype.extend = function( base ){
		const self = this;
		base.emitter = self;
		Object.defineProperties( base, {
			on: {
				enumerable: false,
				get: function(){ return self.on },
				set: cancel
			},
			once: {
				enumerable: false,
				get: self.once,
				set: cancel
			}
		});

		base.emit = self.emit;

		return false;
	}

	
	return EventEmitter;
	
	
});