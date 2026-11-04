/* ===== Heirloom extras: Circuit racing, friend duels with bets, Drift Park panels ===== */
(function(){
'use strict';
var LS=function(k){try{return localStorage.getItem(k)}catch(e){return null}};
var HID=function(){return LS('hl-id')||''};
var LAPS=2;
function api(act,extra){return fetch('/api/race',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({id:HID(),name:(S&&S.name)||'Player',act:act},extra||{}))})
  .then(function(r){return r.json().then(function(j){j.http=r.status;return j})}).catch(function(){return{error:'No connection',http:0}})}
var fm=function(n){return '$'+Math.round(n).toLocaleString()};
function el(tag,css,html){var e=document.createElement(tag);if(css)e.style.cssText=css;if(html!==undefined)e.innerHTML=html;return e}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function tm(sec){if(!isFinite(sec)||sec<0)sec=0;var m=Math.floor(sec/60),s=sec-m*60;return m+':'+(s<10?'0':'')+s.toFixed(1)}

/* ---------- the circuit: a loop around real city streets ---------- */
var NODES=[];(function(){var i,j;for(i=13;i<=17;i++)NODES.push([i,10]);for(j=11;j<=14;j++)NODES.push([17,j]);for(i=16;i>=12;i--)NODES.push([i,14]);for(j=13;j>=10;j--)NODES.push([12,j])})();
function lapPts(){var g=CITY.speedGrid||{sx:300,rz:0};var a=NODES.map(function(n){return{x:rcx(n[0]),z:rcx(n[1])}});a.push({x:g.sx,z:g.rz});return a}
var rings=null;
function mkRing(col){var g=new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(8,.7,8,32),new THREE.MeshBasicMaterial({color:col,fog:false,toneMapped:false})));
  var b=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,80,8,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.32,fog:false,toneMapped:false,depthWrite:false}));b.position.y=40-8;g.add(b);
  g.position.y=8.4;var w=new THREE.Group();w.add(g);scene.add(w);return w}
function showRings(a,b,prev){if(!rings){rings=[mkRing(0xffd23f),mkRing(0x35e0ff)]}
  [[a,prev],[b,a]].forEach(function(q,i){var r=rings[i],p=q[0],f=q[1];if(!p){r.visible=false;return}r.visible=true;r.position.set(p.x,groundH(p.x,p.z),p.z);r.rotation.y=f?Math.atan2(p.x-f.x,p.z-f.z):0;r.children[0].scale.setScalar(i?.8:1)})}
function hideRings(){if(rings)rings.forEach(function(r){r.visible=false})}

/* ---------- ghost car for the other player ---------- */
var ghost=null;
function ghostOn(name,color){ghostOff();var car=makeCarMesh('sports',color,true);scene.add(car.grp);var lb=labelSprite(name,'#fff');scene.add(lb);ghost={car:car,lb:lb,x:0,z:0,h:0,tx:0,tz:0,th:0,ts:0,tAt:0,has:false,spin:0}}
function ghostOff(){if(!ghost)return;scene.remove(ghost.car.grp);scene.remove(ghost.lb);ghost=null}
function ghostSet(o){if(!ghost||!o)return;if(!ghost.has){ghost.x=o.x;ghost.z=o.z;ghost.h=o.h;ghost.has=true}ghost.tx=o.x;ghost.tz=o.z;ghost.th=o.h;ghost.ts=o.s||0;ghost.tAt=performance.now()}
function ghostFrame(dt){if(!ghost||!ghost.has)return;
  var age=Math.min(.9,(performance.now()-ghost.tAt)/1000),f=[Math.sin(ghost.th),Math.cos(ghost.th)];
  var px=ghost.tx+f[0]*ghost.ts*age,pz=ghost.tz+f[1]*ghost.ts*age,k=Math.min(1,dt*5);
  ghost.x+=(px-ghost.x)*k;ghost.z+=(pz-ghost.z)*k;var dh=ghost.th-ghost.h;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;ghost.h+=dh*k;
  var g=ghost.car.grp,y=groundH(ghost.x,ghost.z);g.position.set(ghost.x,y,ghost.z);g.rotation.set(0,ghost.h,0);
  ghost.spin+=ghost.ts*dt/.36;ghost.car.wheels.forEach(function(w){w.wm.rotation.x=ghost.spin});
  ghost.lb.position.set(ghost.x,y+2.6,ghost.z)}

