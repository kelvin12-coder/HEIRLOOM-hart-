/* Ring the bell at a neighbour's gate. The owner gets a pop-up. If they let you in, you walk into their house (a copy built from their layout) and you both see each other. */
(function(){
var waiting=null,lastRing=0,lastPrompt={},box=null;
function rt(){return window.__rt}
function toastS(t){try{toast(t)}catch(e){}}
function ring(plot){
  var R=rt();if(!R||!R.live){toastS('🔔 You need a live connection to ring bells. Try again in a moment.');return}
  if(window.__house&&__house.inside())return;
  var n=Date.now();if(n-lastRing<8000){toastS('Wait a few seconds before ringing again');return}lastRing=n;
  var o=window.__estate&&__estate.occ[plot];waiting={plot:plot,name:o?o.n:'Friend',t:n};
  R.bc('knock',{id:R.id,n:(S&&S.name)||'Player',plot:plot});
  toastS('🔔 Ringing '+waiting.name+"'s bell… wait for them to open")}
function close(){if(box){box.remove();box=null}}
function prompt(p){
  var n=Date.now();if(lastPrompt[p.id]&&n-lastPrompt[p.id]<20000)return;lastPrompt[p.id]=n;
  if(box)return;
  var name=String(p.n||'Someone').replace(/[^\w \-]/g,'').slice(0,14);
  box=document.createElement('div');box.style.cssText='position:fixed;left:50%;top:16%;transform:translateX(-50%);z-index:62;width:min(320px,90vw);background:#0d1626;color:#fff;border:2px solid #66b8ff;border-radius:16px;padding:14px;text-align:center;font-family:system-ui,sans-serif';
  box.innerHTML='<div style="font-size:30px">🔔</div><div style="font:800 17px system-ui;margin:2px 0 4px"><span id="vk_n"></span> is at your door</div><div style="font-size:13px;opacity:.85;margin-bottom:10px">Let them in? Go inside your house to host them.</div><div style="display:flex;gap:8px"><button id="vk_y" style="flex:1;padding:11px;border:0;border-radius:12px;background:#2fd6a0;color:#06121f;font:800 14px system-ui">Let in</button><button id="vk_n2" style="flex:1;padding:11px;border:1px solid #fff4;border-radius:12px;background:none;color:#fff;font:700 14px system-ui">Not now</button></div>';
  document.body.appendChild(box);box.querySelector('#vk_n').textContent=name;
  var done=function(ok){var R=rt();if(R&&R.live)R.bc('door',{id:R.id,to:p.id,plot:p.plot,ok:ok?1:0,items:ok?(S.house&&S.house.items||[]):[],tier:(S.house&&S.house.tier)||1,hn:(S&&S.name)||'Friend'});close();if(ok)toastS('✅ '+name+' can come in. Go inside to host!')};
  box.querySelector('#vk_y').onclick=function(){done(1)};box.querySelector('#vk_n2').onclick=function(){done(0)};
  setTimeout(function(){if(box){close()}},30000)}
function install(){var R=rt();if(!R||!R.handlers){return setTimeout(install,500)}
  R.handlers.knock=function(p){
    if(!window.__estate||typeof S==='undefined'||!S.plotSrv)return;       // only owners with a real plot
    if(p.plot!==__estate.plot())return;prompt(p)};
  R.handlers.door=function(p){
    if(!waiting||p.to!==R.id||p.plot!==waiting.plot)return;var w=waiting;waiting=null;
    if(!p.ok){toastS('🚪 '+w.name+' is not opening the door right now');return}
    if(Date.now()-w.t>45000)return;
    try{__house.enterAs({plot:p.plot,items:p.items,tier:p.tier,name:p.hn||w.name})}catch(e){toastS('Could not enter')}}}
install();
window.__visit={ring:ring};
})();
