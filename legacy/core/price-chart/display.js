define('price-chart/display', ['price-chart/selector'], function PriceChartDisplay( selector ){

    var exports = this.exports;
    var app = this.app;
    var chart = this.parent;
    exports.view = null;
    exports.layers = {};
    exports.lastRender = null;
    exports.ready = false;

    exports.shift = function( time ){
        console.log( 'Shift Display', time );
        var layer = exports.layers.background;
        var shiftX =exports.view.stage.plotX( chart.timeline.start + time );
        var imageData = layer.ctx.getImageData( shiftX, 0, exports.view.stage.width-shiftX, exports.view.stage.height );
        layer.ctx.putImageData( imageData, 0, 0);
        layer.ctx.clearRect( exports.view.stage.width-shiftX, 0, shiftX, exports.view.stage.height );
    };

    exports.render = function(){

        var layer = exports.layers.background;
        var stage = exports.view.stage;

        var now = chart.timeline.start;
        var since = now - exports.lastRender;
        exports.view.stage.minX = chart.timeline.start;
        exports.view.stage.maxX = chart.timeline.end;

        //if( exports.lastRender ) exports.shift(since );
        if( chart.data.periods ){
            var highs = chart.data.periods.map(function(p){
                return p.high;
            });
            var lows = chart.data.periods.map(function(p){
                return p.low;
            });
            exports.view.stage.minY = Math.min.apply( null, lows ) * 0.99;
            exports.view.stage.maxY = Math.max.apply( null, highs ) * 1.01;
            if( chart.data.lastTrade ){
                var lastY = exports.view.stage.plotY( chart.data.lastTrade.rate );
                
            }
            chart.render.candelsticks( exports.layers.candelsticks, stage );


            chart.render.trends( exports.layers.trends, stage );
            exports.layers.swings.view.clear();
            chart.render.swings( exports.layers.swings, stage, 'high' );
            chart.render.swings( exports.layers.swings, stage, 'low' );

           // chart.render.swings( exports.layers.swings, stage, 'open' );
           // chart.render.swings( exports.layers.swings, stage, 'close' );
        }

        chart.render.background( layer, stage );

        if( selector.active ){
            selector.render();
        }

        exports.lastRender = now;
        return false;
    };

    var initializeActions = function(){

    };

    exports.setup = function(){
        exports.view = chart.views.add('display');
        //exports.view.stage.padding.right = 50;
        exports.view.stage.minX = chart.timeline.start;
        exports.view.stage.maxX = chart.timeline.end;

        exports.layers.background = exports.view.stage.layer('background', 0 );
        exports.layers.candelsticks = exports.view.stage.layer('candelsticks', 10 );
        exports.layers.trends = exports.view.stage.layer('trends', 20 );
        exports.layers.swings = exports.view.stage.layer('swings', 30 );

        //console.log( exports.view );

        selector.setup( exports.view  );
        selector.on('selection', function( dates, rates ){
            //console.log('Dates', dates, 'Rates', rates );
        });
        exports.ready = true;
    };

    return exports;

});