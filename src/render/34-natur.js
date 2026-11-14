/* ====== Natur: Laub und Nadeln, Gestein, ausgetretener Boden, Wetter ====== */
/* --- Blatt- und Nadeltexturen --- */
(function(){const R=rnd(2024),mk=(draw)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');draw(g);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t};
 const nadel=mk(g=>{g.lineCap='round';g.strokeStyle='#4a3626';g.lineWidth=7;g.beginPath();g.moveTo(0,128);g.lineTo(250,128);g.stroke();
  for(let i=0;i<900;i++){const x=6+R()*244,k=1-x/256*.55,l=(26+R()*70)*k,s=R()<.5?-1:1,a=.9+R()*.5,v=R();g.strokeStyle=`rgb(${Math.round(24+v*46)},${Math.round(62+v*70)},${Math.round(30+v*34)})`;g.lineWidth=2+R()*2.5;g.beginPath();g.moveTo(x,128+s*3);g.lineTo(x+Math.cos(a)*l*.55,128+s*Math.sin(a)*l);g.stroke()}});
 const laub=mk(g=>{for(let i=0;i<150;i++){const a=R()*6.283,d=Math.sqrt(R())*104,x=128+Math.cos(a)*d,y=128+Math.sin(a)*d,v=R(),s=10+R()*13;g.fillStyle=`rgb(${Math.round(120+v*110)},${Math.round(150+v*100)},${Math.round(90+v*70)})`;g.save();g.translate(x,y);g.rotate(R()*6.283);g.beginPath();g.ellipse(0,0,s,s*.55,0,0,6.283);g.fill();g.strokeStyle='rgba(40,60,30,.5)';g.lineWidth=1;g.beginPath();g.moveTo(-s,0);g.lineTo(s,0);g.stroke();g.restore()}});
 const tint=m=>{m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vTV;').replace('#include <begin_vertex>','#include <begin_vertex>\nvTV=fract(sin(dot(instanceMatrix[3].xz,vec2(12.98,78.23)))*43758.5);');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vTV;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(vec3(.72,.82,.76),vec3(1.12,1.08,.9),vTV);')};m.customProgramCacheKey=()=>'blattwerk';return m};
 UM.nadelM=tint(new T.MeshStandardMaterial({map:nadel,alphaTest:.4,side:T.DoubleSide,roughness:.85,metalness:0,envMapIntensity:.55}));
 UM.laubM=tint(new T.MeshStandardMaterial({map:laub,alphaTest:.4,side:T.DoubleSide,roughness:.8,metalness:0,envMapIntensity:.6}));
 const quads=(Q)=>{const P=[],Nn=[],U=[];for(const[p,n]of Q){for(const k of[0,1,2,0,2,3]){P.push(...p[k]);Nn.push(...n);U.push(k===1||k===2?1:0,k>=2?1:0)}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(Nn,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));return g};
 // Nadelbaum: Astetagen, Koordinaten relativ zur Teilmitte in 3,4 Höhe
 const Q=[],nrm=(x,y,z)=>{const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l]};
 for(let L=0;L<9;L++){const ya=1.1+L*.62,r=(1.85*(1-L/9.6)+.12),n=L<6?5:4;for(let k=0;k<n;k++){const a=k/n*6.283+L*.7,c=Math.cos(a),s=Math.sin(a),w=r*.42,y=ya-3.4,dr=.3*r;
   Q.push([[[c*.02-s*w*.3,y+.1,s*.02+c*w*.3],[c*r-s*w,y-dr,s*r+c*w],[c*r+s*w,y-dr,s*r-c*w],[c*.02+s*w*.3,y+.1,s*.02-c*w*.3]],nrm(c*.6,.8,s*.6)])}}
 for(let k=0;k<2;k++){const a=k*1.571,c=Math.cos(a),s=Math.sin(a);Q.push([[[-c*.3,6.5-3.4,-s*.3],[-c*.02,7.5-3.4,-s*.02],[c*.02,7.5-3.4,s*.02],[c*.3,6.5-3.4,s*.3]],nrm(s,.5,-c)])}
 const g0=quads(Q);
 // UV für Äste: u entlang des Asts
 {const u=g0.attributes.uv;for(let i=0;i<u.count;i+=6){const set=(j,a,b)=>u.setXY(i+j,a,b);set(0,0,.25);set(1,1,0);set(2,1,1);set(3,0,.25);set(4,1,1);set(5,0,.75)}}
 const leer=new T.BufferGeometry();leer.setAttribute('position',new T.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));leer.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));leer.setAttribute('uv',new T.Float32BufferAttribute([0,0,0,0,0,0],2));
 const stamm=new T.CylinderGeometry(.045,.15,6.4,7);stamm.translate(0,3.2-.8,0);
 const P=TREEPARTS(),alt=[P[0][0],P[1][0],P[2][0]];scene.traverse(o=>{if(o.isInstancedMesh){const i=alt.indexOf(o.geometry);if(i>=0)o.geometry=[g0,leer,stamm][i]}});P[0][0]=g0;P[1][0]=leer;P[2][0]=stamm;UM.nadelG=g0;
 // Laubkrone und Busch aus Blattbüscheln
 const krone=(blobs,n,gr)=>{const Q=[];for(const[cx,cy,cz,r]of blobs)for(let i=0;i<n;i++){const th=Math.acos(1-2*R()),ph=R()*6.283,d=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)],p=[cx+d[0]*r*.8,cy+d[1]*r*.8,cz+d[2]*r*.8],s=r*gr*(.75+R()*.5);
   let t=[d[1],-d[0],0];if(Math.hypot(...t)<.2)t=[1,0,0];const tl=Math.hypot(...t);t=t.map(v=>v/tl);const b=[d[1]*t[2]-d[2]*t[1],d[2]*t[0]-d[0]*t[2],d[0]*t[1]-d[1]*t[0]],ro=R()*6.283,c=Math.cos(ro),sn=Math.sin(ro),u=t.map((v,j)=>(v*c+b[j]*sn)*s),w=t.map((v,j)=>(-v*sn+b[j]*c)*s),k=d.map(v=>v*R()*.5);
   const q=(a,e)=>[p[0]+u[0]*a+w[0]*e+k[0]*a,p[1]+u[1]*a+w[1]*e+k[1]*a,p[2]+u[2]*a+w[2]*e+k[2]*a];Q.push([[q(-1,-1),q(1,-1),q(1,1),q(-1,1)],nrm(p[0],p[1]-blobs[0][1]+.9,p[2])])}return quads(Q)};
 UM.geo.laubK=krone([[0,2.5,0,.95],[.6,2.1,.2,.7],[-.5,2.2,-.35,.68],[.1,3.1,-.1,.6],[-.2,2.0,.6,.55]],13,.62);UM.geo.busch=krone([[0,.26,0,.36],[.28,.2,.1,.27],[-.2,.18,-.2,.24]],9,.7);UM.mat.laubK=UM.laubM;UM.mat.busch=UM.laubM})();
{const _b=buildTerrain;buildTerrain=function(){_b();scene.traverse(o=>{if(o.isInstancedMesh&&o.geometry===UM.nadelG&&o.material!==UM.nadelM)o.material=UM.nadelM})}}
scene.traverse(o=>{if(o.isInstancedMesh&&o.geometry===UM.nadelG)o.material=UM.nadelM});
/* --- Gestein: feinere Form, Oberflächentextur --- */
(function(){const R=rnd(77),g=new T.IcosahedronGeometry(1,2),p=g.attributes.position,nm=new Float32Array(p.count*3),f=(x,y,z)=>.8+.2*Math.sin(x*3.1+y*1.7)*Math.cos(z*2.7+x*1.3)+.13*Math.sin(y*6.3+z*4.1)+.07*Math.sin(x*11+z*9+y*7);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),s=f(x,y,z);p.setXYZ(i,x*s,y*s*.85,z*s)}g.computeVertexNormals();const fn=g.attributes.normal;for(let i=0;i<p.count;i++){const l=Math.hypot(p.getX(i),p.getY(i),p.getZ(i))||1;fn.setXYZ(i,fn.getX(i)*.55+p.getX(i)/l*.45,fn.getY(i)*.55+p.getY(i)/l*.45,fn.getZ(i)*.55+p.getZ(i)/l*.45)}
 ROCKG.copy(g);const n=256,hf=rauschFeld(n,88,[[5,.4],[17,.35],[60,.25]]);const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),im=x.createImageData(n,n);for(let i=0;i<n*n;i++){const v=hf[i],riss=Math.abs(v-.5)<.012?.55:1,k=(150+v*105)*riss*(.9+R()*.2);im.data[i*4]=k;im.data[i*4+1]=k;im.data[i*4+2]=k;im.data[i*4+3]=255}x.putImageData(im,0,0);
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.repeat.set(2,2);const nk=normalKarte(n,hf,6);nk.repeat.set(2,2);
 for(const m of[rockMat,coalMat,UM.mat.fels]){m.map=t;m.normalMap=nk;m.flatShading=false;m.needsUpdate=true}rockMat.roughness=.88;rockMat.metalness=.06;coalMat.roughness=.42;
 const grau=new T.Color(0x6e6a64);for(let i=1;i<ROCKCOL.length;i++){if(i===4||i===7)continue;const cc=new T.Color(ROCKCOL[i]).lerp(grau,.22);ROCKCOL[i]=cc.getHex()}})();
