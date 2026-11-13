const $=id=>document.getElementById(id);const T=THREE;const canvas=$('c');
let ren;try{ren=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'})}catch(e){document.body.insertAdjacentHTML('beforeend','<div id="fehler">Dein Browser kann gerade kein WebGL starten. Aktiviere die Hardware-Beschleunigung und lade neu.</div>');throw e}
ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.shadowMap.enabled=true;ren.shadowMap.type=T.PCFSoftShadowMap;ren.toneMapping=T.ACESFilmicToneMapping;ren.toneMappingExposure=.82;
let groundTx=null,terrainG=null;const scene=new T.Scene();scene.fog=new T.Fog(0xc9d3d6,230,640);
const cam=new T.PerspectiveCamera(36,1,1,1200);
// Himmel und Umgebungslicht
(function(){const c=document.createElement('canvas');c.width=64;c.height=512;const g=c.getContext('2d');const l=g.createLinearGradient(0,0,0,512);l.addColorStop(0,'#5f93c4');l.addColorStop(.36,'#a9c8dc');l.addColorStop(.495,'#e6e4da');l.addColorStop(.51,'#7a7a68');l.addColorStop(1,'#4d4f43');g.fillStyle=l;g.fillRect(0,0,64,512);const t=new T.CanvasTexture(c);t.mapping=T.EquirectangularReflectionMapping;t.colorSpace=T.SRGBColorSpace;scene.background=t;const pm=new T.PMREMGenerator(ren);scene.environment=pm.fromEquirectangular(t).texture;scene.environmentIntensity=.75;pm.dispose()})();
const sun=new T.DirectionalLight(0xfff0dc,3.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
// Rand und Wald draußen
(function(){const dm=new T.Object3D();for(const[w,h,x,z]of[[2400,1200,N/2,-600],[2400,1200,N/2,N+600],[1200,N,-600,N/2],[1200,N,N+600,N/2]]){const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({color:0x4d5740,roughness:1,envMapIntensity:.4}));o.rotation.x=-Math.PI/2;o.position.set(x,-.02,z);scene.add(o)}
 const tr=[];const R2=rnd(11);for(let i=0;i<2600;i++){const a=R2()*6.283,d=N*.72+R2()*120;const x=N/2+Math.cos(a)*d,z=N/2+Math.sin(a)*d;if(x>-2&&x<N+2&&z>-2&&z<N+2)continue;tr.push([x,z,1.1+R2()*1,R2()])}
 for(const[ge,h,col]of TREEPARTS()){const m=new T.InstancedMesh(ge,new T.MeshStandardMaterial({color:col,roughness:.95,flatShading:true,envMapIntensity:.5}),tr.length);tr.forEach((t,i)=>{dm.position.set(t[0],h*t[2],t[1]);dm.scale.setScalar(t[2]);dm.rotation.y=t[3]*6;dm.updateMatrix();m.setMatrixAt(i,dm.matrix)});m.frustumCulled=false;scene.add(m)}
 const w=new T.Mesh(new T.PlaneGeometry(N,N),new T.MeshStandardMaterial({color:0x2c5364,roughness:.5,metalness:.1,transparent:true,opacity:.96,envMapIntensity:.55}));w.rotation.x=-Math.PI/2;w.position.set(N/2,-.6,N/2);scene.add(w)})();
function TREEPARTS(){return TREEPARTS.g||(TREEPARTS.g=[[new T.ConeGeometry(1.5,4.6,7),3.4,0x2e4630],[new T.ConeGeometry(1.15,3.4,7),5.2,0x324c33],[new T.CylinderGeometry(.16,.2,1.6,6),.8,0x4c3a2c]])}
const gridLines=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.09}));gridLines.visible=false;gridLines.frustumCulled=false;scene.add(gridLines);
let gridAt='';function drawGrid(force){if(!gridLines.visible)return;const k=hover[0]+','+hover[1];if(!force&&k===gridAt)return;gridAt=k;const p=[],r=26;for(let y=Math.max(0,hover[1]-r);y<Math.min(N,hover[1]+r);y++)for(let x=Math.max(0,hover[0]-r);x<Math.min(N,hover[0]+r);x++){const h=YL(Lv(x,y))+.02;p.push(x,h,y,x+1,h,y,x,h,y,x,h,y+1)}gridLines.geometry.setAttribute('position',new T.Float32BufferAttribute(p,3))}
function detailTex(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');const R=rnd(77);g.fillStyle='#d9d9d9';g.fillRect(0,0,512,512);for(let i=0;i<900;i++){const v=R()<.5?255:0,r=8+R()*40,x=R()*512,y=R()*512;for(const[a,b]of[[x,y],[x-512,y],[x,y-512],[x-512,y-512]]){const q=g.createRadialGradient(a,b,0,a,b,r);q.addColorStop(0,`rgba(${v},${v},${v},.06)`);q.addColorStop(1,`rgba(${v},${v},${v},0)`);g.fillStyle=q;g.fillRect(a-r,b-r,2*r,2*r)}}for(let i=0;i<26000;i++){const v=R()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},.1)`;g.fillRect(R()*512,R()*512,1+R()*2.5,1+R()*2.5)}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
const groundMat=new T.MeshStandardMaterial({map:detailTex(),roughness:.96,metalness:0,envMapIntensity:.5,vertexColors:true});
const lin=h=>{const c=new T.Color(h);return[c.r,c.g,c.b]};
const ORECOL=[null,lin(0x6a4030),lin(0xa56c38),lin(0x9b9789),lin(0x2a2b30),lin(0x9aa4a8),lin(0x7a3d24),lin(0x1c181e),lin(0x8f7f2c),lin(0x3f6a33)];
const ROCKCOL=[0,0x7a4634,0xbf7c3c,0xb4b0a2,0x2b2c32,0xe4eef4,0xb45a30,0x18151b,0xd8c23c,0x62b042];
let deco=null,decoOcc=null;
function buildTerrain(){if(terrainG){scene.remove(terrainG);terrainG.traverse(o=>{if(o.geometry&&o.isMesh&&!o.isInstancedMesh)o.geometry.dispose();if(o.isInstancedMesh)o.dispose()})}terrainG=new T.Group();scene.add(terrainG);
 const S=3,W=N*S+1,R=rnd(5),V=W*W,hg=new Float32Array(V),COL=new Float32Array(V*3);
 const blur=(a,ch)=>{const q=new Float32Array(V),ker=[1,4,6,4,1];let A=a,Bb=q;for(let pass=0;pass<2;pass++){for(let j=0;j<W;j++)for(let i=0;i<W;i++){let s=0;for(let k=-2;k<=2;k++){const x=pass?i:Math.max(0,Math.min(W-1,i+k)),y=pass?Math.max(0,Math.min(W-1,j+k)):j;s+=A[y*W+x]*ker[k+2]}Bb[j*W+i]=s/16}[A,Bb]=[Bb,A]}return A};
 let B=new Float32Array(V);const oR=new Float32Array(V),oG=new Float32Array(V),oB=new Float32Array(V),oM=new Float32Array(V);
 for(let j=0;j<W;j++)for(let i=0;i<W;i++){const a=Math.min(N-1,Math.floor(i/S)),b=Math.min(N-1,Math.floor(j/S)),v=j*W+i,o=ORE[b*N+a];B[v]=TER[b*N+a];if(o){const c=ORECOL[o];oM[v]=1;oR[v]=c[0];oG[v]=c[1];oB[v]=c[2]}}
 B=blur(B);const bM=blur(oM),bR=blur(oR),bG=blur(oG),bB=blur(oB);
 const wc=Math.ceil(N/4)+2,wob=new Float32Array(wc*wc).map(()=>R()),wn=(x,z)=>{const fx=x/4,fz=z/4,i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,p=(a,b)=>wob[Math.min(wc-1,b)*wc+Math.min(wc-1,a)];return((p(i,j)*(1-u)+p(i+1,j)*u)*(1-v)+(p(i,j+1)*(1-u)+p(i+1,j+1)*u)*v)-.5};
 const base=[lin(0x6c6a54),lin(0x75734f),lin(0x5f6a48)];
 for(let j=0;j<W;j++)for(let i=0;i<W;i++){const v=j*W+i,x=i/S,z=j/S,b=B[v]+wn(x,z)*.26+wn(x*3.1,z*3.1)*.1,l=Math.floor(b),f=b-l,s=Math.min(1,Math.max(0,(f-.22)/.56));hg[v]=YL(l+s*s*(3-2*s))}
 const hAt=(i,j)=>hg[Math.max(0,Math.min(W-1,j))*W+Math.max(0,Math.min(W-1,i))];
 const rock=lin(0x756c5a);
 for(let j=0;j<W;j++)for(let i=0;i<W;i++){const v=j*W+i,x=i/S,z=j/S,e=Math.max(0,Math.min(1,(hg[v]+1)/5)),n1=wn(x*.45,z*.45)+.5,n2=wn(x*1.7,z*1.7)+.5,k=.86+n2*.28;let r=(base[0][0]*(1-n1)+base[2][0]*n1)*(.9+.5*e)*k,g=(base[0][1]*(1-n1)+base[2][1]*n1)*(.95+.4*e)*k,bl=(base[0][2]*(1-n1)+base[2][2]*n1)*(.85+.4*e)*k;
  const dx=hAt(i+1,j)-hAt(i-1,j),dz=hAt(i,j+1)-hAt(i,j-1),sl=Math.hypot(dx,dz)*S/2,rk=Math.min(1,Math.max(0,(sl-.18)/.75)),lap=(hAt(i+2,j)+hAt(i-2,j)+hAt(i,j+2)+hAt(i,j-2))/4-hg[v],band=.82+.18*Math.sin(hg[v]*21+wn(x,z)*9),ao=1-Math.max(-.3,Math.min(.3,lap*1.3)),m=Math.min(1,bM[v]*1.35);
  if(m>0){const q=bM[v]||1;r=r*(1-m)+bR[v]/q*m*k;g=g*(1-m)+bG[v]/q*m*k;bl=bl*(1-m)+bB[v]/q*m*k}
  r=(r*(1-rk)+rock[0]*band*rk)*ao;g=(g*(1-rk)+rock[1]*band*rk)*ao;bl=(bl*(1-rk)+rock[2]*band*rk)*ao;COL[v*3]=r;COL[v*3+1]=g;COL[v*3+2]=bl}
 const CH=32,cv=CH*S+1;for(let cj=0;cj<N/CH;cj++)for(let ci=0;ci<N/CH;ci++){const P=new Float32Array(cv*cv*3),Nn=new Float32Array(cv*cv*3),C=new Float32Array(cv*cv*3),U=new Float32Array(cv*cv*2),I=new Uint16Array((cv-1)*(cv-1)*6);let n=0;
  for(let b=0;b<cv;b++)for(let a=0;a<cv;a++){const i=ci*CH*S+a,j=cj*CH*S+b,v=j*W+i,q=b*cv+a,x=i/S,z=j/S,h=hg[v],dx=hAt(i+1,j)-hAt(i-1,j),dz=hAt(i,j+1)-hAt(i,j-1),nx=-dx*S/2,nz=-dz*S/2,l=Math.hypot(nx,1,nz);P[q*3]=x;P[q*3+1]=h;P[q*3+2]=z;Nn[q*3]=nx/l;Nn[q*3+1]=1/l;Nn[q*3+2]=nz/l;C[q*3]=COL[v*3];C[q*3+1]=COL[v*3+1];C[q*3+2]=COL[v*3+2];U[q*2]=x/7;U[q*2+1]=z/7;if(a<cv-1&&b<cv-1){const c=q+cv;I[n++]=q;I[n++]=c;I[n++]=q+1;I[n++]=q+1;I[n++]=c;I[n++]=c+1}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(Nn,3));g.setAttribute('color',new T.BufferAttribute(C,3));g.setAttribute('uv',new T.BufferAttribute(U,2));g.setIndex(new T.BufferAttribute(I,1));g.computeBoundingSphere();const m=new T.Mesh(g,groundMat);m.receiveShadow=true;m.castShadow=true;terrainG.add(m)}
 buildDeco()}
const ROCKG=(function(){const g=new T.IcosahedronGeometry(1,1),p=g.attributes.position,R=rnd(31),seen={};for(let i=0;i<p.count;i++){const k=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(3)).join();const s=seen[k]||(seen[k]=.78+R()*.42);p.setXYZ(i,p.getX(i)*s,p.getY(i)*s,p.getZ(i)*s)}g.computeVertexNormals();return g})();
const SHARDG=new T.ConeGeometry(1,3,5);SHARDG.translate(0,1.5,0);
const POOLG=new T.CircleGeometry(1,12).rotateX(-Math.PI/2);
const rockMat=new T.MeshStandardMaterial({roughness:.78,metalness:.12,flatShading:true});
const coalMat=new T.MeshStandardMaterial({roughness:.32,metalness:.25,flatShading:true});
const shardMat=new T.MeshStandardMaterial({roughness:.12,metalness:.05,flatShading:true,emissive:0x6fc3ff,emissiveIntensity:.18,transparent:true,opacity:.92});
const poolMat=new T.MeshStandardMaterial({color:0x0e0b10,roughness:.06,metalness:.7});
function buildDeco(){deco=new Map();decoOcc=new Uint8Array(N*N);const CH=32,cc=Math.ceil(N/CH),lists={},R=rnd(19),ob=new T.Object3D(),cl=new T.Color();
 const put=(c,key,tile,m,col)=>{const id=key+':'+c;(lists[id]=lists[id]||{key,items:[]}).items.push({tile,m,col})};
 const mk=(x,y,z,sx,sy,sz,ry,rz)=>{ob.position.set(x,y,z);ob.scale.set(sx,sy,sz);ob.rotation.set(rz||0,ry||0,rz||0);ob.updateMatrix();return ob.matrix.clone()};
 const NR=rnd(23),fc=23,fg=new Float32Array((fc+1)*(fc+1)).map(()=>NR()),fn=(x,y)=>{const fx=x/N*fc,fy=y/N*fc,i=Math.min(Math.floor(fx),fc-1),j=Math.min(Math.floor(fy),fc-1),u=fx-i,v=fy-j,p=(a,b)=>fg[b*(fc+1)+a];return(p(i,j)*(1-u)+p(i+1,j)*u)*(1-v)+(p(i,j+1)*(1-u)+p(i+1,j+1)*u)*v};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,o=ORE[i],c=Math.floor(y/CH)*cc+Math.floor(x/CH),h=YL(TER[i]);
  if(o){const pu=PUR[i];cl.setHex(ROCKCOL[o]);if(o===7){if(R()<.5){const r=.3+R()*.55;put(c,'pool',i,mk(x+.5,h+.015,y+.5,r,1,r),null)}if(R()<.3){const s=.08+R()*.1;put(c,'rock',i,mk(x+R(),h+s*.3,y+R(),s,s*.6,s,R()*6),cl.clone())}continue}
   const n=(pu>=4?3:pu>=2?2:1)+(R()<.5?1:0);for(let k=0;k<n;k++){const s=(.17+R()*R()*.4)*(o===5?.8:1),ax=x+.12+R()*.76,az=y+.12+R()*.76,col=cl.clone().multiplyScalar(.7+R()*.55);
    if(o===5){put(c,'shard',i,mk(ax,h,az,s*.5,s*(1+R()),s*.5,R()*6,(R()-.5)*.4),col);if(R()<.5)put(c,'shard',i,mk(ax+.12,h,az+.1,s*.3,s*.8,s*.3,R()*6,(R()-.5)*.6),col)}
    else put(c,o===4?'coal':'rock',i,mk(ax,h+s*.42,az,s,s*(.7+R()*.55),s*(.75+R()*.4),R()*6),col)}}
  else if(TER[i]>=1&&Math.hypot(x-128,y-128)>33&&fn(x,y)>.62&&R()<.3){const s=.36+R()*.34,dx=x+.2+R()*.6,dz=y+.2+R()*.6,ry=R()*6;TREEPARTS().forEach(([,hh],q)=>put(c,'tree'+q,i,mk(dx,h+hh*s,dz,s,s,s,ry),null))}}
 const G_={rock:[ROCKG,rockMat],coal:[ROCKG,coalMat],shard:[SHARDG,shardMat],pool:[POOLG,poolMat]};const treeM=TREEPARTS().map(([ge,,col])=>[ge,new T.MeshStandardMaterial({color:col,roughness:.95,flatShading:true,envMapIntensity:.5})]);
 for(const id in lists){const{key,items}=lists[id],q=key.startsWith('tree')?treeM[+key[4]]:G_[key],m=new T.InstancedMesh(q[0],q[1],items.length);items.forEach((t,i)=>{m.setMatrixAt(i,t.m);if(t.col)m.setColorAt(i,t.col);(deco.get(t.tile)||deco.set(t.tile,[]).get(t.tile)).push([m,i])});m.castShadow=key!=='pool';m.receiveShadow=true;m.computeBoundingSphere();m.userData.b=m.instanceMatrix.array.slice();terrainG.add(m)}
 updateDeco()}
