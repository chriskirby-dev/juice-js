
define('util/object', [], function(  ){
	
    var exports = this.exports;
    var util = this.parent;

    exports.extract = function( data, properties ) {
        var d = {};
        while( properties.length > 0){
            var prop = properties.shift();
            d[prop] = data[prop];
        }
        return d;
	};


    exports.intersect = function( arr1, arr2 ) {
		return arr1.filter(value => -1 !== arr2.indexOf(value));
    };
    
    exports.inherit = function( Constructor, SuperConstructor ) {

		if( !SuperConstructor.prototype ){
			var sup = function(){};
			sup.prototype = SuperConstructor;
			SuperConstructor = sup;
		}
		
        Constructor.super_ = SuperConstructor;
        
		Constructor.prototype = Object.create( SuperConstructor.prototype, {
			constructor: {
				value: Constructor,
				enumerable: false,
				writable: true,
				configurable: true
			}
        });

    }

    return exports;

}, { persistant: true });

