/* ===== Heirloom Motors: gated compound, sliding gate, glass door that opens as you walk up, salesman who walks you round, cheaper cars ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof CARS==='undefined'||!window.__showroom)return;
/* ---- 1. fair prices: lots of cars a normal player can afford (nothing basic above 20,000) ---- */
var NP={camry:9000,hatch:4500,taxi:14000,police:14000,sedan:14000,hilux:15000,suv:17000,mustang:20000,lowrider:20000,sports:28000,gwagon:32000,monster:35000,range:26000,tesla:45000,hyper:70000,rolls:80000,porsche:90000,peacock:75000,ferrari:110000,huracan:115000,mclaren:140000,aventador:200000,chiron:280000,koenig:320000,skyfly:380000};
Object.keys(NP).forEach(function(k){if(CARS[k])CARS[k].price=NP[k]});

/* ---- 2. the compound outside ---- */
var dg=null,gate=null,door=null,gateBoxes=[],cool=0,fr=null;
function std(hex,r,m){return new THREE.MeshStandardMaterial({color:new THREE.Color(hex),roughness:r===undefined?.6:r,metalness:m||0})}
function frame(){ // building front: origin O at the middle of the front wall, F = outward, S = along the wall
  var d=poiById('deal');if(!d)return null;var best=null,bd=1e9;
  CITY.rects.forEach(function(r){var cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2,k=Math.hypot(cx-d.pos.x,cz-d.pos.z);if(k<bd){bd=k;best=r}});
  if(!best||bd>60)return null;var r=best,cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2,f=d.face,F,O;
  if(f==='e'){F=[1,0];O=[r.x1,cz]}else if(f==='w'){F=[-1,0];O=[r.x0,cz]}else if(f==='s'){F=[0,1];O=[cx,r.z1]}else{F=[0,-1];O=[cx,r.z0]}
  return{O:O,F:F,S:[-F[1],F[0]],half:(f==='e'||f==='w'?(r.z1-r.z0):(r.x1-r.x0))/2}}
function W(fr,f,s){return[fr.O[0]+fr.F[0]*f+fr.S[0]*s,fr.O[1]+fr.F[1]*f+fr.S[1]*s]}
function slab(g,fr,f0,f1,s0,s1,y0,y1,mat,col){var a=W(fr,f0,s0),b=W(fr,f1,s1),x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),z0=Math.min(a[1],b[1]),z1=Math.max(a[1],b[1]);
  var m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.05,x1-x0),y1-y0,Math.max(.05,z1-z0)),mat);m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.castShadow=true;m.receiveShadow=true;g.add(m);
  if(col)gateBoxes.push(colAddBox(x0,z0,x1,z1,y1,'dg'));return m}
function sign(txt,col,bg,w,h){var c=document.createElement('canvas');c.width=1024;c.height=256;var x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,1024,256);x.strokeStyle=col;x.lineWidth=8;x.strokeRect(10,10,1004,236);x.fillStyle=col;x.font='800 120px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,512,136);
  var t=new THREE.CanvasTexture(c);t.anisotropy=4;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}))}
