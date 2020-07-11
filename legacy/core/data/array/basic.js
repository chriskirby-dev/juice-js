define('data/array/basic', ['extend/hooks'], function( hooks ){
    
    var exports = this.exports;

    exports.hooks = hooks;

    

    hooks.enable('push', exports );
    hooks.enable('shift', exports );
    hooks.enable('unshift', exports );
    hooks.enable('splice', exports );

    exports.range = function( start, end ){
        return exports._splice( start, end - start );
    }

    hooks.enable('range', exports );

    return exports;

}, { prototype: 'Array' });