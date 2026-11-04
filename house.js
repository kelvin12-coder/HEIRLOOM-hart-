/* ===== Heirloom house: walk inside your home, climb the stairs, decorate it Lagos-style ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof P==='undefined'||typeof ACT==='undefined')return;
var X0=-12,X1=12,Z0=-9,Z1=9,FY=100,UY=104,WH=8.2;   // footprint, ground-floor y, upper-floor y, wall height
var IN=false,OUT=null,grp=null,CX=0,CZ=0,maps=[null,null],lights=[],placed=[],ghost=null,PL=null,floorNow=0;
var ogh=groundH;
function el(tag,css,html){var e=document.createElement(tag);if(css)e.style.cssText=css;if(html!==undefined)e.innerHTML=html;return e}
function home(){if(!S.house||!Array.isArray(S.house.items))S.house={items:[]};return S.house}
var GUEST=null; // {plot,items,tier,name} while visiting someone else's house
function curItems(){return GUEST?GUEST.items:home().items}
function M(hex,r,m,op){var o={color:new THREE.Color(hex),roughness:r===undefined?.8:r,metalness:m||0};if(op){o.transparent=true;o.opacity=op}return window.SKIN?SKIN.auto(new THREE.MeshStandardMaterial(o),hex):new THREE.MeshStandardMaterial(o)}
function bx(g,w,h,d,x,y,z,col,o){o=o||{};var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),o.mat||M(col,o.r,o.m,o.op));m.position.set(x,y,z);m.castShadow=!o.ns;m.receiveShadow=true;g.add(m);return m}
function cy(g,rt,rb,h,x,y,z,col,o){o=o||{};var m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,o.seg||14),o.mat||M(col,o.r,o.m,o.op));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}

/* ---------------- furniture catalogue (front of each item faces +z) ---------------- */
var RMAT=null;function real(g,id,s,ry){var P=window.PROPV&&PROPV[id];if(!P||!P.parts||!P.parts.keep)return false;RMAT=RMAT||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,side:THREE.DoubleSide});var m=new THREE.Mesh(P.parts.keep,RMAT);m.scale.setScalar(s||1);m.rotation.y=ry||0;m.castShadow=true;m.receiveShadow=true;g.add(m);return true}
var ITEMS={
 bed:{n:'Double bed',e:'🛏️',p:400,w:2.3,d:2.7,b:function(g,o){if(real(g,'bed2',1,0))return;bx(g,2.2,.35,2.4,0,.25,0,'#5b3a29');bx(g,2.1,.28,2.3,0,.55,.02,'#f4f0e6');bx(g,2.1,.2,.8,0,.75,-.7,'#2f6fd0');bx(g,.9,.14,.5,-.5,.82,-.95,'#ffffff');bx(g,.9,.14,.5,.5,.82,-.95,'#ffffff');bx(g,2.3,1.1,.12,0,.8,-1.22,'#4a2e20')}},
 sofa:{n:'Leather sofa',e:'🛋️',p:350,w:3,d:1.2,b:function(g){bx(g,3,.45,1.1,0,.3,0,'#7a4a2a');bx(g,3,.7,.3,0,.8,-.45,'#7a4a2a');bx(g,.3,.6,1.1,-1.35,.6,0,'#6a3e22');bx(g,.3,.6,1.1,1.35,.6,0,'#6a3e22');bx(g,.8,.4,.8,-.75,.65,.05,'#8b5a36');bx(g,.8,.4,.8,.75,.65,.05,'#8b5a36')}},
 tv:{n:'Flat-screen TV',e:'📺',p:300,w:2,d:.7,b:function(g){bx(g,2,.5,.5,0,.25,0,'#2a2a2e');bx(g,1.6,.9,.08,0,1.0,0,'#08090c');bx(g,1.5,.8,.02,0,1.0,.05,'#1d6dff',{mat:tvMat(),ns:1});bx(g,.1,.3,.1,0,.6,-.05,'#111')}},
 rug:{n:'Ankara rug',e:'🟧',p:120,w:3.2,d:2.2,flat:1,b:function(g){bx(g,3.2,.04,2.2,0,.03,0,'#c0392b',{ns:1});bx(g,2.8,.045,1.8,0,.035,0,'#f4b400',{ns:1});bx(g,2.3,.05,1.3,0,.04,0,'#0b8f5a',{ns:1});bx(g,1.2,.055,.5,0,.045,0,'#1f3fbf',{ns:1})}},
 table:{n:'Dining set',e:'🍽️',p:450,w:2.6,d:2.4,b:function(g){bx(g,2.2,.1,1.3,0,.85,0,'#8a5a32');[[-1,-.5],[1,-.5],[-1,.5],[1,.5]].forEach(function(l){bx(g,.1,.8,.1,l[0],.4,l[1],'#5b3a22')});[[-.6,-1],[.6,-1],[-.6,1],[.6,1]].forEach(function(c){bx(g,.5,.08,.5,c[0],.5,c[1],'#2d2d33');bx(g,.5,.6,.08,c[0],.85,c[1]+(c[1]<0?-.22:.22),'#2d2d33')});bx(g,.5,.12,.4,0,.96,0,'#f2f2f2')}},
 fridge:{n:'Double-door fridge',e:'🧊',p:380,w:1,d:.9,b:function(g){bx(g,.95,1.95,.8,0,.98,0,'#c9ced6',{m:.5,r:.35});bx(g,.04,1.9,.02,0,.98,.41,'#8a929c');bx(g,.05,.5,.06,-.12,1.4,.43,'#555');bx(g,.05,.5,.06,.12,1.4,.43,'#555')}},
 gen:{n:'Generator (Mikano)',e:'⚡',p:250,w:1.3,d:.9,b:function(g){bx(g,1.2,.8,.8,0,.5,0,'#d83a2a');bx(g,1.25,.1,.85,0,.1,0,'#222');bx(g,.9,.25,.04,0,.6,.42,'#ffd23f');cy(g,.07,.07,.5,.45,1.05,-.2,'#333');bx(g,.3,.3,.04,-.3,.62,.42,'#111')}},
 inv:{n:'Inverter + batteries',e:'🔋',p:300,w:1.3,d:.7,b:function(g){bx(g,.6,.9,.45,-.3,.5,0,'#2b3a55');bx(g,.04,.2,.02,-.3,.8,.24,'#41e08a',{mat:new THREE.MeshBasicMaterial({color:0x41e08a}),ns:1});bx(g,.5,.45,.4,.35,.25,0,'#3c3c42');bx(g,.5,.45,.4,.35,.7,0,'#3c3c42')}},
 plant:{n:'Potted plant',e:'🪴',p:40,w:.7,d:.7,b:function(g){if(real(g,'pot2',1.2,0))return;cy(g,.28,.2,.45,0,.23,0,'#b5651d');cy(g,.0,.4,.8,0,.85,0,'#1f8f3a');cy(g,.0,.3,.7,0,1.3,0,'#27a846')}},
 wardrobe:{n:'Wardrobe',e:'🚪',p:300,w:1.9,d:.8,b:function(g){bx(g,1.8,2.2,.7,0,1.1,0,'#6a4326');bx(g,.02,2.1,.02,0,1.1,.36,'#2e1c0e');bx(g,.05,.3,.05,-.1,1.1,.38,'#d9b45a');bx(g,.05,.3,.05,.1,1.1,.38,'#d9b45a')}},
 fan:{n:'Standing fan',e:'🌀',p:60,w:.7,d:.7,b:function(g){cy(g,.25,.3,.08,0,.05,0,'#222');cy(g,.04,.04,1.2,0,.7,0,'#999');var h=cy(g,.35,.35,.1,0,1.4,0,'#d8dde6',{op:.9});h.rotation.x=Math.PI/2;g.userData.spin=h}},
 shelf:{n:'Bookshelf',e:'📚',p:150,w:1.6,d:.5,b:function(g){bx(g,1.5,2,.4,0,1,0,'#5a3b23');for(var i=0;i<4;i++){var y=.3+i*.5;bx(g,1.4,.04,.38,0,y,.02,'#3b2614');for(var k=0;k<7;k++)bx(g,.12,.34,.28,-.6+k*.2,y+.2,.02,['#c0392b','#2e86de','#f4b400','#0b8f5a','#8e44ad'][(k+i)%5])}}},
 desk:{n:'Gaming setup',e:'🎮',p:500,w:2,d:1,b:function(g){bx(g,1.9,.08,.9,0,.8,0,'#1c1c22');bx(g,.08,.8,.8,-.9,.4,0,'#1c1c22');bx(g,.08,.8,.8,.9,.4,0,'#1c1c22');bx(g,.9,.5,.05,0,1.1,-.2,'#05060a');bx(g,.85,.44,.02,0,1.1,-.17,'#ff2a9d',{mat:new THREE.MeshBasicMaterial({color:0xff3fa6}),ns:1});bx(g,.5,.04,.2,0,.86,.15,'#2a2a30');bx(g,.5,.7,.5,0,.45,.9,'#2a2a30');bx(g,.5,.1,.5,0,.85,.9,'#ff2a2a')}},
 lamp:{n:'Floor lamp',e:'💡',p:80,w:.5,d:.5,b:function(g){cy(g,.18,.2,.05,0,.03,0,'#222');cy(g,.025,.025,1.5,0,.8,0,'#444');cy(g,.2,.3,.35,0,1.7,0,'#ffe9a8',{mat:new THREE.MeshBasicMaterial({color:0xffe08a}),seg:10})}},
 flag:{n:'Nigerian flag',e:'🇳🇬',p:50,w:.6,d:.4,b:function(g){cy(g,.025,.025,2.2,0,1.1,0,'#bbb');bx(g,.4,.7,.02,-.22,1.85,0,'#0b8f3a');bx(g,.4,.7,.02,.18,1.85,0,'#ffffff');bx(g,.4,.7,.02,.58,1.85,0,'#0b8f3a')}},
 speaker:{n:'Party speaker',e:'🔊',p:200,w:.9,d:.8,b:function(g){bx(g,.8,1.5,.7,0,.75,0,'#111');cy(g,.28,.28,.05,0,1.05,.37,'#333').rotation.x=Math.PI/2;cy(g,.16,.16,.05,0,.45,.37,'#333').rotation.x=Math.PI/2;cy(g,.08,.08,.06,0,1.05,.4,'#555').rotation.x=Math.PI/2}},
 kitchen:{n:'Kitchen counter',e:'🍳',p:350,w:2.6,d:.9,b:function(g){bx(g,2.5,.9,.8,0,.45,0,'#e8e3d6');bx(g,2.55,.06,.85,0,.93,0,'#2b2b30');bx(g,.7,.04,.5,-.6,.97,0,'#8d96a3',{m:.8,r:.3});[-.3,.3].forEach(function(x){cy(g,.13,.13,.02,x+.6,.97,0,'#111')});bx(g,.5,.02,.3,.2,.97,.15,'#d8d8d8')}}
};
ITEMS.bed1={n:'Modern bed',e:'🛏️',p:300,w:2.3,d:2.5,b:function(g){if(!real(g,'bed1',1,Math.PI)){bx(g,2.2,.5,2.4,0,.3,0,'#e9a36b')}}};
ITEMS.pot1={n:'Orange tree',e:'🍊',p:90,w:.7,d:.7,b:function(g){if(!real(g,'pot1',1.6,0)){cy(g,.28,.2,.45,0,.23,0,'#444')}}};
ITEMS.lsofa={n:'L-shaped sofa',e:'🛋️',p:600,w:4,d:3,b:function(g){var c='#e2d6bd';bx(g,3.8,.5,1.2,0,.3,-.9,c);bx(g,3.8,.8,.3,0,.8,-1.4,c);bx(g,1.3,.5,2.4,-1.25,.3,.3,c);bx(g,.3,.7,2.4,-1.8,.65,.3,c);bx(g,.35,.3,.35,1.2,.75,-.8,'#d6a738')}};
ITEMS.snooker={n:'Snooker table',e:'🎱',p:900,w:3.2,d:1.9,b:function(g){bx(g,3,.2,1.7,0,.82,0,'#6a4326');bx(g,2.7,.06,1.4,0,.95,0,'#1a7a3a');[[-1.4,-.8],[1.4,-.8],[-1.4,.8],[1.4,.8]].forEach(function(p){bx(g,.2,.8,.2,p[0],.4,p[1],'#4a2f1b')});bx(g,3.1,.12,.12,0,1.02,.84,'#5a3a22');bx(g,3.1,.12,.12,0,1.02,-.84,'#5a3a22');[[-.6,.1],[-.2,.3],[.3,-.2],[.6,.2]].forEach(function(p,i){var b=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),M(['#d6252b','#f2b705','#fff','#111'][i],.3));b.position.set(p[0],1.04,p[1]);g.add(b)})}};
ITEMS.fishtank={n:'Fish tank',e:'🐠',p:450,w:1.8,d:.7,b:function(g){bx(g,1.7,.8,.6,0,.4,0,'#2a2a2e');bx(g,1.6,.8,.5,0,1.2,0,'#fff',{mat:new THREE.MeshStandardMaterial({color:0x4fc3f7,transparent:true,opacity:.45,roughness:.1}),ns:1});[[-.4,1.2,.05,0xff8a2a],[.3,1.0,-.05,0xffd23f],[0,1.4,.1,0xff4fa3]].forEach(function(f){var m=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:f[3]}));m.position.set(f[0],f[1],f[2]);g.add(m)});bx(g,1.6,.06,.5,0,1.62,0,'#2a2a2e')}};
ITEMS.dispenser={n:'Water dispenser',e:'🚰',p:120,w:.5,d:.5,b:function(g){bx(g,.4,1.1,.4,0,.55,0,'#e8ecf2');bx(g,.3,.5,.3,0,1.35,0,'#fff',{mat:new THREE.MeshStandardMaterial({color:0x9fd8ff,transparent:true,opacity:.6}),ns:1});bx(g,.06,.06,.06,-.08,.9,.21,'#2f80ed');bx(g,.06,.06,.06,.08,.9,.21,'#d6252b')}};
ITEMS.cooler={n:'Cooler box',e:'🧊',p:60,w:.9,d:.6,b:function(g){bx(g,.8,.5,.5,0,.25,0,'#2f80ed');bx(g,.82,.08,.52,0,.54,0,'#fff')}};
ITEMS.gclock={n:'Standing clock',e:'🕰️',p:250,w:.6,d:.5,b:function(g){bx(g,.5,2.2,.4,0,1.1,0,'#5b3a22');var f=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.04,16),new THREE.MeshStandardMaterial({color:0xf6f1e6}));f.rotation.x=Math.PI/2;f.position.set(0,1.7,.22);g.add(f)}};
ITEMS.daybed={n:'Vintage day bed',e:'🛋️',p:700,w:2.2,d:1.2,b:function(g){window.HM&&HM.add(g,'daybed',0,0,0,1,0)}};
ITEMS.chandelier={n:'Crystal chandelier',e:'💡',p:900,w:1.2,d:1.2,b:function(g){window.HM&&HM.add(g,'chandelier',0,3.95,0,1.7,0);var l=new THREE.PointLight(0xffe6b0,1.4,16);l.position.set(0,2.9,0);g.add(l)}};
ITEMS.football={n:'Football',e:'⚽',p:60,w:.5,d:.5,b:function(g){window.HM&&HM.add(g,'football',0,0,0,1.3,0)}};
ITEMS.pistolcase={n:'Display pistol',e:'🔫',p:300,w:.6,d:.4,b:function(g){bx(g,.6,.9,.4,0,.45,0,'#2a2a2e');bx(g,.5,.04,.34,0,.92,0,'#101012');window.HM&&HM.add(g,'pistol',0,1.0,0,2.2,-Math.PI/2)}};
var ORDER=['bed','sofa','tv','rug','table','kitchen','fridge','gen','inv','wardrobe','shelf','desk','speaker','lamp','fan','plant','flag','lsofa','snooker','fishtank','dispenser','cooler','gclock','daybed','chandelier','football','pistolcase','bed1','pot1'];

