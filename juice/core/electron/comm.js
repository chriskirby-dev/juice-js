define('electron/comm', function(){

    var app = this.app;
    var exports = this.exports;

    var ipcRenderer = require('electron').ipcRenderer;

    exports.to =  function( context ){
        var sender = null;
        var to;
        switch( context ){
            case 'main':
                sender = ipcRenderer.send;
            break;
            case 'host':
                sender = ipcRenderer.sendToHost;
            break;
            default:
                //Web Context
                to = context;
                sender = ipcRenderer.sendTo;
            break;
        }

        return {
            send: function(){
                exports.send();
            }
        };
    }

    exports.remove =  function( channel, listener ){
        return ipcRenderer.removeListener( channel, listener )
    }

    exports.removeAll =  function( channel ){
        return ipcRenderer.removeAllListeners( channel );
    }

    exports.on =  function( channel, callback ){
        return ipcRenderer.on( channel, callback );
    }

    exports.once =  function( channel, callback ){
        return ipcRenderer.once( channel, callback );
    }

    exports.send = function( channel, ...args ){
        ipcRenderer.send( channel, args );
    }

    exports.sendSync = function( channel, ...args ){
        ipcRenderer.sendSync( channel, args );
    }

    exports.sendTo = function( channel, ...args ){
        ipcRenderer.sendSync( channel, args );
    }

    return exports;

});