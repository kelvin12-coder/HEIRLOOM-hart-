/* ===== Heirloom interior kit: walk-in buildings (bank, hotel, ...) with solid walls, people, auto doors, elevators and tap-spots ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof ACT==='undefined'||typeof P==='undefined'||typeof S==='undefined')return;
var FY=100,IN=false,cur=null,g=null,CX=0,CZ=0,OUT=null,lights=[],npcs=[],doors=[],spots=[],hot=null,bar=null,cityCol=null,cityCirc=null,boxes=null,REG={},seed=7;
var prev=groundH;groundH=function(x,z){return IN?FY:prev(x,z)};
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function rnd(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
var MC={};function M(c,r,m,o){var k=c+'|'+r+'|'+m+'|'+(o?JSON.stringify(o):'');if(MC[k])return MC[k];var p={color:new THREE.Color(c),roughness:r===undefined?.8:r,metalness:m||0};if(o)Object.assign(p,o);var mm=new THREE.MeshStandardMaterial(p);if(window.SKIN&&typeof c==='string')SKIN.auto(mm,c);return MC[k]=mm}
function glow(c){return new THREE.MeshBasicMaterial({color:c,toneMapped:false})}
function glass(c,op){return new THREE.MeshStandardMaterial({color:c||0x9fd8ff,transparent:true,opacity:op||.28,roughness:.05,metalness:.3,depthWrite:false})}
/* api handed to each interior's build() — all coordinates are relative to the interior origin, y is height above the floor */
function api(){var A={g:g,FY:FY,
  box:function(x,y,z,w,h,d,c,o){o=o||{};var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),o.mat||M(c,o.r,o.m));m.position.set(x,FY+y+h/2,z);m.castShadow=!o.ns;m.receiveShadow=true;g.add(m);if(o.c)colAddBox(CX+x-w/2,CZ+z-d/2,CX+x+w/2,CZ+z+d/2,FY+y+h+(o.ch||0),'k');return m},
  cyl:function(x,y,z,rt,rb,h,c,o){o=o||{};var m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,o.seg||16),o.mat||M(c,o.r,o.m));m.position.set(x,FY+y+h/2,z);m.castShadow=!o.ns;g.add(m);if(o.c)colAddCirc(CX+x,CZ+z,Math.max(rt,rb),FY+y+h,'k');return m},
  sph:function(x,y,z,r,mat){var m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),mat);m.position.set(x,FY+y,z);g.add(m);return m},
  wall:function(x0,z0,x1,z1,h,c,o){o=o||{};var t=o.t||.4,w=Math.abs(x1-x0)||t,d=Math.abs(z1-z0)||t;return A.box((x0+x1)/2,o.y||0,(z0+z1)/2,w,h,d,c,{c:1,r:o.r,m:o.m,mat:o.mat,ch:0})},
  light:function(x,y,z,c,i,d){var l=new THREE.PointLight(c,i,d||40,1.4);l.position.set(CX+x,FY+y,CZ+z);lights.push(l);scene.add(l);return l},
  /* a person standing around: look = {female,...} */
  npc:function(x,z,ry,o,name){o=o||{};var look=Object.assign(randLook(!!o.female,rnd),o);var H=makeHuman(look);H.root.position.set(x,FY,z);H.root.rotation.y=ry||0;g.add(H.root);
    var n={H:H,x:x,z:z,ry:ry||0,st:o.st||'idle',name:name||''};if(name){var s=labelSprite(name,'#fff','rgba(10,20,40,.85)');s.position.set(x,FY+2.35,z);g.add(s);n.label=s}npcs.push(n);return n},
  /* a pair of sliding glass doors; opens when anyone is near */
  autodoor:function(x,z,w,h,axis){var a=new THREE.Mesh(new THREE.BoxGeometry(axis==='x'?w/2:.12,h,axis==='x'?.12:w/2),glass(0x9fe8ff,.4)),b=a.clone();var fr=M('#222',.4,.6);
    a.position.set(x,FY+h/2,z);b.position.set(x,FY+h/2,z);g.add(a);g.add(b);var d={a:a,b:b,x:x,z:z,w:w,axis:axis||'x',k:0,open:0};doors.push(d);return d},
  spot:function(o){spots.push(o);return o},
  group:function(){var q=new THREE.Group();g.add(q);return q}};return A}
function busy(){return[window.__house,window.__showroom,window.__football,window.__worship].some(function(m){return m&&((m.inside&&m.inside())||(m.state&&m.state().IN))})}
function enter(id,arg){var def=REG[id];if(!def||IN)return;
  if(typeof MISSION!=='undefined'&&MISSION.cur){toast('Finish your current job first');return}
  if(busy()){toast('Leave where you are first');return}
  if(player.car)exitVehicle(true);
  OUT={x:player.x,z:player.z,h:player.h};CX=Math.round(player.x/10)*10;CZ=Math.round(player.z/10)*10;
  cityCol=colBoxes;cityCirc=colCircs;boxes=new Map();colBoxes=boxes;colCircs=new Map();
  g=new THREE.Group();g.position.set(CX,0,CZ);npcs=[];doors=[];spots=[];lights=[];seed=11;cur=def;def.id=id;IN=true;
  var info;try{info=def.build(api(),arg)||{}}catch(e){console.error(e);leave();return}
  scene.add(g);var sp=info.spawn||{x:0,z:0,h:0};
  player.x=CX+sp.x;player.z=CZ+sp.z;player.y=FY;player.h=sp.h||0;player.vx=player.vz=0;cam.yaw=sp.h||0;cam.pitch=.18;cur.exit=info.exit;cur.spotsHint=info;
  if(def.banner)banner(def.banner[0],def.banner[1],2600,def.banner[2]||'#ffd23f');if(def.onEnter)def.onEnter(arg);ui()}
