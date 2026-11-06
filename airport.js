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

/* ---------- 3D airliner, visible take-off, and a real cabin with seats and windows ---------- */
function airliner(color){var g=new THREE.Group(),W=mat('#f6f8fb',.35,.15),D=mat('#14181f',.4),A=mat(color,.45),G=mat('#9aa3ad',.4,.7);
  var pts=[[0,-23],[1.3,-22.4],[2.2,-20],[2.65,-15],[2.75,-6],[2.75,12],[2.6,17],[2.1,20.5],[1.2,23],[0,24]].map(function(p){return new THREE.Vector2(p[0],p[1])});
  var fu=new THREE.Mesh(new THREE.LatheGeometry(pts,20),W);fu.rotation.x=Math.PI/2;g.add(fu);
  [-1,1].forEach(function(sd){var st=new THREE.Mesh(new THREE.BoxGeometry(.06,.45,38),A);st.position.set(sd*2.72,-.1,0);g.add(st);
    for(var z=-15;z<=17;z+=1.15){var w=new THREE.Mesh(new THREE.BoxGeometry(.06,.45,.6),D);w.position.set(sd*2.74,.9,z);g.add(w)}
    var wing=new THREE.Mesh(new THREE.BoxGeometry(21,.55,7),W);wing.position.set(sd*12,-1,-2);wing.rotation.y=-sd*.5;wing.rotation.z=sd*.05;g.add(wing);
    var tip=new THREE.Mesh(new THREE.BoxGeometry(.4,2.4,2.2),A);tip.position.set(sd*22.4,.4,-7.5);g.add(tip);
    var tp=new THREE.Mesh(new THREE.BoxGeometry(8,.35,3),W);tp.position.set(sd*5.2,2.2,-21);tp.rotation.y=-sd*.45;g.add(tp);
    var en=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.1,4.4,14),G);en.rotation.x=Math.PI/2;en.position.set(sd*8,-2.2,1.5);g.add(en);
    var fan=new THREE.Mesh(new THREE.CircleGeometry(1.05,14),D);fan.position.set(sd*8,-2.2,3.72);g.add(fan)});
  var fin=new THREE.Mesh(new THREE.BoxGeometry(.5,9,6),A);fin.position.set(0,6,-20);fin.rotation.x=.3;g.add(fin);
  var cp=new THREE.Mesh(new THREE.BoxGeometry(3.4,.7,.1),D);cp.position.set(0,1.4,21.3);cp.rotation.x=-.5;g.add(cp);
  var gear=new THREE.Group();[[0,18],[-2.6,-3],[2.6,-3]].forEach(function(p){var st=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,3,6),G);st.position.set(p[0],-3.5,p[1]);gear.add(st);
    [-.35,.35].forEach(function(dx){var wh=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.35,12),D);wh.rotation.z=Math.PI/2;wh.position.set(p[0]+dx,-5,p[1]);gear.add(wh)})});g.add(gear);g.userData.gear=gear;
  var st2=new THREE.Mesh(new THREE.SphereGeometry(.5,8,8),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}));st2.position.set(0,2.8,-17);g.add(st2);g.userData.strobe=st2;
  g.traverse(function(o){o.castShadow=false});return g}
