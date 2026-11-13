/* ====== Umgebung: Himmel, Berge, Vegetation, Wolkenschatten, Vögel ====== */
const UM={t:{value:0},ws:{value:1},sd:new T.Vector3(0,1,0),md:new T.Vector3(.5,1.3,.6).normalize()};
/* --- Himmel mit Wolken, Sonne, Mond und Sternen --- */
scene.background=null;
UM.himmel=new T.Mesh(new T.SphereGeometry(900,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:false,fog:false,
 uniforms:{uT:UM.t,sunD:{value:UM.sd},moonD:{value:UM.md},n:{value:0},fogC:{value:scene.fog.color}},
 vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`uniform float uT,n;uniform vec3 sunD,moonD,fogC;varying vec3 vD;
  #include <common>
  float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}
  float h3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
  void main(){vec3 d=normalize(vD);float up=max(d.y,0.);
   vec3 tag=mix(vec3(.62,.76,.9),vec3(.16,.36,.68),pow(up,.55));vec3 nacht=mix(vec3(.035,.055,.1),vec3(.006,.012,.03),pow(up,.5));
   float glut=smoothstep(.5,0.,sunD.y)*(1.-smoothstep(.8,1.,n));float sd=max(dot(d,sunD),0.);
   vec3 col=mix(tag,nacht,n);col=mix(col,vec3(1.,.5,.22),glut*(.25+.75*pow(sd,3.))*smoothstep(.5,0.,up)*.85);
   col+=vec3(1.,.9,.7)*(smoothstep(.9993,.9997,sd)*14.+pow(sd,600.)*1.5+pow(sd,24.)*.12)*(1.-n);
   float md=max(dot(d,moonD),0.);col+=vec3(.85,.9,1.)*(smoothstep(.9991,.9995,md)*1.6+pow(md,300.)*.12)*n;
   vec3 c=floor(d*190.);float st=step(.9972,h3(c))*(.6+.4*sin(uT*2.+h3(c+1.)*40.));col+=vec3(.9,.95,1.)*st*n*smoothstep(.02,.3,d.y)*1.2;
   vec2 p=d.xz/(d.y+.14)*.9+vec2(uT*.006,uT*.0035);float w=fbm(p),dichte=smoothstep(.46,.72,w)*smoothstep(.01,.2,d.y);
   vec3 wc=mix(vec3(1.),vec3(1.,.7,.52),glut)*mix(1.,.72,smoothstep(.55,.85,w));wc=mix(wc,vec3(.06,.08,.13),n);col=mix(col,wc,dichte*.9);
   col=mix(col,fogC,smoothstep(.07,-.01,d.y));
   gl_FragColor=vec4(col,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`}));UM.himmel.renderOrder=-10;UM.himmel.frustumCulled=false;scene.add(UM.himmel);
/* --- Berge am Horizont --- */
(function(){const R=rnd(321),A=180,RI=9,ng=64,nz=new Float32Array(ng).map(()=>R()),nz2=new Float32Array(ng*2).map(()=>R());
 const nn=(arr,u)=>{const l=arr.length,f=((u%1)+1)%1*l,i=Math.floor(f),t=f-i,s=t*t*(3-2*t);return arr[i%l]*(1-s)+arr[(i+1)%l]*s};
 const P=[],C=[],V=[];for(let a=0;a<=A;a++)for(let r=0;r<RI;r++){const u=a/A,rr=318+r*32,q=r/(RI-1),prof=Math.sin(Math.PI*Math.min(1,q*1.15)),h=prof*(12+62*Math.pow(nn(nz,u*9),1.6)+16*nn(nz2,u*31+r*.37)*prof);
  V.push([N/2+Math.cos(u*6.2832)*rr,h-.5,N/2+Math.sin(u*6.2832)*rr,h])}
 const col=h=>h>58?[.86,.88,.9]:h>34?[.36,.37,.38]:h>14?[.2,.27,.19]:[.17,.24,.15];
 for(let a=0;a<A;a++)for(let r=0;r<RI-1;r++){const i=a*RI+r,q=[V[i],V[i+RI],V[i+RI+1],V[i+1]];for(const k of[0,1,2,0,2,3]){const v=q[k];P.push(v[0],v[1],v[2])}const hm=(q[0][3]+q[1][3]+q[2][3]+q[3][3])/4,c=col(hm+(R()-.5)*6);for(let k=0;k<6;k++)C.push(c[0],c[1],c[2])}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.computeVertexNormals();
 const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,flatShading:false,roughness:1,metalness:0,side:T.DoubleSide,envMapIntensity:.5}));m.frustumCulled=false;scene.add(m);UM.berge=m})();
