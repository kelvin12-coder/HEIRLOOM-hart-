/* ===== Heirloom GLB loader: small, no dependencies (reads .glb files incl. skinned people + animation) ===== */
(function(){
'use strict';
if(typeof THREE==='undefined')return;
var T=THREE,cache={};
var CT={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function parse(buf){var dv=new DataView(buf),jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))),off=20+jl,bl=dv.getUint32(off,true);
  return{json:json,bin:buf.slice(off+8,off+8+bl),geo:{},mat:{},tex:{}}}
function acc(G,i){var a=G.json.accessors[i],bv=G.json.bufferViews[a.bufferView],C=CT[a.componentType],n=NC[a.type],es=C.BYTES_PER_ELEMENT*n,st=bv.byteStride||es,off=(bv.byteOffset||0)+(a.byteOffset||0),out=new C(a.count*n);
  if(st===es){out.set(new C(G.bin.slice(off,off+a.count*es)))}
  else{var src=new Uint8Array(G.bin),dst=new Uint8Array(out.buffer);for(var e=0;e<a.count;e++)dst.set(src.subarray(off+e*st,off+e*st+es),e*es)}
  return{d:out,n:n,norm:!!a.normalized,count:a.count}}
function texture(G,i){if(G.tex[i])return G.tex[i];var im=G.json.images[G.json.textures[i].source],bv=G.json.bufferViews[im.bufferView],
  blob=new Blob([G.bin.slice(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength)],{type:im.mimeType||'image/png'}),t=new T.TextureLoader().load(URL.createObjectURL(blob));
  t.flipY=false;if(T.SRGBColorSpace)t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;t.wrapS=t.wrapT=T.RepeatWrapping;G.tex[i]=t;return t}
function geometry(G,mi,pi){var k=mi+'_'+pi;if(G.geo[k])return G.geo[k];var p=G.json.meshes[mi].primitives[pi],at=p.attributes,g=new T.BufferGeometry(),a;
  a=acc(G,at.POSITION);g.setAttribute('position',new T.BufferAttribute(a.d,3));
  if(at.NORMAL){a=acc(G,at.NORMAL);g.setAttribute('normal',new T.BufferAttribute(a.d,3))}
  if(at.TEXCOORD_0){a=acc(G,at.TEXCOORD_0);g.setAttribute('uv',new T.BufferAttribute(a.d,2))}
  if(at.JOINTS_0){a=acc(G,at.JOINTS_0);g.setAttribute('skinIndex',new T.BufferAttribute(new Uint16Array(a.d),4))}
  if(at.WEIGHTS_0){a=acc(G,at.WEIGHTS_0);var w=a.d;if(a.norm){var m=w instanceof Uint8Array?255:65535,f=new Float32Array(w.length);for(var i=0;i<w.length;i++)f[i]=w[i]/m;w=f}g.setAttribute('skinWeight',new T.BufferAttribute(w,4))}
  if(p.indices!==undefined){a=acc(G,p.indices);g.setIndex(new T.BufferAttribute(a.d.constructor===Uint8Array?new Uint16Array(a.d):a.d,1))}
  if(!at.NORMAL)g.computeVertexNormals();
  g.computeBoundingSphere();g.computeBoundingBox();g.dispose=function(){};G.geo[k]=g;return g}
var GRAD=(function(){var c=document.createElement('canvas');c.width=4;c.height=1;var x=c.getContext('2d');['#7a7a86','#b4b4c0','#e6e6ee','#ffffff'].forEach(function(s,i){x.fillStyle=s;x.fillRect(i,0,1,1)});var t=new T.CanvasTexture(c);t.minFilter=t.magFilter=T.NearestFilter;return t})();
/* material for one glTF material; colour overrides {name:'#hex'} and a "lit" flag (standard material for metal guns) */
function material(G,mi,over,lit){var m=G.json.materials[mi]||{},pb=m.pbrMetallicRoughness||{},nm=m.name||('m'+mi),hex=over&&over[nm],key=mi+'|'+(hex||'')+'|'+(lit?1:0);if(G.mat[key])return G.mat[key];
  var o={side:T.DoubleSide};if(hex)o.color=new T.Color(hex);else{var c=pb.baseColorFactor||[1,1,1,1];o.color=new T.Color().setRGB(c[0],c[1],c[2])}
  if(pb.baseColorTexture){o.map=texture(G,pb.baseColorTexture.index);o.color=new T.Color(0xffffff)}
  var r;if(lit){o.roughness=pb.roughnessFactor!==undefined?Math.max(.35,pb.roughnessFactor):.5;o.metalness=Math.max(.35,pb.metallicFactor||0);r=new T.MeshStandardMaterial(o)}
  else{o.gradientMap=GRAD;r=new T.MeshToonMaterial(o)}
  r.name=nm;G.mat[key]=r;return r}
