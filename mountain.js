/* ===== Heirloom mountains: a road that climbs the eastern hills, speed bumps, pines, rocks, a rest stop and a summit prize ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof CITY==='undefined'||typeof groundH==='undefined'||typeof terrMeshH==='undefined')return;
var WP=[[1250,-30],[1470,-30],[1640,-120],[1760,-60],[1900,-250],[2000,-420],[2100,-380],[2160,-500],[2214,-540]];
var BUMPS=[],bumpBox=null,prevG=groundH;
// speed bumps: a strip of 18 rows on the first straight stretch (x 1330..1450), so cars bounce
(function(){var x0=1330,rows=18,gap=6.5,x1=x0+rows*gap;for(var r=0;r<rows;r++)for(var k=-1;k<=1;k++)BUMPS.push([x0+r*gap,-30+k*3.4]);bumpBox=[x0-5,-30-9,x1+5,-30+9]})();
groundH=function(x,z){var h=prevG(x,z);if(bumpBox&&x>bumpBox[0]&&x<bumpBox[2]&&z>bumpBox[1]&&z<bumpBox[3]){var b=0;for(var i=0;i<BUMPS.length;i++){var dx=x-BUMPS[i][0],dz=z-BUMPS[i][1];if(dx>-2.6&&dx<2.6&&dz>-2.4&&dz<2.4){var q=Math.cos(dx/2.6*1.5708);q*=q;var qz=Math.cos(dz/2.4*1.5708);b=Math.max(b,.34*q*qz)}}h+=b}return h};
var rs=7;function rnd(){rs=(rs*16807)%2147483647;return(rs-1)/2147483646}
function build(){
  var G=new THREE.Group();G.name='mountain';
  var curve=new THREE.CatmullRomCurve3(WP.map(function(p){return new THREE.Vector3(p[0],0,p[1])}),false,'catmullrom',.4);
  var pts=curve.getSpacedPoints(190),W=5.4,rl=[],P=[],UV=[],IDX=[],yl=[],P2=[],IDX2=[];
  function ribbon(off,w,y,pos,idx){var base=pos.length/3;for(var i=0;i<pts.length;i++){var a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
      [-1,1].forEach(function(s){var x=pts[i].x+nx*(off+s*w),z=pts[i].z+nz*(off+s*w);pos.push(x,groundH(x,z)+y,z)});
      if(i<pts.length-1){var k=base+i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}}}
  ribbon(0,W,.14,P,IDX);var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(IDX);g.computeVertexNormals();
  var road=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x6a6c72,roughness:.92,map:(window.SKIN?SKIN.tex('worn'):null),side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));road.receiveShadow=true;G.add(road);
  // edge lines + dashed centre
  [-1,1].forEach(function(s){var pp=[],ii=[];ribbon(s*(W-.5),.12,.2,pp,ii);var gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));gg.setIndex(ii);gg.computeVertexNormals();G.add(new THREE.Mesh(gg,new THREE.MeshBasicMaterial({color:0xf2f2f2,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})))});
  var pp2=[],ii2=[];(function(){var base=0;for(var i=0;i<pts.length-1;i+=1){if(i%4>1)continue;var a=pts[i],b=pts[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,nx=-dz/l*.14,nz=dx/l*.14;
    var q=[[a.x-nx,a.z-nz],[a.x+nx,a.z+nz],[b.x-nx,b.z-nz],[b.x+nx,b.z+nz]];q.forEach(function(c){pp2.push(c[0],groundH(c[0],c[1])+.2,c[1])});ii2.push(base,base+2,base+1,base+1,base+2,base+3);base+=4}})();
  var g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(pp2,3));g2.setIndex(ii2);g2.computeVertexNormals();G.add(new THREE.Mesh(g2,new THREE.MeshBasicMaterial({color:0xf0cf4a,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4})));
  // speed bump visuals (yellow/black humps)
  var bm=new THREE.MeshStandardMaterial({color:0x2a2a2e,roughness:.8}),by=new THREE.MeshStandardMaterial({color:0xf0cf4a,roughness:.8});
  for(var r=0;r<18;r++){var bx=1330+r*6.5;for(var s=0;s<7;s++){var seg=new THREE.Mesh(new THREE.BoxGeometry(5.2,.12,1.7),s%2?bm:by);seg.position.set(bx,groundH(bx,-30)+.3,-30-5.1+s*1.7);G.add(seg)}}
  var sg=(function(){var c=document.createElement('canvas');c.width=512;c.height=128;var x=c.getContext('2d');x.fillStyle='#d9322f';x.fillRect(0,0,512,128);x.fillStyle='#fff';x.font='800 54px system-ui';x.textAlign='center';x.fillText('⚠ 18 SPEED BUMPS',256,80);var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
  var sb=new THREE.Mesh(new THREE.PlaneGeometry(6,1.5),new THREE.MeshBasicMaterial({map:sg,side:THREE.DoubleSide}));sb.position.set(1300,groundH(1300,-24)+3.6,-24);sb.rotation.y=Math.PI/2;G.add(sb);
  var pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3.6,6),new THREE.MeshStandardMaterial({color:0x666666}));pole.position.set(1300,groundH(1300,-24)+1.8,-24);G.add(pole);
  // guard posts along the outer edge
  var post=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.07,.9,5),new THREE.MeshStandardMaterial({color:0xf2f2f2}),pts.length);var m4=new THREE.Matrix4(),n=0;
  for(var i=2;i<pts.length-2;i+=2){var a=pts[i-1],b=pts[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,x=pts[i].x+(-dz/l)*(W+1.1),z=pts[i].z+(dx/l)*(W+1.1);m4.makeTranslation(x,groundH(x,z)+.45,z);post.setMatrixAt(n++,m4)}post.count=n;G.add(post);
  // pines + rocks scattered on the slopes (away from the road)
  function nearRoad(x,z){for(var i=0;i<pts.length;i+=3){if(Math.abs(pts[i].x-x)<14&&Math.abs(pts[i].z-z)<14)return true}return false}
  var T=900,leaf=new THREE.InstancedMesh(new THREE.ConeGeometry(1,3.2,7),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),T),leaf2=new THREE.InstancedMesh(new THREE.ConeGeometry(.78,2.4,7),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),T),trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.24,1.6,5),new THREE.MeshStandardMaterial({color:0x5a3a22}),T);
  var c=new THREE.Color(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),tn=0,tries=0;
  while(tn<T&&tries<12000){tries++;var x,z;if(tries%3){var pr=pts[Math.floor(rnd()*pts.length)];x=pr.x+(rnd()-.5)*260;z=pr.z+(rnd()-.5)*260}else{x=1262+rnd()*1300;z=-1000+rnd()*2000}var h=groundH(x,z);if(h<3||h>92||nearRoad(x,z)||(x>1330&&x<1450&&Math.abs(z+30)<16))continue;
    var s=.9+rnd()*1.5;ps.set(x,h+.8*s,z);sc.set(s,s,s);m4.compose(ps,q,sc);trunk.setMatrixAt(tn,m4);ps.set(x,h+2.3*s,z);m4.compose(ps,q,sc);leaf.setMatrixAt(tn,m4);ps.set(x,h+3.9*s,z);m4.compose(ps,q,sc);leaf2.setMatrixAt(tn,m4);
    c.setHSL(.33+rnd()*.05,.45+rnd()*.15,.2+rnd()*.1);leaf.setColorAt(tn,c);leaf2.setColorAt(tn,c);tn++}
  leaf.count=leaf2.count=trunk.count=tn;[leaf,leaf2,trunk].forEach(function(o){o.castShadow=false;G.add(o)});
  /* real pine groves + dead trees (from the Quaternius models) replace the plain cone trees */
  if(window.TREEX&&TREEX.pines){leaf.count=leaf2.count=trunk.count=0;var PM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide}),Y=new THREE.Vector3(0,1,0);
    function scatter(geo,N,hmin,hmax,smin,smr,flat){var im=new THREE.InstancedMesh(geo,PM,N),n=0,t=0;
      while(n<N&&t<30000){t++;var x,z;if(t%3){var pr=pts[Math.floor(rnd()*pts.length)];x=pr.x+(rnd()-.5)*260;z=pr.z+(rnd()-.5)*260}else{x=1262+rnd()*1300;z=-1000+rnd()*2000}
        var h=groundH(x,z);if(h<hmin||h>hmax||nearRoad(x,z)||(x>1330&&x<1450&&Math.abs(z+30)<16))continue;
        var sv=smin+rnd()*smr;q.setFromAxisAngle(Y,rnd()*6.28);ps.set(x,h-.12,z);sc.set(sv,sv*(.9+rnd()*.3),sv);m4.compose(ps,q,sc);im.setMatrixAt(n,m4);n++}
      im.count=n;im.instanceMatrix.needsUpdate=true;im.castShadow=false;G.add(im);return im}
    scatter(TREEX.pines,140,3,70,.8,.6);
    (TREEX.dead||[]).forEach(function(g){scatter(g,12,55,200,.9,.5)})}
  var R=140,rock=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0xb5b0a4,roughness:1,map:(window.SKIN?SKIN.tex('rock2'):null)}),R),rn=0;tries=0;
  while(rn<R&&tries<4000){tries++;var rx=1262+rnd()*1500,rz=-1000+rnd()*2000,rh=groundH(rx,rz);if(rh<4||nearRoad(rx,rz))continue;var rsz=.8+rnd()*2.6;ps.set(rx,rh+rsz*.3,rz);q.setFromAxisAngle(new THREE.Vector3(0,1,0),rnd()*6);sc.set(rsz*(1+rnd()*.6),rsz*.7,rsz);m4.compose(ps,q,sc);rock.setMatrixAt(rn++,m4)}rock.count=rn;G.add(rock);
  // rest stop (about halfway): hut roof, benches, sign
  var mid=pts[95],hx=mid.x+13,hz=mid.z+8,hy=groundH(hx,hz);
  var pad=new THREE.Mesh(new THREE.BoxGeometry(14,.3,12),new THREE.MeshStandardMaterial({color:0xcfc7b4}));pad.position.set(hx,hy+.1,hz);G.add(pad);
  [[-5,-4],[5,-4],[-5,4],[5,4]].forEach(function(p){var po=new THREE.Mesh(new THREE.BoxGeometry(.3,3.2,.3),new THREE.MeshStandardMaterial({color:0x5a3a22}));po.position.set(hx+p[0],hy+1.7,hz+p[1]);G.add(po)});
  var rf=new THREE.Mesh(new THREE.ConeGeometry(8.4,2.2,4),new THREE.MeshStandardMaterial({color:0x8a3b24}));rf.position.set(hx,hy+4.4,hz);rf.rotation.y=Math.PI/4;G.add(rf);
  [-3,3].forEach(function(o){var bn=new THREE.Mesh(new THREE.BoxGeometry(3.2,.5,.9),new THREE.MeshStandardMaterial({color:0x7a5230}));bn.position.set(hx+o,hy+.7,hz);G.add(bn)});
  var lab=labelSprite('🏞️ VIEWPOINT · rest stop','#fff','rgba(20,60,40,.92)');lab.position.set(hx,hy+7,hz);lab.scale.multiplyScalar(2);G.add(lab);
  // summit: stone ring, flag, sign
  var sm=pts[pts.length-1],sy=groundH(sm.x,sm.z);
  var ring=new THREE.Mesh(new THREE.CylinderGeometry(9,10,.8,18),new THREE.MeshStandardMaterial({color:0xb9b2a2}));ring.position.set(sm.x,sy+.3,sm.z);G.add(ring);
  var fp=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,9,6),new THREE.MeshStandardMaterial({color:0xdddddd}));fp.position.set(sm.x,sy+5,sm.z);G.add(fp);
  var fl=new THREE.Mesh(new THREE.PlaneGeometry(4,2.4),new THREE.MeshBasicMaterial({color:0x1b9e5a,side:THREE.DoubleSide}));fl.position.set(sm.x+2,sy+8,sm.z);G.add(fl);var fw=new THREE.Mesh(new THREE.PlaneGeometry(1.33,2.4),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));fw.position.set(sm.x+2,sy+8,sm.z+.01);G.add(fw);
  var sl=labelSprite('⛰️ HEIRLOOM PEAK · '+Math.round(sy)+'m','#ffd23f','rgba(20,30,50,.92)');sl.position.set(sm.x,sy+12.5,sm.z);sl.scale.multiplyScalar(2.6);G.add(sl);
  CITY.group.add(G);CITY.mtn=G;CITY.mtnSummit={x:sm.x,z:sm.z,y:sy};CITY.mtnRoad=pts}
setInterval(function(){if(CITY.terrain&&(!CITY.mtn||CITY.mtn.parent!==CITY.group)){try{rs=7;build()}catch(e){console.error('mountain',e)}}},1000);
/* summit prize once per day, and a mountain badge */
setInterval(function(){if(window.__mode!=='play'||!CITY.mtnSummit||typeof S==='undefined')return;var s=CITY.mtnSummit;
  if(Math.hypot(player.x-s.x,player.z-s.z)<12&&S.summitDay!==S.day){S.summitDay=S.day;addMoney(500);addXP&&addXP(120);S.summits=(S.summits||0)+1;banner('⛰️ YOU REACHED THE PEAK','+$500 · peaks climbed: '+S.summits,3200,'#ffd23f');saveGame()}},1000);
window.__mtn={WP:WP};
})();
