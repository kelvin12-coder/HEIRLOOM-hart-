/* ===== Heirloom characters v2: big-head cartoon people with clearly separate clothes (blouse, baggy jeans, button shirts, agbada...),
   many body shapes and hairstyles, toon shading + outline so every piece reads clearly ===== */
(function(){
'use strict';
if(typeof makeHuman!=='function'||typeof THREE==='undefined'||typeof GB==='undefined')return;
var T3=THREE;
/* ---- names for the wardrobe menus (old numbers keep their meaning so saves stay valid) ---- */
function setList(a,l){a.length=0;l.forEach(function(x){a.push(x)})}
setList(HAIRN,['Buzz','Afro','Long','Braids','Bald','Bun','Twists','Fade','Cornrows','Locs','Ponytail','Curly top']);
setList(TOPN,['T-shirt','Hoodie','Jacket','Shirt & tie','Dress','Tank','Blouse','Jersey','Agbada','Blazer','Crop top','Sweater','Button shirt']);
setList(BOTN,['Jeans','Shorts','Skirt','Slacks','Baggy jeans','Joggers','Cargo','Wrapper (iro)','Leggings','Long skirt']);
setList(SHOEN,['Sneakers','Boots','Heels','Sandals','Slides','High-tops']);
setList(HATN,['None','Cap','Beanie','Bucket','Fila','Gele (headwrap)','Headband','Fisherman hat']);
[{n:'Baggy Streetwear',p:60,ts:1,tc:'#ff8a3d',bs:4,bc:'#3a63a8'},{n:'Button-up & Slacks',p:70,ts:12,tc:'#5aa7ee',bs:3,bc:'#2a2a30'},{n:'Jersey & Joggers',p:55,ts:7,tc:'#10857a',bs:5,bc:'#1f1f24'},
 {n:'Naija Agbada (Royal Blue)',p:240,ts:8,tc:'#2a4bd7',bs:3,bc:'#2a4bd7'},{n:'Naija Agbada (White & Gold)',p:300,ts:8,tc:'#f3efe6',bs:3,bc:'#f3efe6'},{n:'Cargo Chill',p:65,ts:0,tc:'#6a8a3a',bs:6,bc:'#4a4a3a'},
 {n:'Blue Blazer',p:380,ts:9,tc:'#1d2f6a',bs:3,bc:'#1d2f6a'},{n:'Cosy Sweater',p:50,ts:11,tc:'#d9a520',bs:0,bc:'#2f4a7a'},
 {n:'Silk Blouse & Skirt',p:130,ts:6,tc:'#f08fb0',bs:2,bc:'#2a2a30',f:1},{n:'Ankara Wrapper Set',p:160,ts:6,tc:'#ff8a3d',bs:7,bc:'#10857a',f:1},{n:'Crop & Baggy',p:75,ts:10,tc:'#9b5de5',bs:4,bc:'#2a2a30',f:1},
 {n:'Long Skirt & Blouse',p:110,ts:6,tc:'#ffd23f',bs:9,bc:'#8a2a3a',f:1},{n:'Leggings & Tee',p:40,ts:0,tc:'#f2f2f2',bs:8,bc:'#1f1f24',f:1}].forEach(function(o){OUTFITS.push(o)});
/* ---- helpers ---- */
function C(h){return new T3.Color(h)}
function sh(h,k){var c=C(h);c.multiplyScalar(k);return'#'+c.getHexString()}
function li(h,k){var c=C(h);c.lerp(new T3.Color('#ffffff'),k);return'#'+c.getHexString()}
var GRAD=(function(){var c=document.createElement('canvas');c.width=4;c.height=1;var g=c.getContext('2d');['#6a6a74','#a8a8b4','#e2e2ea','#ffffff'].forEach(function(x,i){g.fillStyle=x;g.fillRect(i,0,1,1)});var t=new T3.CanvasTexture(c);t.minFilter=t.magFilter=T3.NearestFilter;return t})();
var TOON=new T3.MeshToonMaterial({vertexColors:true,gradientMap:GRAD,side:T3.DoubleSide}),OUTM=new T3.MeshBasicMaterial({color:0x14121a,side:T3.BackSide});
var OUTS=[];
function merge(H){var parts=[H.hips,H.torso,H.head];H.legs.forEach(function(l){parts.push(l.th,l.sh,l.ft)});H.arms.forEach(function(a){parts.push(a.sg,a.eg)});
  var stop=new Set(parts);stop.add(H.gun);if(H.xtra)H.xtra.forEach(function(x){stop.add(x)});if(H.live)H.live.forEach(function(x){stop.add(x)});
  parts.forEach(function(part){var gb=new GB(),dead=[];
    var rec=function(node,mx){node.children.forEach(function(ch){if(stop.has(ch))return;ch.updateMatrix();var m=mx.clone().multiply(ch.matrix);if(ch.isMesh){var c=ch.material.color;gb.geo(ch.geometry,m,[c.r,c.g,c.b]);dead.push(ch)}else if(ch.isGroup||ch.isObject3D)rec(ch,m)})};
    rec(part,new T3.Matrix4());
    var kill=function(node){node.children.slice().forEach(function(ch){if(stop.has(ch))return;if(ch.isMesh)node.remove(ch);else{kill(ch);if(!ch.children.length)node.remove(ch)}})};kill(part);
    if(gb.vc){var geo=gb.build(),mesh=new T3.Mesh(geo,TOON);mesh.castShadow=false;part.add(mesh);part.userData.merged=mesh;
      var og=geo.clone(),pa=og.attributes.position,na=og.attributes.normal;for(var i=0;i<pa.count;i++)pa.setXYZ(i,pa.getX(i)+na.getX(i)*.014,pa.getY(i)+na.getY(i)*.014,pa.getZ(i)+na.getZ(i)*.014);
      var om=new T3.Mesh(og,OUTM);om.visible=false;part.add(om);(H.outl=H.outl||[]).push(om)}});
  H.eyes=H.eyes||[{scale:{y:1}},{scale:{y:1}}]}
/* outlines only on people near the camera (keeps phones fast) */
setInterval(function(){if(typeof camera==='undefined')return;var cx=camera.position.x,cz=camera.position.z;
  (typeof peds!=='undefined'?peds:[]).forEach(function(p){if(!p.H||!p.H.outl)return;var d=Math.hypot(p.x-cx,p.z-cz),on=d<34;if(p.H._ol!==on){p.H._ol=on;p.H.outl.forEach(function(m){m.visible=on})}});
  if(typeof player!=='undefined'&&player.H&&player.H.outl){if(!player.H._ol){player.H._ol=1;player.H.outl.forEach(function(m){m.visible=true})}}},400);
/* ---- the builder ---- */
makeHuman=function(o){
  o=Object.assign({female:false,skin:2,hair:0,hairCol:1,ts:0,tc:'#e8e8e8',bs:0,bc:'#2f4a7a',shoe:0,shc:'#f4f4f4',hat:0,hatc:'#c22',shades:false,chain:false,build:1,h:1},o);
  var F=!!o.female,sk=SKINS[o.skin%SKINS.length],bld=o.build,ts=o.ts|0,bs=o.bs|0,belly=o.belly!==undefined?o.belly:Math.max(0,(bld-1.12)*.8);
  var root=new T3.Group(),H={root:root,o:o,parts:{},a:{phase:Math.random()*6,blink:2+Math.random()*3,down:0,punchT:0,hit:0,air:0,look:0,sway:Math.random()*6,aimT:0,smooth:0,run:0}};
  var body=new T3.Group();root.add(body);H.body=body;
  var hipW=F?.108:.095,sw=F?.185:.215;
  var skinM=mat(sk,.55),topM=mat(o.tc,.8),botM=mat(o.bc,.85),shoeM=mat(o.shc,.6);
  var TOPD=sh(o.tc,.72),TOPL=li(o.tc,.55),BOTD=sh(o.bc,.7),BOTL=li(o.bc,.45),HAIRC=HAIRCOL[o.hairCol%HAIRCOL.length];
  var darkM=mat('#15151a',.9),whiteM=mat('#f6f6f6',.5),goldM=mat('#e6b422',.3,.7);
  function add(g,geo,m,x,y,z,sx,sy,sz){var q=mesh(geo,m,x,y,z,sx,sy,sz);g.add(q);return q}
  function bx(g,col,x,y,z,w,h,d,r){return add(g,boxGeo,mat(col,.75),x,y,z,w,h,d)}
  function ball(g,col,x,y,z,r,sx,sy,sz){return add(g,sphGeo,mat(col,.7),x,y,z,r*(sx||1),r*(sy||1),r*(sz||1))}
  var hips=new T3.Group();hips.position.y=.93;body.add(hips);H.hips=hips;
  hips.add(mesh(capsule(.12,.1,3,8),botM,0,.04,0,F?1.55:1.4,.9,1.05));
  var longLeg=[0,3,4,5,6,8].indexOf(bs)>=0,showLegSkin=!longLeg;
  var thR=(F?.082:.088)*bld*({4:1.5,5:1.12,6:1.18,8:.92,0:1,3:1.03,1:1.05}[bs]||1),shR=(F?.062:.068)*bld*({4:1.55,5:1.0,6:1.15,8:.9,0:1,3:1.0,1:1}[bs]||1);
  var legs=[];
  [-1,1].forEach(function(s){
    var th=new T3.Group();th.position.set(s*hipW,0,0);hips.add(th);
    var thM=(longLeg||bs===1)?botM:skinM;
    add(th,capsule(thR,.34,4,10),thM,0,-.215,0,1,1,1);
    var sg=new T3.Group();sg.position.y=-.43;th.add(sg);
    add(sg,capsule(shR,.34,4,10),longLeg?botM:skinM,0,-.215,0,1,1,1);
    var ft=new T3.Group();ft.position.y=-.43;sg.add(ft);
    if(bs===1){bx(th,BOTL,0,-.4,0,thR*2.15,.035,thR*2.15)}                                  // short hem cuff
    if(bs===0||bs===4){ // jeans: stitched outer seam, knee wash, ankle cuff
      bx(th,BOTL,s*(thR+.003),-.2,0,.012,.5,.012);bx(th,BOTL,0,-.215,thR*.98,.012,.38,.012);
      if(bs===4){bx(th,li(o.bc,.22),0,-.42,thR*.95,thR*1.3,.12,.02);bx(sg,BOTL,0,-.36,0,shR*2.1,.06,shR*2.1)}else bx(sg,BOTL,0,-.38,0,shR*2.05,.04,shR*2.05)}
    if(bs===5){bx(th,'#f2f2f2',s*(thR+.004),-.2,0,.016,.62,.03);bx(sg,BOTL,0,-.38,0,shR*2.1,.07,shR*2.1);bx(sg,'#f2f2f2',s*(shR+.004),-.15,0,.016,.28,.03)} // joggers: side stripe + cuff
    if(bs===6){bx(th,BOTD,s*(thR+.02),-.12,0,.06,.15,.12);bx(th,li(o.bc,.15),s*(thR+.025),-.06,0,.065,.04,.125);bx(sg,BOTL,0,-.38,0,shR*2.05,.05,shR*2.05)} // cargo pockets
    if(bs===3){bx(th,li(o.bc,.3),0,-.215,thR*.99,.01,.62,.01)}                                // slacks crease
    // shoes
    var sc=o.shc,sl='#f6f6f6';
    if(o.shoe===0||o.shoe===5){var hi=o.shoe===5;add(ft,boxGeo,shoeM,0,-.05,.06,.1,.075,.28);bx(ft,sl,0,-.09,.06,.108,.03,.3);bx(ft,li(sc,.7),0,-.012,.12,.075,.02,.1);bx(ft,BOTL,0,-.008,.085,.07,.012,.02);if(hi){add(ft,boxGeo,shoeM,0,.03,-.01,.098,.12,.14);bx(ft,sl,0,.095,-.01,.1,.02,.14)}}
    else if(o.shoe===1){add(ft,boxGeo,shoeM,0,-.045,.055,.1,.09,.28);add(ft,boxGeo,shoeM,0,.05,-.01,.098,.2,.16);bx(ft,'#1a1a1a',0,-.09,.055,.108,.03,.3);bx(ft,sh(sc,.7),0,.15,-.01,.1,.03,.17)}
    else if(o.shoe===2){add(ft,boxGeo,shoeM,0,-.05,.04,.08,.05,.22);bx(ft,sh(sc,.6),0,-.1,-.05,.045,.09,.045);ball(ft,sc,0,-.03,.12,.05,1,.6,1.1)}
    else if(o.shoe===3){bx(ft,'#222',0,-.085,.06,.1,.02,.27);bx(ft,sc,0,-.04,.05,.1,.02,.03);bx(ft,sc,0,-.04,.12,.1,.02,.03);bx(ft,sc,0,-.04,.0,.1,.02,.03);add(ft,boxGeo,skinM,0,-.06,.1,.08,.035,.14)}
    else{add(ft,boxGeo,shoeM,0,-.06,.07,.11,.05,.3);bx(ft,sh(sc,.6),0,-.035,.14,.1,.03,.12)}
    legs.push({th:th,sh:sg,ft:ft,s:s})});
  H.legs=legs;
  /* ---- torso ---- */
  var torso=new T3.Group();torso.position.y=.06;hips.add(torso);H.torso=torso;
  var chestW=F?.88:1.08,fit=({1:1.12,2:1.1,7:1.02,8:1.0,9:1.06,11:1.1,12:1.02,3:1.0,4:1}[ts])||1;
  var topCovers=ts!==5&&ts!==10;
  var chestM=topCovers?topM:skinM;
  var chest=mesh(capsule(.15*bld,.22,5,12),(ts===5)?skinM:chestM,0,.3,0,chestW*(F?1:1.12)*fit,1,.78*(F?.95:1));torso.add(chest);
  var waistM=(ts===10)?skinM:(topCovers&&ts!==5?topM:skinM);
  var bellyK=1+belly*.9;
  function ringW(y,h,col,k){k=k||1;var r=(.125*bld+.012)*bellyK*k;return torso.add(mesh(new T3.CylinderGeometry(1,1,1,22),mat(col,.8),0,y,0,r*(F?.78:.92),h,r*.74))}
  function ringC(y,h,col,k){k=k||1;return torso.add(mesh(new T3.CylinderGeometry(1,1,1,22),mat(col,.8),0,y,0,.155*bld*chestW*(F?1:1.12)*k,h,.155*bld*.8*k))}
  var waist=mesh(capsule(.125*bld,.16,4,10),waistM,0,.08,.0,(F?.88:1.08)*bellyK,1,.8*bellyK);torso.add(waist);
  if(belly>.05)add(torso,sphGeo,(ts===10||ts===5)?skinM:topM,0,.03,.05,.13*bld*bellyK*(F?.85:1),.11*bld,.1*bld*bellyK);
  // tank: straps; crop: bare midriff
  if(ts===5){bx(torso,o.tc,-.075,.5,.03,.05,.16,.06);bx(torso,o.tc,.075,.5,.03,.05,.16,.06);chest.material=topM;chest.scale.set(chestW*.95,.8,.78);chest.position.y=.26;torso.add(mesh(boxGeo,topM,0,.1,.0,.3,.18,.2))}
  if(ts===10){chest.scale.set(chestW,.62,.78);chest.position.y=.34;bx(torso,TOPL,0,.265,.1,.28,.03,.06)}
  // collars, plackets, buttons, pockets, zips, hems
  function collarV(col){[-1,1].forEach(function(s){var c=bx(torso,col,s*.05,.52,.1,.07,.1,.03);c.rotation.z=-s*.5})}
  if(ts===0){torso.add(mesh(new T3.TorusGeometry(.075,.014,6,16),mat(TOPL,.8),0,.54,.05,1,1,1)).rotation.x=1.2;bx(torso,TOPL,.07,.4,.12,.07,.05,.01)}
  if(ts===1){ // hoodie: hood, pocket, cords, rib hem
    add(torso,capsule(.1,.14,3,8),topM,0,.57,-.08,1.9,.9,1);add(torso,capsule(.08,.1,3,8),mat(TOPD,.8),0,.57,-.02,1.2,.7,.8);
    bx(torso,TOPD,0,.14,.115,.2*bld+.14,.1,.04);bx(torso,'#f2f2f2',-.045,.42,.115,.012,.14,.012);bx(torso,'#f2f2f2',.045,.42,.115,.012,.14,.012);bx(torso,TOPD,0,.0,.0,.34*bld,.04,.22*bld);}
  if(ts===2){ // bomber: rib collar, zip, rib hem, pockets
    bx(torso,TOPD,0,.55,0,.2,.05,.15);bx(torso,'#e8e8e8',0,.3,.118,.012,.52,.01);ringW(-.0,.05,TOPD,1.03);bx(torso,TOPD,-.1,.12,.112,.09,.02,.01);bx(torso,TOPD,.1,.12,.112,.09,.02,.01);bx(torso,'#f2f2f2',0,.47,.1,.12,.12,.03)}
  if(ts===3||ts===12){ // button shirt: collar, placket + buttons, cuffs, pocket, tie
    collarV(li(o.tc,.5));bx(torso,sh(o.tc,.85),0,.3,.118,.03,.5,.01);for(var b=0;b<5;b++)ball(torso,'#f6f6f6',0,.46-b*.1,.122,.012);bx(torso,TOPD,.075,.4,.12,.07,.07,.01);
    if(ts===3){bx(torso,'#a31224',0,.38,.125,.035,.26,.012);ball(torso,'#a31224',0,.52,.12,.022,1,.9,.7)}}
  if(ts===4){ // dress: bodice seam + flared skirt + belt
    var sk2=mesh(new T3.CylinderGeometry(.16,.37,.55,18,1,true),topM,0,-.2,0);sk2.material=mat(o.tc,.8);sk2.material.side=T3.DoubleSide;torso.add(sk2);ringW(.07,.045,TOPD,1.03);bx(torso,TOPL,0,-.46,0,.0,.0,.0);
    var hem=new T3.Mesh(new T3.TorusGeometry(.37,.012,6,24),mat(TOPL,.8));hem.rotation.x=Math.PI/2;hem.position.y=-.47;torso.add(hem);bx(torso,TOPD,0,.52,.06,.18,.04,.1)}
  if(ts===6){ // blouse: ruffle collar + bow, puff, peplum
    var cr=new T3.Mesh(new T3.TorusGeometry(.085,.03,8,16),mat(TOPL,.8));cr.rotation.x=1.35;cr.position.set(0,.55,.03);torso.add(cr);ball(torso,TOPD,-.03,.5,.115,.03,1.2,.8,.6);ball(torso,TOPD,.03,.5,.115,.03,1.2,.8,.6);ball(torso,TOPD,0,.5,.12,.018);
    var pep=mesh(new T3.CylinderGeometry(.15,.24,.14,16,1,true),topM,0,-.04,0);pep.material=mat(o.tc,.8);pep.material.side=T3.DoubleSide;torso.add(pep);for(var b2=0;b2<4;b2++)ball(torso,'#f6f6f6',0,.42-b2*.09,.12,.01)}
  if(ts===7){ // jersey: V trim, number, stripes
    collarV(TOPL);bx(torso,TOPL,0,.3,.12,.16,.22,.01);bx(torso,TOPD,-.14,.3,0,.012,.5,.2);bx(torso,TOPD,.14,.3,0,.012,.5,.2);ringW(.0,.03,TOPL,1.03)}
  if(ts===8){ // agbada: long robe, gold embroidery
    var rb=mesh(new T3.CylinderGeometry(.17,.34,.95,18,1,true),topM,0,-.38,0);rb.material=mat(o.tc,.8);rb.material.side=T3.DoubleSide;torso.add(rb);
    bx(torso,'#e6b422',0,.3,.125,.045,.62,.01);bx(torso,'#e6b422',0,.58,.06,.2,.03,.1);bx(torso,'#e6b422',0,-.5,.31,.3,.03,.01);for(var e=0;e<4;e++){ball(torso,'#e6b422',0,.46-e*.14,.13,.016)}
    var hm=new T3.Mesh(new T3.TorusGeometry(.34,.012,6,24),mat('#e6b422',.4,.5));hm.rotation.x=Math.PI/2;hm.position.y=-.84;torso.add(hm)}
  if(ts===9){ // blazer: lapels, shirt, tie
    bx(torso,'#f6f6f6',0,.33,.112,.12,.5,.01);[-1,1].forEach(function(s){var l=bx(torso,TOPD,s*.07,.42,.12,.07,.22,.02);l.rotation.z=-s*.25;ball(torso,'#222',s*.05,.12+0,.125,.014)});bx(torso,'#222',0,.3,.125,.03,.3,.012);bx(torso,TOPL,.1,.38,.12,.07,.02,.01)}
  if(ts===11){ // sweater: rolled neck + stripe + rib hem
    torso.add(mesh(new T3.CylinderGeometry(.07,.08,.08,12),mat(TOPL,.9),0,.57,.01,1,1,1));ringC(.3,.045,TOPL,1.03);ringW(.0,.04,TOPD,1.03)}
  // belt for tucked tops
  if([3,12,9,5,10,6].indexOf(ts)>=0&&bs!==2&&bs!==7&&bs!==9){var bt=ringW(.02,.045,'#2a1a10',1.03);bx(torso,'#e6b422',0,.02,.11*bld*bellyK,.05,.04,.012)}
  else if(bs===0||bs===4||bs===6||bs===3){if(ts===0||ts===1||ts===2||ts===7||ts===11){ringW(-.0,.03,'#2a1a10',1.03)}}
  // skirts / wrapper
  if(bs===2){var sk=mesh(new T3.CylinderGeometry(.17,.33,.3,20,1,true),botM,0,-.1,0);sk.material=mat(o.bc,.8);sk.material.side=T3.DoubleSide;torso.add(sk);for(var p=0;p<10;p++){var a=p/10*6.283;bx(torso,BOTD,Math.sin(a)*.25,-.1,Math.cos(a)*.25,.012,.26,.012)}ringW(.03,.04,BOTD,1.03)}
  if(bs===9){var sk3=mesh(new T3.CylinderGeometry(.17,.3,.7,20,1,true),botM,0,-.3,0);sk3.material=mat(o.bc,.8);sk3.material.side=T3.DoubleSide;torso.add(sk3);ringW(.03,.04,BOTD,1.03);var h3=new T3.Mesh(new T3.TorusGeometry(.3,.01,6,24),mat(BOTL,.8));h3.rotation.x=Math.PI/2;h3.position.y=-.65;torso.add(h3)}
  if(bs===7){var wr=mesh(new T3.CylinderGeometry(.18,.3,.62,20,1,true),botM,0,-.27,0);wr.material=mat(o.bc,.8);wr.material.side=T3.DoubleSide;torso.add(wr);for(var q=0;q<6;q++){var a2=q/6*6.283;bx(torso,q%2?BOTL:o.tc,Math.sin(a2)*.245,-.27,Math.cos(a2)*.245,.05,.58,.012).rotation.y=a2}
    ball(torso,BOTL,.2,-.02,.14,.07,1,1,.8);ringW(.03,.04,BOTD,1.03)}
  if(F){torso.add(mesh(sphGeo,(ts===5||ts===10)?skinM:topM,.065,.39,.1,.075,.075,.075));torso.add(mesh(sphGeo,(ts===5||ts===10)?skinM:topM,-.065,.39,.1,.075,.075,.075))}
  if(o.chain){var tor=new T3.Mesh(new T3.TorusGeometry(.1,.014,6,16),goldM);tor.position.set(0,.46,.07);tor.rotation.x=1.2;torso.add(tor);ball(torso,'#e6b422',0,.37,.14,.03)}
  if(o.vest){ringC(.3,.46,'#2b2f35',1.03);bx(torso,'#3a4048',-.08,.22,.14,.08,.1,.04);bx(torso,'#3a4048',.08,.22,.14,.08,.1,.04);bx(torso,'#e6b422',0,.52,.05,.3,.02,.02)}
  if(o.pack){bx(torso,'#c0392b',0,.28,-.17,.26,.34,.12);bx(torso,'#8a2a20',0,.18,-.24,.2,.14,.04);bx(torso,'#222',-.1,.42,.05,.03,.2,.02);bx(torso,'#222',.1,.42,.05,.03,.2,.02)}
  /* ---- neck + head (big) ---- */
  add(torso,cylGeo,skinM,0,.545,.01,.055,.1,.055);
  var head=new T3.Group();head.position.set(0,.66,.01);torso.add(head);H.head=head;head.scale.setScalar(F?1.42:1.46);
  add(head,sphGeo,skinM,0,.04,0,.105,.125,.115);add(head,sphGeo,skinM,0,-.04,.03,.088,.088,.088);
  var ear=function(s){add(head,sphGeo,skinM,s*.106,.03,0,.016,.032,.02)};ear(-1);ear(1);
  var eyeCol=['#2a1a10','#3a2a18','#1d3a5a','#2d6a4f'][(o.skin*3+o.hair)%4];
  var live=!!o.live,liveParts=[];
  var eyes=[];
  [-1,1].forEach(function(s){var e=new T3.Group();e.position.set(s*.043,.052,.099);head.add(e);
    add(e,sphGeo,mat('#ffffff',.3),0,0,0,.027,.03,.013);add(e,sphGeo,mat(eyeCol,.3),0,-.002,.008,.017,.021,.007);add(e,sphGeo,mat('#050505',.3),0,-.002,.012,.009,.011,.005);add(e,sphGeo,mat('#ffffff',.2),.006,.007,.014,.004,.004,.003);
    var bw=bx(head,sh(HAIRC,.9),s*.043,.088,.106,.045,.008,.01);bw.rotation.z=s*(F?-.12:.06);
    if(F){bx(head,'#0a0a0a',s*.05,.072,.108,.03,.005,.008).rotation.z=s*-.4}});
  add(head,sphGeo,skinM,0,.018,.118,.015,.017,.017);
  var lipC=F?'#c2354f':sh(sk,.65);
  if(live){var mS=add(head,new T3.TorusGeometry(.03,.005,6,14,Math.PI),mat(lipC,.5),0,-.028,.108,1,1,1);mS.rotation.z=Math.PI;
    var mO=add(head,sphGeo,mat('#4a1018',.6),0,-.04,.108,.02,.026,.008);mO.visible=false;var mF=bx(head,lipC,0,-.04,.108,.045,.007,.008);mF.visible=false;liveParts=[mS,mO,mF];H.mouth={smile:mS,open:mO,flat:mF};
    H.setExpr=function(n){mS.visible=n==='smile';mO.visible=n==='open';mF.visible=n==='flat'}}
  else{var mS2=add(head,new T3.TorusGeometry(.03,.005,6,14,Math.PI),mat(lipC,.5),0,-.028,.108,1,1,1);mS2.rotation.z=Math.PI}
  if(F){ball(head,'#f09aa8',-.07,-.012,.1,.02,1,.7,.4);ball(head,'#f09aa8',.07,-.012,.1,.02,1,.7,.4)}
  if(o.beard){add(head,sphGeo,mat(HAIRC,.9),0,-.06,.07,.075,.06,.07);bx(head,HAIRC,0,-.012,.112,.07,.014,.01)}
  if(o.shades||ts===999){bx(head,'#0a0a0d',0,.055,.113,.125,.034,.02);bx(head,'#0a0a0d',-.062,.06,.07,.01,.01,.09);bx(head,'#0a0a0d',.062,.06,.07,.01,.01,.09)}
  if(o.mask){bx(head,'#d8e8f2',0,-.03,.11,.12,.075,.02);bx(head,'#9ab',-.07,.0,.07,.01,.01,.1);bx(head,'#9ab',.07,.0,.07,.01,.01,.1)}
  if(o.earring){ball(head,'#e6b422',-.112,.0,0,.012);ball(head,'#e6b422',.112,.0,0,.012)}
  /* ---- hair ---- */
  var hc=mat(HAIRC,.85),hs=o.hair|0;
  var capHair=function(){add(head,sphGeo,hc,0,.067,-.005,.113,.113,.122)};
  if(hs===0){capHair()}
  else if(hs===1){add(head,sphGeo,hc,0,.09,-.02,.185,.17,.18)}
  else if(hs===2){capHair();add(head,boxGeo,hc,0,-.1,-.075,.2,.34,.07);add(head,sphGeo,hc,0,-.26,-.08,.09,.06,.04);[-1,1].forEach(function(s){add(head,boxGeo,hc,s*.11,-.04,.0,.03,.22,.1)})}
  else if(hs===3){capHair();for(var k=-4;k<=4;k++){add(head,capsule(.014,.34,2,5),hc,k*.023,-.1,-.1,1,1,1);}[-1,1].forEach(function(s){for(var j=0;j<3;j++)add(head,capsule(.013,.28,2,5),hc,s*(.1+j*.004),-.06,-.02+j*.03,1,1,1)})}
  else if(hs===4){}
  else if(hs===5){capHair();add(head,sphGeo,hc,0,.2,-.04,.07,.07,.07)}
  else if(hs===6){add(head,sphGeo,hc,0,.07,-.01,.117,.11,.125);for(var t=0;t<11;t++){var a=t/11*6.283;var tw=add(head,capsule(.016,.1,2,5),hc,Math.cos(a)*.1,.13,Math.sin(a)*.1,1,1,1);tw.rotation.set(Math.sin(a)*.8,0,-Math.cos(a)*.8)}}
  else if(hs===7){add(head,sphGeo,hc,0,.065,-.005,.108,.1,.118);bx(head,'#0c0c0c',0,.105,.108,.1,.004,.01)}
  else if(hs===8){capHair();for(var r=-3;r<=3;r++)add(head,boxGeo,mat(sh(HAIRC,.6),.9),r*.028,.108+(3-Math.abs(r))*.0,-.005,.012,.012,.2)}
  else if(hs===9){capHair();for(var l=0;l<12;l++){var a3=l/12*6.283,lx=Math.cos(a3)*.105,lz=Math.sin(a3)*.105;add(head,capsule(.021,.16+(l%3)*.05,2,6),hc,lx,-.02,lz,1,1,1)}}
  else if(hs===10){capHair();add(head,sphGeo,hc,0,.03,-.13,.045,.05,.045);add(head,capsule(.03,.18,3,6),hc,0,-.1,-.15,1,1,1)}
  else if(hs===11){add(head,sphGeo,hc,0,.075,0,.116,.1,.122);for(var c1=0;c1<7;c1++){var a4=c1/7*6.283;ball(head,HAIRC,Math.cos(a4)*.07,.15,Math.sin(a4)*.07,.05)}}
  /* ---- hats ---- */
  var stopExtra=[];var hcol=o.hatc,hm2=mat(hcol,.8);
  if(o.hat===1){add(head,sphGeo,hm2,0,.1,0,.118,.085,.128);bx(head,sh(hcol,.8),0,.078,.145,.15,.012,.12);bx(head,li(hcol,.5),0,.11,.12,.04,.02,.01)}
  if(o.hat===2){add(head,sphGeo,hm2,0,.1,0,.118,.1,.125);bx(head,sh(hcol,.8),0,.045,0,.2,.035,.21);ball(head,li(hcol,.5),0,.2,0,.026)}
  if(o.hat===3){add(head,cylGeo,hm2,0,.13,0,.1,.07,.1);add(head,cylGeo,hm2,0,.098,0,.19,.012,.19);bx(head,sh(hcol,.6),0,.12,0,.205,.015,.205)}
  if(o.hat===4){add(head,cylGeo,hm2,0,.14,0,.098,.075,.098);bx(head,sh(hcol,.8),0,.215,0,.2,.012,.2);bx(head,'#e6b422',0,.15,.1,.18,.018,.01)}
  if(o.hat===5){var gm=mat(hcol,.7);add(head,sphGeo,gm,0,.12,0,.14,.1,.14);add(head,sphGeo,mat(li(hcol,.25),.7),.07,.2,.03,.1,.08,.1);add(head,sphGeo,mat(sh(hcol,.8),.7),-.07,.19,-.02,.1,.08,.1);var wing=bx(head,hcol,.17,.24,0,.2,.12,.04);wing.rotation.z=.5;bx(head,li(hcol,.4),0,.07,.1,.2,.015,.02)}
  if(o.hat===7&&window.HM){var fh=HM.make('fhat',1.18,0);fh.position.set(0,.125,0);head.add(fh);stopExtra.push(fh)}
  if(o.hat===6||o.bandana){bx(head,o.bandana?'#c0392b':hcol,0,.098,0,.235,.04,.24);if(o.bandana){bx(head,'#c0392b',-.12,.05,-.12,.05,.1,.03)}}
  /* ---- arms ---- */
  var arms=[];
  var longSl=[1,2,3,7,9,11,12,6].indexOf(ts)>=0,mid=ts===12||ts===6,noSl=ts===5||ts===4||ts===10;
  [-1,1].forEach(function(s){
    var sg=new T3.Group();sg.position.set(s*sw,.42,0);torso.add(sg);var aR=(F?.05:.058)*bld;
    var wide=ts===8?1.9:(ts===1||ts===2)?1.12:1;
    add(sg,sphGeo,noSl?skinM:topM,0,0,0,aR*1.28*wide,aR*1.28*wide,aR*1.28*wide);
    add(sg,capsule(aR*wide,.2,4,10),noSl?skinM:topM,0,-.14,0,1,1,1);
    if(ts===0||ts===7){bx(sg,ts===7?TOPL:TOPD,0,-.23,0,aR*2.3,.03,aR*2.3)}
    if(ts===6){ball(sg,o.tc,0,-.01,0,aR*1.9,1,1.1,1);bx(sg,TOPL,0,-.25,0,aR*2.1,.03,aR*2.1)}
    var eg=new T3.Group();eg.position.y=-.29;sg.add(eg);
    var fullSl=[1,2,3,9,11,12,7].indexOf(ts)>=0&&ts!==7&&ts!==12,roll=ts===12||ts===6;
    add(eg,capsule(aR*.88*wide,.2,4,10),(fullSl||ts===8)?topM:skinM,0,-.13,0,1,1,1);
    if(ts===8){add(eg,capsule(aR*1.6,.18,4,8),topM,0,-.13,0,1,1,1);bx(eg,'#e6b422',0,-.24,0,aR*3.4,.02,aR*3.4)}
    if(fullSl){bx(eg,ts===2||ts===1||ts===11?TOPD:li(o.tc,.5),0,-.235,0,aR*2.15,.04,aR*2.15)}
    if(roll){bx(eg,li(o.tc,.5),0,-.06,0,aR*2.2,.035,aR*2.2)}
    var hand=new T3.Group();hand.position.y=-.285;eg.add(hand);add(hand,sphGeo,o.gloves?mat('#1a1a1a',.7):skinM,0,-.02,0,.043,.052,.03);
    if(o.watch&&s===-1){bx(eg,'#e6b422',0,-.235,0,aR*2.3,.03,aR*2.3);ball(eg,'#fffbe0',0,-.235,aR*1.1,.016)}
    arms.push({sg:sg,eg:eg,hand:hand,s:s})});
  H.arms=arms;
  /* gun (hidden until drawn) */
  var gun=new T3.Group();{var bl=mat('#15171a',.35,.75),st=mat('#2b2e33',.3,.85),gr=mat('#0b0b0c',.8,.1),mt=mat('#9aa0a6',.25,.9);
    gun.add(mesh(boxGeo,st,0,.012,.09,.03,.034,.2));gun.add(mesh(boxGeo,bl,0,-.012,.085,.028,.026,.17));
    var mz=mesh(new T3.CylinderGeometry(.009,.009,.05,10),mt,0,.012,.205,1,1,1);mz.rotation.x=Math.PI/2;gun.add(mz);
    var grip=mesh(boxGeo,gr,0,-.06,.03,.03,.095,.045);grip.rotation.x=-.22;gun.add(grip);gun.add(mesh(boxGeo,bl,0,-.036,.062,.012,.012,.05));gun.add(mesh(boxGeo,mt,0,-.03,.075,.006,.018,.006));gun.add(mesh(boxGeo,mt,0,.033,.18,.008,.012,.008));gun.add(mesh(boxGeo,mt,0,.033,0,.02,.012,.008));gun.visible=false}
  arms[1].hand.add(gun);H.gun=gun;
  var mf=new T3.Mesh(new T3.SphereGeometry(.09,8,6),new T3.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.95,depthWrite:false,toneMapped:false}));mf.position.set(0,-.02,.26);mf.visible=false;gun.add(mf);
  H.live=liveParts;
  var sc=(F?.95:1)*o.h*(ts===8?1:1);root.scale.setScalar(sc);
  H.xtra=stopExtra;merge(H);return H};
/* player gets the animated face */
var obp=buildPlayerHuman;buildPlayerHuman=function(){var o=S.look;var had=o.live;o.live=true;try{return obp.apply(this,arguments)}finally{if(!had)delete o.live}};
/* laughing / angry faces when the player emotes */
setInterval(function(){var H=typeof player!=='undefined'&&player.H;if(!H||!H.setExpr)return;var e=H.a.emo&&H.a.emo.n;H.setExpr(e==='laugh'||e==='cheer'||e==='sing'?'open':e==='stomp'||e==='facepalm'||e==='taunt'?'flat':'smile')},250);
window.__chars={ok:true};
})();
