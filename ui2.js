/* ===== cleaner, sharper controls + tap the minimap to open the big map ===== */
(function(){
'use strict';
var css=document.createElement('style');css.textContent=
'.bt{border-radius:18px!important;background:rgba(10,13,22,.82)!important;border:2px solid rgba(255,255,255,.9)!important;box-shadow:0 2px 0 rgba(0,0,0,.5);backdrop-filter:none!important;font:800 10px var(--disp,system-ui)!important}'+
'.bt svg{width:28px;height:28px;display:block;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}'+
'.bt.big{width:80px!important;height:80px!important;border-radius:24px!important;border-color:#ffb020!important;background:rgba(10,13,22,.88)!important}.bt.big svg{width:38px;height:38px;stroke:#ffb020}'+
'.bt.on{background:#ffb020!important}.bt.on svg{stroke:#10131b}'+
'.bt:active{transform:scale(.93);background:rgba(255,176,32,.85)!important}.bt:active svg{stroke:#10131b}'+
'#sheet .x{width:44px;height:44px;border-radius:12px;font-size:22px;font-weight:900;background:#ff4f5e;color:#fff;border:0;display:flex;align-items:center;justify-content:center;flex:none}'+
'#mmw{cursor:pointer;pointer-events:auto}';
document.head.appendChild(css);
var I={
 act:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6" fill="#ffb020" stroke="none"/></svg>',
 jump:'<svg viewBox="0 0 24 24"><path d="M6 14l6-6 6 6"/><path d="M6 20l6-6 6 6"/></svg>',
 fire:'<svg viewBox="0 0 24 24"><path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1.5V5a1.5 1.5 0 0 1 3 0v5m0-3a1.5 1.5 0 0 1 3 0v5.5m0-2.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5A6 6 0 0 1 7 16.5z"/></svg>',
 weapon:'<svg viewBox="0 0 24 24"><path d="M3 9h13l3 2v3h-6l-1 4H8l1-4H3z"/></svg>',
 aim:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>',
 hb:'<svg viewBox="0 0 24 24"><path d="M5 17c4 0 5-10 10-10h4M15 3l4 4-4 4"/></svg>',
 nos:'<svg viewBox="0 0 24 24"><path d="M13 2L5 13h6l-1 9 8-12h-6z"/></svg>',
 horn:'<svg viewBox="0 0 24 24"><path d="M4 10v4h4l6 4V6L8 10z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg>',
 radio:'<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l10-5"/><circle cx="9" cy="14" r="2"/></svg>',
 view:'<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 fly:'<svg viewBox="0 0 24 24"><path d="M2 14l20-8-8 16-3-6z"/></svg>',
 flyup:'<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
 flydn:'<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>'};
function paint(){Object.keys(I).forEach(function(k){var b=document.querySelector('.bt[data-k="'+k+'"]');if(b&&!b.querySelector('svg')){b.innerHTML=(k==='fire'&&b.dataset.a==='1')?I.weapon:I[k]}})}
paint();setInterval(paint,400);
function openMap(e){try{if(window.__mode!=='play')return;if(typeof show==='function')show('map',{})}catch(x){}}
var mm=document.getElementById('mmw');if(mm){mm.addEventListener('click',openMap);mm.addEventListener('touchend',function(e){e.preventDefault();openMap()},{passive:false})}
})();

/* owner shortcut: tap the money counter 7 times quickly to open the private owner dashboard (it still needs your ADMIN_KEY) */
(function(){var n=0,t=0,c=document.getElementById('cash');if(!c)return;c.style.pointerEvents='auto';
c.addEventListener('click',function(){var now=Date.now();if(now-t>2500)n=0;t=now;n++;if(n>=7){n=0;try{window.open('admin.html','_blank')}catch(e){location.href='admin.html'}}})})();