function buildOut(){
  fr=frame();if(!fr)return;var g=new THREE.Group(),FD=7.6,HW=Math.min(31,fr.half-.5),dark=std('#23262d',.5,.6),gold=std('#d9a520',.35,.9),glass=new THREE.MeshStandardMaterial({color:0xaed6ee,transparent:true,opacity:.38,roughness:.1,metalness:.6,depthWrite:false});
  gateBoxes=[];
  // tarmac + bay lines
  var asp=slab(g,fr,.2,FD,-HW,HW,.02,.1,std('#3b3e45',.95));
  for(var k=0;k<5;k++){var s=-17+k*8.5;if(Math.abs(s)<5)continue;slab(g,fr,.5,6.2,s-.06,s+.06,.1,.12,std('#e8e8ee',.8))}
  // fence: posts + two rails along both sides and the street, leaving the gate opening
  function run(f0,f1,s0,s1){slab(g,fr,f0,f1,s0,s1,1.9,2.05,dark,1);slab(g,fr,f0,f1,s0,s1,.9,1.0,dark)}
  run(0,FD,-HW-.1,-HW+.1);run(0,FD,HW-.1,HW+.1);run(FD-.1,FD+.1,-HW,-5.6);run(FD-.1,FD+.1,5.6,HW);
  for(var q=-HW;q<=HW+.1;q+=3){if(Math.abs(q)>5.4)slab(g,fr,FD-.15,FD+.15,q-.15,q+.15,0,2.3,dark)}
  for(var q2=0;q2<=FD;q2+=3.8){slab(g,fr,q2-.15,q2+.15,-HW-.15,-HW+.15,0,2.3,dark);slab(g,fr,q2-.15,q2+.15,HW-.15,HW+.15,0,2.3,dark)}
  // gate pillars, arch and sign
  [-5.6,5.6].forEach(function(s){slab(g,fr,FD-.5,FD+.5,s-.5,s+.5,0,3.6,std('#d8d2c6',.8),1);slab(g,fr,FD-.55,FD+.55,s-.6,s+.6,3.6,3.8,gold)});
  slab(g,fr,FD-.2,FD+.2,-5.6,5.6,4.0,5.8,dark);
  var sg=sign('HEIRLOOM MOTORS','#ffd23f','#0b0d12',10.6,2.4),pp=W(fr,FD+.25,0);sg.position.set(pp[0],4.9,pp[1]);sg.rotation.y=Math.atan2(fr.F[0],fr.F[1]);g.add(sg);
  var sg2=sign('HEIRLOOM MOTORS','#ffd23f','#0b0d12',10.6,2.4),p2=W(fr,FD-.25,0);sg2.position.set(p2[0],4.9,p2[1]);sg2.rotation.y=Math.atan2(-fr.F[0],-fr.F[1]);g.add(sg2);
  // sliding gate leaves
  gate={leaves:[],open:0,box:null};
  [-1,1].forEach(function(sd){var lg=new THREE.Group();var a=W(fr,FD+.45,sd*2.8);lg.position.set(a[0],0,a[1]);
    var lm=new THREE.Mesh(new THREE.BoxGeometry(fr.F[0]?.12:5.1,2.2,fr.F[0]?5.1:.12),dark);lm.position.y=1.25;lg.add(lm);
    for(var b=-2.3;b<=2.31;b+=.46){var bar=new THREE.Mesh(new THREE.BoxGeometry(fr.F[0]?.16:.07,2.0,fr.F[0]?.07:.16),gold);bar.position.set(fr.F[0]?0:b,1.25,fr.F[0]?b:0);lg.add(bar)}
    g.add(lg);gate.leaves.push({g:lg,sd:sd,base:W(fr,FD+.45,sd*2.8)})});
  var ga=W(fr,FD,-5),gb=W(fr,FD+.3,5);gate.box=colAddBox(Math.min(ga[0],gb[0]),Math.min(ga[1],gb[1]),Math.max(ga[0],gb[0]),Math.max(ga[1],gb[1]),2.4,'dg');
  // glass front door on the showroom wall (opens as you walk up)
  door={leaves:[],open:0};
  [-1,1].forEach(function(sd){var m=new THREE.Mesh(new THREE.BoxGeometry(fr.F[0]?.1:2.5,3.4,fr.F[0]?2.5:.1),glass);var a=W(fr,.25,sd*1.25);m.position.set(a[0],1.7,a[1]);g.add(m);
    var fm=new THREE.Mesh(new THREE.BoxGeometry(fr.F[0]?.14:2.5,.15,fr.F[0]?2.5:.14),gold);fm.position.set(0,1.7,0);m.add(fm);door.leaves.push({m:m,sd:sd,base:a})});
  var hd=sign('ENTER · SHOWROOM','#ffffff','#10131b',5.2,1.0),hp=W(fr,.3,0);hd.position.set(hp[0],4.1,hp[1]);hd.rotation.y=Math.atan2(fr.F[0],fr.F[1]);g.add(hd);
  // better purchased-car spots: inside the compound, either side of the path to the door
  var sl=[];[-22,-14,14,22].forEach(function(s,i){var a=W(fr,3.8,s);sl.push({x:a[0],z:a[1],ry:Math.atan2(fr.F[0],fr.F[1])+Math.PI/2*0,k:i})});
  CITY.dealerSlots=sl;
  dg=g;dg.userData.parent=CITY.group;CITY.group.add(g)}
function setOpen(o,t,sp,dt){return o+(t-o)*Math.min(1,dt*sp)}
var last=Date.now();
setInterval(function(){try{
  var now=Date.now(),dt=Math.min(.2,(now-last)/1000);last=now;
  if(typeof CITY==='undefined'||!CITY.group||!CITY.pois||!CITY.rects||window.__mode!=='play')return;
  if(window.__showroom.inside())return;
  if(!dg||dg.userData.parent!==CITY.group){if(dg&&dg.parent)dg.parent.remove(dg);try{buildOut()}catch(e){console.warn('dealer',e);dg={userData:{parent:CITY.group}}}}
  if(!fr||!gate)return;
  var px=player.x,pz=player.z,dxg=px-W(fr,7.6,0)[0],dzg=pz-W(fr,7.6,0)[1],dgate=Math.hypot(dxg,dzg);
  var want=dgate<15?1:0;gate.open=setOpen(gate.open,want,2.2,dt);
  gate.leaves.forEach(function(L){var s=gate.open*4.7,pos=[L.base[0]+fr.S[0]*L.sd*s*1,L.base[1]+fr.S[1]*L.sd*s*1];L.g.position.set(pos[0],0,pos[1])});
  gate.box.h=gate.open>.8?-5:2.4;
  // door
  var lf=(px-fr.O[0])*fr.F[0]+(pz-fr.O[1])*fr.F[1],ls=(px-fr.O[0])*fr.S[0]+(pz-fr.O[1])*fr.S[1];
  var near=!player.car&&lf>-.5&&lf<7&&Math.abs(ls)<6;door.open=setOpen(door.open,near?1:0,3,dt);
  door.leaves.forEach(function(L){L.m.position.set(L.base[0]+fr.S[0]*L.sd*door.open*2.4,1.7,L.base[1]+fr.S[1]*L.sd*door.open*2.4)});
  if(now<cool)return;
  if(!player.car&&lf>-.6&&lf<2&&Math.abs(ls)<2.6&&door.open>.7&&typeof MISSION!=='undefined'&&!MISSION.cur){cool=now+4000;
    if(typeof fadeTo==='function')fadeTo(1,260);setTimeout(function(){try{window.__showroom.enter()}catch(e){}if(typeof fadeTo==='function')fadeTo(0,500)},300)}
}catch(e){if(!window.__dwarn){window.__dwarn=1;console.warn('dealer tick',e&&e.message)}}},50);
/* after leaving, you stand on the forecourt facing the street with the door behind you */
var lv=window.__showroom.leave;
window.__showroom.leave=function(){lv.apply(this,arguments);cool=Date.now()+3500;if(fr){var a=W(fr,3.5,0);try{placeAt(a[0],a[1],Math.atan2(fr.F[0],fr.F[1]))}catch(e){}}};

