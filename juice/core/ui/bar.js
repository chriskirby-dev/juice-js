define('ui/bar', ['html', 'util' ], function( html, util ){
    var app = this.app;
    var exports = this.exports;

    var DEFAULT = {
        wrapper:{
            class: 'bar-wrapper',
            content: {
               
            },
            style: {
                position: 'absolute',
                height: '100%',
                width: '100%',
                border: '1px solid #d2d2d2'
            }
        },
        bar: {
            class: 'bar',
            style: {
                position: 'relative',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                flex: '0 0 auto',
                height: '100%',
                width:'0%',
                backgroundColor: '#d2d2d2'
            }
        }
    };

    var BarWrapper = function( options ){
        
        var self = this;
        
        self.defined = { 
            height: '100%', 
            width: '100%'
        };

        self.options = options;

        Object.defineProperty( self, 'width', {
            get: function(){
                return self.defined.width;
            }, 
            set: function( value ){
                self.defined.width = value;
                self.wrapper.style.width = value;
            }
        });

        Object.defineProperty( self, 'height', {
            get: function(){
                return self.defined.height;
            }, 
            set: function( value ){
                self.defined.height = value;
                self.wrapper.style.height = value
            }
        });
        self.buildWrapper();
    };

    BarWrapper.prototype.buildWrapper = function(){
        var self = this;
        var options = self.options;
        var params = {
            parent: options.parent,
            class: 'bar-wrapper',
            style: {
                position: 'absolute',
                display: 'flex',
                height: self.height,
                width: self.width,
                border: '1px solid #d2d2d2',
                boxSizing: 'border-box'
            }
        };
        self.wrapper = html.Element( params );

        if( options.parent ){
            if( typeof options.parent == 'string' ){
                options.parent = document.querySelector( options.parent );
            }
            options.parent.appendChild( self.wrapper )
        }
    };

    var ProgressBar = function( options ){

        var self = this;
        ProgressBar.super_.apply( this, arguments );
                   
        Object.defineProperty( self, 'percent', {
            get: function(){
                return self.defined.percent || 0;
            }, 
            set: function( value ){
                self.defined.percent = value;
                if( value > 100 ){
                    self.bar.style.width = '100%';
                    var hgrow = Math.min( value - 100, 200 );
                    self.bar.style.height = ( 100 + hgrow )+'%';
                    self.bar.style.top = '0%';
                   // self.bar.style.transform = 'translateY( -50% )';
                }else{
                    self.bar.style.top = '0%';
                    self.bar.style.transform = 'translateY( 0% )';
                    self.bar.style.width = value+'%';
                }
            }
        });

        self.create();
    };

    util.inherits( ProgressBar, BarWrapper );

    ProgressBar.prototype.create = function(){

        var self = this;

        var options = self.options;

        var params = {
            class: 'bar',
            style: {
                position: 'absolute',
                height: '100%',
                width: self.percent+'%',
                border: 0
            }
        };

        params.style[ options.align || 'left' ] = 0;

        if( options.color ){
            params.style.backgroundColor = options.color;
        }

        self.bar = html.Element( params );
        self.wrapper.appendChild( self.bar );
    
    };

    exports.progress = function( options ){
        return new ProgressBar( options );
    };

    var CompareBar = function( options ){

        var self = this;

        self.items = {};
        self.total = 0;

        CompareBar.super_.apply( this, arguments );

    }

    util.inherits( CompareBar, BarWrapper );

    CompareBar.prototype.set = function( name, value, color ){

        var self = this;

        if( !self.items[name] ){
            self.create( name, value, color );
        }else{
            self.total -= self.items[name].value;
            self.total += value;
            self.items[name].value = value;
            if( color ){
                self.items[name].bar.style.backgroundColor = color;
            }
        }

        self.resize();
    }

    CompareBar.prototype.resize = function( ){
        var self = this;
        for( var name in self.items ){
            var item = self.items[name];
            var percent = ( item.value/self.total ) * 100;
            item.bar.style.width = percent+'%';
        }
    }

    CompareBar.prototype.create = function( name, value, color ){
        var self = this;
        var bar = html.Element( DEFAULT.bar );
        if( color ) bar.style.backgroundColor = color;
        self.items[name] = { value: value, bar: bar };
        self.total += value;
        self.wrapper.appendChild( bar );
    }

    exports.compare = function( options ){
        return new CompareBar( options );
    };

    return exports;
});