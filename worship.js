/* ===== Heirloom worship: a church and a mosque you can walk into, with a short prayer session you can share ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof ACT==='undefined'||typeof P==='undefined')return;
var npcs=[],SV=null,mbox=null,mframe=null,mlab=null,FY=100,IN=false,KIND='',grp=null,CX=0,CZ=0,OUT=null,lights=[],boxes=null,cityCol=null,cityCirc=null,bar=null,cap=null,t0=0,lines=[],nextAt=0,li=0,SESSION=300,done=false,hw=9,hl=20;
var prev=groundH;groundH=function(x,z){if(!IN)return prev(x,z);if(KIND==='church'){var lx=x-CX,lz=z-CZ,ax=Math.abs(lx);
  if(ax>=hw-2.6&&ax<=hw&&lz>=11&&lz<=17)return FY+Math.max(0,Math.min(1,(17-lz)/6))*4.4;
  if(ax>=hw-3.6&&ax<=hw&&lz>=-18&&lz<10.8&&player.y>FY+3.2)return FY+4.4}
  return FY};
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function M(c,r,m,o){var p={color:new THREE.Color(c),roughness:r===undefined?.8:r,metalness:m||0};if(o)Object.assign(p,o);var mm=new THREE.MeshStandardMaterial(p);return window.SKIN&&typeof c==='string'?SKIN.auto(mm,c):mm}
function B(g,w,h,d,x,y,z,c,o){o=o||{};var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),o.mat||M(c,o.r,o.m));m.position.set(x,y,z);m.castShadow=!o.ns;m.receiveShadow=true;g.add(m);return m}
function glow(c){return new THREE.MeshBasicMaterial({color:c,toneMapped:false})}
function spot(){var best=null,bd=-1,pois=(CITY&&CITY.pois)||[];for(var gx=4;gx<N-2;gx+=2)for(var gz=2;gz<N-2;gz+=2){var x=bcx(gx),z=bcx(gz),m=1e9;pois.forEach(function(p){var d=Math.hypot(p.pos.x-x,p.pos.z-z);if(d<m)m=d});if(m>bd){bd=m;best=[x,z]}}return best||[0,0]}
var PRAY={
  church:['Welcome to the house of God. Let us pray together.','Heavenly Father, we thank You for this new day and for the breath in our lungs.','Bless our families, our friends and everyone in this city.','Give us wisdom, patience and strength for the week ahead.','Lord, guide the young ones, protect the travellers, and heal the sick.','May Your goodness and mercy follow us all the days of our lives.','Teach us to forgive, to be generous, and to love our neighbours.','Jesus loves you. You are not alone. Peace be with you.','Open doors of good things for each person here, in Jesus name. Amen.'],
  mosque:['Bismillah. In the name of God, the Most Gracious, the Most Merciful.','All praise is due to God, Lord of all the worlds.','O God, guide us, forgive us, and grant us peace and good health.','Make us kind to our parents, our neighbours and to strangers.','Protect our families, ease the hardship of those in need, and heal the sick.','Our Lord, grant us good in this world and good in the Hereafter.','Grant us patience, honest work, and halal provision.','Peace be upon you and the mercy of God. Ameen.']};
function build(kind){hw=kind==='church'?9:10;hl=kind==='church'?20:17;var sp=spot();CX=sp[0];CZ=sp[1];grp=new THREE.Group();grp.position.set(CX,0,CZ);var g=grp,church=kind==='church',H=church?13:11;
  B(g,2*hw+2,.5,2*hl+2,0,FY-.25,0,church?'#d9cdb8':'#efe8d6',{r:.3});
  var wall=church?'#f4efe6':'#f7f2e4',trim=church?'#6a4a2e':'#2f7d62';
  B(g,2*hw+1,H,.5,0,FY+H/2,-hl-.25,wall);B(g,.5,H,2*hl,-hw-.25,FY+H/2,0,wall);B(g,.5,H,2*hl,hw+.25,FY+H/2,0,wall);
  var dw=3.2,sd=(2*hw+1-dw)/2;B(g,sd,H,.5,-(dw/2+sd/2),FY+H/2,hl+.25,wall);B(g,sd,H,.5,(dw/2+sd/2),FY+H/2,hl+.25,wall);B(g,dw,H-4.4,.5,0,FY+4.4+(H-4.4)/2,hl+.25,wall);
  B(g,2*hw+2,.6,.7,0,FY+.3,-hl-.2,trim);
  // ceiling beams / ceiling
  B(g,2*hw+1,.5,2*hl+1,0,FY+H+.25,0,church?'#e9dfcc':'#f3ecd8',{ns:1});for(var z=-hl+3;z<hl;z+=6)B(g,2*hw,.6,.5,0,FY+H-.3,z,trim,{ns:1});
  var winC=church?[0xd6252b,0x2f80ed,0xf2b705,0x2fb67c,0x7a2cff]:[0x2f9d7d,0x2f80ed,0xf2b705,0x2fb67c];
  for(var s=-1;s<=1;s+=2)for(var wz=-hl+4,k=0;wz<hl-2;wz+=5,k++)B(g,.15,5,2.2,s*(hw-.05),FY+6,wz,'#fff',{mat:new THREE.MeshBasicMaterial({color:winC[k%winC.length],transparent:true,opacity:.7,toneMapped:false}),ns:1});
  if(church){
    // aisle carpet, pews, altar, cross, pulpit, candles, organ pipes
    B(g,2.4,.04,2*hl-4,0,FY+.03,-1,'#8b1a22',{ns:1});
    for(var side=-1;side<=1;side+=2)for(var r=0;r<9;r++){var pz=hl-6-r*3.1;B(g,5.4,.08,1,side*5.2,FY+.9,pz,'#6a4528');B(g,5.4,.9,.12,side*5.2,FY+.55,pz+.56,'#5a3a22');B(g,.2,.9,.9,side*(5.2-2.6),FY+.45,pz,'#4a2f1b');B(g,.2,.9,.9,side*(5.2+2.6),FY+.45,pz,'#4a2f1b')}
    B(g,14,.7,5,0,FY+.35,-hl+3.2,'#c9b48a');B(g,6,.6,3,0,FY+1.0,-hl+2.2,'#e6e1d6');B(g,1.6,1.1,.8,0,FY+1.9,-hl+2.2,'#f4f0e6');
    B(g,.5,5.2,.5,0,FY+5,-hl+.8,'#d9a520',{m:.7,r:.3});B(g,3,.5,.5,0,FY+6.3,-hl+.8,'#d9a520',{m:.7,r:.3});
    B(g,2,1.3,1.2,-5.5,FY+1.2,-hl+3.2,'#7a5230');
    [-4,-2.2,2.2,4].forEach(function(x){B(g,.2,.9,.2,x,FY+1.15,-hl+1.4,'#fff4cf',{ns:1});B(g,.12,.18,.12,x,FY+1.7,-hl+1.4,'#fff',{mat:glow(0xffd070),ns:1})});
    for(var p=-6;p<=6;p+=1.2)B(g,.5,2.5+Math.abs(Math.sin(p))*2.5,.5,p,FY+3+Math.abs(Math.sin(p)),-hl+.4,'#c8c0ae',{m:.5,r:.3,ns:1});
    B(g,.6,6,.6,-hw+.5,FY+3,hl-1,'#e7ddc9');B(g,.6,6,.6,hw-.5,FY+3,hl-1,'#e7ddc9');   // porch posts
  }else{
    // prayer carpet with rows, mihrab niche, minbar, columns, chandeliers, shoe rack, dome
    B(g,2*hw-2,.05,2*hl-4,0,FY+.04,-1,'#1f6b4f',{ns:1});for(var rz=-hl+4;rz<hl-3;rz+=2.2)B(g,2*hw-3,.06,.18,0,FY+.06,rz,'#e8d9a0',{ns:1});
    B(g,7,.05,2*hl-4,0,FY+.07,-1,'#a52a2a',{ns:1});for(var rz2=-hl+4;rz2<hl-3;rz2+=2.2)B(g,6.2,.07,.12,0,FY+.09,rz2,'#f0e2b0',{ns:1});
    B(g,5,6,1,0,FY+3,-hl+.2,'#f0e9d6');B(g,3,4.4,1.1,0,FY+2.4,-hl+.3,'#2f7d62');B(g,2.6,.35,1.2,0,FY+4.8,-hl+.35,'#d9a520',{m:.7,r:.3});B(g,.35,4.4,1.2,-1.5,FY+2.4,-hl+.35,'#d9a520',{m:.7,r:.3});B(g,.35,4.4,1.2,1.5,FY+2.4,-hl+.35,'#d9a520',{m:.7,r:.3});
    for(var st=0;st<5;st++)B(g,2.2,.5+st*.5,.9,hw-3,FY+(.5+st*.5)/2,-hl+3+st*.9,'#7a5230');B(g,2.4,.2,1.2,hw-3,FY+3.3,-hl+7.5,'#7a5230');
    [-6,6].forEach(function(x){for(var z2=-hl+5;z2<hl-4;z2+=6)B(g,1,H,1,x,FY+H/2,z2,'#efe6cf');});
    [-8,0,8].forEach(function(z3){var ch=new THREE.Mesh(new THREE.SphereGeometry(.8,12,10),glow(0xffe08a));ch.position.set(0,FY+H-2.4,z3);g.add(ch);B(g,.05,2.2,.05,0,FY+H-1.2,z3,'#cfa83b',{ns:1});for(var a=0;a<8;a++){var b2=new THREE.Mesh(new THREE.SphereGeometry(.18,6,6),glow(0xffe9b0));b2.position.set(Math.cos(a*.785)*1.4,FY+H-3,z3+Math.sin(a*.785)*1.4);g.add(b2)}});
    B(g,3,1,.5,-hw+2,FY+.5,hl-1.2,'#7a5230');for(var sx=-1;sx<=1;sx++)B(g,.5,.12,.3,-hw+2+sx*.8,FY+1.07,hl-1.2,'#2a2a2a',{ns:1});
    var dome=new THREE.Mesh(new THREE.SphereGeometry(7,20,10,0,6.283,0,1.5),M('#e8e2cf',.4,.1,{side:THREE.DoubleSide}));dome.position.set(0,FY+H+.4,0);g.add(dome);
    for(var f=-hw;f<hw;f+=1.4)B(g,.9,.5,.2,f+.7,FY+H-.6,-hl+.15,f%2?'#2f9d7d':'#d9a520',{ns:1});
  }
  npcs=[];extras(g,kind);
  scene.add(g);boxes=new Map();var old=colBoxes;colBoxes=boxes;
  colAddBox(CX-hw-.5,CZ-hl-.5,CX+hw+.5,CZ-hl,FY+H,'ww');colAddBox(CX-hw-.5,CZ-hl,CX-hw,CZ+hl,FY+H,'ww');colAddBox(CX+hw,CZ-hl,CX+hw+.5,CZ+hl,FY+H,'ww');
  colAddBox(CX-hw-.5,CZ+hl,CX-dw/2,CZ+hl+.5,FY+H,'ww');colAddBox(CX+dw/2,CZ+hl,CX+hw+.5,CZ+hl+.5,FY+H,'ww');
  if(church){for(var s2=-1;s2<=1;s2+=2)for(var r2=0;r2<9;r2++)colAddBox(CX+s2*5.2-2.7,CZ+hl-6-r2*3.1-.5,CX+s2*5.2+2.7,CZ+hl-6-r2*3.1+.7,FY+1,'pw');colAddBox(CX-7,CZ-hl+.7,CX+7,CZ-hl+5.7,FY+1.4,'aw')}
  else{[-6,6].forEach(function(x){for(var z4=-hl+5;z4<hl-4;z4+=6)colAddBox(CX+x-.6,CZ+z4-.6,CX+x+.6,CZ+z4+.6,FY+H,'cw')});colAddBox(CX-hw+.5,CZ+hl-1.6,CX-hw+3.5,CZ+hl-.8,FY+1,'rk')}
  if(church){[-1,1].forEach(function(sd){var rb=colAddBox(CX+sd*(hw-3.55)-.1,CZ-18,CX+sd*(hw-3.55)+.1,CZ+10.8,FY+5.4,'rail');rb.up=1;})}
  colBoxes=old;
  lights=[[0,-hl*.5],[0,hl*.2]].map(function(p){var l=new THREE.PointLight(church?0xfff0d0:0xffe6b0,1.6,40,1.4);l.position.set(CX+p[0],FY+8,CZ+p[1]);return l})}

/* ---------------- people, gallery, signs, music service ---------------- */
var SONGS={church:[['🎶 Praise & worship','smilemercy2/adullam-wwwsix9jacom','Adullam','worship'],['🎶 Praise & worship','labisiesther/yahweh','Yahweh','worship'],['🎶 Praise & worship','stayn-69bc12f9a29ac/seven-wings-im-not-helpless','Seven Wings (I am not helpless)','worship'],['🙏 Prayer time','mondayflame/armour-of-god','Armour of God','prayer'],['🕊️ Closing blessing','ministermike/ran-mi-lowo','Ran mi lowo','close']],
  mosque:[['🕌 Nasheed','islamic-songs-2/murshid-ya-muhammed','Murshid Ya Muhammad','nasheed'],['🤲 Prayer — Ayatul Kursi','muslim-umma/ayatul-kur-si-al-sudais','Ayatul Kursi (Al-Sudais)','prayer'],['🕌 Nasheed','islamic-songs-2/nabi-oh-nabi','Nabi Oh Nabi','nasheed']]};
