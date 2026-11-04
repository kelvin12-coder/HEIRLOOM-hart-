/* Heirloom live world: other real players, over Supabase Realtime (plain WebSocket, no library).
   Sends only: name, position, heading, car model, outfit. Switch off in Settings via localStorage hl-rtoff=1. */
(function(){
var URL_='wss://eejxbsniliygczpwoelr.supabase.co/realtime/v1/websocket?apikey=sb_publishable_dHB5-IS5HSn0l-PVokWDcw_EOr4UgZy&vsn=1.0.0';
var TOPIC='realtime:heirloom-world-1',MAX=24,NEAR=260;
var ws=null,ref=0,joined=false,myId=Math.random().toString(36).slice(2,10),peers={},tries=0,lastSend=0,lastLook=0,hb=null,dead=false;
function LS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function off(){return LS('hl-rtoff')==='1'}
function send(o){if(ws&&ws.readyState===1)try{ws.send(JSON.stringify(o))}catch(e){}}
function msg(ev,payload){send({topic:TOPIC,event:ev,payload:payload,ref:String(++ref)})}
function bc(event,payload){if(joined)msg('broadcast',{type:'broadcast',event:event,payload:payload})}
function connect(){
  if(dead||off()||ws)return;
  try{ws=new WebSocket(URL_)}catch(e){ws=null;return retry()}
  ws.onopen=function(){tries=0;msg('phx_join',{config:{broadcast:{self:false,ack:false},presence:{key:myId},postgres_changes:[]},access_token:null});
    hb=setInterval(function(){send({topic:'phoenix',event:'heartbeat',payload:{},ref:String(++ref)})},25000)};
  ws.onmessage=function(e){var m;try{m=JSON.parse(e.data)}catch(x){return}
    if(m.topic!==TOPIC)return;
    if(m.event==='phx_reply'&&m.payload&&m.payload.status==='ok'&&!joined){joined=true;lastLook=0;api.live=true}
    else if(m.event==='broadcast'&&m.payload){var p=m.payload.payload;if(!p||!p.id||p.id===myId)return;
      if(m.payload.event==='pos')onPos(p);else if(m.payload.event==='bye')drop(p.id);else if(api.handlers[m.payload.event])try{api.handlers[m.payload.event](p)}catch(e){}}};
  ws.onclose=ws.onerror=function(){if(!ws)return;var w=ws;ws=null;joined=false;api.live=false;clearInterval(hb);try{w.close()}catch(e){}retry()};
}
function retry(){if(dead)return;tries++;setTimeout(connect,Math.min(30000,1500*tries*tries))}
function onPos(p){
  var q=peers[p.id];if(q&&q.hp!==p.hp){kill(q)}
  if(!q){if(Object.keys(peers).length>=MAX)return;q=peers[p.id]={id:p.id,x:p.x,z:p.z,y:p.y||0,h:p.h||0,tx:p.x,tz:p.z,th:p.h||0,ty:p.y||0,sp:0,t:0,H:null,car:null,lbl:null};
    if(typeof toast==='function'&&Object.keys(peers).length===1)toast('🌍 A real player is nearby: '+(p.n||'Player'))}
  q.hp=p.hp;q.tx=p.x;q.tz=p.z;q.th=p.h||0;q.ty=p.y||0;q.n=p.n||'Player';q.cn=p.c||null;q.col=p.col||'#c33';q.t=performance.now();if(p.lk)q.lk=p.lk}
function drop(id){var q=peers[id];if(!q)return;kill(q);delete peers[id]}
function kill(q){try{if(q.H){scene.remove(q.H.root)}if(q.car){scene.remove(q.car.grp)}if(q.lbl){scene.remove(q.lbl)}}catch(e){}q.H=q.car=q.lbl=null;q.cnShown=null}
function lerpA(a,b,k){var d=b-a;while(d>Math.PI)d-=6.2832;while(d<-6.2832/2)d+=6.2832;return a+d*k}
function render(dt){
  var now=performance.now(),px=player.x,pz=player.z,H=window.__house,host=H&&H.inside()?H.host():null,org=host!==null&&host!==undefined?H.origin():null,inH=H&&H.inside();
  for(var id in peers){var q=peers[id];
    if(now-q.t>7000){drop(id);continue}
    var k=Math.min(1,dt*9),ox=q.x,oz=q.z;q.x+=(q.tx-q.x)*k;q.z+=(q.tz-q.z)*k;q.y+=(q.ty-q.y)*k;q.h=lerpA(q.h,q.th,k);
    q.sp=Math.hypot(q.x-ox,q.z-oz)/Math.max(dt,.001);
    var X=q.x,Z=q.z,Y=q.y;
    if(inH){ // I am inside a house: only show people inside the SAME house
      if(!org||q.hp===undefined||q.hp!==host){if(q.H||q.car)kill(q);if(q.lbl)kill(q);continue}
      X=q.x+org.cx;Z=q.z+org.cz;Y=q.y+org.fy;q.cn=null}
    else{
      if(q.hp!==undefined){if(q.H||q.car||q.lbl)kill(q);continue}
      var d=Math.hypot(q.x-px,q.z-pz);if(d>NEAR||q.ty>60||player.y>60){if(q.H||q.car)kill(q);continue}}
    if(q.cn&&CARS[q.cn]){ // in a car
      if(q.H){scene.remove(q.H.root);q.H=null}
      if(!q.car||q.cnShown!==q.cn){if(q.car)scene.remove(q.car.grp);try{q.car=makeCarMesh(q.cn,q.col,false);scene.add(q.car.grp);q.cnShown=q.cn}catch(e){q.car=null;q.cn=null}}
      if(q.car){q.car.grp.position.set(X,Y,Z);q.car.grp.rotation.set(0,q.h,0)}
    }else{
      if(q.car){scene.remove(q.car.grp);q.car=null;q.cnShown=null}
      if(!q.H){try{q.H=makeHuman(q.lk||randLook(Math.random()<.5));scene.add(q.H.root)}catch(e){q.H=null;continue}}
      q.H.root.position.set(X,Y,Z);q.H.root.rotation.y=q.h;try{animHuman(q.H,dt,Math.min(q.sp,9),'idle',{})}catch(e){}
    }
    if(!q.lbl||q.lblN!==q.n){if(q.lbl)scene.remove(q.lbl);q.lbl=labelSprite('🌍 '+q.n,'#fff','rgba(20,90,200,.85)');q.lblN=q.n;scene.add(q.lbl)}
    q.lbl.position.set(X,Y+(q.car?2.6:2.35),Z)}
}
function tick(){
  var now=performance.now();if(window.__mode!=='play'||typeof player==='undefined')return;
  if(off()){if(ws){try{ws.close()}catch(e){}}return}
  if(!ws&&!dead)connect();
  if(!joined)return;
  var inside=player.y>60,HH=window.__house;
  if(inside&&HH&&HH.inside()){var host=HH.host();
    if(host!==null&&host>=6&&now-lastSend>140){lastSend=now;var og=HH.origin(),oo={id:myId,n:(S&&S.name)||'Player',hp:host,x:+(player.x-og.cx).toFixed(2),z:+(player.z-og.cz).toFixed(2),y:+(player.y-og.fy).toFixed(2),h:+player.h.toFixed(2)};
      if(now-lastLook>6000){lastLook=now;try{oo.lk=S.look}catch(e){}}bc('pos',oo)}
    return}
  if(now-lastSend>(player.st==='foot'&&player.speed<.2?900:140)&&!inside){lastSend=now;
    var V=player.car,o={id:myId,n:(S&&S.name)||'Player',x:+player.x.toFixed(2),z:+player.z.toFixed(2),y:+player.y.toFixed(2),h:+player.h.toFixed(2)};
    if(player.st!=='foot'&&V){o.c=V.name;o.col=V.col||V.color||(V.car&&V.car.color)||'#c33';o.x=+V.x.toFixed(2);o.z=+V.z.toFixed(2);o.y=+V.y.toFixed(2);o.h=+V.h.toFixed(2)}
    if(now-lastLook>6000){lastLook=now;try{o.lk=S.look}catch(e){}}
    bc('pos',o)}
}
var last=performance.now();
setInterval(tick,50);
(function loop(){requestAnimationFrame(loop);var n=performance.now(),dt=Math.min(.1,(n-last)/1000);last=n;try{if(window.__mode==='play'&&typeof player!=='undefined')render(dt)}catch(e){}})();
window.addEventListener('pagehide',function(){bc('bye',{id:myId})});
var api=window.__rt={handlers:{},bc:bc,peers:peers,live:false,id:myId,count:function(){return Object.keys(peers).length}};
})();
