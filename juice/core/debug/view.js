define('debug/view', ['html', 'stylesheet'], function( html, stylesheet ){

    var exports = this.exports;
    exports.defined = {};


    var debugStyle = stylesheet.use('debug');
   
    debugStyle.define({
        '#debug [data-title]:before': {
            content: "attr( data-title )",
            display: 'block',
            color: '#FFF',
            fontSize: '14px !Important',
            height: '20px',
            marginBottom: '5px',
            paddingottom: '5px'
        },
        '#debug [data-title-left]:before': {
            content: "attr( data-title-left )",
            display: 'inline-block',
            color: '#FFF'
        },
        '.debug-section': {
            position: 'relative'
        },
        '.debug-section:before': {
           
           borderBottom: '1px solid #FFF'
        },
        '.debug-section .value': {
            position: 'relative',
            fontSize: '12px'
        },
    });

    var debugView = new html.Element('debug', {
        style:{
            color: '#FFF',
            position: 'absolute',
            minHeight: '50px',
            minWidth: '250px',
            bottom: '30px',
            left:0,
            padding: '10px',
            zIndex:100000
        },
        bg: {
            color: '#000',
            opacity: 0.5
        }
    });

    Object.defineProperty( exports, 'wrapper', {
        get: function(){
            return exports.defined.wrapper;
        },
        set: function( el ){
            if( typeof el == 'string' ){
                el = document.querySelector( el );
            }
            exports.defined.wrapper = el;
            exports.defined.wrapper.appendChild( debugView );
        }
    });

    Object.defineProperty( exports, 'visible', {
        get: function(){
            return exports.defined.wrapper;
        },
        set: function( el ){
            exports.defined.wrapper = el;
        }
    });

    exports.set = function( id, properties ){
         var set = exports.defined[id];
         for( prop in properties ){
         exports.defined[id][prop].innerText = properties[prop];
         }
    }

    exports.add = function( id, properties ){

        var section = new html.Element( 'debug-'+id, { 
            parent: debugView, 
            class: 'debug-section',
            data: {
                'title': id
            }
        } );

        exports.defined[id] = {};
        for( prop in properties ){

            var el = new html.Element( 'debug-'+id+'-'+prop, { 
                class: 'value',
                data: {
                    'title-left': prop
                },
                contents: properties[prop],
                parent: section
            });

            exports.defined[id][prop] = el;
        }
    };

    return exports;

});