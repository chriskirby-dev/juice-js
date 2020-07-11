define('file/utils', function FileBase(){
	
	var exports = this.exports;
	var bytesInGigaByte = 1073741824;
	var bytesInMegaByte = 1048576;
	var bytesInKiloByte = 1024;
	
	exports.convertBytes = function( bytes ){
		
		var abrev = 'kb';
		var div = bytesInKiloByte;
		
		if(bytes > bytesInGigaByte){
			abrev = 'GB';
			div = bytesInGigaByte;
		}else if(bytes > bytesInMegaByte){
			abrev = 'MB';
			div = bytesInMegaByte;
		}
		
		return (bytes/div).toFixed(2) + abrev;
	};
	
	exports.secondsToTimecode = function( sec ){
		var sec_num = parseInt(sec, 10); // don't forget the second param
		var dec = sec - parseInt(sec);
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = Number(sec - (hours * 3600) - (minutes * 60)).toFixed(3);
	
	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    var time    = hours+':'+minutes+':'+seconds;
	    return time;
	};
	
	exports.secondsToTimeString = function( sec ){
		var sec_num = parseInt(sec, 10); // don't forget the second param
		var dec = sec - parseInt(sec);
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = Number( sec - (hours * 3600) - (minutes * 60) ).toFixed(3);
	
	    var time = '';
	    
	    if (hours > 0){
	    	time += hours + ' Hour'+(hours>1?'s':'');
	    }
	    if (minutes > 0){
	    	if(time != '') time += ' ';
	    	time += minutes + ' Min'+(minutes>1?'s':'');
	    }
	    if(time != '') time += ' ';
	    time += seconds + ' Sec'+(seconds>1?'s':'');
	    
	    return time;
	};
	
	exports.timecodeToSeconds = function( tc ){
		var timeArray = tc.split(":");
		var hours = Number(timeArray[0]) * 60 * 60;
		var minutes = Number(timeArray[1]) * 60;
		var seconds = Number(timeArray[2]);
		var frames_raw = Number(timeArray[3]*(1/framerate));
		var frames = int(frames_raw*100)/100;
		var totalTime = hours + minutes + seconds + frames;
		return totalTime;
	};
	
	return exports;
	
});