/* ===== Heirloom weapons: pistol, MP5, shotgun, AK-47 · police/army outfits · gang hideout mission ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof player==='undefined'||typeof shoot==='undefined')return;
var WP={
  pistol:{n:'Pistol',e:'🔫',price:900,rate:.22,dmg:50,pellets:1,spread:0,range:60,heat:.3},
  mp5:{n:'MP5 SMG',e:'🔫',price:3500,rate:.085,dmg:22,pellets:1,spread:.05,range:55,heat:.25},
  shotgun:{n:'Pump Shotgun',e:'💥',price:4200,rate:.75,dmg:26,pellets:6,spread:.11,range:32,heat:.6},
  ak47:{n:'AK-47',e:'🔫',price:9000,rate:.11,dmg:34,pellets:1,spread:.03,range:90,heat:.3}};
var ORDER=['pistol','mp5','shotgun','ak47'];
function owned(){var S2=window.__S||S;S2.guns=Array.isArray(S2.guns)?S2.guns:[];if(S2.hasGun&&S2.guns.indexOf('pistol')<0)S2.guns.push('pistol');return S2.guns}
window.__nextWeapon=function(){var o=owned().slice().sort(function(a,b){return ORDER.indexOf(a)-ORDER.indexOf(b)});if(!o.length){toast('No weapon yet. Buy one at the Police Station 🚓');return null}
  var i=player.weapon?o.indexOf(player.weapon):-1,n=i+1<o.length?o[i+1]:null;if(n)toast(WP[n].e+' '+WP[n].n);else toast('Weapon put away');return n};
/* ---------- 3D models (swapped onto the hand whenever the weapon changes) ---------- */
function M(c,r,m){return new THREE.MeshStandardMaterial({color:new THREE.Color(c),roughness:r===undefined?.6:r,metalness:m||0})}
function bx(g,w,h,d,x,y,z,c,rx,m){var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||M(c,.55,.5));o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o}
function cy(g,r,l,x,y,z,c){var o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,10),M(c,.35,.8));o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);return o}
var WOOD=M('#8a4b1f',.8,0),WOOD2=M('#6e3414',.8,0);
var GUNS={ak47:{f:'ak47',s:.205,ry:Math.PI,z:.2,y:.07},mp5:{f:'mpx',s:2.1,ry:Math.PI,z:.16,y:.06},shotgun:{f:'shotgun',s:.18,ry:-Math.PI/2,z:.2,y:.02},pistol:{f:'pistol',s:.085,ry:0,z:.12,y:.0}};
function realGun(k,g){var d=GUNS[k];if(!d||!window.GLB)return false;var G=GLB.get(d.f);if(!G){GLB.load(d.f,function(){curW='__none'});return false}
  var I=GLB.instance(G,{lit:true}),w=new THREE.Group(),h=new THREE.Group();w.add(I.root);w.scale.setScalar(d.s);h.add(w);h.rotation.y=d.ry;g.add(h);
  g.updateMatrixWorld(true);var bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3());h.position.set(-c.x,d.y-c.y,d.z-c.z);return true}
function model(k){var g=new THREE.Group();g.userData.custom=1;
  if(realGun(k,g)){}
  else if(k==='ak47'){bx(g,.045,.075,.38,0,.02,.12,'#2b2b2e');bx(g,.04,.02,.3,0,.065,.14,'#3a3a3e');cy(g,.012,.42,0,.03,.52,'#1b1b1d');cy(g,.011,.28,0,.058,.46,'#222');bx(g,.012,.045,.012,0,.06,.72,'#111');
    bx(g,.052,.06,.2,0,.015,.4,0,0,WOOD);bx(g,.036,.1,.05,0,-.065,.0,0,-.3,WOOD2);bx(g,.04,.09,.24,0,.005,-.2,0,.08,WOOD);bx(g,.036,.14,.06,0,-.09,.16,'#2a2a2d',.28);bx(g,.036,.1,.06,0,-.19,.2,'#2a2a2d',.6)}
  else if(k==='mp5'){bx(g,.05,.08,.3,0,.02,.1,'#1d1f22');cy(g,.022,.2,0,.03,.36,'#111');bx(g,.045,.055,.1,0,-.045,.22,'#1d1f22');bx(g,.03,.17,.04,0,-.12,.1,'#25272b',.1);bx(g,.034,.1,.05,0,-.07,.0,'#1d1f22',-.25);
    bx(g,.012,.012,.2,.014,.02,-.18,'#222');bx(g,.012,.012,.2,-.014,.02,-.18,'#222');bx(g,.04,.06,.02,0,.01,-.28,'#222');bx(g,.012,.04,.012,0,.07,.2,'#111');bx(g,.012,.03,.012,0,.07,-.02,'#111')}
  else if(k==='shotgun'){cy(g,.018,.62,0,.03,.38,'#202225');cy(g,.015,.46,0,-.01,.34,'#2a2c30');bx(g,.05,.05,.17,0,-.012,.36,0,0,WOOD2);bx(g,.05,.08,.22,0,.015,.04,'#222');bx(g,.034,.095,.045,0,-.065,-.02,0,-.25,WOOD2);bx(g,.045,.1,.3,0,.0,-.22,0,.05,WOOD2);bx(g,.012,.03,.012,0,.065,.68,'#ddd')}
  g.traverse(function(o){o.castShadow=false});return g}
