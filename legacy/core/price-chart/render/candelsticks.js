define('price-chart/render/candelsticks', [], function(){
    var exports = this.exports;
    var app = this.app;
    var render = this.parent;
    var lastRender;
    var lastComplete;

    var renderStick = function( layer, stage, period, erase ){
        //console.log( 'renderStick', period );
        var ctx = layer.view.context();
        if( !period ) return false;
        var xStart = stage.plotX( period.start );
        var xEnd = stage.plotX( period.end );
        var width = xEnd - xStart;

        if( erase ){
            ctx.clearRect( xStart, 0, width, stage.height );
        }

        var bodyY1 = stage.plotY( period.open );
        var bodyY2 = stage.plotY( period.close );
        var bw = width*0.7;
        var bx = xStart+( width * 0.15 );
        var bh = Math.abs( bodyY1 - bodyY2 );
        var by = Math.min( bodyY1, bodyY2 );

        var highY = stage.plotY( period.high );
        var highY2 = stage.plotY( period.low );
        var lw = Math.max( width*0.1, 1 );
        var lh = Math.max( highY2 - highY, 1);
        var lx = ( xStart + (width/2) ) - ( lw/2 );
        /*
        var vper = period.volume.total/(chart.pair.data.volume24/24);
        //console.log(vper);
        var vh = vper*stage.height;
        var vy = stage.height- vh;
        ctx.fillStyle = "#d2d2d2";
        ctx.fillRect( bx, vy, bw, vh );
*/
        //Render Line
        ctx.fillStyle = "#000000";
        ctx.fillRect( lx, highY, lw, lh );
        //console.log(lx, highY, lw, lh);
        //Render Body
        if( period.open < period.close )
        ctx.fillStyle = "rgba(38, 184, 23, 1)";
        else if( period.open > period.close ) 
        ctx.fillStyle = "rgba(177, 0, 0, 1)";
        else
        ctx.fillStyle = "#000000";
        
        ctx.fillRect( bx, by, bw, Math.max( bh, 1 ) );
    };


    var renderAll = function( layer, stage, periods ){
        layer.view.clear();
        for( var i=0;i<periods.length;i++){
            var period = periods[i];
            renderStick( layer, stage, period );
        } 
    };
    
    var renderCandelsticks = function( layer, stage ){
       //console.log('renderCandelsticks');
        var now = Date.now();
        var ctx = layer.view.context();
        var chart = render.chart;
        var forceRefresh  = false;
        var periods = chart.data.periods;
        //console.log( periods );
        var segment = periods[0].end - periods[0].start;

        var dend = periods[0].start;
        var loadingTMP;
        if( periods[0].start > stage.minX ){
            loadingTMP = {
                end: periods[0].start-1,
                start: stage.minX
            };
            var lspan = (periods[0].start-1) - stage.minX;
            loadingTMP.width = stage.plotX( stage.minX + lspan );
        }

        var current = periods[periods.length-1];
        if( current.end < now ) current = null;


        if( chart.data.periodsChanged || chart.display.changing ){
            forceRefresh = true;
            delete chart.data.periodsChanged;
            lastRender = null;
           
        }


        if( lastRender && !forceRefresh ){

            if( chart.timeline.span !== lastRender.span ){
                renderAll( layer, stage, periods );
            }
            if( segment !== lastRender.segment ){
                renderAll( layer, stage, periods );
                
            }else{
                var diff =  chart.timeline.start - lastRender.start;
                if( diff !== 0 ){
                    layer.view.shift( stage.plotX( chart.timeline.start+diff ) );
                }
                renderStick( layer, stage, current, true );
            }

        }else{
            renderAll( layer, stage, periods );
        }

        if( loadingTMP && !lastRender ){
            ctx.fillStyle = "rgba(147, 211, 19, 0.4)";
            ctx.fillRect( 0, 0, loadingTMP.width, stage.height );
        }


        lastRender = {
            current: current,
            segment: segment,
            span: chart.timeline.span,
            start: chart.timeline.start,
            end: chart.timeline.end
        };
    };

    return renderCandelsticks;
});