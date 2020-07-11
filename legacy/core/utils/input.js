define('form/input', [], function FormInput(){
	var exports = this.exports;
	
	exports.create = function(tagName, params){
		var _return = {};
		var wrap = document.createElement('div');
		
		switch( tagName.toLowerCase() ){
			
			break;
			case 'hidden':
			break;
			case 'select':
				_return.element = document.createElement(tagName);
				if(params.options){
					for(option in params.options){
						var opt = document.createElement('option');
						opt.value = params.options[option];
						opt.innerHTML = option;
						_return.element.appendChild(opt);
					}
				}
				if(params.label){
					_return.label = document.createElement('label');
					wrap.appendChild(_return.label);
				}
				wrap.appendChild(_return.element);
			break;
			case 'textarea':
				_return.element = document.createElement('input');
				_return.element.type = tagName;
				_return.element.value = params.label;
			break;
			case 'button':
				_return.element = document.createElement('input');
				_return.element.type = tagName;
				_return.element.value = params.label;
				if(params.icon){
					_return.element.style.fontSize = 0;
					_return.element.style.backgroundImage = 'url('+params.icon+')';
				}
			break;
		}
		
		if(_return.label) _return.wrapper = wrap;
		return _return;

	};
	
	return exports;
});