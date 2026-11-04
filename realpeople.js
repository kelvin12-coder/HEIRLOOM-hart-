/* ===== Heirloom real people: animated man + woman models (Quaternius, CC0) for the player and everyone walking the streets =====
   Skin tone, shirt, trousers, shoes and hair colour come from each person's look, body width and height vary, hats sit on the head. */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof makeHuman!=='function'||typeof animHuman!=='function'||!window.GLB)return;
var T=THREE,MAN=null,WOMAN=null,orig=makeHuman,origAnim=animHuman,all=[];
function sm(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
function lerp(a,b,t){return a+(b-a)*t}
function shade(h,k){var c=new T.Color(h);c.multiplyScalar(k);return'#'+c.getHexString()}
var CLIPS={
  man:{idle:'Idle',walk:'Walk',run:'Run',air:'Jump',sit:'Sitting',down:'Death',punch:'Punch',punch2:'Punch',clap:'Clapping',wave:'Clapping',kneel:'Sitting'},
  woman:{idle:'Idle',walk:'Walk',run:'Run',air:'Run',sit:'Idle_Neutral',down:'Death',punch:'Punch_Right',punch2:'Punch_Left',clap:'Wave',wave:'Wave',aim:'Idle_Gun_Pointing',aimrun:'Run_Shoot',kick:'Kick_Right',kneel:'Idle_Neutral'}};
/* emote -> which clip plays (null = keep the normal idle and just move the body a little) */
var EMOCLIP={wave:'wave',cheer:'clap',clap:'clap',laugh:'clap',salute:'wave',selfie:'wave',kick:'kick',point:'wave',kneel:'kneel',sing:'clap',preach:'clap'};
function build(o){
  var F=!!o.female,G=F?WOMAN:MAN,SK=window.SKINS||['#cf9468'],HC=window.HAIRCOL||['#2a1a10'];
  var skin=SK[(o.skin|0)%SK.length],hair=HC[(o.hairCol|0)%HC.length],over={};
  if(F){over.White=o.tc;over.Orange=o.bc;over.Grey=o.shc||'#222';over.Skin=skin;over.Hair_Blond=hair;over.Hair_Brown=shade(hair,.75)}
  else{over.Shirt=o.tc;over.Pants=o.bc;over.Socks=o.shc||'#eee';over.Skin=skin;over.Hair=hair}
  var I=GLB.instance(G,{over:over}),root=new T.Group(),body=new T.Group();root.add(body);body.add(I.root);
  var base=F?.975:.37*.99,bw=Math.max(.82,Math.min(1.7,o.build||1)),bh=o.h||1;
  I.root.scale.set(base*bw,base*bh,base*bw);
  I.meshes.forEach(function(m){var n=m.userData.mn;if(o.hair===4&&(n==='Hair'||n==='Hair_Blond'||n==='Hair_Brown'))m.visible=false});
  var H={root:root,body:body,o:o,real:true,female:F,I:I,a:{phase:Math.random()*6,blink:2,down:0,punchT:0,hit:0,air:0,look:0,sway:Math.random()*6,aimT:0,smooth:0,run:0},act:{},w:{},xtra:[],eyes:[{scale:{y:1}},{scale:{y:1}}]};
  H.hips=H.torso=H.head=body;H.legs=[];H.arms=[];
  var mx=new T.AnimationMixer(I.root);H.mixer=mx;var C=CLIPS[F?'woman':'man'];
  Object.keys(C).forEach(function(k){var cl=I.clips[C[k]];if(!cl||H.act[k])return;var a=mx.clipAction(cl);a.play();a.setEffectiveWeight(0);a.enabled=false;
    if(k==='down'){a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true}H.act[k]=a;H.w[k]=0});
  H.act.idle.enabled=true;H.act.idle.setEffectiveWeight(1);H.w.idle=1;
  mx.update(Math.random()*2);
  I.root.updateMatrixWorld(true);
  var hand=I.by[F?'Wrist.R':'Palm.R'],head=I.by.Head,ws=new T.Vector3();
  if(hand){hand.getWorldScale(ws);var gun=new T.Group();gun.scale.setScalar(1/ws.y);hand.add(gun);H.gun=gun;gun.userData.real=1;
    gun.rotation.set(F?0:0,0,0);gun.position.set(0,0,0);gun.visible=true}
  else H.gun=new T.Group();
  H.bones={ua:I.by['UpperArm.R'],la:I.by['LowerArm.R'],ab:I.by.Abdomen,to:I.by.Torso,head:head};
  H.bq={};['ua','la','ab','to','head'].forEach(function(k){if(H.bones[k])H.bq[k]=H.bones[k].quaternion.clone()});
  hat(H,o,head);
  if(o.shades&&head){var hs=new T.Group();head.getWorldScale(ws);var k=1/ws.y;
    var gm=new T.Mesh(new T.BoxGeometry(.19,.045,.03),new T.MeshBasicMaterial({color:0x0a0a0d}));hs.add(gm);hs.scale.setScalar(k);hs.position.set(0,F?.115*k*0+.0:0,0);H.shades=hs;head.add(hs);hs.userData.pos=1}
  all.push(H);return H}
/* hats and sunglasses are small simple pieces fixed to the head bone */
function hat(H,o,head){if(!head||!o.hat)return;var ws=new T.Vector3();head.getWorldScale(ws);var k=1/ws.y,g=new T.Group(),col=o.hatc||'#c22',M=function(c){return new T.MeshToonMaterial({color:c,gradientMap:GLB.GRAD})};
  var F=H.female,hy=F?.2:.19; // height of the head centre above the head joint (metres)
  function add(geo,c,x,y,z){var m=new T.Mesh(geo,M(c));m.position.set(x,y,z);g.add(m);return m}
  if(o.hat===7&&window.HM){var fh=HM.make('fhat',1.45,0);fh.position.set(0,hy+.11,0);g.add(fh)}
  else if(o.hat===2){add(new T.SphereGeometry(.125,12,8),col,0,hy+.05,0).scale.set(1,.9,1.05);add(new T.SphereGeometry(.03,8,6),shade(col,1.3),0,hy+.18,0)}
  else if(o.hat===3||o.hat===4){add(new T.CylinderGeometry(.11,.12,.1,14),col,0,hy+.09,0);add(new T.CylinderGeometry(.2,.2,.012,16),shade(col,.7),0,hy+.04,0)}
  else if(o.hat===5){var w=add(new T.SphereGeometry(.17,12,8),col,0,hy+.07,0);w.scale.set(1.05,.8,1.05);add(new T.SphereGeometry(.09,8,6),shade(col,1.2),.1,hy+.2,.03)}
  else if(o.hat===6){add(new T.CylinderGeometry(.128,.128,.04,14),col,0,hy+.06,0)}
  else{var cap=add(new T.SphereGeometry(.125,14,8,0,Math.PI*2,0,Math.PI*.55),col,0,hy+.03,0);cap.scale.set(1,1,1.05);var br=add(new T.BoxGeometry(.16,.012,.1),shade(col,.75),0,hy+.045,.14);br.rotation.x=.12}
  g.scale.setScalar(k);head.add(g);H.hatG=g}
var EMOFX={ // small whole-body moves for emotes that do not have their own animation
  flex:function(H,t){H.body.rotation.z=Math.sin(t*3)*.04},laugh:function(H,t){H.body.position.y=Math.abs(Math.sin(t*12))*.04},spin:function(H,t){H.body.rotation.y=t*8%(Math.PI*2)},
  sway:function(H,t){H.body.rotation.z=Math.sin(t*5)*.09;H.body.rotation.y=Math.sin(t*5)*.3;H.body.position.y=Math.abs(Math.sin(t*5))*.04},
  taunt:function(H,t){H.body.rotation.z=Math.sin(t*8)*.05},cheer:function(H,t){H.body.position.y=Math.abs(Math.sin(t*6))*.12},stomp:function(H,t){H.body.position.y=Math.abs(Math.sin(t*10))*.03},
  shrug:function(H,t){H.body.rotation.y=Math.sin(t*3)*.15}};
var BEND=function(H,k){ // bend at the waist (rukuk, bow, facepalm)
  var b=H.bones,q=new T.Quaternion();['ab','to'].forEach(function(n){if(b[n]){q.setFromAxisAngle(new T.Vector3(1,0,0),k*.5);b[n].quaternion.copy(H.bq[n]).premultiply(q)}})};
/* ---- the animation driver: same call as animHuman, so the rest of the game does not change ---- */
function realAnim(H,dt,sp,st,opt){
  opt=opt||{};var A=H.a,act=H.act,w=H.w,F=H.female,man=!F;
  var rn=sm(2.4,5.8,sp),wk=sm(.08,.9,sp);A.run=lerp(A.run,rn,Math.min(1,dt*8));A.smooth=lerp(A.smooth,wk,Math.min(1,dt*10));wk=A.smooth;rn=A.run;A.sway+=dt;
  var tg={},mode='loco',emo=A.emo,emoName=emo&&emo.n,punching=A.punchT>0;
  if(punching){A.punchT=Math.max(0,A.punchT-dt/.45)}
  if(punching&&!H._pp){H._pp=1;var pa=act[(man||A.punchSide)?'punch':'punch2'];if(pa){pa.reset();pa.enabled=true;pa.play()}}if(!punching)H._pp=0;
  if(st==='down')mode='down';else if(punching)mode=(man||A.punchSide)?'punch':'punch2';else if(st==='sit')mode='sit';
  else if(emoName&&(EMOCLIP[emoName]||EMOFX[emoName]||/rukuk|sujud|bow|facepalm|pray|think/.test(emoName)))mode='emo';
  else if(st==='dance')mode='dance';else if(st==='air'||A.air>.3)mode='air';
  var aiming=!!opt.aim;
  if(mode==='down'){if(!H._dn){H._dn=1;act.down.reset();act.down.enabled=true;act.down.play()}tg.down=1}else{H._dn=0}
  if(mode==='punch'||mode==='punch2'){tg[mode]=1}
  else if(mode==='sit'){tg.sit=1}
  else if(mode==='emo'){var ck=EMOCLIP[emoName],ac=ck&&act[ck];if(ac)tg[ck]=1;else tg.idle=1}
  else if(mode==='dance'){tg[act.clap?'clap':'idle']=1}
  else if(mode==='air'){tg[man?'air':'run']=1}
  else if(aiming&&act.aim){if(sp>.7){tg.aimrun=1}else tg.aim=1}
  else{tg.idle=1-wk;tg.walk=wk*(1-rn);tg.run=wk*rn}
  var k=Math.min(1,dt*(mode==='down'?7:11)),a;
  for(var n in act){a=act[n];var t=tg[n]||0;w[n]=lerp(w[n],t,k);if(w[n]<.004&&!t){if(a.enabled){a.enabled=false;a.setEffectiveWeight(0)}}else{if(!a.enabled){a.enabled=true;if(!a.isRunning())a.play()}a.setEffectiveWeight(w[n])}}
  if(act.walk)act.walk.timeScale=Math.max(.5,Math.min(1.9,sp/1.55));if(act.run)act.run.timeScale=Math.max(.7,Math.min(1.6,sp/5));
  if(mode==='air'&&!man)act.run.timeScale=.35;
  if(!H._far)H.mixer.update(dt);
  // ---- body moves on top of the clip ----
  var b=H.body;b.rotation.set(0,0,0);b.position.set(0,0,0);
  if(mode==='sit')b.position.y=man?0:-.34;
  if(mode==='dance'){var tt=A.sway*5.2;b.position.y=Math.abs(Math.sin(tt))*.05;b.rotation.z=Math.sin(tt)*.1;b.rotation.y=Math.sin(tt*.5)*.35}
  var B=H.bones,q0;for(var kk in H.bq){if(B[kk])B[kk].quaternion.copy(H.bq[kk])}
  if(emoName&&mode==='emo'){var et=(Date.now()-emo.t0)/1000;
    if(EMOFX[emoName])EMOFX[emoName](H,et);
    if(emoName==='rukuk'||emoName==='bow')BEND(H,1.5);else if(emoName==='facepalm')BEND(H,.5);else if(emoName==='sujud'){var h=.93,th=1.45;b.rotation.x=th;b.position.set(0,h-h*Math.cos(th)-.05,-h*Math.sin(th)*.5)}
    else if(emoName==='sleepy')BEND(H,-.15)}
  // man has no aiming clip: raise the right arm to point forward
  if(aiming&&man&&B.ua){A.aimT=lerp(A.aimT,1,Math.min(1,dt*12))}else A.aimT=lerp(A.aimT,0,Math.min(1,dt*12));
  if(man&&B.ua&&A.aimT>.02){var qa=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),1.35*A.aimT);B.ua.quaternion.premultiply(qa)}
  if(A.flipT>0){A.flipT-=dt;var fp=1-Math.max(0,A.flipT)/.7,fr=-fp*Math.PI*2,h2=.9;b.rotation.x=fr;b.position.y=h2-h2*Math.cos(fr);b.position.z=-h2*Math.sin(fr)}
  if(H.flash){if(A.flashT>0){A.flashT-=dt;H.flash.visible=true}else H.flash.visible=false}
  A.blink-=dt}