/* ---- racing channel on every TV ---- */
var tvCv=null,tvTx=null,tvM=null,tvT0=performance.now();
function tvMat(){if(tvM)return tvM;tvCv=document.createElement('canvas');tvCv.width=256;tvCv.height=144;tvTx=new THREE.CanvasTexture(tvCv);tvM=new THREE.MeshBasicMaterial({map:tvTx,toneMapped:false});drawTv();return tvM}
var TVCARS=[['#ff3b3b','Speedy'],['#35c6ff','Ada'],['#ffd23f','Tunde'],['#7dff6a','Zara']];
function drawTv(){if(!tvCv)return;var c=tvCv.getContext('2d'),t=(performance.now()-tvT0)/1000;
  c.fillStyle='#0b3d1f';c.fillRect(0,0,256,144);c.fillStyle='#0f5a2c';for(var i=0;i<8;i++)c.fillRect(0,i*18+(Math.floor(t*4)%2)*9,256,9);
  c.lineWidth=14;c.strokeStyle='#2a2f38';c.beginPath();c.ellipse(128,76,92,38,0,0,6.283);c.stroke();c.lineWidth=1;c.strokeStyle='#fff6';c.setLineDash([6,6]);c.beginPath();c.ellipse(128,76,92,38,0,0,6.283);c.stroke();c.setLineDash([]);
  var pos=TVCARS.map(function(cr,i){var a=t*(.9+i*.07)+i*.55+Math.sin(t*.7+i)*.4;return{a:a,i:i}});
  pos.forEach(function(p){var x=128+Math.cos(p.a)*92,y=76+Math.sin(p.a)*38;c.fillStyle=TVCARS[p.i][0];c.fillRect(x-6,y-3.5,12,7);c.fillStyle='#fff';c.fillRect(x+(Math.sin(p.a)>0?-5:2),y-2,3,4)});
  pos.sort(function(a,b){return b.a-a.a});
  c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,0,256,18);c.fillStyle='#ff4040';c.fillRect(6,5,8,8);c.fillStyle='#fff';c.font='bold 11px sans-serif';c.fillText('HEIRLOOM RACING · LIVE',20,13);c.fillText('LAP '+(1+Math.floor(t/18)%5)+'/5',208,13);
  c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,120,256,24);c.font='bold 10px sans-serif';pos.forEach(function(p,k){c.fillStyle=TVCARS[p.i][0];c.fillText((k+1)+'. '+TVCARS[p.i][1],8+k*62,136)});
  tvTx.needsUpdate=true}
