define('ui/dropzone', [ 'events/dom', 'events/drag', 'file'], function( Event, DragEvent, file ){
	
	var BindEvents = this.exports.events.extend;
	var File = file.Base;
	
	var DropBox = function(wrapid){
		
		var self = this;
		//console.log(this);
		BindEvents(self);
		//console.log(wrapid);
		self.index = 0;
		self.wrapper = typeof wrapid == 'object' ? wrapid : document.getElementById(wrapid);
		self.dragPosition = { x: null, y: null };
		self.dragging = false;
		self.dragLastEmit = null;
		self.dragInterval = 100;
		//console.dir(self.wrapper);
		self.wrapper.$.class('empty', true);
		
		Event.add(window, 'drop', Event.cancel );
		Event.add(window, 'dragexit', Event.cancel );
		Event.add(window, 'dragover', Event.cancel );
		Event.add(window, 'dragenter', Event.cancel );
		
		function DragStart(event){
			if(!self.dragging){
				self.dragging = true;
				//self.wrapper.$.class('dragging', true);
				self.dragPosition = { x: event.clientX, y: event.clientY };
				var type = 'text';
				console.log(event.dataTransfer.types);
				if(Array.prototype.slice.call(event.dataTransfer.types).indexOf('Files') != -1){
					type = 'files';
				}
				self.emit('drag.start', type);
			}
		}
		
		//console.dir(self.wrapper);
		//console.dir(self.wrapper.$);
		
		//Add Drag n Drop Events
		Event.add(self.wrapper, DragEvent.DRAG_ENTER, function DragEnter(event){
			Event.cancel(event);
			if(!self.dragging) DragStart( event );
		}, true);
		
		Event.add(self.wrapper, DragEvent.DRAG_START, function DragStart(event){
			Event.cancel(event);
			if(self.disabled) return false;
			if(!self.dragging) DragStart( event );
		}, true);
		
		Event.add(self.wrapper, DragEvent.DRAG_OVER, function DragOver(event){
			Event.cancel(event);
			if(self.disabled) return false;
			self.dragging = true;
			self.dragPosition = { x: event.clientX, y: event.clientY };		
			self.emit('dragging');
		}, true);
		
		Event.add(self.wrapper, DragEvent.DRAG_EXIT, function DragExit(event){
			Event.cancel(event);
			if(self.disabled) return false;
			if(self.dragging){
				self.dragging = false;
				self.wrapper.$.class('dragging', false);
				self.dragPosition = { x: null, y: null };
				self.emit('drag.exit');
			}
		}, true);
		
		Event.add(self.wrapper, DragEvent.DROP, function DragDrop(event){
			Event.cancel(event);
			if(self.disabled) return false;
			self.dragging = false;
			self.wrapper.$.class('dragging', false);
			self.dragPosition = { x: null, y: null };
			if(event.dataTransfer.files.length > 0){
				for(i=0;i<event.dataTransfer.files.length;i++){
					self.index++;
					self.emit('file', event.dataTransfer.files[i] );
				}
			}
			setTimeout(function(){
				self.wrapper.$.class('empty', false);
			}, 0);
			
		}, true);
		
		this.disable = function(){
			self.disabled = true;
		};
		
	};

	return {
		dz: null,
		create: function(wrapid){
			this.dz = new DropBox(wrapid);
			return this.dz;
		},
		disable: function(){
			//Event.remove(self.wrapper, DragEvent.DROP, );
		}
	};
	
}, { extend: 'events' });
