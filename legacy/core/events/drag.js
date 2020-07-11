define('events.drag', function EventsDrag(){
	
	var exports = this.exports;
	
	var prefix = window.addEventListener ? "" : "on";
	
	//Drag Events
	exports.DRAG = prefix+'drag';
	exports.DRAG_END = prefix+'dragend';
	exports.DRAG_ENTER = prefix+'dragenter';
	exports.DRAG_LEAVE = prefix+'dragleave';
	exports.DRAG_OVER = prefix+'dragover';
	exports.DRAG_START = prefix+'dragstart';
	exports.DROP = prefix+'drop';
	
	return exports;
	
});