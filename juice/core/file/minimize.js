function maxRepeat(input) {
 var reg = /(?=((.+)(?:.*?\2)+))/g;
 var sub = ""; //somewhere to stick temp results
 var maxstr = ""; // our maximum length repeated string
 reg.lastIndex = 0; // because reg previously existed, we may need to reset this
 sub = reg.exec(input); // find the first repeated string
 while (!(sub == null)){
  if ((!(sub == null)) && (sub[2].length > maxstr.length)){
   maxstr = sub[2];
  }
  sub = reg.exec(input);
  reg.lastIndex++; // start searching from the next position
 }
 return maxstr;
}