/* --- Schönere Nadelbäume: gestufte Äste --- */
(function(){const P=TREEPARTS(),jit=(g,a)=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=Math.sin(x*12.9+y*78.2+z*37.7)*43758.5,r=h-Math.floor(h);p.setXYZ(i,x*(1+(r-.5)*a),y+(r-.5)*a*.6,z*(1+Math.cos(h)*.5*a))}g.computeVertexNormals();return g};
 const g0=jit(mergeGeo([[new T.ConeGeometry(1.7,1.9,9),MX(0,-1.4,0)],[new T.ConeGeometry(1.4,1.8,9),MX(0,-.35,0,0,.4)],[new T.ConeGeometry(1.1,1.7,9),MX(0,.75,0,0,.8)]]),.28);
 const g1=jit(mergeGeo([[new T.ConeGeometry(.82,1.6,8),MX(0,.0,0)],[new T.ConeGeometry(.5,1.5,7),MX(0,1.05,0,0,.5)]]),.24);
 scene.traverse(o=>{if(o.isInstancedMesh){if(o.geometry===P[0][0])o.geometry=g0;else if(o.geometry===P[1][0])o.geometry=g1}});P[0][0]=g0;P[1][0]=g1})();
/* --- Laubbäume, Büsche, Felsen, Blumen, Schilf --- */
(function(){const jit=(g,a)=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=Math.sin(x*12.9+y*78.2+z*37.7)*43758.5,r=h-Math.floor(h);p.setXYZ(i,x+(r-.5)*a,y+(Math.sin(h*1.7)*.5)*a,z+Math.cos(h)*.5*a)}g.computeVertexNormals();return g};
 const ico=(r,d)=>new T.IcosahedronGeometry(r,d);
 UM.geo={laubK:jit(mergeGeo([[ico(.95,1),MX(0,2.5,0)],[ico(.7,1),MX(.6,2.1,.2)],[ico(.68,1),MX(-.5,2.2,-.35)],[ico(.6,1),MX(.1,3.1,-.1)],[ico(.55,1),MX(-.2,2.0,.6)]]),.22),
  laubS:mergeGeo([[new T.CylinderGeometry(.09,.15,1.9,6),MX(0,.95,0)],[new T.CylinderGeometry(.04,.07,.8,5),MX(.3,1.75,.1,0,0,-.8)],[new T.CylinderGeometry(.04,.07,.7,5),MX(-.25,1.8,-.15,.3,0,.8)]]),
  busch:jit(mergeGeo([[ico(.38,1),MX(0,.24,0,0,0,0,1,.75,1)],[ico(.28,1),MX(.3,.18,.12,0,0,0,1,.75,1)],[ico(.25,1),MX(-.22,.16,-.2,0,0,0,1,.75,1)]]),.1),
  blume:mergeGeo([[ico(.05,0),MX(0,0,0,0,0,0,1,.55,1)]]),fels:ROCKG,schilf:REAL.grasG};
 const blatt=new T.MeshStandardMaterial({roughness:.9,metalness:0,flatShading:true,envMapIntensity:.6});
 UM.mat={laubK:blatt,busch:blatt,laubS:new T.MeshStandardMaterial({color:0x4a3a2c,roughness:.95,flatShading:true,envMapIntensity:.5}),blume:new T.MeshStandardMaterial({roughness:.6,metalness:0,envMapIntensity:.7}),
  fels:new T.MeshStandardMaterial({roughness:.85,metalness:.05,flatShading:true,envMapIntensity:.6}),schilf:REAL.grasM};
 UM.schatten={laubK:1,laubS:1,busch:1,fels:1}})();
const UMC={gruen:[0x4f7a35,0x5b8a3a,0x466e33,0x6a8f3f,0x587a30,0x8a8a35].map(h=>new T.Color(h)),fels:[0x7d7a72,0x8b877d,0x6c6a66].map(h=>new T.Color(h)),schilf:[0xb8b070,0x9aa860,0xc4b47a].map(h=>new T.Color(h)),
 blume:[[0xf4f1e6,0xf2d94a],[0xf2d94a,0xe89a2c],[0xb07adf,0x8d6ad8],[0xe0564a,0xf4f1e6]].map(p=>p.map(h=>new T.Color(h)))};
