define('display', ['http/xhr', 'display/views', 'display/asset'], function( xhr, views, asset ){
	var exports = this.exports;
	var app = this.app;
	app.display = exports;
	var head = document.getElementsByTagName('head')[0];
	
	var DisplayAsset = asset.DisplayAsset;
	var View = views.View;
	
	exports.Asset = DisplayAsset;
	exports.workers = {};
	exports.views = views;
	exports.assets = asset;
	exports.cache = {};
	exports.cache.tpl = {};
	
	exports.setView = function( id ){
		exports.views[id] = null;
	};
	
	exports.getView = function( id ){
		
	};
	
	exports.template = function( path ){
		
		require('display/template').then(function( template ){
			template.path = path;
			exports.cache.tpl[path] = template; 
			template.load( function(){
				container.appendChild( template.content );
				nextInsert();
			}); 
		});
		
	};
	
	exports.load = function( uri, callback ){
		xhr.get( uri ).success(function( txt ){
			console.log('GET '+uri +' '+txt);
			var asset = exports.parse( txt );
		}).fail(function(){
			
		});
	};
	
	
	
	//app.render('application', { });
	exports.render = function( id, uri, callback ){
		var target = document.getElementById( id );
		var asset = new DisplayAsset( id, uri );
		console.log('Got Asset');
		asset.render(callback);
	};
	
	exports.container = function( id, options ){
		
	};
	
	exports.worker = function( id, fn ){
		exports.workers[id] = fn;
	};
	
	return exports;
}, { extend: 'events' });
