define('dom/extend', ['browser', 'utils', 'events/touch'], function(browser, utils, touch ){
	
	var exports = this.exports;
	var wheel;
	
	if(HTMLElement.prototype.$){
		return false;
	}

	var getType = function( o, is_type ) {
		var t = Object.prototype.toString.call(o).split(' ').pop().replace(']', '').toLowerCase();
		return is_type ? is_type === t : t;
	};
	
	function empty( val ){
		if( val === undefined || val === null ) return true;
	}
	
	var getComputed = function ( prop ) {
		var style = window.getComputedStyle(this.node, null);
		return prop ? style.getPropertyValue(prop) : style;
	};
	
	var getComputedPosition = function () {
		var matrix = window.getComputedStyle(this.node, null), x, y;
		if ( this.options && this.options.useTransform ) {
			matrix = matrix[browser.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	};
	
	var removeNode = function(){
		this.node.parentElement.removeChild(this.node);
		return this;
	};
	
	var cloneNode = function(){
		return this.node.cloneNode(true);
	};
	
	var insertBefore = function( el ){
		this.node.parentElement.insertBefore( el, this.node );
		return this;
	};
	
	var insertAfter = function( el ){
		if(this.node.nextSibling){
			this.node.parentElement.insertBefore( el, this.node.nextSibling );
		}else{
			this.node.parentElement.appendChild( el );
		}
		return this;
	};
	
	var getSelector = function( absolute ){
		//var parents = this.parents();
		var selector;
		if(this.node.id){
			selector = '#'+this.node.id;
		}else if(this.node.className){
			selector = '.'+this.node.className;
		}else{
			selector = this.node.tagName.toLowerCase();
		}
		if(absolute && selector.indexOf('#') == -1){
			var parents = this.parents();
			while(selector.indexOf('#') == -1){
				var parent = parents.shift();
				selector = parent.$.selector()+' > '+selector;
			}
		}
		return selector;
	};
	
	var parentNodes = function( stopAt, params ){
		if(!stopAt) stopAt = document.body;
		params = params || {};
		var parents = [];
		var target = this.node;
		if(target === stopAt) return [];
		while(target.parentNode && target.parentNode !== stopAt){
			target = target.parentNode;
			if(params.nodeType && target.nodeType != params.nodeType.toUpperCase() ){
				continue;
			}
			if(params.tagName && target.tagName != params.tagName.toUpperCase() ){
				continue;
			}
			( params.reverse ? parents.unshift(target) : parents.push(target) );
		}
		return parents;
	};
	
	var nextNode = function(root){
		node = this.node;
		if(!node) return false;
		root = root || document.body;
		if (node.firstChild) return node.firstChild;
		if (node.nextSibling) return node.nextSibling;
		if (node===root) return null;
		while (node.parentNode){
			node = node.parentNode;
			if (node === root) return null;
			if (node.nextSibling) return node.nextSibling;
		}
		return null;
	};
	
	var prevNode = function(root){
		node = this.node;
		root = root || document.body;
		if (node.lastChild) return node.lastChild;
		if (node.previousSibling) return node.previousSibling;
		if (node===root) return null;
		while (node.parentNode){
			node = node.parentNode;
			if (node === root) return null;
			if (node.previousSibling) return node.previousSibling;
		}
		return null;
	};
	
	var replaceNode = function( newNode ){
		this.before(newNode);
		this.remove();
		return newNode;
	};
	
	var findCommon = function( node ){
		var parents1 = this.parents(document.body, { reverse: true });
		var parents2 = node.$.parents(document.body, { reverse: true });
		if (parents1[0] != parents2[0]) return null;
		var key = parents1.length > parents2.length ? parents1 : parents2;
		for(var i = 0; i < key.length; i++){
			if(parents1[i] !== parents2[i]) return parents1[i-1];
		}
	};
	
	var isDescendant = function( node ){
		var startNode = this.node;
		var found = false;
		while(!found && startNode.parentNode !== document.body){
			startNode = startNode.parentNode;
			if(startNode === node){
				found = true;
			}
		}
		return found;
	};
	
	var findFirst = function( selector ){
		
		var selectors = selector.split(' ');
		
		if( selector.charAt(0) == '#' && selector.indexOf(' ') === -1 ){
			return document.getElementById( selector.substring(1) );
		}else if( selector.charAt(0) == '.' ){
			return this.node.querySelector( selector );
		}if(document.querySelector){
			return this.node.querySelector( selector );
		}else{
			console.log('querySelector NOT Supported dom/slector');	
		}
		
	};
	
	var findAll = function( selector, context  ){
		if(document.querySelectorAll){
			return this.node.querySelectorAll( selector );
		}else{
			console.log('querySelectorAll NOT Supported dom/slector');
		}
		
	};

	function filterEls( elems, selector ){
		let filtered = Array.prototype.filter.call(elems, function(elem){ 
		return elem.matches(selector);
		});
		var fragment = document.createDocumentFragment();
		for( var i=0;i<filtered.length;i++) fragment.appendChild( filtered[i].cloneNode() );
		return fragment.childNodes;
	}
	
	var offset = function() {
		var curleft = curtop = 0;
      	var _x = 0, _y = 0;
		var el = this.node;
		while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
			_x += el.offsetLeft - el.scrollLeft;
			_y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}
   	 	return { top: _y, left: _x };
	};
	
	var mapElement = function( el ){
		var map = { attrs: {} };
		map.tag = el.tagName.toLowerCase();
		if(el.id) map.id = el.id;
		for (var i = 0, atts = el.attributes, n = atts.length, arr = []; i < n; i++){
		    map.attrs[atts[i].nodeName] = atts[i].value;
		}
		return map;
	};
	
	var HTMLExtend = function( el ){
		this.node = el;
		this.listeners = {};
		
	};
	
	HTMLExtend.prototype.node = null;
	HTMLExtend.prototype._data = {};
	HTMLExtend.prototype.next = nextNode;
	HTMLExtend.prototype.prev = prevNode;
	HTMLExtend.prototype.replaceWith = replaceNode;
	HTMLExtend.prototype.common = findCommon;
	HTMLExtend.prototype.isDescendant = isDescendant;
	HTMLExtend.prototype.selector = getSelector;
	HTMLExtend.prototype.offset = offset;
	HTMLExtend.prototype.remove = removeNode;
	HTMLExtend.prototype.before = insertBefore;
	HTMLExtend.prototype.after = insertAfter;
	HTMLExtend.prototype.parents = parentNodes;
	HTMLExtend.prototype.clone = cloneNode;
	HTMLExtend.prototype.findAll = findAll;
	HTMLExtend.prototype.find = findFirst;
	
	HTMLExtend.prototype.getComputed = getComputed;
	
	var clickHandeler = function( fn, el ){
		
		return function(event){
			//var target = event.target || event.srcElement;
			var target = null;
			if( el ){
				target = el;
			}
			if( !target ){
				target = (window.event)
                ? window.event.srcElement
                : event.target;
			}
			if ( event.pageX == null && event.clientX != null ) {
			  var doc = document.documentElement, body = document.body;
			  event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			  event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc   && doc.clientTop  || body && body.clientTop  || 0);
			}
			var pageX = event.pageX;
			var pageY = event.pageY;
			var eOffset = target.$.offset();
			
			event.$ = {
				target: target,
				pageX: pageX,
				pageY: pageY,
				targetX: pageX - eOffset.left,
				targetY: pageY - eOffset.top
			};
			
			fn.apply(target, [event]);
			
		};
		
	};
	
	var EventHandeler = function( fn, el ){
		
		var self = this;
		
		self.getTarget = function( e ){
			if( el ) return el;
			return (window.event) ? window.event.srcElement : event.target;
		};
		
		return function(event){
			
			var target = self.getTarget( event );
			
			if ( event.pageX == null && event.clientX != null ) {
			  var doc = document.documentElement, body = document.body;
			  event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			  event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc   && doc.clientTop  || body && body.clientTop  || 0);
			}
			var eOffset = target.$.offset();
			event.$ = {
				target: target,
				pageX: event.pageX,
				pageY: event.pageY,
				targetX: event.pageX - eOffset.left,
				targetY: event.pageY - eOffset.top
			};
			
			fn.apply(target, [event]);
			
			return false;
		};
	};
	
	HTMLExtend.prototype.emit = function( evType, data ){
		var el = this.node;
		var event = new Event(evType, data);
		el.dispatchEvent(event);
		return;
	};
	
	HTMLExtend.prototype.addListener = function( evType, fn, options ){
		
		if(!options) options = {};
		var el = this.node;
		var fnName = utils.getFnName(fn);
		var caught = false;
		var eFn;
		
		if( !this.listeners[evType] ) this.listeners[evType] = [];
		
		if(options.repeat){
			el.$.data('event-repeat', 0 );
			eFn = function( e ){
				var r = el.$.data('event-repeat')+1;
				el.$.data('event-repeat', r );
				fn.apply( this, [e] );
				if( r >= options.repeat ){
					el.$.removeListener( evType, eFn );
				}
			};
		}else{
			eFn = fn;
		}
				
		if(!caught){
			
			//console.log(this.node, evType, fn, useCapture );
			if (this.node.addEventListener){
				this.node.addEventListener(evType, fn, useCapture);
				this.listeners[evType].push({ type: evType, fn: eFn, capture: useCapture, fnName: fnName });
				return true;
			} else if (this.node.attachEvent){
				var r = this.node.attachEvent("on"+evType, fn);
				this.listeners[evType].push({ type: evType, fn: eFn, capture: useCapture, fnName: fnName });
				return r;
			} else {
				alert("Handler could not be attached");
			}
		}
		
	};
	
	HTMLExtend.prototype.once = function( evType, fn, useCapture ){
		return this.on( evType, fn, useCapture );
	};
	
	HTMLExtend.prototype.on = function( evType, fn, useCapture, options ){
		
		if(!options) options = {};
		var el = this.node;
		var fnName = utils.getFnName(fn);
		var caught = false;
		switch(evType){
			case 'swipeleft':
				touch.listenTo( el, evType, fn );
				caught = true;
			break;
			case 'swiperight':
				touch.listenTo( el, evType, fn );
				caught = true;
			break;
			case 'tap':
				touch.listenTo( el, evType, fn );
				caught = true;
			break;
			case 'touch':
				touch.listenTo( el, evType, fn );
				caught = true;
			break;
			case 'click':
			fn = new clickHandeler( fn, el );
			break;	
			case 'wheel':
				if(!wheel){
					require('ui/wheel', function( _wheel ){
						wheel = _wheel;
						wheel.listenTo(el, fn, useCapture);
					});	
				}else{
					wheel.listenTo(el, fn, useCapture);
				}
			break;	
			default: 
				fn = new EventHandeler( fn, el );
		}
		
		if(!this.listeners[evType]){
			this.listeners[evType] = [];
		}
		if(!caught){
			if(options.repeat){
				
			}
			//console.log(this.node, evType, fn, useCapture );
			if (this.node.addEventListener){
				this.node.addEventListener(evType, fn, useCapture);
				this.listeners[evType].push({ type: evType, fn: fn, capture: useCapture, fnName: fnName });
				return true;
			} else if (this.node.attachEvent){
				var r = this.node.attachEvent("on"+evType, fn);
				this.listeners[evType].push({ type: evType, fn: fn, capture: useCapture, fnName: fnName });
				return r;
			} else {
				alert("Handler could not be attached");
			}
		}
	};
	
	HTMLExtend.prototype.removeListener = function( event, fn ){
		var f = typeof fn == 'function' ? true : false;
		var removed = false;
		if(this.listeners[event]){
			var newE = [];
			for(var l=0;l<this.listeners[event].length;l++){
				if(f && this.listeners[event][l].fn !== fn ){
					newE.push(this.listeners[event][l]);
				}else if(this.listeners[event][l].fnName !== fn){
					newE.push(this.listeners[event][l]);
				}else{
					if(!f) fn = this.listeners[event][l].fn;
					console.log('Remove '+this.listeners[event][l].fnName);
					if (this.node.removeEventListener){
						this.node.removeEventListener(event, this.listeners[event][l].fn, this.listeners[event][l].capture);
						removed = true;
					} else if (this.node.detachEvent){
						this.node.detachEvent("on"+event, this.listeners[event][l].fn);
						removed = true;
					} else {
						alert("Handler could not be removed");
					}
					
				}
			}
			
			this.listeners[event] = newE;
		}
		
		return removed;
	};
	
	HTMLExtend.prototype.map = function( className, action ) {
		return mapElement( this.node );
	};
	
	HTMLExtend.prototype.class = function( className, action ) {
		var classstr = ' '+this.node.className+' ';
		if(action === 'toggle'){
			this.node.classList.toggle( className );
		}else
		if(action === false){
			if(classstr.indexOf(' '+className+' ') !== -1) this.node.classList.remove( className );
		}else if(action === true){
			 this.node.classList.add( className );
		}else if(!action){
			var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
			return re.test(classstr);
		}
	};
	
	HTMLExtend.prototype.attr = function(key, val){
		if( !empty(val) ){
			this.node.setAttribute(key, val);
			return this;
		}else{
			return this.node.hasAttribute(key) ? this.node.getAttribute(key) : false;
		}
	};
	
	HTMLExtend.prototype.content = function( html ){
		if(html){
			this.node.innerHTML = html;
			return this.node;
		}
		return this.node.innerHTML;
	};
	
	HTMLExtend.prototype.data = function( data, val ){
		var self = this;
		var n = this.node;
		if( data === undefined ){
			return n.dataset;
		}else if( getType( data, 'object' ) ){
			for( dtype in data ){
				n.$._data[dtype] = data[dtype];
				if(typeof data[dtype] == 'string' || typeof data[dtype] == 'number')
				n.$.attr('data-'+dtype, data[dtype]);
			}
		}else if( getType( data, 'string' ) ){
			if( val === undefined ){
				return n.dataset[data];
			}else{
				n.$.attr('data-'+data, val);
			}
		}
		
		return this;
	};
	
	HTMLExtend.prototype.store = function( data ){
		var n = this.node;
		for( dtype in data ){
			//this._data[dtype] = data[dtype];
			n.$.attr('data-'+dtype, data[dtype]);
		}
	};
	
	HTMLExtend.prototype.append = function(html){
		if(typeof html == 'string'){
			this.node.innerHTML += html;
		}else{
			this.node.appendChild(html);
		}
		return this;
	};
	
	HTMLExtend.prototype.prepend = function(html){
		if(typeof html == 'string'){
			this.node.innerHTML = html + this.innerHTML;
		}else{
			if(this.node.firstChild)
			this.node.insertBefore(html, this.node.firstChild);
			else
			this.node.appendChild(html);
		}
		return this;
	};
	
	HTMLExtend.prototype.wrapText = function( wrapper ){
		if(this.node.childNodes.length > 0){
			var node = this.node.firstChild;
			var wrap = wrapper.cloneNode();
			while( node ){
				if(node.nodeType===1){
					node.$.wrapText(wrapper);
				}else{
					node.$.wrap(wrap);
				}
				node = node.nextSibling;
			}
		}
	};
	
	HTMLExtend.prototype.wrap = function( wrapper, dir, stop ){

		if( !dir ){
			this.node.parentNode.insertBefore( wrapper, this.node );
			wrapper.appendChild(this.node);
		}else if( dir == 'left' ){
			//Add Wrapper Before
			this.node.parentNode.insertBefore( wrapper, this.node );
			wrapper.appendChild(this.node);
			//Target Wrapped
			var done = false;
			while( !done && wrapper.previousSibling ){
				if( wrapper.previousSibling === stop ) done = true;
					wrapper.insertBefore( wrapper.previousSibling, wrapper.firstChild );
			}
		}else if( dir == 'right' ){
				//Add Wrapper After
				this.node.parentNode.insertBefore( wrapper, this.node.nextSibling );
				wrapper.appendChild(this.node);
				var done = false;
				while( !done && wrapper.nextSibling ){
					if( wrapper.nextSibling === stop ) done = true;
					wrapper.appendChild( wrapper.nextSibling );
				}
			}
			
			return this;
		};
	
	HTMLExtend.prototype.unwrap = function(){

		var parent = this.node.parentNode;
		while(this.node.firstChild){
			this.node.parentNode.insertBefore( this.node.firstChild, this.node);
		}
		this.node.parentNode.removeChild(this.node);
		parent.normalize();
		return this;
	};
	
	
	

	
	Object.defineProperty(HTMLExtend.prototype, 'height', {
		get: function(){
			return this.node.offsetHeight || this.node.clientHeight;
		},
		set: function(h){
			this.style.height = h;
		}
	});
	
	Object.defineProperty(HTMLExtend.prototype, 'width', {
		get: function(){
			return this.node.offsetWidth || this.node.clientWidth;
		},
		set: function(w){
			this.style.width = w;
		}
	});
	
	Object.defineProperty(HTMLElement.prototype, '$', {
		get: function(){
			if(!this._$) this._$ = new HTMLExtend( this );
			return this._$;
		},
		set: function(){
			return false;
		}
	});
	
	
	
	var NodeExtend = function( node ){
		this.node = node;
	};
	
	NodeExtend.prototype.parents = parentNodes;
	
	NodeExtend.prototype.next = nextNode;
	NodeExtend.prototype.prev = prevNode;
	
	NodeExtend.prototype.remove = removeNode;
	NodeExtend.prototype.before = insertBefore;
	NodeExtend.prototype.after = insertAfter;
	
	NodeExtend.prototype.common = findCommon;
	
	NodeExtend.prototype.wrap = function( wrapper, dir, stop ){

		if( !dir ){
			this.node.parentNode.insertBefore( wrapper, this.node );
			wrapper.appendChild(this.node);
		}else if( dir == 'left' ){
			//Add Wrapper Before
			this.node.parentNode.insertBefore( wrapper, this.node );
			wrapper.appendChild(this.node);
			//Target Wrapped
			var done = false;
			while( !done && wrapper.previousSibling ){
				if( wrapper.previousSibling === stop ) done = true;
					wrapper.insertBefore( wrapper.previousSibling, wrapper.firstChild );
			}
		}else if( dir == 'right' ){
			//Add Wrapper After
			this.node.parentNode.insertBefore( wrapper, this.node.nextSibling );
			wrapper.appendChild(this.node);
			var done = false;
			while( !done && wrapper.nextSibling ){
				if( wrapper.nextSibling === stop ) done = true;
				wrapper.appendChild( wrapper.nextSibling );
			}
		}
		
		return this;
	};
	
	NodeExtend.prototype.splitText = function(){
			var txt = [], head = 0;
			var node = this.node;
			txt[txt.length] = node;
			for( var s=0;s<arguments.length;s++){
				node = node.splitText(arguments[s]-head);
				head += arguments[s];
				txt[txt.length] = node;
			}
			return txt;
	};
	
	Object.defineProperty(Node.prototype, '$', {
		get: function(){
			if(!this._$) this._$ = new NodeExtend(this);
			return this._$;
		},
		set: function(){
			
		}
	});
	
	var NodeListExtend = function( elements ){
		this.nodes = elements;
		
	};
	
	var HTMLCollectionExtend = function( elements ){
		this.nodes = elements;
		
	};
	
	HTMLCollectionExtend.prototype.on = function( evType, fn, useCapture ){
		for(var i=0;i<this.nodes.length;i++){
			//console.log(this.nodes[i]);
			this.nodes[i].$.on( evType, fn, useCapture );
		}
	};
	
	HTMLCollectionExtend.prototype.each = function( fn ){
		for(var i=0;i<this.nodes.length;i++){
			fn.apply( this.nodes[i], [ i, this.nodes[i] ] );
		}
	};
	
	HTMLCollectionExtend.prototype.toArray = function(){
		return Array.prototype.slice.call( this.nodes );
	};

	HTMLCollectionExtend.prototype.find = function( selector ){
		return filterEls( this.nodes, selector );
	};
	
	Object.defineProperty (HTMLCollection.prototype, '$', {
		get: function(){
			if(!this._$) this._$ = new HTMLCollectionExtend(this);
			return this._$;
		},
		set: function(){
			return false;
		}
	});
	
	var NodeListExtend = function( nodes ){
		var self = this;
		self.nodes = nodes;
		var allowed = ['on','once','class'];
		
		var Applier = function( fnn, args ){
			return function(){
				self.applyToAll( fnn, arguments );
			};
		};
		
		while(allowed.length > 0){
			var fnn = allowed.shift();
			self[fnn] = new Applier( fnn );
		}
		
	};
	
	NodeListExtend.prototype.applyToAll = function( fName, args ){
		for(var i=0;i<this.nodes.length;i++){
			//console.log(this.nodes[i]);
			this.nodes[i].$[fName].apply(this.nodes[i].$, args );
		}
	};
	
	NodeListExtend.prototype.each = function( fn ){
		for(var i=0;i<this.nodes.length;i++){
			var node = this.nodes[i];
			fn.apply(node, [i]);
		}
	};
	
	NodeListExtend.prototype.find = findFirst;

	NodeListExtend.prototype.filter = function( selector ){
		return filterEls( this.nodes, selector );
	};
	
	Object.defineProperty(NodeList.prototype, '$', {
		get: function(){
			if(!this._$) this._$ = new NodeListExtend(this);
			return this._$;
		},
		set: function(){
			
		}
	});

	return exports;

}, { persistant: true });