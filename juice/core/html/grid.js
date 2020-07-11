define('html/grid', [], function HtmlGrid( ){
	
    var exports = this.exports;
    var html = this.parent;

    var DEFAULT = {
        wrapper: {
            style: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            width: '100%'
            }
        },
        column: {
            style: {
            position: 'relative',
            flex: '0 0 auto',
            height: '100%',
            boxSizing: 'border-box'
            }
        }
    };

    exports.columns = function( columns ){

        var wrapper = html.Element( DEFAULT.wrapper );
        var cols = [];

        for( var i=0;i<columns.length;i++){
            var params = Object.create( DEFAULT.column );
            for( var prop in columns[i] ){
                params[prop] = columns[i][prop];
            }
            if( i > 0 ) params.style.borderLeft = '1px solid #d2d2d2';
            var column = html.Element( params );
            cols.push( column );
            wrapper.appendChild( column );
        }

        return { 
            wrapper: wrapper,
            columns: cols
        }

    }

    
    exports.create = function( parent, columns, rows ){

        var wrapper = html.Element( DEFAULT.wrapper );

    }

    return exports;

});