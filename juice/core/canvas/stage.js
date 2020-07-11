define('canvas/stage', ['utils', 'canvas/view'], function( utils, view ){
    var exports = this.exports;

    var StageLayer = function( stage, id, z ){
        var self = this;
        self.index = stage.length;
        self.stage = stage;
        self.id = id;
        self.zIndex = 1;
        if( z !== undefined ) self.zIndex = z;
        self.initialize();
    };

    StageLayer.prototype.shift = function( px ){
        var self = this;
        self.view.shift( px );
    }


    StageLayer.prototype.resize = function(){
        var self = this;
        //console.log('Resize Layer Bounds', self.stage.bounds );
        if( self.stage.bounds ){
            self.canvas.width = self.stage.bounds.width;
            self.canvas.height = self.stage.bounds.height;
            self.view.width = self.stage.bounds.width;
            self.view.height = self.stage.bounds.height;
        }
        
        self.view.resize();
        return false;
    };

    StageLayer.prototype.clear = function(  x, y, w, h ){
        var self = this;
        return self.view.clear(  x, y, w, h );
    }

    StageLayer.prototype.remove = function( ){
        var self = this;
        self.canvas.parentNode.removeChild( self.canvas );
    }

    StageLayer.prototype.initialize = function( ){
        var self = this;
        var cview = view.create( self.stage.wrapper );
        self.view = cview;
        var canvas = cview.canvas;
        canvas.className = 'canvas-layer layer-'+self.id;
        canvas.style.zIndex = self.zIndex;
        canvas.style.position = 'absolute';
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        self.canvas = canvas;
        self.ctx = cview.context();
        self.resize();
        self.view.resize();
    };


    var Stage = function( id ){
        var self = this;
        self.id = id;        
        self.layers = {};
        self.width = null;
        self.height = null;
        self.padding = { left: 0, right: 0, top: 0, bottom: 0 };
        self.bounds = null;
        self.minX = 0;
        self.maxX = 0;
        self.initialize();
    };

    utils.inherits( Stage, Array.prototype );

    Stage.prototype.layer = function( id, z ){
        var self = this;
        if( self.layers[id] === undefined ){
            var layer = new StageLayer( self, id, z );
            self.push( layer );
            self.layers[id] = self.length-1;
        }
        return self[self.layers[id]];
    }

    Stage.prototype.plotX = function( v, fromPX ){
        var self = this;
        if( fromPX ){
            var span = self.maxX - self.minX;
            return self.minX + (( v/self.width)*span);
        }
        return self.padding.left + ( (( v - self.minX )/( self.maxX - self.minX ))*( self.width - self.padding.right ) );
    };

    Stage.prototype.plotY = function( v, fromPX ){
        var self = this;
        if( fromPX ){
            var span = self.maxY - self.minY;
            return self.maxY - (( v/self.height)*span);
        }
        return self.padding.top + ( (( self.maxY - v )/( self.maxY - self.minY ))*( self.height - self.padding.bottom ) );
    };

    Stage.prototype.shift = function( px ){
        var self = this;
        for( var i=0;i<self.length;i++ ) self[i].shift( px );
    }

    Stage.prototype.resize = function(){
        var self = this;
        var bounds = self.wrapper.getBoundingClientRect();
        self.bounds = bounds;
        self.width = bounds.width - ( self.padding.left + self.padding.right );
        self.height = bounds.height - ( self.padding.top + self.padding.bottom );
        for( var i=0;i<self.length;i++ ) self[i].resize();
        return false;
    }

    Stage.prototype.appendTo = function( parent ){
        var self = this;
        parent.appendChild( self.wrapper );
        self.resize();
    }
    
    Stage.prototype.initialize = function( ){
        var self = this;
        self.wrapper = document.createElement('div');
        self.wrapper.className = self.id+' canvas-stage';
        self.wrapper.classList.add('canvas-stage');
        self.wrapper.style.width = '100%';
        self.wrapper.style.height = '100%';
        self.wrapper.style.position = 'absolute';
        self.layer('main');
    };

    return Stage;
});