var X3=null; // everything the flight adds to the scene, so it can be removed afterwards
function end3D(){document.body.classList.remove('flying');if(!X3)return;if(X3.raf)cancelAnimationFrame(X3.raf);X3.objs.forEach(function(o){scene.remove(o)});cam.preview=null;X3=null}
function cloudTex(){var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d'),gr=x.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.5,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
/* ---- part 1: the plane waits on the runway, then accelerates past the camera and lifts off ---- */
function begin3D(){document.body.classList.add('flying');var R=(CITY&&CITY.runway)||null,A=(CITY&&CITY.airPos)||{x:0,z:0};if(!R)R={x0:A.x-400,x1:A.x+400,z:A.z-120};
  var pl=airliner('#0b8f3a');scene.add(pl);pl.rotation.order='YXZ';pl.rotation.y=Math.PI/2;var x0=R.x0+60;pl.position.set(x0,5.2,R.z);
  X3={objs:[pl],pl:pl,R:R,x0:x0,t:0,phase:'wait',spd:0,cab:null,raf:0,fov:55,last:performance.now()};
  var camX=x0+250,camZ=R.z+62;
  (function loop(){if(!X3)return;var now=performance.now(),dt=Math.min(.1,(now-X3.last)/1000);X3.last=now;X3.t+=dt;var p=X3.pl;
    if(X3.phase==='roll'){var a=9;X3.spd=Math.min(88,X3.spd+a*dt);p.position.x+=X3.spd*dt;
      var rot=X3.spd>66;if(rot){X3.pitch=Math.min(.24,(X3.pitch||0)+dt*.09);p.rotation.x=-X3.pitch}
      if(X3.pitch>.06){X3.vy=(X3.vy||0)+dt*5;p.position.y+=X3.vy*dt;if(p.position.y>14&&p.userData.gear.visible)p.userData.gear.visible=false}}
    if(p.userData.strobe)p.userData.strobe.visible=(X3.t%1.2)<.14;
    if(!X3.cab){var cx=camX,cz=camZ,cy=7;if(p.position.y>20){cx=p.position.x-70;cz=R.z+45;cy=p.position.y+8}
      cam.preview={x:cx,y:cy,z:cz,tx:p.position.x,ty:p.position.y+2,tz:R.z,fov:X3.fov}}
    X3.raf=requestAnimationFrame(loop)})()}
async function takeoff3D(){X3.phase='roll';var t=0;while(t<12000&&!skip){await wait(100);t+=100;if(X3&&X3.pl.position.y>60)break}}
/* ---- part 2: inside the plane: rows of seats, aisle, overhead bins and real windows with the wing and clouds outside ---- */
function cabin3D(){var P=X3.pl;P.visible=false;var C=new THREE.Group(),CX=0,CY=2600,CZ=0;C.position.set(CX,CY,CZ);
  function bx(w,h,d,x,y,z,m){var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);C.add(o);return o}
  var wall=mat('#e9ecf1',.7),carpet=mat('#33415c',.95),aisle=mat('#7a1f2b',.95),seat=mat('#274b8f',.8),cover=mat('#eef1f6',.8),dark=mat('#1b2029',.6),
    glass=new THREE.MeshStandardMaterial({color:0xb9dcff,transparent:true,opacity:.18,roughness:.05,metalness:.2,depthWrite:false});
  bx(5.6,.2,34,0,-.1,0,carpet);bx(.8,.04,34,0,.01,0,aisle);bx(5.6,.2,34,0,2.55,0,mat('#f4f6fa',.8));
  var rows=11,zs=[];for(var i=0;i<rows;i++)zs.push(-11+i*2.0);
  [-1,1].forEach(function(sd){
    // wall with real window openings
    bx(.12,.85,34,sd*2.74,.42,0,wall);bx(.12,1.05,34,sd*2.74,2.0,0,wall);
    for(var i=0;i<=rows;i++){var z=-12+i*2.0;bx(.12,.75,.5,sd*2.74,1.28,z,wall)}
    zs.forEach(function(z){bx(.05,.75,1.4,sd*2.7,1.28,z,glass);bx(.1,.08,1.5,sd*2.72,.88,z,mat('#cfd5df',.6));bx(.1,.08,1.5,sd*2.72,1.68,z,mat('#cfd5df',.6))});
    // overhead bins
    bx(1.1,.55,34,sd*2.1,2.2,0,mat('#dfe3ea',.7));
    // seats: 3 per side
    zs.forEach(function(z){[0,1,2].forEach(function(k){var x=sd*(1.0+k*.58);bx(.52,.14,.55,x,.5,z,seat);bx(.52,.7,.1,x,.95,z-.22,seat);bx(.4,.28,.06,x,1.38,z-.22,cover);bx(.5,.45,.5,x,.25,z,dark)})})});
  bx(5.6,3,.2,0,1.3,-17,wall);bx(5.6,3,.2,0,1.3,17,wall);bx(1.4,2.2,.1,0,1.1,16.85,mat('#c9ced8',.6));var ex=bx(.9,.28,.05,0,2.3,16.8,new THREE.MeshBasicMaterial({color:0x35ff8a}));
  // ceiling lights
  for(var z=-14;z<=14;z+=4)bx(.5,.05,.9,0,2.5,z,new THREE.MeshBasicMaterial({color:0xfff4d8}));
  var lt=new THREE.PointLight(0xfff0dc,1.1,24,1.3);lt.position.set(0,2.1,0);C.add(lt);
  // the wing and an engine seen through the windows
  var W=mat('#f6f8fb',.35,.15);var wing=new THREE.Mesh(new THREE.BoxGeometry(24,.5,7),W);wing.position.set(-15,-.6,-3);wing.rotation.y=.5;wing.rotation.z=.04;C.add(wing);
  var en=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.1,4.4,14),mat('#9aa3ad',.4,.7));en.rotation.x=Math.PI/2;en.position.set(-10,-2.6,0);C.add(en);
  (function(){var seen=new Set();C.traverse(function(m){var q=m.material;if(q&&q.color&&!q.isMeshBasicMaterial&&!q.isSpriteMaterial&&!seen.has(q)){seen.add(q);q.color.multiplyScalar(.55);if(q.emissive)q.emissive.setScalar(0)}if(m.isLight)m.intensity*=.45})})();
  scene.add(C);X3.objs.push(C);
  // clouds drifting past below and around
  var ct=cloudTex(),cl=[];for(var i=0;i<46;i++){var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:ct,transparent:true,opacity:.85,depthWrite:false,fog:false}));var s=120+Math.random()*320;sp.scale.set(s,s*.45,1);
    sp.position.set(CX-60-Math.random()*900,CY-70-Math.random()*90,CZ-700+Math.random()*1400);scene.add(sp);X3.objs.push(sp);cl.push(sp)}
  X3.cab={C:C,cl:cl,CX:CX,CY:CY,CZ:CZ};X3.shake=0;var t0=performance.now();
  cancelAnimationFrame(X3.raf);
  (function loop(){if(!X3)return;var t=(performance.now()-t0)/1000,sh=X3.shake||0;
    cl.forEach(function(s){s.position.z-=1.6;if(s.position.z<CZ-700)s.position.z=CZ+700});
    var jx=Math.sin(t*1.7)*.012*(1+sh*9)+Math.sin(t*23)*.004*sh*6,jy=Math.sin(t*1.1)*.01*(1+sh*9)+Math.cos(t*19)*.004*sh*6;
    // you sit in the left window seat (row 5), eyes at seat height; look out of the window, slightly forward
    cam.preview={x:CX-1.75+jx,y:CY+1.2+jy,z:CZ+zs[5],tx:CX-6,ty:CY+.95+jy*2,tz:CZ+zs[5]+2.2,fov:62};
    X3.raf=requestAnimationFrame(loop)})()}


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
  const fl=$q('#flight');fl.style.display='flex';fl.classList.add('cab');fl.classList.add('cab');try{begin3D()}catch(e){console.warn('plane',e)}
  if(!fl.querySelector('.cl')){for(let i=0;i<6;i++){const c=document.createElement('div');c.className='cl';c.style.cssText='top:'+(8+i*13)+'%;width:'+(90+i*30)+'px;height:'+(24+i*6)+'px;animation-duration:'+(9+i*3)+'s;animation-delay:-'+i*2+'s';fl.appendChild(c)}}
  var sk=document.createElement('button');sk.id='fl_skip';sk.textContent='Skip ⏭';sk.style.cssText='position:absolute;right:14px;top:14px;z-index:4;padding:7px 12px;border:0;border-radius:10px;background:#0006;color:#fff;font:700 13px system-ui';sk.onclick=function(){skip=true};fl.appendChild(sk);
  audio.setEngine(false);
  line('🛄 Boarding · Gate '+(1+Math.floor(Math.random()*12)),'Flight to '+t.n+' '+t.f+' · '+pick(['Please have your passport ready.','Boarding group 2 now boarding.','Welcome aboard Heirloom Air.']));sfx.ui();await pause(2200);
  line('🛫 Take-off','Cabin crew, prepare for departure');sfx.win();try{await takeoff3D();if(X3){cabin3D()}}catch(e){console.warn('plane',e)}
  line('✈️ Cruising over the clouds','Flying to '+t.n+' '+t.f);
  const meal=await panel('🧑‍✈️ <b>Flight attendant:</b> “Good day! Would you like something to eat or drink?”',[['🍛 Jollof & chicken · $15','j'],['🥤 Zobo drink · $5','z'],['😴 Sleep','s','#ffffff18']]);
  if(meal==='j'&&player.money>=15){addMoney(-15,true);stat('fd',40);stat('fn',10);toast('🍛 Delicious! Energy restored')}else if(meal==='z'&&player.money>=5){addMoney(-5,true);stat('fd',10);stat('fn',6);toast('🥤 Refreshing')}else if(meal==='s'){stat('en',25);toast('😴 You napped on the flight')}
  clearPanel();
  const roll=Math.random();
  if(roll<.14&&!skip){ // scary but safe
    line('⚠️ MAYDAY','The captain: “We have lost an engine. Brace! Brace!”');shake(true,true);fl.style.boxShadow='inset 0 0 140px 50px rgba(255,0,0,.6)';if(X3)X3.shake=1;try{sfx.boom&&sfx.boom()}catch(e){}
    await pause(1800);line('😱 The plane is dropping fast!','Hold on… oxygen masks are down');await pause(2800);
    shake(false);fl.style.boxShadow='';if(X3)X3.shake=0;line('😮‍💨 Recovered!','The pilot regained control. Everyone is safe — emergency landing approved.');stat('fn',-15);await pause(2600)}
  else if(roll<.45&&!skip){line('🌩️ Turbulence','Please fasten your seat belt');shake(true);if(X3)X3.shake=.5;await pause(2400);shake(false);if(X3)X3.shake=0}
  end3D();fl.classList.remove('cab');fl.style.boxShadow='';clearWorld();S.theme=ti;genCity(ti);buildMarkers();buildMinimapBase();setupWorld();
  const A=CITY.airPos;placeAt(A.x,A.z+8,Math.PI);cam.yaw=Math.PI;
  line('🛬 Landing in '+t.n+' '+t.f,pick(t.fx));await pause(2600);
  sk.remove();fl.style.display='none';fl.style.animation='';fl.style.background='';mode='play';
  if(!S.visited.includes(ti)){S.visited.push(ti);banner('PASSPORT STAMP',t.n+' '+t.f,2600,'#9ad0ff');addXP(120);S.facts++;qAdd('learn')}else toast('Welcome to '+t.n+' '+t.f);
  saveGame()};
})();
