/* ===== Heirloom life: hired staff, grocery + delivery, daily gift, number plates, photo mode, party mode ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof ACT==='undefined'||typeof P==='undefined'||typeof S==='undefined')return;
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function addApps(html){var op=P.phone;P.phone=function(a){var r=op(a);var i=r.h.lastIndexOf('</div>');r.h=r.h.slice(0,i)+html+r.h.slice(i);return r}}
if(!S.staff)S.staff={};
if(S.lastGift===undefined){S.lastGift='';S.streak=0}
/* ---------------- staff ---------------- */
var STAFF={
  guard:{e:'💂',n:'Security guard',wage:60,d:'Guards the gate. Cools your wanted level every morning and heals you at home.'},
  driver:{e:'🧑‍✈️',n:'Driver',wage:80,d:'Brings your first car right to you, any time.'},
  cook:{e:'👩‍🍳',n:'Cook',wage:50,d:'Cooks every morning: your food is topped up (+70).'},
  nanny:{e:'🧑‍🍼',n:'Nanny',wage:55,d:'Looks after the kids: +20 energy and +20 fun every morning.'}};
function fmtm(n){return typeof fmt==='function'?fmt(n):'$'+n}
function wageTotal(){return Object.keys(S.staff).filter(function(k){return S.staff[k]}).reduce(function(a,k){return a+STAFF[k].wage},0)}
P.staff=function(){var rows=Object.keys(STAFF).map(function(k){var K=STAFF[k],on=!!S.staff[k];
  return'<div class="item"><span class="ie">'+K.e+'</span><b>'+K.n+'<small>'+K.d+' · '+fmtm(K.wage)+'/day</small></b><button class="buy" data-a="staffset" data-v="'+k+'">'+(on?'Fire':'Hire')+'</button></div>'}).join('');
  return{h:hd('👥 Household staff','Paid every morning · '+fmtm(wageTotal())+'/day')+rows+'<div class="cap">If you can\'t pay a wage in the morning, that person quits.</div>'}};
ACT.staffset=function(k){if(!STAFF[k])return;if(S.staff[k]){S.staff[k]=0;toast(STAFF[k].e+' '+STAFF[k].n+' has left')}else{if(!spend(STAFF[k].wage))return;S.staff[k]=1;toast(STAFF[k].e+' '+STAFF[k].n+' hired! First day paid.')}saveGame();refresh()};
ACT.driverbring=function(){if(!S.staff.driver){toast('Hire a driver first');return}
  if(player.st!=='foot'){toast('Get out of the car first');return}
  var V=vehicles.find(function(v){return v.ownIdx===0});if(!V){toast('You do not own a car yet');return}if(V.driver){toast('Your car is in use');return}
  closeSheet();toast('🧑‍✈️ Driver is on the way…');
  setTimeout(function(){var d=7;V.x=player.x+Math.sin(player.h)*d;V.z=player.z+Math.cos(player.h)*d;V.h=player.h+Math.PI/2;V.speed=0;V.vx=V.vz=0;
    try{V.car.grp.position.set(V.x,V.y,V.z);V.car.grp.rotation.set(0,V.h,0)}catch(e){}toast('🧑‍✈️ Your car is here, boss')},1800)};
var lastDay=S.day;
function newDay(){var paid=[],quit=[];
  Object.keys(S.staff).forEach(function(k){if(!S.staff[k])return;var K=STAFF[k];if(player.money>=K.wage){player.money-=K.wage;S.stats.spent+=K.wage;paid.push(K.e)}else{S.staff[k]=0;quit.push(K.n)}});
  if(S.staff.cook){stat('fd',70)}
  if(S.staff.nanny&&S.kids&&S.kids.length){stat('en',20);stat('fn',20)}
  if(S.staff.guard){if(typeof setWanted==='function'&&wanted>0)setWanted(Math.max(0,wanted-1));player.hp=Math.min(100,player.hp+25)}
  if(paid.length)toast('💸 Staff paid: '+paid.join(' ')+' · '+fmtm(wageTotal())+' today');
  if(quit.length)toast('😤 '+quit.join(', ')+' quit — you could not pay');
  gift();saveGame()}
