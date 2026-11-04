/* "You need a car" welcome for players who do not own one yet. */
(function(){
function LS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function SS(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var shown=false;
function box(){
  var d=document.createElement('div');d.id='needcar';
  d.style.cssText='position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);font-family:system-ui,sans-serif';
  d.innerHTML='<div style="width:min(340px,88vw);background:#10151f;color:#fff;border:2px solid #5ab8ff;border-radius:18px;padding:18px;text-align:center"><div style="font-size:44px">🚘</div><div style="font:800 20px system-ui;margin:4px 0 6px">You need a car!</div><div style="font-size:14px;line-height:1.4;opacity:.9">Everybody in Lagos needs wheels. You have <b>$6,000</b> in your pocket, enough for a starter hatchback at the Car Dealer. Work, race and earn to buy bigger ones.</div><button id="nc_go" style="margin-top:14px;width:100%;padding:12px;border:0;border-radius:12px;background:#5ab8ff;color:#06121f;font:800 15px system-ui">📍 Show me the dealer</button><button id="nc_x" style="margin-top:8px;width:100%;padding:10px;border:1px solid #fff4;border-radius:12px;background:none;color:#fff;font:700 13px system-ui">Later</button></div>';
  document.body.appendChild(d);
  function close(){d.remove();SS('hl-nc','1')}
  document.getElementById('nc_x').onclick=close;
  document.getElementById('nc_go').onclick=function(){close();try{var p=poiById('deal');setGPS(p.pos.x,p.pos.z,'Car Dealer');toast('Follow the beam to the Car Dealer 🚘')}catch(e){}};
}
setInterval(function(){
  if(shown||window.__mode!=='play'||typeof S==='undefined'||!S.owned)return;
  if(S.owned.length||LS('hl-nc')==='1'){shown=true;return}
  shown=true;setTimeout(box,1500)},800);
})();

/* Sky Drive promo: a rare, expensive upgrade. Offered at most once a day to players who can almost afford it. */
(function(){
function LS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function SS(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var shownNow=false;
setInterval(function(){
  if(shownNow||window.__mode!=='play'||typeof S==='undefined'||!S.owned||!S.owned.length||typeof player==='undefined')return;
  if(S.owned.some(function(o){return o.fly})||document.getElementById('needcar')||document.getElementById('flypromo'))return;
  if(player.money<3000000)return;
  var day=new Date().toDateString();if(LS('hl-flyhint')===day)return;
  shownNow=true;SS('hl-flyhint',day);
  var d=document.createElement('div');d.id='flypromo';d.style.cssText='position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);font-family:system-ui,sans-serif';
  d.innerHTML='<div style="width:min(340px,88vw);background:#0d1626;color:#fff;border:2px solid #66b8ff;border-radius:18px;padding:18px;text-align:center"><div style="font-size:44px">🛫🚘</div><div style="font:800 20px system-ui;margin:4px 0 6px">Want your car to fly?</div><div style="font-size:14px;line-height:1.4;opacity:.92">Add <b>Sky Drive</b> to any car you own. Fly over traffic, over walls, into friends\' compounds and above roofs. Very few players have it.<br><b style="color:#7fd1ff">Price: $6,000,000</b></div><button id="fp_go" style="margin-top:14px;width:100%;padding:12px;border:0;border-radius:12px;background:#66b8ff;color:#06121f;font:800 15px system-ui">Open My Cars</button><button id="fp_x" style="margin-top:8px;width:100%;padding:10px;border:1px solid #fff4;border-radius:12px;background:none;color:#fff;font:700 13px system-ui">Not now</button></div>';
  document.body.appendChild(d);
  document.getElementById('fp_x').onclick=function(){d.remove()};
  document.getElementById('fp_go').onclick=function(){d.remove();try{show('garage',{})}catch(e){}};
},4000);
})();
