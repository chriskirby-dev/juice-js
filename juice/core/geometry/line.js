define('geometry/line', ['geometry/point'], function( Point ){

    var exports = this.exports;

    var Line = function(){
        this.anchor = new Point();
        this.point = new Point();
    };
    

    return Line;

});