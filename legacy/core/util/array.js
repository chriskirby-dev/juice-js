
define('util/array', [], function(  ){
	
    var exports = this.exports;
    var util = this.parent;

    exports.each = function( fn, array ){
        fn.apply(null, array );
        return array;
    }

    exports.removeEmpty = function( arr ){
        return arr.filter( item => !util.empty( item ) )
    };

    exports.extract = function( data, properties ) {
		//const properties =
	};


    exports.intersect = function( arr1, arr2 ) {
		return arr1.filter(value => -1 !== arr2.indexOf(value));
    };
    
    exports.intersectRem = function( arr1, arr2 ) {
		return arr1.filter(value => -1 === arr2.indexOf(value));
    };

    return exports;

}, { persistant: true });

