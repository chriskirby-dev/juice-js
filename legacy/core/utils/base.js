define('utils', ['utils/date'], function( date ){
	var self = this;
	var exports = this.exports;

	exports.date = date;

	exports.cancel = function(){
		return false;
	}
	
	exports.padNumber = function(pad, number){
		var str = '' + number;
		while (str.length < pad) str = '0' + str;
		return str;
	};
	
	exports.args = function(/* */){
		return Array.prototype.slice.call(arguments[0]);
	};
	
	exports.getFnName = function(fn){
		var M= fn.toString().match(/function\s+([\w\$]+)\s*\(/) || '';
		return M? M[1]: '';
	};
	
	exports.guid = function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return (s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4()).toUpperCase();
	};
	
	exports.clone = function( superCon ) {
		return Object.create( superCon );
	};
	
	exports.inherits = function(ctor, superCtor) {
		if(!superCtor.prototype){
			var sup = function(){};
			sup.prototype = superCtor;
			superCtor = sup;
		}
		
		ctor.super_ = superCtor;
		ctor.prototype = Object.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};

	exports.sortTypes = function(/* */) {
		var args = {};
		exports.each(arguments[0], function(argument) {
			args[exports.type(argument)] = argument;
		});
		return args;
	};
	
	exports.type = function(o, is_type) {
		var t = Object.prototype.toString.call(o).split(' ').pop().replace(']', '').toLowerCase();
		return is_type ? is_type === t : t;
	};
	
	exports.isType = function(type, o) {
		var t = Object.prototype.toString.call(o).split(' ').pop().replace(']', '').toLowerCase();
		return t == type ? true : false;
	};
	
	exports.each = function(ary, func) {
		if (!ary)
			return false;
		for (var i = 0; i < ary.length; i++) {
			if (ary[i] && func(ary[i], i, ary)) {
				break;
			}
		}
	};
	
	var PromiseCallback = function( fn ){
		
		var self = this;
		var resolve = null;
		var resolved;
		var reject = null;
					
		 this.resolve = function(){
		 	resolved = arguments;
		 	//console.log('resolve...', resolve);
		 	if(resolve) resolve.apply( this, arguments );
		 };
		 
		 this.reject = function(){
		 	if(reject) reject.apply( this, arguments );
		 };
		
		 this.then = function( callback ){
		 	resolve = callback;
		 	if(resolved) resolve.apply( this, resolved );
		 	//console.log('then...', resolve);
		 	return self;
		 };
		 
		 this.error = function( callback ){
		 	reject = callback;	
		 	return self;
		 };
		 
		 fn( this.resolve, this.reject );
		 
		 return this;
	};
		
	exports.promise = PromiseCallback;
	
	exports.format = {
		nth: function( num ){
		    if(num%1) return num;
		    var s = num%100;
		    if(s>3 && s<21) return num+'th';
		    switch(s%10){
		        case 1: return num+'st';
		        case 2: return num+'nd';
		        case 3: return num+'rd';
		        default: return num+'th';
		    }
		},
		toArray: function( o ){
			return Array.prototype.slice.call( o );
		},
		number: function(value){
			return Number( value.replace(/[^0-9.\-]/g, "") );
		},
		money: function(value){
			if(value == 0) return '$0.00';
			var digits = value.toString().replace(/[^0-9.]/g, "");
			var num = Number(digits), floored, decimal, has_decimal = false;
			var neg = false;
			if(value < 0 ) neg = true;
			if(Number(digits) == 0){
				this.value = '';
				return '';
			}
			if(digits.indexOf('.') !== -1){
				has_decimal = true;
				decimal = digits.split('.').pop();
				if( decimal.length > 2 ){
					decimal = decimal.substr(0,2);
				}
				floored = digits.split('.').shift();
			}else{
				floored = digits;
			}
					
			var numStr = floored.split('').reverse().join('').replace(/(\d{0,3})/g, " $1").split('').reverse().join('').trim().split(' ').join(',');
			
			if( has_decimal ){
				return (neg?'-':'')+'$'+[ numStr, decimal ].join('.');
			}else{
				return (neg?'-':'')+'$'+numStr;
			}
		}
	};
	
	exports.onReadyEmit = function(/* */){
		var args = Array.prototype.slice.call(arguments);
		var ready = 0;
		var callback = args.pop();
		var modReady = function(){
			ready++;
			console.log('Start Ready: '+ready+' ');
			if( ready >= args.length ){
				callback();
			}
		};
		for( var i=0;i<args.length;i++ ){
			console.log(args[i]);
			if( args[i].ready ){
				modReady();
			}else{
				args[i].on('ready', function( n ){
					modReady();
					return false;
				});
			}
		}
	};

	
exports.empty = function( v ){

    if( v == null || v == undefined ) return true;

    var type = exports.type( v );

    switch( exports.type( v ) ){
        case 'object':
        if( Object.keys( v ).length == 0 ) return true;
        break;
        case 'array':
        if( v.length == 0 ) return true;
        break;
        case 'string':
        if( v == '' ) return true;
        break;
    }
    return false;
}
	
	return exports;
	
});