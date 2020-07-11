define('views/template', ['http/xhr', 'events', 'views/parser'], function( xhr, events, parser ){
	
	var exports = this.exports;
	var app = this.app;
	
	exports.cache = {};
	
	var ViewTemplate = function( options ){
		
		if(exports.cache[this.path]){
			console.log('Has Template Cache');
			var tpl = exports.cache[self.path];
			tpl.emit('loaded');
			return tpl;
		}
		events._extend(this);
		
		var self = this;
		self.path = null;
		if(typeof options == 'string'){
			self.path = options;
			options = null;
		}
		exports.cache[self.path] = self;
		self.initialized = false;
		self.workers = [];
		self.templates = [];
		
		console.log('View Template '+self.path);
		
		self.initialize();
	};
	/*
	ViewTemplate.prototype.initialize = function(){
		
		if(self.stylesheets.length > 0){
			app.require( self.stylesheets, function(){
				if(callback) callback(  );
			});
		}else{
			if(callback) callback(  );
		}
		var loadables = {};
		loadables.templates = Array.prototype.slice.call( exports.parsed.templates );
		loadables.stylesheets = Array.prototype.slice.call( exports.parsed.stylesheets );
		loadables.scripts = Array.prototype.slice.call( exports.parsed.scripts );
		
		var loadScripts = function(){
			
		};
		
		var loadStylesheets = function(){
			
		};
		
		var loadTemplates = function(){
			if(loadables.templates.length == 0){
				return false;	
			}
				var tpl = loadables.templates.shift();
				
				return false;
			}
		};
		loadTemplates();
	};
	*/ 
	ViewTemplate.prototype.compile = function( callback ){
		var self = this; 
		//console.log('COMPILE TEMPLATE '+self.path);
		var templates = Array.prototype.slice.call( self.parsed.templates );
		
		var onTemplateCompiled = function(){
			
			self.loadDependants(function(){
				//Template Dependants Loaded
				if( app.views.controllers[self.path] ){
					//console.log('Has Controller');
					self.controller = app.views.controllers[self.path];
					if(self.controller.initialize){
						self.controller.initialize();
					}
				}				
				if(callback) callback();
				return false;
			});

		};
		
		var loadNextTemplate = function(){
			if( templates.length == 0 ) return onTemplateCompiled();
			var template = templates.shift();
			//Process Template
		};
		
		
		if( templates.length > 0 ){
			//console.log(templates);
			loadNextTemplate();
		}else{
			onTemplateCompiled();
		}
		return false;
	};
	
	
	ViewTemplate.prototype.initialize = function(){
		var self = this; 
		console.log('ViewTemplate Initialize :: ' + self.path);
		var path = self.path;
		if( self.loaded ){
			callback();
		}else{
			//console.log(path+'.html');
			if(app.views.paths.tpl) path = app.views.paths.tpl + path;
			xhr.get( path+'.html' ).success(function( raw ){
				self.loaded = true;
				self.raw = raw;
				self.parsed = parser.parseRaw( raw );
				//console.log( self.parsed );
				self.compile(function(){
					self.emit('loaded');
				});
				return false;
			}).fail(function(){
				self.emit('error');
				return false;
			});
		}
		return false;
	};
	
	ViewTemplate.prototype.visible = function(){
		var self = this;
		if(self.controller && self.controller.visible){
			self.controller.visible();
		}
	};
	
	ViewTemplate.prototype.attach = function( container ){
		var self = this;
		
		
		var tpl = document.createElement('div');
		tpl.className = 'tpl';
		tpl.innerHTML = self.parsed.html;
		
		container.innerHTML = tpl.innerHTML;
		if(self.controller && self.controller.attached){
			self.controller.attached( container, function(){
				
			});
		}
		
		
	};
	
	
	ViewTemplate.prototype.loadDependants = function( callback ){
		var self = this;
		//console.log('loadDependants');
		var dependants = ['stylesheets','scripts'];
		var loadNextSet = function(){
			if(dependants.length == 0){
				if(callback) callback(  );
				return false;
			}
			var d = dependants.shift();
			//console.log(d);
			if(self.parsed[d] && self.parsed[d].length > 0){
				app.require( self.parsed[d], function(){
					loadNextSet(  );
				});
			}else{
				loadNextSet(  );
			}
		};
		loadNextSet();
		
	};

	
	exports.Template = ViewTemplate;
	
	return exports;

});