/* ===== Heirloom showroom: real interiors in every car + a walk-in car dealership with every car on display ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof CARS==='undefined'||typeof makeCarMesh==='undefined')return;

/* ---------- 1. interiors: seats, dashboard, steering wheel, so cars look real through the windows ---------- */
var omk=makeCarMesh;
function std(hex,r,m,em){var o={color:new THREE.Color(hex),roughness:r===undefined?.7:r,metalness:m||0};var x=new THREE.MeshStandardMaterial(o);if(window.SKIN&&!em)SKIN.auto(x,hex);if(em){x.emissive=new THREE.Color(em);x.emissiveIntensity=1}return x}
var IM={dark:std('#15161a',.9),seat:std('#2a2321',.8),tan:std('#8a6a4a',.7),wheel:std('#0e0e10',.5),trim:std('#9aa0a6',.35,.9),scr:new THREE.MeshBasicMaterial({color:0x35e0ff,toneMapped:false}),
  rim:std('#d9dde3',.25,.95),brake:std('#d12a2a',.5,.2)};
function bm(g,m,w,h,d,x,y,z){var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o}
var torus=new THREE.TorusGeometry(.17,.022,6,16);
function interior(car){var sp=car.cg.spec,cab=sp.cab,w=sp.W/2,bh=sp.bh,g=new THREE.Group();
  var zs=(cab[1]+cab[2])/2-.05,zw=cab[2]+.5,zd=cab[3]-.12,sy=bh-.18,lux=!!(CARS[car.name]&&CARS[car.name].price>400000);var sm=lux?IM.tan:IM.seat;
  [-1,1].forEach(function(s){bm(g,sm,.5,.16,.55,s*w*.45,sy,zs);bm(g,sm,.5,.55,.12,s*w*.45,sy+.33,zs-.27);bm(g,sm,.28,.2,.1,s*w*.45,sy+.7,zs-.28)});
  if(cab[0]<zs-1.0){bm(g,sm,w*1.2,.16,.5,0,sy,cab[0]+.55);bm(g,sm,w*1.2,.5,.12,0,sy+.3,cab[0]+.25)}
  bm(g,IM.dark,w*1.7,.2,.4,0,bh+.02,zd);bm(g,IM.dark,.28,.2,.9,0,bh-.1,(zs+zd)/2);                       // dashboard + centre console
  bm(g,IM.scr,.3,.14,.02,0,bh+.17,zd-.2);                                                                   // glowing screen
  var st=new THREE.Mesh(torus,IM.wheel);st.position.set(w*.45,bh+.14,zw);st.rotation.x=-1.1;g.add(st);bm(g,IM.trim,.04,.04,.2,w*.45,bh+.1,zw+.05);
  car.grp.add(g);car.interior=g}
makeCarMesh=function(name,color,full){var car=omk.apply(this,arguments);if(full!==false){try{interior(car)}catch(e){}}return car};

/* ---------- 2. the walk-in dealership ---------- */
var SHOW=['chiron','koenig','aventador','mclaren','huracan','ferrari','porsche','hyper','peacock','sports','mustang','tesla','rolls','gwagon','range','suv','monster','lowrider','hilux','camry'];
var PAINTS=['#e4e7ec','#111214','#d6252b','#1f6fd0','#f2b705','#2fb67c','#b8860b','#7a2cff'];
var FY=100,X0=-30,X1=30,Z0=-18,Z1=18,IN=false,grp=null,CX=0,CZ=0,OUT=null,lights=[],cars=[],boxes=null,cityCol=null,cityCirc=null,bar=null,near=-1;
var prev=groundH;groundH=function(x,z){return IN?FY:prev(x,z)};
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function B(g,w,h,d,x,y,z,col,o){o=o||{};var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),o.mat||std(col,o.r,o.m));m.position.set(x,y,z);m.castShadow=!o.ns;m.receiveShadow=true;g.add(m);return m}
function spot(){var best=null,bd=-1,pois=(CITY&&CITY.pois)||[];
  for(var gx=2;gx<N-2;gx+=2)for(var gz=3;gz<N-2;gz+=2){var x=bcx(gx),z=bcx(gz),m=1e9;pois.forEach(function(p){var d=Math.hypot(p.pos.x-x,p.pos.z-z);if(d<m)m=d});if(m>bd){bd=m;best=[x,z]}}
  return best||[0,0]}
