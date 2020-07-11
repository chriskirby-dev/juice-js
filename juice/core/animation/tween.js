define('animation.tween', ['animation/timeline', 'animation/easing'], function AnimationTween( timeline, easing ){
	
	var exports = this.exports;
	//Object, time, properties
	exports.to = function( o, t, p ){
		t = t*1000;
		var render, end, start, props = {}, killed = false, ease = 'linear';
		var cb = null;
		start = timeline.time.now;
		end = start + t;
		if(p.ease) ease = p.ease;
		if(p.complete) cb = p.complete;
		
		for(var _prop in p)
			if(typeof o[_prop] != 'undefined') 
				props[_prop] = { start: o[_prop], end: p[_prop], span: ( p[_prop] - o[_prop]) };
		
		//Render Callback
		var tlRender = function TweenRender(time){
			
			var per = ( time.now - start ) / t;
			
			if( per > 1 ){
				killed = true;
				if( cb ) cb();
				timeline.remove( tlRender );
			}
			
			for(var _prop in props){
				//console.log(props[_prop].span * per);
				per = easing[ease]( (time.now - start), t );
				o[_prop] = killed ? props[_prop].end : props[_prop].start + ( props[_prop].span * per );
			}
			
			return false;
		};
		
		timeline.add( tlRender );
		
		return {
			kill: function(){
				killed = true;
				timeline.remove( tlRender );
			}
		};
	};
	
	return exports;
	
});