define('display/views', ['http/xhr'], function( xhr ){
	
	var exports = this.exports;
	var app = this.app;
	var views = {};
	
	
	exports.add = function( id ){
		if( !views[id] ){
			require('display/view').then(function( view ){
				view.id = id;
				views[id] = view;
				app.display.emit('view-added', id, view );
			});
		}
	};
	
	exports.get = function( id ){
		return views[id];
	};
	
	return exports;

});