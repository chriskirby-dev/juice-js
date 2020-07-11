define('db/sql', [], () => {
    const { app, exports } = this;

    class SQLQuery {


        constructor( params ) {

            const { table, fields, conditions, data } = params;

            const keys = Object.keys( data );
            const values = Object.values( data );

            let pre = '';
            switch( action ){
                case 'select':
                    pre = `SELECT ${fields} FROM ${table} ${where};`;
                break;
                case 'insert':
                    pre = `INSERT INTO ${table} SET ( ${keys.join(', ')} ) VALUES ( ${values.join(', ')} ); `;
                break;
                case 'update':
                    pre = `UPDATE ${table} SET ( ${keys.join(' = ? , ')} ) WHERE ${conditions} `;
                break;
                case 'delete':
                pre = `DELETE FROM ${table} WHERE ${conditions} `;
                break;
            }
            this.str = '';
        }
    }

    class SQL {

        constructor( config ) {
            this.config = config;
        }

        insert( table, data ){
            
        }

        select( table, conditions, options ){
            return this.op( 'DELETE', table, conditions, options, null );
        }

        update( table, data, conditions ){
            return this.op( 'DELETE', table, conditions, null, data );
        }

        delete( table, conditions ){
            return this.op( 'DELETE', table, conditions );
        }

        op( action, table, conditions, options, data ){

        }
        
    }

    return exports;
});