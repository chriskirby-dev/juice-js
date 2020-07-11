define('http/image', function(){
	var exports = this.exports;
	
	exports.base642 = function( path, callback ){
		var iframe = document.createElement("iframe");
			
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		
		var img = document.createElement("img");
		img.src = path;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img,0,0);
		
		var dataStr = canvas.toDataURL("image/png");
		iframe.src=dataStr;
		
		console.log(iframe.src);
		return iframe.src;
	};
	
	exports.base64 = function( path, callback ){
		var iframe = document.createElement("iframe");
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var _img = document.createElement("img");
		_img.src = path;
		ctx.drawImage(_img,0,0);
		
		function getData(){
			var dataStr = canvas.toDataURL("image/png");
			iframe.src=dataStr;
			callback(iframe.src);
			return false;
		}
		
		getData();
		return false;
	};
	
	
	return exports;
});