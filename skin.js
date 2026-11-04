/* ===== Heirloom skins: real Poly Haven photo textures (CC0) put on furniture, seats, carpets, floors by colour ===== */
(function(){
'use strict';
if(typeof THREE==='undefined')return;
var T=THREE,cache={},L=new T.TextureLoader();
var MAP={'#5a3a22':'wood','#6a4528':'wood','#4a2f1b':'wood','#5b3a29':'wood','#4a2e20':'wood','#8a4b1f':'wood','#6e3414':'wood','#6a3e22':'wood','#8d6a42':'wood',
 '#b78a5a':'maple','#7a4a2a':'leather','#8b1a22':'velvet','#2a4a6a':'velvet','#2a2321':'fabric','#8a6a4a':'leatherw'};
function tex(n,rep){var t=cache[n];if(!t){t=L.load('assets/t/'+n+'.jpg');t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(T.SRGBColorSpace)t.colorSpace=T.SRGBColorSpace;cache[n]=t}return t}
window.SKIN={tex:tex,
 /* give a material a photo texture; the colour tints it so each item keeps its own shade */
 put:function(m,n,rep,tint){try{var t=tex(n);if(rep){t=t.clone();t.needsUpdate=true;t.repeat.set(rep,rep)}m.map=t;if(tint!==false){var c=m.color;if(c){var h=c.getHSL({});c.setHSL(h.h,h.s*.9,Math.min(.75,h.l*2.1+.12))}}m.needsUpdate=true}catch(e){}return m},
 auto:function(m,hex){try{var k=MAP[String(hex).toLowerCase()];if(k)SKIN.put(m,k,k==='velvet'||k==='fabric'?3:1.5)}catch(e){}return m}};
})();
