define('cart', ['http', 'cart/paypal'], function Cart( http, paypal ){
	
	var app = this.app;
	var exports = this.exports;
	app.cart = exports;
	exports.clientToken = null;
	exports.braintree = braintree;
	exports.paypal = paypal;
	
	exports.add = function( product_id ){
		http.get('/cart/add/'+product_id).success(function( resp ){
			
		});
	};

	exports.remove = function( product_id, count ){
		http.get('/cart/remove/'+product_id).success(function( resp ){
			
		});
	};
	
	exports.checkout = function( amount ){
		
	};

	exports.get = function(){
		
	};
	
	exports.requestToken = function( next ){
		http.get('/cart/paypal/client-token').success(function( clientToken ){
			exports.clientToken = clientToken;
			next( clientToken );
			return false;
		});
	};
	
	exports.startup = function(){
		if(document.getElementById('paypal-container')){
			paypal.requestToken(function( clientToken ){
				console.log(clientToken);
				paypal.init();
			});
		}
	};
	
	this.domready = function(){
		console.log('Cart Dom Ready');

	};
	
	return exports;
	
}, { extend: 'events' });