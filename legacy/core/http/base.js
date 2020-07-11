define('http', ['http/url'], function Http( Url ){
	
	var exports = this;
	exports.requests = [];
	
	function createRequest(){
				
		var isIE8 = window.XDomainRequest ? true : false;
		if (window.XMLHttpRequest){
			return isIE8 ? new window.XDomainRequest() : new XMLHttpRequest();
		}else{
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
		
	}
	
	function XHRRequest( method, path, params ){
		
		if(!params) params = {};
		var req, callback, fcallback, pcallback, data;
		var bytesLast = 0;
		
		if(params.data){
			var data = new FormData();
			for(var prop in params.data){
				
				if(params.cakephp && typeof params.data[prop] == 'object'){
					for(var subprop in params.data[prop]){
						if(params.cakephp){
							data.append('data['+prop+']['+subprop+']', params.data[prop][subprop] );
						}else{
							data.append(prop, typeof params.data[prop] == 'object' ? JSON.stringify(params.data[prop]) : params.data[prop] );
						}
					}
				}else{
					data.append(prop, params.data[prop] );
				}
				
			}
		}
		
 		
		req = {
			xhr: new createRequest(),
			success: function( cb ){
				callback = cb;
				return req;
			},
			progress: function( pcb ){
				pcallback = pcb;
				return req;
			},
			fail: function( fcb ){
				fcallback = fcb;
				return req;
			}
		};

		if( params.headers ){
			for(var name in params.headers){
				req.xhr.setRequestHeader( name, params.headers[name] );
			}
		}


		exports.requests.push(req);		
		
		req.xhr.onreadystatechange = function(){
			//console.log(_request.xhr);
			var state = req.xhr.readyState;
			if (req.xhr.status >= 400) {
				if(typeof fcallback == 'function'){
					fcallback(req.xhr.responseText, req.xhr.status);
					return false;
				}
			};
			
			if(state == 4){
				
				if(typeof callback == 'function'){
					//console.log(req.xhr);
					var resp = null;
					if(params.dataType){
						switch(params.dataType){
							case 'json':
								resp = JSON.parse(req.xhr.responseText);
							break;
						}
						callback(resp, req.xhr.status);
						return false;
					}else{
						callback(req.xhr.responseText, req.xhr.status);
						return false;
					}
				}
			
			}
		
		};
		
		req.xhr.upload.addEventListener('progress', function(event) {
			if(event.lengthComputable){
				if(pcallback) pcallback({ 
					bytes: event.loaded - bytesLast,
					loaded: event.loaded,
					percent: event.loaded / event.total,
					total: event.total
				});
				bytesLast = event.loaded;
			}
			return false;
		});
	
		req.xhr.open( method, path, true );
		req.xhr.send(data);
		
		return req;
	}
	
	exports.post = function( path, params ){
		return new XHRRequest( 'POST', path, params );
	};
	
	exports.get = function( path, params ){
		var xhr = new XHRRequest( 'GET', path, params );
		return xhr;
	};

	exports.put = function( path, params ){
		var xhr = new XHRRequest( 'PUT', path, params );
		return xhr;
	};

	exports.delete = function( path, params ){
		var xhr = new XHRRequest( 'DELETE', path, params );
		return xhr;
	};

	exports.URL = Url;
	
	return exports;
	
});