/* instance: a fresh copy of the node tree (shared geometry/materials), ready to animate */
function instance(G,opt){opt=opt||{};var J=G.json,nodes=[],byName={},isBone={};
  (J.skins||[]).forEach(function(s){s.joints.forEach(function(j){isBone[j]=1})});
  J.nodes.forEach(function(n,i){var o=isBone[i]?new T.Bone():new T.Group();o.name='n'+i;o.userData.nm=n.name;
    if(n.matrix){var mx=new T.Matrix4().fromArray(n.matrix);mx.decompose(o.position,o.quaternion,o.scale)}
    else{if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale)}
    nodes.push(o);if(n.name)byName[n.name]=o});
  J.nodes.forEach(function(n,i){(n.children||[]).forEach(function(c){nodes[i].add(nodes[c])})});
  var skels=[],skinned=[],meshes=[],pend=[];
  (J.skins||[]).forEach(function(s,si){skels[si]=null});
  J.nodes.forEach(function(n,i){if(n.mesh===undefined)return;var mesh=J.meshes[n.mesh];
    mesh.primitives.forEach(function(p,pi){var geo=geometry(G,n.mesh,pi),mat=material(G,p.material,opt.over,opt.lit),m;
      if(n.skin!==undefined){m=new T.SkinnedMesh(geo,mat);skinned.push({m:m,skin:n.skin})}else m=new T.Mesh(geo,mat);
      m.frustumCulled=false;m.name=(mesh.name||'')+'#'+pi;m.userData.mi=p.material;m.userData.mn=(J.materials[p.material]||{}).name;m.castShadow=!!opt.shadow;if(n.skin!==undefined)pend.push(m);else nodes[i].add(m);meshes.push(m)})});
  var root=new T.Group();(J.scenes[J.scene||0].nodes).forEach(function(i){root.add(nodes[i])});pend.forEach(function(m){root.add(m)});
  root.updateMatrixWorld(true);
  skinned.forEach(function(sk){var s=J.skins[sk.skin];if(!skels[sk.skin]){var bones=s.joints.map(function(j){return nodes[j]}),ib=acc(G,s.inverseBindMatrices).d,inv=[];
      for(var i=0;i<bones.length;i++)inv.push(new T.Matrix4().fromArray(ib,i*16));skels[sk.skin]=new T.Skeleton(bones,inv)}
    sk.m.bind(skels[sk.skin],new T.Matrix4())});
  return{root:root,by:byName,meshes:meshes,clips:clips(G)}}
function clips(G){if(G.clips)return G.clips;var out={};(G.json.animations||[]).forEach(function(a){var tr=[];
    a.channels.forEach(function(ch){var s=a.samplers[ch.sampler],pa=ch.target.path;if(pa==='scale'||ch.target.node===undefined)return;var t=acc(G,s.input).d,v=acc(G,s.output).d,nm='n'+ch.target.node+'.'+(pa==='translation'?'position':pa==='rotation'?'quaternion':'scale');
      if(s.interpolation==='CUBICSPLINE'){var n=pa==='rotation'?4:3,w=new Float32Array(t.length*n);for(var i=0;i<t.length;i++)for(var k=0;k<n;k++)w[i*n+k]=v[(i*3+1)*n+k];v=w}
      tr.push(pa==='rotation'?new T.QuaternionKeyframeTrack(nm,t,v):new T.VectorKeyframeTrack(nm,t,v))});
    var short=a.name.split('|').pop().replace(/^Man_/,'');out[short]=new T.AnimationClip(short,-1,tr)});
  G.clips=out;return out}
function load(name,cb){var c=cache[name];if(c){if(c.G)cb(c.G);else if(!c.fail)c.q.push(cb);return}
  c=cache[name]={q:[cb]};
  fetch('assets/m/'+name+'.glb').then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(function(b){c.G=parse(b);var q=c.q;c.q=null;q.forEach(function(f){try{f(c.G)}catch(e){console.warn(e)}})}).catch(function(){c.fail=1;c.q=null})}
window.GLB={load:load,instance:instance,get:function(n){return cache[n]&&cache[n].G},GRAD:GRAD};
})();
