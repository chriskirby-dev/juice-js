define( 'extend', [], function(){
    const { exports, juice } = this;

    exports.extend = function( base, ...modules ){
        juice.require( ...modules, function(){

        });
    }

    return exports;
});