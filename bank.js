/* ===== Heirloom Bank: a big walk-in bank — guards, auto doors, cashiers, vault, elevators and a long upper floor ===== */
(function(){
'use strict';
if(typeof __kit==='undefined')return;
var K=__kit,M=K.M,glow=K.glow,glass=K.glass,H=9.5,Z0=150,UH=7.5;
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function fm(n){return typeof fmt==='function'?fmt(n):'$'+Math.round(n)}
if(!S.bank)S.bank={bal:0,fd:null,earned:0};
function checker(c1,c2,rx,rz){var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,128,128);x.fillStyle=c2;x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);
  x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=2;x.strokeRect(0,0,128,128);var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,rz);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:t,roughness:.25,metalness:.1})}
function sign(A,txt,x,y,z,ry,sc,fg,bg){var s=labelSprite(txt,fg||'#ffd23f',bg||'rgba(10,36,26,.95)');s.position.set(x,A.FY+y,z);s.scale.multiplyScalar(sc||1);A.g.add(s);return s}
function plant(A,x,z){A.cyl(x,0,z,.45,.38,.7,'#7a5230',{c:1});A.sph(x,1.35,z,.8,M('#2f8a3e',.9));A.sph(x+.3,1.9,z-.1,.5,M('#3aa04a',.9))}
function sofa(A,x,z,ry,c){var w=3.2,d=1.1,sx=Math.abs(Math.sin(ry))>.5;A.box(x,0,z,sx?d:w,.5,sx?w:d,c,{c:1,r:.7});A.box(x+(ry===Math.PI/2?-.5:ry===-Math.PI/2?.5:0),.5,z+(ry===0?-.5:ry===Math.PI?.5:0),sx?.25:w,.6,sx?w:.25,c,{r:.7})}
function chandelier(A,x,y,z,r){A.cyl(x,y,z,.04,.04,H-y,'#bbb',{ns:1});if(window.HM){HM.add(A.g,'chandelier',x,A.FY+y,z,r*1.7,0)}else{var gold=M('#d9a520',.3,.7);A.cyl(x,y-.1,z,r,r,.1,'#d9a520',{mat:gold,ns:1,seg:20});for(var i=0;i<10;i++){var a=i/10*6.283;A.sph(x+Math.cos(a)*r,y-.3,z+Math.sin(a)*r,.16,glow(0xffe9b0))}}A.sph(x,y-.55,z,.28,glow(0xfff0c0))}
function ground(A,w,d,y0,mat){var m=new THREE.Mesh(new THREE.BoxGeometry(w,.3,d),mat);m.position.set(0,A.FY-.15,y0);m.receiveShadow=true;A.g.add(m)}
/* ---------------- ground floor ---------------- */
function lobby(A){var W=20,D=26,gold=M('#d9a520',.3,.7),marble=checker('#efe9dc','#cfc5b0',20,26);
  ground(A,W*2+2,D*2+2,0,marble);
  // ceiling + walls (solid)
  A.box(0,H,0,W*2+1,.5,D*2+1,'#f4efe3',{ns:1});
  var wall='#efe6d2';
  A.wall(-W,-D,W,-D,H,wall);A.wall(-W,-D,-W,D,H,wall);A.wall(W,-D,W,D,H,wall);
  A.wall(-W,D,-3.4,D,H,wall);A.wall(3.4,D,W,D,H,wall);A.box(0,5,D,6.8,H-5,.4,wall,{});// lintel over the entrance
  // gold skirting and cornice
  [[-W,-D,W,-D],[-W,-D,-W,D],[W,-D,W,D]].forEach(function(w){A.box((w[0]+w[2])/2,0,(w[1]+w[3])/2,Math.abs(w[2]-w[0])+.5,.6,Math.abs(w[3]-w[1])+.5,'#8a5a2a',{ns:1});A.box((w[0]+w[2])/2,H-.5,(w[1]+w[3])/2,Math.abs(w[2]-w[0])+.6,.5,Math.abs(w[3]-w[1])+.6,'#d9a520',{mat:gold,ns:1})});
  // front: glass shopfront bands either side of the doors
  [[-W+1,-5],[5,W-1]].forEach(function(r){A.box((r[0]+r[1])/2,1.2,D-.1,r[1]-r[0],4.2,.12,null,{mat:glass(0xa8e0ff,.25),ns:1})});
  var ad=A.autodoor(0,D,6.2,4.4,'x');
  A.box(-3.5,0,D,.3,4.6,.5,'#222',{r:.4,m:.6});A.box(3.5,0,D,.3,4.6,.5,'#222',{r:.4,m:.6});
  // security guards at the front
  A.npc(-5.2,D-3,0,{female:false,build:1.35,ts:0,tc:'#1b2a4a',bs:0,bc:'#1b2a4a',hat:1,hatc:'#1b2a4a',shades:true},'Security');
  A.npc(5.2,D-3,0,{female:false,build:1.3,ts:0,tc:'#1b2a4a',bs:0,bc:'#1b2a4a',hat:1,hatc:'#1b2a4a',shades:true},'Security');
  // back wall sign + flags
  var bs=new THREE.Mesh(new THREE.BoxGeometry(18,2.6,.3),M('#0f2a1e',.4));bs.position.set(0,A.FY+8,-D+.4);A.g.add(bs);A.box(0,6.6,-D+.5,18.4,.2,.1,'#d9a520',{mat:gold,ns:1});A.box(0,9.4,-D+.5,18.4,.2,.1,'#d9a520',{mat:gold,ns:1});
  sign(A,'🏦 HEIRLOOM BANK',0,8.0,-D+1,0,3.6);
  // vault
  A.box(0,0,-D+1.2,13,6,1.6,'#555a63',{c:1,r:.4,m:.7});A.cyl(0,3,-D+2.1,2.7,2.7,.5,'#8a8f99',{r:.25,m:.9,seg:28}).rotation.x=Math.PI/2;
  var vd=A.cyl(0,3,-D+2.35,2.1,2.1,.2,'#c0c6d0',{r:.2,m:.95,seg:28});vd.rotation.x=Math.PI/2;A.cyl(0,3,-D+2.55,.55,.55,.3,'#d9a520',{mat:gold,seg:20}).rotation.x=Math.PI/2;
  for(var a=0;a<6;a++){var sp=A.box(Math.cos(a/6*6.283)*1.6,3+Math.sin(a/6*6.283)*1.6-.12,-D+2.6,.12,.7,.12,'#d9a520',{mat:gold,ns:1});sp.rotation.z=a/6*6.283}
  A.box(-8,0,-D+2.5,2.6,.15,1.2,'#d9a520',{mat:gold,ns:1});A.box(8,0,-D+2.5,2.6,.15,1.2,'#d9a520',{mat:gold,ns:1});
  // teller counter with glass and cashiers
  A.box(-4,0,-9,26,1.15,1.6,'#4a2f1b',{c:1,r:.5});A.box(-4,1.15,-9,26,.12,1.9,'#e8dcc0',{ns:1,r:.2});A.box(-4,1.3,-9.5,26,2.2,.1,null,{mat:glass(0xbfe8ff,.25),ns:1});
  [-12,-5,2].forEach(function(x,i){A.box(x+1.5,0,-9.1,.18,3.6,1.7,'#2a1a10',{ns:1});A.box(x,1.3,-10.2,1.1,.8,.05,null,{mat:glow(0x7dd6ff),ns:1});A.cyl(x,0,-11,.35,.35,.5,'#222',{ns:1});
    A.npc(x,-11.9,0,{female:i!==1,tc:i===1?'#1d5c3a':'#f2f2f2',ts:1,bc:'#222',build:1},['Cashier Ada','Cashier Tunde','Cashier Ife'][i]).face=1});
  A.sph(-4,3.6,-9,.0001,M('#000'));
  sign(A,'🏦 TELLER',-4,5.1,-9.2,0,1.5,'#fff','rgba(15,42,30,.95)');
  // queue ropes
  for(var qx=-12;qx<=4;qx+=4){A.cyl(qx,0,-6,.07,.07,1,'#d9a520',{mat:gold,seg:8,ns:1});A.sph(qx,1.02,-6,.12,gold)}
  A.box(-4,.86,-6,16,.04,.04,'#8a1a22',{ns:1});
  // ATM wall (left)
  for(var i2=0;i2<3;i2++){var z=-4+i2*4.2;A.box(-W+1,0,z,1.2,2.3,1.5,'#28323f',{c:1,r:.4,m:.4});A.box(-W+1.65,1.3,z,.05,.7,1,null,{mat:glow(0x35e0b0),ns:1});A.box(-W+1.65,.95,z,.12,.08,.8,'#444',{ns:1})}
  sign(A,'🏧 ATM',-W+1.6,3.2,-.2,0,1.4,'#fff','rgba(20,60,160,.95)');
  // waiting lounge
  sofa(A,10,6,0,'#2a4a6a');sofa(A,10,-2,Math.PI,'#2a4a6a');A.box(10,0,2,3,.45,1.4,'#e8dcc0',{c:1,r:.3});A.box(10,.45,2,1.8,.04,.9,'#d9a520',{mat:gold,ns:1});
  A.box(2,0,10,10,.04,5,'#8a1a22',{ns:1});
  // columns with gold bands
  [-12,12].forEach(function(x){for(var z2=-14;z2<=18;z2+=11){A.cyl(x,0,z2,.8,.9,H,'#f6f1e4',{c:1,r:.3});A.cyl(x,0,z2,.95,.95,.6,'#d9a520',{mat:gold,ns:1});A.cyl(x,H-.7,z2,.95,.95,.7,'#d9a520',{mat:gold,ns:1})}});
  // paintings and plants
  [-12,0,12].forEach(function(x){var f=A.box(x,3.2,D-.55,3.6,2.4,.12,'#6a4a2a',{ns:1});A.box(x,3.35,D-.62,3.2,2,.06,[ '#3a6ea5','#a5503a','#3aa57a' ][(x+12)/12],{ns:1})});
  plant(A,-17,22);plant(A,17,22);plant(A,-17,-3);plant(A,-17,-19);plant(A,17,-19);
  // chandeliers + lights
  [-10,0,10].forEach(function(z){chandelier(A,0,H-2.4,z,1.5)});chandelier(A,-12,H-2.4,-4,1.1);
  A.light(0,H-3,-14,0xfff0d0,1.8,45);A.light(0,H-3,6,0xfff0d0,1.8,45);A.light(-10,H-3,10,0xffe8c0,1.2,35);A.light(10,H-3,-6,0xffe8c0,1.2,35);
  // elevators on the right wall
  [-6,6].forEach(function(z,i){A.box(W-.5,0,z,.5,4.8,3.4,'#aab0ba',{r:.25,m:.9,ns:1});A.box(W-.8,0,z,.1,4.2,1.4,'#c8ced8',{ns:1,m:.9,r:.2});A.box(W-.8,0,z-.75,.08,4.2,.06,'#222',{ns:1});A.box(W-.8,4.4,z,.12,.4,1,null,{mat:glow(0x35e0b0),ns:1});A.box(W-1,1.4,z+2,.1,.5,.3,null,{mat:glow(i?0xff5468:0x35e0b0),ns:1})});
  sign(A,'🛗 LIFTS · UPSTAIRS',W-1.5,5.6,0,0,1.5,'#fff','rgba(20,40,90,.95)');
  // spots
  A.spot({x:-4,z:-7,r:5,label:'🏦 Cashier · Deposit / Withdraw',fn:function(){show('bank',{})}});
  A.spot({x:-W+3,z:2,r:3.4,label:'🏧 ATM',fn:function(){show('bank',{})}});
  A.spot({x:W-3,z:0,r:6,label:'🛗 Lift to upper floor',fn:function(){K.ride(0,Z0+42,Math.PI,'Upper floor')}});
  return{spawn:{x:0,z:D-3,h:Math.PI},exit:{x:0,z:D+1.6,r:1.6}}}