/* ---------- the race itself (solo time trial or duel) ---------- */
var R=null;
function serverNow(){return Date.now()+(R&&R.off||0)}
function giveCar(color,duel){
  var g=CITY.speedGrid||{x:274,z:0,h:Math.PI/2};
  var slot=duel&&duel.role==='g'?-3.4:duel?3.4:0,V;
  if(!duel&&player.car&&player.car.hp>0&&!player.car.spec.fly){V=player.car}
  else{if(player.car)exitVehicle(true);V=spawnVehicle('sports',color||'#d94b4b',g.x,g.z+slot,g.h,'free');V.rental=true;upgradeToFull(V);enterVehicle(V)}
  V.x=g.x;V.z=g.z+slot;V.h=g.h;V.vx=V.vz=0;V.speed=0;V.yr=0;V.hp=Math.max(V.hp,V.spec.hp);V.flying=false;V.alt=0;cam.yaw=g.h;cam.pitch=.22;return V}
function startCircuit(opts){opts=opts||{};
  if(MISSION.cur){toast('Finish your current job first');return false}
  var duel=opts.duel||null,pts=lapPts(),V=giveCar(duel?(duel.role==='g'?'#2f80ed':'#d94b4b'):'#d94b4b',duel);
  R={duel:duel,V:V,pts:pts,n:pts.length,laps:LAPS,idx:0,lap:1,lapT:0,laps_t:[],off:duel?(duel.now-Date.now()):0,t0:duel?duel.t0:0,fin:false,lastPos:0,oppK:-1,lastCd:99,started:false};
  V.frozen=true;if(duel)ghostOn(duel.role==='h'?duel.guest:duel.host,duel.role==='h'?'#2f80ed':'#d94b4b');
  var m={kind:'circuit',title:duel?'🏁 Duel · bet '+fm(duel.stake):'🏁 Heirloom Circuit',sub:'Get ready…',t:duel?-25:-4,noTimeout:true,marker:pts[0],
    update:function(dt){circuitStep(m,dt)},cleanup:function(){hideRings();ghostOff();if(R&&R.V)R.V.frozen=false;R=null;var b=document.getElementById('duelq');if(b)b.remove()}};
  MISSION.cur=m;R.m=m;banner('🏁 GET READY','Line up on the start grid',2200,'#ffd23f');
  if(duel){var q=el('button','position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:30;padding:8px 14px;border-radius:12px;border:1px solid #fff4;background:#000a;color:#fff;font:700 13px system-ui',' ✖ Leave race (you forfeit your bet)');q.id='duelq';q.onclick=function(){if(confirm('Leave the race? You lose your bet if your friend finishes.')){leaveDuel()}};document.body.appendChild(q)}
  return true}
