define('dom', ['dom/selector', 'utils'], function( selector, utils ){
	
	DOM = this.exports;
	var _extends = null;
	
	DOM.extend = function(_extend){
		if(!_extends) _extends = {};
		for(prop in _extend){
			_extends[prop]	= _extend[prop];
		}
	};
	
	var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';
	
	var map = {
		option: [1, '<select multiple="multiple">', '</select>'],
		optgroup: [1, '<select multiple="multiple">', '</select>'],
		legend: [1, '<fieldset>', '</fieldset>'],
		thead: [1, '<table>', '</table>'],
		tbody: [1, '<table>', '</table>'],
		tfoot: [1, '<table>', '</table>'],
		colgroup: [1, '<table>', '</table>'],
		caption: [1, '<table>', '</table>'],
		tr: [2, '<table><tbody>', '</tbody></table>'],
		td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
		th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
		col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
		_default: [0, '', '']
	};
	
	function DomList( nl ){ 
	
		var self = this;
		
	}
	
	DomList.prototype = Array.prototype;
	
	
	DOM.$ = function( e ){
		return new DomList( [e] );
	};
	
	DOM.findAll = function( s, c ){
		return new DomList( selector.findAll( s, c ) );
	};
	
	var parseSelector = function(selector){

		var id, attrs, classes, content, mapped_id;

		if(selector.charAt(0) == '\"'){
			return { element: document.createTextNode(selector.replace(/"/g, '')) };
		}
	//	console.log(selector);
		if(selector.indexOf('@') != -1){
			mapped_id = selector.match(/@([a-zA-Z0-9\-\_]+)/g)[0].replace('@', '');
			//console.log(mapped_id);
			selector = selector.replace('@'+mapped_id, '');
		}
		
		if(selector.indexOf('#') != -1){
			id = selector.match(/#([a-zA-Z0-9\-\_]+)/g)[0].replace('#', '');
			selector = selector.replace('#'+id, '');
		}
		
		if(selector.indexOf('[') != -1){
			attrs = selector.match(/\[(.*?)\]/);
			//console.log(attrs);
		}
		
		if(selector.indexOf('.') != -1){
			classes = selector.match(/\.([a-zA-Z0-9\-\_]+)/g);
			for(var i=0;i<classes.length;i++){
				selector = selector.replace(classes[i], '');
			}
		}

		if(selector.indexOf('"') != -1){
			content = selector.match(/"(.*?)"/)[1];
			selector = selector.replace(/"(.*?)"/g, '');
		}
		
		var tmp = document.createElement(selector);
		
		if(id) tmp.id = id;

		if(classes){
			tmp.className = classes.join(' ').replace('.','');
		}
		
		if(content){
			tmp.innerHTML = content;
		}
		
		return { element: tmp, mapped_id: mapped_id };
	};
	
	DOM.keys = function( elements ){
		var nodes;
		switch(utils.type(elements)){
			case 'htmlelement':
			nodes = [elements];
			break;
		}
		//console.log(utils.type(elements));
	
		return nodes.map(function( element ){
			var key = element.id || element.className;
			return { element: element, key: key };
		});
	};
	
	DOM.create = function( string, wrapEl ){
		
		var dimentions = null;
		var model = {};
		//var parts = string.split(' ');
		var parts = string.match(/(?:[^\s"]+|"[^"]*")+/g);		
		var mapped = {};
		
		var tmp = document.createElement('div');
		var root = tmp;
		
		if(string.indexOf('"') != -1){
			//var c = string.match( /"(.*?)"/g)[0];
			//var s = selector.replace(/"(.*?)"/g, '');
		}
		
		while(parts.length > 0){
			var parsed = new parseSelector( parts.shift() );
			
			var item = parsed.element;
			if(parsed.mapped_id){
				mapped[parsed.mapped_id] = item;
			}

			root.appendChild( item );
			switch(parts[0]){
				case '>':
				parts.shift();
				root = item;
				break;
				case '<':
				parts.shift();
				root = root.parentNode;
				break;
				case '<<':
				parts.shift();
				root = root.parentNode.parentNode;
				break;
				case '"':
				var str = [];
				str.push( parts.shift() );
				while(parts[0].charAt(parts[0].length) != '"'){
					str.push( parts.shift() );
				}
				str.push( parts.shift() );
				parts[0] = str.join(' ');
				break;
			}
			
		}
		var nodes = tmp.childNodes.length > 1 ? tmp.childNodes : tmp.firstChild;
		//console.log('MAPPED', mapped);
		
		if(Object.keys(mapped).length > 0){
			return { elements: nodes, map: mapped };
		}else{
			return nodes;
		}
		
	};
	
	DOM.find = function( s, c ){
		var el = selector.find( s, c );
		return el ? new DomList( [el] ) : new DomList( );
	};
	
	return DOM;
	
});