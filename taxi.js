/* ===== Heirloom taxi: call a taxi from your phone (even from inside your house). It drives to you; you walk out and get in ===== */
(function(){
'use strict';
if(typeof P==='undefined'||typeof ACT==='undefined'||typeof spawnVehicle==='undefined')return;
var T=null,btn=null,calling=false;
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function target(){var h=window.__house,o=h&&h.inside&&h.inside()&&h.out&&h.out();return o?{x:o.x,z:o.z,inHouse:true}:{x:player.x,z:player.z,inHouse:false}}
function roadPoint(x,z){ // nearest point on a road centre line
  var best=null;for(var i=0;i<=N;i++){var rx=rcx(i),rz=rcx(i);var dx=Math.abs(x-rx),dz=Math.abs(z-rz);
    if(!best||dx<best.d)best={d:dx,x:rx,z:z,axis:'x'};if(dz<best.d)best={d:dz,x:x,z:rz,axis:'z'}}return best}
function clear(){if(T){try{if(player.car===T.V){/* riding: leave it for the ride cutscene */}else removeVehicle(T.V)}catch(e){}T=null}if(btn){btn.remove();btn=null}calling=false}
ACT.calltaxi=function(){closeSheet();if(T||calling){toast('Your taxi is already on the way');return}if(typeof MISSION!=='undefined'&&MISSION.cur){toast('Finish your current job first');return}
  var tg=target(),rp=roadPoint(tg.x,tg.z);calling=true;toast('📞 Calling a taxi…');
  setTimeout(function(){if(!calling)return;var sx=rp.axis==='x'?rp.x:rp.x+(Math.random()<.5?-1:1)*110,sz=rp.axis==='x'?rp.z+(Math.random()<.5?-1:1)*110:rp.z;
    var V=spawnVehicle('taxi','#f2b705',sx,sz,0,'free');upgradeToFull(V);V.driver='player';V.owned=false;T={V:V,tg:tg,rp:rp,t:0,arrived:false};V.h=Math.atan2(rp.x-sx,rp.z-sz);calling=false;
    toast('🚕 Taxi dispatched — it is coming to you')},4500)};
setInterval(function(){if(!T||window.__mode!=='play')return;var V=T.V,dt=.1;T.t+=dt;
  if(vehicles.indexOf(V)<0){clear();return}
  if(player.car===V)return;
  var tx=T.rp.x,tz=T.rp.z,dx=tx-V.x,dz=tz-V.z,dist=Math.hypot(dx,dz);
  if(!T.arrived){
    var ang=Math.atan2(dx,dz),da=ang-V.h;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
    V.steer=-Math.max(-1,Math.min(1,da*1.5));V.thr=dist>35?.8:(dist>10?.4:0);V.brk=dist<=10?1:(dist<22?.5:0);V.hp=Math.max(V.hp,200);
    if(dist<7||T.t>70){T.arrived=true;V.thr=0;V.brk=1;if(T.t>70){V.x=tx;V.z=tz}
      try{sfx.horn&&sfx.horn()}catch(e){}toast('🚕 Your taxi is here!');
      btn=el('button','position:fixed;left:50%;bottom:calc(86px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:33;padding:11px 18px;border:0;border-radius:14px;background:#f2b705;color:#1b1200;font:800 15px system-ui','🚕 Get in the taxi');
      btn.onclick=function(){var go=function(){if(!T)return;var V2=T.V;btn.remove();btn=null;enterVehicle(V2,true);setTimeout(function(){try{show('taxi',{})}catch(e){}},400)};
        if(T.tg.inHouse&&window.__house&&window.__house.inside()){window.__house.exit();setTimeout(go,500)}else{var d=Math.hypot(player.x-V.x,player.z-V.z);if(d>25){toast('Walk to the taxi first');return}go()}};
      document.body.appendChild(btn)}}
  else{V.thr=0;V.brk=1;if(T.t>240){clear()}}
},100);
var op=P.phone;P.phone=function(a){var r=op(a);r.h=r.h.replace("<span>🚕</span>Taxi</button>","<span>🚕</span>Taxi</button><button class=\"app\" data-a=\"open\" data-v=\"calltaxi\"><span>📞</span>Call taxi</button>");return r};
P.calltaxi=function(){return{h:hd('📞 Call a taxi','A real taxi drives to you')+'<div class="cap">Works from anywhere — even inside your house. The taxi stops on the street. Walk to it, tap <b>Get in</b>, then choose where to go.</div><div class="row" style="margin-top:10px">'+B('calltaxi','','📞 Call taxi now','sm')+'</div>'}};
window.__taxi={state:function(){return T&&{arrived:T.arrived,t:T.t}}};
})();
