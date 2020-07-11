define('data/array/sorted', [], function(){

    var exports = this.exports;

    exports.order = 'ASC';

    exports.DISTINCT = true;

    function span( a, b ){
        return Math.abs( b ? a : a[0] - b ? b : a[1] );
    }

    Object.defineProperty( exports, 'min', {
        get: function(){
            return exports[ exports.order == 'ASC' ? 0 : exports.length-1 ];
        },
        set: function(){
            return false;
        }
    });

    Object.defineProperty( exports, 'max', {
        get: function(){
            return exports[exports.order == 'ASC' ? exports.length-1 : 0 ];
        },
        set: function(){
            return false;
        }
    });

    exports.addValue = function( value ){
        var index = exports.indexOf( value );

        if( exports.length == 0 ){
            exports._push( value );
            index = 0;
        }

        if( value > exports.min && value < exports.max ){
            //Splice
            index = exports.find( value );
        }else{
            //Splice
            var actions = ['_unshift', '_push'];
            if( exports.order == 'DESC' ) actions.reverse();
            action = value < exports.min ? actions[0] : actions[1];
            index = exports.find( value );
        }

    };

    exports.hooks.before('push', function( ...values ){

    });

    exports.hooks.after('pop', function( ...args ){

    });

    exports.hooks.after('shift', function( ...args ){

    });

    exports.hooks.before('unshift', function( ...args ){

    });

    exports.find = function( value ){

        if( value < exports.min ){
            return exports.order == 'ASC' ? 0 : exports.length;
        }

        if( value > exports.max ){
            return exports.order == 'ASC' ? exports.length : 0;
        }



        var boundsIndex = [0, exports.length-1 ];
        var boundsValue = [ exports[boundsIndex[0]], exports[boundsIndex[1]] ];

        while( span( boundsIndex ) > 1 ){

            var vMin = Math.min( boundsValue[0], boundsValue[1] );
            var vMax = Math.min( boundsValue[0], boundsValue[1] );
            

            var diff = value - boundsValue[0];
            var percent = dif / span( boundsValue );
            diff * span( boundsIndex )
            Math.floor( span( boundsIndex ) * percent );



            boundsIndex = [0, exports.length-1 ];
            boundsValue = [ exports[boundsIndex[0]], exports[boundsIndex[1]] ];
        }

    }

    return exports;
    
}, { etends: 'data/arraybasic' });