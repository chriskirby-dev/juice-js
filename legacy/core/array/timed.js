define('array/timed', [], function(){
    
    var exports = this.exports;

    var defineProp = function( obj, prop, get, set ){
        if(!set) set = function(){ return false; };
        Object.defineProperty( obj, prop, {
            get: get,
            set: set
        });
    };

    var TimedArray = function( span ){
        var self = this;
        self.updateTO = null;
        self.span = span;
        self.data = [];
        self.dates = [];

        defineProp( self, 'start', function(){
            return Date.now() - self.span;
        });

    };

    TimedArray.prototype = Object.create( Array.prototype );
    TimedArray.prototype.constructor = TimedArray;

    TimedArray.prototype.add = function( data, date ){

        var self = this;
        var now = Date.now();
        date = date || now;
        if( date < self.start ) return false;
        self.push( date );
        self.data.push( data );

        if( !self.updateTO ){
            self.setTimer();
        }

        return true;
    };

    TimedArray.prototype.setTimer = function(){
        var self = this;

        var delay = self[0] - self.start;
        self.updateTO = setTimeout(function(){
            self.update();
            return false;
        }, delay );
        return false;
    };

    TimedArray.prototype.update = function(){
        var self = this;
        while( self[0] < self.start ){
            self.shift();
            self.data.shift();
        }
        self.setTimer();
        return false;
    };

    exports.Constructor = TimedArray;
    return exports;

}, { extend: 'array/model' });