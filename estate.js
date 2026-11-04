/* Heirloom Estate: a gated block of private plots. Your plot has a compound wall, a gate, two parking spots and your house door. */
(function(){
var COLS=3,PW=28,PD=40,LANE=6,GATE0=10.5,GATE1=17.5,Y=.22,PER=6,NEARD=240;
// block 0 is the central one (guests live there); the rest line the east side of the city
var BL=[[8,9]];for(var gz=6;gz<=15;gz++)BL.push([18,gz]);
window.__ESTATE_SKIP={};BL.slice(1).forEach(function(b){window.__ESTATE_SKIP[b[0]+','+b[1]]=1});
var GR={},colSeen={},OCC={},myPlot=-1,parkDone=false,mats={},built=false,lastSent='',claiming=false,polled=0;
function M(c,r){var k=c+'|'+(r||.8);return mats[k]||(mats[k]=new THREE.MeshStandardMaterial({color:new THREE.Color(c),roughness:r||.8}))}
function LS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function plotName(){return (S&&S.name)||'Player'}
function tierNow(){return (S.house&&S.house.tier)||1}
function api(o){return fetch('/api/estate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json()}).catch(function(){return null})}
function pick(){ // my plot: from the server when logged in, else a guest plot in block 0
  if(typeof S.plot==='number'&&S.plot>=0&&(S.plot>=PER||!LS('hl-tok')||!S.plotSrv)&&(S.plot<PER*BL.length))return S.plot;
  var h=0,n=plotName();for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;S.plot=h%PER;try{saveGame()}catch(e){}return S.plot}
function claim(){var t=LS('hl-tok');if(!t||claiming||S.plotSrv)return;claiming=true;
  api({act:'claim',token:t,name:plotName()}).then(function(r){claiming=false;if(r&&typeof r.plot==='number'&&r.plot<PER*BL.length){S.plot=r.plot;S.plotSrv=1;try{saveGame()}catch(e){}wipe();if(typeof toast==='function')toast('🏠 Your estate plot is ready: plot '+(r.plot+1))}})}
function syncTier(){var t=LS('hl-tok');if(!t||!S.plotSrv)return;var k=plotName()+'|'+tierNow();if(k===lastSent)return;lastSent=k;api({act:'set',token:t,name:plotName(),tier:tierNow()})}
function frame(idx){ // world mapper for plot idx
  var k=Math.floor(idx/PER),l=idx%PER,B=BL[k]||BL[0],bx=bcx(B[0]),bz=bcx(B[1]),row=l<COLS?0:1,col=l%COLS,dir=row?1:-1,x0=bx-42+col*PW,frontZ=bz+(row?LANE:-LANE);
  return{k:k,row:row,dir:dir,x0:x0,frontZ:frontZ,W:function(u,v){return[x0+u,frontZ+dir*v]},bx:bx,bz:bz,
    rect:function(u0,v0,u1,v1){var a=this.W(u0,v0),b=this.W(u1,v1);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]}}}
var GRP=null;
function box(F,u0,v0,u1,v1,y0,y1,col,o){o=o||{};var r=F.rect(u0,v0,u1,v1),w=r[2]-r[0],d=r[3]-r[1],h=y1-y0;
  var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),o.mat||M(col,o.r));m.position.set((r[0]+r[2])/2,(y0+y1)/2,(r[1]+r[3])/2);m.castShadow=!!o.sh;m.receiveShadow=true;GRP.add(m);
  if(o.col){var ck=r.map(function(x){return Math.round(x*10)}).join(',')+':'+Math.round(y1);if(!colSeen[ck]){colSeen[ck]=1;colAddBox(r[0],r[1],r[2],r[3],y1,'est')}}return m}
function cyl(x,y,z,rt,rb,h,col){var m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,14),M(col));m.position.set(x,y,z);m.castShadow=true;GRP.add(m);return m}
function sprite(txt,fg,bg,x,y,z,sc){var s=labelSprite(txt,fg,bg);s.position.set(x,y,z);if(sc)s.scale.multiplyScalar(sc);GRP.add(s);return s}
function roof(F,u0,v0,u1,v1,y,h,col){var r=F.rect(u0-.9,v0-.9,u1+.9,v1+.9),w=r[2]-r[0],d=r[3]-r[1];
  var g=new THREE.ConeGeometry(1,h,4);g.rotateY(Math.PI/4);var m=new THREE.Mesh(g,M(col,.8));m.scale.set(w/1.4142,1,d/1.4142);m.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);m.castShadow=true;GRP.add(m);
  var e=F.rect(u0-.9,v0-.9,u1+.9,v1+.9);box(F,u0-.9,v0-.9,u1+.9,v1+.9,y-.05,y+.1,'#6e2a18');return m}
