// Real photo textures (Poly Haven, CC0). Loaded after the game so a missing file never breaks it.
(function(){
  try{
    var T3=window.THREE;if(!T3||typeof M==='undefined'||!M.road)return;
    var L=new T3.TextureLoader();
    L.load('assets/asphalt.jpg',function(t){
      var old=M.road.map;t.wrapS=t.wrapT=T3.RepeatWrapping;
      if(old&&old.repeat)t.repeat.copy(old.repeat);else t.repeat.set(30,30);
      t.repeat.multiplyScalar(.5);
      if(T3.SRGBColorSpace)t.colorSpace=T3.SRGBColorSpace;else if(T3.sRGBEncoding)t.encoding=T3.sRGBEncoding;
      t.anisotropy=8;M.road.map=t;M.road.color.setHex(0xd8d8d8);M.road.needsUpdate=true;
    },undefined,function(){});
    L.load('assets/brick.jpg',function(t){
      var old=M.side.map;t.wrapS=t.wrapT=T3.RepeatWrapping;
      if(old&&old.repeat)t.repeat.copy(old.repeat);else t.repeat.set(1,1);
      if(T3.SRGBColorSpace)t.colorSpace=T3.SRGBColorSpace;else if(T3.sRGBEncoding)t.encoding=T3.sRGBEncoding;
      t.anisotropy=8;M.side.map=t;M.side.color.setHex(0xffffff);M.side.needsUpdate=true;window.__brickTex=t;
    },undefined,function(){});

    // ---- real photo skies (Poly Haven CC0): clear day, dawn/dusk, overcast. Sun removed; rotated to the game's sun ----
    try{
      var fs=sky.material.fragmentShader;
      if(fs.indexOf('uPhoto')<0&&fs.indexOf('{float m=max(dot(d,-uSun)')>0){
        fs=fs.replace('uniform sampler2D uNoise;','uniform sampler2D uNoise;uniform sampler2D uPhoto,uPhoto2,uPhoto3,uPhoto4;uniform float uDay,uRot,uRot3,uW2,uW3,uNt;');
        fs=fs.replace('{float m=max(dot(d,-uSun)',
          'if(d.y>0.&&uNt>.001){vec2 un=vec2(atan(d.x,d.z)/6.2831853+.5,asin(clamp(d.y,-1.,1.))/3.14159265+.5);vec3 pn=pow(texture2D(uPhoto4,un).rgb,vec3(2.2))*.85;col=mix(col,col+pn,uNt*(1.-uW2)*smoothstep(0.,.08,d.y));}'+
          'if(d.y>-.02&&uDay>.001){vec2 u0=vec2(atan(d.x,d.z)/6.2831853+.5,asin(clamp(d.y,-1.,1.))/3.14159265+.5);'+
          'vec3 ph=pow(texture2D(uPhoto,u0-vec2(uRot/6.2831853,0.)).rgb,vec3(2.2))*clamp(uHor/vec3(.75,.88,1.),.35,1.4);'+
          'vec3 ph3=pow(texture2D(uPhoto3,u0-vec2(uRot3/6.2831853,0.)).rgb,vec3(2.2));'+
          'vec3 ph2=pow(texture2D(uPhoto2,u0).rgb,vec3(2.2));'+
          'ph=mix(ph,ph3,uW3*smoothstep(.08,.3,d.y));ph=mix(ph,ph2,uW2*smoothstep(-.02,.1,d.y));'+
          'col=mix(col,ph,uDay*smoothstep(-.02,.07,d.y));col+=uSunCol*(pow(s,700.)*5.+pow(s,30.)*.4)*uDay*(1.-uW2)*step(0.,d.y);}\n   {float m=max(dot(d,-uSun)');
        sky.material.fragmentShader=fs;
        skyUniforms.uPhoto={value:null};skyUniforms.uPhoto2={value:null};skyUniforms.uPhoto3={value:null};skyUniforms.uPhoto4={value:null};skyUniforms.uNt={value:0};
        skyUniforms.uDay={value:0};skyUniforms.uRot={value:0};skyUniforms.uRot3={value:0};skyUniforms.uW2={value:0};skyUniforms.uW3={value:0};
        sky.material.needsUpdate=true;
        var need=4,go=function(){
          if(--need>0)return;
          (function tick(){
            try{var sd=ENV.sunDir,az=Math.atan2(sd.x,sd.z);
              skyUniforms.uRot.value=az-0.5951;skyUniforms.uRot3.value=az-0.6259;
              var k=Math.min(1,Math.max(0,(sd.y-.0)/.26));skyUniforms.uDay.value=k*k*(3-2*k);
              var w=Math.min(1,Math.max(0,(sd.y-.12)/.28));skyUniforms.uW3.value=1-w*w*(3-2*w);
              skyUniforms.uW2.value=Math.min(1,(ENV.rain||0)*1.6);skyUniforms.uNt.value=ENV.dark||0;}catch(e){}
            requestAnimationFrame(tick);
          })();
        };
        [['assets/sky.jpg','uPhoto'],['assets/sky_grey.jpg','uPhoto2'],['assets/sky_dawn.jpg','uPhoto3'],['assets/sky_night.jpg','uPhoto4']].forEach(function(p){
          L.load(p[0],function(t){
            t.wrapS=T3.RepeatWrapping;t.wrapT=T3.ClampToEdgeWrapping;t.anisotropy=4;
            skyUniforms[p[1]].value=t;go();
          },undefined,function(){go();});
        });
      }
    }catch(e){}
  }catch(e){}
})();

// ---- real rock texture (Poly Haven rocky_terrain, CC0) on the mountains: shows from low hills up, strongest on the high rock ----
(function(){
  try{
    var T3=window.THREE;if(!T3)return;var tries=0;
    var iv=setInterval(function(){
      if(++tries>200){clearInterval(iv);return}
      if(typeof CITY==='undefined'||!CITY.terrain)return;clearInterval(iv);
      new T3.TextureLoader().load('assets/rock.jpg',function(t){
        t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=4;if(T3.SRGBColorSpace)t.colorSpace=T3.SRGBColorSpace;
        var m=CITY.terrain.material;
        m.onBeforeCompile=function(sh){
          sh.uniforms.uRock={value:t};
          sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(position,1.)).xyz;');
          sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform sampler2D uRock;')
            .replace('#include <color_fragment>','#include <color_fragment>\n{float k=smoothstep(6.,45.,vWP.y);vec3 r=texture2D(uRock,vWP.xz*.045).rgb*.55+texture2D(uRock,vWP.xz*.011).rgb*.45;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*r*1.9,k*.9);}');
        };
        m.needsUpdate=true;
      });
    },300);
  }catch(e){}
})();
