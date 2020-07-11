define('array/limited', ['array/sorted'], function( SortedArray ){
    
    var exports = this.exports;
   

    var defineProp = function( obj, prop, get, set ){
        if(!set) set = function(){ return false; };
        Object.defineProperty( obj, prop, {
            get: get,
            set: set
        });
    };

    exports.defined = {};

    Object.defineProperty( self, 'min', {
        get: function(){
            return exports.defined.min;
        },
        set: function( min ){
            exports.defined.min = min;
        }
    });

    Object.defineProperty( self, 'max', {
        get: function(){
            return exports.defined.max;
        },
        set: function( min ){
            exports.defined.min = max;
        }
    });

    exports.hooks.update = function(){
        
    };

  
    return exports;

}, { extend: 'array/model' });