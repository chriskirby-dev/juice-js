define('canvas/layer', [], function(){

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
    };

    CanvasView.prototype.clear = function( x, y, w, h ){
        var self = this;
        var ctx = self.context();
        if( arguments.length == 0 ){
            x = y = 0;
            w = self.width;
            h = self.height;
        }
        ctx.clearRect( x, y, w, h );
    };

    CanvasView.prototype.context = function(){
        return this.canvas.getContext('2d');
    };

    CanvasView.prototype.shift = function( px ){
        var self = this;
        var ctx = self.context();
        var imageData = ctx.getImageData( px, 0, self.width-px, self.height );
        ctx.putImageData( imageData, 0, 0);
        ctx.clearRect( self.width-px, 0, px, self.height );
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