var curW='__none';
setInterval(function(){var H=player.H;if(!H||!H.gun)return;var w=player.weapon||null;if(w===curW&&H.gun.userData.wk===H.gun.uuid+curW)return;curW=w;H.gun.userData.wk=H.gun.uuid+w;
  for(var i=H.gun.children.length-1;i>=0;i--){var c=H.gun.children[i];if(c.userData&&c.userData.custom)H.gun.remove(c)}
  var real=false;
  H.gun.children.forEach(function(c){if(!(c.userData&&c.userData.custom))c.visible=false});
  if(real){var pm=HM.make('pistol',1.25,-Math.PI/2);pm.userData.custom=1;pm.position.set(0,-.01,.07);if(H.gun.userData.real){pm.rotation.order='YXZ';pm.rotation.x=-Math.PI/2}H.gun.add(pm)}
  else if(w||true){var gm=model(w||'pistol');if(H.gun.userData.real)gm.rotation.x=-Math.PI/2;H.gun.add(gm)}},150);
/* ---------- shooting (replaces the one-size-fits-all pistol shot) ---------- */
shoot=function(){var wk=player.weapon||'pistol',W=WP[wk]||WP.pistol,H=player.H;H.a.flashT=.06;sfx.shot();cam.shake=Math.min(1,cam.shake+(wk==='shotgun'?.3:wk==='pistol'?.12:.07));
  var o=new THREE.Vector3(player.x,player.y+1.35,player.z),d0=new THREE.Vector3();camera.getWorldDirection(d0);
  var cand=[];peds.forEach(function(p){if(p.state!=='down')cand.push({e:p,x:p.x,y:p.y+1.2,z:p.z,r:.5,ped:true})});
  vehicles.forEach(function(V){cand.push({e:V,x:V.x,y:V.y+.8,z:V.z,r:V.W*.6,car:true})});
  var hurtPeds={},anyHit=false;
  for(var n=0;n<W.pellets;n++){var d=d0.clone();if(W.spread){d.x+=(Math.random()-.5)*W.spread*2;d.y+=(Math.random()-.5)*W.spread;d.z+=(Math.random()-.5)*W.spread*2;d.normalize()}
    var best=null;
    for(var i=0;i<cand.length;i++){var c=cand[i],vx=c.x-o.x,vy=c.y-o.y,vz=c.z-o.z,t=vx*d.x+vy*d.y+vz*d.z;if(t<1||t>W.range)continue;var px=vx-d.x*t,py=vy-d.y*t,pz=vz-d.z*t,pd=Math.hypot(px,py,pz),sc=pd/(c.r+.25+t*.02);if(sc<1&&(best===null||t<best.t))best={c:c,t:t}}
    var end=o.clone().addScaledVector(d,W.range),hit=null;if(best){end=o.clone().addScaledVector(d,best.t);hit=best.c}
    for(var t2=1.5;t2<(best?best.t:W.range);t2+=1.5){var x=o.x+d.x*t2,z=o.z+d.z*t2,y=o.y+d.y*t2;if(colInside(x,y,z,0)){end.set(x,y,z);hit=null;sparks(x,y,z,3);break}}
    addTracer(o.clone().addScaledVector(d,1.2),end);
    if(hit){anyHit=true;if(hit.ped){var p=hit.e;pedHit(p,player.x,player.z,p.kind==='cop'?Math.min(35,W.dmg):W.dmg);if(!hurtPeds[p.key]){hurtPeds[p.key]=1;addHeat(p.kind==='cop'?1.5:W.heat*2);if(p.kind==='cop')wantedBoost(2);missionEvent('shoot',p)}sparks(end.x,end.y,end.z,3)}
      else if(hit.car){var V=hit.e;V.hp-=W.dmg*.3;sparks(end.x,end.y,end.z,4);if(V.mode==='parked')V.alarm=1;if(V.mode==='ai'||V.mode==='cop'){addHeat(.5);if(V.mode==='ai')toFree(V)}}}}
  if(!anyHit){peds.forEach(function(p){if(p.state!=='down'&&p.kind==='civ'&&!p.gang&&Math.hypot(p.x-player.x,p.z-player.z)<22&&Math.random()<.5){p.state='flee';p.fleeFrom=[player.x,player.z];p.t=0;p.speed=4.6}})}
  if(Math.random()<W.heat)addHeat(.2);player.fireT=W.rate};
