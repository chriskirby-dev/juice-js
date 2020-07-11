define('price-chart/data', [], function PriceChartData(){

    var exports = this.exports;
    var chart = this.parent;

    exports.currentPeriod = null;
    exports.periodModule = null;
    exports.periods = null;
    exports.trades = null;
    exports.available = {};

    exports.lastTrade = null;
    

    exports.clear = function( type ){
        exports[type] = null;
    };

    exports.replace = function( type, data ){
        var loaded = exports[type];

    };

    exports.update = function( ){
        if( exports.periodModule ){
            exports.periodModule.start = chart.timeline.start;
            exports.periodModule.end = chart.timeline.end;
        }
        return false;
    };

    exports.trades = function( trades ){
        exports.lastTrade = trades[trades.length-1];
        chart.markers.set( 'last', exports.lastTrade.rate );
    }

    exports.linkData = function( data ){
        exports.pairData = data;


        data.on('loading', function(){

        });

        data.on('loaded', function(){
           // periods.load( chart.timeline.start, chart.timeline.end, chart.settings.CHART_SEGMENT );
        });

        exports.linkPeriods( data.periods );
        return false;
    };

    exports.linkPeriods = function( periods ){
        exports.periodModule = periods;
        periods.on('loaded', function( data ){
            console.log('chart periods loaded');
            exports.periods = periods.all();
            exports.periodsChanged = true;
            return false;
        });

        periods.on('current', function( current ){
            //console.log( 'current', current );
            var last = exports.periods[exports.periods.length-1];
            if( current.start == last.start ) exports.periods.pop();
            current.changed = true;
            exports.periods.push(current);
            return false;
        });

        console.log('Periods Linked', chart.timeline.start, chart.timeline.end, chart.settings.CHART_SEGMENT );

        periods.head = chart.timeline.end;
        periods.SEGMENT = chart.settings.CHART_SEGMENT;
        periods.load(  );
        
        return false;
    };

    exports.load = function( type, data ){
        if( exports[type] !== undefined ){
            exports[type] = data;
            console.log('Load', type, data );
        }
    };

    return exports;

});