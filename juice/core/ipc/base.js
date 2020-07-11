define('ipc', [], function IPC( Url ){

	var app = this.app;
    var exports = this;
    var ipc = this.window.ipcRenderer;
    console.log( this );
    app.ipc = exports;

    exports.send = ipc.send;

    //ipcRenderer.messaging.init();
    
    return exports;

});