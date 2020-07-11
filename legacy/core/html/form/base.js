define('html/form/base', [ 'tpl' ], function( tpl ){
    const { app, exports } = this;

    tpl.dir = [ __dirname, 'tpls' ].join('/');

    

    return exports;
});