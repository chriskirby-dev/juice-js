define('chart/display', [], function( ){

    var exports = this.exports;
    var app = this.app;
    var chart = this.parent;
    if(!app.body) app.body = document.querySelector('body');

    if( !app.tmp ) app.tmp = {};
    if( !app.tmp.chartIndex ) app.tmp.chartIndex = -1;
    app.tmp.chartIndex++;

    exports.wrapper = null;
    exports.canvas = null;

    exports.resize = function(){
        var wrapRect = exports.wrapper.getBoundingClientRect();
        exports.width = wrapRect.width;
        exports.height = wrapRect.height;
        exports.canvas.width = wrapRect.width;
        exports.canvas.height = wrapRect.height;
        return false;
    };

    exports.container = function( sel ){
        var wrapper = document.querySelector( sel );
        exports.canvas = document.createElement('canvas');
        exports.canvas.id = 'juice-canvas-'+app.tmp.chartIndex;
        wrapper.appendChild( exports.canvas );
        exports.wrapper = wrapper;
        exports.resize();
        return false;
    };

    return exports;

});