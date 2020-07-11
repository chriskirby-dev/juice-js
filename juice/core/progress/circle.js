define('progress/circle', ['dom/css','progress'], function( css, preloader ){
	
	var exports = Object.create( preloader );
	css.use('progress');
	
	css.append({
		'.dialog .inner': {
			display: 'block',
			opacity: 1,
			position: 'relative',
			transition: 'opacity 0.35s ease'
		}
		'.timer.circle':{
			position:'relative',
			width:'100%',
			borderRadius:'50%',
			border:'1px solid #000',
		},
		'.timer.circle:after':{
			content:'""',
			display:'block',
			width:'100%',
			paddingBottom:'100%'
		},
		'.timer.circle > div':{
			position:'absolute',
			top:0,
			width:'50%',
			height:'100%',
			overflow:'hidden'
		},
		'.timer.circle div.half-1':{
			left:0
		},
		'.timer.circle div.half-2':{
			left:'50%'
		},
		'.timer.circle div > div':{
			top:0
		},
		'.timer.circle div.half-1 > .half-circle'{
			transformOrigin:'center right',
			transform:'rotate(0deg)'
		},
		'.timer.circle div.half-2 > .half-circle'{
			transformOrigin:'center right',
			transform:'rotate(180deg)',
			left:'-100%',
			transition:'transform 20s ease-out 20s'
		},
		'.timer.circle.running div.half-1 > .half-circle'{
			transform:'rotate(-180deg)'
		},
		'.timer.circle.running div.half-2 > .half-circle'{
			transform:'rotate(0deg)'
		},
		'.half-circle'{
			overflow:'hidden',
			position:'absolute',
			width:'100%',
			height:'100%',
			transition:'transform 20s ease-in'
		},
		'.half-circle:before'{
			content:"",
			position:'absolute',
			width:'200%',
			height:'100%',
			borderRadius:'50%',
			background:'#212121'
			left:0
		}
	});
	
	exports.element = null;
	exports.circleLeft = null;
	exports.circleRight = null;
	exports.rotation = { left: 0, right: 0 };
	exports.currentSide = 0;
	exports.onProgres = function( percent ){	
		percent = percent.toFixed(2);	
		var prog, start, degrees;
		var target;
		
		if(percent < .5){
			//O to 50
			start = -180;
			degrees = start+(180*percent);
			exports.rotateLeft.style.transform = 'rotate('+(degrees.toFixed(2))+'deg)';
		}else{
			if(exports.currentSide == 0){
				exports.currentSide=1;
				exports.rotateLeft.style.transform = 'rotate(0deg)';
			}
			//50 to 100
			start = 180;
			prog = (percent-.5)/.5;
			degrees = start+(180*(prog));
			exports.rotateRight.style.transform = 'rotate('+(degrees.toFixed(2))+'deg)';
		}
		if(percent >= 1){
			setTimeout(function(){
			exports.element.$.class('complete', true);
			}, 500);
		}
	};
	
	exports.bind = function( element ){
		var circle_r = element.$.find('.circle_r');
		exports.rotateLeft = element.$.find('.circle_l .loader-rotate');
		exports.rotateRight = circle_r.$.find('.loader-rotate');
		exports.element = element;
	};
	
	return exports;

});