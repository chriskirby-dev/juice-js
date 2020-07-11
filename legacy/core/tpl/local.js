define('tpl/local', ['tpl/template', 'tpl/tokenizer', 'cache'], function( template, tokenizer, cache ){

    const { app, exports } = this;

    let isNode;
    if(typeof process === 'object') isNode = true;

    if( isNode ){
        const fs = require('fs');
        var localDir = __dirname;
        exports.dir = '/app/tpls/';
    }else{

    }


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
            callback( body );
        }

        if( isNode ){
            var path =  exports.dir + tpl;
            var content = fs.readFileSync(path);
            onContentLoaded( content );
        }else{
            xhr.get( path, { dataType: 'document' } ).success( function( doc ){
                return onContentLoaded( doc.body.innerHTML );
            });
        }


        return body;

    }
    
    exports.load = function( path, options, callback ){

         var args = Array.prototype.slice.call( arguments );

         if( typeof args[args.length-1] == 'object')
         options = args.pop();
         
        if(!options) options = {};

        path = args.join('/');

        exports.preload( path, function( html ){
            if( options.tokens )
            var dom = tokenizer.process( options.tokens, html, options );
            console.log(dom,  options.tokens);
            callback(dom);
        });

       return false;
       
    }

    return exports;

});