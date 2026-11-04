/* ===== Heirloom services: real online players answer calls — plumber, engineer, police ===== */
(function(){
'use strict';
if(typeof P==='undefined'||typeof ACT==='undefined'||typeof MISSION==='undefined')return;
var LS=function(k){try{return localStorage.getItem(k)}catch(e){return null}};
var KN={plumber:{e:'🔧',n:'Plumber',fee:150,pay:250},engineer:{e:'⚡',n:'Engineer',fee:200,pay:300},police:{e:'🚓',n:'Police officer',fee:0,pay:350}};
function api(act,x){return fetch('/api/service',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({id:LS('hl-id')||'',name:(S&&S.name)||'Player',act:act},x||{}))}).then(function(r){return r.json().then(function(j){j.http=r.status;return j})}).catch(function(){return{error:'No connection',http:0}})}
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var duty=LS('hl-duty')||'',card=null,lastKey='',mineSt='',counts={plumber:0,engineer:0,police:0},JOB=null,fixing=0,busy=false;
function home(){var h=poiById('home');return h?{x:h.pos.x,z:h.pos.z}:{x:player.x,z:player.z}}
function showCard(key,html,btns){if(key===lastKey&&card)return;lastKey=key;if(!card){card=el('div','position:fixed;left:50%;top:calc(52px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:35;width:min(420px,92vw);padding:10px 12px;border-radius:14px;border:1px solid #fff4;background:rgba(10,14,24,.92);color:#fff;font:600 14px system-ui,sans-serif;text-align:center');document.body.appendChild(card)}
  card.innerHTML='<div>'+html+'</div><div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap"></div>';var row=card.lastChild;
  (btns||[]).forEach(function(b){var x=el('button','padding:8px 14px;border:0;border-radius:11px;font:800 13px system-ui;color:#fff;background:'+(b[2]||'#2f80ed'),b[0]);x.onclick=function(){if(busy)return;b[1]()};row.appendChild(x)})}
function hideCard(){lastKey='';if(card){card.remove();card=null}}
/* ---------- customer ---------- */
ACT.svccall=function(k){var K=KN[k];if(!K)return;if(K.fee&&!spend(K.fee))return;closeSheet();
  var h=home();api('call',{kind:k,x:h.x,z:h.z,area:'Home'}).then(function(r){if(r.error){if(K.fee)addMoney(K.fee,true);toast(r.error);return}
    toast(r.workers?('📞 Calling… '+r.workers+' '+K.n.toLowerCase()+(r.workers>1?'s':'')+' on duty'):('📞 No '+K.n.toLowerCase()+' on duty right now. Your call stays open 15 minutes.'));poll()})};
function custCard(m){var K=KN[m.kind]||{};
  if(m.st==='open')showCard('o'+m.rid,K.e+' Waiting for a '+K.n.toLowerCase()+'…',[['Cancel call'+(K.fee?' (refund)':''),function(){busy=1;api('cancel',{rid:m.rid}).then(function(){busy=0;if(K.fee)addMoney(K.fee,true);hideCard();toast('Call cancelled')})},'#8a2030']]);
  else if(m.st==='acc')showCard('a'+m.rid,K.e+' <b>'+esc(m.wn)+'</b> is on the way to your home!');
  else if(m.st==='there'){if(mineSt!=='there'){try{sfx.coin&&sfx.coin();toast('🔔 Knock knock! '+m.wn+' is at your door')}catch(e){}}showCard('t'+m.rid,'🔔 <b>'+esc(m.wn)+'</b> is knocking at your door!',[['🚪 Open the door',function(){busy=1;api('opendoor',{rid:m.rid}).then(function(){busy=0;poll()})},'#0a7a55']])}
  else if(m.st==='door')showCard('d'+m.rid,K.e+' <b>'+esc(m.wn)+'</b> is working inside your house…');
  mineSt=m.st}
/* ---------- worker ---------- */
function jobCard(j){var K=KN[j.kind];
  if(j.st==='acc')showCard('wa'+j.rid,K.e+' Drive to <b>'+esc(j.cn)+'</b>\'s home · follow the yellow star on the map',[['✖ Cancel job',function(){cancelJob(j)},'#8a2030']]);
  else if(j.st==='there')showCard('wt'+j.rid,'🚪 You knocked. Waiting for <b>'+esc(j.cn)+'</b> to open the door…',[['✖ Cancel job',function(){cancelJob(j)},'#8a2030']]);
  else if(j.st==='door'&&!fixing)showCard('wd'+j.rid,'🚪 Door is open! Time to work.',[['🔧 Start '+(j.kind==='police'?'helping':'fixing'),function(){startFix(j)},'#0a7a55']])}
function cancelJob(j){busy=1;api('cancel',{rid:j.rid}).then(function(){busy=0;endMission(false,'You cancelled the job');JOB=null;fixing=0;hideCard()})}
function startFix(j){fixing=Date.now();showCard('wf'+j.rid,'⏳ Working…<div style="height:8px;background:#fff3;border-radius:6px;margin-top:8px"><i id="svbar" style="display:block;height:8px;width:0;background:#35e0b0;border-radius:6px"></i></div>');
  var iv=setInterval(function(){var p=Math.min(1,(Date.now()-fixing)/6500),b=document.getElementById('svbar');if(b)b.style.width=p*100+'%';if(p>=1){clearInterval(iv);api('finish',{rid:j.rid}).then(function(r){fixing=0;if(r.cash){var jj=JOB;JOB=null;hideCard();if(MISSION.cur&&MISSION.cur.kind==='service')endMission(true,'Job done for '+j.cn,r.cash,60);else addMoney(r.cash)}else{toast(r.error||'Could not finish');fixing=0;lastKey=''}})}},120)}
