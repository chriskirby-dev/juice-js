define('price-chart/controls', ['ui/range'], function( range ){

    var exports = this.exports;
    var app = this.app;
    
    //Period Segment Range Input
    var rangeSegment = range.create('chart-segment');
    rangeSegment.on('change', function( value, complete ){
        exports.emit('CHART_SEGMENT', value, complete );
        return false;
    });

    //MA Count Range Input
    var rangeMA = range.create('ma-count');
    rangeMA.on('change', function( value, complete ){
        exports.emit('MA_COUNT', value, complete );
        return false;
    });

    //Chart Time Range Input
    var rangeTime = range.create('chart-display-time');
    
    rangeTime.beforeChange = function( v ){
        var value;
        if( v <= 4 ){
            value = v*15;
        }else if( v <= 27 ){
            value = (v-4)*60;
        }else{
            value = (v-27)*(1440);
        }
        return value;
    };

    rangeTime.labelFormat = function( v ){
        var label = '';
        if( v < 60 ){
            label = (v).toFixed(2) + ' Minutes';
        }else
        if( v < 1440 ){
            label = (v/60).toFixed(2) + ' Hours';
        }else{
            label = (v/1440).toFixed(2) + ' Days';
        }
        return label;
    };

    rangeTime.on('change', function( value, complete ){
        var ms = value*app.utils.time.minute;
        exports.emit('DISPLAY_TIME', ms, complete );
        return false;
    });



    return exports;

}, { extend: 'events' });