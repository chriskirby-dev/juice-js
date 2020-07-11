define('form', ['form/checkbox', 'stylesheet'], function FormBase( Checkbox, stylesheet ){
	
	var exports = this.exports;

	var sheet = stylesheet.use('form');
	sheet.define({
		'.input-wrapper': {
			position: 'relative'
		}
	});

	exports.Checkbox = Checkbox;
	
	this.appready = function(){
				
		if( document.getElementsByClassName("option-list").length > 0 ){
			
			var olsts = document.getElementsByClassName("option-list-wrap");
			require('form/options').then(function( fromOption ){
				olsts.$.each(function( olst ){
					new fromOption.singleSelect( olst );
				});
			});
		}
	};
	
	return exports;
		
}, { persistant: true });