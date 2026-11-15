/* ====== Fernkacheln: das Gelände in der Ferne aus wenigen großen Kacheln ======
   Feine Kacheln (32 × 32 Felder, mit Felsen, Büschen und Blumen) gibt es nur rund um die Kamera.
   Den Rest der Karte decken große Kacheln (128 × 128 Felder, nur Boden und Wald) ab: höchstens 64 statt bis zu 1.024 Netze,
   das spart dem Hauptstrang hunderte Zeichenaufrufe je Bild. Wo eine feine Kachel liegt, lässt die große ein Loch. */
const FK={m:new Map(),GR:4,neu:new Set()};
// Kachelgröße in kleinen Kacheln je Seite: 4 × 32 = 128 Felder
function fernBauen(bi,bj){const ch=KA.CH;KA.CH=ch*FK.GR;let k;try{k=kachelBauen(bi,bj,1)}finally{KA.CH=ch}
 const ge=k.gr.children[0].geometry;k.idx0=ge.index.array.slice();k.bi=bi;k.bj=bj;k.loch=-1;
 // Bäume: Feld je Instanz merken, damit sie unter feinen Kacheln ausgeblendet werden können
 for(const m of k.gr.children){if(!m.isInstancedMesh)continue;const a=m.instanceMatrix.array,n=m.count,t=new Int32Array(n);for(let q=0;q<n;q++){const x=Math.floor(a[q*16+12]),z=Math.floor(a[q*16+14]);t[q]=z*N+x}m.userData.t=t;m.userData.b=a.slice()}
 return k}
// Löcher: Vierecke und Bäume unter vorhandenen feinen Kacheln ausblenden
function fernLoecher(k){const CH=KA.CH,nc=N/CH,G=FK.GR,ci0=k.bi*G,cj0=k.bj*G,fein=[];let sig=0;
 for(let j=0;j<G;j++)for(let i=0;i<G;i++){const f=KA.m.get((cj0+j)*nc+ci0+i);const da=!!(f&&f.lod===0);fein.push(da);if(da)sig|=1<<(j*G+i)}
 if(sig===k.loch)return;k.loch=sig;const ge=k.gr.children[0].geometry,cv=CH*G+1,I0=k.idx0;
 if(!sig)ge.setIndex(new T.BufferAttribute(I0,1));
 else{const I=new Uint16Array(I0.length);let n=0;for(let q=0;q<I0.length;q+=6){const v=I0[q],a=v%cv,b=(v/cv)|0;if(fein[Math.floor(b/CH)*G+Math.floor(a/CH)])continue;for(let r=0;r<6;r++)I[n++]=I0[q+r]}ge.setIndex(new T.BufferAttribute(I.subarray(0,n),1))}
 for(const m of k.gr.children){if(!m.isInstancedMesh||!m.userData.t)continue;const t=m.userData.t,b=m.userData.b,a=m.instanceMatrix.array;
  for(let q=0;q<t.length;q++){const x=t[q]%N,z=(t[q]/N)|0,s=Math.floor(z/CH)-cj0,r=Math.floor(x/CH)-ci0,weg=s>=0&&r>=0&&s<G&&r<G&&fein[s*G+r];a.set(weg?ZERO:b.subarray(q*16,q*16+16),q*16)}m.instanceMatrix.needsUpdate=true}}
function fernWeg(k){terrainG.remove(k.gr);k.gr.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.isMesh)o.geometry.dispose()})}
{const _bt=buildTerrain;buildTerrain=function(){for(const k of FK.m.values())fernWeg(k);FK.m.clear();_bt()}}
// Wie weit die feinen Kacheln reichen: je weiter herausgezoomt, desto weniger Feinheit
const feinRadius=()=>C.dist<70?2:C.dist<170?1:C.dist<260?0:-1;
kachelUpdate=function(){const CH=KA.CH,nc=N/CH,G=FK.GR,nb=nc/G,cx=Math.floor(C.x/CH),cz=Math.floor(C.z/CH),nah=feinRadius(),t0=performance.now(),start=KA.neu,zeit=start?900:3;let geaendert=false;
 // Feine Kacheln: außerhalb des Radius abbauen, innerhalb aufbauen (höchstens eine je Bild, außer beim Start)
 for(const[key,k]of KA.m){const d=Math.max(Math.abs(k.ci-cx),Math.abs(k.cj-cz));if(k.lod!==0||d>nah+1){kachelWeg(k);KA.m.delete(key);geaendert=true}}
 let gebaut=0;for(let r=0;r<=nah;r++)for(let j=cz-r;j<=cz+r;j++)for(let i=cx-r;i<=cx+r;i++){if(Math.max(Math.abs(i-cx),Math.abs(j-cz))!==r||i<0||j<0||i>=nc||j>=nc)continue;const key=j*nc+i;if(KA.m.has(key))continue;
  if(!start&&gebaut)continue;if(start&&performance.now()-t0>zeit)continue;const k=kachelBauen(i,j,0);KA.m.set(key,k);decoKachel(k);gebaut++;geaendert=true}
 // Große Kacheln: die ganze Karte, nach Entfernung zur Kamera, im Zeitbudget
 const bx=Math.floor(C.x/(CH*G)),bz=Math.floor(C.z/(CH*G)),fehl=[];for(let j=0;j<nb;j++)for(let i=0;i<nb;i++)if(!FK.m.has(j*nb+i))fehl.push([Math.max(Math.abs(i-bx),Math.abs(j-bz)),i,j]);
 fehl.sort((a,b)=>a[0]-b[0]);for(const[,i,j]of fehl){if(performance.now()-t0>(start?900:6)&&FK.m.size)break;const k=fernBauen(i,j);FK.m.set(j*nb+i,k);fernLoecher(k)}
 if(geaendert)for(const k of FK.m.values())fernLoecher(k);
 KA.neu=false};
