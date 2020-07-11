class Global {

    static defined={};

    static get os(){
        if( this.defined.os ) return this.defined.os;
        if( process && process.platform ){
            if(/^win/.test(process.platform))     { this.defined.os = 'win'; }
            else if(process.platform === 'darwin'){ this.defined.os = 'osx'; }
            else if(process.platform === 'linux') { this.defined.os = 'linux'; }
        }else{
            var appVer = navigator.appVersion;
            if      (appVer.indexOf("Win")!=-1)   this.defined.os = 'win';
            else if (appVer.indexOf("Mac")!=-1)   this.defined.os = 'osx';
            else if (appVer.indexOf("X11")!=-1)   this.defined.os = 'x11';
            else if (appVer.indexOf("Linux")!=-1) this.defined.os = 'linux';
        }
    }

}

export { Global as default }