function leaveDuel(){if(!R)return;var d=R.duel;if(d)api('cancel',{code:d.code});endMission(false,'You left the race');setTimeout(function(){settleLoop(d&&d.code)},4000)}
function circuitStep(m,dt){if(!R||!R.V)return;var V=R.V,d=R.duel;
  if(d)m.t=(serverNow()-R.t0)/1000;
  if(player.car!==V&&!R.fin){ // got out of the car: pause the clock hint
    m.sub='Get back in your car 🚗';}
  if(m.t<0){V.frozen=true;var c=Math.ceil(-m.t);if(c!==R.lastCd&&c<=3){R.lastCd=c;banner(String(c),'',900,'#ffd23f');sfx.coin&&sfx.coin()}
    m.sub=d?'Race starts in '+Math.ceil(-m.t)+'s':'Starts in '+c;showRings(R.pts[0],R.pts[1],null);return}
  if(!R.started){R.started=true;V.frozen=false;V.hb=0;banner('GO!','',900,'#35e0b0');sfx.win&&sfx.win()}
  if(R.fin)return;
  var cp=R.pts[R.idx%R.n],nx=R.pts[(R.idx+1)%R.n],pv=R.pts[(R.idx+R.n-1)%R.n];m.marker=cp;showRings(cp,nx,pv);
  if(Math.hypot(cp.x-V.x,cp.z-V.z)<18&&player.car===V){R.idx++;sfx.coin&&sfx.coin();
    if(R.idx%R.n===0){var lt=m.t-R.lapT;R.laps_t.push(lt);R.lapT=m.t;if(R.idx>=R.n*R.laps){finishRace(m.t);return}R.lap++;banner('LAP '+R.lap+'/'+R.laps,'Last lap '+tm(lt),1600,'#ffd23f')}}
  var pos='';
  if(d&&R.oppK>=0){pos=R.idx>R.oppK?' · 1st':R.idx<R.oppK?' · 2nd':(Math.hypot(cp.x-V.x,cp.z-V.z)<R.oppD?' · 1st':' · 2nd')}
  m.sub='Lap '+R.lap+'/'+R.laps+' · '+tm(m.t)+pos+' · Checkpoint '+((R.idx%R.n)+1)+'/'+R.n;
  if(d){R.lastPos+=dt;if(R.lastPos>.5){R.lastPos=0;api('pos',{code:d.code,x:V.x,z:V.z,h:V.h,s:V.speed,k:R.idx}).then(function(r){var dd=r&&r.d;if(!dd||!R)return;R.off=dd.now-Date.now();if(dd.opp){ghostSet(dd.opp);R.oppK=dd.opp.k;R.oppD=0}if(dd.status==='closed'&&!R.fin){endMission(false,'The race was cancelled');settleLoop(d.code)}})}}
}
function finishRace(t){var d=R.duel,V=R.V;R.fin=true;V.hb=1;hideRings();
  if(!d){var best=S.race&&S.race.best||0;S.race=S.race||{};var rec=!best||t<best;if(rec)S.race.best=t;S.stats.races=(S.stats.races||0)+1;
    var reward=Math.max(150,Math.round(900-t*4));banner('🏁 FINISH',tm(t)+(rec?' · NEW BEST!':''),2400,'#35e0b0');
    endMission(true,'Time '+tm(t)+(rec?' — new personal best!':'')+' · Best '+tm(S.race.best),reward,60);return}
  banner('🏁 FINISHED',tm(t)+' — waiting for your friend…',60000,'#35e0b0');
  R.m.sub='Finished in '+tm(t)+' — waiting for the result…';
  api('fin',{code:d.code,time:Math.round(t*100)/100}).then(function(r){if(r&&r.error)toast('⚠️ '+r.error);settleLoop(d.code,true)})}
/* ---------- results + money (play money only) ---------- */
var settling=false;
function settleLoop(code,inRace){if(settling&&!inRace)return;settling=true;var tries=0;
  (function go(){api('res',{code:code}).then(function(r){tries++;
    if(r&&r.done&&!r.claimed){settling=false;var res=r.res||{},p=r.payout||0;
      if(p>0){addMoney(p,true)}saveGame();
      var msg=res.void?'Race cancelled · bet refunded '+fm(p):res.tie?'Dead heat! Bet refunded '+fm(p):res.win?(res.walkover?'Your friend left! ':'')+'You WON '+fm(p)+' 🏆':'You lost '+fm(r.stake||0)+' this time';
      var mm=MISSION.cur;if(mm&&mm.kind==='circuit'){endMission(!!res.win||!!res.tie||!!res.void,msg,0,res.win?80:20)}else banner(res.win?'🏆 YOU WIN':res.void||res.tie?'REFUND':'YOU LOST',msg,4000,res.win?'#35e0b0':'#ff5468');
      if(res.win)toast('🏆 '+msg);else toast(msg);return}
    if(r&&r.done&&r.claimed){settling=false;return}
    if(tries<80&&r&&r.http!==404&&r.http!==403)setTimeout(go,3000);else settling=false})})()}
