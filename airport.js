/* ===== Heirloom airport: planes you can see in the sky, boarding, cabin crew with food, turbulence, and a scary-but-safe emergency ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof scene==='undefined'||typeof flyTo==='undefined')return;
/* ---------- planes in the sky ---------- */
function mat(c,r,m){return new THREE.MeshStandardMaterial({color:new THREE.Color(c),roughness:r===undefined?.5:r,metalness:m||0})}
function plane(color){var g=new THREE.Group(),w=mat('#f4f6fa',.4,.2),a=mat(color,.5);
  var f=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,38,12),w);f.rotation.x=Math.PI/2;g.add(f);
  var nose=new THREE.Mesh(new THREE.ConeGeometry(2.2,7,12),w);nose.rotation.x=Math.PI/2;nose.position.z=22;g.add(nose);
  var tail=new THREE.Mesh(new THREE.ConeGeometry(2.2,9,12),w);tail.rotation.x=-Math.PI/2;tail.position.z=-23;g.add(tail);
  var stripe=new THREE.Mesh(new THREE.CylinderGeometry(2.25,2.25,30,12,1,true),a);stripe.rotation.x=Math.PI/2;stripe.scale.y=1;g.add(stripe);
  var wing=new THREE.Mesh(new THREE.BoxGeometry(46,.6,8),w);wing.position.set(0,-.8,-2);g.add(wing);
  var wl=new THREE.Mesh(new THREE.BoxGeometry(.6,3,3),a);wl.position.set(23,.6,-4);var wr=wl.clone();wr.position.x=-23;g.add(wl,wr);
  var tp=new THREE.Mesh(new THREE.BoxGeometry(14,.4,4),w);tp.position.set(0,2,-24);g.add(tp);
  var fin=new THREE.Mesh(new THREE.BoxGeometry(.5,8,6),a);fin.position.set(0,5,-23);g.add(fin);
  [-10,10].forEach(function(x){var e=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,6,10),mat('#9aa3ad',.4,.6));e.rotation.x=Math.PI/2;e.position.set(x,-2.2,1);g.add(e)});
  var red=new THREE.Mesh(new THREE.SphereGeometry(.7,8,8),new THREE.MeshBasicMaterial({color:0xff2020,toneMapped:false}));red.position.set(-23,0,-4);var grn=new THREE.Mesh(new THREE.SphereGeometry(.7,8,8),new THREE.MeshBasicMaterial({color:0x20ff60,toneMapped:false}));grn.position.set(23,0,-4);
  var st=new THREE.Mesh(new THREE.SphereGeometry(.8,8,8),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}));st.position.set(0,2.6,-20);g.add(red,grn,st);g.userData.strobe=st;
  g.traverse(function(o){o.castShadow=false});return g}
var planes=[{g:plane('#0b8f3a'),k:0,r:300,alt:135,ph:0,sp:.07},{g:plane('#d6252b'),k:0,r:380,alt:170,ph:2.4,sp:.055},{g:plane('#2f80ed'),k:1,ph:0}];
planes.forEach(function(p){p.g.visible=false;scene.add(p.g)});
var t0=performance.now();
setInterval(function(){var m=window.__mode;var on=(m==='play'||m==='menu'||m==='title');var tt=(performance.now()-t0)/1000;
  planes.forEach(function(p,i){p.g.visible=on;if(!on)return;
    if(p.k===0){var a=p.ph+tt*p.sp,x=player.x+Math.cos(a)*p.r,z=player.z+Math.sin(a)*p.r*.8;p.g.position.set(x,p.alt+Math.sin(tt*.2+i)*6,z);p.g.rotation.set(0,Math.atan2(-Math.sin(a)*p.r,Math.cos(a)*p.r*.8),Math.sin(tt*.1)*.08)}
    else{ // low pass over the airport: down the runway line, then climb away
      var A=(CITY&&CITY.airPos)||{x:300,z:0},cyc=100,u=((tt+30)%cyc)/cyc,zz=A.z-1500+u*3000,dd=Math.abs(zz-A.z),alt=18+Math.min(260,dd*.17);
      p.g.position.set(A.x,alt,zz);p.g.rotation.set(zz<A.z?-.07:.14,0,0);p.g.rotation.y=0}
    var s=p.g.userData.strobe;if(s)s.visible=((tt*1.4+i)%1)<.12})},33);