function buildItem(k,ghostMode){var def=ITEMS[k],g=new THREE.Group();def.b(g);if(ghostMode){g.traverse(function(o){if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55}})}return g}

/* ---------------- the house shell ---------------- */
function pickSpot(){var best=null,bd=-1,pois=(CITY&&CITY.pois)||[];
  for(var gx=2;gx<N-2;gx+=2)for(var gz=2;gz<N-2;gz+=2){var x=bcx(gx),z=bcx(gz),m=1e9;pois.forEach(function(p){var d=Math.hypot(p.pos.x-x,p.pos.z-z);if(d<m)m=d});if(m>bd){bd=m;best=[x,z]}}
  return best||[0,0]}
function wallsBoxes(f){var o=[[X0-.3,Z0-.3,X1+.3,Z0,'n'],[X0-.3,Z1,X1+.3,Z1+.3,'s'],[X1,Z0-.3,X1+.3,Z1+.3,'e'],[X0-.3,Z0-.3,X0,-1.6,'w1'],[X0-.3,1.6,X0,Z1+.3,'w2']];
  if(!f){o.push([-.15,Z0,.15,-1.6,'pa1'],[-.15,1.6,.15,Z1,'pa2'],[0,-.15,4.5,.15,'pb1'],[7.5,-.15,12,.15,'pb2'])}
  else{o.push([-2,-.15,3.5,.15,'pc1'],[6.5,-.15,12,.15,'pc2'])}return o}
