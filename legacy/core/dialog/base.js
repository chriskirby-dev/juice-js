define('dialog', [ 'dom', 'dom/css' ], function CoreDialog( dom, css ){
	
	var exports = this.exports;
	var app = this.app;
	var active = false;
	var holder;
	app.dialog = exports;
	exports.active = false;
	
	exports.map = {};
	exports.dialog = null;
	
	if(!document.querySelector('.confirm-holder')){
		holder = dom.create('div.confirm-holder');
		app.body.$.prepend( holder );
	}else{
		holder = document.querySelector('.confirm-holder');
	}
	
	var dialogMap = dom.create('div.dialog@dialogWrap > div.inner@dialog').map;
	var dialog = dialogMap.dialog;
	var dialogWrapper = dialogMap.dialogWrap;
	holder.appendChild( dialogMap.dialogWrap );
	
	css.use('dialog');
	
	css.append({
		'.dialog .inner': {
			display: 'block',
			opacity: 1,
			position: 'relative',
			transition: 'opacity 0.35s ease'
		},
		'.dialog.vanish .inner': {
			opacity: 0
		},
		'.confirm-holder': {
			position: 'fixed',
			top: 0,
			left: 0,
			width: '1px',
			height: '1px',
			overflow: 'hidden',
			zIndex: 1000000
		},
		'.confirm-holder.active': {
			width: '100%',
			height: '100%'
		},
		'.confirm-holder:after': {
			content: '""',
			display: 'block',
			background:'#000000',
			opacity:'0',
			width: '100%',
			height: '100%',
			transition: 'opacity 0.3s ease'
		},
		'.confirm-holder.active:after': {
			content: '""',
			display: 'block',
			background:'#000000',
			opacity:'0.6',
			width: '100%',
			height: '100%'
		},
		'.confirm-holder > .dialog': {
			height: 'auto',
			maxWidth:'90%',
			minWidth: '150px',
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			border: '1px solid #d2d2d2',
			background: '#FFFFFF',
			boxShadow: '0px 5px 5px 0px rgba(50, 50, 50, 0.6)',
			zIndex: 1000,
			textAlign: 'center'
		},
		'.dialog .message': {
			fontWeight: 400,
			padding: '1em',
			textAlign: 'center',
			userSelect: 'none'
		},
		'.dialog .buttons, .dialog-alert .button': {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'nowrap',
			borderTop: '1px solid #d2d2d2'
		},
		'.dialog .buttons a, .dialog-alert .button a': {
			display:'block',
			padding:'0 1em',
			lineHeight:'40px',
			height:'40px',
			textAlign: 'center',
			borderRight: '1px solid #d2d2d2',
			boxSizing: 'border-box',
			userSelect: 'none',
			flex: '1 0 auto',
			cursor: 'pointer',
			color:'#333333'
		},
		'.dialog .buttons a:last-child': {
			borderRight: 0
		},
		'.dialog .buttons a:active, .dialog .buttons a.highlight, .dialog-alert .button a:active': {
			color:'#2149e1',
			fontWeight: 600
		},
		'.alert-btn': {
			
		},
		'@keyframes loader-spin': { 
			'0%': { 
				width: '1px',
				height:'1px',
				opacity: '0',
				transform: 'rotate(0deg)'
			},
			'5%': { 
				width: '1px',
				height:'1px',
				opacity: 1
			},
			'50%': { 
				width: '8px',
				height:'8px',
			},
			'95%': { 
				width: '3px',
				height:'3px',
				opacity: 1,
			},
			'100%': { 
				width: '1px',
				height:'1px',
				opacity: '0',
				transform: 'rotate(360deg)'
			}				
		},
		'.dialog .descr': {
			position: 'relative',
			fontSize: '0.8em',
			padding: '0 5px',
			background:'#d2d2d2',
			boxSizing: 'border-box',
			width:'100%'
		},
		'.dialog .html': {
			position: 'relative',
			padding: '20px 0',
			boxSizing: 'border-box',
			width:'100%'
		},
		'.dialog .loading': {
		  appearance: 'none',
		  position: 'relative',
		  width: '48px',
		  height: '48px',
		  margin:'0 auto',
		  marginTop:'10px',
		  zIndex:10
		},

		'.dialog .loading::before': {
		    content: "''",
		    display: 'block',
		    position:'relative',
		    zIndex:20,
		    width: '48px',
		    height: '48px',
		    background: 'transparent',
		    border: '10px solid rgba(0, 0, 0, 0.1)',
		    borderLeft: '10px solid #333',
		    borderRadius: '100%',
		    animation: 'spin 0.8s linear infinite',
		    boxSizing:'border-box'
		}
	});
	
	var LOADING_HTML = '<div class="loading"></div>';
	
	exports.close = function( next ){
		holder.$.class('active', false);
		dialogWrapper.className = 'dialog';
		exports.active = false;
		setTimeout(function(){
			exports.map = {};
			dialog.innerHTML = '';
			dialog.innerHTML = '';
			dialogWrapper.style.width = 'auto';
			dialogWrapper.style.height = 'auto';
			dialog.style.opacity = 1;
			if(next) next();
		}, 500 );
	};
	
	exports.contents = function( contents ){
		
		if( exports.active ){
			
			dialogWrapper.style.width = dialog.$.width;
			dialogWrapper.style.height = dialog.$.height;
			dialog.style.opacity = 0;
			
			setTimeout(function(){
				dialog.innerHTML = '';
				dialog.appendChild(contents);
				dialogWrapper.style.width = 'auto';
				dialogWrapper.style.height = 'auto';
				dialog.style.opacity = 1;
				
			}, 500 );
			
		}else{
			exports.active = true;
			holder.$.class('active', true);
			dialog.appendChild(contents);
		}
		
	};
	
	exports.display = function( options ){
		var createStr = '';
		createStr += 'div.dialog-display@display >';
		if( options.loading ){
			options.html = LOADING_HTML;
			delete options.loading;
		}
		
		if(options.html) createStr += ' div.html@html';
		if(options.message) createStr += ' div.message@message"'+options.message+'"';
		if(options.descr) createStr += ' div.descr@descr"'+options.descr+'"';
		
			
		var els = dom.create( createStr );
		if(options.html) els.map.html.innerHTML = options.html;
		exports.map = els.map;
		exports.contents( els.map.display );
		return false;
	};
	
	exports.alert = function( options ){
		
		var createStr = '';
		createStr += 'div.dialog-alert@alert > div.message@message div.button@button';
		var btns = [];
		if(options.button){
			createStr += ' > a.alert-btn@alert-btn"'+options.button+'"';
		}

		var els = dom.create( createStr );
		els.map.message.innerHTML = options.message;
		
		if( options.fn ){
			els.map['alert-btn'].$.on( app.clickEvent, options.fn );
		}else{
			els.map['alert-btn'].$.on( app.clickEvent, exports.close );
		}
		
		exports.map = els.map;
		exports.contents( els.map.alert );
		
		return false;
	};
	
	exports.clean = function( str ){
		return str.replace(/[,\s]/g, '').toLowerCase();
	};
	
	exports.initialize = function(){
		if(!dialog){
			active = true;
			var dialogMap = dom.create('div.dialog@wrapper > div.inner@dialog').map;
			dialogWrapper = dialogMap.wrapper;
			dialog = dialogMap.dialog;
			holder.appendChild( dialogMap.wrapper );
		}
	};
	
	exports.render = function( options, type ){
		exports.initialize();
		var createStr = '';
	
		if(!type) type = 'display';		
		
		createStr += 'div.dialog-'+type+'@box >';
		
		if( options.loading ){
			options.html = LOADING_HTML;
			delete options.loading;
		}
		
		if(options.html) createStr += ' div.html@html';
		if(options.message) createStr += ' div.message@message"'+options.message+'"';
		if(options.descr) createStr += ' div.descr@descr"'+options.descr+'"';
		
		
		if(options.buttons){
			createStr += ' div.buttons@buttons';
			
			createStr += ' >';
			if(Object.keys(options.buttons).length > 0){
				for(var btn in options.buttons){
					if(!options.buttons[btn].key) options.buttons[btn].key = exports.clean( btn );
					var btnstr = ' a.'+options.buttons[btn].key+'"'+btn+'"';
					createStr += btnstr;
				}
			}
		}
		
		console.log(createStr);
		var els = dom.create( createStr );
		exports.map = els.map;
		
		
		//After Create
		
		if(options.html) els.map.html.innerHTML = options.html;
		
		if(options.message) els.map.message.innerHTML = options.message;
		
		if(options.width){
			dialogWrapper.style.width = options.width;
		}
		
		if( options.class ){
			dialogWrapper.$.class( options.class, true );
		}
		
		
		
		if(options.buttons){
			for(var btn in options.buttons){
				var tbtn = els.map.buttons.$.find('.'+options.buttons[btn].key);
				if( options.buttons[btn].highlight ){
					tbtn.$.class('highlight', true);
				}
				if( options.buttons[btn].onclick ){
					tbtn.setAttribute('onclick', options.buttons[btn].onclick );
				}
				
				if( options.buttons[btn].fn ){
					tbtn.$.on( app.clickEvent, options.buttons[btn].fn );
				}
			}
		}
		
		exports.contents( els.map.box );

	};
	
	exports.confirm = function( options ){
	
		
		exports.render( options, 'confirm' );
		return false;
	};
	
	return exports;
	
}, { persistant: true });