var WALL='#f1ead8',CAP='#8a3b24',HOUSE=['#e8d2b0','#d9e6ee','#efe0d0','#dde8d2','#f0d9d9','#e3dcf0'];
function plot(idx,mode,info){
  var mine=mode==='mine',F=frame(idx),nm=mine?plotName():null;
  box(F,0,0,PW,PD,Y,Y+.04,mine?'#c9c3b2':'#a7b890'); // yard slab (concrete) / empty lot (grass)
  // compound wall: sides, back, front with a wide gate opening
  var T=.4,H=2.7;
  [[0,0,T,PD],[PW-T,0,PW,PD],[0,PD-T,PW,PD],[0,0,GATE0,T],[GATE1,0,PW,T]].forEach(function(w){box(F,w[0],w[1],w[2],w[3],Y,Y+H,WALL,{col:1,sh:1});box(F,w[0]-.1,w[1]-.1,w[2]+.1,w[3]+.1,Y+H,Y+H+.18,CAP)});
  // gate pillars with lamps
  [[GATE0-.6,GATE0+.5],[GATE1-.5,GATE1+.6]].forEach(function(p){box(F,p[0],-.3,p[1],.7,Y,Y+3.4,'#e6dcc4',{col:1,sh:1});box(F,p[0]-.1,-.4,p[1]+.1,.8,Y+3.4,Y+3.6,CAP);
    var w=F.W((p[0]+p[1])/2,.2),l=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0xfff0b0}));l.position.set(w[0],Y+3.95,w[1]);GRP.add(l)});
  if(mode==='occ'){ // a neighbour's house: simple, cheap to draw
    var t2=(info&&info.t)||1,hc2=t2===3?'#f3efe6':t2===2?'#f4e9d2':HOUSE[idx%HOUSE.length],hh=t2===3?11.4:7.6,u0=t2>=2?3:5,u1=t2>=2?25:23,v0=t2>=3?22:24;
    box(F,u0,v0,u1,38,Y,Y+hh,hc2,{col:1,sh:1});box(F,u0-.2,v0-.2,u1+.2,38.2,Y+hh,Y+hh+.35,'#9a9a98');roof(F,u0,v0,u1,38,Y+hh+.3,t2===3?4.6:3.8,t2===3?'#3b3f4a':'#8a3b24');
    if(t2>=2)box(F,u0-.25,v0-.25,u1+.25,v0-.1,Y+hh-.1,Y+hh+.2,'#d4af37');
    box(F,13.2,v0-.1,14.8,v0+.05,Y,Y+2.5,'#5b3a22');
    var gl=M('#233a52',.2);for(var f2=0;f2<(t2===3?3:2);f2++)[7,21].forEach(function(u){box(F,u-1,v0-.08,u+1,v0+.02,Y+1.2+f2*3.6,Y+3.2+f2*3.6,null,{mat:gl})});
    if(t2>=2){box(F,18.5,12.5,26,20,Y+.04,Y+.07,'#e8e2d4');box(F,19.2,13.2,25.3,19.3,Y+.07,Y+.1,'#2ec4f1')}
    var np2=F.W(14,.2);sprite('🏠 '+((info&&info.n)||'Player')+"'s House",'#fff','rgba(20,90,140,.9)',np2[0],Y+4.7,np2[1],1.15);return}
  if(!mine){ // for-sale lot
    var sp=F.W(14,6);var pole=cyl(sp[0],Y+1.2,sp[1],.05,.05,2.4,'#555');sprite('🏷️ PLOT '+(idx+1)+' · FOR SALE','#fff','rgba(200,40,40,.9)',sp[0],Y+2.9,sp[1]);return}
  // my plot: nameplate on the gate
  var np=F.W(14,.2);sprite('🏠 '+nm+"'s House",'#fff','rgba(20,110,70,.92)',np[0],Y+4.7,np[1],1.25);
  // parking: two marked bays, facing the gate
  [4,24].forEach(function(u,k){box(F,u-2,3.2,u+2,9.8,Y+.04,Y+.06,'#8d8a80');
    [[u-2,3.2,u-1.88,9.8],[u+1.88,3.2,u+2,9.8],[u-2,3.2,u+2,3.32],[u-2,9.68,u+2,9.8]].forEach(function(l){box(F,l[0],l[1],l[2],l[3],Y+.06,Y+.075,'#ffffff')});
    var w=F.W(u,10.4);sprite('P'+(k+1),'#fff','rgba(30,60,160,.85)',w[0],Y+.9,w[1],.55)});
  // driveway strip from the gate
  box(F,GATE0,0,GATE1,22,Y+.04,Y+.055,'#7d7a72');
  // the house: two storeys, flat roof with water tank, windows, door
  var tr=(S.house&&S.house.tier)||1;
  var hc=tr===3?'#f3efe6':tr===2?'#f4e9d2':HOUSE[idx%HOUSE.length],hu0=tr>=2?3:5,hu1=tr>=2?25:23,hv0=tr>=3?22:24,hv1=38,HH=tr===3?11.4:7.6;
  box(F,hu0,hv0,hu1,hv1,Y,Y+HH,hc,{col:1,sh:1});
  box(F,hu0-.2,hv0-.2,hu1+.2,hv1+.2,Y+HH,Y+HH+.35,'#9a9a98',{sh:1}); // roof slab
    roof(F,hu0,hv0,hu1,hv1,Y+HH+.3,tr===3?4.6:3.8,tr===3?'#3b3f4a':'#8a3b24');
  var glass=M('#233a52',.2),fls=tr===3?3:2,wus=tr>=2?[5.5,9,19,22.5]:[7.5,11.5,17.5,20.5];
  for(var fl=0;fl<fls;fl++)wus.forEach(function(u){if(fl===0&&(u>12&&u<16))return;box(F,u-1.1,hv0-.08,u+1.1,hv0+.02,Y+1.2+fl*3.6,Y+3.2+fl*3.6,null,{mat:glass});box(F,u-1.25,hv0-.14,u+1.25,hv0-.04,Y+.95+fl*3.6+.25,Y+1.02+fl*3.6+.25,'#ffffff')});
  if(tr>=2){ // gold roof edge + columns
    box(F,hu0-.25,hv0-.25,hu1+.25,hv0-.1,Y+HH-.1,Y+HH+.2,'#d4af37');
    [hu0+1,10,18,hu1-1].forEach(function(u){var w=F.W(u,hv0-1.2);var c=cyl(w[0],Y+(tr===3?5.5:3.6),w[1],.42,.46,tr===3?11:7.2,'#f6f1e4');cyl(w[0],Y+(tr===3?11.1:7.3),w[1],.62,.62,.3,'#d4af37')});
    box(F,hu0-.5,hv0-2.6,hu1+.5,hv0-.1,Y+.0,Y+.3,'#cfc7b4'); // wide front terrace
  }
  if(tr===3){var bl=F.W(14,hv0-1.4);box(F,9,hv0-2.4,19,hv0-.1,Y+7.1,Y+7.4,'#d4af37',{sh:1}); // balcony
    box(F,9,hv0-2.4,19,hv0-2.3,Y+7.4,Y+8.4,null,{mat:new THREE.MeshStandardMaterial({color:0x9fd8ff,transparent:true,opacity:.35})})}
  if(tr>=2){ // swimming pool + palm in the yard
    var pw=F.W(22,16);box(F,18.5,12.5,26,20,Y+.04,Y+.07,'#e8e2d4');box(F,19.2,13.2,25.3,19.3,Y+.07,Y+.1,null,{mat:new THREE.MeshStandardMaterial({color:0x2ec4f1,roughness:.05,metalness:.2,emissive:0x0a5a78,emissiveIntensity:.5})});
    if(tr===3){var fq=F.W(14,15);cyl(fq[0],Y+.4,fq[1],1.6,1.8,.8,'#d9d3c3');var wt=cyl(fq[0],Y+.82,fq[1],1.35,1.35,.06,'#35b8e8');cyl(fq[0],Y+1.4,fq[1],.18,.3,1.4,'#e8e2d4');var jt=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),new THREE.MeshBasicMaterial({color:0x9fe3ff,transparent:true,opacity:.7}));jt.position.set(fq[0],Y+2.3,fq[1]);GRP.add(jt)}}
  box(F,13.2,hv0-.1,14.8,hv0+.05,Y,Y+2.5,'#5b3a22'); // door
  box(F,12.9,hv0-.18,15.1,hv0-.06,Y+2.5,Y+2.7,'#3d2616');box(F,12.9,hv0-.18,13.1,hv0-.06,Y,Y+2.5,'#3d2616');box(F,14.9,hv0-.18,15.1,hv0-.06,Y,Y+2.5,'#3d2616');
  box(F,12.5,hv0-1.8,15.5,hv0,Y,Y+.2,'#b9b2a2'); // doorstep
  var dl=F.W(14,hv0-.3);var lamp=new THREE.PointLight(0xffe2a0,.6,14);lamp.position.set(dl[0],Y+3.1,dl[1]);GRP.add(lamp);
  // trees and a flower bed in the yard
  [[2.5,14],[25.5,14],[2.5,19],[25.5,19]].forEach(function(p,i){var w=F.W(p[0],p[1]);cyl(w[0],Y+1,w[1],.18,.22,2,'#6b4a2a');var c=new THREE.Mesh(new THREE.SphereGeometry(1.5,10,8),M(i%2?'#2f8a3e':'#3aa04a'));c.position.set(w[0],Y+3,w[1]);c.castShadow=true;GRP.add(c)});
}
function wipe(){colSeen={};Object.keys(GR).forEach(function(k){var g=GR[k];if(g){scene.remove(g);g.traverse(function(o){if(o.geometry)o.geometry.dispose()})}});GR={};built=false}
function buildBlock(k){
  if(GR[k]||!BL[k])return;GRP=GR[k]=new THREE.Group();scene.add(GRP);
  var bx=bcx(BL[k][0]),bz=bcx(BL[k][1]);
  var lane=new THREE.Mesh(new THREE.BoxGeometry(92,.04,LANE*2),M('#4a4c52',.9));lane.position.set(bx,Y+.02,bz);lane.receiveShadow=true;GRP.add(lane);
  var dash=new THREE.Mesh(new THREE.BoxGeometry(88,.01,.2),M('#e8e0a8'));dash.position.set(bx,Y+.05,bz);GRP.add(dash);
  sprite('🏘️ HEIRLOOM ESTATE'+(k?' · BLOCK '+(k+1):''),'#fff','rgba(20,40,70,.92)',bx+43,Y+5.5,bz,2);
  for(var l=0;l<PER;l++){var i=k*PER+l;if(i===myPlot)plot(i,'mine');else if(OCC[i]){plot(i,'occ',OCC[i]);if(i>=PER)addBell(i,OCC[i])}else plot(i,'free')}}
