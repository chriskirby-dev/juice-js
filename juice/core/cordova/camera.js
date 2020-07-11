// JavaScript Document
define('cordova/camera', [], function(){
	
	var exports = this.exports;
	var app = this.app;
	
	
	exports.getPicture = function(){
		
		var options = {};
		
		navigator.camera.getPicture( function(){
			
		}, function(){
			
		}, options );
		
		return false;
	};
	
	function cameraCallback(imageData) {
   var image = document.getElementById('myImage');
   image.src = "data:image/jpeg;base64," + imageData;
}



	navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
	function onFail(message) {
	    alert('Failed because: ' + message);
	}


	navigator.camera.cleanup(onSuccess, onFail);


	return exports;
	
}, { extend: 'events'});