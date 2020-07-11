// JavaScript Document
define('cordova', [], function(  ){
	
	var exports = this.exports;
	exports.ready = false;
	var app = this.app;
	app.cordova = exports;
	
	exports.accelerometer = function( next ){
		app.body.$.find('#debug').innerHTML = JSON.stringify('accelleration require');
		require('cordova/accelerometer').then( function( acc ){
			next(acc);
			return false;
		});
		return false;
	};
	
	var deviceReady = function(){
		console.log('Cordova Ready');
		exports.ready = true;
		exports.emit('ready', 'cordova'); 
		/*
		app.require('cordova/device').then(function( device ){
			app.device = device;
			app.require('cordova/fs').then(function( fs ){
				exports.fs = fs;
				exports.emit('ready');
				return false;
			});
			return false;
		});
		*/
		return false;
	};
	
	if(!window.cordova){
		var _script = document.createElement('script');
		_script.src = 'cordova.js';
		_script.async = true;
		app.head.appendChild(_script);
	}else{
		exports.emit('ready', 'cordova');
	}
	
	document.addEventListener("deviceready", deviceReady, false);
	
	return exports;
	
}, { extend: 'events'});