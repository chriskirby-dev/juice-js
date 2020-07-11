define('websocket/subscriptions', [], function( ){

    var app = this.app;
    var exports = this.exports;
    var websocket = this.parent;

    exports.active = {};
    exports.queue = [];
    exports.callbacks = {
        connect: {}
    };

    Object.defineProperty( exports, 'count', {
        get: function(){
            return Object.keys( exports.list ).length;
        },
        set: function(){
            return false;
        }
    })

    exports.broadcast = function( channel, data ){
        if( !exports.active[channel] ) return false;
        for(var i=0;i<exports.active[channel].length;i++){
            exports.active[channel][i]( data, channel );
        }
        return false;
    }

    exports.addToQueue = function( channel, connectCallback ){
        if(connectCallback)
        exports.callbacks.connect[channel] = connectCallback;
        
        exports.queue.push( channel );
    }

    exports.add = function( channel, callback ){
        console.log('Add Sub');
        
        if( !websocket.connected ) 
        return exports.addToQueue( channel, callback );

        websocket.subscribe( channel );

    }


    exports.connected = function( channel ){
        if(exports.callbacks.connect[channel]){
            exports.callbacks.connect[channel]();
            delete exports.callbacks.connect[channel];
        }
    }

    exports.remove = function( channel, callback ){
        if( !exports.active[channel] ) return true;
        if( !callback ){
            delete exports.active[channel];
            return true;
        }
        for(var i=0;i<exports.active[channel].length;i++){
            if( exports.active[channel][i] === callback ){
                exports.active[channel].splice( i, 1 );
                return true;
                break;
            }
        }
    }

    websocket.on('connect', function(){
        if( exports.queue.length > 0 ){
            websocket.subscribe( exports.queue );
            exports.queue = [];
        }
        return;
    });
    
    return exports;

}, { extend: 'events' });