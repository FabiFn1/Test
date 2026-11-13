/* ====== Kachel-Gelände: Boden und Bewuchs entstehen nur rund um die Kamera ====== */
const KA={m:new Map(),deco:new Map(),occ:new Uint8Array(N*N),CH:32,neu:true,
 wob:(function(){const R=rnd(5),wc=Math.ceil(N/4)+2,a=new Float32Array(wc*wc);for(let i=0;i<a.length;i++)a[i]=R();a.wc=wc;return a})(),
 gitter:(seed,c)=>{const R=rnd(seed),a=new Float32Array((c+1)*(c+1));for(let i=0;i<a.length;i++)a[i]=R();a.c=c;return a},
 stammM:new T.MeshStandardMaterial({color:0x4c3a2c,roughness:.95,envMapIntensity:.5}),base:[lin(0x6c6a54),lin(0x75734f),lin(0x5f6a48)],rock:lin(0x756c5a)};
KA.wald=KA.gitter(23,Math.round(23*N/256));KA.nz=[KA.gitter(71,Math.round(5*N/256)),KA.gitter(711,Math.round(13*N/256))];KA.nb=[KA.gitter(72,Math.round(9*N/256)),KA.gitter(721,Math.round(27*N/256))];KA.np=KA.gitter(73,Math.round(4*N/256));
function kaN(g,x,y){const c=g.c,fx=x/N*c,fy=y/N*c,i=Math.min(Math.floor(fx),c-1),j=Math.min(Math.floor(fy),c-1),u=fx-i,v=fy-j,s=u*u*(3-2*u),t=v*v*(3-2*v),p=(a,b)=>g[b*(c+1)+a];return(p(i,j)*(1-s)+p(i+1,j)*s)*(1-t)+(p(i,j+1)*(1-s)+p(i+1,j+1)*s)*t}
function kaWn(x,z){const w=KA.wob,wc=w.wc,fx=x/4,fz=z/4,i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,p=(a,b)=>w[Math.max(0,Math.min(wc-1,b))*wc+Math.max(0,Math.min(wc-1,a))];return((p(i,j)*(1-u)+p(i+1,j)*u)*(1-v)+(p(i,j+1)*(1-u)+p(i+1,j+1)*u)*v)-.5}
function kachelBauen(ci,cj,lod){const CH=KA.CH,S=lod?1:3,cv=CH*S+1,M=5,L=cv+2*M,V=L*L,ker=[1,4,6,4,1];
 const blur=a=>{const q=new Float32Array(V);let A=a,Bb=q;for(let pass=0;pass<2;pass++){for(let j=0;j<L;j++)for(let i=0;i<L;i++){let s=0;for(let k=-2;k<=2;k++){const x=pass?i:Math.max(0,Math.min(L-1,i+k)),y=pass?Math.max(0,Math.min(L-1,j+k)):j;s+=A[y*L+x]*ker[k+2]}Bb[j*L+i]=s/16}[A,Bb]=[Bb,A]}return A};
 let B=new Float32Array(V);const oR=new Float32Array(V),oG=new Float32Array(V),oB=new Float32Array(V),oM=new Float32Array(V),i0=ci*CH*S-M,j0=cj*CH*S-M;
 for(let j=0;j<L;j++)for(let i=0;i<L;i++){const a=Math.max(0,Math.min(N-1,Math.floor((i0+i)/S))),b=Math.max(0,Math.min(N-1,Math.floor((j0+j)/S))),v=j*L+i,o=ORE[b*N+a];B[v]=TER[b*N+a];if(o){const c=ORECOL[o];oM[v]=1;oR[v]=c[0];oG[v]=c[1];oB[v]=c[2]}}
 B=blur(B);const bM=blur(oM),bR=blur(oR),bG=blur(oG),bB=blur(oB),hg=new Float32Array(V);
 for(let j=0;j<L;j++)for(let i=0;i<L;i++){const v=j*L+i,x=(i0+i)/S,z=(j0+j)/S,b=B[v]+kaWn(x,z)*.26+kaWn(x*3.1,z*3.1)*.1,l=Math.floor(b),f=b-l,s=Math.min(1,Math.max(0,(f-.22)/.56));hg[v]=YL(l+s*s*(3-2*s))}
 const hAt=(i,j)=>hg[Math.max(0,Math.min(L-1,j))*L+Math.max(0,Math.min(L-1,i))],base=KA.base,rock=KA.rock;
 const P=new Float32Array(cv*cv*3),Nn=new Float32Array(cv*cv*3),Cc=new Float32Array(cv*cv*3),U=new Float32Array(cv*cv*2),I=new Uint16Array((cv-1)*(cv-1)*6);let n=0;
 for(let b=0;b<cv;b++)for(let a=0;a<cv;a++){const i=a+M,j=b+M,v=j*L+i,q=b*cv+a,x=(i0+i)/S,z=(j0+j)/S,h=hg[v],e=Math.max(0,Math.min(1,(h+1)/5)),n1=kaWn(x*.45,z*.45)+.5,n2=kaWn(x*1.7,z*1.7)+.5,k=.86+n2*.28;
  let r=(base[0][0]*(1-n1)+base[2][0]*n1)*(.9+.5*e)*k,g=(base[0][1]*(1-n1)+base[2][1]*n1)*(.95+.4*e)*k,bl=(base[0][2]*(1-n1)+base[2][2]*n1)*(.85+.4*e)*k;
  const dx=hAt(i+1,j)-hAt(i-1,j),dz=hAt(i,j+1)-hAt(i,j-1),sl=Math.hypot(dx,dz)*S/2,rk=Math.min(1,Math.max(0,(sl-.18)/.75)),lap=(hAt(i+2,j)+hAt(i-2,j)+hAt(i,j+2)+hAt(i,j-2))/4-h,band=.82+.18*Math.sin(h*21+kaWn(x,z)*9),ao=1-Math.max(-.3,Math.min(.3,lap*1.3)),m=Math.min(1,bM[v]*1.35);
  if(m>0){const w=bM[v]||1;r=r*(1-m)+bR[v]/w*m*k;g=g*(1-m)+bG[v]/w*m*k;bl=bl*(1-m)+bB[v]/w*m*k}
  r=(r*(1-rk)+rock[0]*band*rk)*ao;g=(g*(1-rk)+rock[1]*band*rk)*ao;bl=(bl*(1-rk)+rock[2]*band*rk)*ao;
  const nx=-dx*S/2,nz=-dz*S/2,l=Math.hypot(nx,1,nz);P[q*3]=x;P[q*3+1]=h;P[q*3+2]=z;Nn[q*3]=nx/l;Nn[q*3+1]=1/l;Nn[q*3+2]=nz/l;Cc[q*3]=r;Cc[q*3+1]=g;Cc[q*3+2]=bl;U[q*2]=x/7;U[q*2+1]=z/7;
  if(a<cv-1&&b<cv-1){const c=q+cv;I[n++]=q;I[n++]=c;I[n++]=q+1;I[n++]=q+1;I[n++]=c;I[n++]=c+1}}
 const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(P,3));ge.setAttribute('normal',new T.BufferAttribute(Nn,3));ge.setAttribute('color',new T.BufferAttribute(Cc,3));ge.setAttribute('uv',new T.BufferAttribute(U,2));ge.setIndex(new T.BufferAttribute(I,1));ge.computeBoundingSphere();
 const gr=new T.Group(),bod=new T.Mesh(ge,groundMat);bod.receiveShadow=true;bod.castShadow=!lod;gr.add(bod);const k={gr,lod,ci,cj,tiles:[]};kachelDeko(k);terrainG.add(gr);return k}
