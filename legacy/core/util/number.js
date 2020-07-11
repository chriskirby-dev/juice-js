
define('util/number', [], function(  ){
	
    var exports = this.exports;
    var util = this.parent;

    exports.padd = function( num, count, char ){
        while( (""+num).length < count ) num = ( char || "0" )+num;
        return num;
    }

    return exports;

}, { persistant: true });