function cleanup(){if(!IN)return;IN=false;if(cur&&cur.onLeave)try{cur.onLeave()}catch(e){}
  lights.forEach(function(l){scene.remove(l)});lights=[];if(g){scene.remove(g);g=null}npcs=[];doors=[];spots=[];hot=null;
  if(cityCol)colBoxes=cityCol;if(cityCirc)colCircs=cityCirc;cur=null;ui()}
function leave(){if(!IN)return;var o=OUT||{x:0,z:0,h:0};cleanup();placeAt(o.x,o.z,o.h)}
function ui(){if(!bar){bar=el('div','position:fixed;left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:31;display:none;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:96vw');document.body.appendChild(bar)}
  var st='padding:10px 15px;border-radius:14px;border:1px solid #fff5;background:rgba(0,0,0,.68);color:#fff;font:800 14px system-ui';bar.innerHTML='';
  if(IN&&hot){var b=el('button',st+';background:#0a7a55;border-color:#35e0b0',hot.label);b.onclick=function(e){e.stopPropagation();hot.fn(hot)};bar.appendChild(b)}
  if(IN){var l=el('button',st,'🚪 Leave');l.onclick=function(e){e.stopPropagation();leave()};bar.appendChild(l)}
  bar.style.display=IN&&window.__mode==='play'?'flex':'none'}
var lastHot=null;
setInterval(function(){if(!IN)return;
  if(Math.abs(player.x-CX)>260||Math.abs(player.z-CZ)>260||player.y<FY-20){cleanup();return}
  if(!window.__hostile){player.inv=Math.max(player.inv||0,3);player.hp=Math.max(player.hp||0,60)}
  var px=player.x-CX,pz=player.z-CZ,best=null,bd=1e9;
  spots.forEach(function(s){if(s.when&&!s.when())return;var d=Math.hypot(px-s.x,pz-s.z);if(d<(s.r||2.4)&&d<bd){bd=d;best=s}});
  if(best!==hot){hot=best;ui()}else if(bar)bar.style.display=window.__mode==='play'?'flex':'none';
  doors.forEach(function(d){var near=Math.hypot(px-d.x,pz-d.z)<d.w*1.7+2.5;npcs.forEach(function(n){if(Math.hypot(n.x-d.x,n.z-d.z)<2)near=near})
    d.k+=((near?1:0)-d.k)*.25;var o=d.k*d.w*.46;if(d.axis==='x'){d.a.position.x=d.x-d.w/4-o;d.b.position.x=d.x+d.w/4+o}else{d.a.position.z=d.z-d.w/4-o;d.b.position.z=d.z+d.w/4+o}});
  if(cur&&cur.exit&&Math.hypot(px-cur.exit.x,pz-cur.exit.z)<(cur.exit.r||1.6)){leave();return}
  if(cur&&cur.tick)cur.tick(.1,px,pz)},100);
setInterval(function(){if(!IN)return;npcs.forEach(function(n){try{animHuman(n.H,.05,n.sp||0,n.st,{})}catch(e){}
  if(n.face){var a=Math.atan2(player.x-CX-n.x,player.z-CZ-n.z);if(Math.hypot(player.x-CX-n.x,player.z-CZ-n.z)<9)n.H.root.rotation.y=a}})},50);
var osg=saveGame;saveGame=function(){if(!IN||!OUT)return osg.apply(this,arguments);var x=player.x,z=player.z,y=player.y;player.x=OUT.x;player.z=OUT.z;try{return osg.apply(this,arguments)}finally{player.x=x;player.z=z;player.y=y}};
var oc=clearWorld;clearWorld=function(){if(IN)leave();return oc.apply(this,arguments)};
/* places register themselves; openPOI(id) walks in */
var oo=window.openPOI;window.openPOI=function(id){if(REG[id]&&REG[id].poi){enter(id);return}return oo.apply(this,arguments)};
/* a short elevator ride: fade, ding, new floor */
function ride(x,z,h,label,done){fadeTo(1,350);setTimeout(function(){player.x=CX+x;player.z=CZ+z;player.h=h||0;cam.yaw=h||0;player.vx=player.vz=0;try{sfx.coin&&sfx.coin()}catch(e){}toast('🛗 '+label);fadeTo(0,500);if(done)done()},520)}
window.__kit={npcs:function(){return npcs},CXZ:function(){return[CX,CZ]},reg:function(id,def){REG[id]=def},enter:enter,leave:leave,inside:function(){return IN},ride:ride,cur:function(){return cur},FY:FY,rnd:rnd,M:M,glow:glow,glass:glass,ui:ui,npcs:function(){return npcs},org:function(){return IN?{x:CX,z:CZ}:null}};
})();
