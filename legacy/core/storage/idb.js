define('storage/idb', ['utils', 'events', 'storage/local'], function( utils, Events, local ){

    var exports = this.exports;
    var app = this.app;

    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    var IndexedRequest = function( type, args, events ){
        var req = indexedDB[type].apply( null, args );
         var initializeEvent = function( event ){
            req['on'+event] = function( e ){
                self.event( req, e );
            };
            return false;
        };
        while( events.length > 0 ) initializeEvent( events.shift() );
    };

    var IndexedDB = function( name, version ){
        var self = this;
        Events._extend( this );
        self.name = name;
        self.db = null;
        self.version = version || 1;
        self.upgraded = false;
        self.open();
    }


    IndexedDB.prototype.open = function(){
        var self = this;
        var req = indexedDB.open( self.name, self.version );

        req.onsuccess = function(e) {
            self.db = req.result;
            //alert('Database successfully opened');
            if( self.db.version == 999999 ){
                self.destroy( true );
                return false;
            }
            self.emit('open', self.db );

        }

        req.onupgradeneeded = function(e) {
            self.db = req.result;
            //console.log('Database upgrade needed ', e );
            var newVersion = e.newVersion;
            var oldVersion = e.oldVersion;
            
            if( newVersion == 999999 ){
                self.destroy( true );
                return false;
            }
            self.emit('upgrade', newVersion, oldVersion );
        };

        req.onerror = function(e) {
            console.log('Error opening database ');
        };

        req.onblocked = function(e) {
            console.log('Open Database Blocked... Try closing the database and then deleting it ');
        };

        var events = ['success','upgradeneeded','blocked','error'];
       
        return false;
    }

    IndexedDB.prototype.destroy = function( rebuild ){
        var self = this;
        console.log('Destroy', self.name );
        if( self.db ) self.db.close();
        var dreq = indexedDB.deleteDatabase( self.name );
        dreq.onsuccess = function(e) {
            alert('Database successfully deleted');
            if( rebuild ){
                self.version = 1;
                self.open();    
            }        
        }

        dreq.onupgradeneeded = function(e) {
            console.log('Database upgrade needed ', e );
             self.db = req.result;
            if( self.version == 999999 ){
                req.abort();
                self.destroy( true );
                return false;
            }
            self.upgraded = true;
            self.emit('upgrade');
        };
        dreq.onerror = function(e) {
            console.log('Error deleting database ');
        };
        dreq.onblocked = function(e) {
            console.log('Deleting Database Blocked... Try closing the database and then deleting it ');
        };

    };

    IndexedDB.prototype.event = function( req, e ){
        var self = this;
        console.log( e.type, e );
        switch( e.type ){
            case 'success':
                self.db = req.result;
                console.log( self.clean, self.upgraded );
            break;
            case 'upgradeneeded':
                self.db = req.result;

                if( self.version == 999999 ){
                    req.abort();
                    self.destroy( true );
                    return false;
                }
                self.upgraded = true;
                self.emit('upgrade');
            break;
            case 'blocked':

            break;
            case 'error':

            break;
        }
    }

    exports.DB = IndexedDB;

    exports.open = function( dbname, version ){
        var db = new IndexedDB( dbname, version );

        db.on('upgradeneeded', function( e ){
            console.log('db upgradeneeded');
        });

        
            db.on('success', function( e ){
                console.log('db success');
            });
    
        /*
        var request = indexedDB.open( dbname );
        request.onsuccess = function(){
            var db = request.result;
            db.onversionchange = function(e) {
                console.log('Version change triggered, so closing database connection ' + e.oldVersion + ' ' + e.newVersion + ' ' +thisDB);
                db.close();
            };
        }
        request.onupgradeneeded = function(){
            console.log('Database upgrade needed ');
        }
        request.onblocked = function(){
            console.log('Database open request blocked ');
        }
        request.onerror = function(){
            console.log('Database open request error ');
        }*/

        return db;
    };

    return exports;

});