/* ---------- create / join (bets are escrowed up front) ---------- */
function createChallenge(stake,to){stake=Math.max(0,Math.min(100000,Math.floor(stake||0)));
  if(stake>player.money){toast('Not enough cash for that bet 💸');return}
  api('create',{stake:stake,to:to||''}).then(function(r){
    if(r&&r.error){toast('⚠️ '+r.error);if(r.code)waitOverlay(r.code,0);return}
    if(stake)player.money-=stake;saveGame();waitOverlay(r.code,stake)})}
function joinChallenge(code,stake){if(stake>player.money){toast('You need '+fm(stake)+' to join this bet 💸');return}
  api('join',{code:code}).then(function(r){if(r&&r.error){toast('⚠️ '+r.error);return}if(stake)player.money-=stake;saveGame();closeOv();startDuel(r.d)})}
function startDuel(d){closeSheet&&closeSheet();var go=function(){if(!startCircuit({duel:d}))return};
  if(MISSION.cur&&MISSION.cur.kind!=='circuit'){endMission(false,'Race starting')}go()}
/* ---------- overlays ---------- */
var ov=null,ovTimer=null;
function closeOv(){if(ovTimer){clearInterval(ovTimer);ovTimer=null}if(ov){ov.remove();ov=null}}
function mkOv(inner){closeOv();ov=el('div','position:fixed;inset:0;z-index:55;background:rgba(0,0,0,.74);display:flex;align-items:center;justify-content:center;font:500 14px system-ui,sans-serif;color:#fff;padding:10px');
  ov.innerHTML='<div style="background:#12151f;border:1px solid #fff3;border-radius:18px;padding:14px;width:min(430px,94vw);max-height:92%;overflow:auto">'+inner+'</div>';document.body.appendChild(ov);return ov.firstChild}
var BTN='border:0;border-radius:12px;padding:10px 14px;font:800 14px system-ui;background:#ffb020;color:#1b1200;cursor:pointer';
var BTN2='border:1px solid #fff4;border-radius:12px;padding:10px 14px;font:700 14px system-ui;background:#ffffff14;color:#fff;cursor:pointer';
function shareLink(code){return location.origin+'/?race='+code}
function shareText(stake){return '🏁 I challenge you to a race on Heirloom'+(stake?' for a '+fm(stake)+' bet':'')+'! Tap to join:'}
function doShare(code,stake){var url=shareLink(code),text=shareText(stake);
  if(navigator.share){navigator.share({title:'Heirloom race',text:text,url:url}).catch(function(){})}
  else{try{navigator.clipboard.writeText(text+' '+url);toast('Link copied — paste it in WhatsApp or Snapchat')}catch(e){window.prompt('Copy this link and send it to your friend:',url)}}}
function waitOverlay(code,stake){var box=mkOv('<div style="font:800 18px system-ui">🏁 Challenge ready</div><div style="opacity:.8;margin:6px 0 10px">Bet: <b>'+(stake?fm(stake):'just for fun')+'</b>. Send this to your friend. The first one to join starts the race for both of you.</div>'
  +'<div style="display:flex;gap:8px;flex-wrap:wrap"><button id="w_s" style="'+BTN+'">📤 Share link</button><button id="w_w" style="'+BTN2+'">WhatsApp</button><button id="w_c" style="'+BTN2+'">Cancel &amp; refund</button></div><div id="w_m" style="margin-top:10px;opacity:.8">Waiting for a friend to join…</div>');
  box.querySelector('#w_s').onclick=function(){doShare(code,stake)};
  box.querySelector('#w_w').onclick=function(){window.open('https://wa.me/?text='+encodeURIComponent(shareText(stake)+' '+shareLink(code)),'_blank','noopener')};
  box.querySelector('#w_c').onclick=function(){api('cancel',{code:code}).then(function(r){closeOv();settleLoop(code)})};
  ovTimer=setInterval(function(){api('state',{code:code}).then(function(r){if(!ov||!r||!r.d)return;var d=r.d;
    if(d.status==='ready'){closeOv();startDuel(d)}else if(d.status==='closed'){closeOv();settleLoop(code)}})},2000)}
