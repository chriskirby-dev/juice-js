define('array/model', ['util'], function( util ){
    
    var { exports } = this;

    var defineProp = function( obj, prop, get, set ){
        if(!set) set = function(){ return false; };
        Object.defineProperty( obj, prop, {
            get: get,
            set: set
        });
    };

    exports.hooks = {
        defined: {},
        added: [],
        removed: []
    };

    function addHook( hook ){
        defineProp( exports.hooks, hook, 
        function(){
            return exports.hooks.defined[hook];
        },
        function( fn ){
            exports.hooks.defined[hook].push( fn );
        });
    }

    addHook('added');
    addHook('removed');
    addHook('updated');

    var SORT = {
        ASC: function(a, b){return a - b},
        DESC: function(a, b){return b - a}
    }

    function runHooks( hook, ...args ){
        for( var i=0;i< exports.hooks[hook].length;i++){
            exports.hooks[hook][i]( ...args );
        }
    }

    function hasHooks( hook ){
        return exports.hooks[hook].length > 0;
    }

    exports.TO = {};

    exports.update = function(){

        clearTimeout( exports.TO.update );

        exports.TO.update = setTimeout(function(){
            if( hasHooks( 'update') )
            runHooks( 'update' );
            return false;
        }, 1 );

        return false;
    };

    exports._sort = exports.sort;

    exports.sort = function( sorter ){
        if( SORT[sorter] ){
            exports._sort( SORT[sorter] );
        }else if( util.type( type, 'function' ) ){
            exports._sort( sorter );
        }
    };

    exports.insert = function( data ){

        exports.splice( index, 0, data );
        if( hasHooks( 'added') ) runHooks( 'added', index );
        return index;

    }

    exports.prepend = function( data ){

        exports.unshift( data );
        if( hasHooks( 'added') ) runHooks( 'added', 0 );
        return 0;

    }

    exports.append = function( data ){

        exports.push( data );
        if( hasHooks( 'added') ) runHooks( 'added', exports.length-1 );
        return exports.length-1;

    }

    exports.delete = function( index ){

        exports.splice( index, 0 );
        if( hasHooks( 'removed') ) runHooks( 'removed', index );
        return index;
    }

    
    return exports;

}, { prototype: 'Array' });