/* ---------------- daily login gift (a streak) ---------------- */
function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function yesterday(){var d=new Date(Date.now()-864e5);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function gift(){}
var giftShown=false;
function checkGift(){if(giftShown||window.__mode!=='play')return;giftShown=true;var t=today();if(S.lastGift===t)return;
  S.streak=S.lastGift===yesterday()?Math.min(7,(S.streak||0)+1):1;var amt=[0,100,150,200,300,400,600,1000][S.streak],lt=t;
  var box=el('div','position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55)');
  var days='';for(var i=1;i<=7;i++)days+='<div style="flex:1;padding:6px 0;border-radius:8px;background:'+(i<=S.streak?'#ffb020':'#fff2')+';color:'+(i<=S.streak?'#000':'#fff')+';font:800 11px system-ui">'+(i===7?'🎁':i)+'</div>';
  box.innerHTML='<div style="width:min(340px,90vw);padding:18px;border-radius:18px;background:#10141f;border:1px solid #ffb02088;color:#fff;font:600 14px system-ui;text-align:center"><div style="font-size:42px">🎁</div><div style="font:800 20px system-ui">Daily gift · day '+S.streak+'</div><div style="margin:8px 0 12px;opacity:.8">Come back every day. Day 7 is the biggest!</div><div style="display:flex;gap:4px;margin-bottom:14px">'+days+'</div><button id="gcl" style="width:100%;padding:12px;border:0;border-radius:12px;background:#ffb020;color:#000;font:800 16px system-ui">Claim '+fmtm(amt)+'</button></div>';
  document.body.appendChild(box);box.querySelector('#gcl').onclick=function(){S.lastGift=lt;addMoney(amt);box.remove();saveGame()}}
/* ---------------- grocery ---------------- */
var GROC=[['🍞','Bread + tea',6,25],['🍚','Rice + stew pack',14,55],['🍗','Chicken box',22,70],['🥤','Drinks crate',9,20,'fn'],['🛒','Full month shop',60,100]];
P.grocery=function(){return{h:hd('🛒 Grocery','Cheaper than restaurants. Delivered to you.')+GROC.map(function(g,i){return'<div class="item"><span class="ie">'+g[0]+'</span><b>'+g[1]+'<small>+'+g[3]+' '+(g[4]==='fn'?'fun':'food')+'</small></b><button class="buy" data-a="grocbuy" data-v="'+i+'">'+fmtm(g[2])+'</button></div>'}).join('')+'<div class="cap">Want to earn instead? Open Jobs and tap <b>Grocery delivery</b>.</div>'}};
ACT.grocbuy=function(i){var g=GROC[+i];if(!g||!spend(g[2]))return;stat(g[4]||'fd',g[3]);toast(g[0]+' '+g[1]+' delivered');refresh()};
ACT.grocjob=function(){if(MISSION.cur){toast('Finish your current job first');return}closeSheet();
  var cand=CITY.pois.filter(function(p){return!/^bell|^myhome$|^home$/.test(p.id)&&Math.hypot(p.pos.x-player.x,p.pos.z-player.z)>150});var d=cand[Math.floor(Math.random()*cand.length)]||CITY.pois[0];
  var dist=Math.hypot(d.pos.x-player.x,d.pos.z-player.z),m={kind:'courier',title:'🛒 Grocery delivery',sub:'Deliver to '+d.n,marker:d.pos,t:0,limit:Math.round(45+dist/8),reward:Math.round(90+dist*.22)};
  m.update=function(){if(Math.hypot(d.pos.x-player.x,d.pos.z-player.z)<12)endMission(true,'Groceries delivered to '+d.n,m.reward,35)};
  MISSION.cur=m;if(typeof setGPS==='function')setGPS(d.pos.x,d.pos.z,d.n);banner('🛒 GROCERY DELIVERY','Take the bags to '+d.n,2400,'#35e0b0')};
/* ---------------- number plates ---------------- */
function plateTex(txt){var c=document.createElement('canvas');c.width=256;c.height=64;var g=c.getContext('2d');g.fillStyle='#f4f1e6';g.fillRect(0,0,256,64);g.strokeStyle='#1a5c35';g.lineWidth=5;g.strokeRect(3,3,250,58);g.fillStyle='#1a5c35';g.fillRect(3,3,250,13);
  g.fillStyle='#fff';g.font='800 11px system-ui';g.textAlign='center';g.fillText('FEDERAL REPUBLIC OF NIGERIA · LAGOS',128,13);g.fillStyle='#111';g.font='800 36px system-ui';g.fillText(txt,128,52);var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function ownPlate(){if(!S.plate)S.plate='HRL-'+(100+Math.floor(Math.random()*900))+'AB';return S.plate}
function fitPlates(){if(typeof vehicles==='undefined')return;vehicles.forEach(function(V){if(V.ownIdx===undefined||V.ownIdx===null||!V.car||!V.car.grp)return;var g=V.car.grp,txt=ownPlate();
  if(g.userData.plate){if(g.userData.plateTxt!==txt){g.userData.plate.material.map=plateTex(txt);g.userData.plate.material.needsUpdate=true;g.userData.plateTxt=txt}return}
  var ry=g.rotation.y;g.rotation.y=0;g.updateMatrixWorld(true);var bb=new THREE.Box3().setFromObject(g);var px=g.position.x,py=g.position.y,pz=g.position.z;g.rotation.y=ry;g.updateMatrixWorld(true);
  var m=new THREE.Mesh(new THREE.PlaneGeometry(1.0,.25),new THREE.MeshBasicMaterial({map:plateTex(txt),side:THREE.DoubleSide}));
  m.position.set((bb.min.x+bb.max.x)/2-px,bb.min.y-py+(bb.max.y-bb.min.y)*.27,bb.min.z-pz-.02);m.rotation.y=Math.PI;g.add(m);g.userData.plate=m;g.userData.plateTxt=txt})}
setInterval(function(){if(window.__mode==='play')try{fitPlates()}catch(e){}},2500);
ACT.plateset=function(){var v=prompt('Your number plate (up to 8 letters/numbers). Costs $500.',ownPlate());if(!v)return;v=String(v).toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,8);if(v.length<2){toast('Too short');return}if(!spend(500))return;S.plate=v;saveGame();toast('🔖 New plate: '+v);refresh()};
P.plates=function(){return{h:hd('🔖 Number plate','Shown on the back of your own cars')+'<div style="text-align:center;margin:12px 0"><span style="display:inline-block;padding:6px 18px;border:3px solid #1a5c35;border-radius:6px;background:#f4f1e6;color:#111;font:800 28px system-ui;letter-spacing:.06em">'+ownPlate()+'</span></div><div class="row"><button class="btn" data-a="plateset">Change plate '+fmtm(500)+'</button></div>'}};
/* ---------------- photo mode ---------------- */
var photoBar=null,styleTag=null,filt=0,FILTERS=['none','contrast(1.15) saturate(1.3)','sepia(.5) contrast(1.1)','grayscale(1) contrast(1.2)','hue-rotate(-15deg) saturate(1.5) brightness(1.05)'];
function applyFilter(){var cv=document.querySelector('canvas');if(cv)cv.style.filter=FILTERS[filt]==='none'?'':FILTERS[filt]}
var hiddenFr=[];function hideMusic(on){if(on){hiddenFr=[];document.querySelectorAll('iframe').forEach(function(f){var p=f.parentElement;if(p&&p!==document.body&&p.style.display!=='none'){hiddenFr.push([p,p.style.visibility]);p.style.visibility='hidden'}})}else{hiddenFr.forEach(function(x){x[0].style.visibility=x[1]});hiddenFr=[]}}
ACT.photo=function(){closeSheet();hideMusic(true);styleTag=el('style',null,'#ctl,#hud,#toasts,#banner,#prompt,#mm,#minimap,#vig,#ambox,#wmusic,#amlbl{display:none!important}');document.head.appendChild(styleTag);
  photoBar=el('div','position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:70;display:flex;gap:8px');
  var st='padding:10px 16px;border-radius:14px;border:1px solid #fff6;background:rgba(0,0,0,.6);color:#fff;font:800 14px system-ui';
  var b1=el('button',st,'🎨 Filter'),b2=el('button',st,'✖ Done');b1.onclick=function(e){e.stopPropagation();filt=(filt+1)%FILTERS.length;applyFilter()};b2.onclick=function(e){e.stopPropagation();photoOff()};
  photoBar.appendChild(b1);photoBar.appendChild(b2);document.body.appendChild(photoBar);var h=el('div','position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:70;padding:6px 12px;border-radius:10px;background:rgba(0,0,0,.55);color:#fff;font:600 13px system-ui','📸 Take a screenshot with your phone buttons');photoBar.hint=h;document.body.appendChild(h);setTimeout(function(){h.remove()},4000)};
function photoOff(){hideMusic(false);if(photoBar){photoBar.remove();photoBar=null}if(styleTag){styleTag.remove();styleTag=null}filt=0;applyFilter()}
/* ---------------- party mode ---------------- */
var partyEnd=0,pl=[];
ACT.party=function(){if(partyEnd>Date.now()){toast('Party already going 🎉');return}if(!spend(150))return;closeSheet();partyEnd=Date.now()+45000;
  [0xff2d95,0x2dd4ff,0xffd23f].forEach(function(c){var l=new THREE.PointLight(c,2.6,26,1.4);scene.add(l);pl.push(l)});
  stat('fn',50);addXP&&addXP(20);banner('🎉 PARTY TIME','Lights, music, vibes · +50 fun',2600,'#ff7ab6');if(typeof sfx!=='undefined'&&sfx.win)sfx.win()};
setInterval(function(){if(!pl.length)return;var t=Date.now()/1000;
  if(Date.now()>partyEnd){pl.forEach(function(l){scene.remove(l)});pl=[];return}
  pl.forEach(function(l,i){l.position.set(player.x+Math.cos(t*2+i*2.1)*4,(player.y||0)+3,player.z+Math.sin(t*2+i*2.1)*4)})},50);
/* ---------------- wiring ---------------- */
var oh=P.home;P.home=function(a){var r=oh(a);var t='<div class="grid g2" style="margin-top:8px"><button class="tile" data-a="open" data-v="staff"><span class="em">👥</span><b>Staff</b><em>guard, driver, cook, nanny</em></button><button class="tile" data-a="party"><span class="em">🎉</span><b>Party</b><em>$150 · +50 fun</em></button><button class="tile" data-a="driverbring"><span class="em">🧑‍✈️</span><b>Driver, bring my car</b></button><button class="tile" data-a="open" data-v="plates"><span class="em">🔖</span><b>Number plate</b></button></div>';
  r.h=r.h.replace('<div class="cap">Sleep',t+'<div class="cap">Sleep');return r};
var oj=P.jobs;if(oj)P.jobs=function(a){var r=oj(a);r.h+='<div class="grid" style="grid-template-columns:repeat(2,1fr);margin-top:10px"><button class="tile" data-a="grocjob"><span class="em">🛒</span><b>Grocery delivery</b><em>take bags to a place</em></button><button class="tile" data-a="open" data-v="grocery"><span class="em">🥬</span><b>Buy groceries</b></button></div>';return r};
addApps('<button class="app" data-a="open" data-v="grocery"><span>🛒</span>Grocery</button><button class="app" data-a="open" data-v="staff"><span>👥</span>Staff</button><button class="app" data-a="photo"><span>📸</span>Photo</button><button class="app" data-a="open" data-v="plates"><span>🔖</span>Plate</button>');
setInterval(function(){if(window.__mode!=='play')return;if(S.day!==lastDay){lastDay=S.day;try{newDay()}catch(e){console.error(e)}}checkGift()},1000);
window.__life={STAFF:STAFF,newDay:newDay,fitPlates:fitPlates};
})();
