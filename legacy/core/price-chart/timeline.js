define('price-chart/timeline', ['utils'], function PriceChart( utils ){

    var exports = this.exports;
    var chart = this.parent;

    var TIME = {};
    TIME.second = 1000;
    TIME.minute = 1000*60;
    TIME.hour = 1000*60*60;
    TIME.day = 1000*60*60*24;
    TIME.week = 1000*60*60*24*7;
    TIME.month = TIME.day*30;
    TIME.year = TIME.day*365;

    exports.defined = {};
    exports.view = null;
    exports.lastRender = {};
    exports.markerTimes = null;

    exports.defined.span = TIME.hour*24;

    Object.defineProperty( exports, 'start', {
        get: function(){
            return exports.defined.start || exports.end - exports.span;
        },
        set: function( ms ){
            exports.defined.start = ms;
            delete exports.defined.span;
            if( exports.view )
            exports.markerTicks.reset();
            return false;
        }
    });

    Object.defineProperty( exports, 'end', {
        get: function(){
            return exports.defined.end || Date.now();
        },
        set: function( ms ){
            exports.defined.end = ms;
            delete exports.defined.span;
            if( exports.view )
            exports.markerTicks.reset();
            return false;
        }
    });

    Object.defineProperty( exports, 'span', {
        get: function(){
            return exports.defined.span || exports.end - exports.start;
        },
        set: function( ms ){
            exports.defined.span = ms;
            delete exports.defined.start;
            if( exports.view )
            exports.markerTicks.reset();
            return false;
        }
    });

    Object.defineProperty( exports, 'head', {
        get: function(){
            return exports.defined.end;
        },
        set: function( ms ){
            exports.defined.end = ms;
            return false;
        }
    });

    exports.layers = {};



    exports.ticks = [];

    var rendered = {
        markers: [],
        ticks: []
    };

    exports.markers = {
        primary: { ticks: [] },
        secondary: { ticks: [] },
        rendered: []
    };

    var MarkerTickSet = function( id, options ){
        var self = this;
        options = options || {};
        self.id = id;
        self.span = TIME[id];
        self.options = options;
        self.skip = 0;
        self.last = self.findTick( exports.start );
        self.width = options.width || 1;
        self.height = options.height || exports.view.stage.height/3;
    };

    MarkerTickSet.prototype.findTick = function( time ){
        var self = this;
        var t = self.span*( self.skip+1 );
        return Math.floor( time/t )*t;
    };

    MarkerTickSet.prototype.setSkip = function( primaryGap ){
        var self = this;
        self.skip = 0;
        var gapPix = exports.view.stage.plotX( exports.start + primaryGap );
        var count = primaryGap/self.span;
        var maxCount = count;
        var countEven = false;
        while( count > gapPix/4 || countEven !== 0 ){
            self.skip++;
            count = primaryGap/( self.span * ( self.skip+1 ) );
            countEven = Math.ceil( maxCount-count ) % 2;
        }
        return false;
    };

    MarkerTickSet.prototype.label = function( time ){

        var self = this;

        var paddNumber = function( n ){
            return n.toString().length < 2 ? "0"+n : n;
        };
        
        var label = '';
        var date = new Date( time );
        
        switch( self.id ){
            case 'day':
            label = date.getMonth()+'/'+date.getDate()+' '+ date.getHours()+':'+date.getHours();
            break;
            case 'hour':
            label = date.getHours()+':'+paddNumber( date.getMinutes() );
            break;
            case 'minute':
            label = paddNumber( date.getMinutes() );
            break;
        }

        return label;
    };

    MarkerTickSet.prototype.next = function( update ){
        var self = this;
        var n = self.last+( self.span * (self.skip+1) );
        if( update ) self.last = n;
        return n;
    };

    var MarkerTicks = function(){
        var self = this;
        this.last = null;
        this.time = null;
        this.width = 1;
        this.heightPercent = 0.5;
        this.hasLabels = false;
        this.color = '#000000';
        this.skip = 0;
        self.markers = {};
        self.labels = [];
        self.initialize();
    };

    MarkerTicks.prototype.label = function( x, txt ){
        var self = this;
        var lh = exports.view.stage.height/2;
        var labelW = document.createElement('div');
        labelW.innerText = txt;
        labelW.style.position = 'absolute';
        labelW.style.bottom = 0;
        labelW.style.left = x+'px';
        
        labelW.style.transform = 'translateX(-50%)';
        labelW.style.fontSize = (lh*0.8)+'px';
        labelW.style.lineHeight = lh+'px';
        labelW.style.height = lh+'px';
        self.labels.push( labelW );
        exports.layers.labels.appendChild(labelW);
    };

    MarkerTicks.prototype.shift = function( time ){
        var self = this;
        var layer = exports.layers.markers;
        var shiftX =exports.view.stage.plotX( exports.start + time );
        var imageData = layer.ctx.getImageData( shiftX, 0, exports.view.stage.width-shiftX, exports.view.stage.height );
        layer.ctx.putImageData( imageData, 0, 0);
        layer.ctx.clearRect( exports.view.stage.width-shiftX, 0, shiftX, exports.view.stage.height );
        for( var i=0;i<self.labels.length;i++ ){
            var l = self.labels[i];
            var left = Number( l.style.left.replace('px', '') );
            left -= shiftX;
            l.style.left = left+'px';
            if( left < 0 ){
                console.log( l );
                self.labels.shift();
                i-=1;
                exports.layers.labels.removeChild( l );
                continue;
            }
        }
        return false;
    };

    MarkerTicks.prototype.update = function(){
        var self = this;
        var layer = exports.layers.markers;
        
        //self.findSkip();
        layer.ctx.fillStyle = self.color;
        //console.log( 'skip', self.skip );
        if( self.lastRender ){
            var diff = exports.start - self.lastRender;
            self.shift( diff );
        }

        var markerTypes = ['primary','secondary'];
        if(!self.nextTimes)
        self.nextTimes = [ self.markers.primary.next( true ), self.markers.secondary.next( true ) ];

        var time, primaryGap;
        primaryGap = self.markers.primary.span;
        self.markers.secondary.setSkip( primaryGap );

        var setMinTime = function(){
            time = Math.min.apply( null, self.nextTimes );
            return true;
        };
        //console.log( exports.end, self.nextTimes);
        while( setMinTime() && time < exports.end ){
            var tidx = self.nextTimes.indexOf( time );
            var mtype = markerTypes[tidx];
            var marker = self.markers[mtype];

            if( mtype == 'primary' ){
                primaryGap = marker.next() - self.nextTimes[tidx];
                self.markers.secondary.setSkip( primaryGap );
            }
            
            if( self.nextTimes[0] == self.nextTimes[1] ) self.nextTimes[1] = self.markers.secondary.next( true ); 
            var x = exports.view.stage.plotX( time );
            //console.log( 'render', x );
            var w = marker.width;
            layer.ctx.fillRect( x-(w/2), 0, w, marker.height );

            if( x + (w/2) > exports.view.stage.width ){

            }
            
            if( marker.options.label ){
                var ltxt = marker.label( time );
                self.label( x, ltxt );
            }

            self.nextTimes[tidx] = marker.next( true );
        }

        self.lastRender = exports.start;

        return false;
    };

    MarkerTicks.prototype.reset = function(){
        var self = this;
        if( !exports.view ) return false;
        var layer = exports.layers.markers;
        self.nextTimes = null;
        self.labels = [];
        layer.ctx.clearRect( 0, 0,  exports.view.stage.width,  exports.view.stage.height );
        exports.layers.labels.innerHTML = '';
        var times = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
        while( exports.span/TIME[times[0]] < 2 ) times.shift();
        self.times = times;
        exports.markerTimes = times;
        var MAX_TICKS = exports.view.stage.width/4;
        while( exports.span/TIME[times[times.length-1]] > MAX_TICKS && times.length > 2 ) times.pop(); 
        //console.log(self.times);
        self.markers.primary = new MarkerTickSet( self.times[0], { label: true, width: 1, height: exports.view.stage.height/2 });
        self.markers.secondary = new MarkerTickSet( self.times[1], { width: 0.5, height: exports.view.stage.height/4 });
        exports.view.stage.minX = exports.start;
        exports.view.stage.maxX = exports.end;
        exports.render();

    };

    MarkerTicks.prototype.initialize = function(){
        var self = this;
        self.reset();
    };

    exports.markerTicks = new MarkerTicks();


    exports.render = function(){
        //console.log('Timeline Render', exports.span/(1000*60) );
       // exports.view.stage.padding.right = 20;
        exports.view.stage.minX = exports.start;
        exports.view.stage.maxX = exports.end;
        exports.markerTicks.update();
        chart.debug.view.set('timeline', {
            start: utils.date.toShortStr( new Date( exports.start ), true ),
            end: utils.date.toShortStr( new Date( exports.end ), true ),
            span: utils.date.toSmall( exports.span )
        });
    };

    exports.setup = function( wrapper ){
        exports.view = chart.views.add('timeline');
        exports.layers.markers = exports.view.stage.layer('marks');
        var labels = document.createElement('div');
        exports.view.stage.wrapper.appendChild( labels );
        exports.layers.labels = labels;
        exports.markerTicks.reset();
    };

    return exports;

});