var _terr=null;
function terrazzo(){if(_terr)return _terr;var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d');x.fillStyle='#d9cfbf';x.fillRect(0,0,256,256);
  var cols=['#a9473a','#7d5a4a','#b8b0a2','#8c7f72','#c9a98a','#5d5148'];for(var i=0;i<520;i++){x.fillStyle=cols[i%cols.length];var r=1+Math.random()*3.2;x.beginPath();x.ellipse(Math.random()*256,Math.random()*256,r*1.4,r,Math.random()*3,0,6.283);x.fill()}
  var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,7.5);_terr=new THREE.MeshStandardMaterial({map:t,roughness:.3,metalness:.05});return _terr}

var TIERS=[null,{n:'Family Flat',e:'🏠',p:0,d:'Cosy two-floor home'},{n:'Duplex Villa',e:'🏡',p:350000,d:'Marble floors, crystal chandelier, gold trim, pool outside'},{n:'Luxury Mansion',e:'🏰',p:3000000,d:'Black-and-gold marble, stone walls, LED lights, 3 storeys outside'}];
function tier(){var t=GUEST?GUEST.tier:((S.house&&S.house.tier)||1);return t<1?1:t>3?3:t}
var _mar={};
function marble(kind){if(_mar[kind])return _mar[kind];var c=document.createElement('canvas');c.width=c.height=512;var x=c.getContext('2d'),dark=kind==='black';
  x.fillStyle=dark?'#17171b':'#f3f0e8';x.fillRect(0,0,512,512);
  for(var i=0;i<26;i++){x.strokeStyle=dark?(i%3?'rgba(212,175,55,.55)':'rgba(255,255,255,.18)'):(i%3?'rgba(120,120,125,.28)':'rgba(190,175,150,.35)');x.lineWidth=.6+Math.random()*1.6;x.beginPath();var px=Math.random()*512,py=Math.random()*512;x.moveTo(px,py);for(var k=0;k<6;k++){px+=(Math.random()-.3)*120;py+=(Math.random()-.5)*90;x.lineTo(px,py)}x.stroke()}
  x.strokeStyle=dark?'#d4af37':'#cfc8b6';x.lineWidth=dark?5:3;for(var g=0;g<=512;g+=256){x.beginPath();x.moveTo(g,0);x.lineTo(g,512);x.stroke();x.beginPath();x.moveTo(0,g);x.lineTo(512,g);x.stroke()}
  var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(24.6/10,18.6/10);var m=new THREE.MeshStandardMaterial({map:t,roughness:.12,metalness:.25});_mar[kind]=m;return m}
var _stone=null;
function stoneMat(){if(_stone)return _stone;var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d');x.fillStyle='#8b857a';x.fillRect(0,0,256,256);
  for(var r=0;r<8;r++)for(var k=0;k<4;k++){var w=64,off=(r%2)*32;x.fillStyle='hsl(35,'+(8+Math.random()*10)+'%,'+(42+Math.random()*18)+'%)';x.fillRect(k*w+off+2,r*32+2,w-4,28)}
  var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,2);_stone=new THREE.MeshStandardMaterial({map:t,roughness:.9});return _stone}
function chandelier(g,x,y,z,sz){var gold=M('#d4af37',.3,.8),rl=new THREE.MeshBasicMaterial({color:0xfff1c8,toneMapped:false});
  var r=new THREE.Mesh(new THREE.CylinderGeometry(.04*sz,.04*sz,1.6*sz,6),gold);r.position.set(x,y+.8*sz,z);g.add(r);
  [1,.62,.34].forEach(function(f,i){var ring=new THREE.Mesh(new THREE.TorusGeometry(.9*sz*f,.04*sz,6,26),gold);ring.rotation.x=Math.PI/2;ring.position.set(x,y-i*.5*sz,z);g.add(ring);
    for(var a=0;a<12;a++){var an=a/12*6.283,b=new THREE.Mesh(new THREE.SphereGeometry(.08*sz,6,6),rl);b.position.set(x+Math.cos(an)*.9*sz*f,y-i*.5*sz-.05*sz,z+Math.sin(an)*.9*sz*f);g.add(b);
      var dr=new THREE.Mesh(new THREE.ConeGeometry(.035*sz,.3*sz,5),new THREE.MeshBasicMaterial({color:0xcfe9ff,toneMapped:false}));dr.rotation.x=Math.PI;dr.position.set(b.position.x,y-i*.5*sz-.25*sz,b.position.z);g.add(dr)}});}