function kachelDeko(k){const CH=KA.CH,lod=k.lod,Li={},ob=new T.Object3D(),cl=new T.Color();let st=0;const R=()=>(st=Math.imul(st^st>>>15,1|st)+0x6D2B79F5|0,((st^st>>>14)>>>0)/4294967296);
 const put=(key,tile,x,y,z,sx,sy,sz,ry,rz,col)=>{ob.position.set(x,y,z);ob.scale.set(sx,sy,sz);ob.rotation.set(rz||0,ry||0,rz||0);ob.updateMatrix();(Li[key]=Li[key]||[]).push({tile,m:ob.matrix.clone(),col})},pick=a=>a[Math.floor(R()*a.length)];
 for(let y=k.cj*CH;y<(k.cj+1)*CH;y++)for(let x=k.ci*CH;x<(k.ci+1)*CH;x++){if(x<2||y<2||x>=N-2||y>=N-2)continue;const i=y*N+x,o=ORE[i],l=TER[i],h=YL(l);st=(i*2654435761)|0;R();
  if(o){if(lod)continue;const pu=PUR[i];cl.setHex(ROCKCOL[o]);if(o===7){if(R()<.5){const r=.3+R()*.55;put('pool',i,x+.5,h+.015,y+.5,r,1,r,0,0,null)}if(R()<.3){const s=.08+R()*.1;put('rock',i,x+R(),h+s*.3,y+R(),s,s*.6,s,R()*6,0,cl.clone())}continue}
   const n=(pu>=4?3:pu>=2?2:1)+(R()<.5?1:0);for(let q=0;q<n;q++){const s=(.17+R()*R()*.4)*(o===5?.8:1),ax=x+.12+R()*.76,az=y+.12+R()*.76,col=cl.clone().multiplyScalar(.7+R()*.55);
    if(o===5){put('shard',i,ax,h,az,s*.5,s*(1+R()),s*.5,R()*6,(R()-.5)*.4,col);if(R()<.5)put('shard',i,ax+.12,h,az+.1,s*.3,s*.8,s*.3,R()*6,(R()-.5)*.6,col)}else put(o===4?'coal':'rock',i,ax,h+s*.42,az,s,s*(.7+R()*.55),s*(.75+R()*.4),R()*6,0,col)}continue}
  if(l<1)continue;const d=Math.hypot(x-CX,y-CX);
  if(d>33&&kaN(KA.wald,x,y)>.62&&R()<.3){if(lod&&grid[i])continue;const s=.36+R()*.34,dx=x+.2+R()*.6,dz=y+.2+R()*.6,ry=R()*6;put('nadel',i,dx,h+3.4*s,dz,s,s,s,ry,0,null);put('stamm',i,dx,h+.8*s,dz,s,s,s,ry,0,null);continue}
  if(lod)continue;
  let ufer=false;for(const[dx,dz,t]of[[-1,0,i-1],[1,0,i+1],[0,-1,i-N],[0,1,i+N]])if(TER[t]<1){ufer=true;if(R()<.7)for(let q=0;q<2;q++){const w=(R()-.5)*.9;put('schilf',i,x+.5+dx*.55+(dz?w:0),-.5,y+.5+dz*.55+(dx?w:0),1.2+R()*.6,1.5+R()*.9,1.2+R()*.6,R()*6.28,0,pick(UMC.schilf))}}
  if(ufer)continue;const eben=TER[i-1]===l&&TER[i+1]===l&&TER[i-N]===l&&TER[i+N]===l;if(!eben){if(R()<.06){const s=.25+R()*.4;put('fels',i,x+R(),h-.3+s*.3,y+R(),s,s*(.6+R()*.5),s,R()*6.28,0,pick(UMC.fels))}continue}
  const nz=kaN(KA.nz[0],x,y)*.55+kaN(KA.nz[1],x,y)*.45,nb=kaN(KA.nb[0],x,y)*.6+kaN(KA.nb[1],x,y)*.4;
  if(d>36&&nz>.56&&R()<.05){const s=.75+R()*.7,ry=R()*6.28,px=x+.2+R()*.6,pz=y+.2+R()*.6;put('laubS',i,px,h,pz,s,s,s,ry,0,null);put('laubK',i,px,h,pz,s,s*(.9+R()*.25),s,ry,0,pick(UMC.gruen))}
  else if(d>30&&nz>.5&&R()<.06){const s=.7+R()*.9;put('busch',i,x+R(),h,y+R(),s,s,s,R()*6.28,0,pick(UMC.gruen))}
  else if(R()<.005){const s=.14+R()*.22;put('fels',i,x+R(),h+s*.25,y+R(),s,s*(.6+R()*.4),s,R()*6.28,0,pick(UMC.fels))}
  if(nb>.61&&R()<.6){const pal=UMC.blume[Math.min(3,Math.floor(kaN(KA.np,x,y)*4))];for(let q=0;q<3;q++){const s=.7+R()*.7;put('blume',i,x+R(),h+.2+R()*.14,y+R(),s,1,s,0,0,pal[R()<.7?0:1])}}}
 const GM={rock:[ROCKG,rockMat],coal:[ROCKG,coalMat],shard:[SHARDG,shardMat],pool:[POOLG,poolMat],nadel:[UM.nadelG,UM.nadelM],stamm:[TREEPARTS()[2][0],KA.stammM],laubS:[UM.geo.laubS,UM.mat.laubS],laubK:[UM.geo.laubK,UM.mat.laubK],busch:[UM.geo.busch,UM.mat.busch],fels:[UM.geo.fels,UM.mat.fels],blume:[UM.geo.blume,UM.mat.blume],schilf:[UM.geo.schilf,UM.mat.schilf]},ohneS={pool:1,blume:1,schilf:1};
 for(const key in Li){const it=Li[key],q=GM[key],m=new T.InstancedMesh(q[0],q[1],it.length);it.forEach((t,j)=>{m.setMatrixAt(j,t.m);if(t.col)m.setColorAt(j,t.col);if(!lod){let a=KA.deco.get(t.tile);if(!a){a=[];KA.deco.set(t.tile,a);k.tiles.push(t.tile)}a.push([m,j])}});
  m.castShadow=!lod&&!ohneS[key];m.receiveShadow=true;m.computeBoundingSphere();if(!lod)m.userData.b=m.instanceMatrix.array.slice();k.gr.add(m)}}
