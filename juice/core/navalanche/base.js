define('navalanche', [], function(){

    const { app, exports } = this;
    let config = {}, map = {};

    const containers = {}

    function initNavMap( path, links, params, cfg ){
        var paths = [];

            if(cfg.path) paths.push(cfg.path);
            if( params.href ) paths.push(params.href);

            if( typeof params == 'string' ) params = { label: params };
            var dom = document.createElement('li');
            var link = document.createElement('a');
            link.innerText = params.label || path;
            if( params.href ) link.$.data( 'href', paths.join('/') );
            

            if(cfg.override){
                link.$.on('click', function(e){
                    e.preventDefault();
                    if(document.body.$.find('#'+links.id))
                    document.body.$.find('#'+links.id+' li.active').$.class('active', false );
                    this.parentNode.$.class('active', true );
                    return cfg.override.apply( this, [e, params]);
                });
            }

            

            dom.appendChild( link );

            if(params.default){
                setTimeout(function(){
                dom.$.class('active', true );
                link.click();
                }, 10 );
            }

            return dom;
    }

    function parseNavMap( mapped ){
        let cfg = mapped._ || {};
      
        var links = document.createElement('ul');
        links.id = cfg.id || '';
        for( let path in mapped ){
            if( path == '_' ) continue;
            let params = mapped[path];
            links.appendChild( initNavMap( path, links, params, cfg ) );
            
        }
        return links;
    }

    exports.setContainer = function( id, selector ){
        containers[id] = document.querySelector( selector );
    }

    exports.setNav = function( id, navLinks ){
        containers[id].innerHTML = '';
        containers[id].appendChild( parseNavMap(navLinks) );
    }

    let tpl = {
        "_":{
            "nav": "#tabs-main",
            "view": "#tabs-main-content"
        },
        "people": {
            "index": {},
            "import": {},
            "person": {}
        },
        "actions": {
            "index": {},
            "edit": {}
        }
    };

    function processMappedLevel( mapped, cfg ){

        var links = document.createElement('ul');
        for( let path in mapped ){
            if( path == '_' ) continue;
            let params = mapped[path];
            if( typeof params == 'string' ) params = { label: params };
            var dom = document.createElement('li');
            var link = document.createElement('a');
            link.innerText = params.label || path;

            link.onclick = function(){

            };

            dom.appendChild( link );
            links.appendChild( dom );
        }

    }

    function processMap( mapped ){
        const cfg = mapped._;
        if( cfg ){
            const container = body.$.find( cfg.nav );
        }
        processMappedLevel( mapped );
        container.appendChild( links );
    }

    exports.config = function( cfg ){
        config = cfg;
    }

    exports.map = function( _map ){
        map = _map;
    }

    return exports;

}, { extends: 'events' });