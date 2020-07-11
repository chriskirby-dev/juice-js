define('form/data', [], function(){
    const { app, exports } = this;

    exports.serialize = function( form ){
        var data = {};
        for( var i=0;i<form.elements.length;i++ ){
            var field = form.elements[i];
            if(field.name && field.name !== '')
            data[field.name] = field.value;
        }
        return data;
    }

    return exports;
});