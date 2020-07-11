
define('util/string', [], function(){
	
    var exports = this.exports;
    var util = this.parent;

    exports.break = function( string, offset, count ){
        if( !offset && !count ) return string;
        if( !count ) return [ string.slice( 0, offset ), string.slice( offset+1 )];
        return util.array.removeEmpty( [ string.slice( 0, offset ), string.slice( offset, offset+count ), string.slice( offset + count ) ] );
    }
    
    exports.empty = function( string ){
        if( string === undefined || string == null ) return false;
        return string.trim().length == 0;
    }

    exports.upper = function( string, offset, count ) {
        if( !count && !offset ) return string.toUpperCase();
        var parts = exports.break( string, offset, count );
        var target = offset == 0 ? 0 : 1;
        parts[target] = parts[target].toUpperCase();
        return parts.join('');
    };
    
    exports.lower = function( string, offset, count ) {
        if( !count && !offset ) return string.toLowerCase();
        var parts = exports.break( string, offset, count );
        var target = offset == 0 ? 0 : 1;
        parts[target] = parts[target].toLowerCase();
        return parts.join('');
	};

    exports.capital = function( string ) {
        return exports.upper( string.charAt(0) ) + string.slice(1)
	};

    exports.pascal = function( words ) {
        var w = words.trim().split(' ');
        console.log(w);
        return util.array.each( exports.capital, w ).join(' ');
    };

    exports.camel = function( words ) {
        var w = words.trim().split(' ');
        return w[0].toLowerCase() + util.array.each( exports.capital, w.slice(1) ).join(' ');
    };
    
    exports.unCamel = function( camel, seperator ) {
        if( !seperator ) seperator = ' ';
        var upperWords = util.array.removeEmpty( camel.split(/(?=[A-Z][a-z])/) );
        lowerWords = upperWords.map( item => item.toLowerCase() );
        return lowerWords.join( seperator );
	};

    return exports;

}, { persistant: true });

