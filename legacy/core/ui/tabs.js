define('ui/tabs', [], function(  ){

	var app = this.app;
    var exports = this.exports;

    var JuiceTabs = function( options ){
        var self = this;
        exports.events.extend( self );
        self.tabTag = options.tabTag || 'li';
        self.active = options.active || 0;

        if( options.container ){
            if( options.container.parent ){
                this.container('tab', options.container.parent.querySelector('.tabs') );
                this.container('content', options.container.parent.querySelector('.tab-contents') );
             }
            if( options.container.tabs ) self.container('tab', options.container.tabs );
            if( options.container.contents ) self.container('content', options.container.contents );
        }

        self.initialize();
    };

    JuiceTabs.prototype.container = function( type, wrapper ){
        this[type+'s'] = typeof wrapper == 'string' ? document.querySelector( wrapper ) : wrapper;
        this[type] = Array.prototype.slice.call( this[type+'s'].children );
    }

    JuiceTabs.prototype.setContents = function( tabs ){
        this.tabs = typeof tabs == 'string' ? parent.querySelector( tabs ) : tabs;
        this.tab = Array.prototype.slice.call( this.tabs.children );
    }

    JuiceTabs.prototype.addTab = function( label, index ){
        var self = this;

        var tab = document.createElement( self.tabTag );
        tab.innerHTML = label;
        var pane = document.createElement( 'div' );

        if( index !== undefined ){
            this.tabs.insertBefore( tab, tabs[index] );
            this.contents.insertBefore( pane, contents[index] );
        }else{
            this.tabs.appendChild( tab );
            this.contents.appendChild( content );
        }

        tab.onclick = function(){

        };
    }

    JuiceTabs.prototype.setContent = function( content, index ){
        this.content[index].innerHTML = content;
    };

    JuiceTabs.prototype.focus = function( index ){
        console.log( index );
        this.tabs.$.find('.active').$.class('active', false );
        this.contents.$.find('.active').$.class('active', false );
        
        this.content[index].classList.add('active');
        this.tab[index].classList.add('active');
        
    };

    JuiceTabs.prototype.includeTab = function( type, el  ){
        switch( type ){
            case 'tab':
            el.onclick = function(){

            }
            break;
        }
    }

    JuiceTabs.prototype.initialize = function(){
        const self = this;
        var corsor = 0;
        var target = null;


        this.tabs.$.findAll( this.tabTag ).$.on('click', function(){
            if( this.$.class('active') ) return false;
            
            self.focus( this.$.attr('data-tabindex') );
      
        
            return false;
        });

        console.log( this );
    }

    exports.Constructor = JuiceTabs;

    exports.find = function( parent ){
        return new JuiceTabs( { container: { parent: parent } } );
    };

    return exports;
}, { extend: 'events' });