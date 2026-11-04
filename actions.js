/* ===== Heirloom actions: emotes, parkour climbing, people / car / place actions, bank + hotel fights, mountains ===== */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof ACT==='undefined'||typeof P==='undefined'||typeof S==='undefined')return;
function el(t,css,h){var e=document.createElement(t);if(css)e.style.cssText=css;if(h!==undefined)e.innerHTML=h;return e}
function fm(n){return typeof fmt==='function'?fmt(n):'$'+Math.round(n)}
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
/* ---------------- emotes: pose table, driven from animHuman ---------------- */
var sin=Math.sin,cos=Math.cos,PI=Math.PI;
var EMO={
  wave:{e:'👋',n:'Wave',f:function(C,t){C.AR[1]=-2.4;C.EL[1]=.5+sin(t*9)*.5;C.az=[.07,-.35]}},
  cheer:{e:'🙌',n:'Cheer',f:function(C,t){C.AR[0]=C.AR[1]=-2.7;C.EL[0]=C.EL[1]=.2;C.hipY=.9+Math.abs(sin(t*6))*.08;C.az=[.35,-.35]}},
  flex:{e:'💪',n:'Flex',f:function(C,t){C.AR[0]=C.AR[1]=-.2;C.EL[0]=C.EL[1]=2.1;C.az=[1.35,-1.35];C.leanX=-.05}},
  laugh:{e:'😂',n:'Laugh',f:function(C,t){C.leanX=.2+sin(t*14)*.1;C.AR[0]=C.AR[1]=.8;C.EL[0]=C.EL[1]=1.2;C.hipY=.92+sin(t*14)*.01}},
  facepalm:{e:'🤦',n:'Facepalm',f:function(C,t){C.AR[1]=-1.4;C.EL[1]=2.3;C.leanX=.25;C.az=[.07,.2]}},
  salute:{e:'🫡',n:'Salute',f:function(C,t){C.AR[1]=-1.3;C.EL[1]=2.4;C.az=[.07,-.5]}},
  shrug:{e:'🤷',n:'Shrug',f:function(C,t){C.AR[0]=C.AR[1]=.2;C.EL[0]=C.EL[1]=1.5;C.az=[.9,-.9];C.twist=sin(t*3)*.15}},
  clap:{e:'👏',n:'Clap',f:function(C,t){C.AR[0]=C.AR[1]=1.2;C.EL[0]=C.EL[1]=1.3+sin(t*14)*.35;C.az=[-.2,.2]}},
  stretch:{e:'🤸',n:'Stretch',f:function(C,t){C.AR[0]=C.AR[1]=-2.9;C.EL[0]=C.EL[1]=.1;C.leanX=-.25;C.az=[.2,-.2]}},
  bow:{e:'🙇',n:'Bow',f:function(C,t){C.leanX=1.1;C.AR[0]=C.AR[1]=.2;C.EL[0]=C.EL[1]=.3}},
  point:{e:'👉',n:'Point',f:function(C,t){C.AR[1]=1.55;C.EL[1]=0;C.twist=-.2}},
  think:{e:'🤔',n:'Think',f:function(C,t){C.AR[1]=-1;C.EL[1]=2.6;C.AR[0]=.3;C.EL[0]=1.9;C.leanX=.08;C.az=[-.6,.2]}},
  kick:{e:'🦵',n:'Kick',f:function(C,t){var k=Math.max(0,sin(t*7));C.L[1]=-1.6*k;C.K[1]=.2;C.leanX=-.15*k;C.AR[0]=-.8;C.AR[1]=.8}},
  spin:{e:'🌀',n:'Spin',f:function(C,t){C.twist=t*8%(2*PI);C.AR[0]=C.AR[1]=-1.2;C.az=[1.2,-1.2]}},
  sway:{e:'💃',n:'Hip sway',f:function(C,t){C.rollZ=sin(t*5)*.18;C.twist=sin(t*5)*.35;C.hipY=.9+Math.abs(sin(t*5))*.04;C.AR[0]=-.9+sin(t*5)*.5;C.AR[1]=-.9-sin(t*5)*.5;C.EL[0]=C.EL[1]=1}},
  taunt:{e:'😈',n:'Taunt',f:function(C,t){C.AR[0]=C.AR[1]=.4;C.EL[0]=C.EL[1]=1.4;C.az=[.8,-.8];C.leanX=.15;C.rollZ=sin(t*8)*.06}},
  stomp:{e:'🔥',n:'Angry stomp',f:function(C,t){C.L[0]=sin(t*10)>0?.5:0;C.L[1]=sin(t*10)<0?.5:0;C.AR[0]=C.AR[1]=.4;C.EL[0]=C.EL[1]=1.8;C.leanX=.1}},
  sleepy:{e:'🥱',n:'Yawn',f:function(C,t){C.AR[1]=-1.6;C.EL[1]=2.4;C.leanX=-.15+sin(t*2)*.05;C.AR[0]=.3;C.az=[.1,.1]}},
  pray:{e:'🙏',n:'Pray',f:function(C,t){C.AR[0]=C.AR[1]=-.9;C.EL[0]=C.EL[1]=2.4;C.leanX=.1;C.az=[-.35,.35]}},
  selfie:{e:'🤳',n:'Selfie',f:function(C,t){C.AR[1]=-1.2;C.EL[1]=1.2;C.leanX=-.05;C.az=[.07,-.2];C.AR[0]=.2}}};
