define('storage/store', ['storage', 'storage/store-base'], function( storage, store ){
   
    var exports = this.exports;
    var app = this.app;

    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;


    exports.name = null;
    exports._db = null;
    exports.exists = false;
    var local = window.localStorage;

    Object.defineProperty( exports, 'db', {
        get: function(){
            return exports._db;
        },
        set: function( name ){
            exports.name = name;
            requestDB( name );
            return false;
        }
    });

    exports.tmp = function(){
        var dbname = exports.name+'_TMP';
        var tmp = new store.Database( dbname, 'clean' );
        //var tmp = new StoreBase('TMP', options );
        return tmp;
    }

    exports.close = function(){
        exports._db.close();
    };

    exports.create = function( name, indexes, params ){
        var options = {};
        params = params || {};
        if( indexes.length > 0 ){
            options.keyPath = indexes.length > 0 ? indexes.shift() : 'id';
        }

        try{
            var store = exports._db.createObjectStore( name, options );
            console.log('Created Store', name )
        }catch(e){
            return false;
        }

        if( indexes.length > 0 ){
            for( var i=0;i<indexes.length;i++){
                var key = indexes.shift();
                store.createIndex( key, key, {} );
            }
        }

        if( params ){
            if( params.track ){
                console.log(name+':track',params.track );
                storage.local.set( name+':track', params.track );
            }
        }
    
        return false;
    };
    exports.getLocal = function( table, key, type ){
        return storage.local.get( table+':'+key, type );
    }
    exports.getDetail = function( table ){
        var detail = {};
        detail.min = storage.local.get( table+':min', 'int' );
        detail.max = storage.local.get( table+':max', 'int' );
        return detail;
    }

    exports.get = function( table, index, val ){

    };

    exports.find = function( table, key, start, end, callback ){

        var tx = exports.db.transaction( table, "readwrite" );
        var store = tx.objectStore( table );
        if( key == store.keyPath ) key = null;
        var result = [];
        var keyRangeValue = IDBKeyRange.bound( start, end );

        var index = key ? store.index( key ) : store; 

        index.getAll( keyRangeValue ).onsuccess = function( event ) {
            callback(event.target.result);
        };

        return false;
    };

    exports.save = function( table, data, callback, onProgress ){
        /*openDB( exports.name, function( db ){

        });*/
        var tx = exports.db.transaction( table, "readwrite" );
        var store = tx.objectStore( table );
        var prefix = exports.name+':'+table;
        var trackKey = storage.local.get( table+':track' ) || store.keyPath;

        var min = storage.local.get( table+':min', 'int' );
        var max = storage.local.get( table+':max', 'int' );
        
        if( app.utils.type( data, 'object' ) ) data = [data];
        var progress = { total: data.length, complete: -1 };
        //var save = data.slice(0);
        
        if( data.length == 0 ){
             if(callback) callback();
             return false;
        } 

        var tag = 'Saved '+data.length+' Rows to '+table;
        console.time( tag );
        var savedCount = 0;

        tx.oncomplete = function(){
            storage.local.set( table+':min', min );
            storage.local.set( table+':max', max );
            console.timeEnd( tag );
            if(callback) callback();
        };
       
       while( data.length > 0 ){
            var d = data.shift();
            var kv = d[trackKey];
            if( !min || kv < min ) min = kv;
            if( !max || kv > max ) max = kv;
           store.put( d );
       }
        /*
        var insertNextSet = function(){
            
            if( onProgress ){

                progress.complete++;
                debug.view.set('storage', progress );

                onProgress( progress );
            }
            if( data.length == 0 ){
                console.timeEnd( tag );
                //console.log('Min', min, 'Max', max);
                storage.local.set( table+':min', min );
                storage.local.set( table+':max', max );
                store = null;
                tx = null
                if(callback) callback();
                return false;
            }

            var d = data.shift();
            var kv = d[trackKey];
            if( !min || kv < min ) min = kv;
            if( !max || kv > max ) max = kv;

            var req = store.put( d );
            req.onsuccess = insertNextSet;
            req.onerror = function(){
                console.log( 'error', event );
            };

            return false;
        };
        insertNextSet();
        */
        return false;
    };

    exports.open = function( dbname, callback ){

        var request = indexedDB.open( dbname );
        storage.local.prefix = dbname;

        request.onsuccess = function() {
            exports.exists = true;
            callback( request.result );
        };

        return false;
    };

    var requestDB = function( dbname ){

        var request = indexedDB.open( dbname );
        storage.local.prefix = dbname;

        request.onupgradeneeded = function() {
            exports._db = request.result;
            exports.emit('ready');
        }

        request.onsuccess = function() {
            exports.exists = true;
            exports._db = request.result;
            exports.emit('ready');
        };

        return false;
    };


    exports.setup = function( pair ){

        storage.local.prefix = pair+':trades:';

        storage.indexed.database( pair, function( db, exists ){
            if( !exists ){
                db.createTable('trades', { key: 'id', indexes: { date: 'date' } });
                db.createTable('minutes', { key: 'date', indexes: { } });
            }

            exports.db = db;
            exports.trades = exports.db.table('trades');
            exports.minutes = exports.db.table('minutes');

            if(callback) callback();
            return false;
        });
        return false;
    }

    return exports;

}, { extend: 'events' });