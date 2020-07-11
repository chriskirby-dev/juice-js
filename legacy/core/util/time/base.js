define('util/time/base', [], function (){

     const { app, exports } = this;

     const types = {
        millisecond: { 
          alias: ['ms'],
          length: 1
        },
        second: { 
          alias: ['s', 'sec', 'secs'],
          length: 1000
        },
        minute: { 
          alias: ['m', 'min', 'mins'],
          length: 60000
        },
        day: { 
          alias: ['d', 'day', 'days'],
          length: 60000 * 24
        },
        month: { 
          alias: ['M', 'mth'],
          length: 60000 * 24 * 30
        },
        year: { 
          alias: ['Y', 'yr'],
          length: 60000 * 24 * 365
        }
     };

     const ms = {
      second: 1000,
      minute: 1000*60,
      hour: 1000*60*60,
      day: 1000*60*60*24,
      month: 1000*60*60*24*30
    };
    
    exports.ms = ms;
	
    const secs = {
      second: ms.second/1000,
      minute: ms.minute/1000,
      hour: ms.hour/1000,
      day: ms.day/1000,
      month: ms.month/1000
    };
    
    exports.seconds = secs;

    exports.snap = function( milsec, unit ){
        var unitMS = ms[unit];
        return Math.floor( milsec/unitMS ) * unitMS;
    }

    var getTypeAlias = function( typeName ){
      if( types[typeName] ) return typeName;
      var names = Object.keys( types );
      var matched = names.filter( name => { return types[name].alias.indexOf( typeName ) !== -1; });
      return matched.length == 0 ? null : matched[0];
    }

    var TimeValue = function( type, value ){

        this.name = getTypeAlias( type );
        this.type = types[this.name];
        this.value = value;

    }

    TimeValue.prototype.set = function( value ){
        this.value = value;
        return this;
    }

    TimeValue.prototype.to = function( type ){

        var name = getTypeAlias( type );
        var toType = types[name];
        var ratio = toType.length/this.type.length;
        return this.value * ratio;
    }

    exports.TimeValue = TimeValue;

   
     return exports;
});