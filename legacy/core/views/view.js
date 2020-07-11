define('views/view', ['http/xhr', 'events'], function( xhr, events ){
	
	var exports = this.exports;
	var app = this.app;
		
	var View = function( id, options ){
		
		events._extend( this );
		var self = this;		
		
		self.id = id;
		self.ready = false;
		self.inactive = [];
		self.loading = false;
		self.pending = null;
		self.transition = 'ease';
		
		if( options ) self.options = options;
		
		self.on('listener', function( listener ){
			if( self.ready && listener == 'ready' ){
				//self.emit('ready');
			}
		});
		
		self.initialize();
	};
	
	View.prototype.initialize = function(){
		
		var self = this;
		
		console.log('Initialize View '+self.id);
		self.container = app.body.querySelector( '#'+self.id );
		self.container.$.class('view-container', true);
		self._data = {};
		
		setTimeout(function(){
			self.emit('ready');
			self.ready = true;
		}, 100);
	};
	
	View.prototype.loaded = function( path, callback ){
		var self = this;
		var views = Array.prototype.slice.call( self.pending.querySelectorAll('.view-container') );
		if(views.length > 0){
			for(var v=0;v<views.length;v++){
				app.display.views.add( views[v].id );
			}
			if(callback) callback();
		}
	};
	
	View.prototype.data = function( data, callback ){
		var self = this;
		console.log('View Data');
		console.log(JSON.stringify(data));
		if( data ) self._data = data;
		else data = self.data;
		var target = self.container;
		
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
					var bgImage = "url('"+data[key]+"')";
					console.log(key+' -- '+bgImage);
					el.style.backgroundImage = bgImage;
				}
			}
			
			var widthEls = Array.prototype.slice.call( target.querySelectorAll('[data-width]') );
			
			while( widthEls.length > 0 ){
				var el = widthEls.shift();
				var key = el.getAttribute('data-width');
				//console.log(key);
				if( data[key] ){
					el.style.width = data[key];
				}
			}
			
			var heightEls = Array.prototype.slice.call( target.querySelectorAll('[data-height]') );
			
			while( heightEls.length > 0 ){
				var el = heightEls.shift();
				var key = el.getAttribute('data-width');
				//console.log(key);
				if( data[key] ){
					el.style.height = data[key];
				}
			}
			
		}else{
			console.log('Not Ready');
		}
		
	

	};
	
	View.prototype.render = function( path, callback ){
		
		var self = this;
		//console.log(path+'  '+self.path);
		if( self.busy || path == self.path ) return false;
		
		self.busy = true;
		self.path = path;
		
		self.pending = document.createElement('div');
		self.pending.className = 'view pending';
		//console.log('Created View wrapper');
		
		var onTransitionComplete = function(){
			//console.log('onTransitionComplete');
			self.pending.removeEventListener( 'transitionend', onTransitionComplete );
			self.template.visible();
			if(self.active){
				self.container.removeChild(self.active);
			}
			
			self.active = self.pending;
			self.active.className = 'view active';
			self.pending = null;
			self.busy = false;
		};
		
		
		//console.log('Calling Template '+path);
		self.template = new app.views.Template(  path );
		
		self.template.once('loaded',function(){
			//console.log('Self Loaded', self.template.uri );
			self.loading = false;
			self.pending.className = 'view pending active';
			self.template.attach( self.pending );
			//self.loaded();
			if(self._data) self.data();
			if(callback) callback();
		});
		
		self.container.appendChild( self.pending );
		self.pending.getBoundingClientRect();
		self.pending.addEventListener( 'transitionend', onTransitionComplete );
		
		
	};
	
	View.prototype.compile = function( path, callback ){
		
		
		
	};
	
	View.prototype.load = function( path, callback ){
		
		var self = this;
		
		self.loading = true;
		
		self.pending = self.inactive.shift();
		self.pending.className = 'view pending';
		self.template = new app.views.Template( path );

		self.template.on('loaded',function(){
			
			self.workers = self.template.workers;
			self.loading = false;
			self.template.renderIn( self.pending );
			
			console.log('Self Loaded', self.template.uri );
			self.loaded();
			self.pending.className = 'view pending active';
		});
		
		var onFullyVisible = function(){
			console.log('onFullyVisible');
			self.pending.removeEventListener('transitionend', onFullyVisible );
			self.pending.className = 'view active';
			if(self.active){
				self.active.className = 'view';
				self.inactive.push( exports.active );
			}
			self.active = self.pending;
			self.pending = null;
			if(callback) callback();
			
			return false;
		};
		
		self.pending.addEventListener( 'transitionend', onFullyVisible );
		return false;
	};
	
	exports.View = View;
	
	return exports;

});