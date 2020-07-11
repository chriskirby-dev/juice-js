define('mysql/util', [], function( util ){
    
    const { app, exports } = this;

    const mysqlMod = require('mysql');

    exports.keys = function( OBJ ){
        return Object.keys( OBJ );
    }

    exports.values = function( OBJ ){
        return Object.values( OBJ );
    }

    exports.dataToKeyVals = function( data ){
        var keys =  Object.keys( data );
        return {
            keys: Object.keys( data ),
            values: keys.map( function( col ){ 
                var value = data[col];
                switch( value ){
                    case 'CURRENT_TIMESTAMP':
                        value = mysqlMod.raw('CURRENT_TIMESTAMP()');
                    break;
                    default:
                        value = value;
                }
                return value;
            })
       };
    }

    exports.parseSet = function( data ){
        var kv = exports.dataToKeyVals( data );
        return { 
            query: kv.keys.map( k => "`"+k+"` = ?").join(', '),
            vals: kv.values
        };
    }
    
    function parseKey( key ){
        var parts = key.split(' ');
        if(parts.length > 1){
            return "`"+parts[0] + ' ' + parts[1] + ' ?';
        }
        return "`"+key+"` = ?";
    }

    exports.parseWhere = function( data ){
        var kv = exports.dataToKeyVals( data );
        var query =  kv.keys.map( k => parseKey(k) ).join('AND');
        return { 
            query: query,
            vals: kv.values
        };
    }

    return exports;

});