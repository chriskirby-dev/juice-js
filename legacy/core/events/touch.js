 define('events/touch', ['events'], function( events ){
	
	var exports = this.exports;
	
	var TouchHandeler = function(changedTouches){
		var touchVals = [];
		var touches = Array.prototype.slice.call( changedTouches );
		for (var i = 0; i < touches.length; i++) {
			touchVals.push({ x: touches[i].pageX, y: touches[i].pageY });
		}
		return touchVals;
	};
	
	var GestureListener = function GestureListener( el ){
		var listener = this;
		events._extend(this);
		if(!el) el = document.getElementsByTagName('body')[0];
		
		var _touches = {};
		var gesture = null;
		
		var TouchGesture = function(touches){
			events._extend(this);
			this.contacts = [];
			this.startTime = new Date().getTime();
		};
		TouchGesture.prototype.points = function( e ){
			return _touches;
		};
		TouchGesture.prototype.time = function( touchEvent ){
			return ( new Date().getTime() - this.startTime )/1000;
		};

	
		var TouchGestureContact = function( touchEvent ){
			events._extend(this);
			this.x = null;
			this.y = null;
			this.startX = touchEvent.clientX;
			this.startY = touchEvent.clientY;
			this.startTime = new Date().getTime();
			this.setEvent( touchEvent );
		};
		
		TouchGestureContact.prototype.setEvent = function( e ){
			this.x = e.clientX;
			this.y = e.clientY;
			this.changeX = this.x - this.startX;
			this.changeY = this.y - this.startY;
			this.emit('change', this.x, this.y );
		};
		
		TouchGestureContact.prototype.time = function( touchEvent ){
			return ( new Date().getTime() - this.startTime )/1000;
		};

		TouchGestureContact.prototype.end = function( touchEvent ){
			this.setEvent( touchEvent );
			this.emit('end', this.x, this.y );
		};
		
		el.$.on('touchstart', function( e ){
			
			if(Object.keys(_touches).length == 0){
				gesture = new TouchGesture();
				listener.emit('gesture.start', gesture);
			}
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				_touches[id] = new TouchGestureContact(e.changedTouches[i]);
				gesture.emit( 'point.start', _touches[id] );
			}		

			return false;
		});
		
		el.$.on('touchend', function( e ){
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				_touches[id].end(e.changedTouches[i]);
				delete _touches[id];
			}
			
			if(Object.keys(_touches).length == 0){
				listener.emit('gesture.end', gesture);
				gesture = null;
			}

			return false;
		});
		
		el.$.on('touchmove', function(e){
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				_touches[id].setEvent( e.changedTouches[i] );
			}
			
			return false;
		});
		
		el.$.on('touchcancel', function(e){
			return false;
		});
		
	};
	
	exports.GestureListener = GestureListener;
	
	
	function touchListener( el, cb ){
		var listener = this;
		events._extend(this);
		var tcanvas = assets.touchGestureCanvas;
		var tcontext = tcanvas.getContext("2d");
		
		var _touches = {};
		var gesture = null;
		
		var TouchGesture = function(touches){
			events._extend(this);
			this.contacts = [];
			this.startTime = new Date().getTime();
		};
		TouchGesture.prototype.points = function( e ){
			return _touches;
		};
		TouchGesture.prototype.time = function( touchEvent ){
			return ( new Date().getTime() - this.startTime )/1000;
		};

	
		var TouchGestureContact = function( touchEvent ){
			events._extend(this);
			this.x = null;
			this.y = null;
			this.startTime = new Date().getTime();
			this.setEvent( touchEvent );
		};
		
		TouchGestureContact.prototype.setEvent = function( e ){
			this.x = e.clientX;
			this.y = e.clientY;
			this.emit('change', this.x, this.y );
		};
		
		TouchGestureContact.prototype.time = function( touchEvent ){
			return ( new Date().getTime() - this.startTime )/1000;
		};

		
		TouchGestureContact.prototype.end = function( touchEvent ){
			this.setEvent( touchEvent );
			this.emit('end', this.x, this.y );
		};
		
		el.$.on('touchstart', function( e ){
			
			if(Object.keys(_touches).length == 0){
				gesture = new TouchGesture();
				el.$.emit('gesture.start', gesture);
			}
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
			//	console.log('START: '+id);
				_touches[id] = new TouchGestureContact(e.changedTouches[i]);
				gesture.emit( 'point.start', _touches[id] );
			}
			
			
			return false;
		});
		
		el.$.on('touchend', function( e ){
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				//console.log('END: '+id);
				_touches[id].end(e.changedTouches[i]);
				delete _touches[id];
			}
			if(Object.keys(_touches).length == 0){
				el.$.emit('gesture.end', gesture);
				gesture = null;
			}
			assets.debug.short.innerHTML = e.touches.length;
			return false;
		});
		
		el.$.on('touchmove', function(e){
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				_touches[id].setEvent( e.changedTouches[i] );
			}
			
			return false;
		});
		
		el.$.on('touchcancel', function(e){
			return false;
		});
		
	}
	
	var TapListener = function( el, evType, fn ){
		
		var start = null;
		var touching = [];
		var startTouch;
		var startTouchTime;
		var cancelled = false;
		
		var distY, distX;
		
		el.$.on('touchstart', function( e ){
			var started, event;
			var touches = new TouchHandeler( e.touches );
			if( touches.length == 1){
				cancelled = false;
				startTouch = touches[0];
				startTouchTime = new Date().getTime();
			}else{
				cancelled = true;
			}
			return false;
		});
		
		el.$.on('touchend', function( e ){
			var event;
			if( !cancelled ){
				var touches = new TouchHandeler( e.touches );
				var time = new Date().getTime() - startTouchTime;
				//var distY = Math.abs( e.touches[0].y - startTouch.y );
				//var distX = Math.abs( e.touches[0].x - startTouch.x );
				//console.log( distX+' :: '+distY );
				//console.log(touches[0]);
				if( time < 400 ) fn.apply(el, [touches[0]]);
				cancelled = true;
			}else{
				cancelled = true;
			}
			return false;
		});
		
		el.$.on('touchmove', function(e){
			if( cancelled ) return false;
			var touches = new TouchHandeler( e.touches );
			//console.log(touches);
			distY = Math.abs( touches[0].y - startTouch.y );
			distX = Math.abs( touches[0].x - startTouch.x );
			if( distX > 4 || distX > 4 ){
				cancelled = true;
			}
			return false;
		});
		
		el.$.on('touchcancel', function(e){
			cancelled = true;
			return false;
		});

	};
	
	var TouchListener = function( el, evType, fn ){
		
		var start = null;
		var touching = [];
		
		var TouchEvent = function( e, end ){
			var touches = new TouchHandeler( e.touches );
			if(!touching[touches.length]){
				touching[touches.length] = true;
				touches.isStart = true;
			}
			fn.apply(el, [touches, end]);
		};
		
		el.$.on('touchstart', function( e ){
			var started = e.changedTouches[0];
			var event  = new TouchEvent( e );
			
			//fn.apply(el, [touches]);
			return false;
		});
		
		el.$.on('touchend', function( e ){
			var event  = new TouchEvent( e, true );
			return false;
		});
		
		el.$.on('touchmove', function(e){
			var event  = new TouchEvent( e );
			return false;
		});
		
		el.$.on('touchcancel', function(e){
			var event  = new TouchEvent( e );
			return false;
		});

	};
	
	var SwipeListener = function( el, evType, fn ){
		
		var touchList = [];
		var start = null;
		var moved;
		var movement = {};
		
		var TouchHandeler = function(changedTouches){
			var touchVals = [];
			var touches = Array.prototype.slice.call( changedTouches );
			for (var i = 0; i < touches.length; i++) {
				touchVals.push({ x: touches[i].pageX, y: touches[i].pageY });
			}
			return touchVals;
		};
		
		
		el.$.on('touchstart', function( e ){
			if(!start) start = new TouchHandeler( e.changedTouches );
			return false;
		});
		
		el.$.on('touchend', function( e ){
			
			if(!moved){
				if(evType == 'tap'){
					fn.apply(el, []);
				}
				moved = null;			
				start = null;
				return false;
			}
			
			var touches = e.changedTouches;
			var end = new TouchHandeler( e.changedTouches );
			var _start = start[0];
			var _end = end[0];
			var distX = Math.abs( _start.x -_end.x );
			if( evType == 'tap' && distX < 5 ){
				fn.apply(el, []);
			}else
			if( evType == 'swipeleft' || evType == 'swiperight' ){
				if(distX > 50 ){
					var dir = _start.x > _end.x  ? 'left' : 'right';
					if(evType == 'swipe'+dir){
						fn.apply(el, []);
					}
				}else{
					start = null;
				}
				
			}		
			moved = null;			
			start = null;
			return false;
		});

		el.$.on('touchmove', function(e){
			moved = new TouchHandeler( e.changedTouches );
			return false;
		});
		
		el.$.on('touchcancel', function(){
			var touches = e.changedTouches;
			
			return false;
		});
			
	};
	
	exports.listenTo = function( el, evType, fn ){
		//new SwipeListener( el, evType, fn );
		var listener;
		if(evType == 'tap'){
			listener = new TapListener( el, evType, fn );
		}else{
			listener = new TouchListener( el, evType, fn );
		}
		return false;
	};
	
	return exports;

});