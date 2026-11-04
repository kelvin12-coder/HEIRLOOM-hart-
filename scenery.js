/* ===== Heirloom scenery: boats and a ship on the sea, parked motorbikes and bicycles, flower pots at the doors, bushes beside the trees =====
   Uses the real models packed in assets/m/props.vc and trees.vc. Rebuilds itself if the city is rebuilt (travel). */
(function(){
'use strict';
if(typeof THREE==='undefined')return;
var T=THREE,boats=[],birds=[],bikes=[],tries=0,last=0;window.__bikes=bikes;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function geo(id){var m=window.PROPV&&PROPV[id];return m&&m.parts&&m.parts.keep}
function build(){
  var R=rng(4242),G=new T.Group();G.name='scenery';boats=[];
  var mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.8,side:T.DoubleSide});
  /* ---------- sea: boats drift, ship sails, row boats near the beach ---------- */
  function spot(lo,hi,minD,maxD,tries2){for(var k=0;k<tries2;k++){var x=(R()*2-1)*(HALF+760),z=(R()*2-1)*(HALF+760),h=terrH(x,z),e=Math.max(Math.abs(x),Math.abs(z))-HALF;
      if(h<lo&&h>hi&&e>minD&&e<maxD){var ok=true;for(var i=0;i<boats.length;i++)if(Math.hypot(boats[i].m.position.x-x,boats[i].m.position.z-z)<45){ok=false;break}if(ok)return[x,z]}}return null}
  function boat(id,bowZ,lo,hi,minD,maxD,speed,s){var g=geo(id);if(!g)return;var p=spot(lo,hi,minD,maxD,400);if(!p)return;
    var m=new T.Mesh(g,mat);m.scale.setScalar(s||1);m.position.set(p[0],-.62,p[1]);var hd=R()*6.283;m.userData.hd=hd;G.add(m);
    boats.push({m:m,hd:hd,sp:speed*(.6+R()*.8),ph:R()*6,bow:bowZ,lo:lo})}
  for(var i=0;i<4;i++)boat('boat_fish',-1,-3,-45,70,600,1.6,1);
  for(i=0;i<3;i++)boat('boat_house',1,-2.5,-12,60,260,.35,1);
  for(i=0;i<5;i++)boat('boat_row',-1,-1.3,-4,30,160,.5,1);
  for(i=0;i<2;i++)boat('ship',1,-12,-120,260,720,2.4,1);
  /* ---------- street props: instanced so they cost almost nothing ---------- */
  bikes.length=0;birds=[];
  var inst={};function put(id,x,z,ry,s,y,gg){var g=gg||geo(id);if(!g)return;var k=gg?id+(gg.uuid):id;(inst[k]=inst[k]||{g:g,list:[]}).list.push([x,y||0,z,ry,s||1])}
  var half=BLK/2-1.7;
  for(var gx=1;gx<N-1;gx++)for(var gz=1;gz<N-1;gz++){var r=R();if(r>.34)continue;var cx=bcx(gx),cz=bcx(gz),t=(R()*2-1)*(BLK/2-16),side=R()<.5?-1:1,alongX=R()<.5;
    var x=alongX?cx+t:cx+side*half,z=alongX?cz+side*half:cz+t,ry=alongX?(R()<.5?0:Math.PI):(R()<.5?Math.PI/2:-Math.PI/2);ry+=(R()-.5)*.3;
    if(r<.14)put('moto',x,z,ry,1,.02);else put('bicycle',x,z,ry,1,.02)}
  /* flower pots in pairs at every place's door */
  (CITY.pois||[]).forEach(function(p,i){if(!p.pos)return;var o=3.2,ax=(p.face==='n'||p.face==='s')?1:0;
    [-1,1].forEach(function(sd,j){put(j?'pot1':'pot2',p.pos.x+(ax?sd*o:0),p.pos.z+(ax?0:sd*o),R()*6.28,1.15,.02)})});
  /* bushes beside the trees */
  var bushes=(window.TREEX&&TREEX.bush)||[],nb=0;
  if(bushes.length)for(var ci=0;ci<CITY.chunks.length&&nb<260;ci++){var tr=CITY.chunks[ci]&&CITY.chunks[ci].trees;if(!tr)continue;
    tr.forEach(function(t2){if(nb>=260||R()>.45||t2.k==='palm'&&R()<.5)return;var a=R()*6.28,d=1.4+R()*.8,bg=bushes[Math.floor(R()*bushes.length)];nb++;put('bush',t2.x+Math.cos(a)*d,t2.z+Math.sin(a)*d,R()*6.28,.9+R()*.6,.22,bg)})}
  Object.keys(inst).forEach(function(k){var e=inst[k],im=new T.InstancedMesh(e.g,mat,e.list.length),m4=new T.Matrix4(),q=new T.Quaternion(),pp=new T.Vector3(),sc=new T.Vector3(),up=new T.Vector3(0,1,0);
    e.list.forEach(function(L,i){q.setFromAxisAngle(up,L[3]);pp.set(L[0],L[1],L[2]);sc.setScalar(L[4]);m4.compose(pp,q,sc);im.setMatrixAt(i,m4)});
    if(k==='moto'||k==='bicycle')e.list.forEach(function(L,i){bikes.push({id:k,x:L[0],z:L[2],ry:L[3],im:im,i:i,m4:null})});
    im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.castShadow=false;im.receiveShadow=true;G.add(im)});
  /* seagulls circling over the harbour and the beach */
  var wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute([0,0,.28,0,0,-.28,-1.5,.15,0],3));wg.computeVertexNormals();
  var wm=new T.MeshBasicMaterial({color:0xf4f4f6,side:T.DoubleSide}),bg=new T.SphereGeometry(.2,6,4);bg.scale(1,.7,2.2);
  for(var bi=0;bi<18;bi++){var cx2=0,cz2=0,tt=0;do{var an=R()*6.283,rr=HALF+40+R()*420;cx2=Math.cos(an)*rr;cz2=Math.sin(an)*rr;tt++}while(terrH(cx2,cz2)>-1&&tt<50);
    var g2=new T.Group(),body=new T.Mesh(bg,wm),wl=new T.Mesh(wg,wm),wr=new T.Mesh(wg,wm);wr.scale.x=-1;g2.add(body,wl,wr);G.add(g2);
    birds.push({g:g2,wl:wl,wr:wr,cx:cx2,cz:cz2,r:25+R()*70,a:R()*6.28,sp:(.25+R()*.2)*(R()<.5?-1:1),y:22+R()*38,ph:R()*6})}
  CITY.group.add(G);CITY.scn=G}
