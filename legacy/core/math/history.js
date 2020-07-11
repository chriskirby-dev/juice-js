define('math.history', function MathHistory(){
	
	var exports = this.exports;
	
	var HistoryProp = function( def ){
		
		if(!def) def = null;
		this[0] = def;
		this._keep = 2;
		this.changed = false;
		
		this.history = function( i ){
			return this[i] ? this[i] : null;
		}
		
		Object.defineProperty( this, "last", {
			get : function(){ return this[1]; },
			set : function(){ return false; }
		});
		
		Object.defineProperty( this, "value", {
			get : function(){ 
				this.changed = false;
				return this[0]; 
			},
			set : function( v ){ 
				this.unshift( v );
				this.splice( this._keep ); 
				this.changed = true;
			}
		});
		
	}
	
	HistoryProp.prototype = Array.prototype;
	
	var CreateHistory = function( /**/ ){
		
		this.addProperties = function( obj ){
			for( prop in obj ){
				this[prop] = new HistoryProp( obj[prop] );
			}
		}
		
		this.addProperty = function( prop ){
			if(typeof prop == 'string')
				this[prop] = new HistoryProp();
			else if(typeof prop == 'object'){
				this.addProperties( prop );
			}
		}
				
		for(var i = arguments.length; i--; this.addProperty( arguments[0] ));
	}
	
	CreateHistory.prototype = Array.prototype;
	
	var Vector = function(){
		
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
	
	Vector.prototype = Array.prototype;
	
	exports.Number = function(){
		return new HistoryProp();
	}
	
	exports.Int = function(){
		return new HistoryProp();
	}
	
	exports.create = function(){
		return new CreateHistory.apply( null, arguments );
	}
	
});