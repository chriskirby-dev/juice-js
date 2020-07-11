define('canvas/helper', [], function(){
    
    const { app, exports } = this;

    exports.create = function( w, h ){
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        return canvas;
    }

    var get2D = function( canvas ){
        return canvas.getContext('2d');
    }

    exports.get2D = get2D;

    exports.copy = function( ctx, w, h, x, y ){
        return ctx.getImageData( x || 0, y || 0, w, h );
    }

    exports.paste = function( ctx, data, x, y ){
        return ctx.putImageData( data, x || 0, y || 0 );
    }

    return exports;
});