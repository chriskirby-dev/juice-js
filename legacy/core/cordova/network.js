// JavaScript Document
define('cordova/network', [], function(){
	
	var exports = this.exports;
	var app = this.app;
	app.network = exports;
	exports.connected = false;
	var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'none';

	
	exports.check = function(){
	    var networkState = navigator.connection.type;  	
	    return states[networkState];
	};

	document.addEventListener("offline", function(){
		exports.emit('online', exports.check());
	}, false);
	
	document.addEventListener("online", function(){
		exports.emit('offline');
	}, false);
	
	if(exports.check() !== 'none'){
		exports.connected = true;
	}
	
	return exports;
	
}, { extend: 'events'});