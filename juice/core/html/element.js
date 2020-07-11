define('html/element', [], function HTMLElement( ){
	
	var exports = this.exports;
	var html = this.parent;
	
	var Element = function( id, type, options ){
		var self = this;
		options = options || {};

		if( typeof id == 'object' ){
			options = id;
			id = options.id || null;
		}

		if( typeof type == 'object' ){
			options = type;
			type = options.type || 'div';
		}

		var el;

		if( options.type == 'columns' ){
			el = html.grid.columns( options.columns ).wrapper;
		}

		if( options.width ){
			if(!options.style) options.style = {};
			options.style.width = options.width;
			delete options.width;
		}

		if( options.height ){
			if(!options.style) options.style = {};
			options.style.height = options.height;
			delete options.height;
		}

		//console.log('Element', id, type, options );

		if(!el) el = document.createElement( type || options.type || 'div' );
		if( id || options.id ) el.id = id || options.id;

		if( options.class ) el.className = options.class;

		if( options.style ){
			var style = options.style;
			for(var prop in style ){
				el.style[prop] = style[prop];
			}
		}

		if( options.background ){
			var background = options.background;

			if( options.background.div !== undefined && options.background.div == false ){
				var background = el;
			}else{
				var background = document.createElement( 'div' );
				background.id = id+'-background';
				background.style.top = 0;
				background.style.left = 0;
				background.style.position = 'absolute';
				background.style.width = '100%';
				background.style.height = '100%';
				background.style.zIndex = -1;
				el.appendChild( background );
			}

			if( typeof background == 'string' ) background = { color: background };
			
			if( background.color ) background.style.backgroundColor = background.color;
			if( background.opacity ) background.style.opacity = background.opacity;
			
		}
		if( options.html ){
			el.innerHTML = options.html;
		}
		if( options.text !== undefined ){
			el.innerText = options.text;
		}

		if( options.attrs ){
			 for(var prop in options.attrs ){
				el.setAttribute( prop, options.attrs[prop] );
			}
		}

		if( options.data ){
			 for(var prop in options.data ){
				el.setAttribute( 'data-'+prop, options.data[prop] );
			}
		}

		if( options.content ){
			for( var content in options.content ){
				var opts = options.content[content];
				opts.parent = el;
				new Element( opts );
			}
		}

		if( options.parent ){
			if( typeof options.parent == 'string'){
				 options.parent = document.querySelector( options.parent );
			}
			options.parent.appendChild( el );
		}

		if( options.on ){
			for( var event in options.on ){
				el.addEventListener( event, options.on[event], false );
			}
		}

		return el;

	};


	return Element;
	
});