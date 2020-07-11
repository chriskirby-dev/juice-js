define('tpl/table', [], function(){

    const { app, exports } = this;

    exports.makeRow = function( arr ){
        
        var tr = document.createElement('tr');
        for( var i=0;i<arr.length;i++ ){
            var td = document.createElement('td');
            td.innerHTML = arr[i];
            tr.appendChild( td );
        }
        return tr;
    }

    return exports;
});