var SONGSEC=230;
function rr(a,b){return a+Math.random()*(b-a)}
function mkn(x,y,z,ry,look,st){var l=Object.assign(randLook(!!look.female),look);var H=makeHuman(l);H.root.position.set(x,y,z);H.root.rotation.y=ry;grp.add(H.root);var n={H:H,st:st||'idle',x:x,y:y,z:z,ry:ry,sp:0,role:look.role||'',fy:y};npcs.push(n);return n}
function emo(n,name,secs){n.H.a.emo=name?{n:name,t0:Date.now(),end:Date.now()+(secs||60)*1000}:null}
function cross(g,x,y,z,h,col){var m=M(col||'#d9a520',.25,.8);B(g,.35*h,h,.35*h,x,y+h/2,z,null,{mat:m,ns:1});B(g,h*.7,.3*h,.35*h,x,y+h*.68,z,null,{mat:m,ns:1})}
function crescent(g,x,y,z,r){var a=new THREE.Mesh(new THREE.TorusGeometry(r,r*.17,8,26,4.6),M('#d9a520',.25,.8));a.position.set(x,y,z);a.rotation.z=2.2;g.add(a);var st=new THREE.Mesh(new THREE.OctahedronGeometry(r*.28),glow(0xffe08a));st.position.set(x+r*.3,y+r*.15,z);g.add(st)}
function extras(g,kind){var church=kind==='church';
  if(church){
    // signs + big cross above the altar and over the entrance
    cross(g,0,FY+7.5,-hl+.55,4.8);cross(g,0,FY+H_()-3.3,hl-.3,2.4);
    var sg=labelSprite('✝️ HEIRLOOM CHURCH','#2a1a08','rgba(250,225,150,.96)');sg.position.set(0,FY+10.2,-hl+1.2);sg.scale.multiplyScalar(3.4);g.add(sg);
    // upstairs gallery both sides + stairs by the door
    [-1,1].forEach(function(sd){
      B(g,3.6,.3,28.8,sd*(hw-1.8),FY+4.25,-3.6,'#7a5a3a');B(g,.12,1.0,28.8,sd*(hw-3.55),FY+4.95,-3.6,'#4a2f1b',{ns:1});
      for(var z=-16;z<=8;z+=8)B(g,.5,4.1,.5,sd*(hw-3.4),FY+2.05,z,'#e7ddc9');
      for(var i=0;i<12;i++)B(g,2.4,(i+1)*.367,.5,sd*(hw-1.4),FY+(i+1)*.367/2,16.75-i*.5,'#8a6a46');
      B(g,.1,1,6,sd*(hw-2.65),FY+3.2,14,'#4a2f1b',{ns:1}).rotation.x=-.64;
      for(var k=0;k<4;k++)B(g,3,.08,1,sd*(hw-1.8),FY+4.7,-14+k*5.4,'#6a4528');   // balcony benches
      var gl=labelSprite('⬆ Gallery','#fff','rgba(40,30,20,.85)');gl.position.set(sd*(hw-1.4),FY+5.4,17);g.add(gl)});
    // preacher, choir, congregation
    var p=mkn(0,FY+.7,-hl+4.4,0,{female:false,tc:'#f2f2f2',ts:2,bc:'#151515',build:1.1,h:1.03,hat:0,role:'preacher'},'idle');
    var pl=labelSprite('Pastor','#fff','rgba(60,20,20,.9)');pl.position.set(0,FY+3.1,-hl+4.4);g.add(pl);
    for(var c=0;c<5;c++)mkn(-4+c*2,FY+.7,-hl+4.9,0,{female:c%2===0,tc:['#7a1f2b','#f2f2f2','#2f7d62'][c%3],ts:0,bc:'#222',role:'choir',build:rr(.85,1.2)},'idle');
    var seats=[];for(var r=0;r<9;r++)[-1,1].forEach(function(sd){[-1.6,0,1.6].forEach(function(o){seats.push([sd*5.2+o,hl-6-r*3.1+.15])})});
    seats.sort(function(){return Math.random()-.5}).slice(0,16).forEach(function(q,i){var fem=Math.random()<.5;mkn(q[0],FY+.5,q[1],Math.PI,{female:fem,tc:['#c0392b','#2c6e49','#2a4a8a','#d9a520','#f2f2f2','#7a2a8a'][i%6],ts:rr(0,2)|0,bc:'#222',build:rr(.78,1.35),h:rr(.93,1.07),role:'crowd'},'sit')});
  }else{
    crescent(g,0,FY+H_()+9.5,0,2.6);crescent(g,0,FY+9,-hl+.7,1.8);
    var sg2=labelSprite('☪️ HEIRLOOM MOSQUE','#fff','rgba(20,90,70,.96)');sg2.position.set(0,FY+10.4,-hl+1.4);sg2.scale.multiplyScalar(3.4);g.add(sg2);
    var im=mkn(0,FY,-hl+3.4,Math.PI,{female:false,tc:'#f6f6f6',ts:2,bc:'#f6f6f6',hat:2,hatc:'#f6f6f6',build:1.05,role:'imam'},'idle');
    var il=labelSprite('Imam','#fff','rgba(20,90,70,.9)');il.position.set(0,FY+2.9,-hl+3.4);g.add(il);
    for(var row=0;row<4;row++)for(var col=0;col<4;col++)mkn(-4.5+col*3,FY,-hl+7.5+row*3.2,Math.PI,{female:false,tc:['#f2f2f2','#cfe8df','#e8dcc0','#223a5a'][(row+col)%4],ts:rr(0,2)|0,bc:['#f2f2f2','#222','#3a3a3a'][col%3],hat:(row+col)%2?2:0,hatc:'#f2f2f2',build:rr(.8,1.35),h:rr(.93,1.07),role:'crowd'},'idle');
    for(var f=0;f<4;f++)mkn(-hw+1.6+f*.9,FY,hl-3.2,0,{female:true,tc:'#5a2a6a',ts:4,bc:'#5a2a6a',hair:1,build:rr(.85,1.2),role:'sister'},'idle')}}