/* --- Ausgetretener Boden rund ums Werk --- */
UM.weg=new Uint8Array(N*N);UM.wegTex=new T.DataTexture(new Uint8Array(N*N*4),N,N);UM.wegTex.magFilter=UM.wegTex.minFilter=T.LinearFilter;UM.wegV=-1;
function wegBauen(){const w=new Uint8Array(N*N),set=(x,y,v)=>{if(x>=0&&y>=0&&x<N&&y<N&&w[y*N+x]<v)w[y*N+x]=v};
 for(const e of E.values()){const s=K[e.k].s;if(s===1){set(e.x,e.y,BK(e.k)?170:230);if(e.k==='gleis')continue}else for(let j=-2;j<=s+1;j++)for(let i=-2;i<=s+1;i++)set(e.x+i,e.y+j,i<0||j<0||i>=s||j>=s?215:255)}
 const d=UM.wegTex.image.data;for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const i=y*N+x,v=(w[i]*4+w[i-1]+w[i+1]+w[i-N]+w[i+N])/8;UM.weg[i]=v;d[i*4]=v;d[i*4+3]=255}UM.wegTex.needsUpdate=true;REAL.grasAt=null}
{const o3=groundMat.onBeforeCompile;groundMat.onBeforeCompile=sh=>{o3(sh);sh.uniforms.tWeg={value:UM.wegTex};sh.uniforms.uNass=UM.nass=UM.nass||{value:0};sh.fragmentShader=sh.fragmentShader.replace('uniform float uReal;','uniform float uReal;uniform sampler2D tWeg;uniform float uNass;').replace('if(uReal>.5){',`if(uReal>.5){float wg=texture2D(tWeg,vWP.xz/1024.).r;
  vec3 erde=vec3(.3,.25,.19)*(.78+.45*vn2(vWP.xz*2.3));vec3 kies=vec3(.27,.26,.24)*(.7+.6*vn2(vWP.xz*11.));vec3 beton=vec3(.5,.5,.48)*(.82+.3*vn2(vWP.xz*1.7))*(.93+.12*vn2(vWP.xz*23.));float fuge=max(smoothstep(.93,.985,abs(fract(vWP.x*.5)-.5)*2.),smoothstep(.93,.985,abs(fract(vWP.z*.5)-.5)*2.));beton*=1.-.42*fuge;
  vec3 hof=mix(mix(erde,kies,smoothstep(.45,.7,wg)),beton,smoothstep(.72,.8,wg));diffuseColor.rgb=mix(diffuseColor.rgb,hof,smoothstep(.12,.55,wg)*.94);diffuseColor.rgb*=1.-.28*uNass;`)};groundMat.customProgramCacheKey=()=>'boden-weg';groundMat.needsUpdate=true}
