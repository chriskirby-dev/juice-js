define('price-chart/config', [], function PriceChart( ){

    var exports = this.exports;
    var chart = this.parent;

    exports.data = {};


    Object.defineProperty( exports, 'config', {
        get: function(){
            return exports.data;
        },
        set: function( obj ){
            console.log( 'Set Config', obj );
            exports.data = obj;
            return false;
        }
    });

    return exports.config;

});