function menuOverlay(){var stakes=[0,500,2000,10000,50000],pick=500;
  var box=mkOv('<div style="display:flex;justify-content:space-between;align-items:center"><b style="font:800 18px system-ui">🏁 Race a friend</b><button id="m_x" style="background:none;border:0;color:#fff;font-size:20px">✕</button></div>'
   +'<div style="opacity:.8;margin:6px 0">Pick a bet (play money, not real money), then send the link to your friend on WhatsApp, Snapchat or anywhere. Both of you race the same track in the same car. <b>Fastest wins the pot.</b></div>'
   +'<div id="m_st" style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0"></div><button id="m_go" style="'+BTN+';width:100%">Create challenge</button>'
   +'<div style="margin-top:14px;font:800 15px system-ui">Open challenges</div><div id="m_op" style="margin-top:6px;opacity:.9">Looking…</div>');
  function drawSt(){box.querySelector('#m_st').innerHTML=stakes.map(function(s){return'<button data-s="'+s+'" style="'+(s===pick?BTN:BTN2)+'">'+(s?fm(s):'No bet')+'</button>'}).join('')}
  drawSt();box.querySelector('#m_st').onclick=function(e){var s=e.target.getAttribute('data-s');if(s===null)return;pick=+s;drawSt()};
  box.querySelector('#m_x').onclick=closeOv;box.querySelector('#m_go').onclick=function(){closeOv();createChallenge(pick)};
  function loadList(){api('list').then(function(r){var o=box.querySelector('#m_op');if(!o||!ov)return;
    if(r&&r.cur&&!r.cur.paid&&(r.cur.status==='open')){closeOv();waitOverlay(r.cur.code,r.cur.stake);return}
    var l=(r&&r.open)||[];o.innerHTML=l.length?l.map(function(c){return'<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #fff2"><span>'+esc(c.host)+' · bet <b>'+(c.stake?fm(c.stake):'none')+'</b></span><button data-j="'+esc(c.code)+'" data-k="'+c.stake+'" style="'+BTN+'">Join</button></div>'}).join(''):'No open challenges right now. Create one and share the link!';
    o.onclick=function(e){var j=e.target.getAttribute&&e.target.getAttribute('data-j');if(j)joinChallenge(j,+e.target.getAttribute('data-k'))}})}
  loadList();ovTimer=setInterval(loadList,4000)}
function inviteFromLink(code){api('peek',{code:code}).then(function(r){if(!r||r.error||r.status!=='open'){if(r&&r.mine)return;toast('That race link has expired');return}
  if(r.mine){waitOverlay(code,r.stake);return}
  var box=mkOv('<div style="font:800 18px system-ui">🏁 '+esc(r.host)+' challenged you!</div><div style="margin:8px 0">Race the Heirloom Circuit, 2 laps, same car. Bet: <b>'+(r.stake?fm(r.stake):'none (for bragging rights)')+'</b></div><div style="display:flex;gap:8px"><button id="i_y" style="'+BTN+'">Accept &amp; race</button><button id="i_n" style="'+BTN2+'">No thanks</button></div>');
  box.querySelector('#i_n').onclick=closeOv;box.querySelector('#i_y').onclick=function(){joinChallenge(code,r.stake)}})}
