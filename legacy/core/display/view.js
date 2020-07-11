define('display/view', ['http/xhr'], function( xhr ){
	
	var exports = this.exports;
	var app = this.app;
	var id = null;
	exports.views = [];
	exports.wrapper = null;
	exports.inactive = [];
	exports._data = {};
	
	Object.defineProperty( exports, 'id', {
		get: function(){
			return id;
		},
		set: function(_id){
			id = _id;
			exports.create();
		}
	});
	
	exports.update = function( cb ){
		console.log('Update Workers');
		
		var workers = Array.prototype.slice.call(exports.workers);
		console.log(workers);

		var executeWorker = function(){
			if(workers.length == 0){
				if(cb) cb();
				return false;
			}
			var worker = workers.shift();
			if(app.display.workers[worker]){
				console.log('Worker '+worker);
				var completeCB = function(){
					executeWorker();
				};
				app.display.workers[worker].apply( self, [completeCB] );
			}else{
				
			}
		};
		executeWorker();
	};
	
	exports.data = function( data ){
		console.log('View Data');
		console.log(data);
		if( data ) exports._data = data;
		
		var target = exports.active;
		if( exports.pending ){
			target = exports.pending;
		}
		console.log(target);
		if( data && target ){
			
			var innerData = Array.prototype.slice.call( target.querySelectorAll('[data-inner]') );
			while( innerData.length > 0 ){
				var el = innerData.shift();
				var key = el.getAttribute('data-inner');
				if( data[key] ){
					el.innerHTML = data[key];
				}
			}
			
			var backgroundData = Array.prototype.slice.call( target.querySelectorAll('[data-background]') );
			while( backgroundData.length > 0 ){
				var el = backgroundData.shift();
				var key = el.getAttribute('data-background');
				if( data[key] ){
					el.style.backgroundImage = 'url('+data[key]+')';
				}
			}
			
			
		}else{
			console.log('Not Ready');
		}
		
		return exports;
	};
	
	var initializeViews = function( callback  ){
		var views = Array.prototype.slice.call( exports.pending.querySelectorAll('.view-pane') );
		if(views.length > 0){
			for(var v=0;v<views.length;v++){
				app.display.views.add( views[v].id );
			}
			if(callback) callback();
		}
	};

	
	exports.loaded = function(  ){
		
		
		console.log(exports.template.stylesheets);
		
			
			if(exports._data){
				exports.data(exports._data);
			}
			
			initializeViews(function(){
				exports.update(function(){
					
				});
				
				exports.template.runWorkers(function(){
					exports.emit('ready');
				
				});
			});
			
		
	};
	
	exports.load = function( path, callback ){
		
		var self = this;
		
		exports.loading = true;
		exports.pending = exports.inactive.shift();
		exports.pending.className = 'view pending';
		exports.template = new app.display.assets.Tpl( path );

		exports.template.load(function(){
			
			exports.workers = exports.template.workers;
			exports.loading = false;
			exports.template.renderIn( exports.pending );
			
			console.log('Self Loaded', exports.template.uri );
			exports.loaded();
			exports.pending.className = 'view pending active';
		});
		
		var onFullyVisible = function(){
			console.log('onFullyVisible');
			exports.pending.removeEventListener('transitionend', onFullyVisible );
			exports.pending.className = 'view active';
			if(exports.active){
				exports.active.className = 'view';
				exports.inactive.push( exports.active );
			}
			exports.active = exports.pending;
			
		
			exports.pending = null;
			if(callback) callback();
			return false;
		};
		
		exports.pending.addEventListener( 'transitionend', onFullyVisible );
		return false;
	};
	
	exports.create = function(){
		exports.wrapper = app.body.querySelector( '#'+id );
		exports.wrapper.$.class('view-pane', true);
		exports.views = this.wrapper.querySelectorAll('.view');
		exports._data = {};
		
		if( exports.views.length == 0 ){
			var inactive = document.createElement('div');
			inactive.className = 'view';
			exports.wrapper.appendChild( inactive );
			exports.inactive.push(inactive);
			
			var inactive2 = document.createElement('div');
			inactive2.className = 'view';
			exports.wrapper.appendChild( inactive2 );
			exports.inactive.push(inactive2);
		}
	};
	
	return exports;
	
}, { extend: 'events' });