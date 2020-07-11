define('dom/css', ['browser'], function DomCSS( browser ){
	
	var exports = this.exports;
	var global = this.global;
	exports.sheets = {};
	//Create New Style Element
	var head = document.head || document.getElementsByTagName('head')[0];
	var title = 'dynamic-css';
	var activeSheet = null;
	
	exports.styleSheet = (function( t ) {
		// Create the <style> tag
		var _style = document.createElement("style");
		_style.id = t;
		_style.type = 'text/css';
		_style.disabled = false;
		if(_style.styleSheet){
			_style.styleSheet.cssText = "";
		}else{
			_style.appendChild(document.createTextNode(""));
		}
		document.getElementsByTagName('head')[0].appendChild(_style);
		exports.sheets[t] = _style;
		return _style;
	})( title );
		
	var btypes = ['-webkit-', '-moz-', '-o-', '-khtml-', '-ms-'];
	var prefixed = ['animation', 'animation-name', 'animation-duration', 'animation-timing-function', 
	'animation-iteration-count', 'animation-delay', 'transform', 'transform-origin', 'perspective', 
	'transform', 'transition', 'transition-duration', 'transition-delay', 'transition-property', 'transition-timing-function',
	'user-select', 'box-shadow'];
	
	/**
	 * Description
	 * @method prefixProps
	 * @param {} _props
	 * @return props
	 */
	var prefixProps = function(_props){
		var props = {};
		for(prop in _props){
			if(typeof _props[prop] == 'object'){
				props[prop] = prefixProps(_props[prop]);
			}else{
				var k = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
				if(prefixed.indexOf(k) != -1){
					props[k] = _props[prop];
					if(global.browser.prefix && global.browser.prefix.css) props[global.browser.prefix.css+k] = _props[prop];
				}else{
					props[k] = _props[prop];
				}
			}
		}
		return props;
	};
	
	exports.use = function useSheet( id ){
		if(id == 'default') id = title;
		if(exports.sheets[id]){
			activeSheet = exports.sheets[id];
		}else{
			var _style = document.createElement("style");
			_style.id = id;
			_style.type = 'text/css';
			_style.disabled = false;
			if(_style.styleSheet){
				_style.styleSheet.cssText = "";
			}else{
				_style.appendChild(document.createTextNode(""));
			}
			document.getElementsByTagName('head')[0].appendChild(_style);
			exports.sheets[id] = _style;
			exports.styleSheet = _style;
			
			//activeSheet = exports.sheets[id];
		}
	};
	
	/**
	 * Description
	 * @method sheet
	 * @return 
	 */
	exports.sheet = function CSSSheet(){
	
		if(exports.styleSheet) return exports.styleSheet.sheet || exports.styleSheet;
		
		var ss = document.styleSheets;
		for(var i = 0; i < ss.length; ++i){
			if(ss[i].ownerNode && ss[i].ownerNode.id == title){
				exports.styleSheet = ss[i];
				return exports.styleSheet;
				break;
			}else if (ss[i].owningElement && ss[i].owningElement.id == title) {
				exports.styleSheet = ss[i];
				return exports.styleSheet;
			}
		}
	};
	
	/**
	 * Description
	 * @method appendClass
	 * @param {} _class
	 * @param {} _props
	 * @return 
	 */
	exports.appendClass = function( _class, _props ){
		var sheet = this.sheet();
		var props = prefixProps(_props);
		//console.log(global.browser.cssPrefix);
		if(_class.indexOf('@keyframes') != -1){
				var kprops = {};
				for(keyframe in props){
					kprops[keyframe] = prefixProps(props[keyframe]);
				}
				if( global.browser.prefix && global.browser.prefix.css){
				this.addRule(_class.replace('@keyframes','@'+global.browser.prefix.css+'keyframes'), kprops);
				}
				this.addRule(_class, kprops);
		}else{
			this.addRule(_class, props);
		}
		sheet.disabled = false;
	};
	
	/**
	 * Description
	 * @method append
	 * @return 
	 */
	exports.append = function(){
		//console.log(arguments);
		if(typeof arguments[0] == 'object'){
			for(var c in arguments[0]){
				this.appendClass(c, arguments[0][c]);
			}
		}else{
			this.appendClass(arguments[0], arguments[1]);
		}
		
	};
	
	/**
	 * Description
	 * @method rule
	 * @param {} selector
	 * @param {} index
	 * @return rule
	 */
	exports.rule = function( selector, index ){
		var rules = this.rules();
		var rule = {};
		for(var i=0;i<rules.length;i++)
			if(rules[i].selectorText == selector) rule.id = i;
		if(!rule.id) return null;
		rule.style = rules[rule.id].style;
		return rule;
	};
	
	/**
	 * Description
	 * @method ruleProps
	 * @param {} selector
	 * @return props
	 */
	exports.ruleProps = function( selector ){
		var rule = this.rule(selector);
		var _curr = rule.style.cssText.split(';');
		var props = {};
		for(var p=0;p<_curr.length;p++){
			var pvals = _curr[p].split(':');
			if(pvals.length > 1){
				var k =pvals[0].replace(/^\s+|\s+$/g,'');
				var val = pvals[1].replace(/^\s+|\s+$/g,'');
				props[k] = val;
			}
		}
		return props;
	};
	
	/**
	 * Description
	 * @method toText
	 * @param {} props
	 * @return txt
	 */
	exports.toText = function(props){
		var txt = "";
		for(prop in props){
			txt += prop;
			if(typeof props[prop] == 'object'){
				txt += '{ '+exports.toText(props[prop])+' } ';
			}else{
				txt += ':'+props[prop]+';';
			}
		}
		return txt;
	};
	
	/**
	 * Description
	 * @method addRule
	 * @param {} selector
	 * @param {} props
	 * @param {} index
	 * @return ThisExpression
	 */
	exports.addRule = function( selector, props, index ){
		var sheet = this.sheet();
		var rules = this.rules();

		if(!index) index = this.rules().length;
		var propText = this.toText(props);
		if(sheet.styleSheet)
			sheet.styleSheet.cssText += selector + '{'+ propText +'}';
		else
			this.styleSheet.appendChild(document.createTextNode(selector + '{'+ propText +'}'));
			sheet.disabled = false;
		return this;
	};
	
	/**
	 * Description
	 * @method updateRule
	 * @param {} selector
	 * @param {} props
	 * @return 
	 */
	exports.updateRule = function( selector, props ){
		var rule = this.rule(selector);
		if(rule){
			var _curr = rule.style.cssText.split(';');
			for(var p=0;p<_curr.length;p++){
				var pvals = _curr[p].split(':');
				if(pvals.length > 1){
					var k =pvals[0].replace(/^\s+|\s+$/g,'');
					var val = pvals[1].replace(/^\s+|\s+$/g,'');
					if(!props[k]) props[k] = val;
				}
			}
			this.deleteRule(selector);
			//Merge !!!
			this.addRule(selector, props, rule.id);
		}else{
			console.warning('Cant Update Non-Existing Rule');
		}
		//rtxt += this.rules()[index].style.cssText;
	};
	
	/**
	 * Description
	 * @method set
	 * @param {} selector
	 * @param {} props
	 * @param {} replace
	 * @return 
	 */
	exports.set = function( selector, props, replace ){
		var sheet = this.sheet();
		var rule = this.rule(selector);

		if(rule){
			if(replace){
				this.deleteRule( selector );
				this.appendClass( selector, props );
			}else{
				this.updateRule(selector, props);
			}
		}else{
			this.appendClass( selector, props );
		}
		sheet.disabled = false;

	};
	
	/**
	 * Description
	 * @method rules
	 * @return MemberExpression
	 */
	exports.rules = function(){
		var sheet = this.sheet();
		if(sheet.styleSheet) sheet = sheet.styleSheet;
		var ruleCode = sheet.rules ? 'rules' : 'cssRules';
		return sheet[ruleCode];
	};
		
	/**
	 * Description
	 * @method deleteRule
	 * @param {} selector
	 * @return 
	 */
	exports.deleteRule = function( selector ){
		var sheet = this.sheet();
		var rule = this.rule(selector);
		if(!rule) return null;
		if(sheet.cssRules) { 
			sheet.deleteRule( rule.id );
		}else{
			sheet.removeRule( rule.id );
		}
		sheet.disabled = false;
		return;
	};
	
	/**
	 * Description
	 * @method clear
	 * @return 
	 */
	exports.clearX = function(){
		var sheet = this.sheet();
		var rules = this.rules();
		sheet.innerHTML = "";
		/*
		var crossdelete = sheet.deleteRule ? sheet.deleteRule : sheet.removeRule;
		for(var ri=0;ri<rules.length;ri++){
			//console.log('Delete '+rules[ri].selectorText);
			crossdelete( ri );
		}	
		*/
	};

	exports.clear = function( selector, props, index ){
		var sheet = this.sheet();
		sheet.innerHTML = "";
	};
	
	
	return exports;
	
});