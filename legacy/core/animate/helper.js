define('animate/helper', ['util/object'], function( objUtil ){

    var { app, exports } = this;

    function diff( start, end ){
        return start - end;
    }

    function angle( dx, dy ){
        return (Math.atan2(dy,dx)/Math.PI * 180)-180;
    }


    function AnimationTime( duration ){
        var self = this;
        self.start = 0;
        self.end = duration;
        Object.defineProperty( this, 'percent', {
            get: () => { self.current/duration },
            set: () => { return false; }
        });
    }

    AnimationTime.prototype.set = function( time ){
        this.current = time || Date.now();
    }

    exports.Time = AnimationTime;


    function AnimationObject( object, target ){
        this.object = object;
        this.target = target;
        this.start = objUtil.extract( object, Object.keys( target ) );
        this.percent = 0;
     }
 
     AnimationObject.prototype.progress = function( percent ){
        this.percent = percent;
        for( var prop in this.target ){
            var diff = this.start[prop] - this.target[prop];
            this.object[prop] = this.start[prop] + ( diff * percent );
        }
     }

     exports.Object = AnimationObject;

     function AnimationValue( start, end ){
        this.start = start;
        this.end = end;
        this.current = start;
        this.diff = start - end;
        this.percent = 0;
     }

     AnimationValue.prototype.progress = function( percent ){
        this.percent = percent;
        this.current = this.start + ( this.diff * percent );
     }

    
     exports.Value = AnimationValue;


    return exports;

})