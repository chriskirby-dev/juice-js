define('storage/local', [], function(){

    var exports = this.exports;
    var app = this.app;
    var type = 'localStorage';
    exports.prefix = null;
    var store = window.localStorage;

    exports.useSession = function(){
        type = 'sessionStorage';
    };

    var formatValue = function( v, type ){
        switch( type ){
            case 'int':
            v = parseInt( v );
            break;
        }
        return v;
    }

    exports.get = function( key, type ){
        if( exports.prefix ) key = exports.prefix+key;
        var v = store.getItem( key );
        if( v && type ) v = formatValue( v, type );
        return v;
    };

    exports.set = function( key, value ){
        if( exports.prefix ) key = exports.prefix+key;
        store.setItem( key, value );
        return false;
    };

    exports.remove = function( key ){
        if( exports.prefix ) key = exports.prefix+key;
        store.removeItem( key );
        return false;
    };

    return exports;

});