function walls(){return[[X0-.3,Z0-.3,X1+.3,Z0,'n'],[X0-.3,Z1,X1+.3,Z1+.3,'s'],[X1,Z0-.3,X1+.3,Z1+.3,'e'],[X0-.3,Z0-.3,X0,-2.4,'w1'],[X0-.3,2.4,X0,Z1+.3,'w2']]}
/* 4 straight rows of 5 cars, all facing the door; rows are 9 m apart so you can walk down every aisle and round the back */
function slotPos(i){var row=Math.floor(i/5),k=i%5;return{x:-14+k*9.5,z:-13.5+row*9}}
function build(){
  var sp=spot();CX=sp[0];CZ=sp[1];grp=new THREE.Group();grp.position.set(CX,0,CZ);var g=grp,W=X1-X0,D=Z1-Z0,GL={mat:new THREE.MeshStandardMaterial({color:0xaed6ee,transparent:true,opacity:.35,roughness:.1,metalness:.6,depthWrite:false}),ns:1};
  var fl=B(g,W+1,.5,D+1,0,FY-.25,0,'#eceef2',{r:.2,m:.1});if(window.SKIN){SKIN.put(fl.material,'maple',1,false);fl.material.map.repeat.set((W+1)/9,(D+1)/9);fl.material.color.set('#e9e4dc')}
  for(var i=X0+5;i<X1;i+=5)B(g,.05,.02,D,i,FY+.01,0,'#cfd3da',{ns:1});for(var j=Z0+4.5;j<Z1;j+=4.5)B(g,W,.02,.05,0,FY+.01,j,'#cfd3da',{ns:1});
  // glass walls with steel posts, door opening on the west side
  B(g,W,7,.25,0,FY+3.5,Z0-.1,'#fff',GL);B(g,W,7,.25,0,FY+3.5,Z1+.1,'#fff',GL);B(g,.25,7,D,X1+.1,FY+3.5,0,'#fff',GL);
  var sh=(D-4.8)/2;B(g,.25,7,sh,X0-.1,FY+3.5,-(2.4+sh/2),'#fff',GL);B(g,.25,7,sh,X0-.1,FY+3.5,(2.4+sh/2),'#fff',GL);B(g,.25,2.6,4.8,X0-.1,FY+5.7,0,'#fff',GL);
  [Z0-.2,Z1+.2].forEach(function(z){B(g,W,.35,.4,0,FY+.18,z,'#2b2f38');B(g,W,.35,.4,0,FY+7,z,'#2b2f38')});
  for(var px=X0;px<=X1;px+=10){B(g,.3,7,.3,px,FY+3.5,Z0-.1,'#2b2f38');B(g,.3,7,.3,px,FY+3.5,Z1+.1,'#2b2f38')}
  B(g,.3,7,.3,X0,FY+3.5,-2.4,'#2b2f38');B(g,.3,7,.3,X0,FY+3.5,2.4,'#2b2f38');
  // ceiling with light strips and the brand on the back wall
  B(g,W,.3,D,0,FY+7.2,0,'#1c1f27',{ns:1});for(var lz=-13.5;lz<=14;lz+=9)B(g,W-4,.1,.6,0,FY+7.02,lz+4.5,'#fff',{mat:new THREE.MeshBasicMaterial({color:0xfff2d0}),ns:1});
  B(g,18,2,.15,X1-6,FY+4.6,Z0+.25,'#0b0d12');var brand=labelSprite('HEIRLOOM MOTORS','#ffd23f','#0b0d12');brand.scale.multiplyScalar(3.2);brand.position.set(X1-6,FY+4.6,Z0+.5);g.add(brand);
  // reception desk by the door
  B(g,1.4,1.1,6,X0+3.4,FY+.55,-9,'#1c1f27');B(g,1.5,.1,6.1,X0+3.4,FY+1.12,-9,'#d6a738',{m:.6,r:.3});
  // lounge sofas + plants at the back-right
  [[X1-3,12],[X1-3,15.2]].forEach(function(p){B(g,1.6,.5,2.6,p[0],FY+.25,p[1],'#2c3a55');B(g,.4,.9,2.6,p[0]+.8,FY+.7,p[1],'#2c3a55')});
  cars=[];SHOW.forEach(function(n,i){var p=slotPos(i),c=CARS[n],rowDark=Math.floor(i/5)%2;
    B(g,6.4,.14,3.6,p.x,FY+.07,p.z,rowDark?'#2a2d36':'#d9dce3',{r:.2,m:.3});                              // low plinth
    B(g,6.4,.05,.14,p.x,FY+.16,p.z-1.8,Math.floor(i/5)%2?'#35e0ff':'#ff3d81',{mat:new THREE.MeshBasicMaterial({color:Math.floor(i/5)%2?0x35e0ff:0xff3d81}),ns:1});
    var col=PAINTS[(i*3)%PAINTS.length];if(c.gold)col='#d9a520';
    var car=makeCarMesh(n,col,true);car.grp.position.set(p.x,FY+.14,p.z);car.grp.rotation.y=-Math.PI/2;g.add(car.grp);                  // nose points at the door
    B(g,.1,.9,1.3,p.x-3.7,FY+.45,p.z,'#0b0d12',{ns:1});var l1=labelSprite(c.n,'#ffffff','#0b0d12'),l2=labelSprite('$'+c.price.toLocaleString(),'#ffd23f','#0b0d12');l1.position.set(p.x-3.7,FY+1.55,p.z);l2.position.set(p.x-3.7,FY+1.12,p.z);g.add(l1,l2);
    cars.push({n:n,x:p.x,z:p.z,grp:car.grp,col:col,price:c.price,title:c.n,ci:(i*3)%PAINTS.length})});
  scene.add(g);
  boxes=new Map();var old=colBoxes;colBoxes=boxes;
  walls().forEach(function(w){colAddBox(CX+w[0],CZ+w[1],CX+w[2],CZ+w[3],FY+8,'sw')});
  colAddBox(CX+X0+2.6,CZ-12,CX+X0+4.2,CZ-6,FY+1.2,'sd');
  cars.forEach(function(c){colAddBox(CX+c.x-2.7,CZ+c.z-1.15,CX+c.x+2.7,CZ+c.z+1.15,FY+1.6,'sc')});
  colBoxes=old;
  lights=[-16,4,24].map(function(lx){var l=new THREE.PointLight(0xfff0dc,1.3,46,1.4);l.position.set(CX+lx,FY+6,CZ);return l})}
