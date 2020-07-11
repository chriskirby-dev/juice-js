define('websocket', ['utils','websocket/channels', 'websocket/channel'], function( utils, channels, channel ){

    var app = this.app;
    var exports = this.exports;

    var CONNECT_TO;
    var connection;

    exports.endpoint = null;
    exports.timeout = 5000;
    exports.state = null;
    exports.reconnect = false;
    exports.reconnect_atempts = 0;
    exports.session = null;

    exports.channels = channels;

    exports.hook = {};

    exports.sendKeys = {
        command: 'command',
        channel: 'channel',
        data: 'args'
    };

    var connectionID = 0;

    exports.send = function( command, data, callback ){
        var params = {};
        params[exports.sendKeys.command] = command;
        params[exports.sendKeys.data] = data;
        //console.log(params);
        return exports.session.send( JSON.stringify( params ) );
    }

    exports.subscribe = function( channel, options, callback ){
        
        if( utils.type( channel, 'array' ) ){
            channel.forEach(function( c ){
                return exports.subscribe( c, options, callback);
            });
            return false;
        }
        
        return channels.subscribe( channel, options, callback  );
        
    }

    exports.unsubscribe = function( channel, callback ){
        subscriptions.remove( channel, callback  );
        var req = exports.send( 'unsubscribe', [channel] );
        //console.log( req );
        return req;
    }

    function reconnect(){

        exports.state = 'reconnecting';
        exports.reconnect_atempts++;

        setTimeout( function(){
            if( connection !== undefined ) connection.close();
            exports.connect();
            
        }, exports.reconnect_atempts * 1000 );

        return false;

    }

    exports.connect = function(){

        if( !exports.endpoint ) return console.error('You must set a ws endpoint before connecting');
        exports.state = 'connecting';
    
        connection = (function( endpoint ){
            return new WebSocket( 'wss://'+endpoint );
        })( exports.endpoint );
    
            
        if( !connection ) return false;

        connection.onopen = function( e ){
            console.log('Connected To Websocket');
            console.log(e);
            clearTimeout( CONNECT_TO );
            exports.reconnect_atempts = 0;
            exports.session = e.target;
            exports.connected = true;
            exports.state = 'connected';
            connection['connectionID'] = ++connectionID;
            exports.emit('connect', e );
        };
        
        connection.onclose = function( e ){
            console.log('onclose');
            
            if( exports.session ){
                //subscriptions.resetActive();
                exports.session = null;
                if( exports.reconnect ){
                    reconnect();
                    return false;
                }
            }
            
            exports.state = 'closed';
            exports.emit('close', e );
            return false;
        };

        connection.onerror = function(e){
            console.log(e);
            if( e.target.connectionID != connectionID )
                e.target.close();
            else{
                //unsubscribeAll();
            }
            exports.state = 'error';
            exports.emit('error', e );
        }

        connection.onmessage = function( event ){
            var message;
            try {
                message = JSON.parse( event.data );
            } catch(e) {
                exports.emit('error', 'Unable to parse incoming data:', event.data );
                return;
            }

            console.log(message);
            if( exports.hook.message ){
                var hook = exports.hook.message( message );
                if( hook.type ){
                    switch( hook.type ){
                        case 'subscribe':
                        if( hook.value = true )
                        channels.subscribed( hook.channel );
                        break;
                    }
                }
            }

            exports.emit('message', message );
            e = null;
            return false;
            
        }

        exports.connection = connection;

        CONNECT_TO = setTimeout( function(){
            console.warn('WS Connection TIMEOUT');
            reconnect();
            return false;
        }, exports.timeout );
        //Connect END
    }

    return exports;

}, { extend: 'events' });