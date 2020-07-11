define('window/post', [], function(){

    var app = this.app;
    var exports = this.exports;
    exports.origin = '*';
    exports.target = null;

    exports.send = function( event, data ){
        var message = {
            event: event,
            data: data
        };
        exports.target.postMessage(JSON.stringify( message ), exports.origin );
        return false;
    };

    exports.recieve = function( message ){
        var event = message.event;
        var data = message.data;
        console.log('Recieve', event, data );
        exports.emit( event, data );
        return false;
    };

    window.addEventListener( 'message', function( e ){
        console.log(e);
        var data = JSON.parse( e.data );
        exports.recieve( data );
    }, false );

    return exports;
}, { extend: 'events' });