function lux(g,t){
  var gold=M('#d4af37',.3,.8),ivory='#f4eedf';
  // ivory wall panels over the plain walls + gold crown moulding and skirting
  [[Z0+.2,0],[Z1-.2,0]].forEach(function(p){bx(g,24.4,3.4,.08,0,FY+1.9,p[0],t===3?'#e9e1cf':ivory,{ns:1});bx(g,24.4,.14,.2,0,FY+3.55,p[0],null,{mat:gold,ns:1});bx(g,24.4,.2,.14,0,FY+.12,p[0],null,{mat:gold,ns:1})});
  // pilasters with gold capitals along the back wall
  for(var px=-10;px<=10;px+=4){bx(g,.55,3.4,.22,px,FY+1.9,Z0+.3,ivory,{ns:1});bx(g,.7,.18,.3,px,FY+3.6,Z0+.3,null,{mat:gold,ns:1});bx(g,.7,.18,.3,px,FY+.2,Z0+.3,null,{mat:gold,ns:1})}
  // stone-clad feature wall in the parlour (west wall inside) and dining (east wall)
  bx(g,.12,7.6,7.2,X0+.2,FY+3.8,-5.2,null,{mat:stoneMat(),ns:1});bx(g,.12,7.6,7.2,X0+.2,FY+3.8,5.2,null,{mat:stoneMat(),ns:1});bx(g,.12,4.4,3.4,X0+.2,FY+5.8,0,null,{mat:stoneMat(),ns:1});
  // the big crystal chandelier over the double-height parlour
  chandelier(g,-6.5,FY+6.4,-1.5,t===3?1.5:1.15);
  if(t>=3){chandelier(g,6.5,UY-1.5,-4,.6);
    // glowing LED cove lines around the parlour ceiling + gold-framed mirrors
    var led=new THREE.MeshBasicMaterial({color:0x7fb8ff,toneMapped:false}),warm=new THREE.MeshBasicMaterial({color:0xffd28a,toneMapped:false});
    bx(g,10,.06,.1,-6.9,FY+7.9,Z0+.4,'#fff',{mat:led,ns:1});bx(g,10,.06,.1,-6.9,FY+7.9,Z1-.4,'#fff',{mat:led,ns:1});bx(g,.1,.06,17,X0+.5,FY+7.9,0,'#fff',{mat:warm,ns:1});
    [-9,-3].forEach(function(x){bx(g,2,3,.1,x,FY+3.2,Z0+.28,null,{mat:gold,ns:1});bx(g,1.8,2.8,.06,x,FY+3.2,Z0+.34,'#bcd2e0',{m:.9,r:.05,ns:1})});
    // indoor palms in gold planters either side of the door
    [[-11,-3.2],[-11,3.2]].forEach(function(p){bx(g,.8,.8,.8,p[0],FY+.4,p[1],null,{mat:gold,ns:1});for(var k=0;k<6;k++){var l=bx(g,.12,1.7,.5,p[0]+Math.cos(k)*.2,FY+1.6,p[1]+Math.sin(k)*.2,'#2f8a3e',{ns:1});l.rotation.set(Math.sin(k)*.5,k,Math.cos(k)*.5)}});
  }
}
function build(){
  if(grp)return;var sp=pickSpot();CX=sp[0];CZ=sp[1];grp=new THREE.Group();grp.position.set(CX,0,CZ);
  var g=grp;
  // floors: tiled ground floor + upper slab (with the stair opening left open)
  var T=tier();bx(g,24.6,.5,18.6,0,FY-.25,0,null,{mat:T===1?terrazzo():marble(T===3?'black':'white')});
  if(T>=2)bx(g,14.2,.4,18.2,5,UY-.2,0,null,{mat:marble('white')});else{bx(g,14.2,.4,18.2,5,UY-.2,0,'#b78a5a',{r:.55});for(var j2=-8.5;j2<9;j2+=1)bx(g,14.1,.02,.03,5,UY+.005,j2,'#8d6a42',{ns:1})}
  // walls (cream with a teal accent wall and a red-brown trim, very Lagos)
  bx(g,24.6,WH,.3,0,FY+WH/2,Z0-.15,'#f1e8d2');bx(g,24.6,WH,.3,0,FY+WH/2,Z1+.15,'#f1e8d2');bx(g,.3,WH,18.6,X1+.15,FY+WH/2,0,'#1f9a8c');
  bx(g,.3,WH,7.4,X0-.15,FY+WH/2,-5.3,'#f1e8d2');bx(g,.3,WH,7.4,X0-.15,FY+WH/2,5.3,'#f1e8d2');bx(g,.3,WH-3.2,3.2,X0-.15,FY+3.2+(WH-3.2)/2,0,'#f1e8d2');
  bx(g,24.7,.4,.35,0,FY+.2,Z0-.15,'#8a3b24');bx(g,24.7,.4,.35,0,FY+.2,Z1+.15,'#8a3b24');
  // door frame + a green "WELCOME" mat
  bx(g,.35,.2,3.4,X0-.15,FY+3.1,0,'#5b3a22');bx(g,.35,3.1,.2,X0-.15,FY+1.55,-1.6,'#5b3a22');bx(g,.35,3.1,.2,X0-.15,FY+1.55,1.6,'#5b3a22');bx(g,1.6,.04,2.4,X0+.8,FY+.04,0,'#0b8f3a',{ns:1});
  // windows with burglar-proof bars on the back wall + front wall
  [-7,-2.5,2.5,7].forEach(function(x){bx(g,2.2,1.6,.06,x,FY+3.2,Z0+.02,'#9bd7ee',{op:.55,m:.4,ns:1});for(var b=-.9;b<=.9;b+=.3)bx(g,.04,1.6,.04,x+b,FY+3.2,Z0+.08,'#1b1b1f',{ns:1});bx(g,2.4,.08,.1,x,FY+4.05,Z0+.05,'#1b1b1f',{ns:1});bx(g,2.4,.08,.1,x,FY+2.35,Z0+.05,'#1b1b1f',{ns:1});
    bx(g,2.2,1.6,.06,x,FY+3.2,Z1-.02,'#9bd7ee',{op:.55,m:.4,ns:1});for(var b2=-.9;b2<=.9;b2+=.3)bx(g,.04,1.6,.04,x+b2,FY+3.2,Z1-.08,'#1b1b1f',{ns:1})});
  // upper-floor windows
  [-.5,4,9].forEach(function(x){bx(g,2.2,1.6,.06,x,UY+2.2,Z0+.02,'#9bd7ee',{op:.55,ns:1});bx(g,2.2,1.6,.06,x,UY+2.2,Z1-.02,'#9bd7ee',{op:.55,ns:1})});
  var PW='#efe6d2',DF='#5b3a22';
  function wall(x0,z0,x1,z1,y0,h){var w=Math.abs(x1-x0)||.3,d=Math.abs(z1-z0)||.3;bx(g,w,h,d,(x0+x1)/2,y0+h/2,(z0+z1)/2,PW);bx(g,w+.04,.3,d+.04,(x0+x1)/2,y0+.15,(z0+z1)/2,'#8a3b24',{ns:1})}
  wall(0,Z0,0,-1.6,FY,3.6);wall(0,1.6,0,Z1,FY,3.6);wall(0,-1.6,0,1.6,FY+3.2,.4);bx(g,.4,3.2,.18,0,FY+1.6,-1.6,DF);bx(g,.4,3.2,.18,0,FY+1.6,1.6,DF);
  wall(0,0,4.5,0,FY,3.6);wall(7.5,0,12,0,FY,3.6);wall(4.5,0,7.5,0,FY+3.2,.4);bx(g,.18,3.2,.4,4.5,FY+1.6,0,DF);bx(g,.18,3.2,.4,7.5,FY+1.6,0,DF);
  wall(-2,0,3.5,0,UY,4.2);wall(6.5,0,12,0,UY,4.2);wall(3.5,0,6.5,0,UY+3.2,1.0);bx(g,.18,3.2,.4,3.5,UY+1.6,0,DF);bx(g,.18,3.2,.4,6.5,UY+1.6,0,DF);
  var rl=new THREE.MeshBasicMaterial({color:0xfff0c4,toneMapped:false});for(var rx=1;rx<=11;rx+=3.3)for(var rz=-6;rz<=6;rz+=4){var d=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.03,12),rl);d.position.set(rx,UY-.43,rz);g.add(d)}
  bx(g,.04,.9,.04,6.5,UY-.85,4.8,'#c9a84a',{ns:1});for(var a2=0;a2<6;a2++){var bl=new THREE.Mesh(new THREE.SphereGeometry(.15,8,8),rl);bl.position.set(6.5+Math.cos(a2*1.047)*.7,UY-1.4,4.8+Math.sin(a2*1.047)*.7);g.add(bl)}
  var cl=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.06,24),M('#f6f1e6',.5));cl.rotation.x=Math.PI/2;cl.position.set(-6,FY+5,Z0+.12);g.add(cl);bx(g,.04,.35,.02,-6,FY+5.1,Z0+.17,'#222',{ns:1});bx(g,.25,.03,.02,-5.9,FY+5,Z0+.17,'#222',{ns:1});
  // stairs: a real sloped ramp with step treads so it reads as stairs
  var rampLen=Math.hypot(8,UY-FY),ang=Math.atan2(UY-FY,8);
  var ramp=bx(g,rampLen,.3,3,-6,FY+2-.15,7.5,'#8d6a42');ramp.rotation.z=ang;
  for(var s=0;s<16;s++){var sx=-10+s*0.5+.25,sy=FY+(s+1)*(UY-FY)/16;bx(g,.5,.12,3,sx,sy-.06,7.5,s%2?'#a5784a':'#b58656',{ns:1})}
  bx(g,8.3,.9,.1,-6,FY+2.8,6.0,'#5b3a22',{ns:1});for(var r=-10;r<=-2;r+=1)bx(g,.06,1,.06,r,(FY+(r+10)/8*(UY-FY))+.5,6.0,'#2b1c12',{ns:1});
  // upstairs rail along the void edge
  bx(g,.1,1,15.2,-1.95,UY+.5,-1.4,'#2b1c12',{ns:1});
  // a framed painting + a clock to make it feel lived-in
  bx(g,2,1.2,.06,-4,FY+4,Z1-.05,'#1b1b1f');bx(g,1.8,1,.04,-4,FY+4,Z1-.09,'#e0a33a');bx(g,.9,.6,.04,-4.3,FY+4,Z1-.12,'#c0392b');
  if(T>=2)lux(g,T);
  scene.add(g);
  // collision maps for each floor
  for(var f=0;f<2;f++){var m=new Map(),old=colBoxes;colBoxes=m;
    wallsBoxes(f).forEach(function(w){colAddBox(CX+w[0],CZ+w[1],CX+w[2],CZ+w[3],FY+WH,'hw')});
    colAddBox(CX-10,CZ+5.85,CX-2,CZ+6.15,FY+1.2,'hr');                           // stair side rail (both floors)
    if(f===1){colAddBox(CX-2.1,CZ-9,CX-1.8,CZ+5.85,UY+1,'hr2')}                   // upstairs void rail
    maps[f]=m;colBoxes=old}
  lights=[[0,3,0],[6,UY+3,0],[-6,UY+2,-4]].map(function(p,i){var l=new THREE.PointLight(i===0?0xfff0d0:0xffe6b8,i===0?1.6:1.3,i===0?30:24,1.6);l.position.set(CX+p[0],FY+p[1],CZ+p[2]);return l})}

