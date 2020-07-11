define('dom/loader', function DomLoader(){
	
	var exports = this.exports;
	var batch = 0;
	var jobs = [];
	
	exports.css = function(images, callback){
		
	};
	
	exports.images = function(images, callback){
		console.log('exports.images');
		batch++;
		if(typeof images == 'string') images = [images];
		
		(function( _images, b, cb ){
			var imgs = [];
			var count = 0;
			
			for(var i=0;i<_images.length;i++){
				
				var img = new Image();
				img.crossOrigin = "Anonymous";
				img.id = 'batch'+b+'-'+i;
				
				var onImageLoaded = function(){
					count++;
					var id = this.id.split('-').pop();
					imgs[id] = this;
					if(count >=_images.length){
						//console.log('BATCH: '+b+' || '+imgs.length+' :: '+_images.length);
						if(cb) cb(imgs);
					}
				};
				
				img.onload = onImageLoaded;
				
				img.src = _images[i];
			}
			return false;
		})( images, batch, function(imgList){
			callback(imgList);
			return false;
		});
		
		return false;
	};
	
	return exports;
});