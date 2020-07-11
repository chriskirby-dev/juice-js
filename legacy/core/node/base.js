define('node', [ 'client/cookies', 'http/request', 'node/auth' ], function( cookies, request, auth ){
	
	
	var exports = this.exports;
	var app = this.app;
	
	exports.auth = auth;
	
	exports.connected = false;
	exports.authorized = false;
	exports.host = cookies.hasValue('node.host') ? cookies.get('node.host') : null;
	exports.port = cookies.hasValue('node.port') ? cookies.get('node.port') : null;
	exports.session = cookies.hasValue('node.session') ? cookies.get('node.session') : null;
	
	
	exports.socket = function( callback, namespace ){
		console.log('node.socket call');
		require('node/socket', function(_socket){
			if(namespace) _socket.namespace = namespace;
			_socket.on('connect', function(){
				console.log('socket.connect: ');
				callback(_socket.connection);
				return false;
			});
			_socket.on('socket.fail', function(){
				console.log('socket.fail');
			});
			console.log( exports.host +':'+exports.port );
			var host = 'http://'+exports.host + ( exports.port ? ':'+exports.port : '');
			_socket.connect( host, app.auth.user.token );
		});
	};
	
	exports.authorize = function(){
		
		auth.authorize( exports.host, exports.port, function( authorized ){
			if( authorized ){
				exports.authorized = true;
				exports.emit('authorized');
			}
			return false;
		});
				
		return false;
	};
	
	exports.connect = function( host, port ){
		console.log('Node Connect');	
		if(host) exports.host = host;
		if(port) exports.port = port;
		
		auth.connect( exports.host, exports.port, function( session ){
			if( session ){
				exports.session = session;
				exports.emit('connect', session);
			}
			return false;
		});
				
		return false;
	};
	
	exports.init = function(){
		
		if( !exports.host || !exports.port ){
			request.get(app.config.api.host+'/api/server', { dataType: 'json' }).success(function( resp ){
				//exports.host = resp.host+':'+resp.port;
				if(resp.host) exports.host = resp.host;
				if(resp.port) exports.port = resp.port;
				exports.emit('ready');
			});
		}else{
			exports.emit('ready');
		}
	};
	
	app.node = exports;
	
	return exports;
	
}, { extend: 'events', persistant: true });
