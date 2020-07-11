define('dom/element', [], function(){

    { exports, app } = this;

    exports.dom = null;

    exports.link = function( element ){
        exports.dom = element;
    };
    
    return exports;

}, { extend: 'events' });