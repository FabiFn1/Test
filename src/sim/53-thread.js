/* ====== Simulations-Thread: die Gegenstelle zum Hauptstrang ======
   Läuft nur im Web Worker. Der Thread führt die Welt; der Hauptstrang hält eine Spiegelkopie zum Zeichnen und für die Fenster.
   Nachrichten vom Hauptstrang:
     stand  – kompletter Spielstand (neues Spiel, Laden, Schau-Fabrik, Abgleich)
     ruf    – Bedienung als Funktionsaufruf (bauen, abreißen, Aufträge …), Entitäten als ID
     konf   – geänderte Einstellungen an Bauwerken [id, feld, wert]
     g      – geänderte Felder des Spielstands, die die Oberfläche führt (Komplexe, SPS, Tempo …)
     puls   – Pause, sichtbarer Ausschnitt, gewähltes Bauwerk
     speichern – Spielstand sofort schicken
   Nachrichten an den Hauptstrang: schnell (bis 30/s), langsam (10/s), selten (1/s), stand (alle 10 s und auf Anfrage) */
// Felder des Spielstands, die die Oberfläche führt; alle anderen führt die Simulation
const G_OBERFL=['kx','kxN','sps','speed','help','tut','seen','slots','aufOk','erkl','wetter','erf','cam'];
// Einstellungen an Bauwerken, die die Oberfläche setzt
const KONF=['rez','f','oc','zu','prio','gt','auto','link','tier'];
// Höhe der Teile über dem Band (wie IY im Hauptstrang)
const IY_SIM=.405;
// Bedienung, die im Thread genauso ausgeführt wird wie im Hauptstrang. Entitäten werden als ID übertragen.
const RUFE={
 place:(k,x,y,r)=>place(k,x,y,r,true),
 remove:id=>{const e=E.get(id);if(e)remove(e)},
 buildFund:(a,b,hoch)=>{fundUp=hoch;buildFund(a,b)},
 removeFund:(x,y)=>removeFund(x,y),
 tierUp:id=>{const e=E.get(id);if(e)tierUp(e)},
 reparieren:ids=>reparieren(ids.map(i=>E.get(i)).filter(Boolean)),
 reparaturAnfordern:id=>reparaturAnfordern(E.get(id)),
 auftragAn:id=>auftragAn(id),
 auftragAusliefern:id=>auftragAusliefern(id),
 auftragAbbrechen:id=>auftragAbbrechen(id),
 personalAendern:d=>personalAendern(d),
 komplexSchalten:(id,aus)=>komplexSchalten(id,aus),
 raketeStarten:id=>raketeStarten(E.get(id)),
 halleUmbau:id=>{const x=(G.kx||[]).find(q=>q.id===id);if(x)halleUmbau(x)},
 halleAuf:id=>{const x=(G.kx||[]).find(q=>q.id===id);if(x)halleAuf(x)}};
// Einstellung übernehmen. Ein neues Rezept gibt den Inhalt ins Lager zurück, wie im Maschinenfenster.
function konfSetzen(e,feld,wert){if(feld==='rez'&&e.rez!==wert&&e.inv){for(const i in e.inv)if(e.inv[i]>0)G.stock[i]=(G.stock[i]||0)+e.inv[i];e.inv={};e.prog=0;e.out=[]}
 if(wert===null)delete e[feld];else e[feld]=wert;if(feld==='link')e._pv=-1}

