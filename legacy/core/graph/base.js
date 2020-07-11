define('graph', ['events', 'utils', 'dom/css', 'animation/easing', 'animation/timeline', 'animation/properties', 'utils/date'], function( events, utils, css, easing, timeline, properties, dateUtil ){
	
	var exports = this.exports;
	var app = this.app;
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
	

	if(!app.body) app.body = document.querySelector('body');
	
	var graph = { scale: 1 };
	graph.focus = { px: .5, py: .5 };
	graph.offset = null;
	graph.plots = [];
	graph.moveX = 0;
	graph.moveY = 0;
	graph.constraint = {};
	graph.moved = { x: 0, y: 0 };

	graph.strechX = 1;
	graph.strechY = 1;
	
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
	exports.gesture = null;
	
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
				month_long: dateUtil.months[cd.getMonth()],
				month_short: dateUtil.months_short[cd.getMonth()],
				day: cd.getDate(),
				key: dateUtil.toShortStr(cd)
			};
			
			var key = dateDetails.key;
			exports.timeline.dates.push(dateDetails);
			
			if( months[dateDetails.month] ){
				months[dateDetails.month] += 1;
			}else{
				months[dateDetails.month] = 1;
				var month_label = document.createElement('div');
				month_label.setAttribute( 'data-month-id', dateDetails.month );
				month_label.innerHTML = dateUtil.months[dateDetails.month];
				graph.timeline.months.$.append( month_label );
			} 
			
			var dateStr = ['<span class="year" >'+cd.getFullYear()+'</span>', '<span class="month" data-month-long="'+dateDetails.month_long+'" data-month-short="'+dateDetails.month_short+'" >'+(cd.getMonth()+1)+'</span>', '<span class="day" >'+cd.getDate()+'</span>'].join('');
			graph.timeline.days.$.append('<div><div class="label" data-numeric="'+dateDetails.day+'" data-key="'+dateDetails.key+'" data-index="'+index+'" ></div></div>');
			index++;
		}
		
	};
	
	graph.scale = 1;
	exports.animating = [];
	exports.interacting = false;
	
	var ScaleIndicator = function( t, canvas, context ){
		
		this.started = false;
		this.time = 0;
		this.focus = {};
		this.canvas = canvas;
		this.context = context;
		this.scale = graph.scale;
		app.body.$.class('scaling', true);
		graph.animating.push('scaling');
		
		this.start = {
			time: t,
			scale: graph.scale
		};
	};
	
	ScaleIndicator.prototype.update = function( t ){
		var self = this;
		self.time = ( t - self.start.time )/1000;
		var change = self.diamiter - self.start.diamiter;
		if(change == 0 ) change = 0.0001;
		var scaled = change/self.start.diamiter * self.start.scale;
		graph.scale = Math.min( exports.display.maxScale, Math.max( 1, scaled + self.start.scale ));
	
		
	};
	
	ScaleIndicator.prototype.draw = function(){
		var self = this;
		var tcontext = this.context;
		var time = this.time;
		var progress = 1;
		if( time < 0.3 ) progress = time/0.3;
		var radOff = 90 * Math.PI/180;
		//assets.debug.short.innerHTML = time;
		
		//Scale Inner Fill
	     //tcontext.globalAlpha = 0.4;
	     /*
 		tcontext.beginPath();
		tcontext.arc( self.touchCenter.x, self.touchCenter.y , self.diamiter/2, 0, 2 * Math.PI, false);
		//tcontext.fillStyle = '#FFFFFF';
		//tcontext.fill();
		tcontext.strokeStyle = '#81c6f2';
		tcontext.lineWidth = 4;
		tcontext.stroke();
		tcontext.closePath();
 		*/
 		tcontext.globalAlpha = 0.4;
 		tcontext.beginPath();
		tcontext.arc( self.touchCenter.x, self.touchCenter.y, progress * ( self.diamiter/2 ), 0, Math.PI*2, false);
		tcontext.fillStyle = '#FFFFFF';
		tcontext.fill();
		tcontext.closePath();
 		tcontext.globalAlpha = 1;
 		
		var lineSpeed = self.time*40;
		tcontext.strokeStyle = '#81c6f2';
		tcontext.setLineDash([0,15]);
		tcontext.lineCap = 'round';
		tcontext.lineWidth = 5;
		
		tcontext.beginPath();
		tcontext.moveTo( self.focus.x, self.focus.y );
		tcontext.lineTo( self.touch1.x, self.touch1.y );
		tcontext.lineDashOffset = -lineSpeed;
		tcontext.stroke();
		
		tcontext.beginPath();
		tcontext.moveTo( self.focus.x, self.focus.y );
		tcontext.lineTo( self.touch2.x, self.touch2.y );
		tcontext.lineDashOffset = -lineSpeed;
  		tcontext.stroke();
  		tcontext.setLineDash(null);
  		
  		var scaleDisplay = 0.25 + ((graph.scale/exports.display.maxScale)*0.75);
		assets.scaleIndicator.setAttribute('data-scale', Math.floor( scaleDisplay.toFixed(2)*100 )+'%' );
  		
  		//Scale Value Point
		tcontext.beginPath();
		tcontext.arc( self.focus.x, self.focus.y, 20, -radOff, ((2 * Math.PI)*(progress*scaleDisplay))-radOff, false);
		tcontext.strokeStyle = '#2297e2';
		tcontext.lineWidth = 20;
		tcontext.lineCap = 'butt';
 		tcontext.stroke();
  		
  		//Scale Center Point
		tcontext.beginPath();
		tcontext.arc( self.focus.x, self.focus.y, 10, 0, 2 * Math.PI, false);
		tcontext.fillStyle = '#666666';
		tcontext.closePath();
 		tcontext.fill();
 		
 		
 		//Radians to Top
 		
 		
		var radian1 = Math.atan2( self.touchCenter.x - this.touchTop.x, self.touchCenter.y - this.touchTop.y );	
		var radian2 = Math.atan2( self.touchCenter.x - this.touchBottom.x, self.touchCenter.y - self.touchBottom.y );
		var PI = Math.PI;
		
		if(radian2 > 0 ){
			radian2 =  (PI + (PI - radian2))*-1;
		} 
		
		var angle1 = ((radian1) * 180 / Math.PI)-180;	
		var angle2 = ((radian2) * 180 / Math.PI)-180;
				
		//Scale Inner Stroke
		var borderComplete = Math.abs( radian1 - radian2 ) * progress;
		var borderStart = -radian2;
		var borderEnd = borderStart+borderComplete;
				
				
 		tcontext.beginPath();
		tcontext.arc( self.touchCenter.x, self.touchCenter.y, self.diamiter/2, borderStart-radOff, borderEnd-radOff, false);
		tcontext.strokeStyle = '#2297e2';
		tcontext.lineWidth = 4;
		tcontext.stroke();
		tcontext.closePath();
		
		var border2Complete = Math.abs(radian1 - radian2)*progress;
		var border2Start = -radian1;
		var border2End = border2Start+(borderComplete);

		
		tcontext.beginPath();
		tcontext.arc( self.touchCenter.x, self.touchCenter.y, self.diamiter/2, border2Start-radOff, border2End-radOff, false);
		tcontext.strokeStyle = '#2297e2';
		tcontext.lineWidth = 4;
		tcontext.stroke();
		tcontext.closePath();
		
		
		
		
				
 		
		
	};
	
	ScaleIndicator.prototype.init = function(){
		this.focus.x = this.touchCenter.x;
		this.focus.y = this.touchCenter.y;
		assets.touchIndicator.style.left = this.touchCenter.x+'px';
		assets.touchIndicator.style.top = this.touchCenter.y+'px';
		this.start.diamiter = this.diamiter;
		this.started = true;
	};
	
	ScaleIndicator.prototype.remove = function(){
		app.body.$.class('scaling', false);
		graph.animating.splice(graph.animating.indexOf('scaling'), 1);

	};
	
	ScaleIndicator.prototype.touchPoints = function( p1, p2 ){
		
		var self = this;
		this.touch1 = p1;
		this.touch2 = p2;
		
		this.touchTop = p1.y < p2.y ? p1 : p2;
		this.touchBottom =  p1.y < p2.y ? p2 : p1;
	
		this.touchCenter = {
			x: (self.touch1.x + self.touch2.x)/2,
			y: (self.touch1.y + self.touch2.y)/2
		};
		
		var dx = p1.x - p2.x;
		var dy = p1.y - p2.y;
		this.diamiter = Math.sqrt( dx*dx + dy*dy );
		if(!this.started) this.init();
		
		return false;
	};
	
	var MoveIndicator = function( t, canvas, context ){
		this.started = false;
		this.time = 0;
		this.canvas = canvas;
		this.context = context;
		this.moved = {};
		app.body.$.class('moving', true);
		
		this.touch = null;
		this.start = {
			time: t,
			scale: graph.scale,
			x: null,
			y: null
		};
	};
	
	MoveIndicator.prototype.init = function( point ){
		var self = this;
		self.point = point;

		graph.constraint.minMoveX = graph.constraint.minX - graph.offset.x;
		graph.constraint.minMoveY = graph.constraint.minY - graph.offset.y;
		graph.constraint.maxMoveX = -graph.offset.x;
		graph.constraint.maxMoveY = -graph.offset.y;
		graph.moved = { x: 0, y: 0 };
		point.on('change', function(){
			self.update();
			return false;
		});
		self.update();
		graph.animating.push('moving');
		exports.draw();

	};
	
	MoveIndicator.prototype.update = function( t ){
		var self = this;
		self.moved.x = Math.min( Math.max( graph.constraint.minMoveX, self.point.changeX ), graph.constraint.maxMoveX );
		self.moved.y = Math.min( Math.max( graph.constraint.minMoveY, self.point.changeY ), graph.constraint.maxMoveY );
		graph.moved = self.moved;
	};

	MoveIndicator.prototype.remove = function(){
		graph.animating.splice(graph.animating.indexOf('moving'), 1);
		app.body.$.class('moving', false);
		graph.offset.x += graph.moved.x;
		graph.offset.y += graph.moved.y;
		graph.focus.screenX += graph.moved.x;
		graph.focus.screenY += graph.moved.y;
		graph.moved = { x: 0, y: 0 };
	};
	
	var setupGestureListener =  function(){
		
		var tcanvas = assets.touchGestureCanvas;
		var tcontext = tcanvas.getContext("2d");
		var drawing = false;
		var touchPoints = [], gesture; 
		var time = 0;
		var scaleIndicator, scaleCenter, startDist, startScale;
		var moving = false, moveStart, moveIndicator;
		exports.touch = new touchListener();
		
		var drawGesture = function( t ){

			tcontext.clearRect(0, 0, tcanvas.width, tcanvas.height );
			var points = gesture.points();
			touchPoints = Object.keys(points);
			
			
			if(touchPoints.length == 1){

				var point = points[touchPoints[0]];
				if(!moveIndicator && !scaleIndicator){
					moveIndicator = new MoveIndicator( t, tcanvas, tcontext );
					moveIndicator.init(point);
					moveStart = { x: point.x, y: point.y };
				}
				
				var x = moveStart.x + moved.changeX;
				var y = moveStart.y + moved.changeY;
				tcontext.beginPath();
				tcontext.arc( x, y , 50, 0, 2 * Math.PI, false);
				//tcontext.fillStyle = '#FFFFFF';
				//tcontext.fill();
				tcontext.strokeStyle = '#81c6f2';
				tcontext.lineWidth = 4;
				tcontext.stroke();
				tcontext.closePath();
				
			}else if(touchPoints.length == 2){				
				
				var point1 = points[touchPoints[0]];
				var point2 = points[touchPoints[1]];
								
				var dx = point1.x - point2.x;
				var dy = point1.y - point2.y;
				var dist = Math.sqrt( dx*dx + dy*dy );
				var rad = Math.atan2(dx, dy);
				angle = (rad * 180 / Math.PI)-180;

				var screenX = (point1.x + point2.x)/2;
				var screenY = (point1.y + point2.y)/2;
				
				if(!scaleCenter){
					
					startScale = graph.scale;
					startDist = dist;
					scaleCenter = { x: screenX, y: screenY };
					graph.width = ( tcanvas.width * graph.strechX ) * graph.scale;
					graph.height = ( tcanvas.height * graph.strechY ) * graph.scale;
					graph.focus.screenX = scaleCenter.x;
					graph.focus.screenY = scaleCenter.y;
					graph.focus.x = ( graph.focus.screenX - graph.offset.x );
					graph.focus.y = ( graph.focus.screenY - graph.offset.y );
					graph.focus.px = graph.focus.x/graph.width;
					graph.focus.py = graph.focus.y/graph.height;
					graph.offset.x = graph.focus.screenX - (graph.focus.px * graph.width);
					graph.offset.y = graph.focus.screenY - (graph.focus.py * graph.height);
					scaleIndicator = new ScaleIndicator( t, tcanvas, tcontext );
					exports.draw();
				}
				
				scaleIndicator.touchPoints(point1, point2);
				scaleIndicator.update( t );
				scaleIndicator.draw();
		
				
			}

			/*
			
			for(var i=0;i<touchPoints.length;i++){
				var point = points[touchPoints[i]];
			
				
				tcontext.beginPath();
				tcontext.arc( point.x, point.y, w, 0, (2 * Math.PI), false);
				tcontext.stroke();
				
				tcontext.beginPath();
				tcontext.arc( point.x, point.y, w, -45, ((point.progress * 2) * Math.PI)-45, false);
				tcontext.setLineDash(null);
				tcontext.strokeStyle = '#146599';
				tcontext.lineWidth = 10;
	      		tcontext.stroke();

			}
			*/
			
			if(drawing) window.requestAnimationFrame( drawGesture );
		};
		
		var onTouchPointCreated = function( touchpoint ){
			
			touchPoints.push( touchpoint );
			/*
			touchpoint.on('change', function( x, y ){
				//assets.debug.short.innerHTML = x+' :: '+y;
		
			});
			
			touchpoint.on('end', function( x, y ){
				//assets.debug.short.innerHTML = x+' :: '+y;
			
			});
			*/
		};
		
		
		exports.touch.on('gesture.change', function( gesture ){
			//assets.debug.long.innerHTML = 'gesture.change';
		});
		
		exports.touch.on('gesture.start', function( _gesture ){
			drawing = true;
			//assets.debug.long.innerHTML = 'gesture.start';
			gesture = _gesture;
			gesture.on('point.start', onTouchPointCreated );
			drawGesture();
			return false;
		});
		
		exports.touch.on('gesture.end', function( gesture ){
			drawing = false;
			scaleCenter = null;
			startDist = null;
			startScale = null;
			
			if(moveStart){
				moving = null;
				moveStart = null;
			}
			
			if(moveIndicator){
				moveIndicator.remove();
				moveIndicator = null;
			}
			
			if(scaleIndicator){
				scaleIndicator.remove();
				scaleIndicator = null;
			}
			
			//assets.debug.long.innerHTML = 'gesture.end';
			
		});	
		
	};
	

	function touchListener( el, cb ){
		var listener = this;
		events._extend(this);
		var tcanvas = assets.touchGestureCanvas;
		var tcontext = tcanvas.getContext("2d");
		
		var _touches = {};
		var gesture = null;
		
		var TouchGesture = function(touches){
			events._extend(this);
			this.contacts = [];
			this.startTime = new Date().getTime();
		};
		TouchGesture.prototype.points = function( e ){
			return _touches;
		};
		TouchGesture.prototype.time = function( touchEvent ){
			return ( new Date().getTime() - this.startTime )/1000;
		};

	
		var TouchGestureContact = function( touchEvent ){
			events._extend(this);
			this.x = null;
			this.y = null;
			this.startX = touchEvent.clientX;
			this.startY = touchEvent.clientY;
			this.startTime = new Date().getTime();
			this.setEvent( touchEvent );
		};
		
		TouchGestureContact.prototype.setEvent = function( e ){
			this.x = e.clientX;
			this.y = e.clientY;
			this.changeX = this.x - this.startX;
			this.changeY = this.y - this.startY;
			this.emit('change', this.x, this.y );
		};
		
		TouchGestureContact.prototype.time = function( touchEvent ){
			return ( new Date().getTime() - this.startTime )/1000;
		};

		
		TouchGestureContact.prototype.end = function( touchEvent ){
			this.setEvent( touchEvent );
			this.emit('end', this.x, this.y );
		};
		
		app.body.$.on('touchstart', function( e ){
			
			if(Object.keys(_touches).length == 0){
				gesture = new TouchGesture();
				listener.emit('gesture.start', gesture);
			}
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				_touches[id] = new TouchGestureContact(e.changedTouches[i]);
				gesture.emit( 'point.start', _touches[id] );
			}		

			return false;
		});
		
		app.body.$.on('touchend', function( e ){
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				_touches[id].end(e.changedTouches[i]);
				delete _touches[id];
			}
			
			if(Object.keys(_touches).length == 0){
				listener.emit('gesture.end', gesture);
				gesture = null;
			}

			return false;
		});
		
		app.body.$.on('touchmove', function(e){
			
			for(var i=0;i<e.changedTouches.length;i++){
				var id = e.changedTouches[i].identifier;
				_touches[id].setEvent( e.changedTouches[i] );
			}
			
			return false;
		});
		
		app.body.$.on('touchcancel', function(e){
			return false;
		});
		
	}
	
	exports.values = null;
	exports.value = {};
	exports.display = {};
	
	exports.draw = function( ){
		
		//if(graph.animating.length == 0) return false;
		assets.context.clearRect(0, 0, (assets.canvas.width), ( assets.canvas.height ));
		
		graph.width = ( assets.canvas.width * graph.strechX ) * graph.scale;
		graph.height = ( assets.canvas.height * graph.strechY ) * graph.scale;
		//alert(graph.width +'  '+assets.canvas.width);
		graph.constraint.maxX = 0;
		graph.constraint.maxY = 0;
		graph.constraint.minX = assets.canvas.width - graph.width;
		graph.constraint.minY = assets.canvas.height - graph.height;
		
		if(graph.offset == null){
			graph.offset = {
				x: graph.constraint.minX,
				y: graph.constraint.minY
			};
		}
		
		if(graph.animating.indexOf('scaling') !== -1 ){
			graph.offset.x = Math.max( Math.min( graph.focus.screenX - (graph.focus.px * graph.width), 0), graph.constraint.minX );
			graph.offset.y = Math.max( Math.min( graph.focus.screenY - (graph.focus.py * graph.height), 0), graph.constraint.minY );
		}

		if(graph.animating.indexOf('moving') !== -1 ){
			
			
		}
				
		var segWidth = graph.width * ( graph.itemWidth * (graph.ledgendSkip+1));

		assets.ledgend.x.style.width = graph.width+'px';
		assets.ledgend.x.style.transform = 'translate3d('+( graph.offset.x + graph.moved.x )+'px, 0, 0)';
			
		//Process Plot Position Offsets
		var plots = [];
		for(var i=0;i<graph.plots.length;i++){
			var plotParams = { 
				x: ( graph.plots[i].x*graph.width ) + graph.offset.x + graph.moved.x, 
				xMid: ( graph.plots[i].mid*graph.width ) + graph.offset.x + graph.moved.x, 
				y: ( graph.plots[i].y*graph.height ) + graph.offset.y + graph.moved.y
			};
			plots.push( plotParams );
		}
		
		//Process Graph Fill
		for(var i=0;i<plots.length;i++){
			var plot = plots[i];
			if(i == 0){
				assets.context.beginPath();
		     	assets.context.moveTo( 0, graph.height );
		     	assets.context.lineTo( 0, plots[0].y );
		     	assets.context.lineTo( plots[0].xMid, plots[0].y );
			}
			if(plots[i+1]){
				assets.context.lineTo(plots[i+1].xMid, plots[i+1].y );
			}else{
				assets.context.lineTo(graph.width, plots[i].y );
			}
      		if(i == plots.length-1){
      			assets.context.lineTo(graph.width, graph.height);
      			assets.context.lineTo(0, graph.height);
      			assets.context.fillStyle = '#afd7f0';
		     	assets.context.fill();
      			assets.context.closePath();
      		}
     	}
     	
		
		
		//Trend Line
		for(var i=0;i<plots.length;i++){
			var plot = plots[i];
			if(i == 0){
				assets.context.beginPath();
				assets.context.moveTo(plot.xMid, plot.y);
			}
			if(plots[i+1]){
				assets.context.lineTo(plots[i+1].xMid, plots[i+1].y );
			}
			if(i == plots.length-1){
				assets.context.strokeStyle = '#2297e2';
				var dia = Math.min( segWidth/5, 15 );
				assets.context.lineWidth = dia;
		      	assets.context.stroke();
		     	assets.context.closePath();
			}
     	}
     	
     	//Plot Circles
		for(var i=0;i<plots.length;i++){
			var plot = plots[i];
			var dia = Math.min( segWidth/3, 30 );
			 assets.context.beginPath();
		     assets.context.arc(plot.xMid, plot.y, dia/2, 0, 2 * Math.PI, false);
		     assets.context.fillStyle = '#146599';
		     assets.context.fill();
		}
     	     	
     	var span = (exports.display.max/graph.scale)/graph.yvals.length;
     	var maxInt = exports.display.max - ((-(graph.offset.y+graph.moved.y  )/graph.height)*exports.display.max);
     	
     	for(var i=0;i<graph.yvals.length;i++){
     		graph.yvals[i].innerHTML = '<span>$'+Math.floor( maxInt - (span*i) )+'</span>';
     	}
     	
     	updateLedgend();
		if(graph.animating.length > 0)
			window.requestAnimationFrame( exports.draw );
		
		return false;
	};
	
	exports.populate = function( data ){
		
		exports.data = data;
	

		exports.values = Object.keys( exports.data ).map(function( k ){
			return exports.data[k];
		});
		
		//console.log(exports.values);
		
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
		
		exports.display.max = Math.max.apply(null, labels );
		exports.display.min = Math.min.apply(null, labels );
		exports.display.span = Math.abs( exports.display.max - exports.display.min );
		graph.count = exports.timeline.dates.length;
				
		var itemWidth = (100/exports.timeline.dates.length)/100;
		graph.itemWidth = itemWidth;

		var plotStyles = {};
		var plots = [];
		var lastY;
		var lastMonth = null;
		var monthList = [];
		var totalDayCount = exports.timeline.dates.length;
		
		for(var i=0;i<exports.timeline.dates.length;i++){
			
			var y = 0, v = null;
			var date = exports.timeline.dates[i];
			var key = exports.timeline.dates[i].key;
			var value = exports.data[key];
			//console.log(value);
			if( exports.data[key] ){
				y = 1-( value / exports.display.max );
				v = value ? utils.format.money(value) : value;
			}else{
				y = lastY;
			}
			
			lastY = y;
			
			if(date.month != lastMonth){
				monthList.push({
					month: date.month,
					dayCount: 1
				});
				lastMonth = date.month;
			}else{
				monthList[monthList.length-1].dayCount++;
			}
						
			graph.plots.push({ x: (itemWidth*i), y: y, mid: (itemWidth*i)+(itemWidth/2) });
			
		}
		
		
		
		for( var i=0;i<monthList.length;i++ ){
			var month = monthList[i];
			var selector = '#x-ledgend .months > div:nth-child('+(i+1)+')';
			plotStyles[selector] = {
				width: ((month.dayCount/totalDayCount)*100)+'%'
			};
		}
				
		plotStyles['#x-ledgend .days > div'] = {
			width: (itemWidth*100)+'%'
		};
				
		assets.keysY = assets.ledgend.y.$.findAll('.keys > div');
		
		var i=1;
		assets.keysY.$.each(function(){
			var keyVal = exports.display.max/i;
			this.innerHTML = '<span>'+Math.floor(keyVal)+'</span>';
			i++;
		});
		
		plotStyles['#y-ledgend > .keys > div'] = {
			height: (100/assets.keysY.length)+'%'
		};
		
		css.append( plotStyles );
		
		graph.strechX = Math.max( exports.timeline.dates.length/(assets.canvas.width/20), 1);
		css.use('ledgend-css');
		var ledgendStyles = {};
		ledgendStyles['#x-ledgend .days > div .label'] = {
			width: (graph.ledgendSkip+1)*100+'%'
		};
		
		ledgendStyles['#x-ledgend .days > div:nth-child('+(graph.ledgendSkip+1)+'n ) .label'] = {
			display:'block',
			zIndex: 100
		};
		css.append( ledgendStyles );
		css.use('default');
		
		//assets.debug.long.innerHTML = graph.strechX;
		
		var maxSegSpan = exports.display.max/assets.keysY.length  ;
		var minSegSpan = Math.max( exports.display.max/500, 1);
		exports.display.maxScale = maxSegSpan/minSegSpan;
		exports.draw();
	
		return false;
	};
	
	
	var updateLedgend = function(){
		var ledgendStyles = {};
		css.use('ledgend-css');
		
		var segWidth = graph.width * ( graph.itemWidth * (graph.ledgendSkip+1));
		//console.log('updateLedgend: '+segWidth);
		if(segWidth < 20 ){
			document.getElementById('ledgend-css').innerHTML = '';
			while( segWidth < 20 ){
				graph.ledgendSkip++;
				segWidth = graph.width * ( graph.itemWidth * (graph.ledgendSkip+1));
			}
			
			
			ledgendStyles['#x-ledgend .days > div .label'] = {
				width: (graph.ledgendSkip+1)*100+'%'
			};
			
			ledgendStyles['#x-ledgend .days > div:nth-child('+(graph.ledgendSkip+1)+'n ) .label'] = {
				display:'block',
				zIndex: 100
			};
			css.append( ledgendStyles );
			
		}else if( segWidth > 40 && graph.ledgendSkip > 0 ){
			
			document.getElementById('ledgend-css').innerHTML = '';
			while( segWidth > 40 ){
				graph.ledgendSkip--;
				segWidth = graph.width * ( graph.itemWidth * (graph.ledgendSkip+1));
			}
			ledgendStyles['#x-ledgend .days > div .label'] = {
				width: (graph.ledgendSkip+1)*100+'%'
			};
			
			ledgendStyles['#x-ledgend .days > div:nth-child('+(graph.ledgendSkip+1)+'n ) .label'] = {
				display:'block',
				zIndex: 100
			};
			css.append( ledgendStyles );
		}

		
		css.use('default');
		
	};
	exports.setCanvasTimeline = function(){
		
	};
	
	exports.build = function( data ){
		//console.log('build');
		
		exports.setCanvasTimeline( exports.config.timeline.startTime, exports.config.timeline.endTime );

		assets.close = app.body.$.find('#close');
		/*
		assets.close.$.on('tap', function(){
			//alert('/mobile/close');
			
			return true;
		});
		*/
		assets.ledgend.x = app.body.$.find('#x-ledgend');
		if(assets.ledgend.x){
			graph.timeline = {
				wrapper: assets.ledgend.x,
				months: assets.ledgend.x.$.find('.months'),
				days: assets.ledgend.x.$.find('.days')
			};
		}
		//assets.testBar = assets.ledgend.x.$.find('.bar');
		
		graph.ledgendSkip = 0;
		//assets.ledgend.y = app.body.$.find('#y-ledgend');
		assets.debug = {
			short:  app.body.$.find('#debug-short'),
			long:  app.body.$.find('#debug-long')
		}; 
		//assets.debug.long.innerHTML = 'Start Debug';
		
		assets.container = app.body.$.find( exports.container );
		
		assets.container.$.append('<div class="graph-wrapper"><canvas id="graph-canvas"></canvas></div>');
		
		assets.canvas = assets.container.$.find('canvas');
		assets.context = assets.canvas.getContext("2d");
		
		assets.canvas.width = assets.canvas.$.width;
		assets.canvas.height = assets.canvas.$.height;
		
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
		
		graph.yvals = [];
		graph.yvals[0] = app.body.$.find('#yv-1');
		graph.yvals[1] = app.body.$.find('#yv-2');
		graph.yvals[2] = app.body.$.find('#yv-3');
		graph.yvals[3] = app.body.$.find('#yv-4');
		graph.yvals[4] = app.body.$.find('#yv-5');
		graph.yvals[5] = app.body.$.find('#yv-6');
		graph.yvals[6] = app.body.$.find('#yv-7');
		assets.touchIndicator = app.body.$.find('.touch-indicator');
		
		if(assets.touchIndicator){
			assets.scaleIndicator = app.body.$.find('.touch-indicator .scale');
			assets.scaleIndicator.setAttribute('data-scale', graph.scale.toFixed(2) );
	
			assets.touchGestureCanvas = app.body.$.find('#touch-canvas');
	
			assets.touchGestureCanvas.$.attr( 'height', assets.canvas.height);
			assets.touchGestureCanvas.$.attr( 'width', assets.canvas.width);
		}
		
		exports.setTimeline( exports.config.timeline.startTime, exports.config.timeline.endTime );
		graph.animating = [];
		setupGestureListener();
		
	};
	
	var updateWrapperSize = function(){
		assets.canvas.width = exports.wrapper.$.width;
		assets.canvas.height = exports.wrapper.$.height;
		exports.properties.view.width = exports.wrapper.$.width;
		exports.properties.view.height = exports.wrapper.$.height;
		assets.touchGestureCanvas.height = exports.properties.view.height;
		assets.touchGestureCanvas.width = exports.properties.view.width;
		
		
		
	  	exports.draw();
	};
	
	window.onresize = updateWrapperSize;
	
	window.addEventListener("orientationchange", updateWrapperSize  );
	
	return exports;
	
});
