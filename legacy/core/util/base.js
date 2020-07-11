define('util', ['util/string',  'util/number', 'util/array', 'util/object', 'util/inherits', 'util/time/base'], function( string, number, array, object, inherits, time ){
	
    var exports = this.exports;

    exports.string = string;
    exports.array = array;
    exports.object = object;
    exports.inherits = inherits;
    exports.time = time;
    exports.number = number;

    exports.Inheritor = function(){
        if( this.super_ && this.super_.length > 0 ){
            for( var i=0; i< this.super_.length; i++){
                this.super_[i].call(this);
            }
        }
    };


    exports.type = function( o, is_type ) {
		var t = Object.prototype.toString.call(o).split(' ').pop().replace(']', '').toLowerCase();
		return is_type ? is_type === t : t;
    };
    
    exports.empty = function( val ){
        var empty;
        if( val === undefined || val === null ) return true;

        switch(exports.type( val )){
            case 'string':
            empty = val.trim().length == 0; 
            break;
            case 'array':
            empty = val.length == 0; 
            break;
            case 'object':
            empty = Object.keys( val ).length == 0; 
            break;
            case 'date':
            break;
        }
        return empty;
    }

    exports.cancel = function(){
        return false;
    }

    return exports;

}, { persistant: true });