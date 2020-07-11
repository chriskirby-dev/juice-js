define('node/auth', ['http/request', 'client/cookies'], function( request, cookies ){
	
	var exports = this.exports;
	var app = this.app;
	exports.session = null;
	
	exports.connect = function( host, port, callback ){
		
		request.iframe( 'http://'+host+':'+port+'/connect/iframe', function( resp ){
			console.log(arguments);
			if(!resp){
				exports.emit( 'fail', 'timeout' );
				callback( null );
			}else{
				exports.session = resp;
				cookies.set('node.session', exports.session, { path: '/' });
				callback( exports.session );
			}
			return false;
		});
		
		return false;
 	
 	};
 	
 	
	exports.authorize = function( host, port, callback ){
		var u = app.auth.user.user_id;
		var t = app.auth.user.token;
		request.jsonp( 'http://'+host+':'+port+'/authorize/'+u+'/'+t, function( resp ){
			if(!resp){
				callback( false );
			}else{
				callback( true );
			}
			return false;
		});
		return false;
	};
	
	
	
	
	return exports;
	
}, { extend: 'events' });
