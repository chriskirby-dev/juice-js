define('form/format', function FormInput(){
	
	var exports = this.exports;
	
	
	exports.phone = function( value ){
		
		var numberPattern = /\d+/g;
		var nums = value.match( numberPattern );
		var ints = nums.join('').split('');
		   
		var val = '';
		if( ints.length > 0){
			if( ints.length > 10 ){
			       var intCode = ints.shift();
			}
			while(ints.length > 0 && val.length < 12){
				if(val.length == 3 || val.length == 7){
					val += '-';
				}
				val += ints.shift();
			}
		}
		return (intCode ? intCode + '-' : '' )+ val;
	};

	return exports;
	
});