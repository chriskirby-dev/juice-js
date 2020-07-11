define('iscroll/infinite', [ 'iscroll' ], function( iscroll ){
	
	var exports = this.exports;
	var app = this.app;
	exports.ready = false;
	
	var InfiniteScroll = function( wrapper, params ){
		
		this.wrapper = wrapper;
		this.itemPath  = params.itemPath;
		this.items = params.items || [];
		this.hook = {};
		this.index = 0;
		
	};
	
	InfiniteScroll.prototype.initialize = function(){
	 	var self = this;
	 	
	 	function onTapped(){
	 		alert(tap);
	 	}
	 	
	 	function updateContent (el, data) {
	 		var tmp = document.createElement('div');
	 		tmp.innerHTML = data;
	 		tmp.firstChild.addEventListener('tap', onTapped, false);
			el.appendChild(tmp.firstChild);
		}
	 	
	 	function requestData (start, count) {
			var data = [];
			while( data.length <= count ){
				data.push(els[di]);
				self.index++;
				if(self.index == els.length) self.index = 0;
			}
			this.updateCache( start, data );	
	 	}
	 	
	 	self.core = new IScroll( self.wrapper, {
			mouseWheel: true,
			tap: true,
			infiniteElements: self.itemPath,
			infiniteLimit: 1000,
			cacheSize: 30,
			dataset: requestData,
			dataFiller: updateContent,
		});
	};
	
	iscroll.load('infinite', function(){
		exports.ready = true;
		exports.emit('ready');
	});
	
	return exports;

}, { extend: 'events' });