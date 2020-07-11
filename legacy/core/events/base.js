define('events', function Events( obj ){

	var self = this;
	var exports = obj || {};
	exports.events = {};
	exports.events.listeners = {};

	function EventTrigger(){

	}

	

	exports.events.addEvent = function( event, fn, params ){
	
		exports.events.listeners[event] = exports.events.listeners[event] || [];
		var e = Object.assign( { fn: fn }, params );
		exports.events.listeners[event].push( e );
		
		if(exports.events.listeners['listener'] && event !== 'listener'){
			exports.emit( 'listener', event, fn, params );
		}

		if( params.trigger ){
			var triggered = false;
			if( params.trigger.equals && exports[params.trigger.equals[0]] ){
				triggered = true;
			}
			if(triggered) return exports.emit( event );
		}

		return false;
	};

	exports.removeListener = function( event, fn ){
		if( exports.events.listeners[event] ){
			if( fn ){
				for(var i=0;i<exports.events.listeners[event].length;i++){
					if( exports.events.listeners[event][i].fn === fn ){
						exports.events.listeners[event].splice( i, 1 );
						i--;
					}
				}
			}else{
				delete exports.events.listeners[event];
			}
		}
	}
	
	exports.hasListener = function( event ){
		return exports.events.listeners[event] ? true : false;
	};
			
	exports.emit = function( event, ...args ){
		var self = this;
		if(exports.events.listeners[event] && exports.events.listeners[event].length > 0){
			var i=0;
			while( i < exports.events.listeners[event].length ){
				exports.events.listeners[event][i].fn.apply( self, args );
				if( exports.events.listeners[event][i].once ){
					exports.events.listeners[event].splice( i, 1 );
					i--;
				}
				i++;
			}
			if( exports.events.listeners[event].length == 0 ){
				delete exports.events.listeners[event];
			}
		}
		return false;
	};
	
	exports.once = function( event, fn ){
		return new exports.events.addEvent( event, fn, { once: true } );
	};
	
	exports.on = function( event, fn, options ){
		var eventType = typeof event;
		if( eventType == 'array' ){
			for(var i=0;i<event.length;i++) exports.on( event[i], fn, options );
		}
		return new exports.events.addEvent( event, fn, options || {} );
	};


	exports.or = function( event, ...args ){

	}

	exports.trigger = function( event, ...args ){
		exports.emit( event, ...args );
	}
	
	exports._extend = function( o ){
		var obj = new Events( o );
		delete obj._extend;
		return obj;
	};

	exports.events.Constructor = Events;
	
	exports.events.extend = function( o ){
		var obj = new Events( o );
		return obj;
	};
	
	return exports;
	
	
});