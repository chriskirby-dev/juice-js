define('price-chart/render/background', [], function(){
    var exports = this.exports;
    var app = this.app;
    var render = this.parent;
    var lastRender;
    
    var renderBackground = function( layer, stage ){
        //console.log('renderBackground');
        var ctx = layer.view.context();
        var chart = render.chart;
        layer.view.clear();

        var markerTimes = chart.timeline.markerTimes;

        var start = chart.timeline.start;
        var end = chart.timeline.end;

        if( chart.pairData ){
            if( chart.pairData.trades.min > start ){
                ctx.fillStyle = '#8c8c8c';
                ctx.fillRect( 0, 0, stage.plotX( chart.pairData.trades.min ), stage.height );
            }
        }

        var mark15 = app.utils.time.getSegment( chart.timeline.start, app.utils.time.minute*15 );
        var mark60 = app.utils.time.getSegment( chart.timeline.start, app.utils.time.hour );
        ctx.fillStyle = '#d2d2d2';

        var markAuto = app.utils.time.getSegment( chart.timeline.start, markerTimes[0] );

        while( markAuto.start < chart.timeline.end ){
            var x = stage.plotX( markAuto.start );
            var w = 1;
            ctx.fillRect( x-(w/2), 0, w, stage.height );
            markAuto = markAuto.next();
        }

     //   var lastTrade = chart.data.lastTrade;
      //  var lastRate = lastTrade.rate;
      
        if( stage.minY ){
            var midY = stage.minY + ( ( stage.maxY - stage.minY )/2 );
            var midPercent = midY * 0.01;
            var percentLineY = Math.floor( stage.minY / midPercent ) * midPercent;
            
            while( percentLineY < stage.maxY ){
                ctx.fillRect( 0, stage.plotY( percentLineY ), stage.width, 1 );
                percentLineY += midPercent;
            }
            /*
            perY = midY;
            ctx.fillRect( 0, stage.plotY(perY ), stage.width, 1 );

            while( perY > stage.minY ){
                perY -= midPercent;
                ctx.fillRect( 0, stage.plotY(perY ), stage.width, 1 );
            }*/

        }
       
        /*
        while( mark15.start < chart.timeline.end ){
            var x = stage.plotX( mark15.start );
            ctx.fillRect( x, 0, 0.5, stage.height );
            mark15 = mark15.next();
        }

        while( mark60.start < chart.timeline.end ){
            var x = stage.plotX( mark60.start );
            ctx.fillRect( x, 0, 1, stage.height );
            mark60 = mark60.next();
        }
*/
        ctx.fillStyle = '#e2e2e2';
        var endX = stage.plotX( chart.timeline.end );
        ctx.fillRect( endX, 0, 2, stage.height );

        lastRender = {
            start: chart.timeline.start,
            end: chart.timeline.end
        };
    };

    return renderBackground;
});