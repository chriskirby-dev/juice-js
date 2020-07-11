define('html/view', ['html/element'], function View( ViewElement ){
	
	var exports = this.exports;
	
	var global = this.global;
	global.indexes = global.indexes || {};
	exports.defined = {};

	var View = function( name, options, parent ){
		
		var self = this;
		self.name = name;
		self.options = options || {};

		self.initialize();
		if( parent ){
			parent.appendChild( self.root );
		}
	};

	View.prototype.append = function( child ){
		var self = this;
		self.root.appendChild( child );
	};

	View.prototype.appendTo = function( parent ){
		var self = this;
		parent.appendChild( self.root );
	};

	View.prototype.initialize = function(){
		var self = this;
		var options = self.options;
		self.root = new ViewElement( self.name, options.element || 'div', options );
	

	};

	return View;
	
});