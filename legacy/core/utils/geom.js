define('utils/geom', [], function(  ){

    const { app, exports } = this;

    var Point = function( ...args ){

        const coords = ['x', 'y', 'z'];
        this.value = {};

        if( typeof x == 'string' && x.charAt(1).toLowerCase() == 'd' ){
            this.dimentions = coords.slice( 0, Number(x.charAt(0)) );
            args = [];
        }else{
            this.dimentions = coords.slice( 0, args.length+1 );
        }

        for( var i=0;i<this.dimentions.length;i++ )
            this.initializeDimention( this.dimentions[i], args[i] );

    }

    Point.prototype.initializeDimention = function( d, v ){

        Object.defineProperty( this, d, {
            get: () => this.value[d],
            set: (v) => { this.value[d] = v; };
        });

        this.value[d] = v; 

    }

    exports.Point = Point;


     var distToPoint = function( p1, p2 ){

        var xs = 0;
        var ys = 0;
         
        xs = p2.x - p1.x;
        xs = xs * xs;
         
        ys = p2.y - p1.y;
        ys = ys * ys;
         
        return Math.sqrt( xs + ys );
     }

     exports.distance = distToPoint;
     
    return exports;

});