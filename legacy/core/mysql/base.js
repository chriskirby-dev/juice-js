define('mysql', [ 'mysql/util' ], function( util ){
    
    const { app, exports } = this;

    const mod = require('mysql');

    exports.config = {};
    exports.conn = null;
    exports.connected = false;

    exports.insert = function( table, data, callback, norun ){

        var kv = util.dataToKeyVals( data );
        var query_str = "INSERT INTO "+ table +" ( "+ kv.keys.join(', ') +" ) VALUES ( "+ kv.values.map( v => '?' ).join(', ') +" ); ";
       
        if(norun) return [query_str, values];
       
        return exports.query( query_str, kv.values, callback );

    }

    exports.update = function( table, data, conditions, callback, norun ){
        var values = [];

        var set = util.parseSet( data );
        values = values.concat( set.values );
        
        var where = util.parseWhere( conditions );
        values = values.concat( where.vals );

        var query_str = "UPDATE "+ table +" SET "+ set.query + " WHERE " + where.query;

        if(norun) return [query_str, values];

        return exports.query( query_str, values, callback );

    }

    exports.save = function( table, data, callback ){
        if( data.id ){
            exports.update(table, data, { "id": data.id }, callback);
        }else{
            exports.insert(table, data, callback);
        }
    }


    exports.select = function( table, fields, conditions, callback, norun ){

        var values = [];

        var query_str = "SELECT "+fields+" FROM "+table;

        if( conditions ){
            var where = util.parseWhere( conditions );
            values = where.vals;
            query_str += " WHERE " + where.query;
        }

        if(norun) return [query_str, values];

        return exports.query( query_str, values, callback );

    }

    exports.delete = function( table, conditions, callback, norun ){

        var values = [];

        var query_str = "DELETE FROM "+table;

        if( conditions ){
            var where = util.parseWhere( conditions );
            values = where.vals;
            query_str += " WHERE " + where.query;
        }

        if(norun) return [query_str, values];

        return exports.query( query_str, values, callback );   

    }

    function isColumn( txt ){
        return /([a-z]+)\.([a-z]+)/.test(txt);
    }

    const MySQLChain = function(){
        const self = this;
        self.values = [];
        self.query = [];
    }

    MySQLChain.prototype.select = function( table , ...fields ){
        const self = this;
        var query = ['SELECT'];
        query.push( fields.join(', ') );
        query.push('FROM', table );
        self.query.push( query.join(' ') );
        return self;
    }

    MySQLChain.prototype.insert = function( table , ...fields ){

    }

    MySQLChain.prototype.as = function( alias ){
        const self = this;
        self.query.push( ['AS', alias].join(' ') );
        return self;
    }

    MySQLChain.prototype.join = function( type, table, conditions ){
        const self = this;
        var query = [ type.toUpperCase(), 'JOIN',  table, 'ON' ];
        var vals = [];
        query.push( Object.keys( conditions ).map( k => { 
            var isCol = isColumn( conditions[k] );
            var str = k + ' = '+ ( isCol ? conditions[k] : '?' );
            if( !isCol ) vals.push(conditions[k]);
            return str;
        } ).join(' AND ') );
        self.query.push( query.join(' ') );
        self.values = self.values.concat( vals );
        
        return self;
    }

    MySQLChain.prototype.where = function( conditions ){
        const self = this;
        var query = ['WHERE'];
        query.push( Object.keys( conditions ).map( k => k + ' = ?' ).join(' AND ') );
        self.query.push( query.join(' ') );
        self.values = self.values.concat( Object.values( conditions ) );
        return self;
    }

    MySQLChain.prototype.group = function( ...columns ){
        const self = this;
        var query = ['GROUP BY'];
        query.push( columns.join(', ') );
        self.query.push( query.join(' ') );
        return self;
    }

    MySQLChain.prototype.order = function( ...columns ){
        const self = this;
        var query = ['ORDER BY'];
        query.push.apply( query, columns.join(', ') );
        self.query.push( query.join(' ') );
        return self;
    }

    MySQLChain.prototype.limit = function( limit ){
        const self = this;
        if( !limit ) return self;
        var query = ['LIMIT', limit];
        self.query.push( query.join(' ') );
        return self;
    }

    MySQLChain.prototype.offset = function( offset ){
        const self = this;
        if( !offset ) return self;
        var query = ['OFFSET', offset];
        self.query.push( query.join(' ') );
        return self;
    }

    MySQLChain.prototype.exec = function( callback ){
        let query = this.query.join(' ');
        return exports.query( query, this.values, callback );
    }

    exports.chain = function(){
        return new MySQLChain();
    }

    exports.join = function( type, table, condition ){
        var on = parseWhere( condition );
        var query = type.toUpperCase() + ' JOIN ' + table + ' ON ' + on.query;
        
    }

    const queue = [];

    exports.queue = function( query_str, values, callback ){
        queue.push( arguments );
    }

    exports.query = function(  query_str, values, callback ){

        if( !exports.connected || !exports.conn ) exports.connect();
        if(  exports.busy || exports.connecting ) return exports.queue( query_str, values, callback );
        console.log(query_str, values);
        exports.busy = true;
        exports.conn.query( query_str, values, function (error, results, fields) {
            exports.busy = false;
            if (error) throw error;
            console.log('The result is: ', results );

            if(results.length == 0 ) return callback(null);
            if(results.length == 1 ) return callback(results[0]);
            callback( results );
            
            if(queue.length > 0 ){
                exports.query.apply(exports, queue.shift() );
            }
            return false;
        });
    
        //exports.end();
    
        return false;
    }

    exports.connect = function( callback, config ){

        if( config ) exports.config = config;
        if(!callback) callback = function(){};

        if(exports.connected) return callback( true );

        if(!exports.conn){
            exports.connecting = true;
            exports.conn = mod.createConnection( exports.config );
        }

        exports.conn.connect( function(err) {
            exports.connecting = false;
            if (err) {
              console.error('error connecting: ' + err.stack);

              callback( false );
              return;
            }
            exports.connected = true;
            callback( true );
            if(queue.length > 0 ){
                exports.query.apply(exports, queue.shift() );
            }
            console.log('connected as id ' + exports.conn.threadId);
        });
    }

    exports.end = function(){
        exports.connected = false;
        exports.conn.end();
        exports.conn = null;
    }

    return exports;

});