/* ---------- police station: buy guns ---------- */
ACT.buyweapon=function(k){var W=WP[k];if(!W)return;var o=owned();if(o.indexOf(k)>=0){toast('You already own this');return}if(!spend(W.price))return;o.push(k);S.hasGun=true;player.weapon=k;toast(W.e+' '+W.n+' bought — press Q / the weapon button to switch');try{saveGame()}catch(e){}refresh()};
var op=P.police;P.police=function(a){var r=op(a);var o=owned();
  var html=ORDER.filter(function(k){return k!=='pistol'}).map(function(k){var W=WP[k];return'<div class="item"><span class="ie">'+W.e+'</span><b>'+W.n+'<small>'+(k==='mp5'?'Fast fire, light damage':k==='shotgun'?'Close range, 6 pellets':'Strong and accurate')+'</small></b><button class="buy" data-a="buyweapon" data-v="'+k+'" '+(o.indexOf(k)>=0?'disabled':'')+'>'+(o.indexOf(k)>=0?'Owned':'$'+W.price.toLocaleString())+'</button></div>'}).join('');
  r.h+=html;return r};
/* ---------- police / army / tactical outfits ---------- */
if(typeof OUTFITS!=='undefined'&&!OUTFITS.__w){OUTFITS.__w=1;OUTFITS.push({n:'Police Uniform',p:350,ts:3,tc:'#1a2a5a',bs:3,bc:'#1a2a5a'},{n:'Army Fatigues',p:500,ts:2,tc:'#4b5d3a',bs:3,bc:'#3f4d31'},{n:'Tactical Black',p:700,ts:2,tc:'#161618',bs:3,bc:'#161618'})}
/* ---------- mission: gang hideout (kill the armed gang; they shoot back) ---------- */
var gang=[];
function gangClear(){gang.forEach(function(p){if(peds.indexOf(p)>=0)removePed(p)});gang=[]}
ACT.gang=function(){closeSheet();if(MISSION.cur){toast('Finish your current job first');return}
  if(!owned().length){toast('You need a weapon first — buy one at the Police Station 🚓');return}
  var cands=CITY.pois.filter(function(p){return !['air','home'].includes(p.id)&&Math.hypot(p.pos.x-player.x,p.pos.z-player.z)>180});var poi=cands.length?cands[Math.floor(Math.random()*cands.length)]:CITY.pois[0];
  var f={n:[0,1],s:[0,-1],e:[-1,0],w:[1,0]}[poi.face]||[0,1],ax=poi.pos.x+f[0]*22,az=poi.pos.z+f[1]*22,spawned=false,N=6,killed=0;
  var m={kind:'gang',title:'☠️ Gang hideout',sub:'Drive to the marker · '+N+' armed gang members',t:0,noTimeout:true,marker:{x:ax,z:az},
    update:function(dt){m.t=0;var d=Math.hypot(player.x-ax,player.z-az);
      if(!spawned&&d<110){spawned=true;for(var i=0;i<N;i++){var a=i/N*6.283,r=4+Math.random()*6,look=Object.assign(randLook(false),{female:false,ts:1,tc:'#8a1010',bs:3,bc:'#111',shades:true});var p=makePed('civ',ax+Math.cos(a)*r,az+Math.sin(a)*r,{female:false,look:look,name:'Gang'});p.gang=1;p.state='idle';p.hp=70;p.tough=false;p.gt=1+Math.random()*1.5;gang.push(p)}toast('☠️ Gang spotted! They are armed.')}
      if(spawned){var alive=gang.filter(function(p){return p.state!=='down'&&peds.indexOf(p)>=0}).length;m.sub='Gang members left: '+alive;
        if(alive===0){endMission(true,'Hideout cleared!',4000,120);return}}},
    cleanup:function(){gangClear()}};
  MISSION.cur=m;banner('☠️ GANG HIDEOUT','Follow the star · bring a weapon',2600,'#ff5468')};
setInterval(function(){if(!gang.length||window.__mode!=='play')return;var dt=.1;
  gang.forEach(function(p){if(peds.indexOf(p)<0||p.state==='down')return;if(p.state==='flee'||p.state==='walk'||p.state==='fight')p.state='idle';
    var dx=player.x-p.x,dz=player.z-p.z,d=Math.hypot(dx,dz);if(d<34){p.h=Math.atan2(dx,dz);p.gt-=dt;if(p.gt<=0){p.gt=1.1+Math.random()*1.2;
      if(Math.random()<.65){hurtPlayer(4+Math.random()*5,'gang');addTracer(new THREE.Vector3(p.x,p.y+1.3,p.z),new THREE.Vector3(player.x,player.y+1.2,player.z));try{sfx.shot()}catch(e){}}}}})},100);
var oj=P.jobs;P.jobs=function(a){var r=oj(a);r.h+='<div class="cap" style="margin-top:10px"><b>Missions with weapons</b></div><div class="item"><span class="ie">☠️</span><b>Gang hideout<small>Clear 6 armed gang members · they shoot back · need a weapon</small></b><button data-a="gang">GO · $4,000</button></div>';return r};
window.__weapons={WP:WP,owned:owned};
})();
