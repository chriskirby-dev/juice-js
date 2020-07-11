define('price-chart/render', ['price-chart/render/background', 'price-chart/render/candelsticks', 'price-chart/render/trends'], function( background, candelsticks, trends ){
    var exports = this.exports;
    var app = this.app;
    var chart = this.parent;
    exports.chart = chart;
  
    exports.background = background;
    exports.candelsticks = candelsticks;
    exports.trends = trends;

    var getDirectionColor = function( direction, opacity ){
        var color;
        if(!opacity) opacity = 1;
        if( direction == 1 )
        color = "rgba(66, 145, 41, "+opacity+")";
        else if( direction == -1 ) 
        color = "rgba(138, 32, 39, "+opacity+")";
        else if( direction == -0.5 ) 
        color = "#efbf73";
        else if( direction == 0.5 ) 
        color = "#ccef73";
        else
        color = "rgba(0, 0, 0, "+opacity+")";
        return color;
    }

    exports.swings = function( layer, stage, key ){
        var opacity = 1;
        var ctx = layer.view.context();
        
       var swings = chart.data.pairData.swings[key];
        var last;
        for( var i=0;i<swings.length;i++ ){
            var swing = swings[i];
            //Render Body
            if( swing.direction == 1 )
            ctx.strokeStyle = getDirectionColor( swing.direction, opacity );
            else if( swing.direction == -1 ) 
            ctx.strokeStyle = getDirectionColor( swing.direction, opacity );
            else
            ctx.strokeStyle = getDirectionColor( swing.direction, opacity );

            if( last ){
                var diff = Math.abs( last.change ) / Math.abs( swing.change );
               // console.log('Swing diff', diff);
                if( diff > 3 && swing.direction !== 0 ){
                    ctx.strokeStyle = "#f4aa42";
                }
            }

            if( swing.direction == 0 ){
                if( last ){
                    /*
                    var styleSave = ctx.strokeStyle;
                    ctx.lineWidth = 6;
                    ctx.strokeStyle=  getDirectionColor( last.direction );
                    ctx.beginPath();
                    ctx.moveTo( display.plotX( swing.start ), display.plotY( swing.open ) );
                    ctx.lineTo( display.plotX( swing.end ), display.plotY( swing.close ) );
                    ctx.stroke();
                    ctx.closePath();
                    ctx.strokeStyle = styleSave;
                    */
                }
            }

            ctx.lineWidth = swing.direction == 0 ? 2 : 4;
            ctx.beginPath();
            ctx.moveTo( stage.plotX( swing.start ), stage.plotY( swing.open ) );
            ctx.lineTo( stage.plotX( swing.end ), stage.plotY( swing.close ) );
            ctx.stroke();
            ctx.closePath();
            last = swing;

        }
    
    };

    exports.all = function(){
        chart.timeline.render();
        chart.data.update();
        chart.display.render();
        chart.markers.render();
 
    };

    return exports;
});