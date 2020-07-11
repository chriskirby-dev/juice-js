define('flux/auth', ['net/request', 'client'], function FluxBase( request, client ){
	//console.log(exports);
	var App = this.app;
	var auth = this.exports;
	console.log(this.exports);
	//App.Events.bindEvents( auth );
	var cookies = client.cookies;
	
	auth.url = null;
	auth.token = client.user.token ? client.user.token : null;
	auth.session = cookies.hasValue('auth.session') ? cookies.get('auth.session') : null;
	
	function resetAuth(callback){
		auth.session = null;
		cookies.clear('auth.session', { path: '/' });
		if(auth.session)
			request.iframe( auth.url+'/destroy', function( resp ){
				if(callback) callback( resp );
			});
	}
	
	
	
	auth.requestSession = function( callback ){
		if(auth.session){
			callback( auth.session );
		}else{
			request.iframe( auth.url+'/connect', function( resp ){
				if(!resp){
					resetAuth();
					auth.emit( 'fail', 'timeout' );
					callback( null );
				}else{
					auth.session = resp;
					cookies.set('auth.session', auth.session, { path: '/' });
					auth.emit( 'connected', auth.session );
					callback( auth.session );
				}
			});
		}
	};
	
	auth.destroy = function( reconnect ){
		resetAuth( reconnect );
	};
	
	auth.handshake = function(){
		request.iframe( auth.url+'/handshake', function( resp ){
			auth.session = resp;
			if(resp == 'error') return false;
			if(!resp){
				resetAuth();
				auth.emit( 'fail', 'timeout' );
			}else{
				auth.emit( 'connected', auth.session );
			}
		});
	};
	
	auth.authorize = function( socket ){
		console.log(socket);
		if(auth.token){
			if( socket ){
				var _timeout;
				_timeout = setTimeout(function(){
					auth.emit('fail', 'timeout');
				}, 3000 );
				socket.emit('authorize', auth.token, function( authorized ){
					clearTimeout(_timeout);
					if(authorized){
						auth.socket = socket;
						auth.emit( 'authorized', auth.session );
					}else{
						auth.emit('fail', 'auth');
					}
				});
			}else{
				request.iframe( auth.url+'/authorize/'+auth.token, function( resp ){
					if(!resp){
						auth.emit('fail', 'timeout');
						callback( null );
					}else{
						auth.emit( 'authorized', auth.session );
					}
				});
			}
		}
		return false;
	};
	
	return auth;
	
}, { extend: 'events' });