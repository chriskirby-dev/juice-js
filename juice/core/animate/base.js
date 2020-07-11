define('animate', ['animate/helper', 'util/object'], function( helper, objUtil ){

    var { app, exports } = this;

    function diff( start, end ){
        return start - end;
    }

    function angle( dx, dy ){
        return (Math.atan2(dy,dx)/Math.PI * 180)-180;
    }

    function Animation( props ){
       
    }


    function AnimationProperties( props ){
       
    }

    exports.time = function( fn, options ){

        var duration;
        if( typeof options == 'number' ) duration = options;

        var time = new helper.Time( options );

        function tick( t ){
            if( !time.start ) time.start = t;
            time.set( t );

            fn( time.percent );

            if( !time.complete ) window.requestAnimationFrame( tick );
            return false;
        }

        window.requestAnimationFrame( tick );

        return false;
    }

    exports.to = function( value, target, options, callback ){
        var type = typeof value;
        if( typeof options == 'number') options = { duration: options }
        var keys = Object.keys( target );
        var hv;

        if( type == 'number' ){
            hv = new helper.Value( value, target );
        }else{
            hv = new helper.Object( value, target );
        }

        exports.time(function( percent ){
            return callback( hv.progress( percent ) );
        }, options.duration );
    }

    return exports;

})