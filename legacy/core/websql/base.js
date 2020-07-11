// JavaScript Document
define('websql', [], function(){
	
	var exports = this.exports;
	
	var isType = function( type, it ) {
		return Object.prototype.toString.call(it) === '[object '+type.charAt(0).toUpperCase() + type.slice(1)+']';
	};
	
	var returnFn = function( result, callback ){
	
		var processObj = function(o){
			var n = {};
			for(var key in o){
				var v = o[key];
				if(v == "false") v = false;
				if(v == "true") v = true;
				n[key] = v;
			}
			return n;
		};
		
		if(isType('array', result )){
			result = result.map( processObj );
		}else{
			result = processObj(result);
		}
	
		if(callback) callback(result);
		return false;
	};
	
	function Database( name, size, descr, version ){
		
		if(!size) size = 1 * 1024 * 1024;
		if(!descr) descr = name + ' database';
		if(!version) version = '1.0';
		this.name = name;
		this.db = window.openDatabase( name, version, descr, size  );
		this.version = this.db.version;
		this.tx = null;
		this.structure = { config: {}, tables: {} };
		this.index = { tables: [] };
	};
	
	Database.prototype.backupTable = function( _tbl_name, filename ){
		/*
		var fs = require('fs');
		var stream = fs.createWriteStream(ROOT+'/backups/'+_tbl_name+'_'+new Date().getTime()+".sql");
		stream.once('open', function(fd) {
			
		transaction.executeSql("SELECT * FROM " + _tbl_name + ";", [], 
			function(transaction, results) {
				if (results.rows) {
					for (var i = 0; i < results.rows.length; i++) {
						var row = results.rows.item(i);
						var _fields = [];
						var _values = [];
						for (col in row) {
							_fields.push(col);
							_values.push('"' + row[col] + '"');
						}
						stream.write(";\nINSERT INTO " + _tbl_name + "(" + _fields.join(",") + ") VALUES (" + _values.join(",") + ")");
					}
					stream.end();
				}
			}
		);
		
		return false;
		});
		return;
		*/
	};
	
	Database.prototype.sql = function( SQL, args, next ){
		this.db.transaction(function (tx) {
			//console.log(SQL);
			if(!args) args = [];
			tx.executeSql( SQL, args, function(){
				//console.log(arguments);	
				if(next) next();
				
			});
		});
		
	};
	
	Database.prototype.createTable = function( table, structure, callback ){
		var self = this;
		var SQL = ['CREATE TABLE IF NOT EXISTS'];
		SQL[1] = table;
		SQL[2] = '('+structure+')';
		var createSQL = SQL.join(' ');
		self.structure.config[table] = {};
		structure.split(',').map(function( colTxt ){		
			var parts = colTxt.trim().split(' ');
			var key = parts.shift();
			self.structure.config[table][key] = parts;
			return colTxt.trim();
		});

		try {
			this.db.transaction(function (tx, results) {
				tx.executeSql( createSQL, [], function(){
					if(callback) callback( true );
				});
			});	
		} catch(e){
			alert("Error processing SQL: "+ e.message);
			err = e.message;
			if(callback) callback( false );
		}
	};
	
	Database.prototype.execute = function( sql, params, callback ){
		
		var self = this;
		if(!params) params = [];
		if(!callback){
			if( typeof params == 'function' ){
				callback = params;
				params = [];
			}
		}
		if(!sql){
			console.log('Exiting SQL no cammand supplied.');
			return callback(null);
		}
		
		if(self.txTO) clearTimeout(self.txTO);
		
		var execute = function( tx ){
			self.tx = tx;
			self.tx.executeSql( sql, params, function( tx, result ){
				//console.log( JSON.stringify( arguments ) );
				if(callback) callback(result);
				self.txTO = setTimeout(function(){
					self.tx = null;
				}, 1000 );
			});
		};
		
		if( self.tx ){
			execute( self.tx );
		}else{
			self.db.transaction( execute );
		}
		return false;
	};
	
	Database.prototype.getStructure = function( next ){ 
		var self = this;
		var sql = "SELECT * FROM sqlite_master WHERE type='table' ORDER BY name";
		var tableData = {};
		
		self.execute( sql, function( results ){
			//console.log( results );
			if(results.rows.length > 0){
				
				for (var i = 0; i < results.rows.length; i++) {
					var row = results.rows.item(i);
				  	if(row.name.indexOf('__') !== -1 ) continue;
				    tableData[row.name] = { sql: row.sql, fields: {} };
					var tsql = row.sql.split('(').slice(1).join('(');
					tsql = tsql.split(')').reverse().slice(1).reverse().join(')');
					
					var fields = {};
					tsql.split(',').map(function( field ){
						var parts = field.trim().split(' ');
						tableData[row.name].fields[parts[0]] = parts.slice(1);
					});
					
				}
				self.structure.tables = tableData;
				self.index.tables = Object.keys( tableData );
			}
			
			//console.log(self.structure);
			if(next) next();
		});
		return false;
	};
	
	Database.prototype.verifyStructure = function( callback ){
		var self = this;
		var configTables = Object.keys(self.structure.config).sort();
		var existTables = Object.keys(self.structure.tables).sort();
		
		var verifyTable = function( table, next ){
			
			var configCols = Object.keys( self.structure.config[table] ).map(function( colTxt ){
				return colTxt.split(' ').shift();
			});

			var existsCols = Object.keys( self.structure.tables[table].fields );
			
			while(existsCols.length > 0 ){
				var col = existsCols.shift();
				if(configCols.indexOf(col) !== -1){
					configCols.splice( configCols.indexOf(col), 1 );
				}
			}
			
			if( configCols.length > 0){
				console.log('NEEDS UPDATE :'+table);
				var updateStatements = configCols.map(function( updateCol ){
					var colstr = self.structure.config[table][updateCol].join(' ');
					var sql = "ALTER TABLE "+table+" ADD "+updateCol+" "+colstr+"";
					return sql;
				});
				console.log(JSON.stringify( updateStatements ));
				self.run(updateStatements);
			}
			

			
			next();
		};
		
		var verifyNextTable = function(){
			if(configTables.length > 0){
				var table = configTables.shift();
				verifyTable( table, function(){
					verifyNextTable();
				});
			}else{
				if(callback) callback();
			}
		};
		verifyNextTable();
	};
	
	Database.prototype.createStructure = function( structure, callback ){
		var self = this;
		var structures = [];
		
		var tables = Object.keys(structure);
		console.log('DB Version '+self.db.version);

		var createNextTable = function(){
			var table = tables.shift();
			
			self.createTable( table, structure[table], function(){
				if(tables.length > 0){
					createNextTable();
				}else{
					self.getStructure( function(){
						if( callback ) callback();
						return false;
					});
				}
				return false;
			});
			return false;
		};
		
		createNextTable();
		return false;
	};
	
	Database.prototype.getSQL = function(  cmd, table, options, data ){
		var self = this;
		var SQL = [];
		if(!options) options = {};
	
		var condits = ( options.conditions ? options.conditions : options );
		
		var tbl_fields = null;
		if( self.structure.tables[table] ){
			tbl_fields = Object.keys( self.structure.tables[table].fields );
			
			if( cmd == 'UPDATE' && data && tbl_fields.indexOf('updated') !== -1 && !data.updated ){
				data.updated = new Date().getTime();
			}
			
			if( cmd == 'INSERT' && tbl_fields.indexOf('created') !== -1 && !data.created ){
				data.created = new Date().getTime();
			}
		}
		
		function stringifyObject(o){
			for( var key in condits ){
				qs.push(key +' = ? ');
				vals.push(condits[key]);
			}
		}
		
		function stringifyKeys(o){
			return Object.keys(o).join(', ');
		}
		
		function qStr(c){
			var a = [];
			while(a.length < c) a.push('?');
			return a.join(', ');
		}
		
		SQL.push(cmd);
		
		var args = [];
		
		var mapValues = function(){
			
		};
		
		switch(cmd){
			case 'INSERT':
				SQL.push('INTO');
				SQL.push(table);
				
				var vals = Object.keys( data ).map(function(k){ return data[k]; });
				args = vals;
				SQL.push('( '+stringifyKeys(data)+' ) VALUES ( '+qStr(vals.length)+' )');
			break;
			case 'SELECT':	
				if(options.fields){
					SQL.push( options.fields.join(', ') );
				}else{
					SQL.push('*');
				}
				SQL.push('FROM');
				SQL.push(table);
	
			break;
			case 'UPDATE':
				SQL.push(table);
				SQL.push('SET');
				SQL.push( Object.keys( data ).join(' = ?, ')+' = ?' );
				var vals = Object.keys( data ).map(function(k){ return data[k]; });
				args = vals;
			break;		
			case 'DELETE':
				SQL.push('FROM');
				SQL.push(table);
			break;
		}
		
		function parseKey( key ){
			var parsed = {};
			var operator = '=';
			var modifiers = ['!','<','>','LIKE'];
			var operators = ['!=','<','>','LIKE'];
			if( key.indexOf(' ') !== -1 ){
				var parts = key.split(' ');
				parsed.modifier = parts.pop();
				parsed.key = parts.pop();
			}else{
				parsed.key = key;
			}
			console.log(parsed);
			var opIndex = !parsed.modifier ? -1 : modifiers.indexOf(parsed.modifier);
			if(opIndex !== -1) operator = operators[opIndex];
			var str = parsed.key +' '+operator+' ?';
			return str;
		}
		
		if(Object.keys(condits).length > 0){
			
			SQL.push('WHERE');
			var sqlstmts = [], values = [];
			
			for(var k in condits){
				var modifier, _k;
				if(k == 'OR'){
					var sqlstr = '';
					var OR = condits[k];
					var ORVals = [], ORStrings = [];
					for(var ok in OR){
						//console.log(parseKey(ok));
						ORStrings.push(parseKey(ok));
						ORVals.push(OR[ok]);
					}
					values = values.concat(ORVals);
					sqlstr += '('+ORStrings.join(' OR ')+')';
					condits[k] = 'SKIP';
					sqlstmts.push(sqlstr);
					continue;
				}
				
				if(k.indexOf(' ')){
					var parts = k.split(' ');	
					_k = parts[0];
					modifier = parts[1];
				}else{
					_k = k;	
				}
				
				var sqlstr = _k;
				if( condits[k] == null ){
					sqlstr += ' IS '+(modifier == '!' ? 'NOT ' : '')+'NULL';
					condits[k] = 'SKIP';
				}else{
					if(modifier){
						switch(modifier){
							case '!':
							sqlstr += ' != ?';
							break;
							case '<':
							sqlstr += ' < ?';
							break;
							case '>':
							sqlstr += ' > ?';
							break;
							case 'LIKE':
							sqlstr += ' LIKE ?';
							break;
						}
					}else{
						sqlstr += ' = ?';
					}
					
				}
				sqlstmts.push(sqlstr);
				if(condits[k] != 'SKIP')
				values.push(condits[k]);
				
			}
			
			//SQL.push( Object.keys( condits ).join(' = ? AND ')+' = ?' );
			SQL.push( sqlstmts.join(' AND ') );
			//var vals = Object.keys( condits ).map(function(k){ return condits[k]; });
						
			args = args.concat(values);
			//console.log(args);
		}
		
		if(options.group){
			SQL.push('GROUP BY '+options.group );	
		}
		
		if(options.order){
			SQL.push('ORDER BY '+options.order );	
		}
		
		if(options.limit){
			SQL.push('LIMIT '+options.limit );	
		}	
		//console.log( SQL, args );
		return { sql: SQL.join(' '), values: args };
	};
	
	Database.prototype.run = function( cmds ){
		var self = this;
		self.db.transaction(function (tx) {
			while(cmds.length > 0){
				var query = cmds.shift();
				if(typeof query == 'string')
					tx.executeSql( query );
				else tx.executeSql( query.sql, query.values );	
			}
			return false;
		});
		return false;
	};
	
	Database.prototype.empty = function( table,callback ){
		var self = this;
		var SQL = 'DELETE FROM '+table;
		//console.log(SQL);
		this.db.transaction(function (tx) {
			tx.executeSql( SQL, [], null, function(){
				console.log('DEL error', arguments);
				return false;
			});
			if(callback)  callback(null);
			return false;
		});
		return false;
	};
	
	Database.prototype.delete = function( table, id, callback ){
		var self = this;
		var SQL = 'DELETE FROM '+table+' WHERE id = ?';
		console.log(SQL, id);
		this.db.transaction(function (tx) {
			tx.executeSql( SQL, [id], null, function(){
				console.log('DEL error', arguments);
				return false;
			});
			if(callback)  callback(null);
			return false;
		});
		return false;
	};
	
	Database.prototype.select = function( table, options, callback ){
		var self = this;
		var query = self.getSQL( 'SELECT', table, options );
		self.doRequest( query.sql, query.values, function( err, result ){
			callback(result);
			return false;
		});
		return false;
	};
	
	Database.prototype.find = function( table, options, callback ){
		
		var self = this;
		var db = this.db;
		var tmp = options;
		if(!options.conditions) options = { conditions: tmp };
		
		options.limit = 1;
		
		var query = self.getSQL( 'SELECT', table, options );
		//console.log(query);
		this.db.transaction(function (tx) {
			tx.executeSql( query.sql, query.values, function (tx, results){
	
				var result = [];
				var err = false;
				var len = results.rows.length, i;
	
				if(len > 0){
					for (i = 0; i < len; i++) {
					  result[i] = results.rows.item(i);
					}
				}
				//console.log(result);
				if(err) return callback(null);
				if(result.length > 0){
					returnFn(result[0], callback );
				}else{
					callback(null);
				}
				return false;
			});
			return false;
		});
		return false;
	};
	
	Database.prototype.findAll = function( table, options, callback ){
		var self = this;
		
		var tmp = options;
		if(!options.conditions) options = { conditions: tmp };
		
		var query = self.getSQL( 'SELECT', table, options );
	
		this.db.transaction(function (tx) {
			tx.executeSql( query.sql, query.values, function (tx, results) {
				var result = [];
				var err = false;
				var len = results.rows.length, i;
				if(len > 0){
					for (i = 0; i < len; i++) {
					  result[i] = results.rows.item(i);
					}
				}
				//console.log(result);
				if(err) return callback(null);
				if(result.length > 0){
					returnFn(result, callback );
				}else{
					callback(null);
				}
				return false;
			});
			return false;
		});
		return false;
	};
	
	Database.prototype.insert = function( table, data, callback ){
		
		var self = this;
		var query = self.getSQL( 'INSERT', table, null, data );
	
		self.doRequest( query.sql, query.values, function( err, result ){
			var res = result.insertId ? result.insertId : false;
			if(callback) callback(res);
			return false;
		});
		return false;
	};
	
	Database.prototype.save = function( table, data, callback ){
		
		var self = this;
		var query = self.getSQL( 'INSERT', table, null, data );
			
		if( data.id ){
			self.count( table, { id: data.id }, function( exists ){
				if(exists > 0){
					self.update( table, data, { id: data.id }, function( status ){
						if(callback) callback( status );
					} );
				}else{
					self.insert( table, data, callback );
				}
				return false;
			});
		}else{
			self.insert( table, data, callback );
		}
		
		return false;
	
	};
	
	Database.prototype.update = function( table, data, options, callback ){
		
		var self = this;
		var query = self.getSQL( 'UPDATE', table, options, data );
		self.doRequest( query.sql, query.values, function( err, result ){
			var res = result.rowsAffected > 0 ? true : false;
			if(callback) callback(res);
		});
		return false;
	};
	
	Database.prototype.count = function( table, options, callback ){
		var self = this;
		var SQL = 'SELECT COUNT(*) as count FROM '+table;
		
		var query = self.getSQL( 'SELECT', table, { fields: ['COUNT(*) as count'], conditions: options });
		//console.log(query);
		self.doRequest( query.sql, query.values, function( err, result ){
			if(callback) callback(result.rows.item(0).count);
		});
		
	};
	
	Database.prototype.exists = function( table, options, callback ){
		var self = this;
		if( typeof options == 'string' || typeof options == 'string' ){
			options = { id: options };
		}
		self.count(table, options, function( count ){
			callback( count > 0 ? true : false );
			return;
		});
		return;
	};
	
	
	Database.prototype.doRequest = function( sql, vals, next ){
		var err;
		try {
			this.db.transaction(function (tx) {
				tx.executeSql( sql, vals, function (tx, results) {
					if(next) next(err, results);
					return;
				});
				
			});
		} catch(e){
			alert("Error processing SQL: "+ e.message);
			err = e.message;
			if(next) next(err, null);
		}
	};
	
	exports.Database = Database;
	
	return exports;
		
});