function H_(){return KIND==='church'?13:11}
function mbShow(url,label){if(!mbox){mbox=el('div','position:fixed;left:50%;top:calc(46px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:36;width:min(330px,92vw);padding:6px 8px;border-radius:12px;background:rgba(10,12,20,.92);border:2px solid #ffb020;color:#fff;font:800 12px system-ui;text-align:center');
  mlab=el('div','margin-bottom:4px');mframe=el('iframe','width:100%;height:96px;border:0;border-radius:8px;display:block');mframe.allow='autoplay; encrypted-media';mbox.appendChild(mlab);mbox.appendChild(mframe);mbox.id='wmusic';document.body.appendChild(mbox)}
  mbox.style.display='block';mbox.style.visibility='visible';mlab.innerHTML=label;if(mframe.dataset.u!==url){mframe.dataset.u=url;mframe.src=url}}
function mbHide(){if(mbox){mbox.style.display='none';if(mframe){mframe.src='about:blank';mframe.dataset.u=''}}}
function embed(path){return'https://audiomack.com/embed/song/'+path+'?background=1&color=ffffff&autoplay=1'}
function svcStart(kind){SV={kind:kind,i:-1,t0:0,end:false,leaving:0,pray:0,join:false};window.__worshipIn=true;svcSong(0)}
function svcSong(i){var L=SONGS[KIND];if(i>=L.length){svcEnd();return}SV.i=i;SV.t0=Date.now();var s=L[i];
  mbShow(embed(s[1]),(i===0?'👇 Tap ▶ once to start the music<br>':'')+s[0]+' · '+s[2]+' ('+(i+1)+'/'+L.length+')');
  var ph=s[3];SV.ph=ph;if(cap){cap.textContent=s[0]+' — '+s[2];cap.style.display='block'}
  npcs.forEach(function(n){if(n.leaving)return;if(KIND==='church'){if(ph==='worship'){if(n.role==='preacher')emo(n,'preach');else if(n.role==='choir')emo(n,'sing');else emo(n,Math.random()<.5?'sing':'clap')}
      else if(ph==='prayer'){emo(n,'pray');}else{emo(n,'sing')}}
    else{if(ph==='prayer'){}else{if(n.role==='imam')emo(n,null);else if(n.role==='crowd')emo(n,null)}}});
  if(KIND==='church'&&ph==='worship')banner('⛪ PRAISE & WORSHIP','Sing, clap, dance with the church!',2600,'#f2d38a');
  if(KIND==='church'&&ph==='prayer')banner('🙏 PRAYER TIME','Bow your head and pray',2600,'#f2d38a');
  if(KIND==='mosque'&&ph==='prayer')banner('🤲 PRAYER','Stand, bow and prostrate with them',2800,'#7fe0b8')}
