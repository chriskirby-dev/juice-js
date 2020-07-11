define('file/view', [ 'dom', 'file/utils', 'file/compatibility', 'view'], function( dom, utils, compatibility, view ){
	
	var exports = this.exports;

	var View = function(){
		
	};
	
	exports.linkage = {};

	exports.file = function( id ){
		return '<div id="file_'+id+'" class="file initializing" data-file-id="'+id+'" ></div>';
	};
	
	exports.details = function( file ){
		
		var elements = dom.create('dl.details > dt.dimentions > "Dimentions" < dd.dimentions dt.duration > "Duration" < dd.duration');
		var _get = {};
		_get.mime = elements.$.find('dd.mime');
		_get.dimentions = elements.$.find('dd.dimentions');
		_get.duration = elements.$.find('dd.duration');
		return { dom: elements, get: _get };
	};
	
	exports.loader = function( file ){
		
		elements = dom.create('div.loader > div.circle > div.rotator > div << div.circle > div.rotator > div << div.circle > div.rotator > div');
		
		
		
		return { dom: elements };
		
	};
	
	exports.viewer = function( file ){
		var elements;
		console.log(file);
		var _get = {};
		switch(file.type_major){
			case 'video':
			elements = dom.create('div.file-viewer > div.content > canvas#preview');
			//elements.$.find('.file-viewer');
			_get.content = elements.$.find('div.content');
			break;
		}
		
		return { dom: elements, get: _get };
	};
		
	exports.basic = function( file ){
		
	};
	
	exports.icon = function( file ){
		
		var elements = dom.create('div.file-icon > div.graphic > canvas');
		var linkage = {
			'icon': elements.$.find('.file-icon'),
			'graphic': elements.$.find('.graphic')
		};
		
		/*
		var view = {
			dom: dom.create('div.file-icon > div.graphic'),
			update: function(){
				
			}
		};
		view.elements = {};
		view.update = function(){
			
		}
		*/
		return new View( dom, linkage, update );
	};
	
	exports.preview = function(file){
		var html = '';
		html += '<section class="preview" >';
		html += '<div class="thumb" ><canvas id="preview_canvas_'+file.id+'" ></canvas></div>';
		html += '</section>';
		return html;
	};
	
	exports.codec = function(file){
		var codec = file.codec;
		console.log(codec);
		var html = '';
		html += '<section class="codec">';
		html += '<div >'+codec.title+'</div>';
		html += '<div >'+codec.major_brand+'</div>';
		html += '<div >'+codec.durationraw+'</div>';
		html += '<div >'+codec.durationsec+'</div>';
		html += '<div >'+codec.major_brand+'</div>';
		if( codec.audio ){
			html += '<div >'+codec.audio.codec+'</div>';
			html += '<div >'+codec.audio.bitrate+'</div>';
			html += '<div >'+codec.audio.sample_rate+'</div>';
		}
		if( codec.video ){
			html += '<div >'+codec.video.aspectString+'</div>';
			html += '<div >'+codec.video.pixelString+'</div>';
			html += '<div >'+codec.video.codec+'</div>';
			html += '<div >'+codec.video.container+'</div>';
			html += '<div >'+codec.video.fps+'</div>';
			html += '<div >'+codec.video.width+'</div>';
			html += '<div >'+codec.video.height+'</div>';
		}
		html += '</section>';

		return html;
	};
	
	exports.browsers = function( vcodec, acodec ){
		var b = ['flash','ie','firefox','chrome','safari'];
		var html = '<section class="browsers">';
		var compat = compatibility.codecs( vcodec, acodec );
		b.forEach(function(browser){
			html += '<div class="browser '+browser+' '+( compat[browser] == true ? 'enabled' : 'disabled')+' "></div>';
		});
		html += '</section>';
		return html;
	};

	return exports;
		
});