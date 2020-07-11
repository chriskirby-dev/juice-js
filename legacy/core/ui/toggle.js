define('ui/toggle', ['dom/extend'], function(  ){
	var app = this.app;
    var exports = this.exports;

    var ToggleUI = function( id, options ){
        var self = this;
        exports.events.extend( self );
        self.id = id;
        self.labelText = {};
        self.labelText.ON = options.label ? options.label[0] : 'on';
        self.labelText.OFF = options.label ? options.label[1] :'off';
        self.element = document.createElement('div');
        self.element.className = 'toggle-ui off';
        self.element.innerHTML = self.html();

        self.input = self.element.querySelector('input');
        self.label = self.element.querySelector('.label');

        self.label.innerText = self.labelText.OFF;

        var onChange = function(){
            var input = self.input;
            self.element.className = 'toggle-ui '+( input.checked ? 'on' : 'off' );
            self.label.innerText = input.checked ? self.labelText.ON : self.labelText.OFF;
            self.emit('change', input.checked );
            return false;
        };

        self.input.onchange = onChange;

        if( options.appendTo ){
            options.appendTo.appendChild( self.element );
        }

        if( options.default ){
            self.set( options.default );
            onChange();
        }

    };

    ToggleUI.prototype.set = function( on ){
        var self = this;
        //console.log('SET', on);
        if( on ){
            self.input.checked = true;
        }else{
            self.input.checked = false;
        }
        
    }

    ToggleUI.prototype.html = function(){
        var self = this;
        var html = '<div class="label"></div>';
        html += '<div class="toggle-box">';
        html += '<input id="'+self.id+'" type="checkbox" />';
        html += '</div>';
        return html;
    };

    exports.create = function( id, appendTo ){
        return new ToggleUI( id, appendTo );
    };

    return exports;
}, { extend: 'events' });