define('extender/range', function(){

    const { exports } = this;

    Object.defineProperty( exports, 'min', {
        get: () => exports.defined.min,
        set: ( min ) => {
            exports.defined.min = min;
        }
    });
    

    Object.defineProperty( exports, 'max', {
        get: () => exports.defined.max,
        set: ( max ) => {
            exports.defined.max = max;
        }
    });

    Object.defineProperty( exports, 'span', {
        get: () => exports.defined.max - exports.defined.min,
        set: () => false
    });

    return exports;

}, {extend: 'extend/basic' });