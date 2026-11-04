/* ===== Heirloom model packs (.vc): small vertex-coloured models made from the real 3D files (trees, cars, boats, beds...) ===== */
(function(){
'use strict';
if(typeof THREE==='undefined')return;
var T=THREE,P={};
function lin(b){return Math.pow(b/255,2.2)}
var LUT=new Float32Array(256);for(var i=0;i<256;i++)LUT[i]=lin(i);
function parse(buf){var dv=new DataView(buf),hl=dv.getUint32(0,true),hdr=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base=4+hl,out={};
  hdr.models.forEach(function(m){var o={meta:m.meta,parts:{}};
    for(var t in m.parts){var p=m.parts[t],q=new Int16Array(buf.slice(base+p.pos,base+p.pos+p.v*6)),pos=new Float32Array(p.v*3);
      for(var i=0;i<q.length;i++){var k=i%3;pos[i]=(q[i]+32767)/65534*p.ex[k]+p.mn[k]}
      var n8=new Int8Array(buf.slice(base+p.nrm,base+p.nrm+p.v*3)),nrm=new Float32Array(p.v*3);for(i=0;i<n8.length;i++)nrm[i]=n8[i]/127;
      var c8=new Uint8Array(buf.slice(base+p.col,base+p.col+p.v*3)),col=new Float32Array(p.v*3);for(i=0;i<c8.length;i++)col[i]=LUT[c8[i]];
      var idx=new Uint16Array(buf.slice(base+p.idx,base+p.idx+p.i*2));
      var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nrm,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(new T.BufferAttribute(idx,1));g.computeBoundingSphere();g.computeBoundingBox();
      o.parts[t]=g}
    out[m.id]=o});return out}
function load(name){return P[name]||(P[name]=fetch('assets/m/'+name+'.vc').then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(parse).catch(function(){return null}))}
window.VC={load:load,all:{}};
})();
