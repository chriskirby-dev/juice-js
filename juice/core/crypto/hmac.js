define('crypto/hmac', ['crypto/sha256'], function(sha256){

  var hmac = function (key, Hash) {
    this._hash = Hash = Hash || sha256;
    var exKey = [[],[]], i,
        bs = Hash.prototype.blockSize / 32;
    this._baseHash = [new Hash(), new Hash()];
    if (key.length > bs) {
      key = Hash.hash(key);
    }
    
    for (i=0; i<bs; i++) {
      exKey[0][i] = key[i]^0x36363636;
      exKey[1][i] = key[i]^0x5C5C5C5C;
    }
    
    this._baseHash[0].update(exKey[0]);
    this._baseHash[1].update(exKey[1]);
    this._resultHash = new Hash(this._baseHash[0]);
  };
  /** HMAC with the specified hash function.  Also called encrypt since it's a prf.
   * @param {bitArray|String} data The data to mac.
   */
  hmac.prototype.encrypt = hmac.prototype.mac = function (data) {
    if (!this._updated) {
      this.update(data);
      return this.digest(data);
    } else {
      throw new Error("encrypt on already updated hmac called!");
    }
  };
  hmac.prototype.reset = function () {
    this._resultHash = new this._hash(this._baseHash[0]);
    this._updated = false;
  };
  hmac.prototype.update = function (data) {
    this._updated = true;
    this._resultHash.update(data);
  };
  hmac.prototype.digest = function () {
    var w = this._resultHash.finalize(), result = new (this._hash)(this._baseHash[1]).update(w).finalize();
    this.reset();
    return result;
  };

  return hmac;
});