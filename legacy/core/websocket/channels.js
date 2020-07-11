define('websocket/channels', [], function( ){

    var app = this.app;
    var exports = this.exports;
    var websocket = this.parent;

    exports.active = [];
    exports.queued = [];
    exports.callbacks = {};

    Object.defineProperty( exports, 'count', {
        get: function(){
            return exports.active.length;
        },
        set: function(){
            return false;
        }
    });

    exports.has = function( channel ){
        return exports.callbacks[channel] ? true : false;
    }

    exports.get = function( channel ){
        return exports.callbacks[channel];
    }


    exports.websocketReady = function(){
        return websocket.connected ? 2 : ( ( websocket.state == 'connecting' || websocket.state == 'reconnecting' ) ? 1 : 0 );
    }

    exports.registerCallback = function( channel, options, callback ){

        if( !exports.callbacks[channel] )
            exports.callbacks[channel] = [];

        for( var i=0;i< exports.callbacks[channel].length;i++ ){
            if( exports.callbacks[channel][i].callback === callback ) return false;
        }

        if( callback ){
        var data = { callback: callback, options: options };
        exports.callbacks[channel].push( data );
        }

        return;

    }

    exports.queue = function( channel, callback ){

        if( exports.queued.indexOf( channel ) === -1 )
            exports.queued.push( channel );

        if( !exports.websocketReady() == 0 ){
            console.log('!connected');
            websocket.connect();
            return false;
        }

        return false;
    }

    exports.subscribe = function( channel, options, callback ){

        console.log('Channel Subscribe', channel, options );
        exports.registerCallback( channel, options, callback );

        if( exports.websocketReady() !== 2 ) 
        return exports.queue( channel );

        if( exports.active.indexOf( channel ) !== -1 ){
            exports.emit('subscribed', channel, [callback] );
            return callback();
        }

        return websocket.send( 'subscribe', [channel] );
    };


    exports.subscribed = function( channel ){
        if(exports.callbacks[channel]){
            exports.emit('subscribed', channel, exports.callbacks[channel] );
        }
    }

    exports.message = function( channel, action, message ){
       // console.log('channel message', exports.callbacks[channel]);
        if(exports.callbacks[channel]){
            exports.callbacks[channel].map(function(c){
                return c.callback( channel, action, message );
            });
        }
        return false;
    }

    websocket.on('connect', function(){
        if( exports.queued.length > 0 ){
            websocket.subscribe( exports.queued );
            exports.queued = [];
        }
        return;
    });
    
    return exports;

}, { extend: 'events' });