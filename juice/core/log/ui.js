define('log/ui', [], function LogUI(){
	
    const { exports, app } = this;
    
    exports.wrapper = null;

    exports.item = { 
        el: 'div'
    };

    exports.print = function( type, ...args ){
        console.log('PRINT', arguments);
        var time = new Date();
        var logItem = document.createElement( 'tr' );
        logItem.className = 'lig-item '+type;

        var logTime = document.createElement( 'td' );
        logTime.className = 'timestamp';
        logTime.innerText = time.toString();

        var logMessage = document.createElement( 'td' );
        logTime.className = 'message';
        logMessage.innerHTML = '<div>' + args.join('</div><div>') + '</div>';

        logItem.appendChild( logTime );
        logItem.appendChild( logMessage );   

        exports.wrapper.insertBefore( logItem, exports.wrapper.firstChild );
    
    };
    
    return exports;

});