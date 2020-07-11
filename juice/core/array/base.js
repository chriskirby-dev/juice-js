define('array', ['array/timed', 'array/sorted'], function( TimedArray, SortedArray ){
    
    var exports = this.exports;

    exports.TimedArray = TimedArray.Constructor;
    exports.SortedArray = SortedArray.Constructor;

    
    
    return exports;

});