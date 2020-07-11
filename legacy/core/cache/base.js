define('cache', ['storage/local'], function( storage ){

    var { app, exports } = this;

    exports.path = 'cache';

    let defined = [];

    exports.set = function( k, v, t ){
        storage.set( k, v );
        defined.push( k );
    }

    exports.get = function( k, t ){
        return storage.get( k, t );
    }

    exports.clear = function( k ){
        storage.remove( k );
    }

    exports.has = function( v ){
        return defined.indexOf(v) !== -1;
    }

    exports.init = function( path ){
        exports.path = 'cache:'+path;
    }


    return exports;

}, { persist: true });