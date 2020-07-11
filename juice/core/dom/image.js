define('dom/image', function DomImage(){
	
	var exports = this.exports;
	var batch = 0;
	exports.load = function(images, callback){
		batch++;
		if(typeof images == 'string') images = [images];
		var imgs = [];
		var icount = images.length;
		for(i=1;i<=icount;i++){
			var img = new Image;
			img.crossOrigin = "Anonymous";
			img.id = i-1;
			img.onload = function(){
				imgs[this.id] = this;
				if(imgs.length>=icount)
					if(callback) callback(imgs);
			};
			img.src = images[i-1];
		}
	};

	return exports;
	
});