/* boats: drift on their heading, turn around before reaching land, bob and roll with the swell */
function tick(now){requestAnimationFrame(tick);var dt=Math.min(.1,(now-last)/1000);last=now;var t=now/1000;
  for(var j=0;j<birds.length;j++){var q=birds[j];q.a+=q.sp*dt;var x=q.cx+Math.cos(q.a)*q.r,z=q.cz+Math.sin(q.a)*q.r;q.g.position.set(x,q.y+Math.sin(t*.5+q.ph)*3,z);q.g.rotation.set(0,-q.a+(q.sp>0?0:Math.PI),0,'YXZ');q.g.rotation.y=Math.atan2(-Math.sin(q.a)*q.sp,Math.cos(q.a)*q.sp)+Math.PI/2*0;var f=Math.sin(t*7+q.ph)*.55;q.wl.rotation.z=f;q.wr.rotation.z=-f}
  if(!boats.length)return;
  for(var i=0;i<boats.length;i++){var b=boats[i],m=b.m,dx=Math.sin(b.hd),dz=Math.cos(b.hd),nx=m.position.x+dx*b.sp*dt,nz=m.position.z+dz*b.sp*dt;
    if(terrH(nx+dx*30,nz+dz*30)>b.lo+.4||Math.abs(nx)>HALF+900||Math.abs(nz)>HALF+900)b.hd+=Math.PI*(.6+Math.random()*.8);else{m.position.x=nx;m.position.z=nz}
    m.rotation.set(Math.sin(t*.7+b.ph)*.025,b.hd+(b.bow<0?Math.PI:0),Math.sin(t*.55+b.ph*2)*.03,'YXZ');m.position.y=-.62+Math.sin(t*.9+b.ph)*.09}}
