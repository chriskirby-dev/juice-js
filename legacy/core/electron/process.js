define('electron/process', function(){

    var app = this.app;
    var exports = this.exports;

    var ipcRenderer = require('electron').ipcRenderer;

    function optionsToString( options ){
        var parts = [];
        for( var prop in options ){
            parts.push( prop+"="+options[prop] );
        }
        return parts.join(',');
    }

    exports.on =  function( channel, data, callback ){

    }

    exports.once =  function( channel, data, callback ){

    }

    exports.send = function( channel, ...args ){
        ipcRenderer.send( channel );
    }

    return exports;

});