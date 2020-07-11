// JavaScript Document
define('cordova/accelerometer', [], function(){
	
	var exports = this.exports;
	var app = this.app;
	var vectors = {};
	
	var onAccelerometerUpdate = function( acc ){
		vectors = acc;
		app.body.$.find('#debug').innerHTML = JSON.stringify(vectors);
		exports.emit('update', acc);
	};
	
	var onAccelerometerUpdateError = function(){
		
	};
	
	exports.watch = function( freq ){
		if(!freq) freq = 1000;
		if(navigator.accelerometer)
			navigator.accelerometer.watchAcceleration(onAccelerometerUpdate, onAccelerometerUpdateError, { frequency: freq } );
	};
	
	return exports;
	
}, { extend: 'events'});