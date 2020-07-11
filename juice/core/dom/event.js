define('dom/event', function(){
	
	var exports = this.exports;
	
	var doc = document.documentElement, body = document.body;
	
	var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
	unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
	prefix = bind !== 'addEventListener' ? 'on' : '';
	
	var onEventHandeler = function(){
		
	};
	
	exports.normalize = function( event ){
		event.$ = {};
		event.target = (window.event) ? window.event.srcElement : event.target;
		
		if ( event.pageX == null && event.clientX != null ) {
			
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc   && doc.clientTop  || body && body.clientTop  || 0);
		}
		
		var eOffset = event.target.$.offset();
		
		event.targetX = event.pageX - eOffset.left;
		event.targetY = event.pageY - eOffset.top;
			
		return event;
		
	};
	
	
	exports.bind = function(el, type, fn, capture){
		el[bind](prefix + type, fn, capture || false);
		return fn;
	};
	
	exports.unbind = function(el, type, fn, capture){
		el[unbind](prefix + type, fn, capture || false);
		return fn;
	};

	return exports;

});