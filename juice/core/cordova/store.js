define('cordova/store', ['http/xhr', 'events', 'dialog'], function CordovaStore( xhr, events, dialog ){
	
	var exports = this.exports;
	var app = this.app;
	app.store = exports;
	var store, products = {};
	
	exports.products = {};
	
	var Product = function( product_id, alias, type ){
		
		var self = this;
		exports.events.extend(this);
		exports.products[product_id] = self;
		
		self.id = product_id;
		self.alias = alias;
		
		if(!window.store) return false;
		store = window.store;
		
		self.type = !type ? store.CONSUMABLE : type;
		self.map = null;
		products[self.id] = this;
		
		
		
		store.register({
	        id:    self.id,
	        alias: self.alias,
	        type:  self.type
	    });
	    
	    store.when(self.id).initiated(function( p ) {
		    // Write a function that identifies this product ID as having been
		    // initiated to purchase.
		    self.emit('purchase.init', self.id );
		    return false;
		});
		
		// Called when the user has cancelled purchasing the product, after it has
		// been initiated.
		store.when(self.id).cancelled(function( p ) {
		    // Write a function that marks this product ID as not being purchased
		     self.emit('cancelled', self.id );
		     return false;
		});

	    // Purchase has been executed successfully. Must call finish to charge the user
		// and put the product into the owned state.
		store.when( self.id ).approved(function( product ) {
			console.log('APPROVED');
			//p.finish();
			var onPurchaseComplete = function(){
				product.finish();
			};
			self.emit('approved', self.id, onPurchaseComplete );
			return false;
		});
		
		// Called when the product purchase is finished. This gets called every time
		// the app starts after the product has been purchased, so we use a helper
		// function to determine if we actually need to purchase the non-renewing
		// subscription on our own server.
		store.when( self.id ).owned(function(p) {
			self.emit('owned', self.id );
			return false;
		});
		
		
		store.when( self.id ).updated(function(p) {
			self.emit('updated', self.id );
			return false;
		});
		
	};
	
	Product.prototype.get = function(){
		var self = this;
		return store.get( self.id );
	};
	
	Product.prototype.order = function(){
		var self = this;
		console.log('ORDER: '+self.id);
		store.order( self.id );
		
	};
	
	exports.order = function( product_id ){
		exports.products[product_id].order();
	};
	
	exports.buy = function( product_id ){
		var product = window.store.get( product_id );
		console.log(JSON.stringify(product));
		var _content = '<div class="product-graphic" data-product-id="'+product_id+'" ></div>';
		_content += '<h2>'+product.title+'</h2>';
		_content += '<p>'+product.description+'</p>';
		_content += '<strong>'+product.price+'</strong>';
		
		app.dialog.confirm({
			class: 'purchase-confirm',
			width:'80%',
			html: _content,
			buttons: {
				'Cancel' : {
					fn: function(){
						app.dialog.close();
					}
				},
				'Buy Now': {
					key: 'buy-now',
					highlight: true,
					fn: function(){
						app.store.order(product_id);
						app.dialog.close();
						return fslse;
					}
				}
			}
		});
	};
	
	exports.getProduct = function( pid ){
		return store.get( pid );
	};
	
	exports.Product = Product;
	
	exports.ready = function(){
		if(!window.store) return false;
		store = window.store;
		store.verbosity = store.ERROR;
		//store.verbosity = store.INFO;
		store.refresh();
	};

	
	return exports;
	
}, { extend: 'events', persistant: true });
