define( 'array/sorted', [ ], function( ){

    var exports = this.exports;
    var utils = this.parent;

    var defineProp = function( obj, prop, get, set ){
    if(!set) set = function(){ return false; };
    Object.defineProperty( obj, prop, {
        get: get,
        set: set
    });
    };

    var SortedArray = function( order, options ){
        var self = this;
        self.order = 'ASC';
        options = options || {};
        self.DISTINCT = options.distinct || true;
        if(order) self.order = order.toUpperCase();

        self._push = self.push;
        self._shift = self.shift;
        self._unshift = self.unshift;

        Object.defineProperty( self, 'first', {
            get: function(){
                return self[0];
            },
            set: utils.cancel
        });

        Object.defineProperty( self, 'last', {
            get: function(){
                return self[self.length-1];
            },
            set: utils.cancel
        });

      
        defineProp( self, ( self.order == 'DESC' ? 'max' : 'min' ), function(){ return self[0] } );
        defineProp( self, ( self.order == 'DESC' ? 'min' : 'max' ), function(){ return self[self.length-1] } );
       

    };

    SortedArray.prototype = Object.create( Array.prototype );
    SortedArray.prototype.constructor = SortedArray;

    SortedArray.prototype.forceSort = function(){

        this.sort( utils.sort[this.order.toLowerCase()] );
    }

    SortedArray.prototype.checkSort = function(){
        var self = this;
        var last;
        var sorted = true;
        for( var i=0;i<self.length;i++){
            var v = self[i];
            if( last ){
                if( self.order == 'ASC' ){
                    if( last > v ){ 
                        sorted = false; 
                      //  console.log('NOT SORTED', last, v, self[i+1]);
                        break; 
                    }
                }else{
                    if( last < v ){ sorted = false; break; }
                }
            }
            last = v;
        }
        return sorted;
    };

    SortedArray.prototype.add = function( v ){
        var self = this;
        v = Number( v );
        var index = self.indexOf( v );
        
        if( self.DISTINCT && index !== -1 ) return index;

        if( self.length == 0 ){
            self._push( v );
            index = 0;
        }else if( self.order == 'ASC' ){
            var action = v < self.first ? '_unshift' : v > self.last ? '_push' : null;
            if( action ){
                self[action]( v );
                index = action == '_unshift' ? 0 : self.length-1;
            }else{
                index = self.findIndex( v, 'RIGHT' );
                self.splice( index, 0, v );
            }
        }else{
            var action = v < self.last ? '_push' : v > self.first ? '_unshift' : null;
            if( action ){
                self[action]( v );
                index = action == '_unshift' ? 0 : self.length-1;
            }else{
                index = self.findIndex( v, 'RIGHT' );
                self.splice( index, 0, v );
            }
        }
        //if( !self.checkSort() ){
           // console.log('NOT Sorted', self.order, v );
            //self.sort();
       // }
        return index;
    };

    SortedArray.prototype.find = function( value ){
        var self = this;
        var index = self.indexOf( value );
        if( index === -1 ){
            if( self.order == 'ASC' ){
                if( value < self.first ) index = 0;
                else if( value > self.last ) index = self.length;
                else index = self.findIndex( value,  'RIGHT' );
            }else{
                if( value > self.first ) index = 0;
                else if( value < self.last ) index = self.length;
                else index = self.findIndex( value, 'RIGHT' );
            }
        }
        return index;
    };

    SortedArray.prototype.findIndex = function( value, align, debug ){

        var self = this;
        if(debug)  console.log('findIndex', value, align, self.order );
        if( !self.first ) return 0;

        if(self.order == 'ASC'){
            if( value < self[0] ) return 0;
            if( value > self[self.last] ) return self.last;
        }else{
            if( value > self[0] ) return 0;
            if( value < self[self.last] ) return self.last;
        }

        if( self.length == 1 ){
            if(self.order == 'ASC')
            return self[0] > value ? 0 : 1;
            else 
            return self[0] < value ? 0 : 1;
        }
        //Gets span of two number array
        var span = function( v, abs ){ return Math.abs( v[0] - v[1] ); };
        //Index: span of scoped array indexes
        var index = [ 0, self.length-1 ];
        //Values: first and last scoped values 
        var values = [ self.first, self.last ];
        //console.log( 'First',  values );
        //index Span
        var ispan = span( index );
        //Value Span
        var dspan = span( values );
       // console.log( 'IS', ispan, 'DS',dspan );
        var lp = null;
        var count = 0;
        while( ispan > 1 ){
            if(debug) console.log('Index', index[0], index[1], 'Values', values[0], values[1]);
            //Dist From Start
            var percent = Math.max( Math.min( span([value, values[0]])/dspan, 1 ), 0);
            var predict;
            if( percent > 0.5 ){
                predict = index[0] + Math.floor( percent * ispan );
            }else{
                predict = index[1] - Math.floor( (1-percent) * ispan );
            }
            //console.log('LP', lp);
            if( lp !== null && lp === predict ){
                console.log('LP Same', predict );
                if( predict == index[0] ) predict++;
                else if( predict == index[1] ) predict--;
            }

            var predicted = self[predict];
             if(debug) console.log( 'LP', lp, 'predict', predict, 'predicted', predicted);
            //Determine Placement
            if( predicted == value ) return predict;
 
            if( self.order == 'ASC' ){
                var key = 0;
                if( predicted > value ) key = 1;
            }else{
                var key = 1;
                if( predicted > value ) key = 0;
            }

            index[key] = predict;
            values[key] = predicted; 
    
            lp = predict;
            //Reset Spans
            ispan = span( index );
            dspan = span( values );
            count++;
        }
        var index = align == 'LEFT' ? index[0] : index[1];
        if( debug ) console.log(index, '--> #', count);
        return index;
    };

    SortedArray.prototype.findAll = function( start, end ){
        var self = this;
        return [ !start ? 0 : self.find( start ), !end ? self.length : self.find( end ) ];
    };

    SortedArray.prototype.clear = function(){
        var self = this;
        while(self.length > 0){
            self.shift();
        }
        return false;
    };


    SortedArray.prototype.has = function( v ){
        return this.indexOf( v ) === -1 ? false : true;
    };

    SortedArray.prototype.remove = function( v ){
        var i = this.indexOf( v );
        this.splice( i, 1 );
        return i;
    };


    exports.Constructor = SortedArray;

    return exports;
});