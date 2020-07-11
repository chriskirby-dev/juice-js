
define('http/url', [], function(  ){
	
	var exports = this.exports;
	var app = this.app;
    
    var Url = function( string ){
        var self = this;
        if( string ){
            self.string = string;
            self.parse();
        }
    };

    Url.prototype.current = function(){
        var self = this;
        self.string = window.location.href;
    }

    Url.prototype.data = function( name ){
        var url = self.string;
        name = name.replace(/[\[\]]/g, "\\$&");

        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);

        if (!results) return null;
        if (!results[2]) return '';

        return decodeURIComponent( results[2].replace(/\+/g, " ") );
    }

    Url.prototype.addQuery = function( data ){
        var qs = []
        for( var name in data ){
            qs.push( name+'='+ encodeURIComponent( data[name] ) );
        }
        this.querystring = qs.join('&');
    }

    Url.prototype.toString = function( ){
        var string = '';

        if( this.protocol ) string = this.protocol;
        if( this.domain ) string += this.domain;
        if( this.path ) string += this.path;
        if( this.querystring ) string += ('?'+this.querystring );
        return string;
    }

    Url.prototype.parse = function(){
        var self = this;
        var parsed = { type: 'relative' };
        var string = self.string;

        if( string.indexOf('?') !== -1 ){
            var split = string.split('?');
            self.querystring = split[1];
            string = split[0];
            split = null;
        }

        var protocol = string.match(/^[a-z]+:\/\//);

        if( protocol && protocol.index == 0 ){
            self.protocol = protocol[0];
            string = string.replace( self.protocol, '');
            self.type = 'absolute';
        }

        var parts = string.split('/');
        //console.log(parts);
        if( parts[0].indexOf('.') !== -1 ){
            self.domain = parts.shift();
            self.type = 'absolute';
        }

        if( parts[0] == '' ){
            self.type = 'absolute';
            
        }

        self.path = parts.join('/');

     
    }
		
	return Url;
	
}, { extend: 'events' });