/* ---------------- upper floor: a long hall ---------------- */
function upstairs(A){var gold=M('#d9a520',.3,.7),HW=14,L=50,carpet=M('#7a1f2b',.9),marble=checker('#e9e4d6','#b9b09a',14,50);
  var m=new THREE.Mesh(new THREE.BoxGeometry(HW*2+1,.3,L*2+1),marble);m.position.set(0,A.FY-.15,Z0);m.receiveShadow=true;A.g.add(m);
  A.box(0,UH,Z0,HW*2+1,.5,L*2+1,'#f4efe3',{ns:1});
  A.wall(-HW,Z0-L,HW,Z0-L,UH,'#efe6d2');A.wall(-HW,Z0+L,HW,Z0+L,UH,'#efe6d2');A.wall(-HW,Z0-L,-HW,Z0+L,UH,'#efe6d2');A.wall(HW,Z0-L,HW,Z0+L,UH,'#efe6d2');
  // runner carpet with gold edges
  A.box(0,.02,Z0,6,.04,L*2-4,null,{mat:carpet,ns:1});A.box(-3.1,.03,Z0,.2,.04,L*2-4,'#d9a520',{mat:gold,ns:1});A.box(3.1,.03,Z0,.2,.04,L*2-4,'#d9a520',{mat:gold,ns:1});
  // far end: panoramic city window
  A.box(0,1,Z0-L+.3,HW*2-2,UH-2,.1,null,{mat:glass(0x9fd8ff,.35),ns:1});A.box(0,.1,Z0-L+.6,HW*2-2,UH-1,.05,null,{mat:glow(0x8fc8ff),ns:1});
  var sk=['#c7a98a','#a2b3c9','#d9b79a','#8f9db0','#bda58c'];for(var i=0;i<14;i++){var bh=2+(i*37%7);A.box(-13+i*2,.2,Z0-L+.9,1.6,bh,.2,sk[i%5],{ns:1})}
  // left: glass offices
  var names=['Loans','Accounts','Investments','Branch Manager'],offs=[-36,-20,-4,12];
  offs.forEach(function(z,k){var zz=Z0+z;
    A.box(-HW+3.5,0,zz-6.5,7,.01,.01,'#000',{ns:1});
    A.box(-8.5,0,zz-5.8,.2,UH,5.4,null,{mat:glass(0xbfe8ff,.22),c:1,ns:1});A.box(-8.5,0,zz+5.8,.2,UH,5.4,null,{mat:glass(0xbfe8ff,.22),c:1,ns:1});A.box(-8.5,5.4,zz,.2,UH-5.4,12,null,{mat:glass(0xbfe8ff,.22),ns:1});
    A.wall(-HW,zz-6.5,-8.5,zz-6.5,UH,'#efe6d2',{t:.25});
    A.box(-12,0,zz,3.6,.95,1.5,'#5a3a22',{c:1,r:.4});A.box(-12,.95,zz,3.6,.08,1.7,'#e8dcc0',{ns:1});A.box(-12,.2,zz+1.6,1,.9,1,'#2a2a30',{ns:1,r:.8});
    A.npc(-13.5,zz,Math.PI/2,{female:k%2===0,tc:k%2?'#1d3a5a':'#7a2a3a',ts:1,bc:'#222',build:1},['Officer Bisi','Officer Chike','Officer Zainab','Mr. Adewale'][k]).face=1;
    plant(A,-13,zz-5);sign(A,names[k],-8.5,UH-1.2,zz,0,1.3,'#ffd23f','rgba(15,42,30,.95)');
    A.spot({x:-10.5,z:zz,r:3.2,label:'💼 '+names[k],fn:function(){show('bank',{tab:k===2?'invest':k===0?'invest':'save'})}})});
  // right: lounge + coffee bar, meeting room, safe-deposit wall
  A.box(HW-2.2,0,Z0+30,3,1.2,9,'#4a2f1b',{c:1,r:.4});A.box(HW-2.2,1.2,Z0+30,3.2,.1,9.2,'#e8dcc0',{ns:1});A.npc(HW-4.2,Z0+30,-Math.PI/2,{female:false,tc:'#3a2a1a',ts:1,bc:'#222'},'Barista').face=1;
  A.box(HW-.8,1.8,Z0+30,.4,2,8,'#2a1a10',{ns:1});sign(A,'☕ COFFEE BAR',HW-3,4.4,Z0+30,0,1.5,'#fff','rgba(90,50,20,.95)');
  for(var t=0;t<3;t++){var tz=Z0+14+t*4.5;A.cyl(6.2,0,tz,.7,.7,.8,'#e8dcc0',{c:1,seg:14});A.cyl(6.2,.05,tz,.1,.1,.8,'#999',{ns:1,seg:6});sofa(A,9.4,tz,Math.PI/2,'#8a3a2a')}
  A.box(9,0,Z0-17,9,.9,3.2,'#3a2a1a',{c:1,r:.35});A.box(9,.9,Z0-17,9.2,.06,3.3,'#d9b46a',{ns:1});for(var ch=-3;ch<=3;ch+=2){A.box(9+ch*1.1,.5,Z0-14.5,.8,.8,.8,'#222',{ns:1});A.box(9+ch*1.1,.5,Z0-19.5,.8,.8,.8,'#222',{ns:1})}
  A.box(HW-.4,.3,Z0-17,.2,4,9,null,{mat:glow(0xbfe8ff),ns:1});sign(A,'📊 BOARDROOM',9,UH-1.3,Z0-12.5,0,1.5,'#fff','rgba(40,20,70,.95)');
  A.box(HW-1,0,Z0-34,1.2,3.5,12,'#2d333d',{c:1,r:.4,m:.5});for(var r=0;r<5;r++)for(var cc=0;cc<10;cc++){A.box(HW-1.65,.5+r*.6,Z0-39+cc*1.1,.05,.5,1,'#8a909b',{ns:1,m:.8});A.box(HW-1.7,.7+r*.6,Z0-39+cc*1.1,.04,.08,.2,'#d9a520',{ns:1})}
  sign(A,'🔐 SAFE DEPOSIT',HW-3,5,Z0-34,0,1.5,'#fff','rgba(60,20,20,.95)');
  A.spot({x:HW-4.5,z:Z0+30,r:3.2,label:'☕ Buy a coffee · '+fm(5),fn:function(){if(spend(5)){stat('en',15);stat('fn',5);toast('☕ Fresh coffee · +15 energy')}}});
  // art, statues, fish tank
  A.box(-7,0,Z0+40,2,.7,2,'#c8c0ae',{c:1});A.cyl(-7,.7,Z0+40,.45,.7,2.4,'#e8e2d0',{c:1,r:.4});A.sph(-7,3.4,Z0+40,.5,M('#e8e2d0',.4));
  A.box(7.5,.5,Z0-5,9,2.6,1,'#1a1e2a',{c:1,r:.3});A.box(7.5,.7,Z0-4.45,8.4,2.2,.06,null,{mat:glow(0x2a9fe0),ns:1});
  for(var f=0;f<9;f++)A.box(4.5+f*.9,1+(f*13%10)/8,Z0-4.4,.32,.14,.04,f%2?'#ff9f43':'#ffd23f',{mat:glow(f%2?0xff9f43:0xffd23f),ns:1});
  A.cyl(0,0,Z0-L+6,.8,.8,.2,'#d9a520',{mat:gold,seg:20});sign(A,'⭐ Thank you for banking with Heirloom',0,UH-1,Z0-L+3,0,1.8,'#ffd23f','rgba(15,42,30,.95)');
  for(var k2=-40;k2<=40;k2+=16){chandelier(A,0,UH-1.8,Z0+k2,1.2);A.light(0,UH-2,k2+Z0,0xfff0d0,1.5,36);A.cyl(-HW+.5,0,Z0+k2+8,.45,.45,UH,'#f6f1e4',{c:1})}
  // down lift at the south end
  A.box(0,0,Z0+L-.5,6,4.8,.5,'#aab0ba',{r:.25,m:.9,ns:1});A.box(0,0,Z0+L-.8,2.6,4.2,.1,'#c8ced8',{ns:1,m:.9,r:.2});sign(A,'🛗 LIFT · GROUND FLOOR',0,5.6,Z0+L-1,0,1.4,'#fff','rgba(20,40,90,.95)');
  A.spot({x:0,z:Z0+L-3.5,r:4,label:'🛗 Lift down to the lobby',fn:function(){K.ride(0,0,Math.PI,'Ground floor')}});
  return{}}
