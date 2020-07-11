define('animation.debug', [], function GeomBase(){
	
	var exports = this.exports;
	
	var elem = document.createElement("div");
	elem.id = 'ani_debug';
	elem.innerHTML = '<div id="debug_fps" class="row"><label>FPS:</label><span></span></div>';
	elem.style.position = 'absolute';
	elem.style.backgroundColor = '#FFFFFF';
	elem.style.zIndex = 2000;
	
	document.body.insertBefore(elem,document.body.childNodes[0]);
	
	exports.fps = document.getElementById('debug_fps').getElementsByTagName('span')[0];
	exports.fps.innerHTML = 0;
	exports.tick = 0;
	exports.time = 0;
		
	exports.render = function DebugRender( t ){
		exports.tick++;
		var dt = Math.floor(t.now/1000);
		if(exports.time != dt){
			exports.time = dt;
			exports.fps.innerHTML = Math.floor(exports.tick);
			exports.tick = 0;
		}
	};
		
	return exports;
	
});