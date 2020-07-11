define( 'span', [], function(){

    var exports = this.exports;

    
    var defined = {};

    exports.ready = false;

    Object.defineProperty( exports, 'start', {
        get: function(){
            return defined.start || defined.end && defined.end - defined.duration;
        },
        set: function( v ){
            if( v == defined.start ) return;
            defined.start = v;
            if( !exports.ready && defined.end || defined.length ){
                exports.ready = true;
                exports.emit('ready');
            }else if( exports.ready )
            exports.emit('update');
        }
    });

    Object.defineProperty( exports, 'end', {
        get: function(){
            return defined.end || defined.start && defined.start + defined.length;
        },
        set: function( v ){
            if( v == defined.end ) return;
            defined.end = v;
            if( !exports.ready && defined.start || defined.length ){
                exports.ready = true;
                exports.emit('ready');
            }else if( exports.ready )
            exports.emit('update');
        }
    });


    Object.defineProperty( exports, 'length', {
        get: function(){
            return defined.length || ( defined.start && defined.end ) && defined.end - defined.start;
        },
        set: function( v ){
            if( v == defined.length ) return;
            defined.length = v;
            if( !exports.ready && defined.start || defined.end ){
                exports.ready = true;
                exports.emit('ready');
            }else if( exports.ready )
            exports.emit('update');
        }
    });

    exports.shift = function( amount ){
        if( defined.start ) defined.start += amount;
        if( defined.end ) defined.end += amount;
    }

    exports.getPercentValue = function( percent ){
        return exports.start + ( exports.length * percent  );
    }

    exports.getValuePercent = function( value ){
        return ( value - exports.start ) / exports.length;
    }

    return exports;

}, { extend: 'events' } );