/* ---- plug in ---- */
function special(o){return o.live&&([4,8].indexOf(o.ts|0)>=0||[2,7,9].indexOf(o.bs|0)>=0)}
makeHuman=function(o){if(MAN&&WOMAN&&!o.cartoon&&!special(o)){try{return build(Object.assign({female:false,skin:2,hair:0,hairCol:1,tc:'#e8e8e8',bc:'#2f4a7a',shc:'#f4f4f4',hat:0,hatc:'#c22',build:1,h:1},o))}catch(e){console.warn('real person failed',e)}}return orig(o)};
animHuman=function(H,dt,sp,st,opt){if(H&&H.real)return realAnim(H,dt,sp,st,opt);return origAnim(H,dt,sp,st,opt)};
/* people far from the camera stop animating and hide (keeps phones fast) */
setInterval(function(){if(typeof camera==='undefined')return;var cx=camera.position.x,cz=camera.position.z,i,H,d,p;
  for(i=all.length-1;i>=0;i--){H=all[i];if(!H.root.parent&&!H.root.visible&&H._gone){all.splice(i,1);continue}}
  var list=(typeof peds!=='undefined'?peds:[]);list.forEach(function(p){H=p.H;if(!H||!H.real)return;d=Math.hypot(p.x-cx,p.z-cz);H._far=d>48;H.I.root.visible=d<110})
},350);
/* once the models have loaded, swap the people already standing around, and the player */
function swapAll(){try{
  if(typeof peds!=='undefined')peds.forEach(function(p){var H=p.H;if(!H||H.real||H.o&&H.o.cartoon)return;var n=makeHuman(H.o||{}),r=H.root;if(!n.real)return;n.root.position.copy(r.position);n.root.rotation.copy(r.rotation);n.root.visible=r.visible;
    scene.remove(r);scene.add(n.root);p.H=n;if(typeof humanShadows==='function')humanShadows(n,false)});
  if(typeof player!=='undefined'&&player.H&&!player.H.real&&typeof rebuildPlayer==='function')rebuildPlayer()}catch(e){console.warn(e)}}
var got=0;function ready(){if(++got<2)return;swapAll();window.__real={ok:true}}
GLB.load('man',function(G){MAN=G;ready()});GLB.load('woman',function(G){WOMAN=G;ready()});
window.__realBuild=build;
})();
