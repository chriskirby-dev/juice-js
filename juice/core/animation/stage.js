define('animation.stage', ['animation/timeline', 'animation/body', 'browser', 'animation/properties' ], function( timeline, animationBody, browser, properties ){
	
	var exports = this.exports;
	var global = this.global;
	global.stage = global.stage || {};
	
	var transform = browser.supports('transform');
	
	exports.id = null;
	exports.ready = false;
	exports.height = null;
	exports.width = null;
	exports.center = null;
	
	exports.camera = new properties.Sprite();
	exports.camera.target = null;
	
	exports.viewer = null;
	
	exports.fps = null;
	exports.elements = {};
	exports.anchors = {};
	exports.bodies = [];
	exports._follow = null;
	
	exports.update = function( t ){
		for(var i=0;i<exports.bodies.length;i++)
			if(exports.bodies[i].object.update)
				exports.bodies[i].object.update( t );	
				
		if(exports.camera.target){
			var target = exports.camera.target;
			exports.camera.x = target.position.x-exports.camera.center.x;
			exports.camera.y = target.position.y-exports.camera.center.y;
		}
				
		return true;
	};
	
	exports.render = function( t ){
		for(var i=0;i<exports.bodies.length;i++)
			if(exports.bodies[i].object.render)
				exports.bodies[i].object.render( t );	
				
		if( exports.camera.hasMoved ){
			exports.el.style[transform] = 'translate3d( -'+exports.camera.x+'px, -'+exports.camera.y+'px, 0px)';
		}
				
		return true;
	};
	
	timeline.add( exports );
	
	exports.follow = function( id ){
		exports.camera.target = exports.elements[id];
		return null;
	};
	
	exports.set = function( id, w, h ){
		
		if(global.stage[id]){
			exports = global.stage[id];
			return true;
		}
		
		global.stage[id] = exports;
		exports.id = id+'-stage';
		
		exports.viewer = document.getElementById(id);
		if(!exports.viewer){
			exports.viewer = document.createElement('div');
			exports.viewer.id = id+'viewer';
			if(!parent) parent = document.getElementsByTagName('body')[0];
			parent.appendChild( exports.el );
		}
		
		exports.el = document.getElementById(exports.id);
		
		if(!exports.el){
			exports.el = document.createElement('div');
			exports.el.id = exports.id;
			exports.el.setAttribute('class', 'stage');
			exports.viewer.appendChild( exports.el );
		}
		
		
		
		
		if(w) exports.width = w, exports.el.style.width = w;
		if(h) exports.height = h, exports.el.style.height = h;
		
		updateSize(); 
		
		exports.ready = true;
		exports.emit('ready');
		console.log('stage set');
	};
	
	exports.anchor = function( pos, index ){
		console.log('stage anchor:: '+pos);
		if(exports.anchors[pos]) return exports.anchors[pos];
		var pl = document.createElement('div');
		pl.setAttribute('class', 'plot '+pos);
		if(index) pl.style.zIndex = index;
		exports.el.appendChild(pl);
		return pl;
	};
	
	exports.background = function( ){
		var pl = document.createElement('div');
	};
	
	exports.add = function( id, obj, fps ){
		var _body = { id: id, object: obj, active: false };
		if(fps) _body.fps = fps;
		exports.bodies.push(_body);
		//timeline.add( obj, fps );
		if(obj.stage) obj.stage( exports );
		if(!timeline.active) timeline.start();
	};
	
	exports.getObject = function( id ){
		for(var i=0;i<exports.bodies.length;i++){
			if( exports.bodies[i].id == id ){
				return exports.bodies[i].object;
			}
		}
		return null;
	};
	
	exports.addBody = function( element ){
		if(!exports.elements[element.id]){
			exports.elements[element.id] = element;
			//exports.elements[name]
			exports.el.appendChild(exports.elements[element.id].el);
		}
	};
	
	exports.element = function( name, w, h ){
		if(!exports.elements[name]){
			exports.elements[name] = animationBody.create( name, w, h );
			//exports.elements[name]
			exports.el.appendChild(exports.elements[name].el);
		}
		return exports.elements[name];
	};
		
	exports.remove = function( fn ){
		timeline.remove( fn );
	};
	
	var updateSize = function(){
		
		if(!exports.el) return false;
		
		exports.width = exports.el.offsetWidth;
		exports.height = exports.el.offsetHeight;
		exports.center = { x: exports.width/2, y: exports.height/2 };
		
		exports.camera.width = exports.viewer.offsetWidth;
		exports.camera.height = exports.viewer.offsetHeight;
		exports.camera.center = { x: exports.camera.width/2, y: exports.camera.height/2 };
		exports.camera.boundaries( 0, 0, exports.width - exports.camera.width, exports.height - exports.camera.height);
	};
	
	window.resize = updateSize;
	window.onload = updateSize;
	
	return exports;
	
}, { extend: 'events' });