EMO.preach={e:'🗣️',n:'Preach',f:function(C,t){C.AR[0]=-1.1+sin(t*2.2)*.6;C.AR[1]=-1.1-sin(t*2.2)*.6;C.EL[0]=C.EL[1]=.6;C.az=[.5,-.5];C.twist=sin(t*1.3)*.2}};
EMO.sing={e:'🎤',n:'Sing along',f:function(C,t){C.AR[0]=C.AR[1]=-2.3;C.EL[0]=C.EL[1]=.4;C.az=[.3+sin(t*3)*.2,-.3-sin(t*3)*.2];C.rollZ=sin(t*3)*.08;C.hipY=.92+Math.abs(sin(t*3))*.02}};
EMO.rukuk={e:'🙇',n:'Bow (rukuk)',f:function(C,t){C.leanX=1.4;C.AR[0]=C.AR[1]=.2;C.EL[0]=C.EL[1]=.1;C.az=[.05,-.05]}};
EMO.sujud={e:'🤲',n:'Prostrate',f:function(C,t){C.hipY=.3;C.leanX=1.55;C.L[0]=C.L[1]=1.75;C.K[0]=C.K[1]=2.5;C.AR[0]=C.AR[1]=1.0;C.EL[0]=C.EL[1]=1.3;C.az=[.2,-.2]}};
EMO.kneel={e:'🧎',n:'Sit (tashahhud)',f:function(C,t){C.hipY=.48;C.leanX=.05;C.L[0]=C.L[1]=1.45;C.K[0]=C.K[1]=2.4;C.AR[0]=C.AR[1]=.5;C.EL[0]=C.EL[1]=.3}};
window.__EMO=EMO;
window.__emoPose=function(emo,C){var E=EMO[emo.n];if(!E)return;var t=(Date.now()-emo.t0)/1000;E.f(C,t)};
function doEmote(n,secs){var H=player.H;if(!H||player.st!=='foot'||!EMO[n])return false;if(player.car)return false;H.a.emo={n:n,t0:Date.now(),end:Date.now()+(secs||3.5)*1000};return true}
ACT.emote=function(n){closeSheet();doEmote(n,4)};
setInterval(function(){var H=player.H;if(!H||!H.a.emo)return;if(Date.now()>H.a.emo.end||player.speedCur>.9||player.air||player.st!=='foot')H.a.emo=null},100);
/* ---------------- parkour: climb roofs, hop walls, backflip ---------------- */
function nearBox(){var best=null,bd=9,X=player.x,Z=player.z;colQuery(X,Z,2,colBoxes,function(c){var dx=Math.max(c.x0-X,0,X-c.x1),dz=Math.max(c.z0-Z,0,Z-c.z1),d=Math.hypot(dx,dz);if(d<1.4&&c.h>1.4&&c.h<=50&&c.h>player.y+.7&&d<bd){bd=d;best=c}});return best}
function doClimb(){var c=nearBox();if(!c){toast('Nothing to climb here — stand right next to a wall');return false}
  var w=c.x1-c.x0,d=c.z1-c.z0,tx=w>2.2?Math.min(Math.max(player.x,c.x0+1),c.x1-1):(c.x0+c.x1)/2,tz=d>2.2?Math.min(Math.max(player.z,c.z0+1),c.z1-1):(c.z0+c.z1)/2;
  player.climbing={x0:player.x,z0:player.z,x1:tx,z1:tz,y0:player.y,y1:c.h,t:0,d:.9+c.h*.09};player.h=Math.atan2(tx-player.x,tz-player.z);sfx.step&&sfx.step();
  toast(c.h>9?'🧗 Climbing up…':'🧗 Up you go');return true}