function svcEnd(){if(!SV||SV.end)return;SV.end=true;mbHide();var msg=KIND==='church'?'⛪ The service has ended. God bless you all! You can stay, go upstairs, or head home.':'🕌 The prayer has ended. May Allah accept it from us all.';
  banner(KIND==='church'?'⛪ SERVICE ENDED':'🕌 PRAYER ENDED','Go in peace',3600,'#f2d38a');if(cap){cap.textContent=msg;cap.style.display='block'}try{sfx.win()}catch(e){}addXP&&addXP(60);try{stat('fn',25);stat('en',10)}catch(e){}
  ui();npcs.forEach(function(n,i){n.leaving=1;n.delay=Date.now()+i*350;emo(n,null)});
  setTimeout(function(){if(IN&&cap)cap.style.display='none'},9000)}
function prayPhase(t){var T=t%26;return T<5?'stand':T<8?'rukuk':T<10?'stand':T<14?'sujud':T<16?'kneel':T<20?'sujud':T<24?'kneel':'stand'}
function svcTick(dt){if(!SV||!IN)return;var now=Date.now();
  if(!SV.end&&now-SV.t0>SONGSEC*1000)svcSong(SV.i+1);
  // mosque prayer choreography
  if(KIND==='mosque'&&!SV.end&&SV.ph==='prayer'){var ph=prayPhase((now-SV.t0)/1000);npcs.forEach(function(n){if(n.role==='crowd'||n.role==='imam'){var nm=ph==='stand'?null:ph;if(nm)emo(n,nm,2);else n.H.a.emo=null}});
    if(SV.join&&player.H){var pn=ph==='stand'?null:ph;if(pn)player.H.a.emo={n:pn,t0:now,end:now+700};else if(player.H.a.emo&&/rukuk|sujud|kneel/.test(player.H.a.emo.n))player.H.a.emo=null}}
  // church: random clapping and cheering
  if(KIND==='church'&&!SV.end&&SV.ph==='worship'&&Math.random()<.03){var c=npcs.filter(function(n){return n.role==='crowd'});var q=c[Math.floor(Math.random()*c.length)];if(q)emo(q,Math.random()<.5?'cheer':'clap',3)}
  if(KIND==='church'&&SV.ph==='prayer'&&Math.random()<.02&&cap&&PRAY.church){var l=PRAY.church[Math.floor(Math.random()*PRAY.church.length)];cap.textContent='🙏 '+l;cap.style.display='block'}
  // leaving
  npcs.forEach(function(n){if(!n.leaving||now<n.delay||n.gone)return;if(n.st==='sit')n.st='idle';
    var dx=-n.x,dz=0;if(n.z>=hl-5||Math.abs(n.x)<=.8){dz=hl+2-n.z}if(n.z<hl-5&&Math.abs(n.x)>.8){dz=0}
    var d=Math.hypot(dx,dz);if(n.z>hl+1||(d<.3&&n.z>hl-1)){n.gone=1;n.H.root.visible=false;return}
    if(d<.05){dx=0;dz=1;d=1}var sp=1.8;n.x+=dx/d*sp*dt*(Math.abs(dx)>.05?1:0);n.z+=dz/d*sp*dt;n.sp=sp;n.H.root.position.set(n.x,FY,n.z);n.H.root.rotation.y=Math.atan2(dx,dz)})}
