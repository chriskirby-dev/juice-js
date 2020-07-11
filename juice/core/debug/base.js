define('debug', [ 'debug/view'], function( view, html, stylesheet ){

    var exports = this.exports;
    exports.defined = {};

    exports.view = view;

    return exports;

}, { persistant: true });