

define('window', ['util'], function( util ){
    const { app, exports } = this;

    var index = 0;
    exports.root = window;

    var root = this.script.substring(0, this.script.lastIndexOf("/"));

    var defaults = {
        scrollbars: 'yes',
        menubar: 'no',
        toolbar: 'no',
        status: 'yes',
        resizable: 'no',
        location: 'no',
        left: null,
        top: null,
        width: null,
        height: null
    };

    const BLANK_DOC = '<!DOCTYPE html> <html> <head> <meta charset="UTF-8"> <title>Console Logger</title>  </head> <body> Hello World  </body> </html>';


    var WindowInstance = function( url, options ){

        var self = this;
        exports.events.Constructor( this );
        index++;
        self.url = options.url || root + '/blank.html';
        self.name = options.name || 'window-'+index;
        self.frame = options.frame;
        delete options.frame;
        delete options.name;
        self.options = Object.assign( defaults, options );
        
        self.create();
        
    }

    WindowInstance.prototype.create = function(){
        var self = this;

        if( self.frame ){
            self.toFrame();
        }else{
            self.toWindow();
        }
    }

    WindowInstance.prototype.toFrame = function(){
        var self = this;
        self.window = document.createElement('iframe');
        self.window.id = self.name;
        
        self.window.addEventListener("load", function(){
            
            self.document = self.window.contentWindow.document;
            self.visible = true;
            setTimeout(function(){
                self.emit('ready');
            }, 10)
           
            return;
        });

        self.frame.appendChild( self.window );
    }

    WindowInstance.prototype.toWindow = function(){
        var self = this;
        console.log(self.url, self.name);
        self.window = window.open( self.url, self.name, self.params() );
        console.log(BLANK_DOC);
        self.window.document.write( BLANK_DOC );


        self.window.onload = function(){
            console.log('Window Ready');
            self.document = self.window.document;
            self.visible = true;
            setTimeout(function(){
            self.emit('ready');
            }, 10);
        }
        
    }

    WindowInstance.prototype.params = function(){

        var self = this;
        var options = [];

        for( var prop in self.options ){
            if( self.options[prop] ){
                options.push( prop +'='+ self.options[prop] );
            }
        }
        console.log( options );
        return options.join(',');
    }

    WindowInstance.prototype.contents = function( content ){
        var self = this;
        self.window.document.write( content );
    }

    WindowInstance.prototype.close = function( ){
        var self = this;
        self.window.close();
    }

    exports.create = function( url, options ){

        if( util.type( url, 'object' ) ){ 
            options = url; 
            url = options.url || null;
        }

        var instance = new WindowInstance( url, options );

        return instance;
    }

    return exports;
},{ extend: 'events' });