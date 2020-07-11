define('price-chart/render/trends', [], function(){
    var exports = this.exports;
    var app = this.app;
    var render = this.parent;
    var lastRender;
    var lastComplete;

    var findMainTrend = function( layer, stage, periods ){

        var ctx = layer.view.context();
        layer.view.clear();
        var highs = periods.map(function(p){
            return p.high;
        });

        var lows = periods.map(function(p){
            return p.low;
        });

        var low = Math.min.apply( null, lows );
        var high = Math.max.apply( null, highs );

        var hi = highs.indexOf( high );
        var li = lows.indexOf( low );

        var hp = periods[hi];
        var lp = periods[li];

       // console.log( hp, lp );

        var hx = stage.plotX( hp.start );
        var hy = stage.plotY( hp.high );

        var lx = stage.plotX( lp.start );
        var ly = stage.plotY( lp.low );

        ctx.beginPath();
        ctx.arc( hx, hy, 6, 0, 2*Math.PI );
        ctx.fillStyle = "#6bf441";
        ctx.fill();

        ctx.beginPath();
        ctx.arc( lx, ly, 6, 0, 2*Math.PI );
        ctx.fillStyle = "#d61515";
        ctx.fill();


        for( var i=0;i<periods.length;i++){
            var last = periods[i-1];
            var current = periods[i];
            var next = periods[i+1];

            if( i > 1 && i < periods.length-3 ){
                var lh = Math.max( periods[i-1].high, periods[i-1].high );
                var ll = Math.max( periods[i-1].low, periods[i-1].low );
                
                var rh = Math.max( periods[i+1].high, periods[i+1].high );
                var rl = Math.max( periods[i+1].low, periods[i+1].low );
                
                var ch = periods[i].high;
                var cl = periods[i].low;

                if( lh < ch && rh < ch ){
                    ctx.beginPath();
                    ctx.arc( stage.plotX( periods[i].start ), stage.plotY( ch ), 6, 0, 2*Math.PI );
                    ctx.fillStyle = "#d61515";
                    ctx.fill();
                }

                if( ll > cl && rl > cl ){
                    ctx.beginPath();
                    ctx.arc( stage.plotX( periods[i].start ), stage.plotY( cl ), 6, 0, 2*Math.PI );
                    ctx.fillStyle = "#d61515";
                    ctx.fill();
                }

            }
        }

    };
    
    var renderTrends = function( layer, stage ){
        var now = Date.now();
        var ctx = layer.view.context();
        var chart = render.chart;

        var periods = chart.data.periods;
        var segment = periods[0].end - periods[0].start;

       // findMainTrend( layer, stage, periods );

    };

    return renderTrends;
});