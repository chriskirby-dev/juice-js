define('stylesheet/sheet', ['browser'], function StyleSheetSheet( browser ){
	
	var exports = this.exports;

	var getSelectorType = function( selector ){
		var type = 'class';
		if( selector.indexOf('@keyframes') !== -1 )
		type = 'keyframe';
		return type;
	};

	var formatSelector = function( selector ){
		return selector.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	};

	var propertiesToText = function( props ){
		var txt = "";
		for(prop in props){
			txt += formatSelector( prop );
			if(typeof props[prop] == 'object'){
				txt += '{ '+propertiesToText(props[prop])+' } ';
			}else{
				txt += ':'+props[prop]+';';
			}
		}
		return txt;
	};

	
	var StyleSheet = function( sheet, from ){
		var self = this;
		self.type = sheet.styleSheet ? 'styleSheet' : 'sheet';
		self.sheet = sheet.styleSheet ? sheet.styleSheet : sheet;
		
		self.actions = {
			delete: sheet.cssRules ? 'deleteRule' : 'removeRule',
			rules: sheet.rules ? 'rules' : 'cssRules'
		};
		//console.log(self.type);
		//console.log( self.sheet, from );
		
	};

	StyleSheet.prototype.addRule = function( selector, style, index ){
		var self = this;
		selector = formatSelector( selector );
		var rules = self.rules();
		//console.log('Add Rule', selector, style, rules );
		if(!index) index = rules.length;
		var propText = propertiesToText( style );
		if( self.type == 'styleSheet' )
			self.sheet.cssText += selector + '{'+ propText +'}';
		else
			self.sheet.appendChild( document.createTextNode( selector + '{'+ propText +'}') );
		
		self.sheet.disabled = false;
		return this;
	};

	StyleSheet.prototype.deleteRule = function( selector ){
		var self = this;
		var rule = self.rule( selector );
		if( !rule ) return null;
		sheet[self.actions.delete]( rule.id );
		sheet.disabled = false;
		return true;
	};

	StyleSheet.prototype.rule = function( selector, index ){
		var self = this;
		var rules = self.rules();
		var rule = {};

		for( var i=0;i<rules.length;i++ ) if( rules[i].selectorText == selector ) rule.id = i;
		if(!rule.id) return null;

		rule.style = rules[rule.id].style;
		return rule;
	};

	StyleSheet.prototype.rules = function(){
		var self = this;
		//console.dir(self.sheet);
		return self.sheet.sheet[self.actions.rules] || [];
	};


	StyleSheet.prototype.set = function( selector, style ){
		var self = this;
		//console.log('SET', selector, style );
		if( getSelectorType( selector ) == 'class' ){
			self.addRule( selector, style );
		}else{
			console.log('SET Style NOT Class');
		}
	};

	StyleSheet.prototype.define = function( properties ){
		var self = this;
		for( var prop in properties ){
			self.set( prop, properties[prop] );
		}
	};
	
	return StyleSheet;
	
});