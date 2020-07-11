define('http/request', ['http/xhr'], function( xhr ){
	 
	var exports = this.exports;
	var app = this.app;
	 
	
	function Request(){
		var req = this;
		req.xhr = null;
		req.usedProxy = false;
		req.onReady = null;
		req.ext = null;
		req.callback = null;
	}
	
	Request.prototype.createRequest = function(){
		
		var req = this;
		
		var isIE8 = window.XDomainRequest ? true : false;
		if (window.XMLHttpRequest){
			req.xhr = isIE8 ? new window.XDomainRequest() : new XMLHttpRequest();
		}else{
			req.xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		
	};
	
	Request.prototype.getByProxy = function(url, callback){
		
		var req = this;
		req.usedProxy = true;
		if(callback) req.callback = callback; 
		var proxyURL = Flux.Config.fileProxy+url;
		req.get(proxyURL);
		
	};

	Request.prototype.iframe = function( url, callback ){
		//console.log('iframe request '+url);
		//iFrame Name Request 
		var _timeout;	
		var wrap = document.createElement('div');
		wrap.style = 'overflow:hidden;display:none;width:1px;height:1px';
		app.body.appendChild(wrap);
		var iframe = document.createElement('iframe');
		
		iframe.onload = function(){
			
			if( !iframe.src ) return false;
			
			clearTimeout( _timeout );
			if( iframe.src == url ){
				iframe.src = "about:blank";
			}else{
				if(iframe.contentWindow.name == 'error'){
					callback(false);
				}else{
					console.log(iframe.contentWindow.name);
					callback( iframe.contentWindow.name );
					app.body.removeChild(wrap);
				}
			}
		};
		
		_timeout = setTimeout(function(){
			app.body.removeChild(wrap);
			callback(false);
		}, 3000 );
		
		iframe.src = url;
		
		wrap.appendChild(iframe);
		return false;
	};
	
	Request.prototype.parseResponce = function(){
		
		var req = this;
		var responce = req.xhr.responseText;
		
		if(req.ext == 'smil' || req.ext == 'xml'){
			
			var xmlDoc;
			if (window.DOMParser){
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(responce,"text/xml");
			}else{
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async=false;
				xmlDoc.loadXML(responce);
			}
			return xmlDoc;
			
		}else{
			return responce;
		}
		
	};
	
	return {
		get: xhr.get,
		post: xhr.post,
		iframe: function( url, callback ){
			var request = new Request();
			return request.iframe( url, callback );
		},
		jsonp: function( url, callback ){
			
			var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
			
			var jsonTO = setTimeout(function(){
				callback(null, true);
			}, 3000 );
           
            window[callbackName] = function(data) {
            	clearTimeout(jsonTO);
                delete window[callbackName];
                app.body.removeChild(script);
                callback(data);
            };
            
            var script = document.createElement('script');
            script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
            app.body.appendChild(script);
        }
	};

});