function umweltDeko(){if(!terrainG||!deco)return;const R=rnd(909),nz=rauschFeld(N,71,[[5,.55],[13,.45]]),nb=rauschFeld(N,72,[[9,.6],[27,.4]]),np=rauschFeld(N,73,[[4,1]]),L={},ob=new T.Object3D();
 const put=(key,tile,x,y,z,s,sy,ry,col)=>{const c=key+':'+((tile/N|0)>>6)+'_'+((tile%N)>>6);ob.position.set(x,y,z);ob.rotation.set(0,ry,0);ob.scale.set(s,sy,s);ob.updateMatrix();(L[c]=L[c]||{key,it:[]}).it.push({tile,m:ob.matrix.clone(),col})};
 const pick=a=>a[Math.floor(R()*a.length)];
 for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++){const i=y*N+x,l=TER[i];if(l<1||ORE[i])continue;const h=YL(l);
  let ufer=false;for(const[dx,dz,t]of[[-1,0,i-1],[1,0,i+1],[0,-1,i-N],[0,1,i+N]])if(TER[t]<1){ufer=true;if(R()<.7)for(let k=0;k<2;k++){const o=(R()-.5)*.9;put('schilf',i,x+.5+dx*.55+(dz?o:0),-.55,y+.5+dz*.55+(dx?o:0),1.6+R(),2.6+R()*1.6,R()*6.28,pick(UMC.schilf))}}
  if(ufer)continue;const eben=TER[i-1]===l&&TER[i+1]===l&&TER[i-N]===l&&TER[i+N]===l;if(!eben){if(R()<.06){const s=.25+R()*.4;put('fels',i,x+R(),h-.3+s*.3,y+R(),s,s*(.6+R()*.5),R()*6.28,pick(UMC.fels))}continue}
  const d=Math.hypot(x-128,y-128);
  if(d>36&&nz[i]>.56&&R()<.05){const s=.75+R()*.7,ry=R()*6.28,px=x+.2+R()*.6,pz=y+.2+R()*.6;put('laubS',i,px,h,pz,s,s,ry,null);put('laubK',i,px,h,pz,s,s*(.9+R()*.25),ry,pick(UMC.gruen))}
  else if(d>30&&nz[i]>.5&&R()<.06){const s=.7+R()*.9;put('busch',i,x+R(),h,y+R(),s,s,R()*6.28,pick(UMC.gruen))}
  else if(R()<.005){const s=.14+R()*.22;put('fels',i,x+R(),h+s*.25,y+R(),s,s*(.6+R()*.4),R()*6.28,pick(UMC.fels))}
  if(nb[i]>.61&&R()<.6){const pal=UMC.blume[Math.min(3,Math.floor(np[i]*4))];for(let k=0;k<3;k++)put('blume',i,x+R(),h+.2+R()*.14,y+R(),.7+R()*.7,1,0,pal[R()<.7?0:1])}}
 for(const id in L){const{key,it}=L[id],m=new T.InstancedMesh(UM.geo[key],UM.mat[key],it.length);it.forEach((t,k)=>{m.setMatrixAt(k,t.m);if(t.col)m.setColorAt(k,t.col);(deco.get(t.tile)||deco.set(t.tile,[]).get(t.tile)).push([m,k])});
  m.castShadow=!!UM.schatten[key];m.receiveShadow=true;m.computeBoundingSphere();m.userData.b=m.instanceMatrix.array.slice();it.forEach((t,k)=>{if(decoOcc[t.tile])m.instanceMatrix.array.set(ZERO,k*16)});terrainG.add(m)}}
{const _b=buildTerrain;buildTerrain=function(){_b();umweltDeko()}}
/* --- Wolkenschatten auf Boden und Gras --- */
{const W='float wsF(vec2 p,float t){vec2 a=p*.011+vec2(t*.012,t*.008),b=p*.027+vec2(t*.02,0.);vec2 i=floor(a),f=fract(a);f=f*f*(3.-2.*f);float A=mix(mix(wsH(i),wsH(i+vec2(1,0)),f.x),mix(wsH(i+vec2(0,1)),wsH(i+vec2(1,1)),f.x),f.y);i=floor(b);f=fract(b);f=f*f*(3.-2.*f);float B=mix(mix(wsH(i),wsH(i+vec2(1,0)),f.x),mix(wsH(i+vec2(0,1)),wsH(i+vec2(1,1)),f.x),f.y);return smoothstep(.5,.7,A*.6+B*.4);}',H='float wsH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n';
 const o1=groundMat.onBeforeCompile;groundMat.onBeforeCompile=sh=>{o1(sh);sh.uniforms.uWT=UM.t;sh.uniforms.uWS=UM.ws;sh.fragmentShader=sh.fragmentShader.replace('uniform float uReal;','uniform float uReal;uniform float uWT,uWS;\n'+H+W).replace('if(uReal>.5){','if(uReal>.5){diffuseColor.rgb*=1.-.3*uWS*wsF(vWP.xz,uWT);')};groundMat.customProgramCacheKey=()=>'boden-real-ws';groundMat.needsUpdate=true;
 const o2=REAL.grasM.onBeforeCompile;REAL.grasM.onBeforeCompile=sh=>{o2(sh);sh.uniforms.uWS=UM.ws;sh.vertexShader=sh.vertexShader.replace('uniform float uT;','uniform float uT,uWS;\n'+H+W).replace('#include <color_vertex>','#include <color_vertex>\nvColor.rgb*=1.-.3*uWS*wsF(instanceMatrix[3].xz,uT);')};REAL.grasM.customProgramCacheKey=()=>'gras-ws';REAL.grasM.needsUpdate=true}