function addBell(i,o){if(typeof CITY==='undefined')return;var F=frame(i),g=F.W(14,-1.4);CITY.pois=CITY.pois.filter(function(p){return p.id!=='bell'+i});CITY.pois.push({id:'bell'+i,n:'Ring bell · '+o.n,ic:'🔔',col:'#66b8ff',pos:{x:g[0],z:g[1]},gx:BL[F.k][0],gz:BL[F.k][1]})}
function build(){
  if(typeof CITY==='undefined'||!CITY.pois||!CITY.pois.length)return;
  wipe();myPlot=pick();buildBlock(Math.floor(myPlot/PER));
  var tt=tierNow(),F=frame(myPlot),door=F.W(14,(tt===3?22:24)-3);
  CITY.pois=CITY.pois.filter(function(p){return p.id!=='myhome'&&String(p.id).indexOf('bell')!==0});
  CITY.pois.push({id:'myhome',n:'My House',ic:'🏠',col:'#2fd6a0',pos:{x:door[0],z:door[1]},gx:BL[F.k][0],gz:BL[F.k][1]});
  CITY.myPlot=myPlot;parkDone=false;built=true;syncTier()}
function nearBlocks(){var out=[];BL.forEach(function(b,k){if(Math.hypot(bcx(b[0])-player.x,bcx(b[1])-player.z)<NEARD)out.push(k)});return out}
function poll(){var ks=nearBlocks().filter(function(k){return k>=1}).slice(0,6);if(!ks.length)return;
  api({act:'view',blocks:ks}).then(function(r){if(!r||!r.plots)return;var dirty={};Object.keys(r.plots).forEach(function(i){var o=OCC[i],n=r.plots[i];if(!o||o.n!==n.n||o.t!==n.t){OCC[i]=n;dirty[Math.floor(i/PER)]=1}});
    Object.keys(dirty).forEach(function(k){if(GR[k]){var g=GR[k];scene.remove(g);g.traverse(function(o){if(o.geometry)o.geometry.dispose()});delete GR[k];buildBlock(+k)}})})}
