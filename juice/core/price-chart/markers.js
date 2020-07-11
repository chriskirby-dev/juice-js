define('price-chart/markers', [], function PriceChartMarker(){

    var exports = this.exports;
    var chart = this.parent;
    exports.markers = {};
    var gutter = document.querySelector('#testing-chart .gutter');

    exports.render = function(){
        var stage = chart.display.view.stage;
        for( var type in exports.markers ){
            var marker = exports.markers[type];
            var px = stage.plotY( marker.rate )+'px';
            if( px !== exports.markers[type].el.style.top )
            exports.markers[type].el.style.top = px;
        }
    }

    exports.remove = function( type ){
        delete exports.markers[type];
    }

    exports.set = function( type, rate, options ){
        var stage = chart.display.view.stage;
        options = options || {};
        if( !exports.markers[type] ){

            var el = document.createElement('div');
            el.id = 'marker-'+type;
            el.className = 'marker';
            gutter.appendChild( el );

            exports.markers[type] = {
                rate: rate,
                el: el
            };
            exports.markers[type].el.style.top = stage.plotY( rate )+'px';

        }
        
        if( exports.markers[type].rate !== rate ){
            exports.markers[type].rate = rate;
            exports.markers[type].el.style.top = stage.plotY( rate )+'px';
        }

        if( options.color ) exports.markers[type].el.style.backgroundColor = options.color;
        return false;
    };

    return exports;

});