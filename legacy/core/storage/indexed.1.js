define('storage/indexed', ['storage/local'], function( local ){

    var exports = this.exports;
    var app = this.app;

    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    exports.db = null;
    exports.store = null;
    exports.structure = {};
    exports.format = {};

    exports.deleteTable = function( name ){
        exports.db.deleteObjectStore( name );
    }

    exports.createTable = function( name, structure ){
        console.log('Create Table', name, structure );
        var options = {};
        options.keyPath = structure.key || 'id';
        
        var store = exports.db.createObjectStore( name, options );

        if( structure.format ) exports.format[name]= structure.format;

        if( structure.indexes ){
            for( var iname in structure.indexes ){
                var idx = structure.indexes[iname];
                var field;
                var iopts = {};
                if( typeof idx == 'string' ){
                    field = idx;
                }else{
                    field = idx.field;
                    delete idx.field;
                    iopts = idx;
                }
                store.createIndex( iname, field, iopts );
            }
        }

        //var titleIndex = store.createIndex("by_title", "title", {unique: true});

        //exports.structure[name] = {};
        
    };

    exports.database = function( dbname, callback ){
        
        var request = indexedDB.open( dbname );

        request.onupgradeneeded = function() {
            exports.db = request.result;
            callback( exports, false );
        }

        request.onsuccess = function() {
            exports.db = request.result;
            callback( exports, true );
        };

        return false;

    };

    var IndexedDBTable = function( name ){
        var self = this;
        self.name = name;
        
    };

    IndexedDBTable.prototype.store = function(){
        var self = this;
        var tx = exports.db.transaction( self.name, "readwrite" );
        return tx.objectStore( self.name );
    };

    IndexedDBTable.prototype.get = function( key, index ){
        var self = this;
        self.store().put( data );
    };

    IndexedDBTable.prototype.getRange = function( start, end, key, callback ){
        var self = this;
        var result = [];
        var keyRangeValue = IDBKeyRange.bound( start, end );
        var store = self.store();
        if( key ){
            var index = store.index( key ); 
        }else{
            var index = store;
        }
        index.getAll( keyRangeValue ).onsuccess = function(event) {
            callback(event.target.result);
        };
/*
         index.openCursor(keyRangeValue).onsuccess = function(event) {
            var cursor = event.target.result;
            if( cursor ){
                result.push( cursor.value );
                cursor.continue();
            }else{
                 
                callback(result);
            }
           
         }
*/
    };

    IndexedDBTable.prototype.save = function( data ){
        var self = this;
        self.store().put( data );
    };

    exports.table = function( name ){
        return new IndexedDBTable( name );
    };

    exports.set = function( prop, value ){
        
        return false;
    };

    exports.remove = function( prop ){
       
        return false;
    };

    return exports;

});