if(typeof importScripts==='function'){(function(){
 let pause=true,sicht=[0,0,N,N],hov=0,sel=0,letzt=performance.now(),tLang=0,tSelten=0,tStand=0,stumm=false,schritte=0;
 AMTW=new Set();
 {const _t=toast,_s=sfx;toast=function(s){if(!stumm)_t(s)};sfx=function(n){if(!stumm)_s(n)}}
 const ITEMKEYS=Object.keys(ITEMS),IDX={};ITEMKEYS.forEach((k,i)=>IDX[k]=i);
 let puf=new Float32Array(7*4096);
 const platz=n=>{if(puf.length<n){const p=new Float32Array(Math.max(n,puf.length*2));p.set(puf);puf=p}};
 // Position eines Teils auf einem Band (wie drawItems im Hauptstrang)
 const pos=(b,qt,o,i)=>{const d=b.r,dx=DX[d],dy=DY[d],y0=YL(b.z);let lx,lz,yy=0;if(b.cv===0){lx=-.5+qt;lz=0;if(b.sl){const u=qt*qt*(3-2*qt);yy=b.sl>0?u*H:(1-u)*H}}else{const f=qt*Math.PI/2;lx=.5-.5*Math.cos(f);lz=b.cv*(.5-.5*Math.sin(f))}
  o[i]=b.x+.5+lx*dx-lz*dy;o[i+1]=IY_SIM+y0+yy;o[i+2]=b.y+.5+lx*dy+lz*dx};
 const tmp=new Float32Array(3);
 function teile(){const[sx0,sz0,sx1,sz1]=sicht;let n=0;
  for(const b of belts){if(b.k==='leitung'||b.hh||!b.it.length||b.x<sx0||b.x>sx1||b.y<sz0||b.y>sz1)continue;const ex=K[b.k].v/30;platz((n+b.it.length)*7);let pv=2;
   for(const q of b.it){const q2=Math.max(q.t,Math.min(q.t+ex,pv-GAP,1));pv=q2;const o=n*7;pos(b,q.t,puf,o);pos(b,q2,tmp,0);puf[o+3]=(tmp[0]-puf[o])*30;puf[o+4]=(tmp[1]-puf[o+1])*30;puf[o+5]=(tmp[2]-puf[o+2])*30;puf[o+6]=IDX[q.k]??0;n++}}
  for(const e of splits){if(e.k!=='kreuzung'||e.x<sx0||e.x>sx1||e.y<sz0||e.y>sz1)continue;for(const l of e.sl)for(const q of l){platz((n+1)*7);const o=n*7,up=q.d%2===e.r%2,lx=-.5+q.t,v=Math.max(2.4,q.v||0);
   puf[o]=e.x+.5+lx*DX[q.d];puf[o+1]=IY_SIM+YL(e.z)+(up?.44*Math.sin(Math.PI*q.t):0);puf[o+2]=e.y+.5+lx*DY[q.d];puf[o+3]=DX[q.d]*v;puf[o+4]=0;puf[o+5]=DY[q.d]*v;puf[o+6]=IDX[q.k]??0;n++}}
  return puf.slice(0,n*7)}
 function schnell(){const it=teile(),gr=[];for(const e of splits)if(e.k==='greifer'||e.k==='langgreifer')gr.push(e.id,e.h?(IDX[e.h]??-1)+1:0,e.t);
  const w=ARB.w.map(w=>({x:w.x,y:w.y,job:w.job,typ:w.typ,path:!!w.path,last:!!w.last,r:w.r}));
  const hb=hov&&E.get(hov);postMessage({typ:'schnell',it,gr:Float32Array.from(gr),arb:w,hov:hb&&hb.it?[hov,hb.it.map(q=>q.k)]:null},[it.buffer])}
 // Felder, die die Simulation an Maschinen führt. Fehlt eines, kommt null: Der Hauptstrang entfernt es dann auch bei sich.
 const DYN=['rez','prog','hp','kaputt','burn','bau','bau0','unr','job','launch','rej','s','inv','out','off','ore','oreN','pur','repW','idle','buf','tier','jobs'];
 const zeile=e=>{const z={id:e.id,st:e.st};for(const f of DYN)z[f]=e[f]===undefined?null:e[f];
  z.fly=e.fly?{t:e.fly.t,dur:e.fly.dur,rein:e.fly.rein,n:e.fly.l.length}:null;z.zug=e.zug?{t:e.zug.t,s:e.zug.s,n:e.zug.l.length}:null;return z};
 function langsam(){const g={};for(const k in G)if(!G_OBERFL.includes(k)&&k!=='carve'&&k!=='ore'&&k!=='fund')g[k]=G[k];
  const ms=[];for(const e of machines)if(e.k!=='solar')ms.push(zeile(e));for(const e of splits)if(e.k==='verteiler'||e.k==='sortierer')ms.push({id:e.id,buf:e.buf});
  const msg=SIMMELD.splice(0);
  postMessage({typ:'langsam',g,ms,nets:nets.map(n=>[n.gen,n.dem,n.sat]),sps:(G.sps||[]).map(r=>r.q),melde:msg,pruef:[E.size,nextId],schritte})}
 function selten(){const a=[];for(const i of AMTW)a.push(i,AMT[i]);AMTW.clear();const io={};for(const[id,o]of HAL.io)io[id]=o;
  postMessage({typ:'selten',amt:Int32Array.from(a),hal:io,rate:rateShow})}
 function stand(){try{postMessage({typ:'stand',s:JSON.stringify(standDaten())})}catch(e){postMessage({typ:'fehler',text:'Spielstand: '+e.message})}}
 function takt(){const jetzt=performance.now(),dt=Math.min((jetzt-letzt)/1000,.1);letzt=jetzt;if(!G)return;
  if(!pause){const s0=SIM.schritte;simTakt(dt);schritte+=SIM.schritte-s0;if(SIM.schritte!==s0)schnell()}
  tLang+=dt;if(tLang>=.1){tLang=0;langsam()}tSelten+=dt;if(tSelten>=1){tSelten=0;selten()}tStand+=dt;if(tStand>=10){tStand=0;stand()}}
 self.onmessage=ev=>{const m=ev.data;try{
  if(m.typ==='stand'){stumm=true;standAnwenden(typeof m.s==='string'?JSON.parse(m.s):m.s);stumm=false;AMTW.clear();SIM.zuruecksetzen();postMessage({typ:'bereit',items:ITEMKEYS});langsam()}
  else if(m.typ==='ruf'){const f=RUFE[m.n];if(!f)throw new Error('Unbekannter Aufruf '+m.n);VERTRAUT=stumm=true;try{f(...m.a)}finally{VERTRAUT=stumm=false}}
  else if(m.typ==='konf'){for(const[id,feld,wert]of m.l){const e=E.get(id);if(e)konfSetzen(e,feld,wert)}}
  else if(m.typ==='g'){for(const k in m.d)G[k]=m.d[k];if('kx' in m.d)hallenFeld()}
  else if(m.typ==='puls'){pause=m.pause;if(m.sicht)sicht=m.sicht;hov=m.hov||0;sel=m.sel||0}
  else if(m.typ==='speichern')stand()}
 catch(e){postMessage({typ:'fehler',text:m.typ+': '+e.message+' '+(e.stack||'').split('\n')[1]})}};
 setInterval(takt,1000/60)})()}
