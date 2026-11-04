/* ===== Heirloom Grand Hotel: lobby, receptionist chat, key, lift + floor map, long corridors, big decorated rooms ===== */
(function(){
'use strict';
if(typeof __kit==='undefined')return;
var K=__kit,M=K.M,glow=K.glow,glass=K.glass,H=8.5,Z0=100,L=40,HW=6;
function fm(n){return typeof fmt==='function'?fmt(n):'$'+Math.round(n)}
var TYPES=[{n:'Standard room',e:'🛏️',p:120,floors:[1,2,3],d:'Cosy room, king bed, TV'},{n:'Deluxe room',e:'🛋️',p:260,floors:[4,5,6],d:'Big room, sofa, minibar, city view'},{n:'Presidential suite',e:'👑',p:600,floors:[7,8],d:'Huge suite, jacuzzi, balcony, lounge'}];
var RX=[-100,100,0],RZ=[100,100,200],curFloor=1,numGrp=null,chat=[];
function checker(c1,c2,rx,rz){var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,128,128);x.fillStyle=c2;x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=2;x.strokeRect(0,0,128,128);var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,rz);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:t,roughness:.25,metalness:.1})}
function woodTex(rx,rz){var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');x.fillStyle='#8a5a34';x.fillRect(0,0,128,128);for(var i=0;i<8;i++){x.fillStyle=i%2?'#7d4f2c':'#946239';x.fillRect(0,i*16,128,16);x.strokeStyle='rgba(0,0,0,.25)';x.strokeRect(0,i*16,128,16)}var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,rz);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:t,roughness:.5})}
function sign(A,txt,x,y,z,sc,fg,bg){var s=labelSprite(txt,fg||'#ffd23f',bg||'rgba(40,20,70,.95)');s.position.set(x,A.FY+y,z);s.scale.multiplyScalar(sc||1);A.g.add(s);return s}
function floorSlab(A,cx,cz,w,d,mat){var m=new THREE.Mesh(new THREE.BoxGeometry(w,.3,d),mat);m.position.set(cx,A.FY-.15,cz);m.receiveShadow=true;A.g.add(m)}
function plant(A,x,z){A.cyl(x,0,z,.45,.38,.7,'#7a5230',{c:1});A.sph(x,1.35,z,.8,M('#2f8a3e',.9));A.sph(x+.3,1.9,z-.1,.5,M('#3aa04a',.9))}
function chand(A,x,y,z,r,h){A.cyl(x,y,z,.04,.04,h-y,'#bbb',{ns:1});if(window.HM){HM.add(A.g,'chandelier',x,A.FY+y,z,r*1.7,0)}else{var gold=M('#d9a520',.3,.7);A.cyl(x,y-.1,z,r,r,.1,'#d9a520',{mat:gold,ns:1,seg:20});for(var i=0;i<10;i++){var a=i/10*6.283;A.sph(x+Math.cos(a)*r,y-.3,z+Math.sin(a)*r,.16,glow(0xffe9b0))}}A.sph(x,y-.55,z,.28,glow(0xfff0c0))}
function sofa(A,x,z,ry,c,w){w=w||3.2;var sx=Math.abs(Math.sin(ry))>.5,d=1.1;A.box(x,0,z,sx?d:w,.5,sx?w:d,c,{c:1,r:.7});A.box(x+(ry===Math.PI/2?-.5:ry===-Math.PI/2?.5:0),.5,z+(ry===0?-.5:ry===Math.PI?.5:0),sx?.25:w,.6,sx?w:.25,c,{r:.7})}
function skyline(A,x,y,z,w,rot){var gr=A.group();gr.position.set(x,A.FY+y,z);gr.rotation.y=rot||0;var m=new THREE.Mesh(new THREE.PlaneGeometry(w,3.2),glow(0x8fc8ff));gr.add(m);var sk=['#c7a98a','#a2b3c9','#d9b79a','#8f9db0','#bda58c'];
  for(var i=0;i<12;i++){var bh=.6+((i*37)%7)*.28;var b=new THREE.Mesh(new THREE.BoxGeometry(w/14,bh,.05),M(sk[i%5]));b.position.set(-w/2+(i+.8)*w/12.4,-1.6+bh/2,.04);gr.add(b)}
  var f=new THREE.Mesh(new THREE.BoxGeometry(w+.3,3.5,.1),M('#2a1a10'));f.position.z=-.06;gr.add(f);return gr}
/* ---------------- ground floor ---------------- */
function lobby(A){var W=18,D=22,gold=M('#d9a520',.3,.7),wall='#f1e8d8';
  floorSlab(A,0,0,W*2+2,D*2+2,checker('#f1ebe0','#b8a58a',18,22));A.box(0,H,0,W*2+1,.5,D*2+1,'#f6f0e6',{ns:1});
  A.wall(-W,-D,W,-D,H,wall);A.wall(-W,-D,-W,D,H,wall);A.wall(W,-D,W,D,H,wall);A.wall(-W,D,-3.4,D,H,wall);A.wall(3.4,D,W,D,H,wall);A.box(0,5,D,6.8,H-5,.4,wall,{});
  A.box(0,H-.5,0,W*2+.6,.5,D*2+.6,'#d9a520',{mat:gold,ns:1});
  [[-W+1,-5],[5,W-1]].forEach(function(r){A.box((r[0]+r[1])/2,1.2,D-.1,r[1]-r[0],4,.12,null,{mat:glass(0xd9b8ff,.25),ns:1})});
  A.autodoor(0,D,6.2,4.4,'x');A.box(-3.5,0,D,.3,4.6,.5,'#222',{r:.4,m:.6});A.box(3.5,0,D,.3,4.6,.5,'#222',{r:.4,m:.6});
  A.npc(-5.2,D-3,0,{female:false,build:1.3,tc:'#4a1d6a',bc:'#2a1040',hat:1,hatc:'#4a1d6a'},'Doorman');
  A.npc(5.2,D-3,0,{female:true,build:1,tc:'#4a1d6a',bc:'#2a1040'},'Bellhop');
  sign(A,'🏨 GRAND HEIRLOOM HOTEL',0,7.2,-D+1,3.4);
  // reception desk
  A.box(0,0,-12,14,1.2,1.8,'#3a2418',{c:1,r:.4});A.box(0,1.2,-12,14.2,.12,2,'#e8dcc0',{ns:1,r:.2});A.box(0,0,-14.5,16,5.8,.5,'#2a1a30',{c:1});
  for(var k=-6;k<=6;k+=1.3)A.box(k,2.2+((k*7)%3)*.4,-14.2,.7,.35,.06,'#d9a520',{mat:gold,ns:1});
  A.npc(-3,-13.2,0,{female:true,tc:'#4a1d6a',ts:1,bc:'#222'},'Reception').face=1;A.npc(3,-13.2,0,{female:false,tc:'#4a1d6a',ts:1,bc:'#222'},'Reception').face=1;
  A.box(-3,1.3,-12.5,1.1,.8,.05,null,{mat:glow(0x7dd6ff),ns:1});sign(A,'🛎️ RECEPTION · BOOK A ROOM',0,5.3,-11.4,1.4,'#fff','rgba(40,20,70,.95)');
  A.spot({x:0,z:-9.5,r:6,label:'🛎️ Talk to reception · book a room',fn:function(){chat=[];show('hotelchat',{})}});
  // lounge with sofas, rug, fountain
  A.box(-8,0,6,8,.04,8,'#6a2a4a',{ns:1});sofa(A,-12,6,Math.PI/2,'#3a2a5a',4);sofa(A,-4,6,-Math.PI/2,'#3a2a5a',4);sofa(A,-8,10.5,Math.PI,'#3a2a5a',5);A.box(-8,0,6,2.6,.45,2.6,'#e8dcc0',{c:1,r:.3});
  A.cyl(8,0,4,2.4,2.6,.7,'#d9d3c3',{c:1});A.cyl(8,.7,4,2.1,2.1,.05,'#35b8e8',{ns:1});A.cyl(8,.7,4,.25,.4,2,'#e8e2d4',{ns:1});A.sph(8,2.8,4,.45,glow(0x9fe3ff));
  A.npc(-10.6,5,Math.PI/2,{female:true,tc:'#c0392b'},'Guest');A.npc(-5.4,7.6,-Math.PI/2,{female:false,tc:'#2c6e49'},'Guest');
  // restaurant, spa, pool rooms on the left/right walls (tap-spots into the old hotel services)
  A.box(-W+2,0,-4,3,1.1,8,'#5a3a22',{c:1,r:.4});sign(A,'🍳 ROOM SERVICE',-W+2,3.2,-4,1.4,'#fff','rgba(120,60,10,.95)');A.npc(-W+3.4,-4,Math.PI/2,{female:false,tc:'#f2f2f2',hat:1,hatc:'#f2f2f2',ts:1},'Chef').face=1;
  A.spot({x:-W+5,z:-4,r:3.4,label:'🍳 Room service meal · $35',fn:function(){ACT.hotel('rs')}});
  A.box(W-2,0,-4,3,1.1,8,'#2a5a5a',{c:1,r:.4});sign(A,'💆 SPA',W-2,3.2,-4,1.4,'#fff','rgba(20,90,90,.95)');
  A.spot({x:W-5,z:-4,r:3.4,label:'💆 Spa session · $70',fn:function(){ACT.hotel('spa')}});
  A.spot({x:W-5,z:-12,r:3.4,label:'🏊 Rooftop pool · $20',fn:function(){ACT.hotel('pool')}});sign(A,'🏊 POOL',W-2,3.2,-12,1.3,'#fff','rgba(20,80,160,.95)');A.box(W-2,0,-12,3,.8,6,'#2ec4f1',{ns:1,mat:glow(0x2ec4f1)});
  // lifts on the right
  [-1,6].forEach(function(z){A.box(W-.5,0,z+3,.5,4.8,3.4,'#aab0ba',{r:.25,m:.9,ns:1});A.box(W-.8,0,z+3,.1,4.2,1.4,'#c8ced8',{ns:1,m:.9,r:.2});A.box(W-.8,4.4,z+3,.12,.4,1,null,{mat:glow(0x35e0b0),ns:1})});
  sign(A,'🛗 LIFTS · ROOMS UPSTAIRS',W-1.5,5.6,4,1.5,'#fff','rgba(20,40,90,.95)');
  A.spot({x:W-3,z:5,r:5,label:'🛗 Lift · pick your floor',fn:function(){show('hotellift',{})}});
  // columns, plants, chandeliers, paintings
  [-10,10].forEach(function(x){[-6,14].forEach(function(z){A.cyl(x,0,z,.7,.8,H,'#f6f1e4',{c:1,r:.3});A.cyl(x,0,z,.85,.85,.5,'#d9a520',{mat:gold,ns:1})})});
  plant(A,-W+1.5,12);plant(A,-W+1.5,-12);plant(A,W-1.5,12);plant(A,-6,-8);plant(A,6,-8);
  [-12,0,10].forEach(function(z){chand(A,0,H-2.2,z,1.5,H)});[[0,-4],[-9,6],[9,2]].forEach(function(p){A.light(p[0],H-2.5,p[1],0xfff0d0,1.7,38)});
  for(var p=0;p<3;p++)A.box(-W+.3,3,-12+p*8,.1,2.2,3,['#c0392b','#2c6e49','#d9a520'][p],{ns:1});
  return{spawn:{x:0,z:D-3,h:Math.PI},exit:{x:0,z:D+1.6,r:1.6}}}
/* ---------------- long corridor (the same hall for every floor) ---------------- */
function corridor(A){var gold=M('#d9a520',.3,.7),carpet=M('#4a1d6a',.9);
  floorSlab(A,0,Z0,HW*2+1,L*2+1,checker('#e8e0d0','#b8a58a',6,40));A.box(0,H-1.8,Z0,HW*2+1,.5,L*2+1,'#f4efe6',{ns:1});
  A.wall(-HW,Z0-L,HW,Z0-L,H-1.5,'#efe3d0');A.wall(-HW,Z0+L,HW,Z0+L,H-1.5,'#efe3d0');A.wall(-HW,Z0-L,-HW,Z0+L,H-1.5,'#efe3d0');A.wall(HW,Z0-L,HW,Z0+L,H-1.5,'#efe3d0');
  A.box(0,.02,Z0,3.4,.04,L*2-4,null,{mat:carpet,ns:1});A.box(-1.8,.03,Z0,.15,.04,L*2-4,'#d9a520',{mat:gold,ns:1});A.box(1.8,.03,Z0,.15,.04,L*2-4,'#d9a520',{mat:gold,ns:1});
  // 8 doors, 4 each side
  for(var k=0;k<8;k++){var side=k<4?-1:1,z=Z0-30+(k%4)*18+(k%4>1?0:0),x=side*(HW-.2);
    A.box(x,0,z,.3,3.4,2.2,'#5a3a22',{ns:1,r:.4});A.box(x+side*-.1,1.6,z+.6,.06,.2,.2,'#d9a520',{mat:gold,ns:1});
    A.box(x,3.4,z,.35,.3,2.6,'#d9a520',{mat:gold,ns:1});A.cyl(side*(HW-.6),0,z-1.9,.4,.4,.8,'#e8dcc0',{ns:1});A.sph(side*(HW-.6),1.4,z-1.9,.5,M('#2f8a3e',.9));
    A.light(side*3,H-2.3,z,0xffe8c0,.9,22);
    (function(kk,zz,sd){var sp={x:sd*(HW-1.8),z:zz,r:2.2,get label(){var mine=S.hotel&&S.hotel.floor===curFloor&&S.hotel.k===kk&&S.hotel.until>=S.day;return mine?'🔑 Open your room '+(curFloor*100+kk+1):'🚪 Room '+(curFloor*100+kk+1)+' · Do not disturb'},fn:function(){var h=S.hotel;if(h&&h.floor===curFloor&&h.k===kk&&h.until>=S.day){K.ride(RX[h.type],RZ[h.type]+(h.type===2?12:8),Math.PI,'Room '+h.room)}else toast('🚪 Room '+(curFloor*100+kk+1)+' — occupied by another guest')}};A.spot(sp)})(k,z,side)}
  numGrp=A.group();renderNums(A);
  for(var t=-34;t<=34;t+=17){chand(A,0,H-3,Z0+t,.9,H-1.8);A.light(0,H-3,Z0+t,0xfff0d0,1.2,30)}
  A.box(0,0,Z0-L+1,10,5.5,.2,null,{mat:glass(0x9fd8ff,.35),ns:1});A.box(0,.2,Z0-L+1.2,10,5,.05,null,{mat:glow(0x8fc8ff),ns:1});sign(A,'🌆 City view',0,6.2,Z0-L+2,1.1,'#fff','rgba(20,40,90,.9)');
  A.box(0,0,Z0+L-.5,5,4.8,.5,'#aab0ba',{r:.25,m:.9,ns:1});A.box(0,0,Z0+L-.8,2.4,4.2,.1,'#c8ced8',{ns:1,m:.9,r:.2});sign(A,'🛗 LIFT',0,5.4,Z0+L-1.2,1.3,'#fff','rgba(20,40,90,.95)');
  A.spot({x:0,z:Z0+L-3.5,r:4,label:'🛗 Lift · other floors / lobby',fn:function(){show('hotellift',{})}});
  return{}}
function renderNums(A){if(!numGrp)return;while(numGrp.children.length){var c=numGrp.children[0];numGrp.remove(c)}
  for(var k=0;k<8;k++){var side=k<4?-1:1,z=Z0-30+(k%4)*18;var s=labelSprite(String(curFloor*100+k+1),'#ffd23f','rgba(60,20,90,.95)');s.position.set(side*(HW-1),A.FY+4.3,z);s.scale.multiplyScalar(1.1);numGrp.add(s)}
  var fs=labelSprite('FLOOR '+curFloor,'#fff','rgba(20,40,90,.95)');fs.position.set(0,A.FY+5.3,Z0+L-8);fs.scale.multiplyScalar(1.6);numGrp.add(fs)}
/* ---------------- rooms ---------------- */
function room(A,t){var cx=RX[t],cz=RZ[t],W=[8,10,14][t],D=[10,12,16][t],h=[5,5.6,6.4][t],gold=M('#d9a520',.3,.7),wood=woodTex(W,D),wc=['#e9dfcf','#dfe6ee','#f3ead2'][t];
  floorSlab(A,cx,cz,W*2+1,D*2+1,wood);A.box(cx,h,cz,W*2+1,.4,D*2+1,'#f6f0e6',{ns:1});
  A.wall(cx-W,cz-D,cx+W,cz-D,h,wc);A.wall(cx-W,cz-D,cx-W,cz+D,h,wc);A.wall(cx+W,cz-D,cx+W,cz+D,h,wc);A.wall(cx-W,cz+D,cx-1.4,cz+D,h,wc);A.wall(cx+1.4,cz+D,cx+W,cz+D,h,wc);A.box(cx,2.9,cz+D,2.8,h-2.9,.4,wc,{});
  A.box(cx,0,cz+D+.05,2.8,2.9,.2,'#5a3a22',{ns:1,r:.4});
  A.spot({x:cx,z:cz+D-2,r:2,label:'🚪 Leave room → corridor',fn:function(){K.ride(0,Z0-30+18*(S.hotel?S.hotel.k%4:0),Math.PI/2*(S.hotel&&S.hotel.k<4?-1:1)+0,'Corridor')}});
  A.box(cx,0,cz+D-.1,.1,.1,.1,'#000',{ns:1});
  // window wall with skyline
  skyline(A,cx,h/2+.4,cz-D+.3,W*1.4,0);A.box(cx,0,cz-D+.6,W*1.5,.6,.3,'#8a5a2a',{ns:1});
  // bed
  var bc=['#e8e0d0','#c9d6e8','#e8d8a8'][t];var b1=A.box(cx,0,cz-D+3.6,[3.4,4,4.8][t],.6,5,'#5a3a22',{c:1,r:.5}),b2=A.box(cx,.6,cz-D+3.8,[3.1,3.7,4.5][t],.5,4.5,bc,{ns:1,r:.9}),b3=A.box(cx,1.0,cz-D+5.2,[3.1,3.7,4.5][t],.14,2.6,['#6a2a4a','#1d3a5a','#7a1f2b'][t],{ns:1,r:.85});
  if(window.PROPV&&PROPV.bed2&&PROPV.bed2.parts.keep&&b1&&b2&&b3){b1.material=b1.material.clone();b1.material.transparent=true;b1.material.opacity=0;b1.material.depthWrite=false;b2.visible=b3.visible=false;var rm=new THREE.Mesh(PROPV.bed2.parts.keep,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,side:THREE.DoubleSide})),bs=[1.45,1.7,2.05][t];rm.scale.setScalar(bs);rm.position.set(cx,A.FY,cz-D+3.9);rm.castShadow=true;A.g.add(rm)}
  [-1,1].forEach(function(s){A.box(cx+s*([1.9,2.2,2.7][t]),0,cz-D+1.6,1.2,.9,1,'#4a2f1b',{c:1});A.sph(cx+s*[1.9,2.2,2.7][t],1.1,cz-D+1.6,.2,glow(0xffe9b0));A.box(cx+s*.9,.9,cz-D+2.6,1.2,.35,.7,'#fff',{ns:1,r:.9})});
  A.box(cx,.3,cz-D+.8,[3.6,4.2,5][t],2.2,.2,'#6a4a30',{ns:1,r:.6});
  A.light(cx,h-1.2,cz-D+4,0xffe8c0,1.6,30);A.light(cx,h-1.2,cz+2,0xfff0d0,1.2,34);
  A.spot({x:cx,z:cz-D+6.4,r:3,label:'🛏️ Sleep till 07:00',fn:function(){ACT.sleep()}});
  // TV wall + sofa + rug
  A.box(cx+W-.5,1.2,cz,.2,2,4.2,null,{mat:glow(0x1a1e2a),ns:1});A.box(cx+W-.62,1.3,cz,.05,1.7,3.8,null,{mat:glow(0x2a6fe0),ns:1});
  A.box(cx+W-1.4,0,cz,.8,.7,5.2,'#4a2f1b',{c:1,r:.4});sofa(A,cx+W-6,cz,Math.PI/2,['#6a3a2a','#2a4a6a','#4a1d6a'][t],4.4);A.box(cx+W-3.6,0,cz,.04,.04,.04,'#000',{ns:1});
  A.box(cx+W-4,0,cz,4,.04,6,['#8a2a2a','#2a4a6a','#d9a520'][t],{ns:1});A.box(cx+W-3.6,0,cz,1.4,.45,2,'#e8dcc0',{c:1});
  A.spot({x:cx+W-4.5,z:cz,r:3,label:'📺 Watch TV · +mood',fn:function(){stat('fn',15);toast('📺 You relax and watch TV · +15 fun')}});
  // wardrobe, desk, plants, art
  A.box(cx-W+1,0,cz+3,1.6,3.4,5,'#5a3a22',{c:1,r:.5});A.box(cx-W+1.85,.3,cz+3,.05,2.8,4.6,'#d9a520',{mat:gold,ns:1,m:.5});
  A.box(cx-W+1.5,0,cz-3,1.4,1.1,4,'#4a2f1b',{c:1});A.box(cx-W+2.4,.5,cz-3,.5,.8,.5,'#222',{ns:1});plant(A,cx-W+1.4,cz+D-2);plant(A,cx+W-1.4,cz-D+1.4);
  chand(A,cx,h-1.9,cz,1.1,h);
  if(t>=1){ // minibar + coffee
    A.box(cx-W+1.2,0,cz+9,1.6,1.4,2.6,'#2a2a30',{c:1,m:.4});A.box(cx-W+2.05,.9,cz+9,.05,.4,2.2,null,{mat:glow(0xffd23f),ns:1});
    A.spot({x:cx-W+3.6,z:cz+9,r:3,label:'🥤 Minibar · $15',fn:function(){if(spend(15)){stat('fd',15);stat('fn',8);toast('🥤 Snack and a cold drink')}}})}
  if(t===2){ // suite: lounge, jacuzzi, balcony, bar
    A.box(cx-8,0,cz-4,6,.5,4,'#3a2a5a',{c:1});A.box(cx-8,.5,cz-5.6,6,.9,.5,'#3a2a5a',{ns:1});A.box(cx-8,0,cz-9,2.4,.45,2.4,'#e8dcc0',{c:1});
    A.cyl(cx-8,0,cz+8,3,3,.9,'#e8e2d4',{c:1,seg:24});A.cyl(cx-8,.85,cz+8,2.6,2.6,.1,'#35b8e8',{mat:glow(0x35b8e8),ns:1,seg:24});sign(A,'🛁 JACUZZI',cx-8,3.2,cz+8,1.3,'#fff','rgba(20,80,160,.95)');
    A.spot({x:cx-8,z:cz+4.4,r:3.2,label:'🛁 Jacuzzi · +40 fun',fn:function(){stat('fn',40);stat('en',15);toast('🛁 So relaxing · +40 fun +15 energy')}});
    A.box(cx+8,0,cz-12,6,1.2,1.4,'#2a1a10',{c:1,r:.4});for(var b=0;b<5;b++)A.cyl(cx+5.5+b,1.2,cz-12.2,.12,.12,.7,['#8a1a22','#2c6e49','#d9a520','#2a4a8a','#c0392b'][b],{ns:1,seg:8});
    A.spot({x:cx+8,z:cz-9.5,r:3,label:'🥂 Suite bar · $60',fn:function(){if(spend(60)){stat('fn',35);stat('fd',10);toast('🥂 Cheers! · +35 fun')}}});
    A.box(cx+W-.3,0,cz-D+3,.3,1,6,'#d9a520',{mat:gold,ns:1,m:.5});plant(A,cx+W-2,cz-D+3);plant(A,cx-W+2,cz-D+2);
    [[-4,-4],[4,6],[-9,0]].forEach(function(p){A.light(cx+p[0],h-1.4,cz+p[1],0xffe8c0,1.2,30)})}
  // bathroom block near the door
  A.box(cx+W-3,0,cz+D-3,5,1.1,.2,'#cfe6ee',{ns:1});A.cyl(cx+W-2.5,0,cz+D-2,.6,.5,.9,'#f4f4f4',{c:1});A.box(cx+W-2.5,1.2,cz+D-.9,1.4,1.2,.1,null,{mat:glass(0xbfe8ff,.5),ns:1});
  A.npc(cx-W+6,cz+D-2,Math.PI,{female:true,tc:'#4a1d6a',ts:1,bc:'#222'},['Maid','Butler','Concierge'][t]).face=1}
