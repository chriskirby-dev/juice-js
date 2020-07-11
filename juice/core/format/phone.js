define('format/phone', [], () => {

    const { app, exports } = this;

    const COUNTRYS = {
        "US": {
            country_code: "1",
            format: [3,3,4]
        }
    };

    var strip = function(){

    }

    exports.uri = function(){

    }


    exports.use = function( country, area, number ){
        let digits = source.replace(/[^0-9]/, '');
    }

    exports.parse = function( source ){
        let digits = source.replace(/[^0-9]/, '');
        
    }

    return exports;

});