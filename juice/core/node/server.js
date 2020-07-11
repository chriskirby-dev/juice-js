define('node/server', ['http/request', 'http/xhr', 'client/cookies', 'node/auth'], function( Request, XHR, cookies, auth ){
	
	var app = this.app;
	var exports = this.exports;

	var sockets = {};
	var timeout = null;
	var cookieTime = 100000;
	var connectTimeout = 3000;
	exports.connected = false;
	exports.authorized = false;
	exports.host = cookies.hasValue('NodeIP') ? cookies.get('NodeIP') : null;
	exports.port = cookies.hasValue('NodePort') ? cookies.get('NodePort') : null;
	exports.session = cookies.hasValue('appSession') ? cookies.get('appSession') : null;
	
	exports.urls = {
		connect: 'connect',
		destroy: 'destroy'
	};
	
	exports.createSocket = function( port, callback ){
		if(app.auth.token){
			require('node/socket', function(_socket){
				_socket.on('socket.connect', function(){
					callback(_socket.connection);
					
					_socket.connection.emit('authorize', app.auth.user.token, function(status){
						if(status){
							callback(_socket.connection);
						}else{
							callback(false);
						}
					});
					
				});
				_socket.on('socket.fail', function(){
					console.log('socket.fail');
				});
				_socket.connect( exports.host );
			});
		}
	};
	
	//Server Cookies 
	function setCookies(){
		//var exdate = new Date(new Date().getTime()+node.cookieTime);
		var params = {
			//expires: exdate,
			path: '/'
		};
		cookies.set('appSession', exports.session, params);
		cookies.set('appIP', exports.host, params);
		
	}

	function clearCookies( callback ){
		var exdate = new Date(new Date().getTime()-100000);
		var params = {
			expires: exdate,
			path: '/'
		};
		cookies.set('appSession', 'expired', params);
		cookies.set('appIP', 'expired', params);
		
	}
	
	
	function request(_path, callback){
		
		console.log( 'Iframe Request: '+_path );
		var _timeout;	
		var body = document.getElementsByTagName('body')[0];
		var wrap = document.createElement('div');
		wrap.style = 'overflow:hidden;display:none;width:1px;height:1px';
		body.appendChild( wrap );
		
		var iframe = document.createElement('iframe');
		iframe.onload = function(){
			
			clearTimeout( _timeout );
			if(iframe.src == exports.url+'/'+_path){
				iframe.src = "about:blank";
			}else{
				if(iframe.contentWindow.name == 'error'){
					exports.emit('request.error',{
						level: 3,
						error: 'nodeRequest',
						message: 'Request returned Error: Server @'+exports.url+'/'+_path
					});
					callback(false);
				}else{
					console.log(iframe.contentWindow.name );
					callback( iframe.contentWindow.name );
					setTimeout(function(){
						body.removeChild( wrap );
					}, 1000);
				}
			}
			return false;
		};
		_timeout = setTimeout(function(){
			body.removeChild(wrap);
			exports.emit('request.fail',{
				level: 3,
				error: 'nodeServer',
				message: 'Error contacting server Node Server @'+exports.url+'/'+_path
			});
			callback(false);
		}, connectTimeout );
		
		wrap.appendChild(iframe);
		console.log(exports.url+'/'+_path);
		iframe.src = exports.url+'/'+_path;
	
	}
	
	function serverSocket(){
		console.log('serverSocket');
		if( app.auth.token ){
			require('node/socket', function(_socket){
				_socket.once('socket.connect', function(){
					console.log('Socket Connected');
					_timeout = setTimeout(function(){
						alert('Socket Authorization Failed: No Responce');
						exports.emit('connect.fail');
					}, connectTimeout);
					console.log('Socket Authorize');
					_socket.connection.emit('authorize', app.auth.token, function( status ){
						clearTimeout(_timeout);
						console.log('Socket Authorize '+status);
						if(status){
							console.log('Connect Success');
							exports.socket = _socket.connection;
							exports.emit('connect.success', exports.socket );
						}else{
							alert('Socket Authorization Failed');
							server.emit('connect.fail');
						}
					});
				});
				_socket.once('socket.fail', function(){
					request('destroy', function(){
						requestSessionCookie(function( success ){
							if(success){
								_socket.connect( exports.host, exports.port );
							}else{
								exports.emit('connect.fail');
							}
						});
					});
				});
				_socket.connect( exports.host, exports.port );
			});
		}
	}
	
	function authorize( callback ){
		request('authorize/'+app.auth.token, function( resp ){
			console.log(resp);
			if(!resp){
				exports.emit('connect.fail');
			}else{
				exports.token = resp;
				callback(true);
			}
		});
	}
	
	function requestSessionCookie(callback){
		request( 'connect', function( resp ){
			console.log(resp);
			if(!resp){
				callback(false);
			}else{
				exports.session = resp;
				setCookies();
				callback(true);
			}
		});
	}
	
	function Connect( host, port ){
		
		if(host) exports.host = host;
		if(port) exports.port = port;
		
		if( exports.host != null && exports.port != null ){
			console.log('Host and Port not Set');
			console.log(exports.host, exports.port);
			return false;
		}else{
			exports.url = 'http://'+exports.host;
			cookies.set('NodeIP', exports.host);
		}
		
		if(exports.session){
			request('auth', function( resp ){
				if(resp == 'error'){
					request('destroy', function( resp ){
						exports.connect();
					});
				}
				if(!resp){
					clearCookies();
					exports.emit('connect.fail');
				}else{
					exports.token = resp;
					serverSocket();
				}
			}); 
		}else{
			requestSessionCookie(function( success ){
				if(success){
					serverSocket();
				}else{
					clearCookies();
					exports.emit('connect.fail');
				}
			});
		}
		
		
	}
	
	exports.find = function(){
		
	};
	
	exports.connect = function( host, port ){
		
		if(host) exports.host = host;
		if(port) exports.port = port;
		
		if(!exports.host){
			XHR.get(app.config.api.host+'/api/server', { dataType: 'json' }).success(function( resp ){
				//exports.host = resp.host+':'+resp.port;
				if(resp.host) exports.host = resp.host;
				if(resp.port) exports.port = resp.port;
				Connect();
			});
		}else{
			Connect();
		}
		
		return false;
	};

	
	app.Server = exports;
	
	return exports;
	
}, { extend: 'events' });