function build(A,arg){lobby(A);corridor(A);for(var t=0;t<3;t++)room(A,t);K.set&&K.set(A);
  window.__hotelA=A;return{spawn:{x:0,z:19,h:Math.PI},exit:{x:0,z:23.6,r:1.5}}}
K.reg('hotel',{poi:1,build:build,banner:['🏨 GRAND HEIRLOOM HOTEL','Welcome! Reception is straight ahead','#c58bff'],onLeave:function(){numGrp=null;window.__hotelA=null}});
/* ---------------- panels: receptionist chat + lift/floor map ---------------- */
function bubble(me,t){return'<div style="display:flex;justify-content:'+(me?'flex-end':'flex-start')+';margin:6px 0"><div style="max-width:82%;padding:9px 12px;border-radius:14px;background:'+(me?'#2f80ed':'#2a2f3d')+';color:#fff;font:600 14px system-ui">'+t+'</div></div>'}
function active(){var h=S.hotel;return h&&h.until>=S.day?h:null}
P.hotelchat=function(){var h=active();var html=hd('🛎️ Reception','Grand Heirloom Hotel · chat')+'<div style="max-height:46vh;overflow:auto">'+bubble(0,'Good day, welcome to the Grand Heirloom Hotel! 👋 What would you like to book?');
  chat.forEach(function(c){html+=bubble(c[0],c[1])});html+='</div>';
  if(h)html+='<div class="cap">🔑 You have <b>Room '+h.room+'</b> (floor '+h.floor+') until day '+h.until+'. Use the lift on the right.</div>';
  if(!chat.length||chat[chat.length-1][0]===0)html+=TYPES.map(function(t,i){return'<div class="item"><span class="ie">'+t.e+'</span><b>'+t.n+'<small>'+t.d+' · floors '+t.floors[0]+'–'+t.floors[t.floors.length-1]+'</small></b><button class="buy" data-a="hotelbook" data-v="'+i+'">'+fm(t.p)+'/night</button></div>'}).join('');
  return{h:html}};
