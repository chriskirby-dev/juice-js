define('path/querystring', [], function(){

    const { app, exports } = this;

    exports.parse = function( querystring ){

    }

    exports.stringify = function( params, encode ){
        
        if( encode ){
            return Object.keys(params).map((key) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
            }).join('&');
        }

        return Object.keys(params).map(key => key + '=' + params[key]).join('&');
    }

    return exports;

});