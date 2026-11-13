/* ====== Bildrate, Vollbild, Rohrleitungen ====== */
window.__fr=0;
{const _f=frame;let letzt=0;frame=function(now){const lim=SET.fpsMax||0;if(lim&&!window.__noloop&&now-letzt<1000/lim-1.2){requestAnimationFrame(frame);return}letzt=now;window.__fr++;_f(now)}}
function vollbild(){const d=document;if(d.fullscreenElement)d.exitFullscreen();else d.documentElement.requestFullscreen&&d.documentElement.requestFullscreen().catch(()=>toast('Vollbild ist hier nicht möglich. Probier F11.'))}
for(const[id,vor]of[['p-voll','p-hilfe'],['t-voll','t-hilfe']]){const b=document.createElement('button');b.id=id;b.textContent='Vollbild an/aus';b.onclick=vollbild;$(vor).before(b)}
// Kacheln: höchstens eine nahe Kachel jedes zweite Bild, Bewuchs nur für neue Kacheln abgleichen
function decoKachel(k){const ch=new Set();for(const i of k.tiles){const l=KA.deco.get(i);if(!l)continue;const o=grid[i]||F[i]>TER[i]||(ORE[i]&&!AMT[i])||UM.weg[i]>120?1:0;if(o!==KA.occ[i]){KA.occ[i]=o;for(const[m,q]of l){m.instanceMatrix.array.set(o?ZERO:m.userData.b.subarray(q*16,q*16+16),q*16);ch.add(m)}}}for(const m of ch)m.instanceMatrix.needsUpdate=true}
{let bild=0;kachelUpdate=function(){const CH=KA.CH,nc=N/CH,cx=Math.floor(C.x/CH),cz=Math.floor(C.z/CH),nah=3,fern=Math.min(13,Math.max(7,Math.ceil((C.dist*1.6+150)/CH))),t0=performance.now(),start=KA.neu,zeit=start?900:2.5;bild++;
 for(const[key,k]of KA.m){const d=Math.max(Math.abs(k.ci-cx),Math.abs(k.cj-cz));if(d>fern+2){kachelWeg(k);KA.m.delete(key)}}
 let naheGebaut=0;for(let r=0;r<=fern;r++){for(let j=cz-r;j<=cz+r;j++)for(let i=cx-r;i<=cx+r;i++){if(Math.max(Math.abs(i-cx),Math.abs(j-cz))!==r||i<0||j<0||i>=nc||j>=nc)continue;const key=j*nc+i,k=KA.m.get(key),lod=r<=nah?0:1;
   if(k&&(k.lod===lod||(k.lod===0&&r<=nah+1)))continue;
   if(!start){if(lod===0){if(naheGebaut||bild%2||(k&&r>1&&bild%6))continue}else if(performance.now()-t0>zeit)continue}else if(performance.now()-t0>zeit){KA.neu=false;return}
   // nahe Kachel, die noch als ferne existiert, bleibt sichtbar bis die neue fertig ist
   const neu=kachelBauen(i,j,lod);if(k)kachelWeg(k);KA.m.set(key,neu);if(!lod){decoKachel(neu);naheGebaut++}}}
 KA.neu=false}}
// Gras seltener neu aufbauen
{const _g=grasBauen;let gt=0;grasBauen=function(){const n=performance.now();if(REAL.grasAt&&n-gt<350)return;gt=n;_g()}}
/* --- Rohrleitungen: Flüssigkeiten laufen nur durch Rohre --- */
const ROHR=(function(){const mat=M('Stahl_Verzinkt'),halb=new T.CylinderGeometry(.13,.13,.5,12,1,true);halb.rotateZ(Math.PI/2);halb.translate(.25,0,0);const mk=(g,m,n)=>{const q=new T.InstancedMesh(g,m,n);q.count=0;q.frustumCulled=false;q.castShadow=true;q.receiveShadow=true;scene.add(q);return q};
 const fl=new T.CylinderGeometry(.17,.17,.05,12);fl.rotateZ(Math.PI/2);fl.translate(.47,0,0);
 return{halb:mk(halb,mat,16000),knoten:mk(new T.SphereGeometry(.14,12,8),mat,8000),flansch:mk(fl,M('Lack_Dunkel'),16000),stuetze:mk(new T.BoxGeometry(.07,.2,.07),M('Lack_Dunkel'),8000)}})();
function rohreBauen(){const o=GB.ob;let nh=0,nk=0,ns=0;for(const b of belts){if(b.k!=='leitung')continue;const y=YL(b.z)+.3,cx=b.x+.5,cz=b.y+.5,arm=d=>{if(nh>=16000)return;o.position.set(cx,y,cz);o.rotation.set(0,-d*Math.PI/2,0);o.scale.set(1,1,1);o.updateMatrix();ROHR.halb.setMatrixAt(nh,o.matrix);ROHR.flansch.setMatrixAt(nh,o.matrix);nh++};
  arm(b.r);let ein=0;for(let d=0;d<4;d++){if(d===b.r)continue;const q=at(b.x+DX[d],b.y+DY[d]);if(q&&feeds(q,b.x,b.y,(d+2)%4)){arm(d);ein++}}if(!ein)arm((b.r+2)%4);
  if(nk<8000){o.position.set(cx,y,cz);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.updateMatrix();ROHR.knoten.setMatrixAt(nk++,o.matrix);o.position.set(cx,y-.2,cz);o.updateMatrix();ROHR.stuetze.setMatrixAt(ns++,o.matrix)}}
 ROHR.halb.count=ROHR.flansch.count=nh;ROHR.knoten.count=nk;ROHR.stuetze.count=ns;for(const k in ROHR)ROHR[k].instanceMatrix.needsUpdate=true}
{const _b=rebuildB;rebuildB=function(){_b();rohreBauen()}}
ERKL['Antrieb']=['Flüssigkeiten und Rohre','Mit der Ölpumpe kommen Flüssigkeiten ins Werk: Rohöl, Schmierstoff, Treibstoff und Schwefelsäure.',['Flüssigkeiten laufen nur durch Rohrleitungen, nicht über Bänder. Feste Stoffe passen nicht ins Rohr.','Rohre verlegst du wie Bänder: Werkzeug wählen und ziehen. Sie kosten je Feld 1 Rohr.','Führ das Rohr direkt in die Maschine oder in die Zentrale. Greifarme können aus Rohren nichts entnehmen.','Verteiler funktionieren auch als Abzweig für Rohre.'],'Kunststoff und Gummi sind fest und laufen weiter über Bänder.'];