setInterval(function(){if(!IN||!npcs.length)return;var dt=.06;svcTick(dt);npcs.forEach(function(n){if(n.gone)return;try{animHuman(n.H,dt,n.sp||0,n.st,{})}catch(e){}})},60);
function svcStop(){mbHide();window.__worshipIn=false;SV=null;npcs=[]}
ACT.svcnext=function(){if(SV&&!SV.end)svcSong(SV.i+1)};
ACT.svcjoin=function(){if(SV){SV.join=!SV.join;toast(SV.join?'🤲 You pray with them':'You stopped praying');ui()}};
function say(text){if(cap){cap.textContent='🙏 '+text;cap.style.display='block'}
  try{if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance(text);u.rate=.88;u.pitch=.85;u.volume=1;var v=speechSynthesis.getVoices().filter(function(x){return /en-NG|en-GB|en-ZA/i.test(x.lang)})[0];if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)}}catch(e){}}
function enter(kind){if(IN)return;if(typeof MISSION!=='undefined'&&MISSION.cur){toast('Finish your current job first');return}
  var busy=[window.__house,window.__showroom,window.__football,window.__bld].some(function(m){return m&&((m.inside&&m.inside())||(m.state&&m.state().IN))});if(busy){toast('Leave where you are first');return}
  if(player.car)exitVehicle(true);OUT={x:player.x,z:player.z,h:player.h};KIND=kind;build(kind);cityCol=colBoxes;cityCirc=colCircs;colBoxes=boxes;colCircs=new Map();IN=true;done=false;
  lights.forEach(function(l){scene.add(l)});player.x=CX;player.z=CZ+hl-2.5;player.y=FY;player.h=Math.PI;player.vx=player.vz=0;cam.yaw=Math.PI;cam.pitch=.18;
  lines=PRAY[kind];li=0;t0=Date.now();nextAt=Date.now()+1e12;svcStart(kind);ui();
  banner(kind==='church'?'⛪ CHURCH':'🕌 MOSQUE','Welcome. Take a moment of peace · '+Math.round(SESSION/60)+' min prayer',3200,kind==='church'?'#f2d38a':'#7fe0b8')}
