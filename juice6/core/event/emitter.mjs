class EmitterEvent extends Array {

    constructor( name, emitter ){
        this.name = name;
        this.emitter = emitter;
    }

    add( fn, options ){
        this.push({ fn: fn, options: options });
    }

    remove( fn ){
        for( var i=0;i<this.length;i++ ){
            if( this[i].fn === fn ){
                this.splice( i, 1 );
                return true;
            }
        }
        return false;
    }

    emit( ...args ){
        for( var i=0;i<this.length;i++ ){
            this[i].fn.apply( this.emitter, args );
            if(this[i].options.once){
                this.splice( i, 1 );
                i--;
            }
        }
    }
}

class EventListeners {
    constructor( emitter ){
        this.emitter = emitter;
    }

    has( event ){
        return this.instances[event] ? true : false;
    }

    get( event ){
        return this.instances[event];
    }

    add( event, fn, options ){

        if( !this.has( event ) )
            this.instances[event] = new EmitterEvent( event );

        this.instances[event].add( fn, options );

    }

    remove( event, fn ){
        if( !fn ) delete this.instances[event];
        this.instances[event].remove( fn );
    }
}

class EventEmitter {

    constructor(){
        this.listeners = new EventListeners( this );
    }

    static bind(){

    }

    on( event, fn, options ){
        this.listeners.add( event, fn, options );
    }

    once( event, fn ){
        this.listeners.add( event, fn, { once: true } );
    }

    emit( event, ...args ){
        if( this.listeners.has(event) )
        this.listeners.get(event).emit( ...args );
    }


}

export { EventEmitter as default }