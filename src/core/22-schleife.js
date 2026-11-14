/* ====== Schleife ====== */
let miniT=0,last=performance.now(),hudT=0,saveT=0,pwT=0,beltOff=0,trick=0;
/* Simulation in festen 30 Schritten je Sekunde, unabhängig von der Bildrate */
const SIM=new SW.Simulationsschleife({hz:30,maxSchritte:8,schritt:h=>{step(h);EV.melde('schritt',h)}});
function frame(now){if(window.__noloop&&!window.__once)return;window.__once=false;const dt=Math.min((now-last)/1000,.1);last=now;panKeys(dt);camUp(dt);
 const chg=dirtyF||dirtyP||dirtyB||dirtyK;if(dirtyF)rebuildF();if(dirtyP)relist();if(dirtyB)rebuildB();if(dirtyK)rebuildK();if(chg)updateDeco();
 if(!paused){SIM.vor(dt*G.speed);
  pwT+=dt;if(pwT>.25){pwT=0;power()}trick+=dt*G.speed;if(trick>3){trick=0;if((G.stock.eisenplatte||0)<30)G.stock.eisenplatte=(G.stock.eisenplatte||0)+1}
  beltOff=(beltOff-dt*G.speed*1.6)%1;beltTex.offset.x=beltOff;
  const t=now/500;for(const k of['bohrer','schnellbohrer','fertiger','montagewerk','praezision','recycler','generator','greifer','langgreifer']){const l=byKind[k]||[];if(!l.length)continue;for(const{m,q}of KM[k]){if(!q.spin)continue;for(let i=0;i<l.length;i++){const e=l[i];if(k==='greifer'||k==='langgreifer')m.setMatrixAt(i,pmat(e,q,(e.h?Math.PI:0)+Math.PI*Math.min(1,e.t/.55)));else if(e.st==='ok')m.setMatrixAt(i,pmat(e,q,t*3+i))}m.instanceMatrix.needsUpdate=true}}}
 drawItems();drawSpecial(dt);drawSmoke(paused?0:dt);ghostUp();hudT+=dt;if(hudT>.25){hudT=0;hud()}miniT+=dt;if(miniT>1){miniT=0;miniDraw()}rateT+=dt;if(rateT>=10){rateT=0;rateH.push({...rate});for(const k in rate)delete rate[k];if(rateH.length>6)rateH.shift();rateShow={};for(const r of rateH)for(const k in r)rateShow[k]=(rateShow[k]||0)+r[k];const f=60/(rateH.length*10);for(const k in rateShow)rateShow[k]=Math.round(rateShow[k]*f)}
 saveT+=dt;if(saveT>20){saveT=0;save()}EV.melde('bild',dt);renderBild();if(!window.__noloop)requestAnimationFrame(frame)}
addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
