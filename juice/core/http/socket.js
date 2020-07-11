define('http/socket', ['https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js'], function(){
	var socket = this.exports;
	var app = this.app;
	var timeout = 3000;

	
	socket.domain = null;
	socket.port = null;
	socket.connected = false;
	socket.connection = null;
	socket.session = null;
	socket.server = null;
	socket._timeout = null;
	socket.namespace = null;
	socket.ns = {};

	socket.create = function(auth){
		console.log('Create: '+socket.server);
		var opts = {};
	
		socket.connection = io( socket.server );
			
		socket.connection.on('connect', function(){
			console.log('Connected 2: '+socket.server);
			clearTimeout( socket._timeout );
			socket.connected = true;
			//socket.sessionid = socket.connection.socket.sessionid;
			socket.emit('connect', socket.connection);
		});
			
		socket.connection.on('connect_failed', function(){
			console.log('connect_failed');
		});
			
		socket.connection.on('reconnecting', function(time_since_connect){
			socket.connected = false;
		});
			
		socket.connection.on('reconnect', function(err){
			socket.connected = true;
		});
			
		socket.connection.on('reconnect_failed', function(err){
			console.log(err);
		});
			
		socket.connection.on('error', function(err){
			if(err == 'handshake error'){
				console.log('Handshake Failed');
				if(socket._timeout){ clearTimeout( socket._timeout ); }	
				socket.emit('socket.fail');		
			}
		});
		
		window.onbeforeunload = function(){
			socket.connection.emit('disconnect');
			
		};
		
		socket.connection.on('disconnect', function(){ 
			socket.connected = false;
		});
	};
	
	socket.connect = function( _host, auth ){
		console.log( 'Connect', _host, auth );
		//socket.domain = _domain;
		//socket.port = _port;
		socket.server = _host;
		if(socket.namespace) socket.server += '/'+socket.namespace;
		if(!socket.connection){
			//Socket Not Available
			socket.create( auth );
		}else{
			console.log('reconnect');
			if(socket.connection.socket)
			socket.connection.socket.reconnect();
		}
		socket._timeout = setTimeout(function(){
			socket.emit('socket.fail');
		}, 3000);
	};
	
	return socket;
	
}, { extend: 'events' });
