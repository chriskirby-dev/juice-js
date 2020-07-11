define('flux/connection', ['net/request', 'flux/auth', 'client'], function FluxConnection( request, auth, client ){
	
	var App = this.app;
	var cookies = client.cookies;
	var conn = this.exports;
	
	conn.attempts = 0;
	conn.connected = false;
	conn.authorized = false;
	conn.ready = false;
	conn.socket = null;
	conn.ip = cookies.hasValue('node.ip') ? cookies.get('node.ip') : null;
	conn.port = cookies.hasValue('node.port') ? cookies.get('node.port') : null;
	
	auth.on('fail', function( reason ){
		console.log('auth.fail '+ reason);
		conn.attempts++;
		switch(reason){
			case 'timeout':
				conn.ip = null;
				conn.port = null;
				cookies.clear('node.ip');
				cookies.clear('node.port');
				init();
			break;	
			case 'auth':
				conn.destroy();
			break;
		}
	});
	
	auth.on('connected', function( session ){
		conn.session = session;
		conn.connected = true;
		createSocket();
		return false;
	});
	
	auth.on('authorized', function(){
		conn.authorized = true;
		conn.ready = true;
		conn.emit('ready');
	});
	
	function onSocket( socket ){
		if(auth.token){
			auth.authorize( conn.socket );
		}else{
			conn.ready = true;
			conn.emit('ready');
		}
	}
	
	function createSocket(){
		var _timeout;
		require('nodejs/socket', function(_socket){
			_socket.once('socket.connect', function(){
				console.log('Socket Connected');
				_timeout = setTimeout(function(){
					conn.emit('connect.fail');
				}, 3000 ); 
				conn.socket = _socket.connection;
				onSocket( _socket.connection );
			});
			_socket.once('socket.fail', function(){
				auth.destroy();
			});
			_socket.connect( conn.ip, conn.port );
		});
		return;
	} 
	
	conn.destroy = function( reconnect ){
		if(auth.session){
			request.iframe( conn.url+'/destroy', function( resp ){
				conn.connected = false;
				conn.authorized = false;
				conn.ready = false;
				conn.ip = null;
				conn.port = null;
				cookies.clear('node.port');
				cookies.clear('node.ip');
				if( reconnect ) conn.connect();
			});
		}
	};
	
	conn.findServer = function( callback ){
		console.log('findServer');
		request.get('/flux/findserver', null, function( _server ){
			var serv = JSON.parse(_server);
			callback( { ip: serv.external_ip, port: serv.port ? serv.port : 1110 } );
		});
	};
	
	conn.connect = function(){
		
		conn.url = auth.url = 'http://'+conn.ip+':'+conn.port;
		if(auth.session){
			console.log( 'conn.connect HAS auth.session: '+auth.session );
			auth.handshake();
		}else{
			console.log( 'conn.connect NOT auth.session:' );
			auth.requestSession(function( session ){
				
			});
		}
	};
	
	conn.startup = function(){
		init();
	};
	
	function init(){
		if(conn.attempts > 3){
			conn.emit('fail', '3 attempts failed');
			return false;
		}
		if(!conn.ip){
			conn.findServer(function( server ){
				conn.ip = server.ip;
				conn.port = server.port;
				cookies.set('node.ip', conn.ip);
				cookies.set('node.port', conn.port);
				conn.connect();
			});
		}else{
			conn.connect();
		}
	}
	
	
	conn.auth = auth;
	return conn;
	
}, { extend: 'events' });