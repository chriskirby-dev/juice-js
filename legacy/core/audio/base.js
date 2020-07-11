define('audio', [ ], function( ){

    var exports = this.exports;
    var app = this.app;   
    
    window.audioContext = new ( window.AudioContext || window.webkitAudioContext )();
    var audioContext = window.audioContext;

    function makeDistortionCurve(amount) {
        var k = typeof amount === 'number' ? amount : 50,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
        for ( ; i < n_samples; ++i ) {
            x = i * 2 / n_samples - 1;
            curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
    };

    var Oscillator = function( freq ) {

        var self = this;
        self.freq = freq;
        self.length = 0.3;

        self.play = function( time ){

            time = time || 0.3;
            var osc = audioContext.createOscillator();
            var distortion = audioContext.createWaveShaper();
            osc.frequency.value = self.freq;
            osc.type = 'sine';

            var startTime = audioContext.currentTime;
            var endTime = audioContext.currentTime+time;

            osc.start( startTime );
            osc.stop( endTime );

            var gain = audioContext.createGain();
            gain.gain.setValueAtTime(1, startTime );
            gain.gain.setValueAtTime(1, startTime+( time*0.3) );
            gain.gain.setValueAtTime(0, endTime );
            osc.connect( gain );
            gain.connect( distortion );
            distortion.connect( audioContext.destination );

            distortion.curve = makeDistortionCurve( time * 100 );
            
        };
    
    };

    exports.Oscillator = Oscillator;

    var AudioFile = function( path ){
        var self = this;
        self.path = path;
        self.file = new Audio( path ); // buffers automatically when created
        self.play = function(){
            console.log('Play', path);
            self.file.play();
        }
    }

    exports.File = AudioFile;

    return exports;

});