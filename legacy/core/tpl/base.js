define('tpl', ['http/xhr', 'tpl/tokenizer', 'cache'], function( xhr, tokenizer, cache ){

    const { app, exports } = this;

    let isNode;
    if(typeof process === 'object') isNode = true;

    exports.dir = '';
    

    exports.preload = function( tpl, callback ){

        console.log('Cache Check', tpl );
        if( cache.has( tpl ) ){
            console.log('Cache OK', tpl );
            return callback( cache.get( tpl ) );
        }

        function onContentLoaded(content){
            var head = content.toString().split(/<head([^>]*)>/).pop().split(/<\/head>/).shift().trim();
            var body = content.toString().split(/<body([^>]*)>/).pop().split(/<\/body>/).shift().trim();
            exports.tpl = body;
            cache.set( tpl, body );
            return callback( body );
        }

        var path =  exports.dir + tpl +'.tpl';

        if( isNode ){
            var content = require('fs').readFileSync(path);
            onContentLoaded( content );
        }else{
            xhr.get( path, { dataType: 'document' } ).success( function( doc ){
                return onContentLoaded( doc.body.innerHTML );
            });
        }


        return false;

    }

    exports.preloadAll = function( queue, callback ){

        function loadNext(){
            if(queue.length == 0 ) return callback();
            exports.preload( queue.shift(), loadNext );
        }

        loadNext();
        return;
    }

    exports.loadFromCache = function( path, options = {} ){
        if( !cache.has( path ) ) return console.warn('Path', path, 'not found in cache');
        console.log(cache.get( path ));
        return tokenizer.process( options.tokens, cache.get( path ), options );
    }
    
    exports.load = function( path, parent, options ){
        if(!options) options = {};
        var target = document.querySelector( parent );
        xhr.get( path, { dataType: 'document' } ).success( function( doc ){
            if( options.defined ){
                for( var def in options.defined ){
                    var el = doc.querySelector('[data-var="'+def+'"]');
                    if( el ) el.innerHTML = options.defined[def];
                }
            }
            target.innerHTML = doc.body.innerHTML;
        });
        return {};
    }

    return exports;

});