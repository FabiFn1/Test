/* ====== Schleife ====== */
let miniT=0,last=performance.now(),hudT=0,saveT=0,beltOff=0;
/* Leistungsmessung: gleitender Mittelwert je Bereich in ms pro Bild */
const LZ={w:{},add(k,ms){this.w[k]=(this.w[k]??ms)*.92+ms*.08}};
function frame(now){if(window.__noloop&&!window.__once)return;window.__once=false;const dt=Math.min((now-last)/1000,.1);last=now;panKeys(dt);camUp(dt);
 const chg=dirtyF||dirtyP||dirtyB||dirtyK;if(dirtyF)rebuildF();if(dirtyP)relist();if(dirtyB)rebuildB();if(dirtyK)rebuildK();if(chg)updateDeco();
 if(!paused){const t0=performance.now();simTakt(dt);LZ.add('sim',performance.now()-t0);
  beltOff=(beltOff-dt*G.speed*1.6)%1;beltTex.offset.x=beltOff;
  const t=now/500;for(const k of['bohrer','schnellbohrer','fertiger','montagewerk','praezision','recycler','generator','greifer','langgreifer']){const l=byKind[k]||[];if(!l.length)continue;for(const{m,q}of KM[k]){if(!q.spin)continue;for(let i=0;i<l.length;i++){const e=l[i];if(k==='greifer'||k==='langgreifer')m.setMatrixAt(i,pmat(e,q,(e.h?Math.PI:0)+Math.PI*Math.min(1,e.t/.55)));else if(e.st==='ok')m.setMatrixAt(i,pmat(e,q,t*3+i))}m.instanceMatrix.needsUpdate=true}}}
 {const t0=performance.now();drawItems();LZ.add('baender',performance.now()-t0)}drawSpecial(dt);drawSmoke(paused?0:dt);ghostUp();hudT+=dt;if(hudT>.25){hudT=0;hud()}miniT+=dt;if(miniT>1){miniT=0;miniDraw()}
 saveT+=dt;if(saveT>20){saveT=0;save()}EV.melde('bild',dt);{const t0=performance.now();renderBild();LZ.add('render',performance.now()-t0)}if(!window.__noloop)requestAnimationFrame(frame)}
addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
