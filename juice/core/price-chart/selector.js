define('price-chart/selector', ['events/dom'], function PriceChartSelector( events ){

    var exports = this.exports;
    var app = this.app;
    var chart = this.parent;
    exports.view = null;
    exports.layer = null;
    exports.active = false;
    exports.bounds = null;
    exports.mouse = {};
    exports.type = 1;

    var unbind = function(){
        events.remove( window, 'mouseup', exports.onMouseUp );
        events.remove( window, 'mousemove', exports.onMouseMove );
        events.add( exports.view.wrapper, 'mousedown', exports.onMouseDown );
        return false;
    };

    var setMouse = function( e, save ){
        exports.mouse.x = e.pageX - exports.bounds.left;
        exports.mouse.y = e.pageY - exports.bounds.top;
        if( save ){
            exports.mouse[save] = {};
            exports.mouse[save].x = exports.mouse.x;
            exports.mouse[save].y = exports.mouse.y;
        }
    }

    var getMouseChange = function( from ){
        return {
            x: exports.mouse.x - exports.mouse[from].x,
            y: exports.mouse.y - exports.mouse[from].y
        };
    }

    exports.onMouseDown = function( e ){
        //console.log('onMouseMove', e );

        if( exports.type == 1 ){
            var ctx = exports.layer.view.context();
            ctx.lineWidth = 1;
            ctx.strokeStyle  = 'rgba(95, 171, 204, 1)';
            ctx.fillStyle = 'rgba(95, 171, 204, 0.2)';
        }

        exports.active = true;
        exports.bounds = exports.view.wrapper.getBoundingClientRect();
        setMouse( e, 'start' );

        events.remove( exports.view.wrapper, 'mousedown', exports.onMouseDown );
        events.add( window, 'mouseup', exports.onMouseUp );
        events.add( window, 'mousemove', exports.onMouseMove );
       
        return false;
    };

    exports.onMouseUp = function( e ){
        setMouse( e, 'end' );
        exports.active = false;
        unbind();
        var rate;
        var date = {
            start: Math.floor( exports.view.stage.plotX( exports.mouse.start.x, true ) ),
            end: Math.floor( exports.view.stage.plotX( exports.mouse.end.x, true ) ),
        };
        if( exports.type == 2 ){
            rate = {
                start: exports.view.stage.plotY( exports.mouse.start.y, true ),
                end: exports.view.stage.plotY( exports.mouse.end.y, true ),
            };
        }
        exports.emit('selection', date, rate );
        setTimeout(function(){
             exports.render();
        }, 1000 );
        return false;
    };


    exports.onMouseMove = function( e ){
        if( !exports.active ) return false;
        setMouse( e );
        exports.render();
        return false;
    };

    var getBoxDimentions = function(){

        var start = exports.mouse.start;
        var change = getMouseChange('start');

        var x = start.x;
        var y = start.y;
        var h = change.y;
        var w = change.x;

        if( exports.type == 1 ){
            y = 0;
            h = exports.view.stage.height;
        }

        return { x: x, y: y, width: w, height: h };
    };

    exports.render = function(){
        exports.layer.view.clear();
        if( exports.active && exports.type > 0 ){
            var ctx = exports.layer.view.context();
            var dims = getBoxDimentions();
            //console.log( x, y, w, h );
            ctx.beginPath()
            ctx.rect( dims.x+ctx.lineWidth, dims.y, dims.width, dims.height-(ctx.lineWidth*2) );
            ctx.stroke();
            ctx.fill();
            ctx.closePath()
        }
    };
    
    exports.setup = function( view ){
        exports.view = view;
        exports.layer = view.stage.layer('selector', 10000 );

        events.add( view.wrapper, 'mousedown', exports.onMouseDown );

    };

    return exports;

}, { extend: 'events' });