/* ---------------- ground height + floor switching while inside ---------------- */
groundH=function(x,z){if(!IN)return ogh(x,z);
  var lx=x-CX,lz=z-CZ;
  if(lx>=-10&&lx<=-2&&lz>=6&&lz<=9)return FY+(lx+10)/8*(UY-FY);
  if(lx>=-2&&lx<=12&&lz>=-9&&lz<=9&&player.y>UY-2.2)return UY;
  return FY};
function pickFloor(){if(!IN)return;var f=player.y>FY+2.4?1:0;
  var lx=player.x-CX,lz=player.z-CZ;if(lx>=-10&&lx<=-2&&lz>=5.5&&lz<=9.5)f=player.y>FY+3.2?1:0;
  if(f!==floorNow||colBoxes!==maps[f]){floorNow=f;colBoxes=maps[f]}}

/* ---------------- placing / saving furniture ---------------- */
var meshes=[];
function itemBoxes(it,f){var d=ITEMS[it.k];if(!d||d.flat)return;var w=(it.r%2)?d.d:d.w,h=(it.r%2)?d.w:d.d,m=maps[it.f||0];if(!m)return;var old=colBoxes;colBoxes=m;
  colAddBox(CX+it.x-w/2+.05,CZ+it.z-h/2+.05,CX+it.x+w/2-.05,CZ+it.z+h/2-.05,(it.f?UY:FY)+1.4,'fx');colBoxes=old}
function rebuildMaps(){for(var f=0;f<2;f++){var m=new Map(),old=colBoxes;colBoxes=m;
    wallsBoxes(f).forEach(function(w){colAddBox(CX+w[0],CZ+w[1],CX+w[2],CZ+w[3],FY+WH,'hw')});colAddBox(CX-10,CZ+5.85,CX-2,CZ+6.15,FY+1.2,'hr');if(f===1)colAddBox(CX-2.1,CZ-9,CX-1.8,CZ+5.85,UY+1,'hr2');maps[f]=m;colBoxes=old}
  curItems().forEach(function(it){itemBoxes(it)});floorNow=-1;pickFloor()}
function drawItems(){meshes.forEach(function(m){grp.remove(m)});meshes=[];
  curItems().forEach(function(it,i){var g=buildItem(it.k);g.position.set(it.x,(it.f?UY:FY),it.z);g.rotation.y=it.r*Math.PI/2;g.userData.idx=i;grp.add(g);meshes.push(g)})}
function snap(v){return Math.round(v*4)/4}
function placeSpot(){var f=player.h,d=PL&&ITEMS[PL.k]?Math.max(ITEMS[PL.k].w,ITEMS[PL.k].d)/2+1.0:1.8;
  var x=snap(player.x-CX+Math.sin(f)*d),z=snap(player.z-CZ+Math.cos(f)*d);
  x=Math.max(X0+.6,Math.min(X1-.6,x));z=Math.max(Z0+.6,Math.min(Z1-.6,z));return{x:x,z:z,f:player.y>FY+2.4?1:0}}
