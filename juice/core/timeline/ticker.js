define('timeline/ticker', [], function(){

    var app = this.app;
    var exports = this.exports;
    var global = this.global;

    if(global.timeline) return global.timeline;

    global.timeline = exports;
            
    if(!window.requestAnimationFrame){
        window.requestAnimationFrame = 
        (window.webkitRequestAnimationFrame 	||
            window.mozRequestAnimationFrame 		||
            window.oRequestAnimationFrame			||
            window.msRequestAnimationFrame			||
            function( callback ){
            return window.setTimeout(callback, 1000 / 60 );
            });
    }

    exports.time = null;
    exports.active = false;
    exports.timelines = [];
    
    exports.tick = function( time ){

        exports.time = time;

        if( exports.timelines.length == 0 ){
            exports.active = false;
            return false;
        }

        for( var i=0;i<exports.timelines.length;i++){
            var tl = exports.timelines[i];
            if( tl.last && tl.fps && ( time - tl.last < 1000 / tl.fps ) ){
                continue;
            }
            tl.tick( time );
            tl.last = time;
        }

        window.requestAnimationFrame( exports.tick ); 
    }

    exports.add = function( timeline ){
        exports.timelines.push( timeline );
        if( !exports.active ) exports.tick();
    }


    return exports;
}, { persistant: true });