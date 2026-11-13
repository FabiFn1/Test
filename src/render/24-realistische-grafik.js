/* ====== Realistische Grafik: Umgebungsverdeckung, Gras, Boden, Wasser, Bäume ====== */
const REAL={rt:null,aoRT:null,qc:new T.OrthographicCamera(-1,1,1,-1,0,1),aoS:null,aoM:null,coS:null,coM:null,an:false,gras:null,grasAt:null,grasN:-1,wasser:null,t0:performance.now()};
// Hilfsfunktion: Höhenfeld (0..1) -> Normalenkarte
function normalKarte(n,hf,st){const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),im=g.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const h=(a,b)=>hf[((b+n)%n)*n+(a+n)%n];const dx=(h(x+1,y)-h(x-1,y))*st,dy=(h(x,y+1)-h(x,y-1))*st,l=Math.hypot(dx,dy,1),i=(y*n+x)*4;im.data[i]=(-dx/l*.5+.5)*255;im.data[i+1]=(-dy/l*.5+.5)*255;im.data[i+2]=(1/l*.5+.5)*255;im.data[i+3]=255}g.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t}
function rauschFeld(n,seed,okt){const R=rnd(seed),hf=new Float32Array(n*n);for(const[f,a]of okt){const gN=f+1,gr=new Float32Array(gN*gN).map(()=>R());for(let y=0;y<n;y++)for(let x=0;x<n;x++){const fx=x/n*f,fy=y/n*f,i=Math.floor(fx),j=Math.floor(fy),u=fx-i,v=fy-j,s=u*u*(3-2*u),q=v*v*(3-2*v),p=(a,b)=>gr[(b%f)*gN+(a%f)];hf[y*n+x]+=a*((p(i,j)*(1-s)+p(i+1,j)*s)*(1-q)+(p(i,j+1)*(1-s)+p(i+1,j+1)*s)*q)}}return hf}
/* --- Boden: feine Struktur, Fels an steilen Hängen --- */
{const hf=rauschFeld(256,91,[[8,.5],[32,.35],[128,.25]]);const R=rnd(92);for(let i=0;i<6000;i++){const x=Math.floor(R()*256),y=Math.floor(R()*256);hf[y*256+x]+=.25*(R()-.3)}
 groundMat.normalMap=normalKarte(256,hf,5);groundMat.normalScale.set(.75,.75);
 groundMat.onBeforeCompile=sh=>{sh.uniforms.uReal={value:1};REAL.bodenU=sh.uniforms.uReal;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform float uReal;\nfloat h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat vn2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}')
   .replace('#include <color_fragment>',`#include <color_fragment>
  if(uReal>.5){float st=smoothstep(.86,.5,vWN.y);float sch=vn2(vec2(vWP.y*7.,(vWP.x+vWP.z)*.35));vec3 fels=vec3(.29,.26,.22)*(.7+.45*sch)*(.85+.3*vn2(vWP.xz*1.7));
   diffuseColor.rgb=mix(diffuseColor.rgb,fels,st*.9);
   float nass=smoothstep(.1,-.25,vWP.y);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.55,.6,.5),nass);
   float grund=smoothstep(-.3,-.5,vWP.y);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.09,.08,.05),grund*.8);
   float m=vn2(vWP.xz*.09)*.6+vn2(vWP.xz*.37)*.4;diffuseColor.rgb*=mix(.86,1.12,m)*(1.-st*.1);}`)}
 groundMat.customProgramCacheKey=()=>'boden-real';groundMat.needsUpdate=true}
