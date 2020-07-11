define('price-chart/view', [], function( ){
    
    var exports = this.exports;
    var app = this.app;
    if(!app.body) app.body = document.querySelector('body');

    exports.wrapper = null;
    exports.canvas = null;

    exports.width = null;
    exports.height = null;
    exports.minX = null;
    exports.maxX = null;
    exports.minY = null;
    exports.maxY = null;
    exports.layers = {};
    exports.layerIndex = 0;

    exports.padding = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    exports.plotX = function( v, fromX ){
        if( fromX ){
            return exports.minX + ( (v/exports.width) * ( exports.maxX - exports.minX ) );
        }
        return exports.padding.left + ( (( v - exports.minX )/( exports.maxX - exports.minX ))*( exports.width - exports.padding.right ) );
    };

    exports.plotY = function( v ){
        return exports.padding.top + ( (( exports.maxY - v )/( exports.maxY - exports.minY ))*( exports.height - exports.padding.bottom ) );
    };

    exports.resize = function(){
        var wrapRect = exports.wrapper.getBoundingClientRect();
        exports._width =  wrapRect.width;
        exports._height =  wrapRect.height;
        exports.width = wrapRect.width - ( exports.padding.left + exports.padding.right );
        exports.height = wrapRect.height - ( exports.padding.top + exports.padding.bottom );
        //console.log( 'Width', exports.width, 'Height', exports.height );
        for( var id in exports.layers ){
            exports.layers[id].canvas.width = wrapRect.width;
            exports.layers[id].canvas.height = wrapRect.height;
        }
        return false;
    };

    exports.clear = function( id ){
        if( id ){
            exports.layers[id].ctx.clearRect( 0, 0, exports._width, exports._height );
        }else{
            for( var id in exports.layers ){
                exports.layers[id].ctx.clearRect( 0, 0, exports._width, exports._height );
            }
        }
    };

    exports.layer = function( id, zIndex ){

        if(!exports.layers[id]){
            var canvas = document.createElement('canvas');
            canvas.id = 'juice-canvas-layer-'+exports.layerIndex;
            canvas.className = 'canvas-'+exports.layerIndex+'-'+id;
            canvas.style.zIndex = 10;
            canvas.style.position = 'absolute';
            canvas.style.left = 0;
            canvas.style.top = 0;
            exports.wrapper.appendChild( canvas );
            exports.layers[id] = { canvas: canvas, ctx: canvas.getContext('2d') };
            exports.layers[id].canvas.width = exports._width;
            exports.layers[id].canvas.height = exports._height;
            exports.layerIndex++;
        }
        
        if( zIndex ) exports.layers[id].canvas.style.zIndex = zIndex;

        return exports.layers[id];
    };

    exports.container = function( wrapper ){
        wrapper.innerHTML = '';
        exports.wrapper = wrapper;
        exports.layer('main', 10 );
        exports.resize();
        exports.emit('ready');
        return false;
    };

    return exports;

}, { extend: 'events' });