function enter(){if(IN)return;if(typeof MISSION!=='undefined'&&MISSION.cur){toast('Finish your current job or race first');return}
  if(window.__house&&window.__house.inside&&window.__house.inside())return;
  if(player.car)exitVehicle(true);OUT={x:player.x,z:player.z,h:player.h};build();cityCol=colBoxes;cityCirc=colCircs;colBoxes=boxes;colCircs=new Map();IN=true;
  lights.forEach(function(l){scene.add(l)});player.x=CX+X0+2.2;player.z=CZ;player.y=FY;player.h=Math.PI/2;player.vx=player.vz=0;cam.yaw=Math.PI/2;cam.pitch=.2;ui();
  banner('🚘 HEIRLOOM MOTORS','Walk up to any car to see the price and buy it',2800,'#5ab8ff')}
function cleanup(){IN=false;lights.forEach(function(l){scene.remove(l)});if(grp){scene.remove(grp);grp=null}cars=[];if(cityCol)colBoxes=cityCol;if(cityCirc)colCircs=cityCirc;ui()}
function leave(){if(!IN)return;cleanup();var o=OUT||(function(){var h=poiById('deal');return{x:h.pos.x,z:h.pos.z+4,h:0}})();placeAt(o.x,o.z,o.h)}
function buy(i){var c=cars[i];if(!c)return;var d=CARS[c.n];if(!spend(d.price))return;
  S.owned.push({name:c.n,color:c.col});var idx=S.owned.length-1;var sl=(CITY.dealerSlots&&CITY.dealerSlots[0])||{x:OUT?OUT.x+6:0,z:OUT?OUT.z:0,ry:0};
  var V=spawnVehicle(c.n,c.col,sl.x,sl.z,sl.ry,'free');V.owned=true;V.ownIdx=idx;V.hb=1;upgradeToFull(V);addXP(60);try{saveGame()}catch(e){}
  banner('NEW CAR',d.n,2400,'#5ab8ff');toast('🔑 Your '+d.n+' is parked outside the dealership')}
