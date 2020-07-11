define('electron', ['electron/comm', 'electron/window'], function( comm, eWindow ){

    var app = this.app;
    var exports = this.exports;

    var electron = require('electron');
    var ipcMain = electron.ipcMain;
    var ipc = electron.ipcRenderer;

    exports.window = eWindow;

    exports.comm = comm;

    return exports;

});