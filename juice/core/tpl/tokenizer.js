define('tpl/tokenizer', ['cache'], function( cache ){

    const { app, exports } = this;

    cache.init('tpl');

    exports.tokens = {};

    
    //Plain Token {!$TOKEN_NAME}

    function prepairTokens( tokens ){

        let tok = {
            dom: {},
            str: {},
            empty: [],
            notEmpty: [],
        };

        for( var token in tokens ){
            if( tokens[token] instanceof Element || tokens[token] instanceof HTMLDocument ){
                tok.dom[token] = tokens[token];
            }else{
                tok.str[token] = tokens[token];
            }
            if( tokens[token] == '' || tokens[token] == null || !tokens[token] ){
                tok.empty.push(token);
            }else{
                tok.notEmpty.push(token);
            }
        }

        return tok;
    }

    function prepairTpl( html ){

       
        //Open Tag Containing Tokenized
        var openTagRegex = /<(.*)="\$\{(.*)\}\"(.*)/g;
        //All Tokenized Atrrs
        var attrRegex = /([^=\s]+)=\"\$\{([^}]+)\}\"/g;

        var openTags = html.match(openTagRegex);
        if( openTags ){
        for(var i=0;i<openTags.length;i++){
            var tag = openTags[i];
            var matches = tag.match(attrRegex);
            var tokAttrs = {};
            var tokStr = [];
            for(var i=0;i<matches.length;i++){
                var attr = matches[i].split('=').shift();
                var tokKey = matches[i].split( '${' ).pop().split('}').shift();
                tokAttrs[attr] = tokKey;
                tokStr.push( attr+'::'+tokKey );
            }
            
            var tokenizedKey = ' data-tokenized-attrs="'+tokStr.join(",")+'"';
            var tokenizedTag = tag.replace('>', tokenizedKey +'>').replace(/\{\$([^}]+)}/g, '');
            html = html.replace( tag, tokenizedTag );
        }
    }
        
        var tokensSinglettes= /\$\{([^}]+)\}/g;
        var tokens = html.match(tokensSinglettes);
        if( tokens ){
        for(var i=0;i<tokens.length;i++){
            var tname = tokens[i].replace('${', '').replace('}','');
            html = html.replace( tokens[i], '<span data-tokenized="'+(tokens[i].replace('${', '').replace('}',''))+'" ></span>' );
        }
    }

        var conditRegex = /{if\$([^}]+)}(.*){\/if}/g;
        var condits = html.match(conditRegex);
        if(condits){
        for(var i=0;i<condits.length;i++){
            var conditional = condits[i];
            var condition = conditional.replace(conditRegex, '$1');
            var value = conditional.replace(conditRegex, '$2');
            var condit ='<span id="tpl-conditional-'+i+'" data-condition="'+condition+'" >'+value+'</span>';
            html = html.replace( conditional, condit );
        }
    }

        var single_token = /\{$([^}]+)\}/g;

        var wrapped_token = /\{([a-z.-]+)\{$([^}]+)\}\}/g;
       
        return html;
    }

    function processConditionals( html, tokens ){


    }

    exports.processFor = function( tokens, html, options ){

    }

    exports.compile = function( tokens, html, options ){
        var tmp = document.createElement( 'div');
        tmp.innerHTML = html;

        var tplFor = tmp.querySelectorAll(['[data-tpl-for]']);
        for( var i=0;i<fplFor.length;i++){

        }

    }

    exports.process = function( tokens, tpl, options ){

        tpl = prepairTpl( tpl );
        var prepaired = prepairTokens( tokens );

        var tmp = document.createElement( options.wrapper || 'div');
        tmp.innerHTML = tpl;

        var tokenAttrs = tmp.querySelectorAll('[data-tokenized-attrs]');
        for(var i=0;i<tokenAttrs.length;i++){
            tokenAttrs[i].$.attr('data-tokenized-attrs').split(',').map(function(attrs){
                var pts = attrs.split('::');
                tokenAttrs[i].$.attr( pts[0], prepaired.str[ pts[1] ] )
            });
        }


        var tokenized = tmp.querySelectorAll('[data-tokenized]');
        for(var i=0;i<tokenized.length;i++){
            var key = tokenized[i].$.attr('data-tokenized');
            if(tokens[key]){
                if( tokens[key] instanceof Element || tokens[key] instanceof HTMLDocument ){
                    while(tokens[key].childNodes.length > 0)
                    tokenized[i].appendChild( tokens[key].firstChild );
                }else{
                    tokenized[i].innerHTML = tokens[key];
                }
            }
        }

        //tpl = processConditionals( tpl, tokens );
        return tmp;

    }


    return exports;
});