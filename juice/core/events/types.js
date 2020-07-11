define('event.types', function EventUtil(){

	var exports = this.exports;
	
	var prefix = window.addEventListener ? "" : "on";
		
	exports.EVENT_ADD = prefix == "" ? "addEventListener" : "attachEvent";
	exports.EVENT_REMOVE = prefix == ""  ? "removeEventListener" : "detachEvent";
	
	//Mouse Events
	exports.MOUSE_CLICK = prefix+'click';
	exports.MOUSE_DOUBLECLICK = prefix+'dblclick';
	exports.MOUSE_DOWN = prefix+'mousedown';
	exports.MOUSE_UP = prefix+'mousedown';
	exports.MOUSE_MOVE = prefix+'mousemove';
	exports.MOUSE_ENTER = prefix+'mouseenter';
	exports.MOUSE_LEAVE = prefix+'mouseleave';
	//Right Click
	exports.MOUSE_CONTEXT = prefix+'contextmenu';
	
	//Keyboard Events
	exports.KEY_DOWN = prefix+'keydown';
	exports.KEY_PRESS = prefix+'keypress';
	exports.KEY_UP = prefix+'keyup';
	
	//Frame/Object Events
	exports.ABORT = prefix+'abort';
	exports.BEFORE_UNLOAD = prefix+'beforeunload';
	exports.ERROR = prefix+'error';
	exports.HAS_CHANGE = prefix+'haschange';
	exports.LOAD = prefix+'load';
	exports.PAGE_SHOW = prefix+'pageshow';
	exports.PAGE_HIDE = prefix+'pagehide';
	exports.RESIZE = prefix+'resize';
	exports.SCROLL = prefix+'scroll';
	exports.UNLOAD = prefix+'unload';
	
	//Drag Events
	exports.DRAG = prefix+'drag';
	exports.DRAG_END = prefix+'dragend';
	exports.DRAG_ENTER = prefix+'dragenter';
	exports.DRAG_LEAVE = prefix+'dragleave';
	exports.DRAG_OVER = prefix+'dragover';
	exports.DRAG_START = prefix+'dragstart';
	exports.DROP = prefix+'drop';
	
	//Clipboard Events
	exports.CLIPBOARD_COPY = prefix+'copy';
	exports.CLIPBOARD_CUT = prefix+'cut';
	exports.CLIPBOARD_PASTE = prefix+'paste';
	
	//Print Events
	exports.AFTER_PRINT = prefix+'afterprint';
	exports.BEFORE_PRINT = prefix+'beforeprint';
	
	//Media Events
	
	
	return exports;

});