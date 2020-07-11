define('views/parser', [], function(){
	
	var exports = this.exports;
	
	function tmp( content ){
		var _tmp = document.createElement('div');
		_tmp.innerHTML = content;
		return _tmp;
	}
	
	exports.parseBody = function(rawHTML){
		var responce = {};
		var bodyText = rawHTML.match(/<body[^>]*>([\w|\W]*)<\/body>/im)[1].trim();
		var content = tmp( bodyText );
		
		
		responce.templates = Array.prototype.slice.call( body.querySelectorAll('[data-tpl]') );

	};
	
	exports.parseRaw = function(rawHTML){
		
		var responce = {
			stylesheets: [],
			scripts: [],
		};
		
		var head = tmp( rawHTML.match(/<head[^>]*>([\w|\W]*)<\/head>/im)[1].trim() );
		
		if( head.querySelector('title') ){
    		responce.title = head.querySelector('title').innerText;
    	}
    	
    	var sheets = head.querySelectorAll('link[rel="stylesheet"]');
    	for( var i=0;i<sheets.length;i++ ){
    		responce.stylesheets.push( sheets[i].href );
    	}
    	
    	var scripts = head.querySelectorAll('script[src]');
	    for( var i=0;i<scripts.length;i++ ){
    		var script = scripts[i];
    		responce.scripts.push( script.getAttribute('src') );
    	}
    	responce.html = rawHTML.match(/<body[^>]*>([\w|\W]*)<\/body>/im)[1].trim();
    	var body = tmp( responce.html );

		var workers = Array.prototype.slice.call( body.querySelectorAll('[data-worker]') );
    	responce.workers = workers.map(function(el){
			return el.getAttribute('data-worker');
		});
		
    	responce.templates = Array.prototype.slice.call( body.querySelectorAll('[data-tpl]') );
    	
    	responce.views = Array.prototype.slice.call( body.querySelectorAll('.view-pane') );
    	
    	return responce;

	};
	
	return exports;
	
});
