define('cordova/device', [ 'client/cookies', 'utils' ], function( cookies, utils ){
	
	var exports = this.exports;
	var app = this.app;
	var MAX_CHECKS = 10;
	var checkCount = 0;
	
	exports.platform = null;
	exports.uuid = null;
	exports.version = null;
	exports.model = null;
	
	var reCheck = function(){
		if(checkCount > MAX_CHECKS) return false;
		if(checkCount > 10){
			checkCount++;
			setTimeout(function(){
				init();
			}, 1000 );
		}
		return false;
	};
	
	var init = function(){
		
		app.device = exports;
		if(!window.device) return reCheck();

		for( var dprop in window.device ){
			if(dprop == 'platform'){
				exports[dprop] = window.device[dprop].toLowerCase();
			}else
			exports[dprop] = window.device[dprop];
		}
		
		if( cookies.hasValue('device-uuid') ){
			exports.uuid = cookies.get('device-uuid');
		}
		
		if( !exports.uuid ){
			exports.uuid = utils.guid();
			var exDate = new Date();
			exDate.setFullYear( exDate.getFullYear() + 50 );
			cookies.set('device-uuid', exports.uuid, {
				expires: exDate
			});
		}
		
	};
	
	init();
	
	return exports;

});