define('render/canvas', [], function( ){
    console.log('App Trades Loaded');
    var app = this.app;
    var exports = this.exports;

    var Canvas = function( element ){
		
		if(!element || typeof element == 'string'){
			if(element) this.canvas = this.el = document.getElementById(element);
			if(!this.canvas){
				this.canvas = this.el = document.createElement('canvas');
				if(element) this.canvas.id = element;
			}
		}else{
			this.canvas = this.el = element;
		}
		
		this.size();
		
		this.context = this.canvas.getContext("2d");
	};

    Canvas.prototype.size = function( w, h ){
		if(!w && !h){
			this.height = this.canvas.height || this.canvas.outerHeight;
			this.width = this.canvas.width || this.canvas.outerWidth;
		}else{
			this.canvas.width = this.width = parseInt(w);
			this.canvas.height = this.height = parseInt(h);
		}
	};

    Canvas.prototype.clear = function( x, y, w, h ){
		this.context.clearRect((x?x:0), (y?y:0), (w?w:this.canvas.width), (h?h:this.canvas.height));
		return this;
	};

    exports.Constructor = Canvas;
    
    return exports;
});