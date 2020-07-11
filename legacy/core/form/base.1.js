define('form', function FormBase(){
	
	var exports = this.exports;
	
	this.appready = function(){
		
		if( document.querySelectorAll('form[data-validate]').length > 0 ){
			
		}
		
		
		if( document.querySelectorAll('.input input').length > 0 ){
			
			document.querySelectorAll('.input input').$.on('focus', function() { 
				this.parentNode.$.class('touched', true);
			}, false);
		}
		
		if( document.querySelectorAll('input[data-validate]').length > 0 ){
			require('form/validate');
		}

		if( document.getElementsByClassName("input-slider").length > 0 ){
			var sliders = document.getElementsByClassName("input-slider");
			
			if(sliders.length > 0){
				require('form/slider').then( function( inputSlider ){
					inputSlider.bindTo( sliders );
				});
			}
		}
		
		if( document.getElementsByClassName("wysiwyg").length > 0 ){
			require('/css/wysiwyg.css');
			require('wysiwyg');
			
		}
		
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