ACT.climb=function(){closeSheet();doClimb()};
ACT.flip=function(){closeSheet();if(player.air)return;player.vy=9.5;player.air=true;player.dj=true;player.H.a.flipT=.7;sfx.step&&sfx.step()};
/* ---------------- hospital bills: whoever shoots pays ---------------- */
var oph=pedHit;pedHit=function(p,fx,fz,pw){var was=p.state;oph.apply(this,arguments);
  if(was!=='down'&&p.state==='down'&&p.kind!=='cop'&&Math.abs(fx-player.x)<.1&&Math.abs(fz-player.z)<.1){var bill=Math.min(player.money,pw>=40?200:80);player.money-=bill;S.stats.spent+=bill;toast('🚑 Person rushed to hospital · you paid '+fm(bill))}};
/* ---------------- hostile guards inside buildings ---------------- */
var hostile=false,guards=[],hostT=0,downList=[];
function rel(n){var o=__kit.org();return o?{x:o.x+n.x,z:o.z+n.z}:{x:0,z:0}}
function alarm(msg){var K=__kit;if(!K.inside())return;var cur=K.cur();guards=K.npcs().filter(function(n){return/Security|Doorman|Bellhop/.test(n.name||'')});
  if(!guards.length)return;if(!hostile){hostile=true;window.__hostile=true;toast(msg||'🚨 Security is coming for you!');banner('🚨 ALARM','Guards are after you',2600,'#ff5468');try{setWanted(Math.max(wanted,2))}catch(e){}}
  guards.forEach(function(n){n.hostile=1;n.hp=n.hp||3;n.face=0;if(cur&&cur.id==='bank'&&n.x!==undefined&&Math.abs(n.z)>60){}});
  // upstairs: guards arrive by lift after a moment
  if(cur&&cur.id==='bank'&&__kit.org()&&(player.z-__kit.org().z)>60){setTimeout(function(){guards.forEach(function(n,i){if(n.dead)return;n.x=-3+i*6;n.z=194;if(n.H)n.H.root.position.set(n.x,100,n.z)});toast('🛗 Guards come out of the lift!')},3500)}}
function calm(){hostile=false;window.__hostile=false;guards.forEach(function(n){n.hostile=0;n.sp=0});guards=[]}
setInterval(function(){
  if(!__kit.inside()){if(hostile)calm();return}
  if(!hostile)return;var dt=.06,alive=0;
  guards.forEach(function(n){if(n.dead||!n.H)return;if(n.st==='down'){n.sp=0;n.dt=(n.dt||0)+dt;if(n.dt>6&&!n.dead){n.dead=1;n.H.root.visible=false;if(n.label)n.label.visible=false;var b=Math.min(player.money,250);player.money-=b;S.stats.spent+=b;toast('🚑 '+(n.name||'Guard')+' rushed to hospital · you paid '+fm(b))}return}
    alive++;var o=__kit.org(),px=player.x-o.x,pz=player.z-o.z,dx=px-n.x,dz=pz-n.z,d=Math.hypot(dx,dz);
    if(d>1.3){var sp=3.4;n.x+=dx/d*sp*dt;n.z+=dz/d*sp*dt;n.sp=sp;n.H.root.position.set(n.x,100,n.z)}else{n.sp=0;n.hitT=(n.hitT||0)-dt;if(n.hitT<=0){n.hitT=1.1;n.H.a.punchT=1;n.H.a.punchSide=!n.H.a.punchSide;hurtPlayer(7,'guard');try{sfx.punch()}catch(e){}}}
    n.H.root.rotation.y=Math.atan2(dx,dz)});
  if(!alive&&guards.length){toast('😮‍💨 The guards are down. Time to go!');}
},60);
function hitGuards(range,cone,fromGun){if(!hostile||!__kit.inside())return;var o=__kit.org(),f=[Math.sin(player.h),Math.cos(player.h)];
  guards.forEach(function(n){if(n.dead||n.st==='down')return;var dx=o.x+n.x-player.x,dz=o.z+n.z-player.z,d=Math.hypot(dx,dz);if(d>range)return;if(fromGun){var dir=new THREE.Vector3();camera.getWorldDirection(dir);var t=dx*dir.x+dz*dir.z;if(t<.5)return;var lat=Math.abs(dx*dir.z-dz*dir.x)/Math.hypot(dir.x,dir.z);if(lat>.9)return}else if((dx*f[0]+dz*f[1])/d<cone)return;
    n.hp=(n.hp||3)-(fromGun?3:1);try{sparks&&sparks(o.x+n.x,101.3,o.z+n.z,3)}catch(e){}if(n.hp<=0){n.st='down';n.sp=0;n.H.a.down=0;addXP&&addXP(30)}})}
