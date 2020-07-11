define('db/sqlite', [], () => {
    const { app, exports } = this;

    class SQL {

        constructor( config ) {

        }

        insert(){

        }

        select(){
            
        }

        update(){
            
        }

        delete(){
            
        }
        
    }

    const SqlPromise = function( handeler ){
        return {
            success: function( fn ){
                handeler.onsuccess = fn;
            },
            fail: function( fn ){
                handeler.onfail = fn;
            }
        }
    }

    exports.insert = function( ...params ){
        const query = new SqlQuery( ...params )
        return new SqlPromise( query );
    }

    exports.select = function(){
        const query = new SqlQuery()
        return new SqlPromise( query );
    }

    exports.update = function(){
        const query = new SqlQuery()
        return new SqlPromise( query );
    }

    exports.delete = function(){
        const query = new SqlQuery()
        return new SqlPromise( query );
    }

    exports.get = function( table, conditions, options ){

    }

    exports.save = function( records ){

    }

    exports.delete = function( records ){

    }


    return exports;
});