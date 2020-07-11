console.log("Juice ES6");
import path from './ES6/utils/path.js'
import EventEmitter from './ES6/event/emitter.mjs';


const script = path.script();
console.log(script);

class JuiceJS extends EventEmitter {

    dir = path.dir( script );

    module( mpath, dir ){
        const parts = [ dir || this.dir, mpath ];
        if( path.ext( mpath ) === undefined )
        const full = path.resolve( dir || this.dir, mpath, '.mjs' );
    }

    require( ...mpaths ){

    }

    startup(){

    }

}

const juice = new JuiceJS();
window.juice = juice;

export { juice as default }; 