/* open unfinished business after loading the game */
function resume(){api('list').then(function(r){if(!r||!r.cur||r.cur.paid)return;var c=r.cur;
  if(c.status==='open'&&!MISSION.cur){waitOverlay(c.code,c.stake)}else{settleLoop(c.code)}})}
(function boot(){var q=new URLSearchParams(location.search),code=(q.get('race')||'').replace(/[^a-z0-9]/g,'');
  var wait=setInterval(function(){if(window.__mode!=='play')return;clearInterval(wait);
    if(code){try{history.replaceState(null,'',location.pathname)}catch(e){}setTimeout(function(){inviteFromLink(code)},1500)}else setTimeout(resume,5000)},800)})();
/* per-frame hook for the ghost car */
(function hook(){var last=performance.now();function f(){var n=performance.now(),dt=Math.min(.1,(n-last)/1000);last=n;try{ghostFrame(dt)}catch(e){}requestAnimationFrame(f)}requestAnimationFrame(f)})();

/* ---------- panels at the two new places ---------- */
P.speed=function(){var best=S.race&&S.race.best;
  return{cls:'tall',h:hd('🏁 Heirloom Circuit','2 laps round the city streets · about 2 km a lap')
   +'<div class="fact" style="text-align:center">Your best: <b>'+(best?tm(best):'—')+'</b></div>'
   +'<div class="grid g2"><button class="tile" data-a="tt"><span class="em">⏱️</span><b>Time trial</b><em>free · earn cash for fast times</em></button>'
   +'<button class="tile" data-a="duelmenu"><span class="em">👫</span><b>Race a friend</b><em>bet play money · invite by link</em></button>'
   +'<button class="tile" data-a="potrace" data-v="500"><span class="em">🏆</span><b>Street pot race</b><em>$500 · beat 3 racers</em></button>'
   +'<button class="tile" data-a="potrace" data-v="5000"><span class="em">💰</span><b>High-stakes pot</b><em>$5,000 · beat 3 racers</em></button></div>'
   +'<div class="cap" style="margin-top:8px">Follow the gold ring. Friend races: both players get the same car and the same start, so skill decides it. The result and the bet are settled by the server.</div>'}};
P.drift=function(){return{cls:'tall',h:hd('🌀 Drift Park','Slide, smoke the tyres, bank the points')
   +'<div class="grid g2"><button class="tile" data-a="driftcar"><span class="em">🚗</span><b>Free drift car</b><em>Apex GT, yours for the session</em></button>'
   +'<button class="tile" data-a="driftcar2"><span class="em">🏎️</span><b>Muscle drift car</b><em>Mustang GT, easy to slide</em></button></div>'
   +'<div class="cap" style="margin-top:8px">Turn hard and tap <b>DRIFT</b> (or hold SPACE) to slide. A long drift builds a multiplier. When you straighten up, your points are banked as cash <b>while inside the park</b>. Every drift also gives XP anywhere in the city.</div>'}};
ACT.tt=function(){closeSheet();startCircuit({})};
ACT.duelmenu=function(){closeSheet();menuOverlay()};
ACT.potrace=function(v){closeSheet();startRace(+v||500)};
function driftCar(name,col){closeSheet();var b=CITY.driftBox;if(!b)return;var cx=(b[0]+b[2])/2,cz=(b[1]+b[3])/2+20;
  if(player.car)exitVehicle(true);vehicles.slice().forEach(function(v){if(v.rental&&v.name===name)removeVehicle(v)});
  var V=spawnVehicle(name,col,cx,cz,0,'free');V.rental=true;upgradeToFull(V);enterVehicle(V);toast('Hold the DRIFT button while turning 🌀')}
ACT.driftcar=function(){driftCar('sports','#ff3d81')};
ACT.driftcar2=function(){driftCar('mustang','#ffb020')};
window.__race={menu:menuOverlay,challenge:function(pid,name){menuOverlay()},create:createChallenge};
})();
