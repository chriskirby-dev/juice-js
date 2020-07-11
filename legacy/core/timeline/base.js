define('timeline', ['timeline/ticker'], function( ticker ){

    var app = this.app;
    var exports = this.exports;

    exports.last = null;
    exports.firstTick = null;
    exports.fps = null;
    exports.active = false;
    exports.callers = [];

    exports.add = function( fn, start ){

        exports.callers.push( fn );

        if( start && !exports.active ){
            ticker.add( exports );
            exports.active = true;
        }
    };

    exports.start = function(){
        if( !exports.active ){
            ticker.add( exports );
            exports.active = true;
        }
    };

    exports.remove = function( fn ){
        for( var i=0;i<exports.callers.length;i++){
           if( exports.callers[i] == fn ){
            exports.callers.splice( i, 1 );
           }
        }
    };

    exports.tick = function( time ){
        if(!time) return false;
        if( !exports.firstTick ) exports.firstTick = time;
        var t = time - exports.firstTick;
        for( var i=0;i<exports.callers.length;i++){
            exports.callers[i]( t );
        }
        exports.emit('tick');
    };

    return exports;
}, { extend: 'events' });