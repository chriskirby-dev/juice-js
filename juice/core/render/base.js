define('render', ['render/canvas'], function( canvas ){
    console.log('App Trades Loaded');
    var app = this.app;
    var exports = this.exports;

    exports.canvas = function( wrapper ){
        return new canvas.Constructor( wrapper );
    };

    return exports;

});