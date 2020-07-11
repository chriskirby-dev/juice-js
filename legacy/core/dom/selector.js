define('dom/selector', ['events'], function( Events ){

	var exports = this.exports;

	if (!document.querySelectorAll) {
		document.querySelectorAll = function(selector) {
			var doc = document,
			head = doc.documentElement.firstChild,
			styleTag = doc.createElement('STYLE');
			head.appendChild(styleTag);
			doc.__qsaels = [];
			styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
			window.scrollBy(0, 0);
			return doc.__qsaels;
		};
	}

	var ElementSelector = function( selector, context ){
		context = context || document;
		var parts = selector.split(' ');
		if( parts.length == 1 && selector.charAt(0) == '#' ){
			return context.getElementById( selector.substring(1) );
		}else{
			return context.querySelectorAll( selector );
		}
	};

	var DomSelector = function( selector, context ){
		this.elements = [];
		var parts = selector.split(' ');
		if( parts.length && selector.charAt(0) == '#' ){
			return document.getElementById( selector.substring(1) );
		}else{
			return document.querySelectorAll( selector );
		}
	};

	exports.findAll = function( selector, context  ){
		context = context || document;
		var elements;
		if(document.querySelectorAll){
			elements = context.querySelectorAll( selector );
		}else{
			console.log('querySelectorAll NOT Supported dom/slector');
		}
		return elements;
	};

	exports.find = function( selector, context ){
		context = context || document;
		var selectors = selector.split(' ');
		var element;
		
		var getFirst = function( sel, ctx ){
			if( selector.charAt(0) == '#' && sel.indexOf(' ') === -1 ){
				element = ctx.getElementById( selector.substring(1) );
			}else if(document.querySelector){
				element = ctx.querySelector( selector );
			}else{
				console.log('querySelector NOT Supported dom/slector');	
			}
		};
		
		for(var s=0;s<selectors.length;s++){
			context = element || context;
			getFirst( selectors[s], context );
		}
		
		return element;
	};

	return exports;
});