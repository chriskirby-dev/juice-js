define('chart', ['chart/display'], function( display ){

    var exports = this.exports;
    var app = this.app;
    
    exports.wrapper = null;
    exports.span = null;
    exports.canvas = null;
    exports.data = [];
    exports.display = display;
    exports.resize = display.resize;
    exports.container = display.container;
    exports.renderers = {};

    exports.minX = null;
    exports.maxX = null;
    exports.minY = null;
    exports.maxY = null;

    exports.data = [];

    exports.values = {
        x: new app.utils.SortedArray('ASC'),
        y: new app.utils.SortedArray('ASC')
    };

    exports.plotX = function( v ){
        return (( v - exports.minX )/( exports.maxX - exports.minX ))*exports.display.width;
    };

    exports.plotY = function( v ){
        return (( v - exports.minY )/( exports.maxY - exports.minY ))*exports.display.height;
    };

    exports.clampX = function( min, max ){
        exports.minX = min;
        exports.maxX = max;
    };

    exports.clampY = function( min, max ){
        exports.minY = min;
        exports.maxY = max;
    };

    exports.load = function( data ){
        for( var i=0;i<data.length;i++ ){
            var d = data[i];
            exports.values.x.add( d.date );
            exports.values.y.add( d.rate );
            exports.data.push( d );
        }
    };

    exports.render = function( type, data ){

        if(exports.renderers[type]){
            exports.renderers[type].render( data );
        }else{
            app.require( 'chart/renderer/'+type ).then(function( renderer ){
                renderer.link( exports );
                exports.renderers[type] = renderer;
                exports.renderers[type].render( data ); 
                return false;
            });
        }
        return false;
    };


    return exports;
});
