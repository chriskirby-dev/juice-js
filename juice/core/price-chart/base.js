define('price-chart', [ 'debug', 'price-chart/controls', 'price-chart/settings', 'price-chart/markers', 'price-chart/data', 'price-chart/display', 'price-chart/views', 'price-chart/timeline', 'price-chart/render',  'price-chart/rate-marker'], function PriceChart( debug, controls, settings, markers, data, display, views, timeline, render, rateMarker ){

    var exports = this.exports;

    exports.config = settings.config;
    exports.timeline = timeline;
    exports.settings = settings;
    exports.data = data;
    exports.display = display;
    exports.views = views;
    exports.render = render;
    exports.markers = markers;
    exports.debug = debug;

    debug.view.add('timeline', {
        block: null,
        start: null,
        end: null,
        span: null
    });

    debug.view.add('storage', {
        total: null,
        complete: null
    });

    debug.view.wrapper = '#testing-chart';

    exports.resize = function(){
        exports.views.resize();   
    };

    controls.on('DISPLAY_TIME', function( value, complete ){
        exports.timeline.span = value;
        exports.display.changing = true;
        if( exports.display.ready ){
            console.log('Update Display');
            exports.display.view.stage.minX = exports.timeline.start;
            exports.display.view.stage.maxX = exports.timeline.end;
            exports.display.render();
        }
        if( complete ){
            exports.display.changing = false;
            exports.settings.DISPLAY_TIME = value;
        }
    });

    controls.on('CHART_SEGMENT', function( value, complete ){

        exports.debug.view.set('timeline', {
            block: value+'m'
        });

        exports.display.changing = true;

        if( exports.display.ready ){
            var w = exports.display.view.stage.plotX( exports.display.view.stage.minX + (value*1000*60) );
           // exports.display.view.stage.padding.right = Math.ceil( w );
           // exports.timeline.view.stage.padding.right = Math.ceil( w );
            exports.display.view.stage.padding.right = 30;
            exports.timeline.view.stage.padding.right = 30;
        }


        if( complete ){
            exports.settings.CHART_SEGMENT = value;
            exports.display.changing = false;
        }

    });

    controls.on('MA_COUNT', function( value, complete ){
        exports.settings.MA_COUNT = value;
    });
   

    exports.settings.on('wrapper', function( wrapper ){
        console.log('Wrapper Set', wrapper );
        views.wrapper = wrapper;
        exports.timeline.setup();
        exports.display.setup();
        exports.render.all();
        return false;
    });

    rateMarker.on('marker-set', function( marker, value ){
        console.log( marker, value );
    });

    return exports;

});