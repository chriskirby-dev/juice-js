define('events/dom', function Event(){

	var exports = this.exports;
	
	var doc = document.documentElement;
	var body = document.body;
	var removeFn = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
	var addFn = window.addEventListener ? 'addEventListener' : 'attachEvent';
	var prefix = window.addEventListener ? "" : "on";
	
	exports.normalize = function( event ){
		event.$ = {};
		event.target = (window.event) ? window.event.srcElement : event.target;
		
		if ( event.pageX == null && event.clientX != null ) {
			event.pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0 );
			event.pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc   && doc.clientTop  || body && body.clientTop  || 0 );
		}
		
		var eOffset = event.target.$.offset();
		
		event.targetX = event.pageX - eOffset.left;
		event.targetY = event.pageY - eOffset.top;
			
		return event;
		
	};
	
	exports.cancel = function( e ){
		e.stopPropagation();
		e.preventDefault();
	};
	
	exports.add = function( el, type, fn, capture ){
		el[addFn]( prefix + type, fn, capture || false );
		return fn;
	};
	
	exports.remove = function( el, type, fn, capture ){
		el[removeFn]( prefix + type, fn, capture || false );
		return fn;
	};
	
	return exports;
	
});