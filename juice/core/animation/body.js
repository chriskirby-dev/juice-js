define('animation.body', [ 'browser', 'math/trig', 'math/geom', 'utils', 'animation/physics', 'dom/canvas', 'animation/properties' ], function( browser, trig, geom, utils, physics, canvas, properties ){
	
	var exports = this.exports;
	exports.el = null;
	var transform = browser.supports('transform');
	
	
	var AnimationBody = function( id, w, h ){
		
		var self = this;
		
		self.isPhysics = function(){
			utils.inherits( exports, physics );
		};
				
		self.el = document.createElement('div');
		self.el.appendChild(document.createElement('div'));
		self.el.id = id;
		self.el.classList.add('animation-object');
		self.el.firstChild.classList.add('object-body');
		self.el.style.position = 'absolute';
		
		if(w) self.width = w;
		if(h) self.height = h;
		
		self._forces = [];
		self._speed = 0;
		self.el.style.width = self.width+'px';
		self.el.style.height = self.height+'px';
		
		self.inner = document.createElement('div');
		self.inner.classList.add('animation-body-inner');
		self.el.firstChild.appendChild(self.inner);
		
		self.graphic = document.createElement('div');
		self.graphic.classList.add('animation-body-graphic');
		self.inner.appendChild(self.graphic);
		
		self.canvas = canvas.create(id+'-canvas');
		self.canvas.size(self.el.style.width, self.el.style.height);
		
		self.graphic.appendChild(self.canvas.el);
		self._scale = null;
		var trans = [];
	
		self.position = new properties.Vector2D(0,0);
		self.rotation = new properties.Angle();
	
		self.radius = 15; // 1px = 1cm
		self.tilt = 0;
		self.changed = false;
		//bounciness
		self.restitution = -0.7;
		self.rotationOffset = 0;
		//self.acceloration = new properties.Vector2D(0,0);
		self.velocity = new properties.Vector2D(0,0);
		
		self.angularForce = function( degrees, force ){
			radians = degrees * (Math.PI/180);
			self.velocity.add( Math.cos( radians ) * force, Math.sin( radians ) * force );
		};
		
		self.front = function( degree ){
			self.rotationOffset = degree;
			//self.inner.style[transform] = 'translate3d(0,0,0) rotate('+degree+'deg)';
		};
		
		self.addForce = function( force ){
			self.velocity.add( force, force );
		};
				
		self.speed = function(){
			return Math.sqrt( self.velocity.x * self.velocity.x + self.velocity.y * self.velocity.y );
		};
		
		self.angle = function(){
			return Math.atan2( self.velocity.x, self.velocity.y );
		};
		
		self.scale = function( scaleX, scaleY ){
			var scale = scaleX;
			if(scaleY) scale += ', '+scaleY;
			self._scale = scale;
		};
		
		self.friction = function( f ){
			console.log('friction '+f);
			var speed = Math.sqrt( self.velocity.x * self.velocity.x + self.velocity.y * self.velocity.y );
			
			console.log('start speed '+speed);
			//speed = Math.min( speed, self.maxSpeed);
			//var angle = Math.atan2( self.velocity.x, self.velocity.y );
			var angle = self.rotation.toRadians();
			speed *= (1-f);
			
			console.log('speed '+speed+' :: angle '+angle);
			self.velocity.x = Math.cos( angle ) * speed;
			self.velocity.y = Math.sin( angle ) * speed;
		};
		
		self.depth = function( d ){
			self.el.style.zIndex = d;
		};
		
		self.anchor = function(){
			console.log(arguments);
			if(arguments.length > 1){
				self.el.style.marginTop = arguments[0]+'px';
				self.el.style.marginLeft = arguments[1]+'px';
			}else{
				var anchors = arguments[0].split(' ');
				if(anchors.indexOf()){
					
				}
				for(var i=0;i<anchors.length;i++){
					var anchor = anchors[i];
					switch(anchor){
						case 'top':
							self.el.style.marginTop = '0px';
						break;
						case 'bottom':
							self.el.style.marginTop = -self.height+'px';
						break;
						case 'left':
							self.el.style.marginLeft = '0px';
						break;
						case 'right':
							self.el.style.marginLeft = -self.width+'px';
						break;
						case 'center':
							if(anchors.length == 1){
								self.el.style.marginTop = -self.height/2+'px';
								self.el.style.marginLeft = -self.width/2+'px';
							}
						break;
					}
				}
				
			}
		};
		
		self.move = self.position.add;
					
		self.moveTo = self.position.set;
		
		self.rotate = self.rotation.rotate;
		
		self.apply = function(){
			
			var translate = "";
			
			translate += 'translate3d('+self.position.x+'px, '+self.position.y+'px, 0px )';
			
			if(self._scale) translate += ' scale('+self._scale+')';
			
		
			
			if( self.position.changed ){
				
				self.el.style[transform] = translate;
			}else{
				//console.log('Not Changed');	
			}
			
			if( self.rotation.changed ){
				self.el.firstChild.style[transform] = 'translate3d(0,0,0) rotate('+(self.rotation.value+self.rotationOffset)+'deg)';
			}
			
		};
		
		self.time = function( time ){
			
		};
		
	//	self.rotate(0);

	};
	
	
	exports.create = function( id, w, h ){
		return new AnimationBody( id, w, h );
	};
	
	return exports;
	
});