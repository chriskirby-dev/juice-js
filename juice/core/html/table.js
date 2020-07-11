define('html/table', ['util'], function( util ){
	
    var exports = this.exports;
    var html = this.parent;
    var global = this.global;
    global.tblIndex = global.tblIndex || 0;

    var DEFAULT = {
        wrapper: {
            type: 'table',
            style: {
                position: 'relative',
                width: '100%',
                padding: 0,
                textAlign: 'center'
            },
            attrs: {
                cellpadding: 0,
                cellspacing: 0,
                border: 0
            }
        },
        column: {
            style: {
            position: 'relative',
            flex: '0 0 auto',
            height: '100%',
            boxSizing: 'border-box'
            }
        },
        style: {
            th: {
                backgroundColor: '#d2d2d2',
                color: '#333'
            },
            td: {
                borderBottom: '1px solid #d2d2d2',
                borderRight: '1px solid #d2d2d2',
            },
            'td:last-child': {
                borderRight: '0'
            }
        }
    };

    var HtmlTable = function( options ){
        this.data = [];
        this.idx = global.tblIndex;
        global.tblIndex++;
        this.id = 'tbl-'+this.idx;
        this.ci = 0;
        this.maxColumns = 0;
        this.stylesheet = html.stylesheet.use( this.id );
        var style = {};
        style['#'+this.id] = {};
        if( options.style ){
            style['#'+this.id] = options.style;
        }
        if( options.fixed ){
            style['#'+this.id]['table-layout'] = 'fixed';
        }

        for( var sel in DEFAULT.style ){
            style[ '#'+this.id+' '+sel ] = DEFAULT.style[sel];
        }

        if( options.stylesheet ){
            for( var sel in options.stylesheet ){
                style[ '#'+this.id+' '+sel ] = options.stylesheet[sel];
            }
        }

        this.stylesheet.define( style );
        this.wrapper = html.Element( DEFAULT.wrapper );
        this.wrapper.id = 'tbl-'+this.idx;
        this.etypes = { row: 'td', heading: 'th' };
        this.ecache = {};
    };

    HtmlTable.prototype.prepairData = function( data, id ){
        var dataset = {};
        if( typeof data == 'string' || typeof data == 'number' ){
            dataset.content = data;
        }else if( util.type( data, 'object' ) ){
            dataset = data;
        }else if( util.type( data, 'array' ) ){
            dataset.content = data.join(' ');
        }
        return dataset;
    };


    HtmlTable.prototype.find = function( id ){
        var self = this;
        if( self.ecache[id] ){
            return self.ecache[id];
        }
        return document.getElementById( self.id+'-'+id );
    };

    HtmlTable.prototype.addDataRow = function( type, data ){
        var self = this;
        var row = {};
        if( util.type( data, 'array' ) ){
            for( var i=0;i<data.length;i++ ){
                var d = data[i];
                var id = self.id+'-'+self.idx+"-"+type+"-"+self.ci;
                self.ci++;
                row[id] = self.prepairData( d );
            }
        }else{
            for( var id in data ){
                row[self.id+'-'+id] = self.prepairData( data[id] );
            }
        }
        this.data.push({ type: type, content: row });
        return row;
    }

    HtmlTable.prototype.addHeading = function( content ){
        this.maxColumns = Math.max( this.maxColumns.length, content.length );
        this.addDataRow( 'heading', content );
    }

    HtmlTable.prototype.addRow = function( content ){
        this.maxColumns = Math.max( this.maxColumns.length, content.length );
        this.addDataRow( 'row', content );
    }

    HtmlTable.prototype.build = function( parent ){
        var self = this;
        var html = '';
        for( var i=0;i<this.data.length;i++){
            var data = this.data[i];
            var content = data.content;
            var etype = this.etypes[data.type];
            var row = '<tr>'
            for( var id in content ){
                row += '<'+etype+' id="'+id+'" >';
                row += content[id].content;
                row += '</'+etype+'>';
            }
            row += '</tr>';
            html += row;
        }
        this.wrapper.innerHTML = html;
        if( typeof parent == 'string'){
            parent = document.querySelector( parent );
        }
        console.log( parent );
        parent.appendChild( self.wrapper );

        return this.wrapper;
    }



    return HtmlTable;

});