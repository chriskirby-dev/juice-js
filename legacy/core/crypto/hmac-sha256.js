define('crypto/hmac-sha256', ['crypto/hmac','crypto/hex', 'crypto/bitArray', 'crypto/utf8String'], function( HMAC, HEX, bitArray, utf8String ){
  
  const { exports } = this;

  exports.create = function( sharedSecret, string ){
    var hmac = new HMAC( utf8String.toBits(sharedSecret) );
    return  HEX.fromBits( hmac.encrypt( string ) );
  }

  return exports;
});