function startJobMission(j){if(MISSION.cur){toast('Finish your current job first');return false}
  JOB=j;var K=KN[j.kind],arrived=false;
  var m={kind:'service',title:K.e+' '+K.n+' call',sub:'Go to '+j.cn+'\'s home',t:0,noTimeout:true,marker:{x:j.x,z:j.z},
    update:function(dt){m.t=0;if(!arrived&&JOB&&Math.hypot(player.x-j.x,player.z-j.z)<22){arrived=true;api('arrive',{rid:j.rid,x:player.x,z:player.z}).then(function(r){if(r.error){arrived=false}else toast('👊 You knocked on the door')})}},
    cleanup:function(){}};
  MISSION.cur=m;banner(K.e+' JOB ACCEPTED','Drive to '+j.cn+'\'s home',2400,'#ffd23f');return true}
function offer(o){var K=KN[o.kind];showCard('of'+o.rid,K.e+' <b>'+esc(o.cn)+'</b> needs a '+K.n.toLowerCase()+' at '+esc(o.area||'home')+' · earn <b>$'+K.pay+'</b>',[['✅ Accept',function(){busy=1;api('accept',{rid:o.rid}).then(function(r){busy=0;if(r.error){toast(r.error);lastKey='';return}if(startJobMission(r.req)){poll()}else api('cancel',{rid:o.rid})})},'#0a7a55'],['Ignore',function(){hideCard();lastKey='x'+o.rid}]])}
/* ---------- polling ---------- */
var polling=false,lastP=0;
function poll(){if(polling||window.__mode!=='play')return;polling=true;
  api('poll').then(function(r){polling=false;lastP=Date.now();if(!r||r.http!==200)return;counts=r.counts||counts;
    var any=false;
    if(r.mine){any=true;custCard(r.mine)}else if(mineSt){if(mineSt==='door')toast('✅ All fixed! Thank you for using Heirloom services');mineSt='';if(!r.job&&!JOB)hideCard()}
    if(r.job){any=true;if(!JOB&&!MISSION.cur)startJobMission(r.job);if(JOB&&JOB.rid===r.job.rid){JOB=r.job;jobCard(r.job)}}
    else if(JOB&&!fixing){JOB=null;if(MISSION.cur&&MISSION.cur.kind==='service')endMission(false,'The customer cancelled');hideCard()}
    if(!r.mine&&!r.job&&r.duty&&r.open&&r.open[0]&&!MISSION.cur&&!fixing){any=true;if(lastKey!=='x'+r.open[0].rid)offer(r.open[0])}
    else if(!r.mine&&!r.job&&!(r.open&&r.open[0])&&card&&/^of/.test(lastKey))hideCard()
  }).catch(function(){polling=false})}
setInterval(function(){var need=duty||mineSt||JOB;if(need&&Date.now()-lastP>3500)poll()},1000);
setInterval(function(){if(!duty&&!mineSt&&!JOB&&window.__mode==='play'&&Date.now()-lastP>20000)poll()},5000);
/* ---------- duty toggle (Jobs panel) + call buttons (Home panel) ---------- */
ACT.svcduty=function(k){duty=(duty===k)?'':k;LS&&localStorage.setItem('hl-duty',duty);api('duty',{on:!!duty,kind:k});refresh();toast(duty?('🟢 You are on duty as '+KN[k].n.toLowerCase()+'. Calls from real players will appear here.'):'⚪ Off duty')};
var oj=P.jobs;P.jobs=function(a){var r=oj(a);var t='<div class="cap" style="margin-top:10px"><b>Work for real players</b> · go on duty and answer calls from players who are online</div><div class="grid" style="grid-template-columns:repeat(3,1fr)">'+Object.keys(KN).map(function(k){var K=KN[k];return'<button class="tile'+(duty===k?' on':'')+'" data-a="svcduty" data-v="'+k+'"><span class="em">'+K.e+'</span><b style="font-size:12px">'+K.n+'</b><em>'+(duty===k?'ON DUTY':'$'+K.pay+' per job')+'</em></button>'}).join('')+'</div>';
  r.h+=t;return r};
var oh=P.home;P.home=function(a){var r=oh(a);var t='<div class="cap" style="margin-top:10px"><b>Need help at home?</b> A real online player will come</div><div class="grid" style="grid-template-columns:repeat(3,1fr)">'+Object.keys(KN).map(function(k){var K=KN[k];return'<button class="tile" data-a="svccall" data-v="'+k+'"><span class="em">'+K.e+'</span><b style="font-size:12px">Call '+K.n.toLowerCase()+'</b><em>'+(K.fee?'$'+K.fee:'free')+' · '+(counts[k]||0)+' on duty</em></button>'}).join('')+'</div>';
  r.h=r.h.replace('<div class="cap">Sleep',t+'<div class="cap">Sleep');return r};
if(duty)api('duty',{on:1,kind:duty});
window.__svc={poll:poll};
})();
