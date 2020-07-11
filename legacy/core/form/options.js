define('form/options', function FormOptions(){
	
	var exports = this.exports;
	
	
	var SingleSelect = function(olst){
		var is_multi = olst.$.attr('data-multiple') !== false;
		var input = olst.getElementsByTagName('select')[0];
		var valuesWrappers = olst.getElementsByTagName('li');
		
		valuesWrappers.$.on('click', function ValueClicked( e ){
			var value = this.$.attr('data-value');
			var active = this.$.class('active');
			//console.log('active', active, this);
			if(!is_multi) valuesWrappers.$.each(function( vw ){
				vw.$.class('active', false);
				input.value = '';
			});
			var values = input.value ? input.value.split(',') : [];
			if( !active ){
				values.push(value);
			}else{
				values.splice(values.indexOf(value), 1);
			}
			input.value = values.join(',');	
			input.$.emit('change');
			this.$.class( 'active', !active );
			
			
			return false;
		});
	};
	
	
	exports.singleSelect = SingleSelect;
	
	
	
	return exports;
	
}); 