/* --- Vögel --- */
(function(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,-.18, -.6,0,.1, 0,0,.22, 0,0,-.18, 0,0,.22, .6,0,.1],3));g.computeVertexNormals();
 const m=new T.MeshBasicMaterial({color:0x15181a,side:T.DoubleSide});m.onBeforeCompile=sh=>{sh.uniforms.uT=UM.t;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y+=abs(transformed.x)*sin(uT*9.+instanceMatrix[3].x*.7+instanceMatrix[3].z*.5)*.75;')};
 UM.voegel=new T.InstancedMesh(g,m,18);UM.voegel.frustumCulled=false;scene.add(UM.voegel);const R=rnd(55);UM.vd=[];for(let f=0;f<3;f++){const cx=70+R()*116,cz=70+R()*116,r=24+R()*30,w=(.05+R()*.04)*(R()<.5?-1:1),h=15+R()*8;for(let k=0;k<6;k++)UM.vd.push({cx,cz,r:r+((k+1)>>1)*1.6*(k%2?1:-1)*.6,w,h:h+(k%3)*.4,p:f*2.1-((k+1)>>1)*.045*Math.sign(w)})}})();
function umweltUpdate(){const t=(performance.now()-REAL.t0)/1000;UM.t.value=t;if(REAL.grasU)REAL.grasU.value=t;const n=TN.n,d=TN.d;UM.ws.value=1-n;
 if(d<.7){const a=d/.7*Math.PI;UM.sd.set(-Math.cos(a),Math.sin(a)-.04,-.35).normalize()}else UM.sd.set(.3,-.4,-.35).normalize();
 UM.himmel.position.copy(cam.position);if(!UM.fuell){UM.fuell=new T.HemisphereLight(0xa9bfe6,0x3c4238,0);scene.add(UM.fuell)}UM.fuell.intensity=.1+1.1*Math.sin(Math.min(1,n)*Math.PI/2);UM.himmel.material.uniforms.n.value=n;
 const o=GB.ob,v=UM.voegel;v.visible=n<.7;if(v.visible){UM.vd.forEach((b,i)=>{const a=b.p+t*b.w;o.position.set(b.cx+Math.cos(a)*b.r,b.h+Math.sin(t*.3+i)*.6,b.cz+Math.sin(a)*b.r);o.rotation.set(0,-a+(b.w>0?Math.PI:0),0);o.scale.setScalar(.8);o.updateMatrix();v.setMatrixAt(i,o.matrix)});v.instanceMatrix.needsUpdate=true}}
{const _r=renderBild;renderBild=function(){umweltUpdate();_r()}}
