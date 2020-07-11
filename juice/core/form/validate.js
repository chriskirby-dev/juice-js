define('form/validate', function FormBase(){
	
	var exports = this.exports;
	
	var validationForms = document.querySelectorAll('form[data-validate]');
	var validationInputs = document.querySelectorAll('input[data-validate]');
	
	function ValidationForm( form ){
		this.fields = [];
		console.log('ValidationForm', form.elements);
		for(var i=0;i<form.elements.length;i++){
			var el = form.elements[i];
		}
	}
	
	function validateValue( value, validation ){
		console.log('validate', value, validation );
		switch( validation ){
			case 'email':
			var re = /\S+@\S+\.\S+/;
   			var valid = re.test(value);
   			break;
   			case 'full-name':
   			var parts = value.trim().split(' ');
   			var re = /(.*)\s(.*)/;
   			var valid = ( re.test(value) && parts.length > 1);
   			break;
   			case 'password':
   				var re = /^[A-Za-z0-9!@#$%^&*()_]{6,20}$/;
   				var valid = re.test(value);
   			break;
   			default:
   			
		}
		console.log(valid);
		return valid;
	}
	
	
	function InputValidation(input){
		var touched = false;
		var valid = validateValue( this.value, validation );
		var validation = input.getAttribute('data-validate');
		console.log(input.type, validation );
		
		var minChars = input.getAttribute('data-minlength');
		var maxChars = input.getAttribute('maxlength');
		var chars = input.getAttribute('data-chars');
		
		
		function updateInputValidation(){
			if(valid){
				input.parentNode.$.class('valid', true);
			}else{
				input.parentNode.$.class('valid', false);
			}
		}
		
		if( input.type == 'text' || input.type == 'password' || input.type == 'email' ){
			
			input.$.on('input', function() { 
				this.parentNode.$.class('touched', true);
				var validation = this.getAttribute('data-validate');
			  	valid = validateValue( this.value, validation );
			  	updateInputValidation();
			}, false);
			
		}
		
		updateInputValidation();
	}
	
	
	for(var i=0;i<validationForms.length;i++){
		var form = validationForms[i];
		new ValidationForm(form);
	}
	
	for(var i=0;i<validationInputs.length;i++){
		var input = validationInputs[i];
		new InputValidation(input);
	}
	
	
	return exports;
	
});