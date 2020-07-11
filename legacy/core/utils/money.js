define('utils/money', [], function(){
	
	var exports = this.exports;
	
	
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
	
	
	exports.balance = {
		find: function( day, next ){
			var _conditions = { id: day };
			app.db.find( 'balance', _conditions, function( day ){
				next(day);
				return false;
			});
			return false;
		},
		findAll: function( _cond, next ){
			var _conditions = { order: 'id DESC' };
			if( _cond ) _conditions.conditions = _cond;
			app.db.findAll( 'balance', _conditions, function( balances ){
				next(balances);
				return false;
			});
			return false;
		}
	};
	
	return exports;
});
