define('form/range', ['html'], function FormRange( html ){

	var exports = this.exports;
	var global = this.global;
	global.rangeId = global.rangeId || 0;
	exports.inputs = {};
	
	var RangeInput = function( input, options ){
		
		var self = this;
		console.log(input,  typeof input );
		exports.events.extend( self );

		self.options = options;
		if( typeof input == 'string' ){
			if( document.getElementById( input ) ){
				self.input = document.getElementById( input );

			}else{
				self.id = input;
			}
		}else{
			self.input = input;
		}

		console.log( self.id, self.input );
		if( !self.input ) self.create();

		var onRangeInput = function(){
            self.set( this.value );
        };

		self.input.addEventListener('input', onRangeInput, false );

	};

	RangeInput.prototype.set = function( value ){
		var self = this;
		self.value = value;
		self.labelValue.innerText = value;
		self.emit('input', value );
	}

	RangeInput.prototype.create = function(){

		var self = this;
		var options = self.options;
		
		if( self.options.parent ){
			var parent = self.options.parent;
			if( parent.getAttribute('data-label') ){
				options.label = parent.getAttribute('data-label');
			}
			if( parent.getAttribute('data-min') ){
				options.min = Number( parent.getAttribute('data-min') );
			}
			if( parent.getAttribute('data-max') ){
				options.max = Number( parent.getAttribute('data-max') );
			}
			if( parent.getAttribute('data-value') ){
				options.value = Number( parent.getAttribute('data-value') );
			}
		}
		console.log('Create Range', options );
		
		var rangeOpts = {
			id: self.id,
			type: 'input',
			attrs:{
				type: 'range'
			}
		};

		if( options.min ) rangeOpts.attrs.min = options.min;
		if( options.max ) rangeOpts.attrs.max = options.max;
		if( options.value ) rangeOpts.attrs.value = options.value;

		var htmlOpts = {
			id: self.id+'-wrapper',
			parent: self.options.parent,
			class: 'range-input',
			style: {
				padding: '5px'
			},
			content: {
				label: {
					type: 'label',
					html: options.label
				},
				grp:{
					class: 'input range-value',
					content: {
						range: rangeOpts,
						value: {
							class: 'value',
							text: 0
						}
					}
				}
			} 
		};

		var wrap = html.Element( htmlOpts );
		self.input = wrap.querySelector('input');
		self.labelValue = wrap.querySelector('.value');
		self.set( self.input.value );
		return false;

	};

	exports.use = function( id ){
		return exports.inputs[id];
	}

	exports.search = function(){
		var wrappers = document.querySelectorAll('.range-wrapper:not(.processed)');
		for( var i=0;i<wrappers.length;i++ ){
			var wrapper = wrappers[i];
			if( !wrapper.id ) wrapper.id = 'range-'+global.rangeId;
			global.rangeId++;
			wrapper.classList.add('processed');
			exports.inputs[wrapper.id] = new RangeInput( wrapper.id+'-inputx', { parent: wrapper } );
		}
	}

	var onWindowReady = function(){
		exports.search();
	};

	document.addEventListener('DOMContentLoaded', onWindowReady, false );
	
	return exports;
},  { extend: 'events' });