define('geom', [], function(){
	var exports = this.exports;

	
	var Vector = function(  /** x, y, z **/ ){
		console.log(arguments);
		var self = this;
		self.history = 1;
		self.dimentions = "xyzt".split('').slice( 0, arguments.length );
		
		self.init();
		
	};
	
	Vector.prototype.init = function(){
		
		var self = this;
		self.points = {};
		self.start = {};
		self.last = {};
		self.marks = {};
		self.changed = {};
		
		for(var i=0;i<self.dimentions.length;i++){
			var prop = self.dimentions[i];
			self.points[prop] = [];
			self.start[prop] = null;
			self.changed[prop] = false;
			self.initializeProperty( prop );
			if(arguments[i]) self[prop] = arguments[i];
		}

	};
	
	Vector.prototype.reset = function( id ){
		
		var self = this;
		self.init();
				
	};
	
	Vector.prototype.mark = function( id ){
		var self = this;
		var mark = { time: new Date().getTime(), point: {} };
		for(var d=0;d<self.dimentions.length;d++){
			var dim = self.dimentions[d];
			mark.point[dim] = self.points[dim][0];
		}
		console.log('Mark '+id);
		self.marks[id] = mark;
	};
	
	Vector.prototype.getMark = function( id ){
		var self = this;
		var mark = null ;
		
		if(self.marks[id]){
			
		
		mark = self.marks[id];
		
		mark.ago = (new Date().getTime() - mark.time)/1000;
		mark.change = {
			x: self.points.x[0] - mark.point.x,
			y: self.points.y[0] - mark.point.y
		};
		}
		return mark;
	};
	
	Vector.prototype.moveTo = function( x, y, z ){
		var self = this;
		console.log('Move To x: '+x+' y:'+y+' z:'+z);
		self.x = x;
		self.y = y;
		if(z != undefined) self.z = z;
		self.changed = true;
	};
	
	Vector.prototype.add = function( x, y, z ){
		var self = this;
		if(x) self.x = self.points.x[0] + x;
		if(y) self.y = self.points.y[0] + y;
		if(z) self.z = self.points.z[0] + z;
		self.changed = true;
	};
	
	Vector.prototype.change = function(){
		var self = this;
		var change = {};
		for(var d=0;d<self.dimentions.length;d++){
			var dim = self.dimentions[d];
			change[dim] = self.points[dim][0] - self.start[dim];
		}
		self.changed = false;
		return change;
	};
	
	Vector.prototype.onPropertyHasValue = function( prop ){
		var self = this;
		Object.defineProperty( self, prop, {
			configurable: true,
			set: function(v){
				self.points[prop].unshift( v );
				self.changed[prop] = self.changed = true;
				if( self.points[prop].length > self.history ){
					self.points[prop].pop();
				}
				return false;
			},
			get: function(){
				return self.points[prop][0];
			}
		});
		
		Object.defineProperty( self.last, prop, {
			set: function(){
				return false;
			},
			get: function(){
				return self.points[prop][1];
			}
		});
	};
	
	Vector.prototype.initializeProperty = function( prop ){
		var self = this;
		Object.defineProperty( this, prop, {
			configurable: true,
			set: function(v){
				self.start[prop] = v;
				self.points[prop].unshift( v );
				delete self[prop];
				self.changed[prop] = self.changed = true;
				self.onPropertyHasValue(prop);
				return false;
			},
			get: function(){
				return null;
			}
		});
	};
	
	exports.Vector = Vector;
	
	var Vector2D = function( x, y ){
		return new Vector( x, y );
	};
	
	exports.Vector2D = Vector2D;
	
	var Vector3D = function( x, y, z ){
		return new Vector( x, y, z );
	};
	
	exports.Vector3D = Vector3D;

	
	exports.vector = function( ){
		return new Vector2D('xyz');
	};
	
	return exports;
});