var oatk=attackAction;attackAction=function(){var r=oatk.apply(this,arguments);hitGuards(2,.3,false);return r};
var osh=shoot;shoot=function(){var r=osh.apply(this,arguments);hitGuards(45,0,true);return r};
function slapNpc(n,msg){var H=player.H;if(H){H.a.punchT=1;H.a.punchSide=!H.a.punchSide}try{sfx.punch()}catch(e){}if(n&&n.H)n.H.a.hit=1;toast(msg||'👋 SLAP!');alarm('🚨 You slapped '+(n&&n.name||'someone')+' — security is coming!')}
/* ---------------- targets ---------------- */
function nearPed(){var b=null,bd=4.5;peds.forEach(function(p){if(p.state==='down'||p.rm)return;var d=Math.hypot(p.x-player.x,p.z-player.z);if(d<bd){bd=d;b=p}});return b}
function nearCar(){if(player.car)return null;var b=null,bd=6;vehicles.forEach(function(V){var d=Math.hypot(V.x-player.x,V.z-player.z);if(d<bd){bd=d;b=V}});return b}
function nearPoi(){var b=null,bd=48;((CITY&&CITY.pois)||[]).forEach(function(p){if(/^bell/.test(p.id))return;var d=Math.hypot(p.pos.x-player.x,p.pos.z-player.z);if(d<bd){bd=d;b=p}});return b}
function inNpc(re){if(!__kit.inside())return null;var o=__kit.org(),b=null,bd=5;__kit.npcs().forEach(function(n){if(n.dead||!re.test(n.name||''))return;var d=Math.hypot(o.x+n.x-player.x,o.z+n.z-player.z);if(d<bd){bd=d;b=n}});return b}
function kitId(){return __kit.inside()&&__kit.cur()?__kit.cur().id:''}
/* ---------------- the action registry ---------------- */
var AC=[];function A(g,e,n,when,run,sub){AC.push({g:g,e:e,n:n,when:when,run:run,sub:sub||''})}
function stat2(k,v){try{stat(k,v)}catch(x){}}
// --- people ---
A('👥 People','👋','Wave',function(c){return c.ped},function(c){doEmote('wave');toast('👋 '+rnd(['Hey!','Good day!','How far?']))});
A('👥 People','🤝','High five',function(c){return c.ped},function(c){doEmote('cheer',2);stat2('fn',6);toast('🤝 High five!')});
A('👥 People','🤗','Hug',function(c){return c.ped},function(c){stat2('fn',10);toast('🤗 Warm hug · +10 fun')});
A('👥 People','💵','Tip $20',function(c){return c.ped},function(c){if(spend(20)){addXP&&addXP(5);toast('💵 "God bless you!"')}});
A('👥 People','👋💢','Slap',function(c){return c.ped},function(c){var H=player.H;H.a.punchT=1;sfx.punch&&sfx.punch();pedHit(c.ped,player.x,player.z,16);addHeat(.6)},'raises your heat');
A('👥 People','🥊','Punch',function(c){return c.ped},function(c){attackAction()});
A('👥 People','🫸','Shove',function(c){return c.ped},function(c){pedHit(c.ped,player.x,player.z,6);addHeat(.3)});
A('👥 People','😈','Taunt',function(c){return c.ped},function(c){doEmote('taunt');if(c.ped.tough){c.ped.state='fight'}});
A('👥 People','🗺️','Ask for directions',function(c){return c.ped},function(c){var p=rnd(CITY.pois.filter(function(q){return!/^bell|^myhome$/.test(q.id)}));if(typeof setGPS==='function')setGPS(p.pos.x,p.pos.z,p.n);toast('🗺️ "Go to '+p.n+'" — GPS set')});
A('👥 People','🤳','Selfie with them',function(c){return c.ped},function(c){doEmote('selfie');stat2('fn',8);toast('🤳 Nice picture!')});
// --- cars ---
A('🚗 Cars','🦶','Kick the car',function(c){return c.car&&c.car.driver!=='player'},function(c){c.car.hp-=6;doEmote('kick',1.5);sparks&&sparks(c.car.x,c.car.y+.8,c.car.z,4);if(c.car.mode==='parked')c.car.alarm=1;addHeat(.3)},'dents it, may set off alarm');
A('🚗 Cars','🔨','Smash the windows',function(c){return c.car&&c.car.driver!=='player'},function(c){c.car.hp-=14;sparks&&sparks(c.car.x,c.car.y+1,c.car.z,8);sfx.thud&&sfx.thud();if(c.car.mode==='parked')c.car.alarm=1;addHeat(.7)});
A('🚗 Cars','🚪','Open the door & drag the driver out',function(c){return c.car&&c.car.driver==='npc'},function(c){var V=c.car;closeSheet();V.driver=null;V.mode='parked';var b=Math.min(player.money,150);player.money-=b;S.stats.spent+=b;toast('🚑 Driver rushed to hospital · you paid '+fm(b));addHeat(2);try{wantedBoost(2)}catch(e){}enterVehicle(V)},'carjack · police will chase you');
A('🚗 Cars','🔓','Break in & steal parked car',function(c){return c.car&&c.car.mode==='parked'&&!c.car.driver},function(c){var V=c.car;closeSheet();if(Math.random()<.65){toast('🔓 Got it open!');addHeat(1);enterVehicle(V)}else{V.alarm=1;addHeat(1.2);toast('🚨 Alarm! Run!')}},'35% chance of an alarm');
A('🚗 Cars','🧰','Strip parts for cash',function(c){return c.car&&c.car.hp<45&&c.car.driver!=='player'},function(c){c.car.hp=0;addMoney(90);addXP&&addXP(10);toast('🧰 Sold the parts · +$90')});
A('🚗 Cars','📯','Honk and wave',function(c){return c.car},function(c){doEmote('wave',2);sfx.horn&&sfx.horn()});
// --- parkour (anywhere) ---
A('🧗 Parkour','🧗','Climb up the wall / roof',function(c){return c.box},function(c){doClimb()},'rooftops, walls, compounds');
A('🧗 Parkour','🤸','Backflip',function(c){return true},function(c){ACT.flip()});
A('🧗 Parkour','🏃','Parkour tip',function(c){return true},function(c){toast('Tap jump twice to flip in the air · stand next to a building and tap Climb')});
// --- emotes ---
Object.keys(EMO).forEach(function(k){A('🎭 Emotes',EMO[k].e,EMO[k].n,function(){return true},function(){doEmote(k)})});
// --- places ---
function place(id,list){list.forEach(function(x){A(x[0],x[1],x[2],function(c){return c.poi&&c.poi.id===id&&!c.kit},x[3],x[4])})}
place('park',[['🌳 Central Park','🏃','Jog a lap',function(){stat2('fn',12);stat2('fd',-8);stat2('en',-6);addXP&&addXP(10);toast('🏃 Lap done · +12 fun')}],['🌳 Central Park','🧘','Yoga',function(){stat2('en',22);stat2('fn',6);toast('🧘 Calm and strong')}],['🌳 Central Park','🏀','Street basketball',function(){stat2('fn',15);stat2('en',-10);addXP&&addXP(15);toast('🏀 Swish!')}],['🌳 Central Park','💪','Pull-ups',function(){stat2('en',-8);addXP&&addXP(18);toast('💪 20 pull-ups')}],['🌳 Central Park','🎶','Listen to the street band',function(){stat2('fn',10);toast('🎶 Great vibes')}],['🌳 Central Park','🎈','Buy a balloon · $4',function(){if(spend(4)){stat2('fn',5);toast('🎈 Balloon!')}}]]);
place('beach',[['🏖️ Beach','🏊','Swim',function(){stat2('fn',14);stat2('en',-10);toast('🏊 Splash!')}],['🏖️ Beach','🏐','Beach volleyball',function(){stat2('fn',16);addXP&&addXP(12);toast('🏐 Spike!')}],['🏖️ Beach','🏰','Build a sandcastle',function(){stat2('fn',10);toast('🏰 Looks great')}],['🏖️ Beach','🍹','Coconut drink · $8',function(){if(spend(8)){stat2('fn',8);stat2('fd',6);toast('🍹 Refreshing')}}],['🏖️ Beach','🌅','Watch the sunset',function(){stat2('fn',12);stat2('en',8);toast('🌅 Beautiful')}],['🏖️ Beach','🛟','Rent a jet ski · $60',function(){if(spend(60)){stat2('fn',30);toast('🛟 Wheee!')}}]]);
place('club',[['🪩 Night Club','💃','Dance on the floor',function(){player.dancing=true;closeSheet();stat2('fn',15)}],['🪩 Night Club','🍸','Order a drink · $15',function(){if(spend(15)){stat2('fn',10);toast('🍸 Cheers')}}],['🪩 Night Club','🍾','Bottle service · $200',function(){if(spend(200)){stat2('fn',60);addXP&&addXP(40);toast('🍾 VIP vibes!')}}],['🪩 Night Club','🎤','Tip the DJ · $30',function(){if(spend(30)){stat2('fn',12);toast('🎧 DJ shouts you out')}}],['🪩 Night Club','🤝','Meet someone',function(){stat2('fn',8);toast('💬 You swap numbers')}]]);
place('rest',[['🍽️ Restaurant','🍛','Order jollof · $18',function(){if(spend(18)){stat2('fd',45);toast('🍛 Delicious')}}],['🍽️ Restaurant','🧽','Wash dishes (earn $40)',function(){addMoney(40);stat2('en',-8);toast('🧽 Shift done')}],['🍽️ Restaurant','🗣️','Complain to the manager',function(){stat2('fn',4);toast('😅 "Sorry sir, next meal is on us"');}],['🍽️ Restaurant','🎂','Celebrate a birthday · $60',function(){if(spend(60)){stat2('fn',35);toast('🎂 Happy birthday!')}}]]);
place('mall',[['🛍️ Mall','🛍️','Window shopping',function(){stat2('fn',6);toast('🛍️ Nice stuff')}],['🛍️ Mall','🛗','Ride the escalator',function(){stat2('fn',3);toast('⬆️ Up and down')}],['🛍️ Mall','🧋','Boba tea · $6',function(){if(spend(6)){stat2('fn',6);stat2('fd',8);toast('🧋 Yum')}}],['🛍️ Mall','🎁','Buy a gift · $40',function(){if(spend(40)){addXP&&addXP(20);toast('🎁 Wrapped nicely')}}]]);
place('hosp',[['🏥 Hospital','🩸','Donate blood (+$30)',function(){addMoney(30);stat2('en',-10);addXP&&addXP(15);toast('🩸 Thank you, hero')}],['🏥 Hospital','💐','Visit a sick friend',function(){stat2('fn',6);addXP&&addXP(8);toast('💐 They smiled')}],['🏥 Hospital','🍼','Visit the nursery',function(){stat2('fn',8);toast('🍼 So cute')}]]);
place('police',[['🚓 Police','📝','Report a crime',function(){toast('📝 "We will look into it"')}],['🚓 Police','🏷️','Ask about a gun licence',function(){toast('🔫 Buy weapons in the weapons shop (phone)')}],['🚓 Police','🍩','Chat with the officers',function(){stat2('fn',4);toast('🍩 Officer: "Stay out of trouble"')}]]);
place('air',[['✈️ Airport','🧳','Check in luggage',function(){toast('🧳 Bags checked')}],['✈️ Airport','🛃','Duty-free shop · $50',function(){if(spend(50)){stat2('fn',10);toast('🛃 Perfume!')}}],['✈️ Airport','☕','Airport coffee · $7',function(){if(spend(7)){stat2('en',12);toast('☕ Boarding fuel')}}],['✈️ Airport','🛫','Watch planes take off',function(){stat2('fn',5);toast('🛫 Wow')}]]);
place('arena',[['🥊 Fight Arena','🥊','Shadow box',function(){stat2('en',-6);addXP&&addXP(14);toast('🥊 Jab jab cross')}],['🥊 Fight Arena','🎟️','Buy a ringside seat · $30',function(){if(spend(30)){stat2('fn',14);toast('🎟️ Great seat')}}],['🥊 Fight Arena','🏋️','Use the gym',function(){stat2('en',-10);addXP&&addXP(20);toast('🏋️ Pump!')}]]);
place('speed',[['🏁 Circuit','🏁','Watch the pit stop',function(){stat2('fn',6);toast('🏁 Fast hands')}],['🏁 Circuit','🍟','Trackside snacks · $10',function(){if(spend(10)){stat2('fd',20);toast('🍟 Crunchy')}}]]);
place('drift',[['🌀 Drift Park','🛞','Pick up tyre smoke souvenir · $12',function(){if(spend(12)){stat2('fn',6);toast('🛞 Cool souvenir')}}],['🌀 Drift Park','📣','Cheer the drifters',function(){doEmote('cheer')}]]);
place('land',[['🗼 Landmark','📸','Tourist photo',function(){doEmote('selfie');stat2('fn',8)}],['🗼 Landmark','🎫','Buy a ticket to the top · $15',function(){if(spend(15)){stat2('fn',10);toast('🎫 Amazing view')}}]]);
place('deal',[['🚘 Car Dealer','🔍','Test drive vibes',function(){toast('🚘 Look at the showroom for real test drives')}],['🚘 Car Dealer','🧽','Wash a car (earn $25)',function(){addMoney(25);toast('🧽 Squeaky clean')}]]);
place('home',[['🏠 Home','🛋️','Rest on the couch',function(){stat2('en',10);toast('🛋️ Ahh')}],['🏠 Home','📞','Call a friend',function(){stat2('fn',6);toast('📞 Long chat')}],['🏠 Home','🧹','Clean the house',function(){addXP&&addXP(8);stat2('fn',3);toast('🧹 Spotless')}]]);
// --- bank (inside) ---
function inK(id,re){return function(c){return c.kit===id&&(!re||c.near&&re.test(c.near.name||''))}}
A('🏦 Bank','👋💢','Slap the manager',function(c){return c.kit==='bank'&&inNpc(/Mr\. Adewale|Manager|Officer/)},function(c){closeSheet();slapNpc(inNpc(/Mr\. Adewale|Manager|Officer/),'👋 You slapped the manager!')},'security will come for you');
A('🏦 Bank','💣','Rob the cashier (need a gun)',function(c){return c.kit==='bank'&&inNpc(/Cashier/)},function(c){closeSheet();if(!player.weapon){toast('🔫 You need a gun — press the weapon button first');return}var n=inNpc(/Cashier/),loot=1500+Math.floor(Math.random()*4500);addMoney(loot);toast('💰 You grabbed '+fm(loot)+'!');slapNpc(n,'🔫 Hands up!');alarm('🚨 Robbery! Security is coming!');try{setWanted(3)}catch(e){}},'big cash · 3-star wanted');
A('🏦 Bank','😤','Argue with a cashier',function(c){return c.kit==='bank'&&inNpc(/Cashier/)},function(c){doEmote('stomp');toast('😤 "Sir, please calm down"')});
A('🏦 Bank','🤝','Greet the security guard',function(c){return c.kit==='bank'&&inNpc(/Security/)},function(c){doEmote('salute');toast('🫡 "Welcome sir"')});
A('🏦 Bank','👋💢','Slap the security guard',function(c){return c.kit==='bank'&&inNpc(/Security/)},function(c){closeSheet();slapNpc(inNpc(/Security/),'👋 You slapped a guard!')},'starts a fight');
A('🏦 Bank','☕','Chat with the barista',function(c){return c.kit==='bank'&&inNpc(/Barista/)},function(c){stat2('fn',5);toast('☕ "Fresh coffee, boss?"')});
// --- hotel (inside) ---
A('🏨 Hotel','👋💢','Slap the doorman',function(c){return c.kit==='hotel'&&inNpc(/Doorman|Bellhop/)},function(c){closeSheet();slapNpc(inNpc(/Doorman|Bellhop/),'👋 You slapped the doorman!')},'starts a fight');
A('🏨 Hotel','🛎️','Ring the reception bell',function(c){return c.kit==='hotel'&&inNpc(/Reception/)},function(c){toast('🛎️ DING!')});
A('🏨 Hotel','🎩','Tip the bellhop · $10',function(c){return c.kit==='hotel'&&inNpc(/Bellhop/)},function(c){if(spend(10)){toast('🎩 "Thank you sir!"')}});
// --- generic extras ---
A('🎬 Anywhere','🎮','Play a mobile game',function(){return true},function(){stat2('fn',6);toast('🎮 Level up!')});
A('🎬 Anywhere','📞','Call your mum',function(){return true},function(){stat2('fn',6);toast('📞 "Eat well, my child"')});
A('🎬 Anywhere','🛠️','Stretch before the day',function(){return true},function(){doEmote('stretch')});
/* ---------------- the menu ---------------- */
function ctx(){var poi=nearPoi(),c={ped:nearPed(),car:nearCar(),poi:poi,kit:kitId(),box:null};if(!c.kit)c.box=nearBox();return c}
P.actions=function(a){var c=ctx(),groups={},order=[];AC.forEach(function(x,i){var ok=false;try{ok=x.when(c)}catch(e){}if(!ok)return;if(!groups[x.g]){groups[x.g]=[];order.push(x.g)}groups[x.g].push(i)});
  var pri=['🏦 Bank','🏨 Hotel','👥 People','🚗 Cars','🧗 Parkour'];order.sort(function(p,q){var a1=pri.indexOf(p),b1=pri.indexOf(q);if(a1<0)a1=50;if(b1<0)b1=50;return a1-b1});
  var tab=a&&a.all?1:0,html=hd('🎬 Actions',AC.length+' things to do · what is near you shows first');
  var place=c.kit?'inside '+c.kit:c.poi?'near '+c.poi.n:'out on the street';html+='<div class="cap">You are '+place+(c.ped?' · 👥 someone is next to you':'')+(c.car?' · 🚗 a car is next to you':'')+'</div>';
  order.forEach(function(g){html+='<div class="cap" style="margin:10px 0 4px"><b>'+g+'</b></div><div class="grid g2">'+groups[g].map(function(i){var x=AC[i];return'<button class="tile" data-a="doact" data-v="'+i+'"><span class="em">'+x.e+'</span><b style="font-size:12px">'+x.n+'</b>'+(x.sub?'<em>'+x.sub+'</em>':'')+'</button>'}).join('')+'</div>'});
  return{h:html}};