/* ---- 3. the salesman: greets you at the door, then walks round the showroom with you ---- */
var SM=null,seen=-2,said=0,sx=0,sz=0,sh=0;
function mkSalesman(){var o=window.__showroom.pos(),CX=o[0],CZ=o[1],FY=o[2];
  var H=makeHuman({female:false,skin:3,hair:0,hairCol:0,tc:'#f4f6fa',bc:'#1b2030',shc:'#111',build:1,h:1.02,hat:0});scene.add(H.root);
  sx=CX-26;sz=CZ-6;sh=Math.PI/2;SM={H:H,y:FY,CX:CX,CZ:CZ};H.root.position.set(sx,FY,sz);H.root.rotation.y=sh;H.root.visible=true;if(typeof humanShadows==='function')humanShadows(H,true);seen=-2;said=0}
function say(t){if(typeof toast==='function')toast('🧑‍💼 '+t)}
var sl2=Date.now();
setInterval(function(){try{
  var inn=window.__showroom.inside(),now=Date.now(),dt=Math.min(.2,(now-sl2)/1000);sl2=now;
  if(!inn){if(SM){scene.remove(SM.H.root);SM=null}return}
  if(!SM)mkSalesman();if(!SM)return;
  var cars=window.__showroom.cars(),near=window.__showroom.near();
  // stay 2.6 m from the player, slightly to the side; head to the car being looked at
  var tx=player.x,tz=player.z,target=null;
  if(near>=0&&cars[near]){target=[SM.CX+cars[near].x,SM.CZ+cars[near].z];var ox=player.x-target[0],oz=player.z-target[1],d=Math.hypot(ox,oz)||1;tx=player.x+oz/d*2.2;tz=player.z-ox/d*2.2}
  var dx=tx-sx,dz=tz-sz,dist=Math.hypot(dx,dz),sp=0;
  if(dist>(near>=0?.6:2.8)){sp=Math.min(3.4,Math.max(1.4,dist*.9));sx+=dx/dist*sp*dt;sz+=dz/dist*sp*dt;var th=Math.atan2(dx,dz);var da=((th-sh+Math.PI*3)%(Math.PI*2))-Math.PI;sh+=da*Math.min(1,dt*8)}
  else{var th2=Math.atan2(player.x-sx,player.z-sz),d2=((th2-sh+Math.PI*3)%(Math.PI*2))-Math.PI;sh+=d2*Math.min(1,dt*6)}
  SM.H.root.position.set(sx,SM.y,sz);SM.H.root.rotation.y=sh;
  try{animHuman(SM.H,dt,sp,'idle',{})}catch(e){}
  if(near!==seen){seen=near;if(near>=0&&cars[near])say(cars[near].title+' — $'+cars[near].price.toLocaleString()+'. Tap Buy when you are ready.');else if(!said){said=1;say('Welcome to Heirloom Motors! Walk round and look at any car.')}}
}catch(e){}},40);
})();