function kachelWeg(k){for(const t of k.tiles){KA.deco.delete(t);KA.occ[t]=0}terrainG.remove(k.gr);k.gr.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.isMesh)o.geometry.dispose()})}
updateDeco=function(){const ch=new Set();for(const[i,l]of KA.deco){const o=grid[i]||F[i]>TER[i]||(ORE[i]&&!AMT[i])||UM.weg[i]>120?1:0;if(o!==KA.occ[i]){KA.occ[i]=o;for(const[m,q]of l){m.instanceMatrix.array.set(o?ZERO:m.userData.b.subarray(q*16,q*16+16),q*16);ch.add(m)}}}for(const m of ch)m.instanceMatrix.needsUpdate=true};
buildTerrain=function(){if(!terrainG){terrainG=new T.Group();scene.add(terrainG)}for(const k of KA.m.values())kachelWeg(k);KA.m.clear();KA.deco.clear();KA.occ.fill(0);KA.neu=true;uferBerechnen();REAL.grasAt=null;miniB=null;UM.wegV=-1};
function kachelUpdate(){const CH=KA.CH,nc=N/CH,cx=Math.floor(C.x/CH),cz=Math.floor(C.z/CH),nah=3,fern=Math.min(13,Math.max(7,Math.ceil((C.dist*1.6+150)/CH))),t0=performance.now(),zeit=KA.neu?900:7;
 for(const[key,k]of KA.m){const d=Math.max(Math.abs(k.ci-cx),Math.abs(k.cj-cz));if(d>fern+2){kachelWeg(k);KA.m.delete(key)}}
 let neu=false;for(let r=0;r<=fern;r++){for(let j=cz-r;j<=cz+r;j++)for(let i=cx-r;i<=cx+r;i++){if(Math.max(Math.abs(i-cx),Math.abs(j-cz))!==r||i<0||j<0||i>=nc||j>=nc)continue;const key=j*nc+i,k=KA.m.get(key),lod=r<=nah?0:1;
   if(k&&(k.lod===lod||(k.lod===0&&r<=nah+1)))continue;if(performance.now()-t0>zeit){KA.neu=false;if(neu)updateDeco();return}if(k)kachelWeg(k);KA.m.set(key,kachelBauen(i,j,lod));neu=true}}
 KA.neu=false;if(neu)updateDeco()}
{const _c=camUp;camUp=function(dt){_c(dt);kachelUpdate()}}
// Berge und Vögel wandern mit der Kamera, damit der Horizont überall gleich aussieht
{const _u=umweltUpdate;umweltUpdate=function(){_u();if(UM.berge)UM.berge.position.set(C.x-N/2,0,C.z-N/2)}}
for(const b of UM.vd){b.cx+=CX-128;b.cz+=CX-128}
// Trampelpfade höchstens zweimal pro Sekunde neu berechnen
{const _w=wegBauen;let wt=0;wegBauen=function(){const n=performance.now();if(n-wt<500){UM.wegV=-1;return}wt=n;_w();updateDeco()}}
// Minimap für die große Karte
$('mini').width=$('mini').height=512;
miniDraw=function(){if(!miniB)miniBase();const g=$('mini').getContext('2d'),k=512/N;g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=true;g.drawImage(miniB,0,0,512,512);g.setTransform(k,0,0,k,0,0);
 g.fillStyle='#22d0ff';for(const b of belts)g.fillRect(b.x-.5,b.y-.5,2,2);g.fillStyle='#ffc21f';for(const e of machines){const s=K[e.k].s;g.fillRect(e.x-1,e.y-1,s+2,s+2)}
 g.fillStyle='#ff2a2a';for(const e of machines)if(e.kaputt)g.fillRect(e.x-2,e.y-2,K[e.k].s+4,K[e.k].s+4);g.fillStyle='#ff4a3c';for(const n of nodes)if(n.k==='zentrale')g.fillRect(n.x-3,n.y-3,12,12);
 const r=C.dist*.62;g.strokeStyle='#fff';g.lineWidth=2.5/k*.5;g.strokeRect(C.x-r,C.z-r*.62,2*r,2*r*.62)};
