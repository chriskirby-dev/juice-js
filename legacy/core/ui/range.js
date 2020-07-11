define('ui/range', ['dom', 'html'], function( DOM, html ){
    
	var app = this.app;
    var exports = this.exports;

    var RangeInput = function( id, options, appendTo ){

        var self = this;
        self.id = id;
        self.options = options;
        self.parent = appendTo;
        self.beforeChange = null;
        self.labelFormat = null;
        exports.events.extend( self );

        Object.defineProperty( self, 'max', {
            get: function(){
                return self.options.max;
            },
            set: function( v ){
                self.options.max = v;
                self.input.setAttribute('max', v );
            }
        });

        Object.defineProperty( self, 'min', {
            get: function(){
                return self.options.min;
            },
            set: function( v ){
                self.options.min = v;
                self.input.setAttribute('min', v );
            }
        });

        var el = document.getElementById( id );
        if( !el ){
            self.create( );
            el = document.getElementById( id );
        }
        self.valueDisplay = el.parentNode.parentNode.querySelector('.value');
        self.wrapper = el.parentNode.parentNode;

        var onRangeInput = function(){
            self.set( this.value );
        };

        var onMouseRelease = function(){
            self.wrapper.classList.remove('changing');
            self.complete( this.value );
        };

        var onMouseDown = function(){
            self.start( this.value );
            self.wrapper.classList.add('changing');
        };

        el.addEventListener('input', onRangeInput, false );
        el.addEventListener('mousedown', onMouseDown, false );
        el.addEventListener('mouseup', onMouseRelease, false );
        setTimeout(function(){
            self.set( options.value || 0 );
        }, 0 );

    };

    RangeInput.prototype.create = function( ){
        var self = this;
        var options = self.options;

        var rangeOpts = {
            id: self.id,
            type: 'input',
            attrs:{
                type: 'range'
            }
        };

        if( options.min ) rangeOpts.attrs.min = options.min;
        if( options.max ) rangeOpts.attrs.max = options.max;

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
       return false;
    }

    RangeInput.prototype.start = function( v ){
        var self = this;
        var value = labelTxt = v;
        if( self.beforeChange ) value = self.beforeChange( value );
        if( self.labelFormat ) labelTxt = self.labelFormat( value );
        self.valueDisplay.innerText = labelTxt;
        self.emit('start', value );
        return false;
    };

    RangeInput.prototype.complete = function( v ){
        var self = this;
        var value = labelTxt = v;
        if( self.beforeChange ) value = self.beforeChange( value );
        if( self.labelFormat ) labelTxt = self.labelFormat( value );
        self.valueDisplay.innerText = labelTxt;
        self.emit('change', value, true );
        return false;
    };

    RangeInput.prototype.set = function( v ){
        var self = this;
        var value = labelTxt = v;
        if( self.beforeChange ) value = self.beforeChange( value );
        if( self.labelFormat ) labelTxt = self.labelFormat( value );
        self.valueDisplay.innerText = labelTxt;
        self.input.value = v;
        self.emit('change', value );
        return false;
    };

    exports.create = function( id, appendTo ){
        return new RangeInput( id, appendTo );
    };

    return exports;

}, { extend: 'events' });