define('ui/shadowbox', ['utils', 'dom', 'dom/css'], function( utils, dom, css ){
	
	var exports = this.exports;
	var body = this.body;
	var sb_index = 0;
	var sboxes = [];
	
	css.append({
		'.shadow-box': {
			position: 'absolute',
			top: 0,
			left: 0,
			height: '100%',
			width: '100%',
			zIndex: 1000,
			transition: 'opacity 0.5s ease'
		},
		'.shadow-box.open': {
			transition: 'opacity 0.5s ease 1s'
		},
		'.shadow-box::after': {
			content: '""',
			display: 'block',
			position: 'absolute',
			top: 0,
			left: 0,
			height: '100%',
			width: '100%',
			background: '#000',
			opacity: 0.5,
			zIndex: -1
		},
		'.shadow-box-inner': {
			position: 'absolute',
			top: '50%',
			left: '50%',
			maxHeight: '100%',
			maxWidth: '100%',
			minHeight: '50%',
			minWidth: '50%',
			background: '#FFF',
			transform: 'translate( -50%, -50% )',
			boxSizing: 'border-box',
			padding: '2em',
			transition: '1s ease 0.4s'
		},
		'.shadow-box .shadow-box-content': {
			opacity: 1,
			transition: 'opacity 0.4s'
		},
		'.shadow-box.close .shadow-box-content': {
			opacity: 0,
			width:'100%',
			height: '100%',
			boxSizing: 'border-box'
		},
		'.shadow-box.close .shadow-box-inner': {
			maxWidth:0,
			maxHeight:0,
			minWidth:'auto !Important',
			minHeight:'auto !important'
		},
		'.shadow-box.close': {
			opacity: 0	
		}
	});
	
	
	var ShadowBox = function( wrapper, options ){
		
		var self = this;
		var d = dom.create('div#shadow-box-'+sb_index+'.shadow-box@outer > div.shadow-box-inner@inner');
		self.wrapper = wrapper;
		elements = d.map;
		self.elements = elements;
		
		wrapper.$.prepend( d.elements );
		self.box = d.elements;
		
		if( options && options.content ){
			
			var content = document.createElement('div');
			content.className = 'shadow-box-content';
			
			if( utils.isType( 'string', options.content ) ){
				content.innerHTML = options.content;
			}else{
				content.appendChild(options.content);
			}
			
			if(options.style){
				css.append({
					'.shadow-box-inner': options.style 
				});
			}
			
			if(options.width){
				content.style.width = options.width;
			}
			
			elements.inner.appendChild( content );
			
		}
		
		if( options && options.heading ){
			var heading = document.createElement('h1');
			heading.className = 'shadow-box-heading';
			heading.innerHTML = options.heading;
			elements.inner.$.prepend(heading);
		}
		
		
		
		if(options.onready) options.onready();
		
		self.box.$.class('open', true);
		
	};
	
	ShadowBox.prototype.close = function(){
		var self = this;
		css.append({
			'.shadow-box-inner': {
				width: self.elements.inner.$.width+'px',
				height: self.elements.inner.$.height+'px'
			}
		});
		self.box.$.class('close', true);
		setTimeout(function(){
			self.wrapper.removeChild( self.box );
		}, 1400);
		
	};
	
	exports.create = function( parent, options ){
		
		var wrapper;

		if( utils.isType('string', parent ) ){
			wrapper = body.$.find( parent );
		}else if( utils.isType('element', parent ) ){
			wrapper = parent;
		}
		
		if(!wrapper) alert('No Wrapper');
		var sb = new ShadowBox( wrapper, options );
		sboxes.push( sb );
		return sb;
	};
	
	
	return exports;
	
});