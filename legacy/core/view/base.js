define('view', ['html/element'], function View( ViewElement ){
	
	var exports = this.exports;
	
	var global = this.global;
	global.indexes = global.indexes || {};
	exports.defined = {};

	Object.defineProperty( exports, 'wrapper', {
        get: function(){
            return exports.defined.wrapper;
        },
        set: function( el ){
            exports.defined.wrapper = el;
        }
    });



	var View = function( name, options ){
		
		var self = this;
		self.name = name;
		self.options = options || {};

		self.initialize();
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


	exports.create = function( name, options, parent ){
		var view = new View( name, options );
		if( parent ){
			view.appendTo( parent );
		}
		return view;
	};

	return exports;
	
});