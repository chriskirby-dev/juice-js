define('storage/store-base', ['storage', 'events'], function( storage, Events ){
   
    var exports = this.exports;
    var app = this.app;

    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    var StoreCursor = function( store, key ){
        var self = this;
        Events._extend( this );
        self.current = null;
        self.store = store;
        self.key = key;
        self.min = storage.local.get( self.name+':min', 'int' );
        self.max = storage.local.get( self.name+':max', 'int' );
    };

    StoreCursor.prototype.next = function( del ){
        var self = this;
        if( del ){
            self.delete(function(){
                self.current.continue();
                return false;
            });
            return false;
        }
        self.current.continue();
    };

    StoreCursor.prototype.delete = function( callback ){
        var self = this;
        var del = self.current.delete();
        del.onsuccess = callback;
        return false;
    };

    StoreCursor.prototype.load = function(){
        var self = this;
        var store = self.store;
        if( self.key ) store = self.store.index( self.key )

        store.openCursor().onsuccess = function( event ) {
            
            self.current = event.target.result;
           // console.log( self.current );
            if( self.current ){
                self.emit('change', self.current.value, false );
            }else{
                self.complete = true
                self.emit('change', null, self.complete );
                self.emit('complete');
            }
            
        };
        return false;
    }

    var Store = function( name, db ){
        var self = this;
       // Events._extend( this );
       //console.log('Store', name, db);
        self.name = name;
        self.db = db;
        self.store = self.ref();
    };

    Store.prototype.ref = function( callback ){
        var self = this;
        var tx = self.db.transaction( self.name, "readwrite" );
        var store = tx.objectStore( self.name );
        return store;
    };

    Store.prototype.clear = function( callback ){
        var self = this;
        var tx = self.db.transaction( self.name, "readwrite" );
        var store = tx.objectStore( self.name );
        var clearReq = store.clear();
        clearReq.onsuccess = callback;
        return false;
    };

    Store.prototype.count = function( callback ){
        var self = this;
        var tx = self.db.transaction( self.name, "readwrite" );
        var store = tx.objectStore( self.name );
        var clearReq = store.count();
        clearReq.onsuccess = function(){
            callback(clearReq.result);   
        };
        return false;
    };

    Store.prototype.destroy = function( rebuild, callback ){
        var self = this;
        //console.log('Destroy', self.name );
        var min = storage.local.remove( self.name+':min' );
        var max = storage.local.remove( self.name+':max' );

        if( self.database ){
            self.database.destroy( rebuild, callback );
            return false;
        }

        self.db.deleteObjectStore( self.name );
        return false;
    };

    Store.prototype.save = function( data, callback ){

        var self = this;

        var tx = self.db.transaction( self.name, "readwrite" );
        var store = tx.objectStore( self.name );
        var trackKey = storage.local.get( self.name+':track' ) || store.keyPath;
        
        var min = storage.local.get( self.name+':min', 'int' );
        var max = storage.local.get( self.name+':max', 'int' );
        if( app.utils.type( data, 'object' ) ) data = [data];
        var len = data.length;
        var tag = ['SAVED', len, 'records to store', self.name ].join(' ');
        console.time( tag );
        tx.onerror = function(e){
            console.log(e);
        }

        tx.oncomplete = function(){
            self.min = min;
            self.max = max;
            storage.local.set( self.name+':min', min );
            storage.local.set( self.name+':max', max );
            console.timeEnd( tag );
            if(callback) callback();
            return false;
        }

        while( data.length > 0 ){
            var d = data.shift();
            var kv = d[trackKey];
            if( !min || kv < min ) min = kv;
            if( !max || kv > max ) max = kv;
            store.put( d );
        }
        return false;
    };

    Store.prototype.cursor = function( callback ){
        var self = this;
        var tx = self.db.transaction( self.name, "readwrite" );
        var store = tx.objectStore( self.name );
        var key = storage.local.get( self.name+':track' );
        callback( new StoreCursor( store, key ) );
        return false;
    };

    Store.prototype.getAll = function( callback ){
        var self = this;
        var tx = self.db.transaction( self.name, "readwrite" );
        var store = tx.objectStore( self.name );
        store.getAll().onsuccess = function( event ) {
            callback( event.target.result );
            return false;
        };

    }

    Store.prototype.range = function( rangeStart, rangeEnd, callback ){
        
        var self = this;
        var tx = self.db.transaction( self.name, "readwrite" );
        var store = tx.objectStore( self.name );
        var key = storage.local.get( self.name+':track' );
        if( key == store.keyPath ) key = null;

        var result = [];
        var keyRangeValue = IDBKeyRange.bound( rangeStart, rangeEnd );

        var index = key ? store.index( key ) : store; 

        index.getAll( keyRangeValue ).onsuccess = function( event ) {
            callback( event.target.result );
            return false;
        };

        return false;
    };

    exports.Store = Store;

    var StoreDatabase = function( name, version ){
        var self = this;
        Events._extend( this );
        self.db = null;
        self.name = name;
        self.version = version == 'clean' ? 999999 : version || 1;
        self.open();
    };

    StoreDatabase.prototype.store = function( name, options ){
        var self = this;

        if( options ){
            var params = {};
            params.keyPath = options.key || 'id';
            storage.local.remove( name+':min' );
            storage.local.remove( name+':max' );
            var store = self.db.createObjectStore( name, params );
            console.log('Created Store', name )

            if( options.indexes && options.indexes.length > 0 ){
                var indexes = options.indexes;
                for( var i=0;i<indexes.length;i++){
                    var key = indexes.shift();
                    console.log( 'Create Index', key );
                    store.createIndex( key, key, {} );
                }
            }
            
            if( options.track ){
                storage.local.set( name+':track', options.track );
            }
        }else{
            var store = new Store( name, self.db );
            store.database = self;
            return store;
        }
    };

    StoreDatabase.prototype.open = function(){
        var self = this;
        var req = indexedDB.open( self.name, self.version );
        req.onsuccess = function(e) {
            self.db = req.result;
            //console.log('OPENED', self.db );
            //alert('Database successfully opened');
            if( self.db.version == 999999 ){
                self.destroy( true );
                return false;
            }
            self.emit('open', self.db );
        }

        req.onupgradeneeded = function(e) {
            self.db = req.result;
           // console.log('Database upgrade needed ', e );
            var newVersion = e.newVersion;
            var oldVersion = e.oldVersion;
            
            if( newVersion == 999999 ){
                self.destroy( true );
                return false;
            }
            self.emit('upgrade', newVersion, oldVersion );
        };

        req.onerror = function(e) {
            //console.log('Error opening database ');
        };

        req.onblocked = function(e) {
            //console.log(e);
           // console.log('Open Database Blocked... Try closing the database and then deleting it ');
        };
    };

    StoreDatabase.prototype.close = function( callback ){
         var self = this;
         console.log('CLOSE DB', self.name );
         var req = self.db.close();
         req.onsuccess = function(e) {
            console.log('DB Closed');
         };
    }

    StoreDatabase.prototype.destroy = function( rebuild, callback ){
        var self = this;
      //  console.log('DESTROY DB', self.name );
        if( self.db ) self.db.close();
        var req = indexedDB.deleteDatabase( self.name );
        req.onsuccess = function(e) {
            if( callback ) callback();
           //console.log( self.name, 'Database successfully deleted');
            if( rebuild ){
                self.version = 1;
                self.open();    
            }        
            return false;
        };

        req.onupgradeneeded = function(e) {
            //console.log('Database upgrade needed ', e );
            self.db = req.result;
            if( self.version == 999999 ){
                req.abort();
                self.destroy( true );
                return false;
            }
            self.upgraded = true;
            self.emit('upgrade');
        };
        req.onerror = function(e) {
            //console.log('Error deleting database ');
        };
        req.onblocked = function(e) {
            if( self.db ) self.db.close();
            //console.log('Deleting Database Blocked... Try closing the database and then deleting it ');
        };
    }

    exports.Database = StoreDatabase;


    return exports;

});