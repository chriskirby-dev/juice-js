define('display/template', ['http/xhr', 'display/parser'], function( xhr, parser ){
	
	exports.path = null;
	exports.stylesheets = [];
	exports.scripts = [];
	exports.loaded = false;
	exports.raw = null;
	exports.parsed = null;
	
	
	function _tmp( content ){
		var _tmp = document.createElement('div');
		_tmp.innerHTML = content;
		return _tmp;
	}
	
	 
	
	var parseHTML = function( raw, callback ){
    	
    	var contentReady = function(){
			console.log('Workers');
			//exports.cache[self.path] = self;
			
			if(self.stylesheets.length > 0){
				app.require( self.stylesheets, function(){
					if(callback) callback(  );
				});
			}else{
				if(callback) callback(  );
			}
		};
		
		var nextInsert = function(){
			if(tpls.length == 0) return contentReady();
			var container = tpls.shift();
			var path = container.getAttribute('data-tpl');
			app.display.template( path, function( tpl ){
				
			});
			
			/*
			var p = new DisplayTpl( path+'.html' );
			p.load(function(){
				self.workers = self.workers.concat( p.workers );
				next.appendChild( p.body );
				nextInsert();
			});
			*/
		};
		
		if( templates.length > 0 ){
			nextInsert();
		}else{
			contentReady();
		}

	};
	
	var initialize = function(){
		
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
	
	exports.load = function( callback ){
		
		if(exports.loaded){
			callback();
		}else{
			xhr.get( exports.path+'.html' ).success(function( raw ){
				exports.loaded = true;
				exports.parsed = parser.parse( raw );
				initialize();
				return false;
			}).fail(function(){
				callback( null );
				return false;
			});
		}
		return false;
	};
	
});