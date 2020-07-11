define('canvas/view', [], function(){

    var exports = this.exports;

    //exports.objects = objects;
    var CanvasView = function( wrapper ){
        var self = this;
        self.wrapper = wrapper;
        self.canvas = document.createElement('canvas');
        wrapper.appendChild( self.canvas  );
        self.resize();
    };

    CanvasView.prototype.resize = function( w, h ){
        var self = this;
        var bounds = self.wrapper.getBoundingClientRect();
        self.bounds = bounds;
        self.width = w || bounds.width;
        self.height = h || bounds.height;
        self.canvas.width = self.width;
        self.canvas.height = self.height;
    };

    CanvasView.prototype.clear = function( x, y, w, h ){
        var self = this;
        var ctx = self.context();
       
        x = x || 0;
        y = y || 0;
        w = w || self.width;
        h = h || self.height;
    
       //console.log('CLEAR', ctx, x, y, w, h);
        return ctx.clearRect( x, y, w, h );
    };

    CanvasView.prototype.context = function(){
        return this.canvas.getContext('2d');
    };

    CanvasView.prototype.copy = function( w, h, x, y ){
        var self = this;
        return self.context().getImageData( x || 0, y || 0, w, h );
    };

    CanvasView.prototype.paste = function( imageData, x, y ){
        var self = this;
        return self.context().putImageData( imageData, x || 0, y || 0 );
    };

    CanvasView.prototype.shift = function( px ){
        var self = this;

        if( isNaN(self.width) || isNaN( self.height ) || self.width == 0 || px == 0 || isNaN(px) ) return;
        var ctx = self.context();
        var abs = Math.abs( px );
        const dir = px < 0 ? 'left' : 'right';
        var copy = { x: 0, y: 0 , w: self.width - abs, h: self.height };
        var paste = { x: 0, y: 0 };

        if( dir == 'left' ){
            copy.x = abs;
        }else{
            paste.x = px;
        }

        //console.log( px, copy, paste );
        var imageData = ctx.getImageData( copy.x, copy.y, copy.w, copy.h );
        //Clear All Data
        ctx.clearRect( ( dir == 'left' ? self.width-abs : 0 ), 0, abs, self.height );
        //Paste Saved Data
        ctx.putImageData( imageData, paste.x, paste.y );

        return false;
    };
    

    exports.create = function( selector, asStage ){

        var wrapper = null;
        if( typeof selector == 'string' ){
            wrapper = document.querySelector( selector );
        }else{
            wrapper = selector;
        }

        

        return new CanvasView( wrapper );
    };

    return exports;

});