requestAnimationFrame(tick);
setInterval(function(){try{if(!window.PROPV||typeof CITY==='undefined'||!CITY.terrain||typeof HALF==='undefined')return;if(CITY.scn&&CITY.scn.parent===CITY.group)return;build()}catch(e){if(++tries<4)console.warn('scenery',e)}},1500);
})();

/* ===== Ride the parked motorbikes and bicycles: walk up to one, tap Ride. Faster than walking; tap Get off to leave it parked. ===== */
(function(){
'use strict';
if(typeof THREE==='undefined')return;
var T=THREE,RD=null,btn=null,K={moto:2.5,bicycle:1.7};
function mk(){btn=document.createElement('button');btn.id='rideBtn';btn.style.cssText='position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:60;padding:12px 22px;border-radius:16px;border:2px solid #ffd23f;background:rgba(20,22,30,.93);color:#fff;font:700 16px system-ui,sans-serif;display:none;touch-action:manipulation';document.body.appendChild(btn);btn.addEventListener('click',function(e){e.stopPropagation();if(RD)off();else{var b=near();if(b)on(b)}})}
function near(){var best=null,bd=3.4,B=window.__bikes||[];for(var i=0;i<B.length;i++){var b=B[i];if(b.gone)continue;var d=Math.hypot(b.x-player.x,b.z-player.z);if(d<bd){bd=d;best=b}}return best}
function pg(id){var m=window.PROPV&&PROPV[id];return m&&m.parts&&m.parts.keep}
var MAT=null;
function on(b){if(RD)return;var g=pg(b.id);if(!g)return;MAT=MAT||new T.MeshStandardMaterial({vertexColors:true,roughness:.8,side:T.DoubleSide});
  if(b.im){var z=new T.Matrix4().makeScale(0,0,0);b.im.setMatrixAt(b.i,z);b.im.instanceMatrix.needsUpdate=true}else if(b.mesh){scene.remove(b.mesh)}
  b.gone=true;var m=new T.Mesh(g,MAT);m.castShadow=true;scene.add(m);RD={b:b,m:m,id:b.id};
  try{player.H.body.position.y=-.34}catch(e){}try{toast(b.id==='moto'?'🏍️ Riding the motorbike. Faster than running!':'🚲 Riding the bicycle')}catch(e){}}
function off(){if(!RD)return;var m=RD.m,id=RD.id;try{if(RD.snd)audio.setEngine(false)}catch(e){}try{player.H.body.position.y=0}catch(e){}
  var nb={id:id,x:player.x-Math.sin(player.h)*1.3,z:player.z-Math.cos(player.h)*1.3,ry:player.h,mesh:m,gone:false};m.position.set(nb.x,player.y,nb.z);m.rotation.y=player.h;
  (window.__bikes||[]).push(nb);RD=null}
function frame(){requestAnimationFrame(frame);if(!btn)mk();
  var ok=typeof player!=='undefined'&&window.__mode==='play'&&player.st==='foot'&&!player.car;
  if(RD&&(!ok||(window.__kit&&__kit.inside&&__kit.inside()))){off()}
  if(RD){RD.m.position.set(player.x,player.y,player.z);RD.m.rotation.y=player.h;var sp=player.speedCur||0;RD.m.rotation.x=0;try{player.H.body.position.y=-.34}catch(e){}
    try{if(RD.id==='moto'){var mg=Math.min(1,Math.hypot(input.mx,input.mz));audio.setEngine(true,sp*3.2,mg,'moto');RD.snd=1}}catch(e){}}
  var sh=false,tx='';if(ok&&!(window.__kit&&__kit.inside&&__kit.inside())){if(RD){sh=true;tx='⬇️ Get off'}else{var b=near();if(b){sh=true;tx=b.id==='moto'?'🏍️ Ride motorbike':'🚲 Ride bicycle'}}}
  if(sh){btn.textContent=tx;btn.style.display='block'}else btn.style.display='none'}
requestAnimationFrame(frame);
/* riding is faster: run the walking step with a bigger time slice */
var tries=0,iv=setInterval(function(){if(typeof updateFoot!=='function'){if(++tries>100)clearInterval(iv);return}clearInterval(iv);var uf=updateFoot;
  updateFoot=function(dt){if(RD)return uf(Math.min(.12,dt*(K[RD.id]||1.5)));return uf(dt)}},200);
})();
