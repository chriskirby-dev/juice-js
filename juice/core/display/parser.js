define('display/parser', [], function(){
	
	var exports = this.exports;
	
	function _tmp( content ){
		var _tmp = document.createElement('div');
		_tmp.innerHTML = content;
		return _tmp;
	}
	
	exports.parse = function(){
		
		var responce = {};
		var head = _tmp( rawHTML.match(/<head[^>]*>([\w|\W]*)<\/head>/im)[1].trim() );
		
		if( head.querySelector('title') ){
    		responce.title = head.querySelector('title').innerText;
    	}
    	
    	var sheets = head.querySelectorAll('link[rel="stylesheet"]');
    	for( var i=0;i<sheets.length;i++ ){
    		responce.stylesheets.push( sheets[i].href );
    	}
    	
    	var scripts = head.querySelectorAll('script[src]');
	    for( var i=0;i<scripts.length;i++ ){
    		var map = scripts[i].$.map();
    		responce.scripts.push( map );
    	}
    	
    	var body = _tmp( rawHTML.match(/<body[^>]*>([\w|\W]*)<\/body>/im)[1].trim() );
    	
		var workers = Array.prototype.slice.call( tmp.body.querySelectorAll('[data-worker]') );
    	responce.workers = workers.map(function(el){
			return el.getAttribute('data-worker');
		});
		
    	responce.templates = Array.prototype.slice.call( tmp.body.querySelectorAll('[data-tpl]') );
    	
    	return responce;

	};
	
	return exports;
	
});
