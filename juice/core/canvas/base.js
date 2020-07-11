define('canvas', ['canvas/stage'], function( Stage ){

    var exports = this.exports;

    //exports.objects = objects;

    exports.Stage = Stage;

    exports.create = function( selector, asStage ){

        var wrapper = null;
        if( typeof selector == 'string' ){
            wrapper = document.querySelector( selector );
        }else{
            wrapper = selector;
        }

        var canvas = document.createElement('canvas');

        wrapper.appendChild( canvas );

        return asStage ? new Stage( canvas ) : canvas;
    };

    return exports;

});