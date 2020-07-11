define('animate/body', [ 'browser', 'math/trig', 'geom', 'utils', 'animation/physics', 'dom/canvas', 'animation/properties', 'dom', 'dom/css' ], function( browser, trig, geom, utils, physics, canvas, properties, dom, css ){
	
	var exports = this.exports;
	css.use('animation-body');
	css.append({
		'.stage': {
			position: 'absolute',
			width:'100%',
			height: '100%',
			top:0,
			left:0,
			perspective: '300',
			perspectiveOrigin: '50% 50%'
		},
		'div.animation-body-anchor': {
			position: 'absolute',
			
		},
		'div.animation-body-position': {
			position: 'absolute',
			transformStyle: 'preserve-3d'
		},
		'div.animation-body-rotation': {
			position: 'absolute',
			transform: 'rotate( 0deg )'
			
		},
		'div.animation-body-offset': {
			position: 'absolute',
			transform: 'translate( -50%, -50% )'
		},
		'div.animation-body': {
			position: 'relative',
		},
		'div.animation-body:before': {
			content:"",
			display:'block',
			position: 'absolute',
			background: '#000',
			width:'100%',
			height: '100%',
			top:0,
			left:0,
			opacity: 0.8

		}
		
	});
	
	var AnimationBody = function( id, options ){
		console.log('AnimationBody');
		var self = this;
		
		self.id = id;
		self.position = new geom.Vector3D(0,0,0);
		self.rotation = new geom.Vector3D(0,0,0);
		self.width = options.width;
		self.height = options.height;
		
		self.map = dom.create('div.animation-body-anchor@anchor > div.animation-body-position@position > div.animation-body-rotation@rotation > div.animation-body-offset@offset > div.animation-body@body').map;
		console.log(self.map);
		self.map.body.style.width = self.width+'px';
		self.map.body.style.height = self.height+'px';
		
		if(options.content){
			self.content = dom.create(options.content),
			self.map.body.appendChild(self.content);
		}
		
		if(options.canvas){
			self.canvas = canvas.create(id+'-canvas');
			self.canvas.size( self.width, self.height );
			self.map.body.appendChild(self.canvas.el);
		}
		
		self.el = self.map.anchor;
	};
	
	
	AnimationBody.prototype.update = function( ){
		
	};

	
	AnimationBody.prototype.render = function( ){
		var self = this;
		console.log('render body :: '+ self.position.y+' :: '+self.position.y+' :: '+self.position.z );
		
		self.map.position.style.transform = 'translate3d( '+self.position.x+'px,'+self.position.y+'px,'+self.position.z+'px )';
		self.position.changed = false;
		self.rotation.changed = false;
	};

	
	AnimationBody.prototype.anchor = function( /**/ ){
		
		var self = this;
		if( arguments.length == 1 && typeof arguments[0] == 'string'){
			var anchors = arguments[0].split(' ');
			if(anchors[0] == 'center'){
				anchors.reverse();
			}
			var top, left;
			
			for(var i=0;i<anchors.length;i++){
				var anchor = anchors[i];
				switch(anchor){
					case 'top':
						top = '0px';
					break;
					case 'bottom':
						top = '100%';
					break;
					case 'left':
						left = '0px';
					break;
					case 'right':
						left = '100%';
					break;
					case 'center':
						if(anchors.length == 1){
							top = '50%';
							left = '50%';
						}else if(left){
							top = '50%';
						}else if(top){
							left = '50%';
						}
					break;
				}
			}
			self.el.style.top = top;
			self.el.style.left = left;
			
		}else if(arguments.length > 1){
			self.el.style.top = arguments[0]+'px';
			self.el.style.left = arguments[1]+'px';
		}
	};
	
	exports.create = function( id, w, h ){
		return new AnimationBody( id, w, h );
	};
	
	return exports;

});