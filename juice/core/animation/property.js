define('animation.property', [], function AnimationProperty(){
	
	var exports = this.exports;
	var pi = Math.PI;
		
	function NumericProperty( val ){
		
		this._value = null;
		
		Object.defineProperty(this, "value", {
			get : function () {
				console.log('get');
				return Math.min(this.MAX_VALUE, this._value);
			},
			set : function (val) {
				console.log('set');
				this._value = val;
			}
		});
		
	}
	
	//NumericProperty.prototype = Array.prototype;
	//Sprite.prototype = Object.create(Product.prototype);

	function Angle( val ){
		
		var self = this;
		self.val = val || null;
		self._changed = true;
		self.units = 'degrees';
		self.offset = 0;
		
		self.toRadians = function(){
			return self.units == 'degrees' ? self.val * (pi/180) : self.val;
		};
			
		self.toDegrees = function(){
			return self.units == 'radians' ? self.val * (180/pi) : self.val;
		};
		
		self.velocity = function(){
			if(!self.last) return 0;
			return self.last - self.val;
		};
		
		self.rotate = function( v, radians ){
			if( v == 0 ) return false;
			//console.log(this.val);
			if( radians ) v = v * (pi/180);
			self.last = self.val;
			//console.log(v);
			self.val += v;
			
			self._changed = true;
		};
		
		Object.defineProperty( this, "changed", {
			get : function(){ 
				if(self._changed){
					self._changed = false;
					return true;
				}
				return false;
			}
		});
		
		Object.defineProperty( this, "value", {
			get : function(){ return self.offset + self.val; },
			set : function( v ){
				if( v === self.val ) return false;
				self.last = self.val;
				self.val = v;
				self._changed = true;
				return true;
			}
		});
		
	}
	
	Angle.prototype = Object.prototype;
	
	
	
	function aNumber( val ){
		
		var self = this;
		if( !val ) val = 0;
		this[0] = val;
		this._keep = 2;
		this._changed = true;
		this.max = null;
		
		self.add = function( v ){
			if(v == 0) return false;
			v = this[0] + v;
			if(self.max) v = Math.min( v, self.max );
			this.unshift( v );
			this.splice( this._keep ); 
			this._changed = true;
		};
		
		Object.defineProperty( this, "changed", {
			get : function(){ 
				if(self._changed){
					self._changed = false;
					return true;
				}
				return false;
			}
		});
		
		Object.defineProperty( this, "last", {
			get : function(){ return this[1]; },
			set : function(){ return false; }
		});
		
		Object.defineProperty( this, "value", {
			get : function(){ return this[0]; },
			set : function( v ){ 
				if(self.max) v = Math.min( v, self.max );
				self.unshift( v );
				self.splice( self._keep ); 
				if( v != this[1] ) self._changed = true;
			}
		});
	}
	
	aNumber.prototype = Array.prototype;
	
	
	function Vector2D(){
		
		var self = this;
		self.round = false;
		self._changed = true;
		self._min = {};
		self._max = {};
		self.value = { x: (arguments[0] ? arguments[0] : 0), y: (arguments[1] ? arguments[1] : 0), z: (arguments[2] ? arguments[2] : 0) };
		self.last = { x: 0, y: 0, z: 0 };
		/*
		self.force = function( angle , force ){
			Math.cos( radians ) * rocket.power
			Math.sin( radians ) * rocket.power
		}
		*/
		
		self.max = function(x,y){
			if(x) self._max.x = x;
			if(y) self._max.y = y;
		};
		
		self.min = function(x,y){
			if(x) self._min.x = x;
			if(y) self._min.y = y;
		};
		
		self.delta = function(){
			
			return { x: self.value.x - self.last.x, y: self.value.y - self.last.y, z: self.value.z - self.last.z};
		};
		
		self.set = function(x,y){
			if( self.value.x == x && self.value.y == y ) return false;
			self.last = { x: self.value.x, y: self.value.y };
			self.value = { x: x, y: y };
			//self._changed = true;
		};
		
		self.add = function(x,y){
			if( x == 0 && y == 0 ) return false;
			self.last = { 
				x: self.round ? (0.5 + self.value.x) | 0 : self.value.x, 
				y: self.round ? (0.5 + self.value.y) | 0 :  self.value.y
			};
			self.value.x += x;
			self.value.y += y;
			if(self.round){
				if( (0.5 + self.value.x) | 0 != self.last.x  || (0.5 + self.value.y) | 0 != self.last.y ){
					self._changed = true;
				}
			}else{
				self._changed = true;
			}
			
		};
		
		Object.defineProperty( this, "x", {
			get : function(){ 
				if(self._min.x && self._min.x > self.value.x){
					self.value.x = self._min.x;
				}else if(self._max.x && self._max.x < self.value.x){
					self.value.x = self._max.x;
				}
				return self.round ? (0.5 + self.value.x) | 0 : self.value.x; 
			},
			set : function(v){ 
				if( self.value.x === v ) return false;
				self.last.x = self.round ? (0.5 + self.value.x) | 0 : self.value.x;
				self.value.x = v;
				self._changed = self.round ? ( self.last.x == (0.5 + v) | 0 ? false : true ) : true;
				return false;
			}
		});
		
		Object.defineProperty( this, "y", {
			get : function(){ 
				if(self._min.y && self._min.y > self.value.y){
					self.value.y = self._min.y;
				}else if(self._max.y && self._max.y < self.value.y){
					self.value.y = self._max.y;
				}
				return self.round ? (0.5 + self.value.y) | 0 : self.value.y; 
			},
			set : function(v){ 
				if( self.value.y === v ) return false;
				self.last.y = self.round ? self.last.y == (0.5 + self.value.y) | 0  : self.value.y;
				self.value.y = v;
				self._changed = self.round ? ( self.last.y == (0.5 + v) | 0 ? false : true ) : true;
				return false;
			}
		});
		
		Object.defineProperty( this, "changed", {
			get : function(){ 
				if(self._changed){
					self._changed = false;
					return true;
				}
				return false;
			}
		});
	
	}	
		
	Vector2D.prototype = Object.prototype;
	
	function Int( val ){
		
		this.val = val;
		
		 this.__defineGetter__("value", function(){
			return this.val;
		});
	   
		this.__defineSetter__("value", function(val){
			this.val = val;
		});
		
		return this.value;
		
	}
		
	Int.prototype.toString = function GetInt(){
		return '$$$$'+Math.round(this.value);
	};
	//var int = new Int(100.987654);
	//var v = int;
	//console.log(v+'');
	/*
	var Int = {
		val: 1000.5554,
		valueOf: function(){
			return Math.round(this.val);
		}
	}
	*/
	//var int = new Int(100.987654);
	//int = 200.5564;
	//console.log(Int*1);
	
	
	
	function Sprite(){
		
		var self = this;
		this.element = null;
		this.width = null;
		this.height = null;
		this._moved = false;
		this.changes = { position: { x: null, y: null, z: null } };
		this._last = { x: null, y: null, z: null };
		this._position = {
			current: { x: null, y: null },
			last: { x: null, y: null },
			changes: { x: null, y: null }
		};
		this._boundaries;
		
		this.boundaries = function( minX, minY, maxX, maxY ){
			this._boundaries = { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
		};
		
		this.moveTo = function(x,y){
			if( self._position.x == x && self._position.y == y ) return false;
			self._last = { x: self._position.x, y: self._position.y };
			self._position = { x: x, y: y };
			self._changed = true;
		};
		
		this.move = function(x,y){
			if( x == 0 && y == 0 ) return false;
			self._last = { x: self._position.x, y: self._position.y };
			self._position.x += x;
			self._position.y += y;
			self._changed = true;
		};
		
		Object.defineProperty( this, "x", {
			
			get : function(){ 
				return self.round ? (0.5 + self._position.x) | 0 : self._position.x; 
			},
			set : function(v){ 
				if( self._position.x === v ) return false;
				self._last.x = self._position.x;
				self._position.x = v;
				if(self._boundaries){
					self._position.x = Math.min( self._boundaries.max.x, 
						Math.max( self._boundaries.min.x, self._position.x ));
				}				
				self._moved = true;
				return false;
			}
		});
		
		Object.defineProperty( this, "y", {
			get : function(){ 
				return self.round ? ( 0.5 + self._position.y ) | 0 : self._position.y; 
			},
			set : function(v){ 
				if( self._position.y === v ) return false;
				self._last.y = self._position.y;
				self._position.y = v;
				if(self._boundaries){
					self._position.y = Math.min( self._boundaries.max.y, 
						Math.max( self._boundaries.min.y, self._position.y ));
				}	
				self._moved = true;
				return false;
			}
		});
		
		Object.defineProperty( this, "hasMoved", {
			get : function(){ 
				if(self._moved){
					self._moved = false;
					return true;
				}
				return false;
			}
		});
		
	
		this.angle = new Angle();
		
	}
	
	var aVector3D = function(){
		var self = this;
	
	
	};
	
	
	
	exports.Sprite = Sprite;
	
	exports.Vector2D = Vector2D;
	
	exports.Number = aNumber;
	
	exports.Angle = Angle;
	
	exports.Int = Int;
	
	return exports;
	
});