function ui(){if(!bar){bar=el('div','position:fixed;left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:31;display:none;gap:8px;align-items:center');document.body.appendChild(bar);
    cap=el('div','position:fixed;left:50%;transform:translateX(-50%);bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:30;max-width:min(560px,92vw);padding:10px 16px;border-radius:14px;background:rgba(10,10,16,.78);color:#fff;font:600 15px system-ui;text-align:center;display:none;pointer-events:none');document.body.appendChild(cap)}
  var st='padding:9px 14px;border-radius:14px;border:1px solid #fff5;background:rgba(0,0,0,.66);color:#fff;font:800 14px system-ui';bar.innerHTML='';
  function btn(t,fn,c){var b=el('button',st+(c?';background:'+c:''),t);b.onclick=function(e){e.stopPropagation();fn()};bar.appendChild(b)}
  if(IN&&SV&&!SV.end)btn('⏭ Next song',function(){ACT.svcnext()});if(IN&&KIND==='mosque'&&SV&&!SV.end)btn(SV.join?'🤲 Stop praying':'🤲 Pray with them',function(){ACT.svcjoin()},'#0a7a55');btn('📤 Share',function(){if(window.__share)window.__share()});btn('🚪 Leave',leave);bar.style.display=IN&&window.__mode==='play'?'flex':'none';if(!IN&&cap)cap.style.display='none'}
