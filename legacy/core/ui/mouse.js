define('ui/mouse', [], function(){

    var app = this.app;
    var exports = this.exports;

    exports.x = 0;
    exports.y = 0;
    exports.pressed = false;

    exports.last = { x: 0, y: 0 };
    exports.start = { x: 0, y: 0 };
    exports.change = { x: 0, y: 0 };
    exports.tick = { x: 0, y: 0 };

    exports.drag = null;
    exports.click = null;

    exports.clicked = null;

    exports.actions = {
        drag: []
    };

    exports.draggable = function( id ){
        exports.actions.drag.push( id );
    }

    exports.watch = function( id, actions ){
        for(var i=0;i<actions.length;i++){
            if(! exports.actions[actions[i]])  exports.actions[actions[i]] = [];
            exports.actions[actions[i]].push( id );
        }
    }

    var onMouseMove = function( e ){

        exports.last = { x: exports.x, y:  exports.y };

        exports.x =  e.pageX;
        exports.y =  e.pageY;

        if( exports.down && exports.clicked.draggable ){

            if( !exports.drag ){
                
                exports.drag = {
                    target: exports.clicked.target,
                    tick: { x: 0, y: 0 },
                    change: { x: 0, y: 0 }
                };

                exports.emit('dragstart', exports.drag );
            }

            exports.drag.tick.x = exports.x - exports.last.x;
            exports.drag.tick.y = exports.y - exports.last.y;

            exports.drag.change.x = exports.x - exports.down.x;
            exports.drag.change.y = exports.y - exports.down.y;

            exports.emit('drag', exports.drag );
            window.getSelection().removeAllRanges();
        }

        

        exports.emit('move', { x: exports.x, y: exports.y } );

    };

    var onMouseDown = function( e ){
       // console.log('onMouseDown');
        window.removeEventListener('mousedown', onMouseDown );
        window.addEventListener('mouseup', onMouseUp, false );
        window.addEventListener('blur', onMouseUp, false );

        exports.down = { 
            time: Date.now(),
            x: e.pageX,
            y: e.pageY,
            offset: { x: e.offsetX, y: e.offsetY } 
        };

        exports.x =  e.pageX;
        exports.y =  e.pageY;
        exports.last = { x: e.pageX, y: e.pageY };

        exports.clicked = {
            target: e.target,
        };

        if(  exports.actions.drag.indexOf( e.target.id ) !== -1 ){
            exports.clicked.draggable = true;
        }

        if( exports.actions.down && exports.actions.down.indexOf( e.target.id ) !== -1 ){
            
        }


        ///console.log( exports.actions );
        //console.log( exports.clicked );

        window.getSelection().removeAllRanges();

        exports.emit('down', { x: exports.x, y: exports.y, target: e.target } );
    };

    var onMouseUp = function( e ){
       // console.log('onMouseUp');
        window.removeEventListener('mouseup', onMouseUp );
        window.removeEventListener('blur', onMouseUp );
        if( exports.drag ){
            exports.emit('dragstop', exports.drag );
            delete exports.drag;
        } 

        delete exports.down;
        delete exports.last;
        
        window.addEventListener('mousedown', onMouseDown, false );

        if( exports.actions.up && exports.actions.up.indexOf( e.target.id ) !== -1 ){
            
        }

        exports.emit('up', { x: exports.x, y: exports.y, target: e.target });
    };

    
    window.addEventListener('mousemove', onMouseMove, false );
    window.addEventListener('mousedown', onMouseDown, false );


    var appHoverListener = function( el, callback ){

        var onMouseLeave = function(){
            el.removeEventListener('mouseleave', onMouseLeave );
            el.addEventListener('mouseenter', onMouseEnter, false );
            callback( false );
        };


        var onMouseEnter = function(){
            el.removeEventListener('mouseenter', onMouseEnter );
            el.addEventListener('mouseleave', onMouseLeave, false );
            callback( true );
        };


        el.addEventListener('mouseenter', onMouseEnter, false );
    };

    exports.listener = function( el, event, callback ){
        if( event == 'hover' ){
            appHoverListener( el, callback );
        }
    };

    exports.position = function(){
        return {
            x: exports.x,
            y: exports.y
        }
    };

    return exports;

}, { extend: 'events', persistant: true  });