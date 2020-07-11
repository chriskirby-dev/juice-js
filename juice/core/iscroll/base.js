define('iscroll', [ 'dom/css', 'events' ], function( css, events ){
	
	var exports = this.exports;
	var app = this.app;
	var iscrollDir = this.context.path.dir;
	console.log( this.context.path.dir );
	
	exports.core = null;
	exports.loaded = [];
	
	css.append({
		'.iscroll-wrapper': {
			position: 'absolute',
			width: '100%',
			height: '100%',
			overflow: 'hidden'
		},
		
		'.iscroll-scroller': {
		  
		}
	});
	
	exports.load = function( type, next ){
		if(exports.loaded.indexOf(type) !== -1){
			next();
			return false;
		}
		var path = iscrollDir+'/core/iscroll';
		if(type) path += '-' +type;
		path += '.js';
		require( path ).then(function(){
			if(next) next();
			exports.loaded.push(type);
			return false;
		});
	};
	
	var InfiniteScroll = function( wrapper, params ){
		var self = this;
		events._extend(self);
		this.wrapper = wrapper;
		this.itemPath  = params.itemPath;
		this.items = params.items || [];
		this.hook = {};
		if(params.hooks){
			for(var hook in params.hooks){
				self.hook[hook] = params.hooks[hook];
			}
		}
		if(params.render){
			self.hook.render = params.render;
		}
		this.index = 0;
		exports.load('infinite', function(){
			self.initialize();
			self.emit('ready');
			
		});
	};
	
	InfiniteScroll.prototype.initialize = function(){
	 	var self = this;
	 		 	
	 	function requestData (start, count) {
			var data = [];
			var mul = Math.floor((start/(self.items.length)));
			var idx = start-(self.items.length*mul);
			while( data.length < count ){
				data.push(self.items[idx]);
				idx++;
				if(idx > self.items.length-1) idx = 0;
			}
			this.updateCache( start, data );	
	 	}
	 	
	 	self.core = new IScroll( self.wrapper, {
			mouseWheel: true,
			tap: true,
			infiniteElements: self.itemPath,
			infiniteLimit: 1000,
			cacheSize: self.items.length*2,
			dataset: requestData,
			dataFiller: self.hook.render,
			probeType: 2
		});
		
		
	};
	
	exports.InfiniteScroll = InfiniteScroll;

	
	return exports;
	
});
