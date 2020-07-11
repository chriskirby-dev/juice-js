define('cart/paypal', ['http', "https://js.braintreegateway.com/v2/braintree.js"], function PaymentPayPal( http ){
	
	var app = this.app;
	var exports = this.exports;
	exports.braintree = braintree;
	
	exports.init = function(){
		
		var container = document.getElementById('paypal-container');
		var wrapper = document.getElementById('paypal-wrapper');
		var total = Number(container.getAttribute('data-total'));
		var form = document.getElementById('transaction-form');
		var nonce_input = form.elements['nonce'];
		
		/*
		var submit_btn = document.getElementById('submit-transaction');
		submit_btn.$.on('click', function(){
			form.submit();
		});
		*/
		/*
		exports.braintree.setup( exports.clientToken, "custom", {
			paypal: {
			    container: "paypal-wrapper",
			    singleUse: true,
			    amount: total.toFixed(2),
			    currency: 'USD',
			    locale: 'en_us',
		   },
		   onPaymentMethodReceived: function (obj) {
		   		console.log('onPaymentMethodReceived', obj);
		   		container.className = 'nonced';
		   		nonce_input.value = obj.nonce;
		   		
		   		//self.sendNonce( obj );
			},
			onReady: function (integration) {
				console.log('onReady', integration );
			    //self.checkout = integration;
			},
			onError: function( err ){
				//console.log('Error',err);
			}
		});
		
		*/
		
		exports.braintree.setup( exports.clientToken, "dropin", {
			container: "paypal-wrapper",
			paypal: {
			    button: {
			      type: 'checkout'
			    }
			 },
			onPaymentMethodReceived_: function (obj) {
		   		console.log('onPaymentMethodReceived', obj);
		   		container.className = 'nonced';
		   		//nonce_input.value = obj.nonce;
		   		
		   		//self.sendNonce( obj );
			},
			onReady: function (integration) {
				console.log('onReady', integration );
			    //self.checkout = integration;
			},
			onError: function( err ){
				console.log('Error',err);
			}
		});
	};
	
	exports.requestToken = function( next ){
		http.get('/cart/paypal/client-token').success(function( clientToken ){
			exports.clientToken = clientToken;
			next( clientToken );
			return false;
		});
	};
	
	return exports;
	
}, { extend: 'events' });