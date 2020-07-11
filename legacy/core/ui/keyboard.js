define('ui/keyboard', [], function(){

    const { app, exports } = this;

    var pressed = [];

    exports.pressed = function( keyCode ){
        return pressed.indexOf( keyCode ) !== -1;
    }
    
    document.addEventListener('keydown', function(e){
        pressed.push( e.keyCode );
        exports.emit( 'down', e.keyCode );
        return false;
    });

    document.addEventListener('keyup', function(e){
        var idx = pressed.indexOf( e.keyCode );
        pressed.splice( idx, 1 );
        exports.emit( 'up', e.keyCode );
        return false;
    });
    

    return exports;
}, { extend: 'events' });