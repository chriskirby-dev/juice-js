define('style/sheets', ['browser', 'style/doc'], function StyleSheet( browser, Sheet ){
	
	var exports = this.exports;
	var global = this.global;
	exports.sheets = global.sheets || {};

	exports.exists = function( id ){
		var _id = id+'-stylesheet';
		return document.getElementById( _id );
	};

	exports.find = function( id ){
		//console.log(exports.sheets);
		if( exports.sheets[id] ) return exports.sheets[id];
		var _id = id+'-stylesheet';
		var sheet = document.getElementById( _id );
		if( !sheet ){
			var ss = document.styleSheets;
			for( var i = 0; i < ss.length; ++i ){
				if( ss[i].ownerNode && ss[i].ownerNode.id == _id ){
					sheet = ss[i];
				}else if( ss[i].owningElement && ss[i].owningElement.id == _id ) {
					sheet = ss[i];
				}
				if( sheet ) break;
			}
		}
		if( sheet ) exports.sheets[id] = new Sheet( sheet, 'find' );
		return exports.sheets[id];
	};

	exports.create = function( id ){
		if( exports.sheets[id] || exports.find( id ) ){
			return exports.sheets[id];
		}
		var sheet = document.createElement("style");
		sheet.id = id+'-stylesheet';
		sheet.type = 'text/css';
		sheet.disabled = false;
		if(sheet.styleSheet){
			sheet.styleSheet.cssText = "";
		}else{
			sheet.appendChild( document.createTextNode("") );
		}
		document.getElementsByTagName('head')[0].appendChild( sheet );
		exports.sheets[id] = new Sheet( sheet, 'create' );
		return exports.sheets[id];
	};

	exports.use = function( id ){
		//Check Initializing Sheets
		if( exports.sheets[id] ) return exports.sheets[id];
		//Check for Existing Element
		if( exports.find( id ) ) return exports.sheets[id];
		return exports.create( id );
	};
	
	return exports;
	
}, { persistant: true });