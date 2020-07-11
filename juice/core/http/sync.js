define('http/sync',[], function(  ){
	
	var exports = this.exports;
	var app = this.app;
	
	exports.url = null;
	exports.hd = true;
	exports.latency = null;
	exports.offset = 0;
	exports.SAMPLE_SIZE = 8;
	exports.syncPoint = 0.5;
	exports.accuracy = null;
	
	var SyncTest = function( url ){
		exports.events.extend( this );
		this.url = url+'?index='+Date.now();
		this.type = 'jsonp';
		this.marks = {};
		this.startTime = 0;
		this.serverTime = null;
		this.setup();
	};
	
	SyncTest.prototype.mark = function( key, time){
		if(!time) time = Date.now();
		this.marks[key] = time - this.startTime;
		if( key == 'start' ){
			this.startTime = time;
		}
		return false;
	};
	
	SyncTest.prototype.setup = function(){
		
		var self = this;
		
		switch(this.type){
			case 'jsonp':
			
				var script = document.createElement('script');
				app.body.appendChild( script );
				
				script.onload = function(){
					self.mark('complete');
					app.body.removeChild( script );
					self.finish();
				};
				
				window.sync_callback = function( server_time ){
					self.mark('response');
					self.serverTime = server_time;
					window.sync_callback = null;
				};
				
				self.script = script;
				
			break;
		}
		
		return false;
	};
	
	SyncTest.prototype.getHdTiming = function( url ){		
		var resourceList = window.performance.getEntriesByType("resource");
		for (i = 0; i < resourceList.length; i++){
			var name = decodeURIComponent(resourceList[i].name);
            if ( name.indexOf(url) !== -1 ){
            	var resource = resourceList[i];
              	return resource;
               	break;
            }
       }
       return null;
	};
	
	SyncTest.prototype.finish = function(){
		var self = this;
		if(exports.hd) self.hd = self.getHdTiming( self.url );
		
		var results = {};
		//Server Responce Time
		results.serverTime = self.serverTime;
		results.start = self.marks.start;
		results.end = self.marks.start + self.marks.response;
		
		if(self.hd){
			//results.hd = self.hd;
 			var connectionTime = self.hd.requestStart - self.hd.fetchStart;
 			results.start += connectionTime;
			results.end = results.start + ( self.hd.responseStart - self.hd.requestStart );
			results.total = results.end - results.start;
		}
		
		results.estimate = results.start + ( results.total * exports.syncPoint );
		results.offset = ( self.serverTime - results.estimate );
		//results.timePosition = ( (results.end - results.serverTime ))/results.total;
		self.emit('complete', results );
	};
	
	SyncTest.prototype.start = function(){
		var self = this;	
		switch( self.type ){
			case 'jsonp':
				self.script.src = self.url;
				self.mark('start');
			break;
		}
		return false;
	};
		
	if( !window.performance ){
		exports.hd = false;
	}
	
	var reqIndex = 0;

	exports.start = function( ){
		
		var requests = [];
		reqIndex = 0;
		exports.offset = null;
		tzOffset = new Date().getTimezoneOffset()*60000;
		var fastest = 999999;
		var result = null;
		
		if(exports.hd) window.performance.clearResourceTimings();
		
		var processSync =  function(){
			var times = requests.map(function( r ){
				return r.total;
			});
			
			var fastest = Math.min.apply(null, times );
			exports.accuracy = fastest/2;
			var request = requests[times.indexOf(fastest)];
			exports.offset = request.offset;
			//console.log('Sync Offset:: '+exports.offset );
			exports.emit('offset', exports.offset, exports.accuracy);
			return false;
		};
		
		var initRequest = function(){
			
			var syncTest = new SyncTest( exports.url );
			syncTest.on('complete', function( results ){
				///console.log('Sync Test Complete');
				//console.log(results);
				requests.push(results);
				if( requests.length < exports.SAMPLE_SIZE ){
					initRequest();
				}else{
					processSync();
					
				}
			});
			syncTest.start();
		};
		initRequest();
	};
	
		
	return exports;
	
}, { extend: 'events' });
