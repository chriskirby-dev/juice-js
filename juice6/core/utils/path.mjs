import globals from './global.js'

class Path {

    static get sep(){
        if( globals.os == 'win' ) return '\\';
        else return '/';
    }

    static dir( path ){
        return filePath.substring(0, path.lastIndexOf( this.sep ) + 1 );
    }

    static split( path ){
        return path.split('');
    }

    static filename( path ){
        return path.split('\\').pop().split('/').pop();
    }

    static resolve( ...parts ){
        return parts.join( this.sep );
    }

    static ext( path ){
        return path.substring( path.lastIndexOf(".")+1 );
    }

    static script(){
        var scripts = document.getElementsByTagName("script");
        return scripts[ scripts.length - 1 ];
    }

}