/* ---------------- trouble: slap the manager → security rushes you ---------------- */
var alarm=null;
function raiseAlarm(A){if(alarm)return;var C=K.CXZ(),guards=[];
  [[-6,Z0+L0()-3],[6,Z0+L0()-3]].forEach(function(p,i){var n=A.npc(p[0],p[1],0,{female:false,build:1.35,tc:'#1b2a4a',bc:'#1b2a4a',hat:1,hatc:'#1b2a4a',shades:true},'Security');n.hits=0;n.downT=0;guards.push(n)});
  alarm={guards:guards,hurt:0,caught:0};banner('🚨 ALARM','Security is coming for you! Fight or run.',3200,'#ff4d4d');try{sfx.siren&&sfx.siren(.6)}catch(e){}
  var btn=el('button','position:fixed;right:10px;bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:31;display:none;padding:12px 16px;border-radius:14px;border:1px solid #fff6;background:rgba(150,30,30,.85);color:#fff;font:800 15px system-ui','🥊 Punch the guard');document.body.appendChild(btn);alarm.btn=btn;
  btn.onclick=function(e){e.stopPropagation();var px=player.x-C[0],pz=player.z-C[1];var g=guards.filter(function(n){return n.downT<=0&&Math.hypot(n.x-px,n.z-pz)<2.6})[0];if(!g)return;
    try{player.H.a.punchT=1;sfx.punch()}catch(x){}g.hits++;if(g.hits>=3){g.downT=9;g.hits=0;g.H.root.rotation.x=-1.45;g.H.root.position.y=K.FY+.35;var b=Math.min(150,Math.floor(player.money));player.money-=b;S.stats.spent+=b;banner('🚑 GUARD KNOCKED OUT','Rushed to hospital · you pay '+fm(b),2400,'#ff6b6b');if(typeof wantedBoost==='function')wantedBoost(2)}else toast('💥 Hit!')};
  alarm.iv=setInterval(function(){if(!K.inside()||!alarm){stopAlarm();return}var C2=K.CXZ(),px=player.x-C2[0],pz=player.z-C2[1],close=false,allDown=true;
    guards.forEach(function(n){if(n.downT>0){n.downT-=.1;if(n.downT<=0){n.H.root.rotation.x=0;n.H.root.position.y=K.FY}else{return}}allDown=false;
      var dx=px-n.x,dz=pz-n.z,d=Math.hypot(dx,dz);if(d>1.5){n.x+=dx/d*.46;n.z+=dz/d*.46;n.H.root.position.set(n.x,K.FY,n.z);n.H.root.rotation.y=Math.atan2(dx,dz);try{animHuman(n.H,.1,4.5,'walk',{})}catch(e){}}
      if(d<2.6)close=true;if(d<1.7){alarm.hurt+=.1;if(alarm.hurt>=1.4){alarm.hurt=0;alarm.caught++;player.hp=Math.max(25,player.hp-12);toast('👮 Security grabs you! ('+alarm.caught+'/3)');if(alarm.caught>=3){stopAlarm();if(typeof busted==='function')busted()}}}});
    btn.style.display=close?'block':'none';
    if(allDown&&guards.every(function(n){return n.downT>0})){/* wait */}
  },100)}
