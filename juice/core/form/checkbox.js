define('form/checkbox', ['html', 'events'], function( html, events ){

    var exports = this.exports;
    var app = this.app;
    var global = this.global;
    if( !global.indexes ) global.indexes = {};
    global.indexes.formCheckbox = global.indexes.formCheckbox || 0;


    var CheckBox = function( name, options ){
        var self = this;
        events._extend( self );
        self.index = global.indexes.formCheckbox;
        if( typeof name !== 'string' ){
            options = name;
            name = null;
        }
        self.options = options;
        self.name = name;
        self.build();
    };

    CheckBox.prototype.build = function(){

        var self = this;
        var options = self.options;

        var id = 'checkbox-'+self.index;

        var checkbox = {
            id: id,
            class: 'checkbox-input',
            type: 'input',
            attrs: {
                type: 'checkbox'
            }
        };

        if( options.value ) checkbox.attrs.value = options.value;
        if( options.name ) checkbox.attrs.name = options.name;

        var params = {
            class: 'input-wrapper',
            content: {
                checkbox: checkbox,
                label: {
                    type: 'label',
                    class: 'checkbox-label',
                    text: options.label || 'Label',
                    attrs: {
                        for: id
                    }
                }
            }
        };


        if( options.id ) params.id = options.id;
        if( options.parent ) params.parent = options.parent;


        self.wrapper = new html.Element( params );
        self.checkbox = self.wrapper.querySelector('.checkbox-input');
        self.label = self.wrapper.querySelector('.checkbox-label');

        var onClick = function( box ){
            self.value = self.checkbox.value;
            self.emit('value', self.value );
        };

        self.checkbox.addEventListener('click', onClick, false );
        self.emit('value', self.value );

        self.built = true;
    }

    CheckBox.prototype.initialize = function(){

    }


    return CheckBox;

});