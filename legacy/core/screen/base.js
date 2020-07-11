define('screen', function Events( obj ){
	
	var exports = this.exports;
	var app = this.app;
	
	Object.defineProperty( exports, 'width', {
		get: function(){
			return window.innerWidth
			|| document.documentElement.clientWidth
			|| document.body.clientWidth;
		},
		set: function( v ){
			myWindow.resizeTo( v, exports.height );
		}
	});
	
	Object.defineProperty( exports, 'height', {
		get: function(){
			return window.innerHeight
			|| document.documentElement.clientHeight
			|| document.body.clientHeight;
		},
		set: function( v ){
			myWindow.resizeTo( exports.width, v );
		}
	});
	
	var addResizeListener = function(){
		
	};
	
	var addOrientationListener = function(){
		
	};
	
	exports.on('listener', function( event ){
		switch( event ){
			case 'resize':
			window.addEventListener("resize", function() {
			   exports.emit("resize", exports.width, exports.heihgt );
			});
			break;
			case 'orientationchange':
			window.addEventListener("orientationchange", function() {
			   var orientation = window.orientation;
			   exports.emit("orientationchange", orientation);
			});
			break;
		}
		return false;
	});
			
	return exports;
	
}, { extend: 'events' });