/* --- Wasser: echte Spiegelung (zweiter, gespiegelter Render), Fresnel, Tiefe, Uferschaum --- */
{let w=null;scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x2c5364)w=o});
 if(w)w.position.y=-.32;REAL.wMesh=w;REAL.wH=w?w.position.y:-.32;
 const hf=rauschFeld(256,57,[[4,.5],[8,.35],[16,.25],[32,.12]]);const nt=normalKarte(256,hf,9);
 // Abstand zum Ufer je Feld (0 = Ufer, 1 = 14 Felder entfernt)
 REAL.uferTex=new T.DataTexture(new Uint8Array(N*N*4),N,N);REAL.uferTex.magFilter=REAL.uferTex.minFilter=T.LinearFilter;REAL.uferTex.wrapS=REAL.uferTex.wrapT=T.ClampToEdgeWrapping;
 REAL.mirrorCam=new T.PerspectiveCamera();REAL.tm=new T.Matrix4();REAL.clip=[new T.Plane(new T.Vector3(0,1,0),-REAL.wH+.04)];
 REAL.wM=new T.ShaderMaterial({transparent:true,fog:true,depthWrite:false,
  uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{tR:{value:null},tN:{value:nt},tS:{value:REAL.uferTex},uT:{value:0},rOn:{value:0},tm:{value:new T.Matrix4()},sunD:{value:new T.Vector3(0,1,0)},sunC:{value:new T.Color(1,1,1)},
   deep:{value:new T.Color(.008,.03,.038)},shallow:{value:new T.Color(.03,.075,.062)},skyC:{value:new T.Color(.35,.48,.6)},nn:{value:N}}]),
  vertexShader:`uniform mat4 tm;varying vec3 vWP;varying vec4 vRC;
   #include <fog_pars_vertex>
   void main(){vec4 wp=modelMatrix*vec4(position,1.);vWP=wp.xyz;vRC=tm*wp;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
   #include <fog_vertex>
   }`,
  fragmentShader:`uniform sampler2D tR,tN,tS;uniform float uT,rOn,nn;uniform mat4 tm;uniform vec3 sunD,sunC,deep,shallow,skyC;varying vec3 vWP;varying vec4 vRC;
   #include <common>
   #include <fog_pars_fragment>
   void main(){vec2 p=vWP.xz;
    vec3 a=texture2D(tN,p*.043+vec2(uT*.011,uT*.007)).xyz*2.-1.,b=texture2D(tN,p*.117+vec2(-uT*.016,uT*.012)).xyz*2.-1.,c=texture2D(tN,p*.31+vec2(uT*.03,-uT*.021)).xyz*2.-1.;
    float sd=texture2D(tS,p/nn).r;
    vec3 n=normalize(vec3((a.xy*.5+b.xy*.35+c.xy*.15)*mix(.35,.75,smoothstep(0.,.4,sd)),1.)).xzy;
    vec3 v=normalize(cameraPosition-vWP);
    float fr=.05+.95*pow(1.-max(dot(n,v),0.),5.);
    vec2 ruv=vRC.xy/vRC.w+n.xz*.045;
    vec3 refl=rOn>.5?texture2D(tR,ruv).rgb:skyC;
    vec3 wc=mix(shallow,deep,smoothstep(.0,.55,sd));
    // Licht im Wasser: zur Sonne hin etwas heller, Streulicht
    wc*=.75+.5*max(dot(normalize(sunD),vec3(0.,1.,0.)),0.);
    // Wellen aus jedem Blickwinkel: Flanken zur Sonne heller, abgewandte dunkler, Kämme leicht aufgehellt
    vec2 Lh=normalize(sunD.xz+vec2(.0001));float well=dot(n.xz,Lh);wc*=1.+clamp(well*4.5,-.55,.9);wc+=vec3(.05,.085,.09)*smoothstep(.015,.06,1.-n.y);
    vec3 h=normalize(normalize(sunD)+v);float nh=max(dot(n,h),0.);float sp=min(pow(nh,1400.)*2.2,.9)+pow(nh,120.)*.04;
    vec3 col=mix(wc,refl*.62,clamp(fr*.9,0.,1.))+sunC*sp*mix(.4,1.,smoothstep(0.,.3,sd));
    // Uferschaum: Brandungslinien, die zum Ufer laufen
    float br=texture2D(tN,p*.22+vec2(uT*.025,uT*.017)).x;
    float lin=sin(sd*70.-uT*1.6+br*5.)*.5+.5;
    float fo=smoothstep(.06,.0,sd)*(.55+.45*lin);
    fo*=smoothstep(.25,.6,br+.25);
    col=mix(col,vec3(.62,.66,.64),clamp(fo,0.,1.)*.55);
    float al=mix(.78,.97,smoothstep(.0,.3,sd));al=max(al,fo*.6);
    gl_FragColor=vec4(col,al);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
   }`});
 if(w){w.material=REAL.wM;w.receiveShadow=false;w.renderOrder=1}}
function uferBerechnen(){const d=new Float32Array(N*N).fill(99),q=[];for(let i=0;i<N*N;i++)if(TER[i]>=1||F[i]>=1){d[i]=0;q.push(i)}
 for(let h=0;h<q.length;h++){const i=q[h],x=i%N,y=(i/N)|0,v=d[i]+1;if(v>14)continue;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=N||Y>=N)continue;const j=Y*N+X;if(d[j]>v){d[j]=v;q.push(j)}}}
 const t=REAL.uferTex.image.data;for(let i=0;i<N*N;i++){const v=Math.min(255,Math.max(0,(d[i]-.5)/14*255));t[i*4]=v;t[i*4+3]=255}REAL.uferTex.needsUpdate=true}
