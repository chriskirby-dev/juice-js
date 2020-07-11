define('client/browser', [], function ClientBrowser(){

	var versionSearchString;

	var bdata = {
		browserTypes: [
			{ string: navigator.userAgent, subString: "chrome", identity: "Chrome" },
			{ string: navigator.userAgent, subString: "omniweb", versionSearch: "OmniWeb/", 
			identity: "OmniWeb" },
			{ string: navigator.vendor, subString: "apple", identity: "Safari", versionSearch: "Version" },
			{ prop: window.opera, identity: "opera", versionSearch: "Version" },
			{ string: navigator.vendor, subString: "icab", identity: "iCab" },
			{ string: navigator.vendor, subString: "kde", identity: "Konqueror" },
			{ string: navigator.userAgent, subString: "firefox", identity: "Firefox" },
			{ string: navigator.vendor, subString: "camino", identity: "Camino" },
			{ string: navigator.userAgent, subString: "netscape", identity: "Netscape" },
			{ string: navigator.userAgent, subString: "msie", identity: "Explorer", versionSearch: "MSIE" },
			{ string: navigator.userAgent, subString: "gecko", identity: "Mozilla", versionSearch: "rv" },
			// for older Netscapes (4-)
			{ string: navigator.userAgent, subString: "mozilla", identity: "Netscape", 
			versionSearch: "Mozilla" }
		],
		osTypes : [
			{ string: navigator.platform, subString: "win", identity: "Windows" },
			{ string: navigator.platform, subString: "mac", identity: "Mac" },
			{ string: navigator.userAgent, subString: "iphone", identity: "iOS" },
			{ string: navigator.platform, subString: "linux", identity: "Linux" },
			{ string: navigator.userAgent, subString: "android", identity: "Android" },
			{ string: navigator.userAgent, subString: "iemobile", identity: "IEMobile" },
		],
		
	};

	var testData = function(data){
		for (var i=0;i<data.length;i++)	{
			var testType = null;
			var tester = ( typeof data[i].string != 'undefined' ? 
				data[i].string.toLowerCase() : ( typeof data[i].prop != 'undefined' ? data[i].prop  : null ) );			
			if(tester){
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if(typeof tester == 'string'){
					if (tester.indexOf(data[i].subString) != -1) return data[i].identity;
				}else if (typeof tester == 'object' && tester){
					return data[i].identity;
				}
			}
		}
	};
	
	var searchVersion = function (dataString){
		var index = dataString.indexOf(versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+versionSearchString.length+1));
	};
	
	var getCapibilities = function(){
		
		var _form = {};
		_form.data = !!window.FormData ? 'formdata' : 'input';
		_form.post =  window.File ? 'ajax' : 'iframe';
		_form.fileReader = window.FileReader ? true : false;;
		
		return { 
			files: (( window.File || window.FileReader ) ? true : false),
			video: ( typeof document.createElement('video').canPlayType != undefined ? true : false ),
			audio: ( typeof document.createElement('audio').canPlayType != undefined ? true : false ),
			form: _form,
			socket: {
				webSocket: ("WebSocket" in window) ? true : false
			},
			ajax: ( window.XMLHttpRequest ? ( window.XDomainRequest ? 'XDomainRequest' : 'XMLHttpRequest') : 'ActiveXObject' )
		};
	};
	
	var flashVersion = function(){
		
		var version = null;
		function parseVersion(d) {
			d = d.match(/[\d]+/g);
			d.length = 3;
			return d.join(".");
		};
	
		if (navigator.plugins && navigator.plugins.length) {
			var e = navigator.plugins["Shockwave Flash"];
			e && (a = !0, e.description && (version = parseVersion(e.description)));
			navigator.plugins["Shockwave Flash 2.0"] && (a = !0, version = "2.0.0.11");
		} else {
			 if (navigator.mimeTypes && navigator.mimeTypes.length) {
				var f = navigator.mimeTypes["application/x-shockwave-flash"];
				(a = f && f.enabledPlugin) && (version = parseVersion(f.enabledPlugin.description));
			} else {
				try {
					var g = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"),
						a = !0, version = parseVersion(g.GetVariable("$version"));
				} catch (h) {
					try {
						g = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"), a = !0, version = "6.0.21";
					} catch (i) {
						try {
							g = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"), a = !0,version = parseVersion(g.GetVariable("$version"));
						} catch (j) {}
					}
				}
			}
		}
		
		return version;
	};
	
	return { 
		name: testData(bdata.browserTypes) || "unknown",
		version: searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || "unknown",
		platform: testData(bdata.osTypes) || "unknown",
		flash: flashVersion(),
		capibilities: getCapibilities()
	};
	
});