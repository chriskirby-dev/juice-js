define('graph', ['lib/views/utils', 'dom/css'], function( utils, css ){
	
	var exports = this.exports;
	var assets;
	
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
	
	css.append({
		'.graph-wrapper': {
			position: 'absolute',	
			height: '100%',
			width: '100%',		
		},
		
	});
	
	var graph = { scale: 1 };
	graph.focus = {};
	graph.offset = { x:0, y:0 };
	
	exports.assets = {};
	assets = exports.assets;
	
	assets.ledgend = {};
	assets.ledgend.x = null;
	assets.ledgend.y = null;
	
	exports.container = null;
	exports.wrapper = null;
	exports.ledgendX = null;
	exports.ledgendY = null;
	
	exports.config = {};
	exports.dates = [];
	exports.data = null;
	
	exports.properties = {};
	
	exports.steps = [1,2.5,5,10,25,50,100,200,500,1000,1500,2000,2500,5000, 10000, 20000];
	
	exports.timeline = { 
		dates: [], 
		keys: function(){
			return exports.timeline.dates.map(function(d){
				return d.key;
			});
		}	
	};
	
	exports.view = {
		plots: []
	};
	
	exports.setTimeline = function( startTime, endTime ){
		
		self.dates = [];
		
		var months = {};
		var one_day=1000*60*60*24;
		var currentTime = startTime;
		
		var currentDate = new Date();
		currentDate.setTime( currentTime );
		currentDate.setHours(0);
		currentDate.setMinutes(0);
		currentDate.setSeconds(0); 
		
		var lastDate = new Date();
		lastDate.setTime( endTime );
		lastDate.setHours(23);
		lastDate.setMinutes(59);
		lastDate.setSeconds(59);
		
		endDate = lastDate.getTime();
		
		var index = 0;
		
		while( currentDate.getTime() <= endDate ){
		
			var cd = new Date();
			cd.setFullYear(currentDate.getFullYear());
			cd.setMonth(currentDate.getMonth());
			cd.setDate(currentDate.getDate());
			cd.setHours(0);
			cd.setMinutes(0);
			cd.setSeconds(0);
			
			currentDate = new Date();
			currentDate.setFullYear(cd.getFullYear());
			currentDate.setMonth(cd.getMonth());
			currentDate.setDate(cd.getDate()+1);
			currentDate.setHours(0);
			currentDate.setMinutes(0);
			currentDate.setSeconds(0);
			
			var dateDetails = {
				year: cd.getFullYear(),
				month: cd.getMonth(),
				month_long: utils.date.months[cd.getMonth()],
				month_short: utils.date.months_short[cd.getMonth()],
				day: cd.getDate(),
				key: cd.getFullYear()+'-'+(cd.getMonth()+1)+'-'+cd.getDate()
			};
			
			var key = dateDetails.key;
			exports.timeline.dates.push(dateDetails);
			
			if( months[dateDetails.month] ){
				months[dateDetails.month] += 1;
			}else{
				months[dateDetails.month] = 1;
				var month_label = document.createElement('li');
				month_label.setAttribute( 'data-month-id', dateDetails.month );
				month_label.innerHTML = utils.date.months[dateDetails.month];
				//self.month_wrapper.appendChild( month_label );
			} 
			
			var dateStr = ['<span class="year" >'+cd.getFullYear()+'</span>', '<span class="month" data-month-long="'+dateDetails.month_long+'" data-month-short="'+dateDetails.month_short+'" >'+(cd.getMonth()+1)+'</span>', '<span class="day" >'+cd.getDate()+'</span>'].join('');
			
			
			console.log(dateStr);
			exports.wrapper.$.append('<div data-key="'+dateDetails.key+'" data-index="'+index+'" ><div class="value"><div class="plot"></div><div class="line"><div></div></div><div class="inner""><div class="pre"></div><div class="post"></div></div></div></div>');
			assets.ledgend.x.$.append('<div data-key="'+dateDetails.key+'" data-index="'+index+'" ></div>');
		
			index++;
		}
		
	};
	
	exports.scale = 1;
	
	function scaleListener( el, cb ){
		
		var startDist;
		var startScale;
		var scaleX, scaleY, transformOriginX = 0, transformOriginY = 0;
		var touches = null;
		var scaling = false;
		var angle, dx, dy, endTo;
		var offsetX = 0, offsetY = 0;
		css.use('wrapper-updates');
		
		var center  = app.body.$.find('#touch-center');
		var origin = {};
		
		
		var updateScaling = function( t ){
			if(!scaling) return false;
			assets.graph.zoom.style.transform = 'scale('+(graph.scale)+')';
			window.requestAnimationFrame(updateScaling);
		};
		
		var startScaling = function(){
			//Started Scale
			scaling = true;
			startDist = dist;
			startScale = graph.scale;
			
			var rect = assets.graph.zoom.getBoundingClientRect();
			
			graph.width = exports.properties.view.width*graph.scale;
			graph.height = exports.properties.view.height*graph.scale;
			
			graph.focus.screenX = (touches[0].x + touches[1].x)/2;
			graph.focus.screenY = (touches[0].y + touches[1].y)/2;
			graph.focus.x = ( graph.focus.screenX - rect.left );
			graph.focus.y = ( graph.focus.screenY - (rect.top-10) );
			graph.focus.px = graph.focus.x/graph.width;
			graph.focus.py = graph.focus.y/graph.height;
			
			graph.offset.x = graph.focus.screenX - (graph.focus.px * exports.properties.view.width);
			graph.offset.y = graph.focus.screenY - (graph.focus.py * exports.properties.view.height);
			
			assets.graph.zoom.style.transformOrigin = (graph.focus.px)*100+'% '+(graph.focus.py)*100+'%';
			assets.graph.position.style.transform = 'translate3d('+graph.offset.x+'px, '+graph.offset.y+'px, 0 )';
			
			assets.scaleRing.style.opacity = 0.8;
			assets.scaleRing.style.left = graph.focus.screenX+'px';
			assets.scaleRing.style.top = graph.focus.screenY+'px';
			assets.scaleRing.style.width = startDist+'px';
			window.requestAnimationFrame(updateScaling);
		
		};
		
		var onTouch = function(_touches, end){
			
			touches = _touches;
			
			if(touches.length == 1){
				
			}else
			if(touches.length == 2){
				
				if(endTo ) clearTimeout(endTo);
				if(touches[0].x > touches[1].x) touches.reverse();
				dx = touches[0].x - touches[1].x;
				dy = touches[0].y - touches[1].y;
				dist = Math.sqrt( dx*dx + dy*dy );
				var rad = Math.atan2(dx, dy);
				angle = (rad * 180 / Math.PI)-180;
										
				if(!startScale  ) startScaling();
				
				var change = dist - startDist;
				if(change == 0 ) return false;

				assets.scaleRing.style.width = dist+'px';
				scale = change/startDist * startScale;
				graph.scale = Math.max(scale + startScale, 1);
				assets.debug.long.innerHTML = graph.scale;
			}
			
			
			if(end){
				endTo = setTimeout(function(){
					scaling = false;
					startDist = null;
					assets.scaleRing.style.opacity = 0;
					assets.debug.short.innerHTML = 'End';
				}, 50 );
			}
		
		};
		
		var mtend, mtstart;
		exports.wrapper.$.on('mouseup', function( e ){
			mtend = { x: e.$.pageX, y: e.$.pageY };
			onTouch([mtstart, mtend]);
		});
		
		exports.wrapper.$.on('mousedown', function( e ){
			mtstart = { x: e.$.pageX, y: e.$.pageY };
		});
		
		app.body.$.find('#logo').$.on('mousedown', function( e ){
			onTouch([mtstart, mtend], true);
		});

		assets.container.$.on('touch', onTouch );

	}
	
	exports.build = function( data ){
		console.log('build');
		assets.ledgend.x = app.body.$.find('#x-ledgend');
		assets.ledgend.y = app.body.$.find('#y-ledgend');
		assets.debug = {
			short:  app.body.$.find('#debug-short'),
			long:  app.body.$.find('#debug-long')
		}; 
		assets.debug.long.innerHTML = 'Start Debug';
		
		assets.container = app.body.$.find(exports.container);
		assets.container.$.append('<div class="graph-position" ><div class="graph-zoom" ><div class="graph-wrapper"></div></div></div>');
		exports.wrapper = assets.container.$.find('.graph-wrapper');
		exports.wrapper.$.class('bar', true);
		
		assets.graph = {
			position: assets.container.$.find('.graph-position'),
			zoom: assets.container.$.find('.graph-zoom')
 		};
		
		exports.properties.view = {
			width: exports.wrapper.$.width,
			height: exports.wrapper.$.height
		};
		
		graph.focus.x = exports.properties.view.width/2;
		graph.focus.y = exports.properties.view.width/2;
		
		assets.scaleRing = app.body.$.find('.scale-ring');
		
		exports.setTimeline( exports.config.timeline.startTime, exports.config.timeline.endTime );
		
		scaleListener();
		
	};
	
	exports.values = null;
	exports.value = {};
	exports.display = {};
	
	exports.alignView = function(){
		
		

		css.use('graph-updates');
		css.clear();
		var updateProps = {};
		
		
		var valueMap = exports.timeline.dates.map(function( date ){
			var el = exports.wrapper.$.find('div[data-key="'+date.key+'"]');
			var plot = el.$.find('.plot');
			var key = el.$.attr('data-key');
			return { offset: $(plot).offset(), el: el, plot: plot, key: key };
		});
		
		var lastPlotAngle;
		var lastValue;
		var lastDistance;
		var valueCount = valueMap.length;
		for(var i=0;i<valueCount;i++){
			var plot = valueMap[i].plot;
			var key = valueMap[i].key;
			var value;
			if( exports.data[key] ) value = exports.data[key];
			
			var angle = 0;
			if(valueMap[i+1]){
				var a = valueMap[i].offset.top - valueMap[i+1].offset.top;
				var b = valueMap[i].offset.left - valueMap[i+1].offset.left;
				var distance = Math.sqrt( a*a + b*b );
				lastDistance = distance;
				var rad = Math.atan2(a, b);
				angle = (rad * 180 / Math.PI)-180;
			}
			/*
			updateProps['div[data-key="'+key+'"] .pre'] = i > 0 ? {
				transform: 'translateY(-50%) rotate('+(lastPlotAngle-180)+'deg)',
				width: lastDistance+'px'
			} : { display: 'none' };
			*/
			updateProps['div[data-key="'+key+'"] .line'] = i < valueCount-1 ? {
				transform: 'translateY(-50%) rotate('+angle+'deg)',
				width: distance+'px'
			} : { display: 'none' };
			
	
			
			lastPlotAngle = angle;
			
		}
		css.append( updateProps );

	};
	
	exports.populate = function( data ){
		
		exports.data = data;
	

		exports.values = Object.keys( exports.data ).map(function( k ){
			return exports.data[k];
		});
		
		exports.value = {};
		exports.display = {};
		
		exports.value.max = Math.max.apply(null, exports.values );
		exports.value.min = Math.min.apply(null, exports.values );
		exports.value.diff = Math.abs( exports.value.max - exports.value.min );
		
		var padding = exports.value.diff/10;
		var steps = Array.prototype.slice.call(exports.steps);
		var step;
		while(steps.length > 0){
			step = steps.shift();
			var occ = exports.value.diff/step;
			if(occ < 10){
				break;
			}
		}
		
		var label = 0;
		var label_count = 0;
		var labels = [];
		while(label < ( exports.value.max+(step*2))){
			label += step;
			labels.push(label);
			label_count++;
		}
		
		console.log(labels);
		exports.display.max = Math.max.apply(null, labels );
		exports.display.min = Math.min.apply(null, labels );
		exports.display.span = Math.abs( exports.display.max - exports.display.min );
		
		var itemWidth = (100/exports.timeline.dates.length);
		
		css.append({
			'.graph-wrapper > div, #x-ledgend > div': {
				width: itemWidth+'%',
			}
		});
		
		var plotStyles = {};
		var plots = [];
		var lastY;
		for(var i=0;i<exports.timeline.dates.length;i++){
			
			var key = exports.timeline.dates[i].key;
			var plot = exports.wrapper.$.find('div[data-key="'+key+'"]');
			var value = exports.data[key];
			
			var y = 0;
			var v = null;
			
			if( exports.data[key] ){
				y = ( value / exports.display.max )*100;
				v = value ? utils.format.money(value) : value;
				plot.$.attr('data-value', v);
	 			exports.view.plots.push(plot);
			}else{
				y = lastY;
			}
			
			lastY = y;
			
			plotStyles['.graph-wrapper > div:nth-child('+(i+1)+') .value'] = {
				height: (y)+'%'
			};
			
			plotStyles['.graph-wrapper > div:nth-child('+(i+1)+'), #x-ledgend > div:nth-child('+(i+1)+')'] = {
				left: (itemWidth*i)+'%'
			};
			
		}
		
		css.append( plotStyles );
		
		assets.keysY = assets.ledgend.y.$.findAll('div');
		
		var i=1;
		
		
		
		assets.keysY.$.each(function(){
			var keyVal = exports.display.max/i;
			this.innerHTML = '<span>'+Math.floor(keyVal)+'</span>';
			i++;
		});
		
		exports.alignView();
		
		return false;
	};
	
	window.onresize = function(){
		exports.properties.view.width = exports.wrapper.$.width;
		exports.properties.view.height = exports.wrapper.$.height;
		exports.alignView();
	};
	
	window.addEventListener("orientationchange", function() {
		exports.properties.view.width = exports.wrapper.$.width;
		exports.properties.view.height = exports.wrapper.$.height;
	    exports.alignView();
	});
	
	return exports;
	
});
