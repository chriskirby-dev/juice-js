define('tpl/template', [], function(){

    const { app, exports, parent } = this;

    //{tpl{}}


   function Template( path, id ){
        this.path = path;
        this.id = id || path.replace( /\//g, '-');
        this.loaded = false;
   }

   Template.prototype.load = function( tpl ){

        if( cache.has( tpl ) ){
            this.raw = cache.get( tpl );
            this.loaded = true;
            return false;
        }

        var path =  parent.dir + this.path;
        var content = fs.readFileSync(path);
        var head = content.toString().split(/<head([^>]*)>/).pop().split(/<\/head>/).shift().trim();
        var body = content.toString().split(/<body([^>]*)>/).pop().split(/<\/body>/).shift().trim();
        this.raw = body;
        cache.set( tpl, body );
        this.loaded = true;
   }

   Template.prototype.process = function(  ){

   }

    return Template;
});