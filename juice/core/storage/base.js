define('storage', ['storage/local', 'storage/indexed'], function( local, indexed ){

    var exports = this.exports;
    var app = this.app;
    
    exports.local = local;
    exports.indexed = indexed;

    return exports;

});