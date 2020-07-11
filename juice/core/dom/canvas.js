define('dom/canvas', ['utils'], function DomCanvas( utils ){
	
	var exports = this.exports;
	var global = this.global;
	
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
	
	Canvas.prototype.getById = function( id ){
		this.canvas = this.el = document.getElementById(id);
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
	
	Canvas.prototype.loadImage = function( img, params, callback ){
		var self = this;
	
		console.log(callback);
			
		var draw = function(){
			console.log('draw');
			console.log(img);
			var w = (params.w?params.w:img.width);
			var h = (params.h?params.h:img.height);
			if(params.scale) w*=params.scale, h*=params.scale; 
			self.context.drawImage( img, (params.x?params.x:0), (params.y?params.y:0), w, h );
			if(callback) callback();
		};
		
		if(typeof img == 'string'){
			var image = new Image();
			image.onload = function(){
				img = image;
				draw();
			};
			image.src = img;
		}else{
			draw();
		}
	};
	
	Canvas.prototype.image = function( callback ){
		// save canvas image as data url (png format by default)
     	 var dataURL = this.canvas.toDataURL();
      	// set canvasImg image src to dataURL
     	// so it can be saved as an image
		var tmp = new Image;
		tmp.onload = function(){
			callback( tmp );
		};
		tmp.src = dataURL;
		return tmp;
	};
	
	Canvas.prototype.imageStrip = function( images, vert ){
		console.log('imageStrip');
		console.log(images);
		if(images.length > 0){
			console.log(images.length+' IMages');
			this.size(images.length*images[0].width, images[0].height);
			for(var i=0;i<images.length;i++){
				this.context.drawImage( images[i], images[0].width*i, 0 );
			}
		}

	};
	
	Canvas.prototype.silhouette = function( ){
		this.context = this.canvas.getContext("2d");
		var imgData = this.context.getImageData(0,0,parseInt(this.canvas.width),parseInt(this.canvas.height));
		
		var pix = imgData.data;
		//convert the image into a silhouette
		for(var i=0, n = pix.length; i < n; i+= 4){
			//set red to 0
			pix[i] = 0;
			//set green to 0
			pix[i+1] = 0;
			//set blue to 0
			pix[i+2] = 0;
			//retain the alpha value
			pix[i+3] = pix[i+3];
		}
    	this.context.putImageData(imgData,0,0);
	};
	
	Canvas.prototype.rect = function( x, y, w, h ){
		this.context = this.context || this.canvas.getContext("2d");
		this.context.rect(x,y,w,h);
	};
	
	exports.find = function( id ){
		if(!id) return false;
		var canvas;
		canvas = document.getElementById(id);
		
		if(canvas){
			global.counts.canvas++;
			var canvas =  new Canvas( canvas );
		}
		global.counts.canvas++;
		return canvas;
	};
	
	exports.create = function( id, parent ){
		global.counts.canvas++;
		//if(!id) id = 'canvas_'+global.counts.canvas;
		return (function( id, parent ){
			var canvas =  new Canvas( id );
			if( parent ){
				parent.appendChild(canvas.el);
			}
			return canvas;
		})( id, parent );
	};
	
	return exports;
	
});