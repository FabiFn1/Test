/* ====== Tag und Nacht ====== */
const TN={len:900,n:0,d:.3,bg:new T.Color(0xc9d3d6),nb:new T.Color(0x121c2c),sw:new T.Color(0xff9a5a),sd:new T.Color(0xfff0dc),mo:new T.Color(0x8fa8ff),mats:[],scan:0};
REAL.wM.uniforms.uH={value:1};REAL.wM.fragmentShader='uniform float uH;\n'+REAL.wM.fragmentShader.replace('gl_FragColor=vec4(col,al);','gl_FragColor=vec4(col*uH,al);');REAL.wM.needsUpdate=true;
for(const id of['dampf','rauch','staub']){const u=GB.fx[id].m.material.uniforms.col;u.base=u.value.clone()}
function tagNacht(){const an=SET.nacht!==false,d=an?(((G.t||0)/TN.len+.12)%1):.3;TN.d=d;let n=1,sy=0,a=0;if(d<.7){a=d/.7*Math.PI;sy=Math.sin(a);const k=Math.min(1,sy/.3);n=1-k*k*(3-2*k)}TN.n=n;
 const S=sun.shadow.camera.right||50,mond=n>.93;let dx,dy,dz;if(mond){dx=.5;dy=1.3;dz=.6}else{dx=-Math.cos(a)*1.1;dy=.22+1.6*sy;dz=-.6}
 sun.position.set(sun.target.position.x+dx*S,dy*S,sun.target.position.z+dz*S);
 if(mond){sun.color.copy(TN.mo);sun.intensity=1.25*(n-.93)/.07}else{sun.color.copy(TN.sw).lerp(TN.sd,Math.min(1,sy*2.2));sun.intensity=3.1*Math.pow(1-n,1.3)+.03}
 scene.backgroundIntensity=1-.86*n;scene.fog.color.copy(TN.bg).lerp(TN.nb,n);REAL.wM.uniforms.uH.value=1-.78*n;
 // Umgebungslicht: alle Materialien abdunkeln
 if(--TN.scan<=0){TN.scan=120;const s=new Set();scene.traverse(o=>{const m=o.material;if(m&&m.isMeshStandardMaterial&&!s.has(m)){s.add(m);if(m.userData.env0===undefined)m.userData.env0=m.envMapIntensity}});TN.mats=[...s]}
 const ef=1-.6*n;for(const m of TN.mats)m.envMapIntensity=m.userData.env0*ef;
 for(const[nm,c,i]of[['Sprossenfenster',0xffc27a,1.6],['Verglasung',0xbfd4ff,.5]]){const m=mats[nm];if(!m)continue;if(!m.userData.tn){m.userData.tn=1;m.emissive=new T.Color(c);m.emissiveMap=m.map;m.needsUpdate=true}m.emissiveIntensity=n*i}
 for(const id of['dampf','rauch','staub']){const u=GB.fx[id].m.material.uniforms.col;u.value.copy(u.base).multiplyScalar(1-.8*n)}}
{const _c=camUp;camUp=function(dt){_c(dt);tagNacht()}}
function uhrzeit(){const h=(6+TN.d/.7*14)%24;return String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor(h%1*6)*10).padStart(2,'0')}