function cleanup(){IN=false;svcStop();try{speechSynthesis.cancel()}catch(e){}lights.forEach(function(l){scene.remove(l)});if(grp){scene.remove(grp);grp=null}if(cityCol)colBoxes=cityCol;if(cityCirc)colCircs=cityCirc;ui()}
function leave(){if(!IN)return;cleanup();var o=OUT||{x:0,z:0,h:0};placeAt(o.x,o.z,o.h)}
setInterval(function(){if(!IN)return;if(Math.abs(player.x-CX)>80||Math.abs(player.z-CZ)>80||player.y<FY-20){cleanup();return}
  player.inv=Math.max(player.inv||0,3);player.hp=Math.max(player.hp||0,60);if(bar)bar.style.display=window.__mode==='play'?'flex':'none';
  var now=Date.now();if(!done&&now>=nextAt){if(li<lines.length){say(lines[li++]);nextAt=now+16000}else{done=true;say('Amen. Thank you for spending this time. Go in peace.');addXP(40);try{stat('fn',25);stat('en',10)}catch(e){}
      setTimeout(function(){if(IN&&confirm('🙏 Share Heirloom with your friends so they can find peace here too?')&&window.__share)window.__share()},4000)}}
  if(!done&&(now-t0)/1000>SESSION){done=true}
  if(player.z-CZ>hl-.6&&Math.abs(player.x-CX)<1.8&&now-t0>5000)leave()},100);