/* ===== real front doors for the church, mosque and bank: walk up, the doors slide/open, you walk in (no magic tap) ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||!window.__showroom)return;
var DEF=[{id:'church',kind:'ch',go:function(){ACT.worship('church')},label:'CHURCH',col:'#f2d38a'},{id:'mosque',kind:'mo',go:function(){ACT.worship('mosque')},label:'MOSQUE',col:'#7fe0b8'},{id:'bank',kind:'bk',go:function(){window.__bank.enter()},label:'BANK',col:'#ffd23f'}];
var doors={},cool=0,last=Date.now(),was=false;window.__doors=doors;
function frameOf(id){var d=poiById(id);if(!d)return null;var F={e:[1,0],w:[-1,0],s:[0,1],n:[0,-1]}[d.face];if(!F)return null;var k=id==='bank'?14:10;return{O:[d.pos.x-F[0]*k,d.pos.z-F[1]*k],F:F,S:[-F[1],F[0]]}}
function W(fr,f,s){return[fr.O[0]+fr.F[0]*f+fr.S[0]*s,fr.O[1]+fr.F[1]*f+fr.S[1]*s]}
function sign(txt,col,w,h){var c=document.createElement('canvas');c.width=512;c.height=128;var x=c.getContext('2d');x.fillStyle='#10131b';x.fillRect(0,0,512,128);x.strokeStyle=col;x.lineWidth=6;x.strokeRect(6,6,500,116);x.fillStyle=col;x.font='800 64px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,68);
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}))}
function build(D){var fr=frameOf(D.id);if(!fr)return null;var g=new THREE.Group(),gl=new THREE.MeshStandardMaterial({color:D.id==='bank'?0xaed6ee:0x7a5230,transparent:D.id==='bank',opacity:D.id==='bank'?.4:1,roughness:.5,metalness:D.id==='bank'?.6:0,depthWrite:D.id!=='bank'}),
    gold=new THREE.MeshStandardMaterial({color:0xd9a520,roughness:.35,metalness:.9}),lv=[];
  var ax=Math.abs(fr.F[0])>0;
  [-1,1].forEach(function(sd){var m=new THREE.Mesh(new THREE.BoxGeometry(ax?.14:1.7,3.6,ax?1.7:.14),gl),a=W(fr,.3,sd*.85);m.position.set(a[0],1.8,a[1]);g.add(m);lv.push({m:m,sd:sd,base:a})});
  [-2.1,2.1].forEach(function(s){var p=new THREE.Mesh(new THREE.BoxGeometry(ax?.5:.5,4.2,ax?.5:.5),gold),a=W(fr,.35,s);p.position.set(a[0],2.1,a[1]);g.add(p)});
  var top=new THREE.Mesh(new THREE.BoxGeometry(ax?.5:4.7,.4,ax?4.7:.5),gold),ta=W(fr,.35,0);top.position.set(ta[0],4.3,ta[1]);g.add(top);
  var sg=sign('ENTER '+D.label,D.col,5,1.2),sp=W(fr,.7,0);sg.position.set(sp[0],5.1,sp[1]);sg.rotation.y=Math.atan2(fr.F[0],fr.F[1]);g.add(sg);
  CITY.group.add(g);return{g:g,fr:fr,lv:lv,open:0,parent:CITY.group,D:D}}
setInterval(function(){try{
  var now=Date.now(),dt=Math.min(.2,(now-last)/1000);last=now;
  if(typeof CITY==='undefined'||!CITY.group||!CITY.pois||!CITY.rects||window.__mode!=='play')return;
  var inside=[window.__showroom,window.__worship,window.__kit,window.__house].some(function(m){return m&&m.inside&&m.inside()});
  if(was&&!inside){cool=now+4500;var nd=null,bd=1e9;DEF.concat([{id:'deal'}]).forEach(function(D){var p=poiById(D.id);if(!p)return;var k=Math.hypot(p.pos.x-player.x,p.pos.z-player.z);if(k<bd){bd=k;nd=D}});
    var o=nd&&doors[nd.id];if(o&&bd<30){var a=W(o.fr,4,0);try{placeAt(a[0],a[1],Math.atan2(o.fr.F[0],o.fr.F[1]))}catch(e){}}}
  was=inside;if(inside)return;
  DEF.forEach(function(D){var o=doors[D.id];if(!o||o.parent!==CITY.group){if(o&&o.g.parent)o.g.parent.remove(o.g);doors[D.id]=build(D)||{parent:CITY.group,none:1};o=doors[D.id]}
    if(o.none)return;var fr=o.fr,lf=(player.x-fr.O[0])*fr.F[0]+(player.z-fr.O[1])*fr.F[1],ls=(player.x-fr.O[0])*fr.S[0]+(player.z-fr.O[1])*fr.S[1];
    var near=!player.car&&lf>-.6&&lf<6&&Math.abs(ls)<5;o.open+=((near?1:0)-o.open)*Math.min(1,dt*3);
    o.lv.forEach(function(L){L.m.position.set(L.base[0]+fr.S[0]*L.sd*o.open*1.7,1.8,L.base[1]+fr.S[1]*L.sd*o.open*1.7)});
    if(now>cool&&!player.car&&lf>-.6&&lf<1.8&&Math.abs(ls)<2.2&&o.open>.7&&(typeof MISSION==='undefined'||!MISSION.cur)){cool=now+4500;
      if(typeof fadeTo==='function')fadeTo(1,260);setTimeout(function(){try{D.go()}catch(e){}if(typeof fadeTo==='function')fadeTo(0,500)},300)}})
}catch(e){if(!window.__dwarn){window.__dwarn=1;console.warn('dealer tick',e&&e.message)}}},50);
})();

/* ===== real buildings for the church, mosque and bank: compound wall + sliding gate + proper facade (they were only map markers before) ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||!window.__showroom)return;
var built={};
function mat(c,r,m,o){var p={color:new THREE.Color(c),roughness:r===undefined?.8:r,metalness:m||0};if(o)Object.assign(p,o);return new THREE.MeshStandardMaterial(p)}
function frameOf(id){var d=poiById(id);if(!d)return null;var F={e:[1,0],w:[-1,0],s:[0,1],n:[0,-1]}[d.face];if(!F)return null;return{O:[d.pos.x-F[0]*10,d.pos.z-F[1]*10],F:F}}
function lw(fr,x,z){return[fr.O[0]+x*fr.F[1]+z*fr.F[0],fr.O[1]-x*fr.F[0]+z*fr.F[1]]}
function sign(txt,col,bg,w,h){var c=document.createElement('canvas');c.width=1024;c.height=256;var x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,1024,256);x.strokeStyle=col;x.lineWidth=8;x.strokeRect(10,10,1004,236);x.fillStyle=col;x.font='800 110px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,512,136);
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}))}
function B(ctx,x0,x1,y0,y1,z0,z1,m,col){var me=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),m);me.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);me.castShadow=true;me.receiveShadow=true;ctx.g.add(me);if(col)ctx.cols.push([x0,z0,x1,z1,y1]);return me}
function cyl(ctx,x,z,r,h,m,y0,seg){var me=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||14),m);me.position.set(x,(y0||0)+h/2,z);me.castShadow=true;ctx.g.add(me);return me}
function compound(ctx,HW,FD,col){
  var dark=mat('#23262d',.5,.6),gold=mat('#d9a520',.35,.9),stone=mat('#d8d2c6',.85);
  B(ctx,-HW,HW,0,.1,0,FD,mat('#4b4e55',.95));
  function run(x0,x1,z0,z1){B(ctx,x0,x1,1.9,2.05,z0,z1,dark,1);B(ctx,x0,x1,.9,1.0,z0,z1,dark)}
  run(-HW-.1,-HW+.1,-18,FD);run(HW-.1,HW+.1,-18,FD);run(-HW,-5.6,FD-.1,FD+.1);run(5.6,HW,FD-.1,FD+.1);
  for(var q=-HW;q<=HW+.1;q+=3.2)if(Math.abs(q)>5.4)B(ctx,q-.15,q+.15,0,2.3,FD-.15,FD+.15,dark);
  for(var z=-18;z<=FD;z+=3.8){B(ctx,-HW-.15,-HW+.15,0,2.3,z-.15,z+.15,dark);B(ctx,HW-.15,HW+.15,0,2.3,z-.15,z+.15,dark)}
  [-5.6,5.6].forEach(function(x){B(ctx,x-.5,x+.5,0,3.6,FD-.5,FD+.5,stone,1);B(ctx,x-.6,x+.6,3.6,3.8,FD-.6,FD+.6,gold)});
  B(ctx,-5.6,5.6,4,4.4,FD-.2,FD+.2,dark);
  var s1=sign(ctx.name,col,'#0b0d12',9,2.2);s1.position.set(0,5.3,FD+.25);ctx.g.add(s1);var s2=sign(ctx.name,col,'#0b0d12',9,2.2);s2.position.set(0,5.3,FD-.25);s2.rotation.y=Math.PI;ctx.g.add(s2);
  ctx.gate=[];[-1,1].forEach(function(sd){var lg=new THREE.Group();lg.position.set(sd*2.8,0,FD+.45);var lm=new THREE.Mesh(new THREE.BoxGeometry(5.1,2.2,.12),dark);lm.position.y=1.25;lg.add(lm);
    for(var b=-2.3;b<=2.31;b+=.46){var bar=new THREE.Mesh(new THREE.BoxGeometry(.07,2.0,.16),gold);bar.position.set(b,1.25,0);lg.add(bar)}ctx.g.add(lg);ctx.gate.push({g:lg,sd:sd})});
  ctx.gateBox=[-5,FD,5,FD+.3,2.4];ctx.FD=FD}
function church(ctx){var W=12,D=30,H=10,wall=mat('#f4efe6',.9),roof=mat('#7b3b2a',.85),wood=mat('#6a4528',.7),gold=mat('#d9a520',.3,.9);
  B(ctx,-W,W,0,H,-D,0,wall,1);
  // pitched roof along the length
  [-1,1].forEach(function(sd){var r=new THREE.Mesh(new THREE.BoxGeometry(W*1.25,.6,D+1.5),roof);r.position.set(sd*W*.5,H+3.2,-D/2);r.rotation.z=-sd*.5;r.castShadow=true;ctx.g.add(r)});
  B(ctx,-W,W,H,H+2,-D,-D+.3,wall);  // gable wall
  // front tower + spire + cross
  B(ctx,-4,4,0,22,-6,0.6,wall,1);B(ctx,-4.3,4.3,22,22.6,-6.3,.9,mat('#c8c0b0',.8));
  var sp=new THREE.Mesh(new THREE.ConeGeometry(5.6,10,4),roof);sp.position.set(0,27.6,-2.7);sp.rotation.y=Math.PI/4;sp.castShadow=true;ctx.g.add(sp);
  B(ctx,-.2,.2,32.6,36.4,-2.9,-2.5,gold);B(ctx,-1.3,1.3,34.6,35.0,-2.9,-2.5,gold);
  // belfry arches (dark openings) + clock
  [-1.6,1.6].forEach(function(x){B(ctx,x-.7,x+.7,16,20,.62,.7,mat('#1a1410',1))});
  // porch, double door, big cross above
  B(ctx,-5,5,0,.2,0,3.5,mat('#bdb6a8',.9));
  B(ctx,-1.9,1.9,0,4.3,.62,.72,wood);B(ctx,-.05,.05,0,4.3,.74,.78,mat('#2a1c10',.6));B(ctx,-.25,.25,10,14,.62,.75,gold);B(ctx,-1.6,1.6,11.7,12.3,.62,.75,gold);
  // stained glass along both sides
  [-1,1].forEach(function(sd){var cs=[0xd6252b,0x2f80ed,0xf2b705,0x2fb67c];for(var k=0;k<5;k++){var w=new THREE.Mesh(new THREE.PlaneGeometry(2.2,5),new THREE.MeshBasicMaterial({color:cs[k%4],transparent:true,opacity:.75}));w.position.set(sd*(W+.05),5.5,-6-k*4.8);w.rotation.y=sd*Math.PI/2;ctx.g.add(w)}})}
function mosque(ctx){var W=13,D=28,H=10,wall=mat('#f1ead5',.9),green=mat('#2f7d62',.55,.2),gold=mat('#d9a520',.3,.9);
  B(ctx,-W,W,0,H,-D,0,wall,1);B(ctx,-W-.2,W+.2,H,H+.8,-D-.2,.2,green);
  var dome=new THREE.Mesh(new THREE.SphereGeometry(9,24,14,0,Math.PI*2,0,Math.PI/2),green);dome.position.set(0,H+.8,-D/2);dome.castShadow=true;ctx.g.add(dome);
  cyl(ctx,0,-D/2,.5,3,gold,H+.8+9,10);var cr=new THREE.Mesh(new THREE.TorusGeometry(.9,.18,6,16,Math.PI*1.5),gold);cr.position.set(0,H+14.2,-D/2);cr.rotation.y=Math.PI/2;ctx.g.add(cr);
  [-1,1].forEach(function(sd){var x=sd*(W+1);cyl(ctx,x,-3,1.6,22,wall,0,14);cyl(ctx,x,-3,2.2,.8,green,16,14);cyl(ctx,x,-3,2.3,.5,gold,21.6,14);
    var cap=new THREE.Mesh(new THREE.ConeGeometry(1.8,5,14),green);cap.position.set(x,25.1,-3);ctx.g.add(cap);cyl(ctx,x,-3,.12,2,gold,27.6,6);ctx.cols.push([x-1.7,-4.7,x+1.7,-1.3,22])});
  // arched entrance
  B(ctx,-3,3,0,6.4,.1,.7,mat('#e8dfc4',.85));B(ctx,-2.1,2.1,0,5,.7,.8,mat('#3a2a1c',.7));var arch=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.1,.1,18,1,false,0,Math.PI),mat('#3a2a1c',.7));arch.rotation.x=Math.PI/2;arch.rotation.z=Math.PI/2;arch.position.set(0,5,.8);ctx.g.add(arch);
  [-1,1].forEach(function(sd){for(var k=0;k<4;k++){var w=new THREE.Mesh(new THREE.PlaneGeometry(2,4.4),new THREE.MeshBasicMaterial({color:0x2f9d7d,transparent:true,opacity:.7}));w.position.set(sd*(W+.05),5,-5-k*5.5);w.rotation.y=sd*Math.PI/2;ctx.g.add(w)}});
  B(ctx,-6,6,0,.2,0,3.5,mat('#cfc7b0',.9))}
function bank(ctx){var W=16,D=26,H=12,stone=mat('#e2ddd2',.8),dark=mat('#2c3a4e',.4,.3),gold=mat('#d9a520',.3,.9);
  B(ctx,-W,W,0,H,-D,-4,stone,1);B(ctx,-W,W,H,H+.8,-D,0,dark);
  // portico with six columns + pediment
  B(ctx,-W,W,0,.5,-4,4,mat('#cfc9bd',.9));B(ctx,-W-.5,W+.5,H-1.5,H,-4,4.2,stone);
  for(var k=0;k<6;k++){var x=-W+2.4+k*((2*W-4.8)/5);cyl(ctx,x,2.2,.8,H-2,stone,.5,16);ctx.cols.push([x-.9,1.3,x+.9,3.1,H])}
  var ped=new THREE.Mesh(new THREE.CylinderGeometry(1,1,2*W+1,3),stone);ped.rotation.z=Math.PI/2;ped.rotation.y=Math.PI/2;ped.scale.set(1.2,1,.2);ped.position.set(0,H+1.8,2);ctx.g.add(ped);
  // glass front behind the columns
  var gl=new THREE.Mesh(new THREE.BoxGeometry(2*W-6,H-3.5,.15),new THREE.MeshStandardMaterial({color:0x9fc6e6,transparent:true,opacity:.5,roughness:.1,metalness:.6,depthWrite:false}));gl.position.set(0,(H-3.5)/2+.5,-3.9);ctx.g.add(gl);
  B(ctx,-W,W,0,H,-D,-4.1,stone);
  B(ctx,-6,6,H-4,H-1.6,-4.0,-3.8,dark);var bs=sign('HEIRLOOM BANK','#ffd23f','#10131b',11,2.4);bs.position.set(0,H-2.8,-3.7);ctx.g.add(bs);
  B(ctx,-3,3,0,.25,-4,.5,mat('#bdb6a8',.9))}
var DEF={church:{f:church,name:'HEIRLOOM CHURCH',col:'#f2d38a',HW:21,FD:8},mosque:{f:mosque,name:'HEIRLOOM MOSQUE',col:'#7fe0b8',HW:22,FD:8},bank:{f:bank,name:'HEIRLOOM BANK',col:'#ffd23f',HW:24,FD:8}};
var last=Date.now();
function make(id){var D=DEF[id],fr=frameOf(id);if(!fr)return null;var g=new THREE.Group();g.position.set(fr.O[0],0,fr.O[1]);g.rotation.y=Math.atan2(fr.F[0],fr.F[1]);
  var ctx={g:g,cols:[],name:D.name};D.f(ctx);compound(ctx,D.HW,D.FD,D.col);CITY.group.add(g);g.updateMatrixWorld(true);
  function box(a){var p=[lw(fr,a[0],a[1]),lw(fr,a[2],a[3])];return colAddBox(Math.min(p[0][0],p[1][0]),Math.min(p[0][1],p[1][1]),Math.max(p[0][0],p[1][0]),Math.max(p[0][1],p[1][1]),a[4]||3,'bd')}
  ctx.cols.forEach(box);ctx.gb=box(ctx.gateBox);ctx.fr=fr;ctx.parent=CITY.group;ctx.open=0;return ctx}
setInterval(function(){try{
  var now=Date.now(),dt=Math.min(.2,(now-last)/1000);last=now;
  if(typeof CITY==='undefined'||!CITY.group||!CITY.pois||window.__mode!=='play')return;
  var inside=[window.__showroom,window.__worship,window.__kit,window.__house].some(function(m){return m&&m.inside&&m.inside()});if(inside)return;
  Object.keys(DEF).forEach(function(id){var o=built[id];if(!o||o.parent!==CITY.group){if(o&&o.g&&o.g.parent)o.g.parent.remove(o.g);try{o=built[id]=make(id)||{parent:CITY.group,none:1}}catch(e){console.warn('bld',id,e);o=built[id]={parent:CITY.group,none:1}}}
    if(o.none)return;var gp=lw(o.fr,0,D8(o)),d=Math.hypot(player.x-gp[0],player.z-gp[1]);o.open+=((d<15?1:0)-o.open)*Math.min(1,dt*2.2);
    o.gate.forEach(function(L){L.g.position.x=L.sd*(2.8+o.open*4.7)});o.gb.h=o.open>.8?-5:2.4})
}catch(e){if(!window.__dwarn){window.__dwarn=1;console.warn('dealer tick',e&&e.message)}}},50);
function D8(o){return o.FD}
})();

/* ===== Football Stadium: a real outdoor pitch with goals, nets, stands, floodlights and a ball you can kick (on foot or with a car) ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||!window.__showroom)return;
var G=null,ball=null,bv={x:0,z:0},B0=null,goalT=0,PW=84,PH=52,GW=7.4,last=Date.now();
function std(c,r,m,o){var p={color:new THREE.Color(c),roughness:r===undefined?.8:r,metalness:m||0};if(o)Object.assign(p,o);return new THREE.MeshStandardMaterial(p)}
function pitchTex(){var c=document.createElement('canvas');c.width=1024;c.height=640;var x=c.getContext('2d'),kx=1024/PW,ky=640/PH;
  for(var i=0;i<14;i++){x.fillStyle=i%2?'#2f8a3d':'#2a7d37';x.fillRect(i*1024/14,0,1024/14+1,640)}
  x.strokeStyle='#fff';x.lineWidth=5;x.strokeRect(8,8,1008,624);x.beginPath();x.moveTo(512,8);x.lineTo(512,632);x.stroke();
  x.beginPath();x.arc(512,320,9.15*kx,0,Math.PI*2);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(512,320,6,0,7);x.fill();
  [[8,1],[1016,-1]].forEach(function(e){var X=e[0],d=e[1];x.strokeRect(d>0?X:X-16.5*kx,320-20*ky,16.5*kx,40*ky);x.strokeRect(d>0?X:X-5.5*kx,320-9*ky,5.5*kx,18*ky);x.beginPath();x.arc(X+d*11*kx,320,5,0,7);x.fill();x.beginPath();x.arc(X+d*11*kx,320,9.15*kx,d>0?-.93:Math.PI-.93,d>0?.93:Math.PI+.93);x.stroke()});
  var t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
function netTex(){var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d');x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=2;for(var i=0;i<=64;i+=8){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(64,i);x.stroke()}var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function ballTex(){var c=document.createElement('canvas');c.width=256;c.height=128;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,256,128);x.fillStyle='#16181d';for(var i=0;i<14;i++){x.beginPath();x.arc((i*47)%256,20+((i*61)%90),13,0,7);x.fill()}return new THREE.CanvasTexture(c)}
function sign(txt,col,bg,w,h){var c=document.createElement('canvas');c.width=1024;c.height=256;var x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,1024,256);x.fillStyle=col;x.font='800 120px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,512,136);return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}))}
function build(){var d=poiById('pitch');if(!d)return null;var F={e:[1,0],w:[-1,0],s:[0,1],n:[0,-1]}[d.face],bx=d.pos.x-F[0]*50,bz=d.pos.z-F[1]*50,g=new THREE.Group();g.position.set(bx,0,bz);
  // paved surround, grass pitch with lines
  var pave=new THREE.Mesh(new THREE.BoxGeometry(100,.2,100),std('#8a8d94',.95,0,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));pave.position.y=.12;g.add(pave);
  var pm=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:pitchTex(),color:0x6e6e6e,roughness:.95,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));pm.rotation.x=-Math.PI/2;pm.position.y=.23;pm.receiveShadow=true;g.add(pm);
  // goals + nets at both ends
  var white=std('#f4f4f4',.4),nt=netTex();
  [-1,1].forEach(function(sd){var x=sd*PW/2;
    [-GW/2,GW/2].forEach(function(z){var p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.5,8),white);p.position.set(x,1.39,z);g.add(p)});
    var cb=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,GW,8),white);cb.rotation.x=Math.PI/2;cb.position.set(x,2.64,0);g.add(cb);
    var nm=new THREE.MeshBasicMaterial({map:nt,transparent:true,side:THREE.DoubleSide,depthWrite:false});nm.map.repeat.set(10,5);
    var back=new THREE.Mesh(new THREE.PlaneGeometry(GW,2.5),nm);back.rotation.y=Math.PI/2;back.position.set(x+sd*2,1.39,0);g.add(back);
    [-GW/2,GW/2].forEach(function(z){var side=new THREE.Mesh(new THREE.PlaneGeometry(2,2.5),nm);side.position.set(x+sd,1.39,z);g.add(side)});
    var top=new THREE.Mesh(new THREE.PlaneGeometry(2,GW),nm);top.rotation.x=Math.PI/2;top.rotation.z=Math.PI/2;top.position.set(x+sd,2.6,0);g.add(top)});
  // stands along one long side, with a roof and a big sign
  var cols=['#1f4e9a','#e8edf5'];
  for(var r=0;r<5;r++){var st=new THREE.Mesh(new THREE.BoxGeometry(PW+8,.9+r*.9,2.2),std('#9aa0aa',.9));st.position.set(0,(.9+r*.9)/2,-PH/2-4-r*2.2);g.add(st);
    for(var k=0;k<24;k++){var sc=new THREE.Mesh(new THREE.BoxGeometry(2.4,.5,1.1),std(cols[k%2],.8));sc.position.set(-PW/2-2+k*3.6,.9+r*.9+.25,-PH/2-4-r*2.2+.5);g.add(sc)}}
  var roof=new THREE.Mesh(new THREE.BoxGeometry(PW+10,.4,14),std('#d9dde3',.6));roof.position.set(0,9,-PH/2-9);g.add(roof);
  [-PW/2-4,0,PW/2+4].forEach(function(x){var pl=new THREE.Mesh(new THREE.BoxGeometry(.6,9,.6),std('#6d7480',.6));pl.position.set(x,4.5,-PH/2-15);g.add(pl)});
  var sg=sign('HEIRLOOM STADIUM','#ffd23f','#0b1a10',30,7.5);sg.position.set(0,6.2,-PH/2-15.4);g.add(sg);
  // floodlights
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(c){var pole=new THREE.Mesh(new THREE.CylinderGeometry(.35,.5,22,8),std('#9aa0aa',.5,.6));pole.position.set(c[0]*(PW/2+6),11,c[1]*(PH/2+5));g.add(pole);
    var hd=new THREE.Mesh(new THREE.BoxGeometry(5,2.4,.6),new THREE.MeshBasicMaterial({color:0xfff6d8}));hd.position.set(c[0]*(PW/2+6),22.4,c[1]*(PH/2+5));hd.rotation.y=Math.atan2(-c[0],-c[1]);g.add(hd)});
  // ball
  var bm=new THREE.MeshStandardMaterial({map:ballTex(),roughness:.5});ball=new THREE.Mesh(new THREE.SphereGeometry(.36,20,14),bm);ball.castShadow=true;ball.position.set(0,.5,0);g.add(ball);bv={x:0,z:0};B0=g;
  CITY.group.add(g);G=g;g.userData.parent=CITY.group;g.userData.cx=bx;g.userData.cz=bz;
  // fence around the pavement so cars keep to the road; open gaps for entry on the street side
  colAddBox(bx-PW/2-6,bz-PH/2-19,bx+PW/2+6,bz-PH/2-3,10,'st');
  return g}
function tick(){try{var now=Date.now(),dt=Math.min(.12,(now-last)/1000);last=now;
  if(typeof CITY==='undefined'||!CITY.group||!CITY.pois||window.__mode!=='play')return;
  var inside=[window.__showroom,window.__worship,window.__kit,window.__house].some(function(m){return m&&m.inside&&m.inside()});if(inside)return;
  if(!G||G.userData.parent!==CITY.group){if(G&&G.parent)G.parent.remove(G);G=null;try{build()}catch(e){console.warn('pitch',e);G={userData:{parent:CITY.group}}}}
  if(!ball||!G.userData.cx)return;var cx=G.userData.cx,cz=G.userData.cz,bx=cx+ball.position.x,bz=cz+ball.position.z;
  if(Math.hypot(player.x-cx,player.z-cz)>140)return;
  // kicks: a runner or any car touching the ball
  var movers=[{x:player.x,z:player.z,vx:(player.vx||0),vz:(player.vz||0),r:1.1,pw:1}];
  try{vehicles.forEach(function(v){if(Math.abs(v.x-cx)<80&&Math.abs(v.z-cz)<80)movers.push({x:v.x,z:v.z,vx:v.vx||0,vz:v.vz||0,r:2.6,pw:1.4})})}catch(e){}
  movers.forEach(function(m){var dx=bx-m.x,dz=bz-m.z,d=Math.hypot(dx,dz)||1;if(d<m.r){var sp=Math.hypot(m.vx,m.vz),k=Math.max(5,sp*1.25*m.pw+3);bv.x=dx/d*k+m.vx*.4;bv.z=dz/d*k+m.vz*.4}});
  var f=Math.pow(.42,dt);bv.x*=f;bv.z*=f;var px=ball.position.x+bv.x*dt,pz=ball.position.z+bv.z*dt;
  // goals
  if(goalT>0){goalT-=dt;if(goalT<=0){px=0;pz=0;bv.x=bv.z=0}}
  else if(Math.abs(px)>PW/2&&Math.abs(pz)<GW/2){goalT=2.2;try{toast('⚽ GOAL!');if(typeof addMoney==='function')addMoney(150,true)}catch(e){}}
  else{if(Math.abs(px)>PW/2+1.8){px=Math.sign(px)*(PW/2+1.8);bv.x*=-.5}if(Math.abs(pz)>PH/2+1){pz=Math.sign(pz)*(PH/2+1);bv.z*=-.5}}
  ball.position.set(px,.6,pz);var sp2=Math.hypot(bv.x,bv.z);ball.rotation.z-=bv.x*dt/.36;ball.rotation.x+=bv.z*dt/.36;
}catch(e){}}
setInterval(tick,40);
})();
