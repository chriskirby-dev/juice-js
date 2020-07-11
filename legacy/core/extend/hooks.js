define('extend/hooks', [], function(){

    const { app, exports, parent } = this;
    
    if(!exports.defined) exports.defined = {};
    exports.defined.hooks = {};
    exports.tmp = {};

    function runAllHooks( scope, hooks, ...args ){
        for(var i=0;i<hooks.length;i++) hooks[i].apply( scope, args );
    }

    exports.enable = function( prop, scope, fn ){

        if( typeof scope == 'function' ){
            scope = parent;
            fn = scope;
        }else if( scope == undefined ){
            scope = parent;
        }
        
        if(!exports.defined.hooks[prop]) exports.defined.hooks[prop] = { before: [], after: [] };
        exports.tmp[prop] = scope[prop];

        scope[prop] = function( ...args ){
            if( exports.defined.hooks[id].before ){
                exports.run( scope, exports.defined.hooks[id].before, ...args )
            }
            if( exports.defined.hooks[id].after ){
                return exports.run( scope, exports.defined.hooks[id].after, [ exports.tmp[prop].apply( scope, args ) ] );
            }else{
                return exports.tmp[prop].apply( scope, args );
            }
        }

        if( fn ) exports.set( prop, fn );

        return;
    }

    exports.exists = function( id ){
        return !exports.defined.hooks[id] ? true : false;
        exports.defined.hooks[id].push( hook );
    }

    exports.run = function( scope, hooks, ...args ){
        for( vari=0;i< hooks.length;i++ ){
            hooks[i].apply( scope, args );
        }
    }

    exports.set = function( id, hook, placement ){
        if(!exports.defined.hooks[id]) exports.defined.hooks[id] = { before: [], after: [] };
        exports.defined.hooks[id][(placement || 'before')].push( hook );
    }

    exports.before = function( id, hook ){
        if(!exports.defined.hooks[id]) exports.defined.hooks[id] = { before: [], after: [] };
        exports.defined.hooks[id].before.push( hook );
    }

    exports.after = function( id, hook ){
        if(!exports.defined.hooks[id]) exports.defined.hooks[id] = { before: [], after: [] };
        exports.defined.hooks[id].after.push( hook );
    }

    return exports;

});