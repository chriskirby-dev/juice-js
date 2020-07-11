define('price-chart/settings', [], function(){
    var app = this.app;
    var exports = this.exports;
    var _exports = {};
    exports.properties = [];

    var setNotify = function( prop, v ){
        _exports[prop] = v;
        exports.emit( prop, v );
    };

    exports.define = function( prop, value, options ){
        options = options || {};
        
        
        if( options.notify ){
            Object.defineProperty( exports, prop, {
                get: function(){
                    return _exports[prop];
                },
                set: function( v ){
                    setNotify( prop, v );
                    return true;
                }
            });
            setNotify( prop, value );
        }else{
            exports[prop] = value;
        }

        exports.properties.push(prop);
        return false;
    };

    exports.config = function( data ){
        for( var prop in data ){
            exports.define( prop, data[prop], { notify: true } )
        }
        return false;
    };


    return exports;

}, { extend: 'events' });