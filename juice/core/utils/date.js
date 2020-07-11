define('utils/date', [], function(){
	
	var exports = this.exports;

	var DateItem = function( d ){
		return d instanceof Date ? d : new Date( d );
	};

	exports.time = {
		second: 1000,
		minute: 1000*60,
		hour: 1000*60*60,
		day: 1000*60*60*24,
		month: 1000*60*60*24*30
	};
	
	exports.toSpan = function( ms ){
		var date = new Date( ms );

	};

	exports.months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	exports.months_short =  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
	
	exports.days = ['Monday', 'Tuesday', 'Wendsday', 'Thursday', 'Friday', 'Saterday', 'Sunday'];
	exports.days_short = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

	exports.ago =  function( date ){
		if(typeof date == 'number'){
			date = new Date(date);
		}
		var now = new Date();
		var ago = [];
		//console.log(now.getTime() - date.getTime());
		var diff = now.getTime() - date.getTime();
		var nd = new Date();
		nd.setTime( diff );
		var hours = 0;
		var minutes = 0;
		var days = 0;
		var months = 0;
		var seconds = 0;
		
		if(diff < 5000){
			ago.push('Just Now');
		}else{
		
			if(diff > exports.time.month ){
				months = Math.floor(diff/exports.time.month);
				diff -= months * exports.time.month;
			}
			
			if(diff > exports.time.day ){
				days = Math.floor(diff/exports.time.day);
				diff -= days * exports.time.day;
			}
			
			if(diff > exports.time.hour ){
				hours = Math.floor(diff/exports.time.hour);
				diff -= hours * exports.time.hour;
			}
			
			if(diff > exports.time.minute ){
				minutes = Math.floor(diff/exports.time.minute);
				diff -= minutes * exports.time.minute;
			}
			
			seconds = Math.floor( diff/exports.time.second );
			
			if(months > 0) ago.push(months+' Months');
			if(days > 0) ago.push(days+' Days');
			if(ago.length <= 1){
				if(hours > 0) ago.push(hours+' Hours');
				if(ago.length == 0){
					if(minutes > 0) ago.push(minutes+' Minutes');
					ago.push(seconds+' Seconds');
				}
			}
		
		}
		
		//console.log( 'Months', months,'days', days, 'hours', hours, 'minutes', minutes, 'seconds', seconds );
		//console.log(ago.join(' '));
		
		return ago.join(' ');
		
	};
	
	exports.now =  function(){
		return new Date();
	};
	
	exports.today =  function(){
		var d = new Date();
		return new Date( d.getFullYear(), d.getMonth(), d.getDate() );
	};
	
	exports.toTime = function( date ){
		var parts = [];
		parts.push( date.getHours() );
		parts.push( date.getMinutes() );
		parts.push( date.getSeconds() );
		return parts.join(':');
	};

	exports.toShortStr = function( date, time ){
		date = new DateItem( date );
		var d = date.getDate();
		if(d <= 9) d="0"+d;
		var m = date.getMonth()+1;
		if(m <= 9) m="0"+m;
		var ds = [date.getFullYear(), m, d].join('-');
		if( time ){
			ds += ' '+exports.toTime( date );	
		}
		return ds;
	};
	
	exports.fromShortStr = function( dstr ){
		var parts = dstr.split('-');
		var year = parts.shift();
		var month = parts.shift();
		var day = parts.shift();
		return new Date( year, Number( month )-1, Number( day ) );
	};

	exports.toHHMMSS = function ( milisecs ) {
		var sec_num = milisecs/1000;
		var days   = Math.floor( sec_num / exports.time.day );
		sec_num = sec_num - ( days * exports.time.day );
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		return days+':'+hours+':'+minutes+':'+seconds;
	};

	exports.toSmall = function ( milisecs ) {
		var days = Math.floor( milisecs/exports.time.day );
		milisecs = milisecs - ( days * exports.time.day );
		var hours = Math.floor( milisecs/exports.time.hour );
		milisecs = milisecs - ( hours * exports.time.hour );
		var minutes = Math.floor( milisecs/exports.time.minute );
		milisecs = milisecs - ( minutes * exports.time.minute );
		var seconds = milisecs/exports.time.second;
		return days+'d '+hours+'h '+minutes+'m '+seconds+'s';
	};

	return exports;
});
