define('data/import', [], function(){

    const { app, exports  } = this;
    exports.diliminator = ",";

    exports.staticKeys = [];

    exports.setStaticKeys = function( keys ){
        exports.staticKeys = keys;
    }

    

    return exports;

});