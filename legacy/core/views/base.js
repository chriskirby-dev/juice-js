define('views', ['views/view', 'views/template'], function( ViewClass, templates ){
	
	var exports = this.exports;
	var app = this.app;
	
	
	app.views = exports;
	exports.paths = {};
	exports.cache = {};
	exports.controllers = {};
	
	var Template = templates.Template;
	var View = ViewClass.View;
	
	exports.Template = Template;
	exports.View = View;
	
	exports.render = function( id ){
		var view = exports.get(id);
		if( view ){
			
			
		}
	};
	
	exports.get = function( id, options ){
		console.log('GET View '+id);
		if (exports.cache[id]){
			//View Cache Exists
			return exports.cache[id];
		}else {
			var container = document.getElementById( id );
			if( container ){
				//View Container Exists
				exports.cache[id] = new View( id );
				return exports.cache[id];
			}else{
				return null;
			}
		}
	};
	
	exports.create = function( id, options ){
		
		var container = document.getElementById( id );
		
		if( container ){
			//View Container Exists
			
		}else{
			
		}
		
	};
	
	exports.addController = function( controller ){
		console.log('Add Controller'+controller.path);
		exports.controllers[controller.path] = controller;
		return false;
	};
	
	var styleWrapper = document.createElement('div');
	styleWrapper.className = '';
	
	return exports;
	
});