// pressing the door button walks you into your house
var _open=window.openPOI;
window.openPOI=function(id){if(String(id).indexOf('bell')===0){if(window.__visit)__visit.ring(+String(id).slice(4));return}if(id==='myhome'){if(typeof ACT!=='undefined'&&ACT.enterhome)ACT.enterhome();return}return _open.apply(this,arguments)};
// first time: park my cars in my two bays
function park(){
  if(parkDone||myPlot<0||!S.owned)return;var F=frame(myPlot),spots=[F.W(4,6.5),F.W(24,6.5)],any=false;
  S.owned.slice(0,2).forEach(function(o,i){var V=vehicles.find(function(v){return v.ownIdx===i});if(!V||V.driver)return;any=true;
    V.x=spots[i][0];V.z=spots[i][1];V.h=F.dir>0?Math.PI:0;V.speed=0;V.vx=V.vz=0;V.car.grp.position.set(V.x,V.y,V.z);V.car.grp.rotation.set(0,V.h,0)});
  parkDone=true}
setInterval(function(){if(window.__mode!=='play'||typeof CITY==='undefined')return;
  if(!CITY.pois.some(function(p){return p.id==='myhome'}))built=false;
  if(!built){build();return}
  nearBlocks().forEach(function(k){if(!GR[k])buildBlock(k)});
  if(!parkDone)park();
  claim();
  var n=Date.now();if(n-polled>40000){polled=n;poll()}},700);
window.__estate={build:function(){built=false;build()},plot:function(){return myPlot},frame:frame,occ:OCC,blocks:BL};
})();