uferBerechnen();{const _bt2=buildTerrain;buildTerrain=function(){_bt2();uferBerechnen()}}
function wasserSpiegel(t){const u=REAL.wM.uniforms;u.uT.value=t;u.sunD.value.copy(sun.position).sub(sun.target.position).normalize();u.sunC.value.copy(sun.color).multiplyScalar(sun.intensity*.5);
 const an=SET.qual!=='niedrig'&&SET.spiegel!==false&&REAL.wMesh;u.rOn.value=an?1:0;if(!an)return;
 const v=ren.getDrawingBufferSize(new T.Vector2()),sc=SET.qual==='hoch'?.6:.42,rw=Math.max(64,Math.round(v.x*sc)),rh=Math.max(64,Math.round(v.y*sc));
 if(!REAL.rRT||REAL.rRT.width!==rw||REAL.rRT.height!==rh){if(REAL.rRT)REAL.rRT.dispose();REAL.rRT=new T.WebGLRenderTarget(rw,rh,{type:T.HalfFloatType,samples:SET.qual==='hoch'?2:0})}
 const h=REAL.wH,mc=REAL.mirrorCam;cam.updateMatrixWorld();mc.position.copy(cam.position);mc.position.y=2*h-cam.position.y;const dir=cam.getWorldDirection(new T.Vector3());dir.y*=-1;mc.up.set(0,1,0);mc.lookAt(mc.position.clone().add(dir));
 mc.projectionMatrix.copy(cam.projectionMatrix);mc.projectionMatrixInverse.copy(cam.projectionMatrixInverse);mc.updateMatrixWorld();
 REAL.tm.set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1).multiply(mc.projectionMatrix).multiply(mc.matrixWorldInverse);u.tm.value.copy(REAL.tm);
 const gv=REAL.gras.visible,au=ren.shadowMap.autoUpdate;REAL.wMesh.visible=false;REAL.gras.visible=false;ren.shadowMap.autoUpdate=false;ren.clippingPlanes=REAL.clip;
 ren.setRenderTarget(REAL.rRT);ren.render(scene,mc);
 ren.clippingPlanes=[];ren.shadowMap.autoUpdate=au;REAL.wMesh.visible=true;REAL.gras.visible=gv;u.tR.value=REAL.rRT.texture}
