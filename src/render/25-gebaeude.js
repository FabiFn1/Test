/* ====== Gebäude: Gebrauchsspuren, bewegliche Teile, Dampf, Funken, Licht ====== */
const GB={t:0,teile:{},fx:{},ob:new T.Object3D(),m4:new T.Matrix4(),m5:new T.Matrix4(),v:new T.Vector3()};
/* --- 1. Gebrauchsspuren: Schmutz am Sockel, Regenspuren an Wänden --- */
const OHNE_DRECK=new Set(['Band','BandStill','Glut','Verglasung']);
function verwittern(m,name){if(!m||m.userData.dreck||OHNE_DRECK.has(name))return;m.userData.dreck=1;
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWq;varying vec3 vBq;varying vec3 vNq;').replace('#include <begin_vertex>',`#include <begin_vertex>
  {vec4 wq=vec4(transformed,1.),bq=vec4(0.,0.,0.,1.);vec3 nq=objectNormal;
  #ifdef USE_INSTANCING
  wq=instanceMatrix*wq;bq=instanceMatrix*bq;nq=mat3(instanceMatrix)*nq;
  #endif
  vWq=(modelMatrix*wq).xyz;vBq=(modelMatrix*bq).xyz;vNq=normalize(mat3(modelMatrix)*nq);}`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWq;varying vec3 vBq;varying vec3 vNq;\nfloat hQ(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat nQ(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hQ(i),hQ(i+vec2(1,0)),f.x),mix(hQ(i+vec2(0,1)),hQ(i+vec2(1,1)),f.x),f.y);}\nfloat gDreck;')
   .replace('#include <color_fragment>',`#include <color_fragment>
  {float hb=vWq.y-vBq.y;float nz=nQ(vWq.xz*3.7+vWq.y*2.1)*.6+nQ(vWq.xz*11.+vWq.y*7.)*.4;
   gDreck=smoothstep(.55,0.,hb)*(.4+.6*nz);float wand=1.-abs(vNq.y);
   float spur=wand*smoothstep(.6,.92,nQ(vec2((vWq.x+vWq.z)*6.5,vWq.y*.55)))*smoothstep(.05,.7,hb);
   float flecken=smoothstep(.62,.95,nQ(vWq.xz*1.3+vWq.y*.8))*.35;
   diffuseColor.rgb*=1.-.34*gDreck-.15*spur-.08*flecken;
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.08,.95,.78),gDreck*.6+flecken*.4);}`)
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=min(1.,roughnessFactor+gDreck*.25);')};
 m.customProgramCacheKey=()=>'dreck-'+name;m.needsUpdate=true}
for(const n in mats)verwittern(mats[n],n);
{const _M=M;M=function(n){const m=_M(n);verwittern(m,n);return m}}
/* --- Hilfen --- */
function mergeGeo(list){let P=[],Nn=[],U=[];for(const[g0,mx]of list){const g=g0.index?g0.toNonIndexed():g0.clone();g.applyMatrix4(mx);P.push(...g.attributes.position.array);Nn.push(...g.attributes.normal.array);U.push(...(g.attributes.uv?g.attributes.uv.array:new Float32Array(g.attributes.position.count*2)))}
 const r=new T.BufferGeometry();r.setAttribute('position',new T.Float32BufferAttribute(P,3));r.setAttribute('normal',new T.Float32BufferAttribute(Nn,3));r.setAttribute('uv',new T.Float32BufferAttribute(U,2));return r}
const MX=(x,y,z,rx,ry,rz,sx,sy,sz)=>MXt(x,y,z,rx,ry,rz,sx,sy,sz).clone();
function MXt(x,y,z,rx,ry,rz,sx,sy,sz){const o=GB.ob;o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.scale.set(sx||1,sy||1,sz||1);o.updateMatrix();return o.matrix}
const BOX=(w,h,d)=>new T.BoxGeometry(w,h,d),CYL=(a,b,h,s)=>new T.CylinderGeometry(a,b,h,s||12);
// Teil anlegen: kinds = Bauwerke, n = Stück je Maschine
function teil(id,kinds,geo,mat,n,shadow=true){const m=new T.InstancedMesh(geo,mat,Math.min(4000,600*n));m.count=0;m.frustumCulled=false;m.castShadow=shadow;m.receiveShadow=true;scene.add(m);GB.teile[id]={m,kinds,n,mat};return m}
// Maschinenmatrix (wie das Modell selbst)
function mMat(e,out){const s=K[e.k].s;GB.ob.position.set(e.x+s/2,YL(e.z),e.y+s/2);GB.ob.rotation.set(0,-e.r*Math.PI/2,0);GB.ob.scale.set(1,1,1);GB.ob.updateMatrix();return out.copy(GB.ob.matrix)}
function lokal(e,x,y,z){const s=K[e.k].s,a=-e.r*Math.PI/2,c=Math.cos(a),n=Math.sin(a);return[e.x+s/2+x*c+z*n,YL(e.z)+y,e.y+s/2-x*n+z*c]}
const lauf=e=>e.st==='ok';
const EM=(c,i)=>new T.MeshStandardMaterial({color:0x111111,emissive:c,emissiveIntensity:i||3,roughness:.4});
/* --- 2. Ölpumpe: echte Pferdekopfpumpe --- */
if(KM.oelpumpe)for(const{m,q}of KM.oelpumpe)if(q.m==='Lack_Rot')m.visible=false;
{const rot=M('Lack_Rot'),grau=M('Lack_Grau'),stahl=M('Stahl_Verzinkt'),dunkel=M('Lack_Dunkel');
 const L=[];for(const sx of[-1,1])for(const sz of[-1,1]){const x0=sx*.28,z0=sz*.24,x1=.04,z1=sz*.07,y0=.22,y1=1.3,len=Math.hypot(x1-x0,y1-y0,z1-z0);L.push([BOX(.07,len,.07),MX((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.atan2(z1-z0,y1-y0)*-1,0,Math.atan2(x0-x1,y1-y0))])}
 L.push([BOX(.12,.08,.36),MX(.04,1.3,0)]);teil('pj_bock',['oelpumpe'],mergeGeo(L),rot,1);
 const kopf=new T.CylinderGeometry(.42,.42,.16,14,1,false,-.9,1.8);kopf.rotateX(Math.PI/2);
 teil('pj_balken',['oelpumpe'],mergeGeo([[BOX(1.62,.12,.11),MX(.05,0,0)],[kopf,MX(.48,0,0)],[BOX(.22,.18,.2),MX(-.7,-.02,0)]]),rot,1);
 teil('pj_stange',['oelpumpe'],CYL(.018,.018,1,6),stahl,1);
 teil('pj_kurbel',['oelpumpe'],mergeGeo([[BOX(.06,.62,.05),MX(0,0,-.22)],[BOX(.06,.62,.05),MX(0,0,.22)],[BOX(.26,.2,.05),MX(0,-.3,-.22)],[BOX(.26,.2,.05),MX(0,-.3,.22)],[CYL(.04,.04,.5,8),MX(0,0,0,Math.PI/2)]]),dunkel,1);
 teil('pj_pleuel',['oelpumpe'],BOX(.035,1,.035),grau,2)}
function pumpe(e,t,M4){const ph=e._ph||0,w=ph*2.2,th=.2*Math.sin(w),P=[.04,1.36,0];const T_=GB.teile;
 const set=(id,i,lx,ly,lz,rx,ry,rz,sx,sy,sz)=>{const m=T_[id].m;if(m.count>=m.instanceMatrix.count)return;const k=m.count++;GB.m5.multiplyMatrices(M4,MXt(lx,ly,lz,rx,ry,rz,sx,sy,sz));m.setMatrixAt(k,GB.m5)};
 set('pj_bock',0,0,0,0);set('pj_balken',0,P[0],P[1],P[2],0,0,th);
 const tipY=P[1]+Math.sin(th)*.9-.1,rodTop=Math.max(.5,tipY-.05);set('pj_stange',0,.94,(.24+rodTop)/2,0,0,0,0,1,rodTop-.24,1);
 const C0=[-.6,.62],cr=.27,pin=[C0[0]+Math.cos(-w)*cr,C0[1]+Math.sin(-w)*cr];set('pj_kurbel',0,C0[0],C0[1],0,0,0,-w+Math.PI/2);
 const rear=[P[0]-.72*Math.cos(th),P[1]-.72*Math.sin(th)];const dx=rear[0]-pin[0],dy=rear[1]-pin[1],len=Math.hypot(dx,dy);
 for(const z of[-.26,.26])set('pj_pleuel',0,(rear[0]+pin[0])/2,(rear[1]+pin[1])/2,z,0,0,Math.atan2(-dx,dy),1,len,1)}
/* --- Weitere bewegliche Teile --- */
{const stahl=M('Stahl_Verzinkt'),dunkel=M('Lack_Dunkel'),grau=M('Lack_Grau'),gelb=M('Lack_Gelb'),weiss=M('Lack_Weiss');
 const HALLE=['fertiger','montagewerk','praezision','recycler'];
 // zweiter Dachlüfter: Gehäuse + Flügel
 teil('dl_geh',HALLE,mergeGeo([[CYL(.36,.36,.16,20),MX(0,.08,0)],[BOX(.08,.03,.72),MX(0,.17,0)]]),grau,1);
 const fl=[];for(let i=0;i<5;i++)fl.push([BOX(.3,.012,.09),MX(.15*Math.cos(i*1.2566),0,.15*Math.sin(i*1.2566),0,-i*1.2566,.35)]);fl.push([CYL(.05,.05,.05,10),MX(0,0,0)]);
 teil('dl_rad',HALLE,mergeGeo(fl),dunkel,1);
 // Rundumleuchten (Gehäuse statisch, Licht blinkt)
 teil('rl_fuss',[...HALLE,'bohrer','schnellbohrer','drohnenhafen'],CYL(.06,.07,.08,10),dunkel,1);
 // Radar auf der Wartungsstation
 const sch=new T.SphereGeometry(.34,14,8,0,Math.PI*2,0,.9);sch.rotateZ(Math.PI/2);
 teil('radar',['wartungsstation'],mergeGeo([[sch,MX(.06,.0,0)],[CYL(.02,.02,.3,6),MX(-.05,0,0,0,0,Math.PI/2)],[BOX(.1,.1,.1),MX(-.12,-.04,0)]]),weiss,1);
 teil('radarfuss',['wartungsstation'],CYL(.04,.05,.5,8),stahl,1);
 // Zentrifuge: drehender Deckel mit Speichen
 const zd=[[CYL(.82,.82,.04,32),MX(0,0,0)]];for(let i=0;i<6;i++)zd.push([BOX(.78,.05,.08),MX(.39*Math.cos(i*1.047),.04,.39*Math.sin(i*1.047),0,-i*1.047,0)]);zd.push([CYL(.14,.14,.12,14),MX(0,.06,0)]);
 teil('zdeckel',['zentrifuge'],mergeGeo(zd),stahl,1);
 // Chemiefabrik: Rührwerke auf den Tanks
 teil('ruehr_mot',['chemiefabrik'],mergeGeo([[CYL(.09,.09,.18,12),MX(0,.09,0)],[BOX(.2,.05,.2),MX(0,.0,0)]]),grau,2);
 teil('ruehr_ach',['chemiefabrik'],mergeGeo([[CYL(.02,.02,.14,6),MX(0,.07,0)],[BOX(.16,.02,.03),MX(0,.15,0)]]),stahl,2);
 // Zentrale: Fahnenmast und Fahne
 teil('mast_z',['zentrale'],mergeGeo([[CYL(.035,.045,4.2,8),MX(0,2.1,0)],[new T.SphereGeometry(.06,8,6),MX(0,4.22,0)],[BOX(.4,.06,.4),MX(0,.03,0)]]),stahl,1);
 const fg=new T.PlaneGeometry(1.1,.68,14,6);fg.translate(.55,0,0);GB.fahneM=new T.MeshStandardMaterial({color:0xc8a13a,side:T.DoubleSide,roughness:.8});
 GB.fahneM.onBeforeCompile=sh=>{sh.uniforms.uT={value:0};GB.fahneU=sh.uniforms.uT;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat fw=transformed.x/1.1;transformed.z+=sin(uT*4.+transformed.x*5.)*.12*fw+sin(uT*7.3+transformed.x*9.+transformed.y*4.)*.03*fw;transformed.y-=fw*fw*.05;')};
 teil('fahne',['zentrale'],fg,GB.fahneM,1,false)}
/* --- 3. Lichter: blinken (rot) oder drehen (gelb, orange) --- */
GB.licht=new T.InstancedMesh(new T.SphereGeometry(1,10,8),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),1500);GB.licht.count=0;GB.licht.frustumCulled=false;GB.licht.setColorAt(0,new T.Color());scene.add(GB.licht);
// Halo als weicher Lichtschein
GB.haloTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
GB.halo=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:GB.haloTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),1500);GB.halo.count=0;GB.halo.frustumCulled=false;GB.halo.setColorAt(0,new T.Color());scene.add(GB.halo);
/* --- 4. Partikel: weiche Sprites für Dampf, Rauch, Staub, Funken, Flamme --- */
GB.wolkeTex=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),R=rnd(808);for(let i=0;i<16;i++){const x=64+(R()-.5)*48,y=64+(R()-.5)*48,r=22+R()*26,q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba(255,255,255,.55)');q.addColorStop(.6,'rgba(255,255,255,.18)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(0,0,128,128)}
 const im=g.getImageData(0,0,128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const d=Math.hypot(x-64,y-64)/64,k=(y*128+x)*4;im.data[k+3]*=Math.max(0,1-d*d);const sh=.82+.18*(1-y/128);im.data[k]*=sh;im.data[k+1]*=sh;im.data[k+2]*=sh}g.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t})();
function fxMat(map,add,col,op){return new T.ShaderMaterial({transparent:true,depthWrite:false,fog:true,blending:add?T.AdditiveBlending:T.NormalBlending,
 uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{map:{value:map},col:{value:new T.Color(col)},op:{value:op},add:{value:add?1:0}}]),
 vertexShader:`attribute float aA;varying float vA;varying vec2 vUv;varying vec3 vC;
  #include <fog_pars_vertex>
  void main(){vUv=uv;vA=aA;vC=vec3(1.);
  #ifdef USE_INSTANCING_COLOR
  vC=instanceColor;
  #endif
  vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);vec2 c0=instanceMatrix[0].xy;float s=length(instanceMatrix[0].xyz);vec2 dr=c0/max(s,1e-5);
  mvPosition.xy+=mat2(dr.x,dr.y,-dr.y,dr.x)*position.xy*s;gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
  }`,
 fragmentShader:`uniform sampler2D map;uniform vec3 col;uniform float op,add;varying float vA;varying vec2 vUv;varying vec3 vC;
  #include <common>
  #include <fog_pars_fragment>
  void main(){vec4 t=texture2D(map,vUv);float a=t.a*vA*op;vec3 c=col*vC*t.rgb;gl_FragColor=add>.5?vec4(c*a,1.):vec4(c,a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  }`})}
function fxSys(id,mat,max){const m=new T.InstancedMesh(new T.PlaneGeometry(1,1),mat,max);m.count=0;m.frustumCulled=false;m.setColorAt(0,new T.Color());m.geometry.setAttribute('aA',new T.InstancedBufferAttribute(new Float32Array(max),1));scene.add(m);GB.fx[id]={m,p:[]};return GB.fx[id]}
fxSys('dampf',fxMat(GB.wolkeTex,false,0xf4f4f0,.85),900);
fxSys('rauch',fxMat(GB.wolkeTex,false,0x8d8a84,.7),600);
fxSys('staub',fxMat(GB.wolkeTex,false,0x9a8466,.55),400);
fxSys('funke',fxMat(GB.haloTex,true,0xffffff,1),600);
fxSys('flamme',fxMat(GB.haloTex,true,0xffffff,1),300);
function emit(id,x,y,z,vx,vy,vz,life,s0,s1){const f=GB.fx[id];if(f.p.length>=f.m.instanceMatrix.count)return;f.p.push({x,y,z,vx,vy,vz,l:0,L:life,s0,s1,r:Math.random()*6.283,w:(Math.random()-.5)*.6})}
function fxUpdate(dt){const o=GB.ob,c=new T.Color(),wolke={dampf:1,rauch:1,staub:1};for(const id in GB.fx){const f=GB.fx[id],m=f.m,A=m.geometry.attributes.aA;let n=0;
 for(let i=f.p.length-1;i>=0;i--){const q=f.p[i];q.l+=dt;if(q.l>=q.L){f.p.splice(i,1);continue}q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.r+=q.w*dt;
  if(id==='funke')q.vy-=4.5*dt;else if(wolke[id]){q.vx+=.3*dt;q.vy*=1-.22*dt}}
 for(const q of f.p){const u=q.l/q.L,s=wolke[id]?q.s0+(q.s1-q.s0)*Math.sqrt(u):q.s0+(q.s1-q.s0)*u;
  const a=wolke[id]?Math.min(1,u*6)*(1-u)*(1-u):1-u;o.position.set(q.x,q.y,q.z);o.rotation.set(0,0,q.r);o.scale.setScalar(Math.max(.001,s));o.updateMatrix();m.setMatrixAt(n,o.matrix);A.array[n]=a;
  if(id==='funke')c.setRGB(4,1.7,.4).lerp(new T.Color(.8,.15,0),u);else if(id==='flamme')c.setRGB(3.4,1.5*(1-u*.6),.35*(1-u));else{const g=.9+.1*Math.sin(q.r);c.setRGB(g,g,g)}m.setColorAt(n,c);n++}
 m.count=n;m.instanceMatrix.needsUpdate=true;A.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}}
/* --- 5. Pro Bild: alles bewegen --- */
for(const k in NBA)if(NBA[k].lampe)LAMP[k]=NBA[k].lampe;
let gbLast=performance.now();
function gebaeudeUpdate(){const now=performance.now(),rdt=Math.min(.1,(now-gbLast)/1000);gbLast=now;const dt=paused||SHELL.titel?0:rdt*(G.speed||1);GB.t+=rdt;const t=GB.t;
 for(const id in GB.teile)GB.teile[id].m.count=0;GB.licht.count=0;GB.halo.count=0;
 const M4=GB.m4,cx=C.x,cz=C.z,nah=Math.max(60,C.dist*1.3);
 const set=(id,lx,ly,lz,rx,ry,rz,sx,sy,sz)=>{const m=GB.teile[id].m;if(m.count>=m.instanceMatrix.count)return;GB.m5.multiplyMatrices(M4,MXt(lx,ly,lz,rx,ry,rz,sx,sy,sz));m.setMatrixAt(m.count++,GB.m5)};
 const lichtAn=(p,col,r,an,hs)=>{const L=GB.licht,H=GB.halo;if(L.count>=1500)return;GB.ob.position.set(p[0],p[1],p[2]);GB.ob.rotation.set(0,0,0);GB.ob.scale.setScalar(r);GB.ob.updateMatrix();L.setMatrixAt(L.count,GB.ob.matrix);const c=GB.lc||(GB.lc=new T.Color());c.set(col);if(!an)c.multiplyScalar(.12);else c.multiplyScalar(2.2);L.setColorAt(L.count++,c);
  if(an){GB.ob.quaternion.copy(cam.quaternion);GB.ob.scale.setScalar(hs||r*9);GB.ob.updateMatrix();H.setMatrixAt(H.count,GB.ob.matrix);c.set(col).multiplyScalar(.9);H.setColorAt(H.count++,c)}};
 const blink=(e,f,d)=>((t*f+(e.id*.37)%1)%1)<(d||.18);
 for(const e of machines){if(e.bau)continue;const k=e.k,an=lauf(e);if(an)e._ph=(e._ph||0)+dt*(e.oc||1);const ph=e._ph||0;mMat(e,M4);const weit=Math.abs(e.x-cx)>nah||Math.abs(e.y-cz)>nah;if(TN.n>.5&&!weit&&K[k].s>1){const s=K[k].s;lichtAn(lokal(e,s/2-.2,.9,s>2?.75:.35),0x6a4a24,.03,true,2.6*TN.n)}
  switch(k){
   case'oelpumpe':pumpe(e,t,M4);break;
   case'fertiger':case'montagewerk':case'praezision':case'recycler':{const A=NBA[k];set('rl_fuss',A.rl[0],A.rl[1],A.rl[2]);lichtAn(lokal(e,A.rl[0],A.rl[1]+.09,A.rl[2]),0xffb21a,.06,an&&blink(e,1.6,.5));
    if(an&&!weit&&Math.random()<dt*1.4){const p=lokal(e,A.dampf[0],A.dampf[1],A.dampf[2]);emit('dampf',p[0],p[1],p[2],0,.45,0,3,.3,1.1)}break}
   case'bohrer':case'schnellbohrer':set('rl_fuss',.39,.86,-.39);lichtAn(lokal(e,.39,.95,-.39),0xff8a12,.06,an&&blink(e,1.8,.5));
    if(an&&!weit&&Math.random()<dt*(k==='schnellbohrer'?6:3)){const a=Math.random()*6.283,p=lokal(e,-.1+Math.cos(a)*.3,.2,.1+Math.sin(a)*.3);emit('staub',p[0],p[1],p[2],Math.cos(a)*.35,.25+Math.random()*.2,Math.sin(a)*.35,1.8,.25,.9)}break;
   case'ofen':{const A=NBA.ofen,q=lokal(e,A.rauch[0],A.rauch[1],A.rauch[2]);if(an&&!weit){if(SET.rauch&&Math.random()<dt*3)emit('rauch',q[0],q[1],q[2],0,.8,0,4.5,.3,1.6);
     if(Math.random()<dt*7)emit('funke',q[0],q[1],q[2],(Math.random()-.5)*.8,1.6+Math.random()*1.4,(Math.random()-.5)*.8,.9+Math.random()*.5,.09,.05)}
    if(an)lichtAn(lokal(e,A.glut[0],A.glut[1],A.glut[2]),0xff6a1a,.001,true,1.1+.15*Math.sin(t*13+e.id));break}
   case'elektroofen':{const A=NBA.elektroofen;if(an&&!weit){const q=lokal(e,A.bogen[0],A.bogen[1],A.bogen[2]);if(blink(e,7,.35))lichtAn(q,0xa8d8ff,.05,true,.9);if(Math.random()<dt*12)emit('funke',q[0],q[1],q[2],(Math.random()-.5)*1.6,1+Math.random()*1.2,(Math.random()-.5)*1.6,.6,.08,.04);
     if(Math.random()<dt*1.6){const p=lokal(e,A.dampf[0],A.dampf[1],A.dampf[2]);emit('dampf',p[0],p[1],p[2],0,.5,0,3.2,.3,1.2)}}
    if(an)lichtAn(lokal(e,A.glut[0],A.glut[1],A.glut[2]),0xff6a1a,.001,true,1.5);break}
   case'generator':{const A=NBA.generator;if(SET.rauch&&an&&!weit&&Math.random()<dt*3){const p=lokal(e,A.rauch[0],A.rauch[1],A.rauch[2]);emit('rauch',p[0],p[1],p[2],0,.8,0,2.8,.2,1)}if(an)lichtAn(lokal(e,A.glut[0],A.glut[1],A.glut[2]),0xff6a1a,.001,true,.7);break}
   case'kraftwerk':{const A=NBA.kraftwerk;if(an&&!weit){if(Math.random()<dt*4.5){const p=lokal(e,A.dampf[0],A.dampf[1],A.dampf[2]);emit('dampf',p[0]+(Math.random()-.5)*.4,p[1],p[2]+(Math.random()-.5)*.4,0,.9+Math.random()*.3,0,7,.7,3.2)}
     if(SET.rauch&&Math.random()<dt*3){const p=lokal(e,A.rauch[0],A.rauch[1],A.rauch[2]);emit('rauch',p[0],p[1],p[2],0,.9,0,5,.25,1.6)}}lichtAn(lokal(e,A.licht[0],A.licht[1],A.licht[2]),0xff2a1a,.05,blink(e,.8,.25));break}
   case'kernkraftwerk':if(an&&!weit&&Math.random()<dt*7){const q=NBA.kernkraftwerk.dampf[Math.random()<.5?0:1],p=lokal(e,q[0],q[1],q[2]);emit('dampf',p[0]+(Math.random()-.5)*.8,p[1],p[2]+(Math.random()-.5)*.8,0,1.1+Math.random()*.4,0,9,1.2,5)}{const q=NBA.kernkraftwerk.licht;lichtAn(lokal(e,q[0],q[1],q[2]),0xff2a1a,.06,blink(e,.8,.25))}break;
   case'raffinerie':{const A=NBA.raffinerie,p=lokal(e,A.fackel[0],A.fackel[1],A.fackel[2]);if(an){if(!weit&&Math.random()<dt*40)emit('flamme',p[0]+(Math.random()-.5)*.05,p[1]+.05,p[2]+(Math.random()-.5)*.05,(Math.random()-.5)*.2+.15,.9+Math.random()*.6,(Math.random()-.5)*.2,.35+Math.random()*.25,.32,.06);lichtAn([p[0],p[1]+.25,p[2]],0xff7a20,.001,true,1.6+.3*Math.sin(t*17))}
     if(an&&!weit&&Math.random()<dt*1.2){const q=lokal(e,A.dampf[0],A.dampf[1],A.dampf[2]);emit('dampf',q[0],q[1],q[2],0,.6,0,3.5,.3,1.3)}break}
   case'chemiefabrik':for(const q of NBA.chemiefabrik.ruehr){set('ruehr_mot',q[0],q[1],q[2]);set('ruehr_ach',q[0],q[1]+.18,q[2],0,ph*6,0)}if(an&&!weit&&Math.random()<dt*1.8){const q=NBA.chemiefabrik.dampf,p=lokal(e,q[0],q[1],q[2]);emit('dampf',p[0],p[1],p[2],0,.55,0,3,.3,1.2)}break;
   case'zentrifuge':{const A=NBA.zentrifuge;set('zdeckel',A.deckel[0],A.deckel[1],A.deckel[2],0,ph*14,0,.72,1,.72);lichtAn(lokal(e,A.licht[0],A.licht[1],A.licht[2]),0x3aa0ff,.05,an&&blink(e,1.2,.3));break}
   case'wartungsstation':set('radarfuss',-1.08,2.6,-1.04);set('radar',-1.08,2.88,-1.04,0,t*1.4+e.id,0);lichtAn(lokal(e,-1.08,2.42,-1.04),0xff2a1a,.045,blink(e,1,.25));break;
   case'drohnenhafen':{const q=NBA.drohnenhafen.rl;set('rl_fuss',q[0],q[1],q[2]);lichtAn(lokal(e,q[0],q[1]+.09,q[2]),0xff8a12,.055,blink(e,1.5,.5))}for(const[a,b]of[[1.3,1.3],[1.3,-1.3],[-1.3,1.3]])lichtAn(lokal(e,a,.12,b),0x40ff70,.04,blink(e,.9,.3));break;
   case'raketensilo':for(const q of NBA.raketensilo.licht)lichtAn(lokal(e,q[0],q[1],q[2]),0xff2a1a,.06,blink(e,.7,.25));break}}
 for(const e of nodes){if(e.k==='zentrale'){mMat(e,M4);set('mast_z',-2.55,0,2.6);set('fahne',-2.55,3.85,2.6);{const q=NBA.zentrale.licht;lichtAn(lokal(e,q[0],q[1],q[2]),0xff2a1a,.07,((t*.6)%1)<.2)}if(TN.n>.5)for(const[x,z]of[[1.2,1.3],[-1.6,1.3],[3.05,-1.2]])lichtAn(lokal(e,x,1.0,z),0x6a4a24,.03,true,3*TN.n)}
  else if(e.k==='mast'){if(TN.n>.5)lichtAn([e.x+.5,YL(e.z)+2.98,e.y+.86],0x8a6a3a,.04,true,1.6*TN.n)}
  else if(e.k==='grossmast'){lichtAn([e.x+.5,YL(e.z)+6.08,e.y+.5],0xff2a1a,.06,((t*.7+e.id*.13)%1)<.22)}}
 if(GB.fahneU)GB.fahneU.value=t;
 // Glut im Ofen flackert
 const gl=mats.Glut;if(gl)gl.emissiveIntensity=.75+.25*Math.sin(t*9.1)+.15*Math.sin(t*23.7);
 for(const id in GB.teile){const m=GB.teile[id].m;m.visible=m.count>0;m.instanceMatrix.needsUpdate=true}
 GB.licht.instanceMatrix.needsUpdate=true;if(GB.licht.instanceColor)GB.licht.instanceColor.needsUpdate=true;GB.halo.instanceMatrix.needsUpdate=true;if(GB.halo.instanceColor)GB.halo.instanceColor.needsUpdate=true;
 fxUpdate(dt)}
