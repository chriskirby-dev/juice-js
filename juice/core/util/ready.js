define('util/ready', [], function( inherits ){
	
    const { exports, parent } = this;

    var CheckList = function( items ){
        const self = this;
        exports.events.extend( this );
        this.items = items || [];
        this.ready = false;
        this.onready = null;
        var i = 0;
        items.map(function( item ){
            i++;
            if( typeof item == 'string' ){
                self.emitter( item, parent[item] );
            }else{
                self.emitter( 'item-'+i, item );
            }
            return item;
        });
    };

    CheckList.prototype.emitter = function( name, emitter ){
        var self = this;
        this.items.push( name );
        console.log(name, emitter);
        emitter.once('ready', function(){
            self.emit('item', name);
            return self.check(name);
        });
        return false;
    }

    CheckList.prototype.check = function( item ){
        this.items.splice( this.items.indexOf( item ), 1 );
        console.log('Item', item, 'Ready');
        if( this.items.length == 0 ){
            
            this.emit('ready');
            this.onready();
        }
        return;
    }

    CheckList.prototype.ready = null

    exports.CheckList = CheckList;

    return exports;

}, { extend: 'events' });