/* --- Bäume: unregelmäßige Kronen, jeder Baum etwas anders gefärbt --- */
{const P=TREEPARTS();P.forEach(([ge],q)=>{if(q===2)return;const p=ge.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=Math.sin(x*12.9+y*78.2+z*37.7)*43758.5,r=h-Math.floor(h);const s=y>1.5?1:.82+r*.36;p.setXYZ(i,x*s+(r-.5)*.18,y+(r-.5)*.25,z*s+(Math.cos(h)*.5)*.18)}p.needsUpdate=true;ge.computeVertexNormals()})}
function baumPatch(){const geos=new Set(TREEPARTS().map(p=>p[0]));scene.traverse(o=>{if(!o.isInstancedMesh||!geos.has(o.geometry)||o.material.userData.baum)return;o.material.userData.baum=1;const m=o.material;m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vTV;').replace('#include <begin_vertex>','#include <begin_vertex>\nvTV=fract(sin(dot(instanceMatrix[3].xz,vec2(12.98,78.23)))*43758.5);');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vTV;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(vec3(.78,.86,.8),vec3(1.12,1.08,.92),vTV);')};m.customProgramCacheKey=()=>'baum';m.needsUpdate=true})}
baumPatch();{const _bt=buildTerrain;buildTerrain=function(){_bt();baumPatch();REAL.grasAt=null}}
/* --- Gras: Büschel aus einzelnen Halmen, wiegen sich im Wind --- */
REAL.grasM=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.85,metalness:0,envMapIntensity:.6});
REAL.grasM.onBeforeCompile=sh=>{sh.uniforms.uT={value:0};REAL.grasU=sh.uniforms.uT;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float gh;uniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\n{vec3 wp=instanceMatrix[3].xyz;float w=sin(uT*1.6+wp.x*.31+wp.z*.23)*.6+sin(uT*2.7+wp.x*.9-wp.z*.4)*.3;transformed.x+=w*.13*gh*gh;transformed.z+=w*.07*gh*gh;}')};
REAL.grasM.customProgramCacheKey=()=>'gras';
REAL.grasG=(function(){const R=rnd(404),pos=[],col=[],nor=[],gh=[];for(let b=0;b<9;b++){const a=R()*6.283,r=R()*.42,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.22+R()*.3,w=.035+R()*.025,ro=R()*6.283,c=Math.cos(ro),s=Math.sin(ro),lx=Math.cos(a+1)*.09*R(),lz=Math.sin(a+1)*.09*R();
  const v=[[x-c*w,0,z-s*w,0],[x+c*w,0,z+s*w,0],[x+c*w*.45+lx*.5,h*.55,z+s*w*.45+lz*.5,.55],[x-c*w*.45+lx*.5,h*.55,z-s*w*.45+lz*.5,.55],[x+lx,h,z+lz,1]];
  for(const t of[[0,1,2],[0,2,3],[3,2,4]])for(const k of t){const q=v[k];pos.push(q[0],q[1],q[2]);nor.push(0,1,0);gh.push(q[3]);const f=q[3];col.push(.26+.34*f,.30+.36*f,.12+.16*f)}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('gh',new T.Float32BufferAttribute(gh,1));return g})();
REAL.gras=new T.InstancedMesh(REAL.grasG,REAL.grasM,18000);REAL.gras.count=0;REAL.gras.frustumCulled=false;REAL.gras.receiveShadow=true;REAL.gras.setColorAt(0,new T.Color(1,1,1));scene.add(REAL.gras);
const GRASCOL=[0x8f966a,0x858e5e,0x9a976c,0x7c875a,0x9d9b72].map(h=>new T.Color(h));
function grasBauen(){const g=REAL.gras,cx=Math.round(C.tx),cz=Math.round(C.tz),RR=SET.qual==='hoch'?36:26,dicht=SET.qual==='hoch'?3:2,ob=new T.Object3D();let n=0;
 for(let y=cz-RR;y<=cz+RR;y++)for(let x=cx-RR;x<=cx+RR;x++){if(x<1||y<1||x>=N-1||y>=N-1)continue;const d=Math.hypot(x-cx,y-cz);if(d>RR)continue;const i=y*N+x,l=TER[i];
  if(l<1||ORE[i]||grid[i]||F[i]>l||UM.weg[i]>45||TER[i-1]!==l||TER[i+1]!==l||TER[i-N]!==l||TER[i+N]!==l)continue;
  for(let k=0;k<dicht&&n<g.instanceMatrix.count;k++){const h=Math.sin(i*12.9898+k*78.233)*43758.5453,r=h-Math.floor(h),r2=(r*7.31)%1,r3=(r*13.7)%1;if(r3<.12)continue;
   const sc=(.75+r2*.6)*Math.min(1,(RR-d)/11);ob.position.set(x+.15+r*.7,YL(l),y+.15+r2*.7);ob.rotation.set(0,r3*6.283,0);ob.scale.set(sc*.8,sc*(.3+r*.2),sc*.8);ob.updateMatrix();g.setMatrixAt(n,ob.matrix);g.setColorAt(n,GRASCOL[Math.floor(r3*5)%5]);n++}}
 g.count=n;g.instanceMatrix.needsUpdate=true;if(g.instanceColor)g.instanceColor.needsUpdate=true;REAL.grasAt=[cx,cz];REAL.grasN=E.size+F.length*0}
{const _p=place,_r=remove,_bf=buildFund,_rf=removeFund;place=function(...a){const r=_p(...a);if(r)REAL.grasAt=null;return r};remove=function(e){_r(e);REAL.grasAt=null};buildFund=function(a,b){_bf(a,b);REAL.grasAt=null};removeFund=function(x,y){const r=_rf(x,y);if(r)REAL.grasAt=null;return r}}
/* --- Nachbearbeitung: Umgebungsverdeckung (SAO) und Farbabstimmung --- */
function realPost(){if(REAL.aoM)return;
 REAL.aoM=new T.ShaderMaterial({uniforms:{tD:{value:null},pI:{value:new T.Matrix4()},p11:{value:1},res:{value:new T.Vector2()},rad:{value:1.6},str:{value:1.1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tD;uniform mat4 pI;uniform float p11,rad,str;uniform vec2 res;varying vec2 vUv;
  vec3 vp(vec2 u){float d=texture2D(tD,u).x;vec4 c=pI*vec4(u*2.-1.,d*2.-1.,1.);return c.xyz/c.w;}
  float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){float d=texture2D(tD,vUv).x;if(d>=.9999){gl_FragColor=vec4(1.);return;}vec3 P=vp(vUv);vec2 px=1./res;
   vec3 n=normalize(cross(vp(vUv+vec2(px.x,0.))-P,vp(vUv+vec2(0.,px.y))-P));if(dot(n,P)>0.)n=-n;
   float rp=min(rad*p11/-P.z*.5*res.y,60.);if(rp<1.){gl_FragColor=vec4(1.);return;}
   float ao=0.,a0=hs(gl_FragCoord.xy)*6.283;
   for(int i=0;i<14;i++){float t=(float(i)+.5)/14.;float a=a0+float(i)*2.39996;vec3 S=vp(vUv+vec2(cos(a),sin(a))*t*rp/res);vec3 v=S-P;float vv=dot(v,v);ao+=max(0.,dot(v,n)-.004*-P.z)/(vv+.02)*smoothstep(rad*rad*4.,0.,vv);}
   gl_FragColor=vec4(vec3(clamp(1.-str*ao/14.,0.,1.)),1.);}`,depthTest:false,depthWrite:false,toneMapped:false});
 REAL.coM=new T.ShaderMaterial({uniforms:{tC:{value:null},tA:{value:null},tD:{value:null},ares:{value:new T.Vector2()},aoAn:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tC,tA,tD;uniform vec2 ares;uniform float aoAn;varying vec2 vUv;
  float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){vec3 c=texture2D(tC,vUv).rgb;
   if(aoAn>.5){float d0=texture2D(tD,vUv).x,s=0.,w=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(float(x),float(y))/ares;float dd=texture2D(tD,vUv+o).x;float k=1./(1.+abs(dd-d0)*4000.);s+=texture2D(tA,vUv+o).r*k;w+=k;}float ao=s/w;c*=mix(1.,ao,.75);}
   float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.08)*1.06;
   vec2 q=vUv-.5;c*=1.-.16*dot(q,q)*1.8;
   gl_FragColor=vec4(c,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   gl_FragColor.rgb+=(hs(gl_FragCoord.xy)-.5)/255.;}`,depthTest:false,depthWrite:false});
 const pl=new T.PlaneGeometry(2,2);REAL.aoS=new T.Scene();REAL.aoS.add(new T.Mesh(pl,REAL.aoM));REAL.coS=new T.Scene();REAL.coS.add(new T.Mesh(pl,REAL.coM))}
function realRT(){const v=ren.getDrawingBufferSize(new T.Vector2()),ms=SET.qual==='hoch'?4:2;if(REAL.rt&&REAL.rt.width===v.x&&REAL.rt.height===v.y&&REAL.rt.samples===ms)return;
 if(REAL.rt){REAL.rt.depthTexture.dispose();REAL.rt.dispose();REAL.aoRT.dispose()}const dt=new T.DepthTexture(v.x,v.y);dt.type=T.UnsignedIntType;
 REAL.rt=new T.WebGLRenderTarget(v.x,v.y,{type:T.HalfFloatType,depthTexture:dt,samples:ms});const ax=Math.ceil(v.x/2),ay=Math.ceil(v.y/2);REAL.aoRT=new T.WebGLRenderTarget(ax,ay,{type:T.UnsignedByteType});
 REAL.aoM.uniforms.res.value.set(ax,ay);REAL.coM.uniforms.ares.value.set(ax,ay)}
function renderBild(){const t=(performance.now()-REAL.t0)/1000;gebaeudeUpdate();
 const grasAn=SET.gras&&SET.qual!=='niedrig'&&C.dist<105;REAL.gras.visible=grasAn;if(grasAn){if(REAL.grasU)REAL.grasU.value=t;const a=REAL.grasAt;if(!a||Math.abs(a[0]-C.tx)>5||Math.abs(a[1]-C.tz)>5)grasBauen()}
 wasserSpiegel(t);
 if(SET.qual==='niedrig'){ren.setRenderTarget(null);ren.render(scene,cam);return}
 realPost();realRT();ren.setRenderTarget(REAL.rt);ren.render(scene,cam);
 const aoAn=SET.ao;if(aoAn){const u=REAL.aoM.uniforms;u.tD.value=REAL.rt.depthTexture;u.pI.value.copy(cam.projectionMatrixInverse);u.p11.value=cam.projectionMatrix.elements[5];ren.setRenderTarget(REAL.aoRT);ren.render(REAL.aoS,REAL.qc)}
 const c=REAL.coM.uniforms;c.tC.value=REAL.rt.texture;c.tA.value=REAL.aoRT.texture;c.tD.value=REAL.rt.depthTexture;c.aoAn.value=aoAn?1:0;ren.setRenderTarget(null);ren.render(REAL.coS,REAL.qc)}
