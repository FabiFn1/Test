/* ====== Umwelt mit Foto-Texturen ======
   Felsen und Erzbrocken: in Blender modelliert und gebacken (blender/fels.py), ein Netz für alle Brocken;
   das Spiel färbt sie weiter je Instanz ein (Erzsorte, Grautöne).
   Boden: Foto-Texturen (CC0) für Waldboden, Geröll im Hof und Fels an steilen Hängen, in Weltkoordinaten,
   in zwei Maßstäben überlagert, damit sich die Kacheln nicht erkennbar wiederholen. */
(function(){if(typeof FOTO==='undefined')return;const lade=new T.TextureLoader();
 const tx=(src,farbig)=>{const t=lade.load(src);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(farbig)t.colorSpace=T.SRGBColorSpace;return t};
 // --- Felsbrocken ---
 const d=BLENDER.fels;if(d){const g=geo(d.teile[0]);ROCKG.copy(g);ROCKG.computeBoundingSphere();
  const farbe=tx(d.farbe,true),orm=tx(d.orm,false),nk=tx(d.normal,false);
  for(const m of[rockMat,coalMat,UM.mat.fels]){m.map=farbe;m.normalMap=nk;m.roughnessMap=orm;m.metalnessMap=orm;m.map.repeat.set(1,1);m.normalMap.repeat.set(1,1);m.flatShading=false;m.needsUpdate=true}
  rockMat.color.setScalar(1.9);UM.mat.fels.color.setScalar(1.9);coalMat.color.setScalar(1.3)}
 // --- Boden ---
 const tB=tx(FOTO.waldboden.farbe,true),tG=tx(FOTO.geroell.farbe,true),tF=tx(FOTO.fels.farbe,true);
 const o=groundMat.onBeforeCompile;groundMat.onBeforeCompile=sh=>{o(sh);Object.assign(sh.uniforms,{tBoden:{value:tB},tGer:{value:tG},tFels:{value:tF}});
  sh.fragmentShader=sh.fragmentShader.replace('uniform float uReal;','uniform float uReal;uniform sampler2D tBoden,tGer,tFels;\n'+
   // Foto als Helligkeitsstruktur (geteilt durch die mittlere Helligkeit des Fotos): Farbe bleibt die des Geländes, das Foto gibt Körnung und Flecken
   'vec3 fotoMix(sampler2D t,vec2 p,float s){vec3 a=texture2D(t,p/s).rgb,b=texture2D(t,p/(s*3.7)+.37).rgb;return mix(a,b,.4);}\n'+
   'float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}\n')
   .replace('if(uReal>.5){','if(uReal>.5){vec3 wb=fotoMix(tBoden,vWP.xz,3.);diffuseColor.rgb*=mix(1.,lum(wb)/.248,.55);}\n  if(uReal>.5){')
   .replace('vec3 fels=vec3(.29,.26,.22)*(.7+.45*sch)*(.85+.3*vn2(vWP.xz*1.7));','vec3 fn=abs(vWN);vec3 ff=(fotoMix(tFels,vWP.zy,4.)*fn.x+fotoMix(tFels,vWP.xy,4.)*fn.z+fotoMix(tFels,vWP.xz,4.)*fn.y)/(fn.x+fn.y+fn.z);vec3 fels=mix(vec3(.29,.26,.22)*lum(ff)/.159,ff*1.6,.4);')
   .replace('vec3 kies=vec3(.27,.26,.24)*(.7+.6*vn2(vWP.xz*11.));','vec3 kies=vec3(.27,.26,.24)*lum(fotoMix(tGer,vWP.xz,2.5))/.075;')};
 groundMat.customProgramCacheKey=()=>'boden-foto';groundMat.needsUpdate=true})();
