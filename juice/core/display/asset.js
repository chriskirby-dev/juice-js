define('display/asset', ['http/xhr', 'events'], function( xhr, events ){
	
	var exports = this.exports;
	var app = this.app;
	
	var head = document.getElementsByTagName('head')[0];
	exports.cache = {};

	exports.uri = null;
	

	function tmp( content ){
		var _tmp = document.createElement('div');
		_tmp.innerHTML = content;
		return _tmp;
	}
	
	function getElementContent( tag, content ){
		var regex = new RegExp('<'+tag+'[^>]*>([\w|\W]*)<\/'+tag+'>', 'im');
		var matches = content.match(regex);
		if( matches ){
			return matches[1].trim();
		}else{
			return null;
		}
	}
	
	function loadTemplate(){
		
	}
	
	function DisplayTpl( path ){
		var self = this;
		
		if(exports.cache[path]){
			
		}
		self.stylesheets = [];
		self.scripts = [];
		
		self.path = path;
		self.raw = null;
		
		if(window.cordova.platformId = 'browser'){
			self.uri = app.root + self.path;
		}else{
			self.uri = self.path.replace('app-root/', app.root );
		}
		console.log('Template '+self.uri);
		
	}
	
	DisplayTpl.prototype.parse = function( callback ){
		console.log('Parse');
		var self = this;
		
		var  _tmp = {};
		
		_tmp.head = tmp( self.raw.match(/<head[^>]*>([\w|\W]*)<\/head>/im)[1].trim() );
		
		if( _tmp.head.querySelector('title') ){
    		self.title = _tmp.head.querySelector('title').innerText;
    	}
    	
    	var sheets = _tmp.head.querySelectorAll('link[rel="stylesheet"]');

    	for( var i=0;i<sheets.length;i++ ){
    		self.stylesheets.push( sheets[i].href );
    	}
    	
    	var scriptTags = _tmp.head.querySelectorAll('script[src]');
    	
	    for( var i=0;i<scriptTags.length;i++ ){
    		var map = scripts[i].$.map();
    		self.scripts.push( map );
    	}
		_tmp.head = null;
		
		
		/***********************/
		/*** Parse Content *****/
		/***********************/
		self.body = tmp( self.raw.match(/<body[^>]*>([\w|\W]*)<\/body>/im)[1].trim() );
		var workers = Array.prototype.slice.call( self.body.querySelectorAll('[data-worker]') );
		
		self.workers = workers.map(function(el){
			return el.getAttribute('data-worker');
		});
		
		var templates = Array.prototype.slice.call( self.body.querySelectorAll('[data-tpl]') );
		
		var contentReady = function(){
			console.log('Workers');
			exports.cache[self.path] = self;
			
			if(self.stylesheets.length > 0){
				app.require( self.stylesheets, function(){
					if(callback) callback(  );
				});
			}else{
				if(callback) callback(  );
			}
		};
		
		var nextInsert = function(){
			if(templates.length == 0) return contentReady();
			var next = templates.shift();
			var path = next.getAttribute('data-tpl');
			var p = new DisplayTpl( path+'.html' );
			p.load(function(){
				self.workers = self.workers.concat( p.workers );
				next.appendChild( p.body );
				nextInsert();
			});
		};
		
		if( templates.length > 0 ){
			nextInsert();
		}else{
			contentReady();
		}
		
	};
	
	DisplayTpl.prototype.runWorkers = function( callback ){
		var self = this;
		console.log('Run Workers '+self.uri);
		if(self.workers.length > 0){
			var workers = Array.prototype.slice.call(self.workers);
			var loadWorker = function(){
				if(workers.length == 0){
					if(callback) callback(  );
					return false;
				} 
				var worker = workers.shift();
				if( app.display.workers[worker] ){
					console.log('Worker '+worker);
					app.display.workers[worker].apply( self, [loadWorker] );
				}else{
					require('/lib/workers/'+worker).then(function( libWorker ){
						loadWorker();
					});
				}
			};
			loadWorker();
		}else{
			if(callback) callback();
		}
	};
	
	DisplayTpl.prototype.load = function( callback ){
		
		var self = this;
		if( self.raw ){
			self.parse( callback );
		}else{
			console.log('GET '+self.uri );
			xhr.get( self.uri+'.html' ).success(function( raw ){
				self.raw = raw;
				self.parse( callback );
			}).fail(function(){
				callback( null );
			});
		}
		return false;
	};
	
	DisplayTpl.prototype.content = function( callback ){
		return this.body.innerHTML;
	};
	
	DisplayTpl.prototype.renderIn = function( el ){
		var self = this;
		el.innerHTML = this.content();
		var applyStyle = function(  ){
			require( self.stylesheets, function(){
				//initializeViews();
			});
		};
		applyStyle();
		
	};
	
	exports.Tpl = DisplayTpl;
	
	function DisplayAsset( id, tpl ){
		
		var self = this;
		console.log(id);
		var target = document.getElementById( id );
		self.tpl = tpl || target.getAttribute('data-tpl') || null;
		
		self.title = null;
		self.scripts = [];
		self.stylesheets = [];
		self.target = target || null;
		
		
		
	}

	DisplayAsset.prototype.appendTo = function( parent ){
		var self = this;
		console.log( 'Append:: '+this.content());
		parent.innerHTML = this.content();
		
	};
	
	
	DisplayAsset.prototype.render = function( callback ){
		
		var self = this;
		
		var renderContent = function(){
			
			if(self.workers.length == 0){
				if(callback) callback();
				return false;
			}
			
			var workerEl = self.workers.shift();
			var worker = workerEl.getAttribute('data-worker');
			var views = Array.prototype.slice.call( self.target.querySelectorAll('.view-pane') );

			var completeCB = function(){
				renderContent();
			};
						
			app.display.workers[worker].apply( workerEl, [ completeCB ] );
			return false;
		};
		
		var initializeViews = function(  ){
			var views = Array.prototype.slice.call( self.target.querySelectorAll('.view-pane') );
			if(views.length > 0){
				for(var v=0;v<views.length;v++){
					app.display.views.add( views[v].id );
				}
				if(callback) callback();
			}
		};
		
		var applyStyle = function(  ){
			require( self.template.stylesheets, function(){
				initializeViews();
			});
		};
				
		
		console.log('RENDER');
		if(self.tpl){
			self.template = new DisplayTpl( self.tpl );
			self.template.load(function(){
				console.log(self.template);
				self.target.innerHTML = self.template.content();
				applyStyle();
			});
		}
		
		return;
	};
		
	exports.DisplayAsset = DisplayAsset;

	
	
	return exports;
});