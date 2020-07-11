define('view', ['dom', 'events'], function View( dom, Events ){
	
	var exports = this.exports;
	
	var global = this.global;
	global.indexes = global.indexes || {};
	
	exports.elements = {};
	exports.get = {};
	
	exports.createDom = function( element_str ){
		console.log('CREATE DOM', element_str );
		var elements = dom.create( element_str );
		return elements;
	};
	
	exports.set = function( name, elements, links ){
		var wrapper = document.createElement('div');
		wrapper.className = 'view-wrapper';
		exports.get[name] = exports.get[name] || {};
		
		if(typeof elements == 'string'){
			var dommap = dom.create( elements );
			if(dommap.elements){
				for( var mapped in dommap.map ){
					exports.get[name][mapped] = dommap.map[mapped];
				}
				wrapper.appendChild( dommap.elements );
			}else{
				wrapper.appendChild( dommap );
			}
		}
		
		exports.get[name].wrapper = wrapper;
		
	};

	
	return exports;
	
});