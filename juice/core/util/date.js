define('util/date', ['util'], function( util ){
    
    const { app, exports, parent } = this;

    exports.ms = {
        seconds: 1000,
        minutes: 1000 * 60,
        hours: 1000 * 60 * 60,
        days: 1000 * 60 * 60 * 24,
        months: 1000 * 60 * 60 * 24 * 30,
        years: 1000 * 60 * 60 * 24 * 365,
    }

    exports.parseMS = function( ms ){

        let counts = {};
        let times = Object.keys( exports.ms );

        if( ms === null ){
            while( times.length > 0 ) counts[times.pop()] = '?';
            return counts;
        }
        
        while( ms > exports.ms.seconds && times.length > 0 ){
            var scale = times.pop();
            counts[scale] = ms < exports.ms[scale] ? 0 : Math.floor( ms / exports.ms[scale] );
            ms -= counts[scale] * exports.ms[scale];
        }
        counts.ms = ms;
        console.log( counts );
        return counts;
    }

    exports.format =function(date, format) {

        if(util.empty(date)) return null;

        if ( typeof date == 'string' || typeof date == 'number') date = new Date(date);

        function twoDigit(num) {
            if (num < 10) return "0" + num;
            return num;
        }

        var months = {
            long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
        };

        var weekdays = {
            long: ['Sunday', 'Monday', 'Tuesday', 'Wendsday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            short: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun']
        }

        var formatter = {
            "d": function() {
                return twoDigit(date.getDate());
            },
            "j": function() {
                return date.getDate();
            },
            "Y": function() {
                return date.getFullYear();
            },
            "F": function() {
                return months.long[date.getMonth()]
            },
            "m": function() {
                return twoDigit(date.getMonth());
            },
            "M": function() {
                return months.short[date.getMonth()]
            },
            "n": function() {
                return date.getMonth()
            },
            "H": function() {
                return twoDigit(date.getHours())
            },
            "i": function() {
                return twoDigit(date.getMinutes())
            }
        };
        var formatted = '';
        var parts = format.split('');
        for (var i = 0; i < parts.length; i++) {
            formatted += (formatter[parts[i]] ? formatter[parts[i]]() : parts[i]);
        }
        return formatted;
    }
    
    exports.ago = function( date ){
        if(util.empty(date)) return exports.parseMS( null );
        let now = new Date();
        let ms = now.getTime() - date.getTime();
        return exports.parseMS(ms);
    }

    return exports;
});