/* ---------- the flight itself ---------- */
function $q(s){return document.querySelector(s)}
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
var skip=false;
async function pause(ms){var t=0;while(t<ms&&!skip){await wait(100);t+=100}}
function line(t,sub){$q('#fl_t').textContent=t;$q('#fl_f').textContent=sub||''}
function shake(on,strong){var f=$q('#flight');f.style.animation=on?(strong?'flshake .12s infinite':'flshake .35s infinite'):'';}
var st=document.createElement('style');st.textContent='@keyframes flshake{0%{transform:translate(0,0)}25%{transform:translate(3px,-2px)}50%{transform:translate(-3px,2px)}75%{transform:translate(2px,3px)}100%{transform:translate(0,0)}}';document.head.appendChild(st);
function panel(html,btns){var f=$q('#flight'),p=$q('#fl_x');if(!p){p=document.createElement('div');p.id='fl_x';p.style.cssText='position:relative;z-index:3;margin-top:12px;max-width:440px;text-align:center;color:#fff;font:600 15px system-ui,sans-serif';f.appendChild(p)}
  p.innerHTML=html+'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px"></div>';var row=p.lastChild;
  return new Promise(function(res){var done=false;(btns||[]).forEach(function(b){var x=document.createElement('button');x.textContent=b[0];x.style.cssText='padding:9px 14px;border:0;border-radius:12px;background:'+(b[2]||'#ffffff30')+';color:#fff;font:800 14px system-ui';x.onclick=function(){if(done)return;done=true;res(b[1])};row.appendChild(x)});
    if(!btns||!btns.length)res(null);setTimeout(function(){if(!done){done=true;res(null)}},9000)})}
function clearPanel(){var p=$q('#fl_x');if(p)p.remove()}
flyTo=async function(ti){
  if(MISSION.cur)endMission(false,'You left town');const t=THEMES[ti];if(!spend(t.cost))return;closeSheet();mode='flight';skip=false;
  const fl=$q('#flight');fl.style.display='flex';
  if(!fl.querySelector('.cl')){for(let i=0;i<6;i++){const c=document.createElement('div');c.className='cl';c.style.cssText='top:'+(8+i*13)+'%;width:'+(90+i*30)+'px;height:'+(24+i*6)+'px;animation-duration:'+(9+i*3)+'s;animation-delay:-'+i*2+'s';fl.appendChild(c)}}
  var sk=document.createElement('button');sk.id='fl_skip';sk.textContent='Skip ⏭';sk.style.cssText='position:absolute;right:14px;top:14px;z-index:4;padding:7px 12px;border:0;border-radius:10px;background:#0006;color:#fff;font:700 13px system-ui';sk.onclick=function(){skip=true};fl.appendChild(sk);
  audio.setEngine(false);
  line('🛄 Boarding · Gate '+(1+Math.floor(Math.random()*12)),'Flight to '+t.n+' '+t.f+' · '+pick(['Please have your passport ready.','Boarding group 2 now boarding.','Welcome aboard Heirloom Air.']));sfx.ui();await pause(2200);
  line('🛫 Take-off','Cabin crew, prepare for departure');shake(true);sfx.win();await pause(2000);shake(false);
  line('✈️ Cruising over the clouds','Flying to '+t.n+' '+t.f);
  const meal=await panel('🧑‍✈️ <b>Flight attendant:</b> “Good day! Would you like something to eat or drink?”',[['🍛 Jollof & chicken · $15','j'],['🥤 Zobo drink · $5','z'],['😴 Sleep','s','#ffffff18']]);
  if(meal==='j'&&player.money>=15){addMoney(-15,true);stat('fd',40);stat('fn',10);toast('🍛 Delicious! Energy restored')}else if(meal==='z'&&player.money>=5){addMoney(-5,true);stat('fd',10);stat('fn',6);toast('🥤 Refreshing')}else if(meal==='s'){stat('en',25);toast('😴 You napped on the flight')}
  clearPanel();
  const roll=Math.random();
  if(roll<.14&&!skip){ // scary but safe
    line('⚠️ MAYDAY','The captain: “We have lost an engine. Brace! Brace!”');shake(true,true);fl.style.background='#4a0c10';try{sfx.boom&&sfx.boom()}catch(e){}
    await pause(1800);line('😱 The plane is dropping fast!','Hold on… oxygen masks are down');await pause(2800);
    shake(false);fl.style.background='';line('😮‍💨 Recovered!','The pilot regained control. Everyone is safe — emergency landing approved.');stat('fn',-15);await pause(2600)}
  else if(roll<.45&&!skip){line('🌩️ Turbulence','Please fasten your seat belt');shake(true);await pause(2400);shake(false)}
  clearWorld();S.theme=ti;genCity(ti);buildMarkers();buildMinimapBase();setupWorld();
  const A=CITY.airPos;placeAt(A.x,A.z+8,Math.PI);cam.yaw=Math.PI;
  line('🛬 Landing in '+t.n+' '+t.f,pick(t.fx));await pause(2600);
  sk.remove();fl.style.display='none';fl.style.animation='';fl.style.background='';mode='play';
  if(!S.visited.includes(ti)){S.visited.push(ti);banner('PASSPORT STAMP',t.n+' '+t.f,2600,'#9ad0ff');addXP(120);S.facts++;qAdd('learn')}else toast('Welcome to '+t.n+' '+t.f);
  saveGame()};
})();
