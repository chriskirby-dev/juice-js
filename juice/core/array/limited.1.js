define('array/limited', ['array/sorted'], function( SortedArray ){
    
    var exports = this.exports;

    var defineProp = function( obj, prop, get, set ){
        if(!set) set = function(){ return false; };
        Object.defineProperty( obj, prop, {
            get: get,
            set: set
        });
    };

    var LimitedArray = function( data, options ){

        var self = this;
        self.updateTO = null;
        self._max = options.max;
        self._min = options.min;
        self.limitor = options.limitor;
        self.type = options.type;
        self.index = new SortedArray();

        Object.defineProperty( self, 'min', {
            get: function(){
                return self._min;
            },
            set: function( min ){
                self._min = min;
            }
        });

        Object.defineProperty( self, 'max', {
            get: function(){
                return self._max;
            },
            set: function( min ){
                self._min = max;
            }
        });
    
        defineProp( self, 'start', function(){
            return Date.now() - self.span;
        });

    };

    LimitedArray.prototype = Object.create( Array.prototype );
    LimitedArray.prototype.constructor = LimitedArray;

    LimitedArray.prototype.add = function( data ){

        var self = this;
        var limitor = self.limitor ? data[self.limitor] : data;
        if( data[self.limitor] < self.min || data[self.limitor] > self.max ) return false;
        if( self.limitor ){
           var index =  self.index.add( limitor );
           self.splice( index, 0, data );
        }

        self.update();

        if( self.type == 'time' && !self.updateTO ){
            self.setTimer();
        }

        return true;
    };

    LimitedArray.prototype.setTimer = function(){
        var self = this;

        var delay = self[0] - self.start;
        self.updateTO = setTimeout(function(){
            self.update();
            return false;
        }, delay );
        return false;
    };

    LimitedArray.prototype.update = function(){
        var self = this;
        while( self[0] < self._min ){
            self.shift();
            if(self.index) self.index.shift();
        }

        while( self[self.length-1] > self._max ){
            self.pop();
            if(self.index) self.index.pop();
        }
        self.setTimer();
        return false;
    };

    exports.Constructor = LimitedArray;
    return exports;

}, { extend: 'array/model' });