var osg=saveGame;saveGame=function(){if(!IN||!OUT)return osg.apply(this,arguments);var x=player.x,z=player.z,y=player.y;player.x=OUT.x;player.z=OUT.z;try{return osg.apply(this,arguments)}finally{player.x=x;player.z=z;player.y=y}};
var oc=clearWorld;clearWorld=function(){if(IN)leave();return oc.apply(this,arguments)};
ACT.worship=function(k){closeSheet();enter(k)};
P.church=function(){return{h:hd('⛪ Church','A quiet place to pray')+'<div class="cap">Walk in, sit down, and join a short prayer. You will hear it spoken and see the words. You can share it with friends.</div><div class="row" style="margin-top:10px">'+'<button class="btn sm" data-a="worship" data-v="church">⛪ Go into the church</button>'+'</div>'}};
P.mosque=function(){return{h:hd('🕌 Mosque','A quiet place to pray')+'<div class="cap">Walk in, take a moment of peace, and join a short prayer. You will hear it spoken and see the words. You can share it with friends.</div><div class="row" style="margin-top:10px">'+'<button class="btn sm" data-a="worship" data-v="mosque">🕌 Go into the mosque</button>'+'</div>'}};
var op=P.phone;P.phone=function(a){var r=op(a);r.h=r.h.replace('</div>','<button class="app" data-a="open" data-v="church"><span>⛪</span>Church</button><button class="app" data-a="open" data-v="mosque"><span>🕌</span>Mosque</button></div>');return r};
var _opw=window.openPOI;window.openPOI=function(id){if(id==='church'||id==='mosque'){ACT.worship(id);return}return _opw.apply(this,arguments)};
var symFor=null;
setInterval(function(){if(typeof CITY==='undefined'||!CITY.pois||symFor===CITY.pois||window.__mode!=='play')return;var c=CITY.pois.find(function(p){return p.id==='church'}),m=CITY.pois.find(function(p){return p.id==='mosque'});if(!c||!m)return;symFor=CITY.pois;
  [[c,'church'],[m,'mosque']].forEach(function(q){var p=q[0],g=new THREE.Group();g.position.set(p.pos.x,0,p.pos.z);
    var pil=new THREE.Mesh(new THREE.BoxGeometry(3,22,3),M(q[1]==='church'?'#f4efe6':'#f7f2e4',.5));pil.position.y=11;g.add(pil);
    if(q[1]==='church'){var gm=M('#d9a520',.25,.8);var a1=new THREE.Mesh(new THREE.BoxGeometry(1.1,8,1.1),gm);a1.position.y=26;var a2=new THREE.Mesh(new THREE.BoxGeometry(5,1.1,1.1),gm);a2.position.y=28.5;g.add(a1);g.add(a2)}
    else{var cr=new THREE.Mesh(new THREE.TorusGeometry(3.4,.6,10,30,4.6),M('#d9a520',.25,.8));cr.position.y=26;cr.rotation.z=2.2;g.add(cr);var st=new THREE.Mesh(new THREE.OctahedronGeometry(1),glow(0xffe08a));st.position.set(1.2,27,0);g.add(st)}
    var lb=labelSprite(q[1]==='church'?'✝️ HEIRLOOM CHURCH':'☪️ HEIRLOOM MOSQUE','#fff',q[1]==='church'?'rgba(120,70,20,.95)':'rgba(20,90,70,.95)');lb.position.set(0,33,0);lb.scale.multiplyScalar(5);g.add(lb);scene.add(g)})},1500);
window.__worship={enter:enter,leave:leave,inside:function(){return IN}};
})();
