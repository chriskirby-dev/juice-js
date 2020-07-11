define('net.ajax', function(){
	
	var _xhr = null;
	var isIE8 = window.XDomainRequest ? true : false;
	try{
        _xhr = new XMLHttpRequest();
    }catch (e){
        try{
            _xhr = new XDomainRequest();
        } catch (e){
            try{
                _xhr = new ActiveXObject('Msxml2.XMLHTTP');
            }catch (e){
                try{
                    _xhr = new ActiveXObject('Microsoft.XMLHTTP');
                }catch (e){
                                            
                }
            }
        }
    }
	
	
	function Ajax(){
		var _ajax = this;
		_ajax.xhr = null;
		_ajax.usedProxy = false;
		_ajax.onReady = null;
		_ajax.ext = null;
		_ajax.callback = null;
	}
	
	Ajax.prototype.getByProxy = function(url, callback){
		
		var _ajax = this;
		_ajax.usedProxy = true;
		if(callback) _ajax.callback = callback; 
		var proxyURL = Flux.Config.fileProxy+url;
		_ajax.get(proxyURL);
		
	};
	
	Ajax.prototype.post = function(_url, _params, callback){
		var _ajax = this;
		_params.method = 'POST';
		return new AjaxRequest(_url, _params, callback);
	};
	
	Ajax.prototype.get = function(_url, _params, callback){
	
		var _ajax = this;
		_params.method = 'GET';
		return new AjaxRequest(_url, _params, callback);
		
	};
	
	Ajax.prototype.upload = function(_url, _params, callback){
	
		var _ajax = this;
		_params.method = 'POST';
		
		return new AjaxRequest(_url, _params, callback);
		
	};
	
	Ajax.prototype.parseResponce = function(){
		
		var _ajax = this;
		var responce = _ajax.xhr.responseText;
		
		if(_ajax.ext == 'smil' || _ajax.ext == 'xml'){
			
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
	
	APP.Ajax = new Ajax(); 
});