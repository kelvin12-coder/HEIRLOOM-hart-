/* ===== Real 3D models (Poly Haven, CC0): football, pistol, chandelier, day bed, fisherman hat ===== */
(function(){
'use strict';
if(typeof THREE==='undefined')return;
var T3=THREE,cache={},texL=new T3.TextureLoader();
var PROPS={ // roughness / metalness per model
  football:{r:.7,m:0},pistol:{r:.4,m:.75},chandelier:{r:.35,m:.6},daybed:{r:.8,m:0},fhat:{r:.9,m:0}
};
function parse(buf){
  var dv=new DataView(buf),hl=dv.getUint32(0,true),hdr=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl)).replace(/\0+$/,''));
  var o=4+hl,v=hdr.v,i=hdr.i;
  var P=new Float32Array(buf.slice(o,o+v*12));o+=v*12;
  var N=new Int8Array(buf.slice(o,o+v*3));o+=Math.ceil(v*3/4)*4;
  var U=new Float32Array(buf.slice(o,o+v*8));o+=v*8;
  var I=hdr.idx===32?new Uint32Array(buf.slice(o,o+i*4)):new Uint16Array(buf.slice(o,o+i*2));
  var g=new T3.BufferGeometry();
  g.setAttribute('position',new T3.BufferAttribute(P,3));
  g.setAttribute('normal',new T3.BufferAttribute(N,3,true));
  g.setAttribute('uv',new T3.BufferAttribute(U,2));
  g.setIndex(new T3.BufferAttribute(I,1));
  g.computeBoundingSphere();
  return {g:g,tex:hdr.tex,min:hdr.min,max:hdr.max};
}
function load(name,cb){
  var c=cache[name];
  if(c){if(c.mesh)cb(c);else c.q.push(cb);return}
  c=cache[name]={q:[cb]};
  fetch('assets/m/'+name+'.hm').then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(function(buf){
    var d=parse(buf),pr=PROPS[name]||{r:.7,m:0};
    var t=texL.load('assets/m/'+d.tex);
    if(T3.SRGBColorSpace)t.colorSpace=T3.SRGBColorSpace;else if(T3.sRGBEncoding)t.encoding=T3.sRGBEncoding;
    t.anisotropy=4;
    c.geo=d.g;c.mat=new T3.MeshStandardMaterial({map:t,roughness:pr.r,metalness:pr.m});
    c.min=d.min;c.max=d.max;c.mesh=1;
    var q=c.q;c.q=null;q.forEach(function(f){try{f(c)}catch(e){}});
  }).catch(function(){c.q=null;c.fail=1});
}
/* HM.add(parent,name,x,y,z,scale,rotY): puts the model in place now, fills it in when the file has loaded */
var HM=window.HM={
  load:load,
  make:function(name,scale,rotY){
    var g=new T3.Group();g.userData.hm=name;
    load(name,function(c){var m=new T3.Mesh(c.geo,c.mat);m.castShadow=true;m.receiveShadow=false;g.add(m)});
    if(scale)g.scale.setScalar(scale);if(rotY)g.rotation.y=rotY;return g},
  add:function(parent,name,x,y,z,scale,rotY){var g=HM.make(name,scale,rotY);g.position.set(x||0,y||0,z||0);parent.add(g);return g}
};
})();