function startPlacing(k,free){if(ghost){grp.remove(ghost);ghost=null}PL={k:k,r:0,free:!!free};ghost=buildItem(k,true);grp.add(ghost);ui()}
function stopPlacing(){if(ghost){grp.remove(ghost);ghost=null}PL=null;ui()}
function confirmPlace(){if(!PL)return;var d=ITEMS[PL.k],s=placeSpot();
  if(!PL.free){if(!spend(d.p))return}
  home().items.push({k:PL.k,x:s.x,z:s.z,r:PL.r,f:s.f});if(home().items.length>60)home().items.shift();
  drawItems();rebuildMaps();try{saveGame()}catch(e){}toast('✅ '+d.n+' placed');stopPlacing()}
function pickUpNearest(){var best=-1,bd=4.5,items=home().items;
  items.forEach(function(it,i){var dx=it.x+CX-player.x,dz=it.z+CZ-player.z;var dd=Math.hypot(dx,dz);if(dd<bd&&(it.f?1:0)===(player.y>FY+2.4?1:0)){bd=dd;best=i}});
  if(best<0){toast('Walk close to the item you want to move');return}
  var it=items.splice(best,1)[0];drawItems();rebuildMaps();startPlacing(it.k,true);PL.r=it.r;toast('Move it, then tap ✅ Place')}
function sellNearest(){var best=-1,bd=4.5,items=home().items;
  items.forEach(function(it,i){var dd=Math.hypot(it.x+CX-player.x,it.z+CZ-player.z);if(dd<bd&&(it.f?1:0)===(player.y>FY+2.4?1:0)){bd=dd;best=i}});
  if(best<0){toast('Walk close to the item you want to sell');return}
  var it=items.splice(best,1)[0],d=ITEMS[it.k];player.money+=Math.round(d.p*.5);drawItems();rebuildMaps();try{saveGame()}catch(e){}toast('Sold '+d.n+' for $'+Math.round(d.p*.5))}

/* ---------------- on-screen buttons ---------------- */
var bar=null;
function ui(){if(!bar){bar=el('div','position:fixed;left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:31;display:none;gap:8px;align-items:center');document.body.appendChild(bar)}
  var st='padding:9px 14px;border-radius:14px;border:1px solid #fff5;background:rgba(0,0,0,.62);color:#fff;font:800 14px system-ui,sans-serif';
  bar.innerHTML='';
  function btn(t,fn,col){var b=el('button',st+(col?';background:'+col:''),t);b.onclick=function(e){e.stopPropagation();fn()};bar.appendChild(b)}
  if(PL){btn('✅ Place'+(PL.free?'':' · $'+ITEMS[PL.k].p),confirmPlace,'#0a7a55');btn('🔄 Turn',function(){PL.r=(PL.r+1)%4});btn('✖',stopPlacing,'#8a2030')}
  else{if(!GUEST)btn('🛋️ Decorate',function(){show('decor',{})});btn(player.sitting?'🧍 Stand':'🪑 Sit',toggleSit);btn(TOPV?'✖ Close view':'🔭 Top view',function(){setTop(TOPV?(TOPV===1?2:0):1)});btn('🚪 Leave',exitHouse)}
  bar.style.display=IN&&window.__mode==='play'?'flex':'none'}

P.decor=function(){var it=home().items.length;
  return{cls:'tall',h:hd('🛋️ Decorate your house',it+' items · walk up the stairs to decorate upstairs too')
   +'<div class="grid" style="grid-template-columns:repeat(3,1fr)">'+ORDER.map(function(k){var d=ITEMS[k];return'<button class="tile" data-a="decobuy" data-v="'+k+'"><span class="em">'+d.e+'</span><b style="font-size:12px">'+d.n+'</b><em>$'+d.p+'</em></button>'}).join('')+'</div>'
   +'<div class="row" style="margin-top:10px;flex-wrap:wrap">'+B('decomove','','✋ Move nearest','alt sm')+B('decosell','','💰 Sell nearest (50%)','alt sm')+B('close','','Done','sm')+'</div><div class="cap">Pick an item, walk to where you want it, then tap ✅ Place. Face the way you want it to face.</div>'}};
ACT.enterhome=function(){closeSheet();enterHouse()};
ACT.decomove=function(){closeSheet();pickUpNearest()};
ACT.decosell=function(){sellNearest();refresh()};
var oh=P.home;P.home=function(a){var r=oh(a);r.h=r.h.replace('<div class="cap">Sleep','<div class="grid g2" style="margin-top:8px"><button class="tile" data-a="enterhome"><span class="em">🚪</span><b>Go inside</b><em>stairs · decorate</em></button><button class="tile" data-a="houseup"><span class="em">🏗️</span><b>Upgrade house</b><em>bigger · luxury</em></button></div><div class="cap">Sleep');return r};

P.houseup=function(){var t=tier(),rows=[1,2,3].map(function(i){var T=TIERS[i],own=i<=t,nx=i===t+1;
  return'<div class="item"><span class="ie">'+T.e+'</span><b>'+T.n+'<small>'+T.d+'</small></b>'+(own?'<span class="tag">'+(i===t?'YOURS':'✓')+'</span>':(nx?'<button class="btn sm" data-a="houseup2" data-v="'+i+'">$'+T.p.toLocaleString()+'</button>':'<span class="tag" style="opacity:.6">Upgrade '+(t+1)+' first</span>'))+'</div>'}).join('');
  return{cls:'tall',h:hd('🏗️ Upgrade your house','Spend money to turn your home into a mansion')+rows+'<div class="cap" style="margin-top:8px">Your furniture and your cars stay with you.</div>'}};
ACT.houseup=function(){show('houseup',{})};
ACT.houseup2=function(v){v=+v;var t=tier();if(v!==t+1||!TIERS[v])return;if(IN){toast('Go outside to upgrade');return}if(!spend(TIERS[v].p))return;home().tier=v;try{saveGame()}catch(e){}banner('🏰 UPGRADED','Welcome to your '+TIERS[v].n,3000,'#f2c94c');try{window.__estate&&__estate.build()}catch(e){}refresh()};
/* the engine passes the clicked button's data-v to ACT handlers as the first argument */
ACT.decobuy=function(v){if(!ITEMS[v])return;closeSheet();startPlacing(v,false)};


/* ---- sitting ---- */
var SEATS={sofa:[0,.25],lsofa:[.6,-.55],bed:[0,.9],table:null};
function nearestSeat(){var best=null,bd=3.4,it=curItems(),fl=player.y>UY-1?1:0;
  it.forEach(function(o){var s=SEATS[o.k];if(!s||(o.f?1:0)!==fl)return;var a=o.r*Math.PI/2,ox=s[0],oz=s[1],wx=o.x+ox*Math.cos(a)+oz*Math.sin(a),wz=o.z-ox*Math.sin(a)+oz*Math.cos(a),d=Math.hypot(wx-(player.x-CX),wz-(player.z-CZ));
    if(d<bd){bd=d;best={x:wx,z:wz,a:a,f:o.f?1:0}}});return best}