function L0(){return 50}
function stopAlarm(){if(!alarm)return;clearInterval(alarm.iv);if(alarm.btn)alarm.btn.remove();alarm=null}
function build(A){lobby(A);upstairs(A);window.__bankA=A;
  A.spot({x:-13,z:Z0+12,r:2.2,label:'👋 Slap Mr. Adewale',fn:function(){banner('👋 *SLAP!*','The manager is furious',1800,'#ffd23f');raiseAlarm(A)}});
  return{spawn:{x:0,z:23,h:Math.PI},exit:{x:0,z:27.8,r:1.5}}}
K.reg('bank',{poi:1,build:build,onLeave:function(){stopAlarm();window.__bankA=null},banner:['🏦 HEIRLOOM BANK','Save your cash · lifts on the right go upstairs','#35e0b0']});
/* ---------------- the bank panel ---------------- */
P.bank=function(a){var b=S.bank,tab=(a&&a.tab)||'save',fd=b.fd;
  var tabs='<div class="row" style="margin:6px 0">'+[['save','💰 Savings'],['invest','📈 Fixed deposit']].map(function(t){return'<button class="btn sm'+(tab===t[0]?' on':'')+'" data-a="bktab" data-v="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>';
  var body='';
  if(tab==='save'){body='<div class="cap">Savings earn <b>1% every morning</b> (up to '+fm(500)+'/day). Safe while you play.</div><div class="row">'+[100,500,1000,5000].map(function(n){return'<button class="btn sm" data-a="bkdep" data-v="'+n+'">+'+fm(n)+'</button>'}).join('')+'<button class="btn sm" data-a="bkdep" data-v="all">All</button></div><div class="row" style="margin-top:6px">'+[100,500,1000,5000].map(function(n){return'<button class="btn sm" data-a="bkwd" data-v="'+n+'">−'+fm(n)+'</button>'}).join('')+'<button class="btn sm" data-a="bkwd" data-v="all">All</button></div>'}
  else body='<div class="cap">Lock money for <b>3 days</b> and get <b>+20%</b> back. Money is locked until then.</div>'+(fd?'<div class="item"><span class="ie">🔒</span><b>Locked '+fm(fd.amt)+'<small>Ready on day '+fd.day+' · pays '+fm(Math.round(fd.amt*1.2))+'</small></b>'+(S.day>=fd.day?'<button class="buy" data-a="bkfdcollect">Collect</button>':'')+'</div>':'<div class="row">'+[1000,5000,20000].map(function(n){return'<button class="btn sm" data-a="bkfd" data-v="'+n+'">Lock '+fm(n)+'</button>'}).join('')+'</div>');
  return{h:hd('🏦 Heirloom Bank','Balance '+fm(b.bal)+' · Cash '+fm(player.money))+tabs+body}};
ACT.bktab=function(v){show('bank',{tab:v})};
ACT.bkdep=function(v){var n=v==='all'?Math.floor(player.money):+v;if(n<=0||player.money<n){toast('Not enough cash 💸');return}player.money-=n;S.bank.bal+=n;toast('🏦 Saved '+fm(n));saveGame();refresh()};
ACT.bkwd=function(v){var n=v==='all'?Math.floor(S.bank.bal):+v;if(n<=0||S.bank.bal<n){toast('Not enough in your account');return}S.bank.bal-=n;player.money+=n;toast('💵 Took out '+fm(n));saveGame();refresh()};
ACT.bkfd=function(v){var n=+v;if(S.bank.fd){toast('You already have a deposit running');return}if(player.money<n){toast('Not enough cash 💸');return}player.money-=n;S.bank.fd={amt:n,day:S.day+3};toast('🔒 Locked '+fm(n)+' for 3 days');saveGame();show('bank',{tab:'invest'})};
ACT.bkfdcollect=function(){var f=S.bank.fd;if(!f||S.day<f.day)return;var t=Math.round(f.amt*1.2);S.bank.fd=null;addMoney(t);S.bank.earned+=t-f.amt;saveGame();show('bank',{tab:'invest'})};
var lastDay=S.day;setInterval(function(){if(window.__mode!=='play')return;if(S.day!==lastDay){var d=S.day-lastDay;lastDay=S.day;if(d>0&&S.bank.bal>0){var i=Math.min(500,Math.floor(S.bank.bal*.01))*Math.min(d,3);if(i>0){S.bank.bal+=i;S.bank.earned+=i;toast('🏦 Bank interest +'+fm(i))}}}},1000);
window.__bank={enter:function(){K.enter('bank')}};
})();
