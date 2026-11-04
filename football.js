/* ===== Heirloom Car Football: drive a car and knock a giant ball into the goal. 1v1, 2v2 or 3v3 against computer teams ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof ACT==='undefined'||typeof P==='undefined'||typeof spawnVehicle==='undefined')return;
var FY=100,MODES={1:{w:56,h:32,gw:7,n:'1 v 1 · small pitch',pay:2500},2:{w:76,h:44,gw:9,n:'2 v 2 · medium pitch',pay:4500},3:{w:96,h:54,gw:11,n:'3 v 3 · big pitch',pay:7000}};
var IN=false,grp=null,CX=0,CZ=0,F=null,ball=null,cars=[],score=[0,0],T=0,LEN=180,hud=null,bar=null,boxes=null,cityCol=null,cityCirc=null,OUT=null,freeze=0,over=false,lights=[],pay=0,lastT=0;
var prev=groundH;groundH=function(x,z){return IN?FY:prev(x,z)};
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function std(c,r,m){return new THREE.MeshStandardMaterial({color:new THREE.Color(c),roughness:r===undefined?.8:r,metalness:m||0})}
function bx(g,w,h,d,x,y,z,col,o){o=o||{};var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),o.mat||std(col,o.r,o.m));m.position.set(x,y,z);m.castShadow=!o.ns;m.receiveShadow=true;g.add(m);return m}
function spot(){var best=null,bd=-1,pois=(CITY&&CITY.pois)||[];
  for(var gx=3;gx<N-2;gx+=2)for(var gz=3;gz<N-2;gz+=2){var x=bcx(gx),z=bcx(gz),m=1e9;pois.forEach(function(p){var d=Math.hypot(p.pos.x-x,p.pos.z-z);if(d<m)m=d});if(m>bd){bd=m;best=[x,z]}}return best||[0,0]}
function build(n){F=MODES[n];F.n_=n;var sp=spot();CX=sp[0];CZ=sp[1];grp=new THREE.Group();grp.position.set(CX,0,CZ);var g=grp,hw=F.w/2,hh=F.h/2;
  var trk=bx(g,F.w+16,.5,F.h+16,0,FY-.25,0,'#c8553d',{r:.95});if(window.SKIN)SKIN.put(trk.material,'track',1,false),trk.material.map.repeat.set((F.w+16)/6,(F.h+16)/6),trk.material.color.set('#e8a28f');bx(g,F.w+2,.01,F.h+2,0,FY,0,'#1f7a3a',{r:.95,ns:1});
  for(var i=-hw;i<hw;i+=8)bx(g,4,.02,F.h,i+2,FY+.01,0,'#238540',{ns:1});                              // mown stripes
  var L='#f3f6f4',LO={ns:1};bx(g,.4,.03,F.h,0,FY+.03,0,L,LO);bx(g,F.w,.03,.4,0,FY+.03,-hh,L,LO);bx(g,F.w,.03,.4,0,FY+.03,hh,L,LO);bx(g,.4,.03,F.h,-hw,FY+.03,0,L,LO);bx(g,.4,.03,F.h,hw,FY+.03,0,L,LO);
  var ring=new THREE.Mesh(new THREE.RingGeometry(6.6,7,40),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=FY+.04;g.add(ring);
  // boards and goals: wall boxes keep the ball and cars in, goal mouths stay open
  var gw=F.gw,wallH=2.6,wc='#2b3350';
  bx(g,F.w+2,wallH,1,0,FY+wallH/2,-hh-.5,wc);bx(g,F.w+2,wallH,1,0,FY+wallH/2,hh+.5,wc);
  [-1,1].forEach(function(s){var seg=(hh-gw);bx(g,1,wallH,seg,s*(hw+.5),FY+wallH/2,-(gw+seg/2),wc);bx(g,1,wallH,seg,s*(hw+.5),FY+wallH/2,(gw+seg/2),wc);
    bx(g,4.2,.3,2*gw,s*(hw+2.2),FY+3.3,0,'#fff',{mat:new THREE.MeshBasicMaterial({color:s<0?0x2f80ed:0xe0382f,transparent:true,opacity:.35}),ns:1});         // goal glow
    bx(g,1,3.4,2*gw+1,s*(hw+4.4),FY+1.7,0,'#e8ecf5');bx(g,4.4,3.4,.4,s*(hw+2.3),FY+1.7,-gw,'#e8ecf5');bx(g,4.4,3.4,.4,s*(hw+2.3),FY+1.7,gw,'#e8ecf5');bx(g,4.4,.3,2*gw+.6,s*(hw+2.3),FY+3.4,0,'#e8ecf5');
    bx(g,.4,3.6,.4,s*hw,FY+1.8,-gw,'#fff');bx(g,.4,3.6,.4,s*hw,FY+1.8,gw,'#fff');bx(g,.4,.4,2*gw,s*hw,FY+3.6,0,'#fff')});
  // floodlight poles
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){bx(g,.6,14,.6,p[0]*(hw+6),FY+7,p[1]*(hh+5),'#555');bx(g,3,1,1.4,p[0]*(hw+6),FY+14,p[1]*(hh+5),'#fff',{mat:new THREE.MeshBasicMaterial({color:0xfff6dc}),ns:1})});
  // fans
  for(var k=0;k<40;k++){var side=k%2?1:-1,fx=-hw+4+(k*(F.w-8)/40);bx(g,.8,1.4,.8,fx,FY+1.8,side*(hh+3),['#d6252b','#2f80ed','#f2b705','#2fb67c','#ffffff','#7a2cff'][k%6],{ns:1})}
  // ball (flat-shaded football)
  var geo=new THREE.IcosahedronGeometry(1.35,1).toNonIndexed(),cnt=geo.attributes.position.count,col=new Float32Array(cnt*3);
  for(var f=0;f<cnt/3;f++){var c=(f%5===0)?.08:.96;for(var v=0;v<3;v++){col[(f*3+v)*3]=c;col[(f*3+v)*3+1]=c;col[(f*3+v)*3+2]=c}}geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  var bm=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.5}));bm.castShadow=true;g.add(bm);
  var sh=new THREE.Mesh(new THREE.CircleGeometry(1.5,16),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35}));sh.rotation.x=-Math.PI/2;g.add(sh);
  if(window.HM){bm.material.visible=false;var rb=HM.make('football',1.35/.11,0);rb.position.y=-.109*1.35/.11;bm.add(rb)}
  ball={m:bm,sh:sh,x:0,z:0,vx:0,vz:0,r:1.35};
  scene.add(g);
  boxes=new Map();var old=colBoxes;colBoxes=boxes;
  colAddBox(CX-hw-1,CZ-hh-1,CX+hw+1,CZ-hh,FY+wallH,'fw');colAddBox(CX-hw-1,CZ+hh,CX+hw+1,CZ+hh+1,FY+wallH,'fw');
  [-1,1].forEach(function(s){var a=s<0?CX-hw-1:CX+hw,b=s<0?CX-hw:CX+hw+1;colAddBox(a,CZ-hh,b,CZ-gw,FY+wallH,'fw');colAddBox(a,CZ+gw,b,CZ+hh,FY+wallH,'fw');
    var ex=s<0?CX-hw-4.6:CX+hw+4.2;colAddBox(ex,CZ-gw-.4,ex+.4,CZ+gw+.4,FY+3,'fg');colAddBox(s<0?CX-hw-4.6:CX+hw,CZ-gw-.5,s<0?CX-hw:CX+hw+4.6,CZ-gw,FY+3,'fg');colAddBox(s<0?CX-hw-4.6:CX+hw,CZ+gw,s<0?CX-hw:CX+hw+4.6,CZ+gw+.5,FY+3,'fg')});
  colBoxes=old;
  lights=[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]].map(function(p){var l=new THREE.PointLight(0xfff6e0,1.2,70,1.3);l.position.set(CX+p[0]*hw*1.4,FY+14,CZ+p[1]*hh*1.4);return l})}
function newCar(color,x,z,h,human){var V=spawnVehicle('sports',color,CX+x,CZ+z,h,'free');upgradeToFull(V);V.hp=9999;if(!human)V.driver='player';V.owned=false;return V}
function kickoff(){ball.x=0;ball.z=0;ball.vx=ball.vz=0;freeze=2.2;
  var n=F.n_,i=0;cars.forEach(function(c){var side=c.team?1:-1,idx=c.idx,zz=(idx-(Math.ceil(n/2)-.5)*(n>1?1:0))*8;if(n===1)zz=0;
    var V=c.V;V.x=CX+side*F.w*.28;V.z=CZ+zz;V.h=c.team?-Math.PI/2:Math.PI/2;V.speed=0;V.vx=V.vz=0;V.yr=0;V.thr=0;V.brk=1;V.steer=0;c.V.car.grp.position.set(V.x,FY,V.z)});
  if(player.car){cam.yaw=player.car.h}}
function startMatch(n){if(IN)return;if(typeof MISSION!=='undefined'&&MISSION.cur){toast('Finish your current job first');return}
  if(window.__house&&window.__house.inside&&window.__house.inside()||window.__showroom&&window.__showroom.inside&&window.__showroom.inside()){toast('Leave the building first');return}
  OUT={x:player.x,z:player.z,h:player.h};if(player.car)exitVehicle(true);build(n);cityCol=colBoxes;cityCirc=colCircs;colBoxes=boxes;colCircs=new Map();IN=true;over=false;score=[0,0];T=0;pay=MODES[n].pay;
  lights.forEach(function(l){scene.add(l)});cars=[];
  for(var t=0;t<2;t++)for(var i=0;i<n;i++){var human=(t===0&&i===0);var V=newCar(t?'#2f80ed':'#e0382f',0,0,0,human);cars.push({V:V,team:t,idx:i,human:human,role:(i===1&&n>1)?'keeper':'striker',spd:.78+Math.random()*.14})}
  kickoff();var me=cars[0].V;player.x=me.x;player.z=me.z;enterVehicle(me);ui();hudDraw();
  banner('⚽ CAR FOOTBALL',MODES[n].n+' · first to score most in 3 minutes',3000,'#35e0b0')}
function ui(){if(!bar){bar=el('div','position:fixed;right:10px;top:calc(46px + env(safe-area-inset-top,0px));z-index:31;display:none');document.body.appendChild(bar)}
  bar.innerHTML='';var b=el('button','padding:8px 12px;border-radius:12px;border:1px solid #fff5;background:rgba(0,0,0,.66);color:#fff;font:800 13px system-ui','🚪 Leave');b.onclick=function(){if(over||confirm('Leave the match?'))leave()};bar.appendChild(b);bar.style.display=IN&&window.__mode==='play'?'block':'none';
  if(!hud){hud=el('div','position:fixed;left:50%;top:calc(46px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:30;padding:6px 16px;border-radius:14px;background:rgba(0,0,0,.66);color:#fff;font:800 20px system-ui;letter-spacing:.04em;pointer-events:none');hud.id='fbhud';document.body.appendChild(hud)}hud.style.display=IN?'block':'none'}
function hudDraw(){if(!hud)return;var rem=Math.max(0,LEN-T),m=Math.floor(rem/60),s=Math.floor(rem%60);hud.innerHTML='<span style="color:#ff7a70">YOU '+score[0]+'</span> &nbsp;–&nbsp; <span style="color:#7fb7ff">'+score[1]+' CPU</span> &nbsp;<small style="opacity:.8">'+m+':'+(s<10?'0':'')+s+'</small>'}
function cleanup(){IN=false;lights.forEach(function(l){scene.remove(l)});cars.forEach(function(c){try{if(player.car===c.V)exitVehicle(true);removeVehicle(c.V)}catch(e){}});cars=[];if(grp){scene.remove(grp);grp=null}if(cityCol)colBoxes=cityCol;if(cityCirc)colCircs=cityCirc;if(hud)hud.style.display='none';if(bar)bar.style.display='none'}
function leave(){if(!IN)return;cleanup();var o=OUT||{x:0,z:0,h:0};placeAt(o.x,o.z,o.h)}
function goal(team){score[team]++;freeze=2.6;banner(team===0?'⚽ GOAL!':'😬 CPU SCORES',score[0]+' – '+score[1],2200,team===0?'#35e0b0':'#ff5468');try{sfx.win&&sfx.win()}catch(e){}hudDraw();
  setTimeout(function(){if(IN&&!over)kickoff()},1800);ball.vx=ball.vz=0}
function finish(){over=true;var r=score[0]>score[1]?pay:score[0]===score[1]?Math.round(pay*.25):Math.round(pay*.08);var res=score[0]>score[1]?'🏆 YOU WIN!':score[0]===score[1]?'🤝 DRAW':'😕 YOU LOST';
  addMoney(r);addXP(score[0]>score[1]?80:30);banner(res,score[0]+' – '+score[1]+' · +$'+r.toLocaleString(),4200,score[0]>score[1]?'#ffd23f':'#ccc');try{saveGame()}catch(e){}
  setTimeout(function(){if(IN&&over)leave()},4500)}
function ai(c,dt){var V=c.V,hw=F.w/2,hh=F.h/2,own=c.team?1:-1,att=-own,bxw=CX+ball.x,bzw=CZ+ball.z,tx,tz;
  if(c.role==='keeper'){tx=CX+own*(hw-9);tz=CZ+Math.max(-F.gw+2,Math.min(F.gw-2,ball.z*.6))}
  else{var gx=CX+att*hw,gz=CZ,dx=gx-bxw,dz=gz-bzw,l=Math.hypot(dx,dz)||1;tx=bxw-dx/l*3.2;tz=bzw-dz/l*3.2;
    var behind=(V.x-bxw)*att<0;if(!behind){tx=bxw-att*8;tz=bzw+(bzw>CZ?-1:1)*6}else if(Math.hypot(V.x-tx,V.z-tz)<4){tx=bxw;tz=bzw}}
  var ang=Math.atan2(tx-V.x,tz-V.z),da=ang-V.h;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  V.steer=-Math.max(-1,Math.min(1,da*1.6));var dist=Math.hypot(tx-V.x,tz-V.z);V.thr=Math.abs(da)>1.9?0:c.spd*(dist>5?1:.55);V.brk=Math.abs(da)>1.9?.6:0;V.hb=0;V.boost=0;V.hp=9999}
var accT=0;
setInterval(function(){if(!IN){return}var now=performance.now(),dt=Math.min(.5,(now-(lastT||now))/1000);lastT=now;
  if(Math.abs(player.x-CX)>200||Math.abs(player.z-CZ)>200){cleanup();return}
  player.inv=9;if(player.car)player.car.hp=9999;
  if(over)return;
  if(freeze>0){freeze-=dt;cars.forEach(function(c){c.V.thr=0;c.V.brk=1})}
  else{T+=dt;if(T>=LEN){finish();return}hudDraw()}
  cars.forEach(function(c){if(!c.human&&freeze<=0)ai(c,dt)});
  // ball physics in field coordinates
  var steps=Math.max(1,Math.ceil(dt/.03)),hdt=dt/steps;for(var st=0;st<steps;st++){var dt2=hdt;
  if(true){
    ball.x+=ball.vx*dt2;ball.z+=ball.vz*dt2;var sp=Math.hypot(ball.vx,ball.vz);var fr=Math.exp(-.45*dt2);ball.vx*=fr;ball.vz*=fr;
    var hw=F.w/2,hh=F.h/2,gw=F.gw;
    if(ball.z<-hh+ball.r){ball.z=-hh+ball.r;ball.vz=Math.abs(ball.vz)*.82}if(ball.z>hh-ball.r){ball.z=hh-ball.r;ball.vz=-Math.abs(ball.vz)*.82}
    if(Math.abs(ball.x)>hw-ball.r){
      if(Math.abs(ball.z)<gw-.4){ if(Math.abs(ball.x)>hw+ball.r*.3&&freeze<=0&&!over){goal(ball.x>0?0:1)} if(Math.abs(ball.x)>hw+3.4){ball.x=Math.sign(ball.x)*(hw+3.4);ball.vx*=-.5} }
      else{ball.x=Math.sign(ball.x)*(hw-ball.r);ball.vx*=-.82}}
    cars.forEach(function(c){var V=c.V,lx=V.x-CX,lz=V.z-CZ,fx=Math.sin(V.h),fz=Math.cos(V.h);
      // test the ball against two circles (front and rear of the car)
      [[1.3,0],[-.2,0],[-1.5,0]].forEach(function(o){var px=lx+fx*o[0],pz=lz+fz*o[0],dx=ball.x-px,dz=ball.z-pz,d=Math.hypot(dx,dz),R=ball.r+1.15;
        if(d<R&&d>1e-4){var nx=dx/d,nz=dz/d,cvx=fx*V.speed,cvz=fz*V.speed,rel=(ball.vx-cvx)*nx+(ball.vz-cvz)*nz;ball.x=px+nx*R;ball.z=pz+nz*R;
          if(rel<0){var k=-(1+.55)*rel;ball.vx+=nx*k;ball.vz+=nz*k;var s=Math.hypot(ball.vx,ball.vz);if(s>52){ball.vx*=52/s;ball.vz*=52/s}if(k>6)try{sfx.thud&&sfx.thud()}catch(e){}}}})});
    ball.m.position.set(ball.x,FY+ball.r,ball.z);ball.sh.position.set(ball.x,FY+.06,ball.z);
    var s2=Math.hypot(ball.vx,ball.vz);if(s2>.2){ball.m.rotation.x+=ball.vz*dt2/ball.r;ball.m.rotation.z-=ball.vx*dt2/ball.r}}}
  var ob=bar&&bar.style;if(ob)ob.display=window.__mode==='play'?'block':'none'},16);
var osg=saveGame;saveGame=function(){if(!IN||!OUT)return osg.apply(this,arguments);var x=player.x,z=player.z,y=player.y;player.x=OUT.x;player.z=OUT.z;try{return osg.apply(this,arguments)}finally{player.x=x;player.z=z;player.y=y}};
var oc=clearWorld;clearWorld=function(){if(IN)leave();return oc.apply(this,arguments)};
ACT.football=function(v){closeSheet();startMatch(+v||1)};
var oj=P.jobs;P.jobs=function(a){var r=oj(a);r.h+='<div class="cap" style="margin-top:10px"><b>⚽ Car Football</b> · drive your car and knock the giant ball into the goal</div><div class="grid" style="grid-template-columns:repeat(3,1fr)">'+[1,2,3].map(function(n){return'<button class="tile" data-a="football" data-v="'+n+'"><span class="em">⚽</span><b style="font-size:12px">'+n+' v '+n+'</b><em>win $'+MODES[n].pay.toLocaleString()+'</em></button>'}).join('')+'</div>';return r};
window.__football={ball:function(){return ball},start:startMatch,leave:leave,state:function(){return{cx:CX,cz:CZ,score:score,T:T,ball:ball&&{x:ball.x,z:ball.z},IN:IN}}};
})();