function toggleSit(){if(player.sitting){player.sitting=false;ui();return}var s=nearestSeat();if(!s){toast('Go near a sofa to sit 🛋️');return}
  player.sitting=true;player.x=CX+s.x;player.z=CZ+s.z;player.h=s.a;player.vx=player.vz=0;ui()}
/* ---- top-down view ---- */
var TOPV=0,hid=[];
function minY(o){var h=(o.geometry&&o.geometry.parameters&&o.geometry.parameters.height)||0;return o.position.y-h/2}
function setTop(m){TOPV=m|0;hid.forEach(function(o){o.visible=true});hid=[];
  if(!TOPV||!grp){try{if(cam.preview)cam.preview=null}catch(e){}if(grp)ui();return}
  cam.preview={x:CX+3,y:FY+(m===2?30:34),z:CZ+27,tx:CX+2,ty:(m===2?UY:FY),tz:CZ};
  if(m===1)grp.children.forEach(function(o){if(o.isLight)return;var my=o.isMesh?minY(o):o.position.y;if(my>=UY-.5){o.visible=false;hid.push(o)}});
  ui()}
window.__houseTop=setTop;

/* ---------------- enter / leave ---------------- */
var cityCirc=null;
function enterHouse(guest){if(IN)return;GUEST=guest||null;if(window.__showroom&&window.__showroom.inside())return;if(typeof MISSION!=='undefined'&&MISSION.cur){toast('Finish your current job or race first');return}cityCol=colBoxes;cityCirc=colCircs;colCircs=new Map();if(player.car)exitVehicle(true);build();OUT={x:player.x,z:player.z,h:player.h};
  if(!GUEST&&!home().init){home().init=1;if(!home().items.length)home().items=[{k:'rug',x:-6,z:-3,r:0,f:0},{k:'lsofa',x:-6,z:-6.3,r:0,f:0},{k:'tv',x:-6,z:7.8,r:2,f:0},{k:'shelf',x:-11.6,z:-5,r:1,f:0},{k:'plant',x:-11,z:-8,r:0,f:0},{k:'table',x:6.5,z:4.8,r:0,f:0},{k:'dispenser',x:1.2,z:8,r:0,f:0},{k:'kitchen',x:6,z:-8.1,r:0,f:0},{k:'fridge',x:11.1,z:-5.5,r:3,f:0},{k:'bed',x:9,z:-6,r:0,f:1},{k:'wardrobe',x:11.3,z:-2.2,r:3,f:1},{k:'desk',x:5,z:8,r:2,f:1}]}
  IN=true;lights.forEach(function(l){scene.add(l)});drawItems();rebuildMaps();floorNow=-1;
  player.x=CX-10.4;player.z=CZ;player.y=FY;player.h=Math.PI/2;player.vx=player.vz=0;cam.yaw=Math.PI/2;cam.pitch=.2;pickFloor();ui();
  if(GUEST)banner('🔔 '+GUEST.name+"'s house",'Welcome! Tap 🪑 Sit or look around',2600,'#66b8ff');else banner('🏠 HOME','Walk to the stairs to go up · tap 🛋️ Decorate',2600,'#2fd6a0')}
function leaveQuiet(){setTop(0);player.sitting=false;GUEST=null;IN=false;PL=null;if(ghost){grp&&grp.remove(ghost);ghost=null}lights.forEach(function(l){scene.remove(l)});if(grp){scene.remove(grp);grp=null;meshes=[]}colBoxes=cityCol;if(cityCirc)colCircs=cityCirc;ui()}
function exitHouse(){if(!IN)return;setTop(0);player.sitting=false;GUEST=null;IN=false;stopPlacing();lights.forEach(function(l){scene.remove(l)});if(grp){scene.remove(grp);grp=null;meshes=[]}
  colBoxes=cityCol;if(cityCirc)colCircs=cityCirc;
  var o=OUT||(function(){var h=poiById('home');return{x:h.pos.x,z:h.pos.z+3,h:0}})();placeAt(o.x,o.z,o.h);ui()}
var cityCol=colBoxes;
var lastSitUi=false;
setInterval(function(){
  if(IN&&tvCv)drawTv();if(IN&&!!player.sitting!==lastSitUi){lastSitUi=!!player.sitting;ui()}
  if(IN&&(Math.abs(player.x-CX)>40||Math.abs(player.z-CZ)>40||player.y<FY-20)){leaveQuiet();return}
  if(IN){pickFloor();player.inv=Math.max(player.inv||0,3);player.hp=Math.max(player.hp||0,60);
    var lx=player.x-CX,lz=player.z-CZ;if(lx<X0+.6&&Math.abs(lz)<1.5&&player.y<FY+1)exitHouse();
    if(ghost){var s=placeSpot();ghost.position.set(s.x,s.f?UY:FY,s.z);ghost.rotation.y=PL.r*Math.PI/2}
    if(bar)bar.style.display=window.__mode==='play'?'flex':'none'}},100);
// colBoxes must be restored to the *city* map object if the engine rebuilt it (e.g. flying to another city)
var oc=clearWorld;clearWorld=function(){if(IN)exitHouse();var r=oc.apply(this,arguments);return r};
var osg=saveGame;saveGame=function(){if(!IN||!OUT)return osg.apply(this,arguments);var x=player.x,z=player.z,y=player.y;player.x=OUT.x;player.z=OUT.z;try{return osg.apply(this,arguments)}finally{player.x=x;player.z=z;player.y=y}};
window.__house={host:function(){if(!IN)return null;if(GUEST)return GUEST.plot;var p=window.__estate?__estate.plot():-1;return p>=6&&S.plotSrv?p:null},origin:function(){return{cx:CX,cz:CZ,fy:FY}},enterAs:function(gst){var okk=[];(gst.items||[]).slice(0,60).forEach(function(i){if(i&&ITEMS[i.k]&&isFinite(i.x)&&isFinite(i.z))okk.push({k:i.k,x:Math.max(-12,Math.min(12,+i.x)),z:Math.max(-9,Math.min(9,+i.z)),r:(+i.r|0)&3,f:i.f?1:0})});enterHouse({plot:gst.plot|0,items:okk,tier:Math.max(1,Math.min(3,gst.tier|0||1)),name:String(gst.name||'Friend').slice(0,14)})},tier:tier,TIERS:TIERS,enter:enterHouse,exit:exitHouse,inside:function(){return IN},out:function(){return OUT}};
})();
