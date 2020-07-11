define('geometry/point', [], function(){

    var exports = this.exports;

    var Point = function( ptype ){

        var type = '2d';
        if( arguments.length == 1 || arguments.length == 3 ) 
        type = arguments[0];
        
        this.x = 0;
        this.y = 0;

        if( type == '3d' ) this.z = 0;

    };

    return Point;

});