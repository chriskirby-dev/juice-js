define('utils/progress', function(){

	var current = 0;
	var total = 0;
	
	return {
		percent: function(){
			return current / total;
		},
		target: function(_total){
			total = _total;
		},
		update: function( i ){
			current = i;
		},
		add: function( i ){
			current += i;
		}
	};
	
});