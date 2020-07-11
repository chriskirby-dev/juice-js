define('math.geom', function GeomBase(){
	
	var exports = this.exports;
	
	var vector = function(){
		
		var self = this;
		self.last = [];
		
		self.round = false;
		self.snap = function(){
			self.last = self.slice(0);
		}
		self.set = function(x,y,z){
			this[0] = x;
			this[1] = y;
			this[2] = z;
		}
		//var v = Array.prototype.slice.call(arguments, 0);
		Object.defineProperty( self, "x", {
			get : function(){ return this[0]; },
			set : function( _x ){ 
				this[0] = self.round ? Math.round( _x ) : _x; 
			}
		});
		
		Object.defineProperty( self, "y", {
			get : function(){ return this[1]; },
			set : function( _y ){ 
				this[1] = self.round ? Math.round( _y ) : _y; 
			}
		});

		Object.defineProperty( self, "z", {
			get : function(){ return this[2] ? this[2] : 0; },
			set : function( _z ){ 
				this[2] = self.round ? Math.round( _z ) : _z; 
			}
		});
		
		if( arguments.length > 0 )
		for(var i = arguments.length; i--; self.unshift( arguments[i] ));
	}
	
	vector.prototype = Array.prototype;
	
	var point = function(d){
		return d == '3d' ? { x: 0, y: 0, z: 0 } : { x: 0, y: 0 };
	}
	
	var vector3D = function( x, y, z ){
		return { x: (x?x:0), y: (y?y:0), z: (z?z:0) };
	}
	
	var vector2D = function( x, y ){
		return { x: (x?x:0), y: (y?y:0) };
	}
	
	exports.vector = function( dim, _round ){
		var v = ( dim == '2d' ? new vector(0,0) : new vector(0,0,0) );
		if(_round) v.round = true;
		return v;
		//return dim == '2d' ? new vector2D() : new vector3D();
	}
		
	exports.point = function( d ){
		return new point(d);
	}
	
	return exports;
	
});