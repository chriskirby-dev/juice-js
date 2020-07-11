define('price-chart/rate-marker', [], function(){

    var app = this.app;
    var exports = this.exports;
    var chart = this.parent;

    var wrapper = document.querySelector('#testing-chart .gutter');
    var wrapperRect = wrapper.getBoundingClientRect();

    var RateMarker = function( name, id, start ){
        var self = this;
        self.name = name;
        self.pressed = false;
        self.y = 0;
        self.pressY = null;
        var changeY = null;

        if( start == 'top' ){
            $('#'+id).css('top', 0);
        }else if( start == 'bottom' ){
            $('#'+id).css('bottom', 0);
        }


        var onMove = function( e ){
            if(self.pressed){
                changeY = self.pressY - e.pageY;
                var y = self.y + changeY;
                $('#'+id).css('transform',' translateY('+(-y)+'px)' );
            }
        };


        $('#'+id).on('mousedown', function( e ){
            self.pressed = true;
            self.pressY = e.pageY;

            $('body').on('mouseup', function(){
                self.pressed = false;
                self.y += changeY;
                var y = self.y;
                if( start == 'bottom' ){
                    y = wrapperRect.height + self.y;
                }
                exports.emit('marker-set', self.name, y );
                $(window).unbind('mousemove', onMove );
                return false;
            });


            $(window).on('mousemove', onMove );

            

            return false;
        });

        

    };

    RateMarker.prototype.down = function(){
        var self = this;

    };

    RateMarker.prototype.move = function(){
        var self = this;

    };

    //'close-sell-marker'

    new RateMarker( 'close-buy', 'close-buy-marker', 'bottom');
    new RateMarker( 'close-sell', 'close-sell-marker', 'top');


    

    return exports;

}, { extend: 'events' });