/* --- Wetter --- */
const WET={bew:0,regen:0,nebel:0,blitz:0,nb:0,typen:{klar:[0,0,0],wolkig:[.6,0,0],regen:[.95,1,.15],gewitter:[1,1,.2],nebel:[.5,0,1]},name:{klar:'Klar',wolkig:'Bewölkt',regen:'Regen',gewitter:'Gewitter',nebel:'Nebel'}};
UM.himmel.material.uniforms.bew={value:0};UM.himmel.material.uniforms.blitz={value:0};
UM.himmel.material.fragmentShader=UM.himmel.material.fragmentShader.replace('uniform float uT,n;','uniform float uT,n,bew,blitz;').replace('dichte=smoothstep(.46,.72,w)*smoothstep(.01,.2,d.y);','dichte=smoothstep(.46-bew*.36,.72-bew*.36,w)*smoothstep(.01,.2,d.y);col=mix(col,vec3(.5,.54,.58)*(1.-.88*n),bew*.75);')
 .replace('wc=mix(wc,vec3(.06,.08,.13),n);','wc*=1.-.5*bew;wc=mix(wc,vec3(.06,.08,.13),n);wc+=vec3(.8,.85,1.)*blitz;');UM.himmel.material.needsUpdate=true;
WET.tropfen=(function(){const g=new T.PlaneGeometry(.025,1.1),m=new T.InstancedMesh(g,new T.MeshBasicMaterial({color:0xb9cbd8,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,fog:false}),2600);m.frustumCulled=false;m.visible=false;m.renderOrder=4;scene.add(m);WET.tp=new Float32Array(2600*3);for(let i=0;i<2600;i++){WET.tp[i*3]=Math.random()*70-35;WET.tp[i*3+1]=Math.random()*45;WET.tp[i*3+2]=Math.random()*70-35}return m})();
function wetterWechsel(){const r=Math.random(),alt=G.wetter&&G.wetter.typ;let typ=r<.46?'klar':r<.68?'wolkig':r<.84?'regen':r<.92?'gewitter':'nebel';if(typ===alt)typ=alt==='klar'?'wolkig':'klar';G.wetter={typ,bis:(G.t||0)+(typ==='klar'?240+Math.random()*260:110+Math.random()*150)}}
function wetter(dtR){if(!G)return;const an=SET.wetter!==false;if(!G.wetter||G.t>G.wetter.bis||!WET.typen[G.wetter.typ])wetterWechsel();const z=an?WET.typen[G.wetter.typ]:[0,0,0],k=Math.min(1,dtR*.25);
 WET.bew+=(z[0]-WET.bew)*k;WET.regen+=(z[1]-WET.regen)*k;WET.nebel+=(z[2]-WET.nebel)*k;const n=TN.n,b=WET.bew,rg=WET.regen,nb=WET.nebel;
 sun.intensity*=1-.6*b;scene.fog.near=230-170*Math.max(nb,rg*.35);scene.fog.far=640-430*nb-180*rg*(1-nb);scene.fog.color.lerp(WET.grau.setRGB(.52,.56,.6).multiplyScalar(1-.85*n),Math.max(b*.7,nb));
 UM.himmel.material.uniforms.bew.value=Math.max(b,nb*.9);UM.ws.value*=1-.8*b;if(UM.nass)UM.nass.value+=((rg>.3?1:0)-UM.nass.value)*Math.min(1,dtR*.08);groundMat.roughness=.96-.4*(UM.nass?UM.nass.value:0);
 // Blitz
 if(an&&G.wetter.typ==='gewitter'&&rg>.6&&!paused){WET.nb-=dtR;if(WET.nb<=0){WET.nb=5+Math.random()*10;WET.blitz=1;setTimeout(()=>sfx('donner'),500+Math.random()*1800)}}WET.blitz=Math.max(0,WET.blitz-dtR*5);const bl=WET.blitz>.5||WET.blitz>.15&&WET.blitz<.3?1:0;UM.himmel.material.uniforms.blitz.value=bl;if(UM.fuell)UM.fuell.intensity+=bl*2.6;
 // Regen
 const tr=WET.tropfen,nT=SET.qual==='niedrig'?700:2600;tr.visible=rg>.03;if(tr.visible){tr.material.opacity=.42*rg*(1-.5*n);const o=GB.ob,p=WET.tp,f=paused?0:dtR*30;o.rotation.set(0,C.yaw,.12);o.scale.set(1,1,1);for(let i=0;i<nT;i++){p[i*3+1]-=f*(.9+(i%7)*.03);p[i*3]+=f*.12;if(p[i*3+1]<-1){p[i*3+1]=44;p[i*3]=Math.random()*70-35;p[i*3+2]=Math.random()*70-35}o.position.set(C.x+p[i*3],p[i*3+1],C.z+p[i*3+2]);o.updateMatrix();tr.setMatrixAt(i,o.matrix)}tr.count=nT;tr.instanceMatrix.needsUpdate=true}
 // Regenrauschen
 if(AU.c&&AU.c.state==='running'){if(!WET.gain){const s=AU.c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=AU.c.createBiquadFilter();f.type='bandpass';f.frequency.value=2600;f.Q.value=.4;WET.gain=AU.c.createGain();WET.gain.gain.value=0;s.connect(f);f.connect(WET.gain);WET.gain.connect(AU.u);s.start()}WET.gain.gain.setTargetAtTime(SHELL.titel||paused?0:rg*.04,AU.c.currentTime,.6)}}
WET.grau=new T.Color();
{const _u=umweltUpdate;umweltUpdate=function(){_u();UM.ws.value*=1-.8*WET.bew;if(UM.fuell)UM.fuell.intensity+=UM.himmel.material.uniforms.blitz.value*2.6}}
{let wl=performance.now();const _c=camUp;camUp=function(dt){_c(dt);const now=performance.now(),d=Math.min(.2,(now-wl)/1000);wl=now;if(UM.wegV!==zugV){UM.wegV=zugV;wegBauen()}wetter(d)}}
