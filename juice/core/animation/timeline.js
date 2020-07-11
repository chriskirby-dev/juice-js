define('animation.timeline', ['animation/time'], function AnimationTimeline( Time ){
	
	//Return Global Object if exists.
	if(this.global.timeline) return this.global.timeline;

	var exports = this.exports;
	var global = this.global;
			
	if(!window.requestAnimationFrame){
		window.requestAnimationFrame = 
		(window.webkitRequestAnimationFrame 	||
		 window.mozRequestAnimationFrame 		||
		 window.oRequestAnimationFrame			||
		 window.msRequestAnimationFrame			||
		 function( callback ){
			return window.setTimeout(callback, 1000 / 60 );
		 });
	}
			
	exports.time = Time;
	exports.active = false;
	exports.isDebugging = false;
	
	exports.debug = function( d ){
		var debugReady = function(debug){
			exports.add( debug.render );
		};
		if( d && !exports.isDebugging){
			exports.isDebugging = true;
			require('animation/debug', function( debug ){
				debugReady(debug);
			});
		}
	};
			
	exports.views = [];
	
	exports.start = function(){
		exports.active = true;
		exports.time.startTime();
		exports.draw();
	};
	
	exports.stop = function(){
		exports.active = false;
		window.cancelRequestAnimFrame(exports.draw);
	};

	exports.update = function( t ){

		exports.time.set( t );
		//Update Playtime
		
		if(exports.views.length == 0) return false;
		
		//Update Views
		for(var i=0;i<exports.views.length;i++){
			var view = exports.views[i];
			if( view.update ) 
				view.update( exports.time );
		}
		
		//Render Views
		for(var i=0;i<exports.views.length;i++){
			var view = exports.views[i];
			if( view.render ){
				if(!view.start) view.start = exports.time.now;
				if( view.fps && view.last ){
					var vd = exports.time.now - view.last;
					if( vd < ( 1000 / view.fps )) continue;
				}
				view.last = exports.time.now;
				view.render( exports.time );
			}
		}
		
		return true;
	};
	
	//Dram Views
	exports.draw = function( t ){
		exports.update( t );
		window.requestAnimationFrame(exports.draw); 
	};
	
	//Remove Animation From Timeline
	exports.remove = function( render ){
		for(var i=0;i<exports.views.length;i++)
			if( exports.views[i].render === render ){
				exports.views.splice( i, 1 );
			}
		
		if(exports.views.length == 0){
			exports.stop();
		}
		return false;
	};
	
	//Add Animation To Timeline
	exports.add = function( renderer, fps ){
		var view = { fps: fps, last: null, start: null  };
		if(typeof renderer == 'function'){
			view.render = renderer;
		}else if(typeof renderer == 'object'){
			view.update = renderer.update;
			view.render = renderer.render;
		}
		exports.views.push(view);
		return view;
	};
	
	global.timeline = exports;
	
	return exports;
	
}, { persistant: true } );