function ui(){if(!bar){bar=el('div','position:fixed;left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:31;display:none;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:94vw');document.body.appendChild(bar)}
  var st='padding:9px 14px;border-radius:14px;border:1px solid #fff5;background:rgba(0,0,0,.66);color:#fff;font:800 14px system-ui,sans-serif';
  bar.innerHTML='';function btn(t,fn,col){var b=el('button',st+(col?';background:'+col:''),t);b.onclick=function(e){e.stopPropagation();fn()};bar.appendChild(b)}
  if(near>=0&&cars[near]){var c=cars[near];btn('💳 Buy '+c.title+' · $'+c.price.toLocaleString(),function(){buy(near)},'#0a7a55');btn('🎨 Colour',function(){c.ci=(c.ci+1)%PAINTS.length;c.col=PAINTS[c.ci];grp.remove(c.grp);var n=makeCarMesh(c.n,c.col,true);n.grp.position.set(c.x,FY+.3,c.z);n.grp.rotation.y=c.grp.rotation.y;grp.add(n.grp);c.grp=n.grp})}
  btn('🚪 Leave',leave);bar.style.display=IN&&window.__mode==='play'?'flex':'none'}
setInterval(function(){if(!IN)return;
  if(Math.abs(player.x-CX)>60||Math.abs(player.z-CZ)>60||player.y<FY-20){cleanup();return}
  player.inv=Math.max(player.inv||0,3);player.hp=Math.max(player.hp||0,60);
  var n=-1,bd=5.2;cars.forEach(function(c,i){var d=Math.hypot(player.x-CX-c.x,player.z-CZ-c.z);if(d<bd){bd=d;n=i}});if(n!==near){near=n;ui()}
    if(player.x-CX<X0+.6&&Math.abs(player.z-CZ)<1.6)leave();
  if(bar)bar.style.display=window.__mode==='play'?'flex':'none'},60);
var osg=saveGame;saveGame=function(){if(!IN||!OUT)return osg.apply(this,arguments);var x=player.x,z=player.z,y=player.y;player.x=OUT.x;player.z=OUT.z;try{return osg.apply(this,arguments)}finally{player.x=x;player.z=z;player.y=y}};
var oc=clearWorld;clearWorld=function(){if(IN)leave();return oc.apply(this,arguments)};
ACT.showroom=function(){closeSheet();enter()};
var od=P.deal;P.deal=function(a){var r=od(a);r.h=r.h.replace('<div class="cap">Paint</div>','<div class="row" style="margin-bottom:8px">'+'<button class="btn" data-a="showroom">🚪 Walk into the showroom</button></div><div class="cap">Paint</div>');return r};
window.__showroom={cars:function(){return cars},near:function(){return near},pos:function(){return[CX,CZ,FY]},enter:enter,leave:leave,inside:function(){return IN}};
})();
