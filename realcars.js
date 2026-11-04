/* ===== Heirloom real models: loads the packed trees / cars / boats / props and swaps them into the city =====
   Trees: variants per tree kind (palms, oaks, sakura). Cars: real bodies with the car's own paint colour; wheels still spin and steer. */
(function(){
'use strict';
if(typeof THREE==='undefined'||!window.VC){try{window.__preDone&&window.__preDone()}catch(e){}return}
var T=THREE,CARS_PACK=null,TREES=null,PROPS=null;
function merge(list){ /* list of {g:BufferGeometry, m:Matrix4|null} */
  var P=[],N=[],C=[],I=[],off=0,v=new T.Vector3(),nm=new T.Matrix3();
  list.forEach(function(it){var g=it.g,pa=g.attributes.position,na=g.attributes.normal,ca=g.attributes.color,ix=g.index;if(!pa)return;if(it.m)nm.getNormalMatrix(it.m);
    for(var i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);if(it.m)v.applyMatrix4(it.m);P.push(v.x,v.y,v.z);
      v.fromBufferAttribute(na,i);if(it.m)v.applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z);
      if(ca)C.push(ca.getX(i),ca.getY(i),ca.getZ(i));else C.push(1,1,1)}
    if(ix){for(i=0;i<ix.count;i++)I.push(off+ix.getX(i))}else for(i=0;i<pa.count;i++)I.push(off+i);
    off+=pa.count});
  var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(P.length/3*2),2));
  g.setIndex(I);g.computeBoundingSphere();g.computeBoundingBox();return g}
window.VCMERGE=merge;
var MAP={police:'police',taxi:'sedan',sedan:'sedan',camry:'sedan',tesla:'sedan',rolls:'sedan',suv:'suv',range:'suv',gwagon:'jeep',hilux:'truck',
  sports:'sports',ferrari:'sports',peacock:'sports',skyfly:'sports',porsche:'sports',mclaren:'sports',huracan:'sports',
  hyper:'hyper',chiron:'hyper',aventador:'hyper',koenig:'hyper',mustang:'convertible',lowrider:'convertible'};
var STATIC={convertible:1,hyper:1,jeep:1,truck:1};
window.REALCAR=function(name,out,bs){
  if(!CARS_PACK)return;var id=MAP[name],M=id&&CARS_PACK[id];if(!M)return;var P=M.parts,body=[];
  ['paint','trim'].forEach(function(t){if(P[t])body.push({g:P[t]})});if(!body.length)return;
  out.body=merge(body);
  out.glass=P.glass?merge([{g:P.glass}]):new T.BufferGeometry();
  out.head=P.head?merge([{g:P.head}]):new T.BufferGeometry();
  out.tail=P.tail?merge([{g:P.tail}]):new T.BufferGeometry();
  var sz=M.meta.size;out.front=sz[2]/2;out.rh=Math.max(.9,sz[1]-.12);
  var W=M.meta.wheels;
  if(W&&W.rf&&W.lf&&W.rb&&W.lb){var wx=(Math.abs(W.rf[0])+Math.abs(W.lf[0])+Math.abs(W.rb[0])+Math.abs(W.lb[0]))/4,wzf=(W.rf[2]+W.lf[2])/2,wzb=(W.rb[2]+W.lb[2])/2,wr=(W.rf[3]+W.lf[3]+W.rb[3]+W.lb[3])/4;
    out.w=wx+.1;out.wz=[wzf,wzb];out.wr2=wr;out.wsc=wr/bs.wr;
    var pl=[{g:out.body}];[wzf,wzb].forEach(function(z){[-1,1].forEach(function(s){pl.push({g:out.wheel,m:new T.Matrix4().compose(new T.Vector3(s*wx,wr,z),new T.Quaternion(),new T.Vector3(out.wsc,out.wsc,out.wsc))})})});
    out.parked=merge(pl)}
  else{ /* wheels are part of the body: keep them still */
    out.wheel=new T.BufferGeometry();out.wheel.setAttribute('position',new T.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));out.wheel.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));out.wheel.setAttribute('color',new T.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));
    out.parked=out.body}
  out.real=true};
window.TREEV={};
function trees(M){var by=function(a){return a.map(function(k){var m=M[k];if(!m)return null;var l=[];for(var t in m.parts)l.push({g:m.parts[t]});return merge(l)}).filter(Boolean)};
  TREEV.palm=by(['palm']);TREEV.oak=by(['oak','birch1','birch2','birch3','birch4','birch5']);TREEV.sakura=by(['sakura']);
  window.TREEX={pines:by(['pines'])[0],dead:by(['dead1','dead2','dead3','dead4','dead5']),bush:by(['bush1','bush2','bush3'])}}
Promise.all([VC.load('trees'),VC.load('cars'),VC.load('props')]).then(function(r){
  TREES=r[0];CARS_PACK=r[1];PROPS=r[2];if(TREES)trees(TREES);window.PROPV=PROPS;window.__realAssets=true}).catch(function(e){console.warn('assets',e)}).then(function(){try{window.__preDone()}catch(e){}});
})();
