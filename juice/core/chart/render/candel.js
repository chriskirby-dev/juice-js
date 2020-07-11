define('chart/render/candel', [], function(){

    var exports = this.exports;
    var app = this.app;
    var chart;
    
    var renderCandel = function( candel ){

    };

    exports.link = function( _chart ){
        chart = _chart;
    };

    exports.render = function( data ){
        for( var i=0;i<data.length;i++ ){
            renderCandel( data[i] );
        }
    };


    return exports;

});