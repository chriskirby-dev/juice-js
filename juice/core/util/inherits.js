define('util/inherits', [], function(){
	
    var exports = this.exports;

    var getType = function( o, is_type ) {
		var t = Object.prototype.toString.call(o).split(' ').pop().replace(']', '').toLowerCase();
		return is_type ? is_type === t : t;
	};

    var Inheritor = function(){

    }

    Inheritor.prototype.call = function(){

    };


    var inheritValue = function( base, prop, value ){
        var type = getType( value );
        switch( type ){
            case 'number':
                base[prop] = value;
            break;
            case 'string':
                base[prop] = value;
            break;
            case 'boolean':
                base[prop] = value;
            break;
            case 'object':
                base[prop] = Object.create( value );
            break;
            case 'function':

            break;
        }
    }

    var inheritObject = function( base, extend ){
       
    };

    exports.Instance = function( Constructor, ClassName ){

        if( ClassName )
        return Constructor instanceof ClassName;

        //return Constructor instanceof;
    }
    
	exports.super = function( Constructor, SuperConstructor ) {

		if( !SuperConstructor.prototype ){
			var sup = function(){
                if( this.super_ && this.super_.length > 0 ){
                    for( var i=0; i< this.super_.length; i++){
                        console.log('Call Super', this.super_[i]);
                        this.super_[i].call(this);
                    }
                }
            };
			sup.prototype = SuperConstructor;
			SuperConstructor = sup;
		}
		
        ///Constructor.super_ = SuperConstructor;
        
		Constructor.prototype = Object.create( SuperConstructor.prototype, {
			constructor: {
				value: Constructor,
				enumerable: false,
				writable: true,
				configurable: true
			}
        });
        
        if(!Constructor.super_) Constructor.super_ = [];
		Constructor.super_.push( SuperConstructor );

    };
    
    return exports.super;

    return function( /* target, extend */ ){
        var args = Array.prototype.slice.call( arguments );
        var Constructor = args.shift();

        /*
        while( args.length > 0 ){
            var arg = args.shift();
            var type = getType( arg );
            console.log( type );
        }
        */
        return Constructor;
    };

});