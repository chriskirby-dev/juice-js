define('electron/window', function(){

    var app = this.app;
    var exports = this.exports;

    ///var electron = require('electron');

    function optionsToString( options ){
        var parts = [];
        for( var prop in options ){
            parts.push( prop+"="+options[prop] );
        }
        return parts.join(',');
    }

    exports.open = function( url, name, options ){
        if( !options ) options = {};
        let win = window.open( url, name, optionsToString( options ) );
        return win;
    }

    exports.openNative = function( url, name, options ){
        if( !options ) options = {};
        options.modal = true;

        let win = window.open( url, name +' native', optionsToString( options ) );
        return win;
    }

    return exports;

});