ACT.doact=function(i){var x=AC[+i];if(!x)return;var c=ctx();var was=cur;try{x.run(c)}catch(e){console.error(e)}
  if(x.g==='🎭 Emotes'||/^(Wave|High five|Hug|Selfie|Taunt)/.test(x.n))closeSheet()};
/* floating button */
var btn=el('button','position:fixed;left:10px;bottom:calc(172px + env(safe-area-inset-bottom,0px));z-index:29;width:52px;height:52px;border-radius:16px;border:1px solid #fff5;background:rgba(10,14,24,.78);color:#fff;font:700 24px system-ui;display:none;align-items:center;justify-content:center','🎬');
btn.onclick=function(e){e.stopPropagation();show('actions',{})};document.body.appendChild(btn);
setInterval(function(){var on=window.__mode==='play'&&player.st==='foot'&&!UILOCK&&!player.climbing;btn.style.display=on?'flex':'none'},300);
/* ---------------- mountains: summit flags ---------------- */
var peaks=[];
function findPeaks(){var best=[];for(var x=-3000;x<=3000;x+=60)for(var z=-3000;z<=3000;z+=60){var d=Math.hypot(Math.max(Math.abs(x)-(HALF+34),0),Math.max(Math.abs(z)-(HALF+34),0));if(d<250)continue;var n=(z-x)/1.414/Math.max(1,Math.hypot(x,z));if(n>-.1)continue;var h=terrMeshH(x,z);if(h<110)continue;
    var loc=true;for(var dx=-1;dx<=1&&loc;dx++)for(var dz=-1;dz<=1;dz++){if((dx||dz)&&terrMeshH(x+dx*60,z+dz*60)>h)loc=false}if(loc)best.push({x:x,z:z,h:h})}
  best.sort(function(a,b){return b.h-a.h});var out=[];best.forEach(function(p){if(out.length<4&&out.every(function(q){return Math.hypot(q.x-p.x,q.z-p.z)>500}))out.push(p)});return out}
