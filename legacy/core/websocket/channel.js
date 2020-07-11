define('websocket/channel', [], function(){
    const { exports } = this;

    exports.name = null;
    exports.callbacks = [];
    exports.path = null;
    exports.lastActivity = 0;
    exports.subscribed = false;
    exports.parser = null;

    exports.message = function( message ){
        exports.lastActivity = Date.now();
        for(var i=0;i<exports.callbacks.length;i++){
            exports.callbacks[i]( message );
        }
    }

    return exports;
    
}, { extend: 'events' });