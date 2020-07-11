define('binary/util', function(){
	var exports = this.exports;
	
	var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
	var binCode = ['0000', "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"];
	
	exports.byteToHex = function byteToHex(b) {
	  return ""+hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f]+"";
	};
	
	exports.binaryValue = function byteToHex(b) {
	  return binCode.indexOf(b);
	};

	exports.hex2ASCII = function hex2ASCII(hex){ 
		var str = ''; 
		for (var i = 0; i < hex.length; i += 2) 
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16)); 
		return str;
	};
	
	exports.utfToASCII = function decodeUTF16LE( binaryStr ) {
	    var cp = [];
	    for( var i = 0; i < binaryStr.length; i+=2) {
	        cp.push( 
	             binaryStr.charCodeAt(i) |
	            ( binaryStr.charCodeAt(i+1) << 8 )
	        );
	    }
	    return String.fromCharCode.apply( String, cp );
	};
	
	var maps = {
		toArray: function( item ){
			return  item;
		},
		toHex: function( item ){
			return ((item < 16) ? "0":"") + item.toString(16).toUpperCase();
		},
		toBits: function( item ){
			var bits = [];
			for (var i = 7; i >= 0; i--) {
				bits.push( item & (1 << i) ? 1 : 0 );
			}
			return bits.slice(0,4).join('')+""+bits.slice(4).join('');
		},
		toBitString: function( item ){
			
		}
	};
	
	exports.map = maps;
	
	exports.bytesToHex = function bytesToHex(b) {
		var hex = new Uint8Array(b.length);
		var bytes;
		if(typeof b == 'string'){
			bytes = b.split('');
		}else{
			bytes = Array.prototype.slice.call( b );
		}		
	    return bytes.map( maps.toHex );
	};
	
	exports.toArray = function byteToBit( b ) {
		return Array.prototype.slice.call( b );
	};
	
	exports.byteToBits = function byteToBit( b ) {
		var bits = [];
		for (var i = 7; i >= 0; i--) {
		  bits.push( b & (1 << i) ? 1 : 0 );
		   // do something with the bit (push to an array if you want a sequence)
		}
		return bits;
	};
	
	exports.bytesToBits = function bytesToHex(b) {
		var bits = [];
		for (var i = 0; i < b.length; i++) {
		 	bits.concat( exports.byteToBits( b[i] ) );
		}
		return bits;
	};
	
	exports.stringToUnicodeVals= function( str ){
		var codes = new Uint8Array(str.length);
		for(var i=0;i<str.length;i++) 
		codes[i] = str.charCodeAt(i);		
		return codes;
	};
	
	exports.bitCount = function bitw(n){
		var str = "";
		for(var i=0;i<n;i++) str += "1";
		return parseInt(str, 2);
	};
	
	return exports;
});
