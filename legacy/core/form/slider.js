define('form/slider', function InputSlider(){
	
	var exports = this.exports;
	
	if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		return window.setTimeout(callback, 1000 / 60);
	});
	}
	
	exports.sliders = [];
	
	var InputSlider = function( wrapper ){
		
		var self = this;
		var body = document.getElementsByTagName('body')[0];
		this.min = wrapper.$.attr('data-min');
		this.max = wrapper.$.attr('data-max');
		this.value = wrapper.$.attr('data-value');
		this.tab = wrapper.$.find('.tab');
		this.bar = wrapper.$.find('.bar');
		this.input = wrapper.$.find('input');
		
		this.pressX = null;
		this.lastX = 0;
		this.maxX = null;
		this.currentX  = null;	
		this.pressed = false;
		this.tabLeft = 0;
		this.oob = false;
		this.drag = {
			start: null,
			maxX: null,
			minX: null
		};
		
		this.tab.style.marginLeft = ( this.input.value * 100 )+'%';
		
		var monitorStatus = function(){
			
			body.$.on('mousemove', function( e ){ 
				if(self.pressed){
					if( e.clientX > self.drag.minX && e.clientX < self.drag.maxX ){
						self.oob = false;
						self.tabLeft =  e.clientX - self.barX - self.pressX;
						self.tab.style.marginLeft = ((self.tabLeft/self.maxX)*100)+'%';
						self.input.value = self.tabLeft/self.maxX;
						self.input.$.emit('change');
					}else{
						if(!self.oob){
							self.oob = true;
							if( e.clientX > self.drag.minX ){
								self.tabLeft = 100;
								self.input.value = 1;
							}else{
								self.tabLeft = 0;
								self.input.value = 0;
							}
							self.input.$.emit('change');
							self.tab.style.marginLeft = self.tabLeft+'%';
						}
					}
					self.drag.lastX = e.clientX;
				}
			});
			
			body.$.on('mouseup', function( e ){ 
				self.mouseup( e );
			});
			
		};
		
		this.tab.$.on('mousedown', function( e ){
			self.mousedown( e );
			monitorStatus();
		});
		
		
	};

	
	InputSlider.prototype.mousedown = function( e ){
		this.pressed = true;
		this.pressX = e.offsetX;
		this.barWidth = this.bar.$.width;
		this.barX = this.bar.$.offset().left;
		this.tabWidth = this.tab.$.width;
		this.tabX = this.tab.$.offset().left;
		this.maxX = this.barWidth;
		
		this.drag.start = this.drag.lastX = e.clientX;
		this.drag.maxX = this.barX + ( ( this.barWidth + this.tabWidth ) - e.offsetX );
		this.drag.minX = this.barX + ( e.clientX - this.tabX );		
		console.log('barX', this.barX, 'barWidth', this.barWidth );
		console.log('Tab MouseDown', this.drag );
	};
	
	InputSlider.prototype.mouseup = function( e ){
		this.pressed = false;
		this.pressX = null;
		//console.log('Tab MouseUp', this.bar.$.width );
	};
	
	exports.bindTo = function( wrappers ){
		//console.log('Input SLiders', wrappers);
		wrappers.$.each(function( slider ){
			//console.log('Slider', slider);
			exports.sliders.push(new InputSlider(slider));
		});
	};
	
	return exports;

});