ACT.hotelbook=function(i){i=+i;var t=TYPES[i];if(!t)return;var h=active();if(h){chat.push([1,'I would like a room.']);chat.push([0,'You already have Room '+h.room+' until day '+h.until+'. Enjoy your stay!']);refresh();return}
  chat.push([1,'I would like the '+t.n+' please.']);
  if(!spend(t.p)){chat.push([0,'I am sorry, your payment did not go through. Please come back with '+fm(t.p)+'.']);refresh();return}
  var floor=t.floors[Math.floor(Math.random()*t.floors.length)],k=Math.floor(Math.random()*8);S.hotel={type:i,floor:floor,k:k,room:floor*100+k+1,until:S.day+1};saveGame();
  chat.push([0,'Wonderful! Here is your key 🔑 <b>Room '+S.hotel.room+'</b>, floor '+floor+'. Take the lift on the right. Enjoy your stay!']);refresh()};
P.hotellift=function(){var h=active(),rows='';for(var f=8;f>=1;f--){var mine=h&&h.floor===f,ty=f>=7?'👑 Suites':f>=4?'🛋️ Deluxe':'🛏️ Standard';
  rows+='<div class="item"'+(mine?' style="border:1px solid #35e0b0"':'')+'><span class="ie">'+(mine?'🔑':'🏢')+'</span><b>Floor '+f+'<small>'+ty+(mine?' · YOUR ROOM '+h.room:'')+'</small></b><button class="buy" data-a="hotelfloor" data-v="'+f+'">Go</button></div>'}
  rows+='<div class="item"><span class="ie">🏨</span><b>Lobby<small>Ground floor</small></b><button class="buy" data-a="hotelfloor" data-v="0">Go</button></div>';
  return{h:hd('🛗 Lift & floor map',h?'Your key: Room '+h.room+' · floor '+h.floor:'Book a room at reception to get a key')+rows}};
ACT.hotelfloor=function(f){f=+f;closeSheet();var A=window.__hotelA;if(f===0){K.ride(0,19,Math.PI,'Lobby');return}curFloor=f;
  var gr=numGrp;K.ride(0,Z0+L-6,Math.PI,'Floor '+f,function(){if(A&&gr)try{numGrp=gr;renderNums(A)}catch(e){}})};
window.__hotel={types:TYPES};
})();
