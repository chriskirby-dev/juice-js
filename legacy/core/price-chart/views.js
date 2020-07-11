define('price-chart/views', ['utils', 'dom', 'dom/css', 'canvas/stage'], function PriceChart( utils, dom, css, CanvasStage ){

    var exports = this.exports;

    exports.wrappers = {};
    exports.defined = {};


    css.use('price-chart');

    css.append({
        '.chart-wrapper':{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexWrap: 'nowrap',
            flexDirection: 'column'
        },
        '.chart-wrapper > .view':{
            position: 'relative',
            flex: '0 1 auto'
        },
        '.chart-wrapper > .display':{
            flex: '1 1 auto',
            height: '100%'
        },
        '.chart-wrapper > .timeline':{
            height: '30px',
            background: '#f3f3f3',
            borderTop: '1px solid #d2d2d2'
        }
    });

    var View = function( id ){
        var self = this;
        self.wrapper = document.createElement('div');
        self.wrapper.className = 'view '+id;
        //self.stage = ;
        self.stage = new CanvasStage( id );
        self.stage.appendTo( self.wrapper );
    }

    View.prototype.appendTo = function( parent ){
        var self = this;
        parent.appendChild( self.wrapper );
        self.stage.resize();
    }

    var Views = function(){
        var self = this;
        self.defined = {};
        self.ids = [];
        Object.defineProperty( self, 'wrapper', {
            get: function(){
                return self.defined.wrapper;
            },
            set: function( wrapper ){
                self.defined.wrapper = document.querySelector( wrapper );
                self.defined.wrapper.classList.add('chart-views');
                self.defined.wrapper.classList.add('chart-wrapper');
                self.initialize();
                return false;
            }
        });

    }

    utils.inherits( Views, Object.prototype );

    Views.prototype.add = function( id ){
        console.log( 'Add to View', id );
        var self = this;
        if( !self[id] ){
            self[id] = new View( id );
            self[id].appendTo( self.wrapper );
            for( var i=0;i<self.ids.length;i++ ) self[self.ids[i]].stage.resize();
            self.ids.push( id );
        }
        return self[id];
    };
    Views.prototype.resize = function(  ){
        var self = this;
        for( var i=0;i<self.ids.length;i++ ) self[self.ids[i]].stage.resize();
    };

    Views.prototype.initialize = function(  ){
       this.add('display');
    };

    return new Views('price-chart');

});