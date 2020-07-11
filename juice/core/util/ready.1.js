define('util/hooks', [], function(  ){
	
    var exports = this.exports;

    exports.defined = {};

    exports.hasHook = function( hook ){
        return exports[hook] && exports[hook].length > 0;
    }

    exports.runHook = function( hook, ...args ){
        for( var i=0;i< exports[hook].length;i++){
            args = exports[hook][i]( ...args );
        }
        return args;
    }

    exports.addHook = function( hook ){
        Object.defineProperty( exports, hook, {
            get: function(){
                return exports.defined[hook];
            },
            set: function(h){
                exports.defined[hook] = h;
            }
        });
    }

    exports.removeHook = function(){
        
    }

    return exports;

}, { extend: 'events' });