const ZERO=new Float32Array(16);
function updateDeco(){if(!deco)return;const ch=new Set();for(const[i,l]of deco){const o=grid[i]||F[i]>TER[i]||(ORE[i]&&!AMT[i])?1:0;if(o!==decoOcc[i]){decoOcc[i]=o;for(const[m,q]of l){m.instanceMatrix.array.set(o?ZERO:m.userData.b.subarray(q*16,q*16+16),q*16);ch.add(m)}}}for(const m of ch)m.instanceMatrix.needsUpdate=true}
// Materialien
const b64=(s,C)=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new C(u.buffer)};
const texCache={};const pending=[];const loader=new T.TextureLoader();
function tex(uri,srgb){if(texCache[uri])return texCache[uri];const t=loader.load(uri);pending.push(new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=uri}));t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.colorSpace=T.SRGBColorSpace;return texCache[uri]=t}
const beltTex=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#202224';g.fillRect(0,0,128,128);for(let i=0;i<4000;i++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.03)':'rgba(0,0,0,.09)';g.fillRect(Math.random()*128,Math.random()*128,2,1)}g.fillStyle='#3b3f42';for(let i=0;i<4;i++){const x=i*32;g.fillRect(x+6,8,6,112)}g.fillStyle='rgba(0,0,0,.45)';for(let i=0;i<4;i++)g.fillRect(i*32+12,8,3,112);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t})();
const mats={};
function M(n){if(mats[n])return mats[n];const d=ASSETS.mats[n];let m;
 if(n==='Band'||n==='BandStill'){m=new T.MeshStandardMaterial({map:n==='Band'?beltTex:beltTex.clone(),roughness:.85,metalness:0});if(n!=='Band')m.map.needsUpdate=true}
 else if(n==='Glut')m=new T.MeshStandardMaterial({color:0xff7a2a,emissive:0xe8480c,emissiveIntensity:.9,roughness:.6});
 else{const x=ASSETS.tex[d.t];const o=tex(x.o);m=new T.MeshStandardMaterial({map:tex(x.c,true),normalMap:tex(x.n),roughnessMap:o,metalnessMap:o,roughness:1,metalness:1});m.color.setRGB(d.f[0],d.f[1],d.f[2])}
 return mats[n]=m}
function geo(q){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(b64(q.p,Float32Array),3));g.setAttribute('normal',new T.BufferAttribute(b64(q.n,Float32Array),3));g.setAttribute('uv',new T.BufferAttribute(b64(q.u,Float32Array),2));g.setIndex(new T.BufferAttribute(b64(q.i,Uint16Array),1));return g}
const MODELS={};for(const k in ASSETS.models){const a=ASSETS.models[k];MODELS[k]=a.p.map(q=>({g:geo(q),m:q.m,piv:null})).concat((a.spin||[]).map(q=>({g:geo(q),m:q.m,spin:1,piv:a.piv})))}
