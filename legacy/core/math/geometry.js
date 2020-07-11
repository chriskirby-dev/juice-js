define('math/geometry', function MathBase(){
	
	var exports = this.exports;


	
	
	exports.aspect = function( r ){
		return Number(r[0])/Number(r[1]);
	}
	
	exports.fit = function( r, c ){
		var ra = geom.aspect( r );
		var ca = geom.aspect( c );
		var ret = [];
		if( ra > ca ){
			ret[0] = c[0];
			ret[1] = r[1] * ( ret[0] / ra );
		}else{
			ret[0] = c[1] * ra;
			ret[1] = c[1];
		}
		return ret;
	}
	
	
	
	return exports;
});