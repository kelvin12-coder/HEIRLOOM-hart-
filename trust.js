/* ===== Heirloom trust: cookie/storage notice, feedback box (to the owner), place-visit counts ===== */
(function(){
'use strict';
if(typeof ACT==='undefined'||typeof P==='undefined')return;
var LS=function(k){try{return localStorage.getItem(k)}catch(e){return null}};
var SS=function(k,v){try{localStorage.setItem(k,v)}catch(e){}};
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
var WA='2347012338350';
/* ---- storage notice (no ads, no trackers) ---- */
function consent(){if(LS('hl-consent'))return;var b=el('div','position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:80;max-width:520px;margin:0 auto;padding:12px 14px;border-radius:14px;background:rgba(10,14,24,.96);border:1px solid #ffb02066;color:#fff;font:600 13px/1.45 system-ui,sans-serif',
  '🍪 Heirloom saves your game in your browser (no ads, no tracking). <a href="privacy.html" style="color:#ffb020">Privacy</a> · <a href="terms.html" style="color:#ffb020">Terms</a><div style="margin-top:8px"><button id="ck_ok" style="padding:8px 18px;border:0;border-radius:10px;background:#ffb020;color:#000;font:800 14px system-ui">OK</button></div>');
  document.body.appendChild(b);b.querySelector('#ck_ok').onclick=function(){SS('hl-consent','1');b.remove()}}
setTimeout(consent,2500);
/* ---- feedback box ---- */
var CATS=[['dislike','😕','Something I dislike'],['bug','🐞','A bug'],['idea','💡','An idea'],['like','😍','Something I love']],cat='dislike',sent='';
P.feedback=function(){var cs=CATS.map(function(c){return'<button class="tile'+(cat===c[0]?' on':'')+'" data-a="fbcat" data-v="'+c[0]+'"><span class="em">'+c[1]+'</span><b style="font-size:12px">'+c[2]+'</b></button>'}).join('');
  return{h:hd('💬 Tell the maker','Your message goes straight to the owner')+'<div class="grid g2">'+cs+'</div><textarea id="fbtxt" maxlength="600" rows="5" placeholder="Type here… what do you not like? what should we add?" style="width:100%;box-sizing:border-box;margin-top:10px;padding:10px;border-radius:12px;border:1px solid #fff3;background:#0b0f18;color:#fff;font:15px system-ui"></textarea>'
    +'<div class="row" style="margin-top:8px"><button class="btn" data-a="fbsend">📨 Send</button><button class="btn sm" data-a="fbwa">🟢 Send on WhatsApp</button></div>'+(sent?'<div class="cap" style="margin-top:8px">'+sent+'</div>':'')+'<div class="cap">Please do not write passwords or private details.</div>'}};
var draft='';
ACT.fbcat=function(v){var t=document.getElementById('fbtxt');draft=t?t.value:draft;cat=v;refresh();setTimeout(function(){var q=document.getElementById('fbtxt');if(q)q.value=draft},0)};
function txt(){var t=document.getElementById('fbtxt');return t?t.value.trim():''}
ACT.fbsend=function(){var t=txt();if(t.length<3){toast('Write a little more first');return}
  var btn=document.querySelector('[data-a="fbsend"]');if(btn)btn.disabled=true;
  fetch('/api/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:LS('hl-id')||'',name:(S&&S.name)||'',cat:cat,text:t})}).then(function(r){return r.json().then(function(j){j.http=r.status;return j})}).catch(function(){return{http:0,error:'No connection'}}).then(function(j){
    if(j.ok){sent='✅ Thank you! The maker will read this.';draft='';toast('✅ Message sent');refresh()}else{if(btn)btn.disabled=false;toast(j.error||'Could not send. Try again.')}})};
ACT.fbwa=function(){var t=txt();if(t.length<3){toast('Write your message first');return}
  var m='Heirloom feedback ('+cat+') from '+((S&&S.name)||'a player')+': '+t;window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(m).slice(0,1500),'_blank','noopener')};
var op=P.phone;P.phone=function(a){var r=op(a);var i=r.h.lastIndexOf('</div>');r.h=r.h.slice(0,i)+'<button class="app" data-a="open" data-v="feedback"><span>💬</span>Feedback</button>'+r.h.slice(i);return r};
/* ---- count which places players visit (anonymous) ---- */
var oo=window.openPOI;window.openPOI=function(id){try{var pl=String(id).replace(/[^a-z0-9]/g,'').slice(0,12);if(pl.length>=2&&!/^bell/.test(pl)){fetch('/api/ping',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:LS('hl-id')||'',pl:pl}),keepalive:true}).catch(function(){})}}catch(e){}return oo.apply(this,arguments)};
})();