function flagMesh(x,y,z){var g=new THREE.Group();var pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,7,8),new THREE.MeshStandardMaterial({color:0xdddddd}));pole.position.y=3.5;g.add(pole);
  [0x008751,0xffffff,0x008751].forEach(function(c,i){var f=new THREE.Mesh(new THREE.BoxGeometry(1.1,2.2,.05),new THREE.MeshBasicMaterial({color:c}));f.position.set(.55+i*1.1,6,0);g.add(f)});
  var beam=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,60,12,1,true),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.28,depthWrite:false,toneMapped:false}));beam.position.y=30;g.add(beam);g.position.set(x,y,z);return g}
function setupPeaks(){if(peaks.length||typeof terrMeshH!=='function'||typeof scene==='undefined')return;peaks=findPeaks();if(!S.summits)S.summits={};
  peaks.forEach(function(p,i){p.id='peak'+i;p.name=['Mount Heirloom','Eagle Ridge','Sunrise Peak','Thunder Hill'][i]||'Peak '+(i+1);p.mesh=flagMesh(p.x,p.h,p.z);scene.add(p.mesh)});
  window.__peaks=peaks}
setInterval(function(){if(window.__mode!=='play'||typeof CITY==='undefined'||!CITY.pois||!CITY.pois.length)return;try{setupPeaks()}catch(e){}
  peaks.forEach(function(p){if(S.summits&&S.summits[p.id])return;if(Math.hypot(player.x-p.x,player.z-p.z)<9&&player.y>p.h-6){var r=Math.round(2000+p.h*30);S.summits[p.id]=1;addMoney(r);addXP&&addXP(120);banner('⛰️ SUMMIT!',p.name+' · '+Math.round(p.h)+' m · +'+fm(r),3500,'#ffd23f');doEmote('cheer',4);saveGame()}})},700);
ACT.peaks=function(){closeSheet();if(!peaks.length){toast('Mountains still loading');return}var p=peaks[0];if(typeof setGPS==='function')setGPS(p.x,p.z,p.name);toast('⛰️ GPS set to '+p.name+' ('+Math.round(p.h)+' m)')};
A('⛰️ Mountains','⛰️','Set GPS to the highest peak',function(){return true},function(){ACT.peaks()},'climb it for cash');
A('⛰️ Mountains','🚩','Peaks conquered',function(){return true},function(){var n=Object.keys(S.summits||{}).length;toast('🚩 '+n+' of '+(peaks.length||4)+' summits reached')});
window.__actions={AC:AC,EMO:EMO,doClimb:doClimb,alarm:alarm,peaks:function(){return peaks}};
})();
