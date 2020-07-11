define('log', ['log/ui'], function Log( ui ){
	
    const { exports, app } = this;
    
    exports.output = function( wrapper ){
        ui.wrapper = document.querySelector( wrapper );
    }

    exports.popout = function( wrapper ){
        window.open();
    }

    exports.write = function( ...args ){

        if( ui.wrapper )
        ui.print( 'default', ...args );
    };

    this.window.log = console.log;
    
    return exports;

});