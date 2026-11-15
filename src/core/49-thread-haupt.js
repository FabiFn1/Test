/* ====== Simulations-Thread: Hauptstrang ======
   Ist der Thread aktiv, rechnet die Simulation auf einem anderen Prozessorkern (src/sim/53-thread.js).
   Der Hauptstrang zeichnet und bedient die Fenster; seine Welt ist eine Spiegelkopie, die der Thread laufend auffrischt.
   Was die Oberfläche an der Welt ändert, geht als Nachricht an den Thread:
     – Bau-, Abriss- und andere Bedienfunktionen werden dort mit denselben Werten noch einmal ausgeführt (RUFE)
     – Einstellungen an Bauwerken und Felder des Spielstands, die die Oberfläche führt, werden nach jeder Eingabe verglichen
     – neues Spiel, Laden und Schau-Fabrik schicken den kompletten Spielstand
   Ohne Thread (abgeschaltet, nicht verfügbar oder Fehler) läuft alles wie bisher im Hauptstrang. */
const THR={an:false,w:null,versucht:false,tiefe:0,items:[],it:new Float32Array(0),itT:0,gr:null,stand:null,falsch:0,schatten:new Map(),gSchatten:{},hov:null,bereitT:0};
function threadErlaubt(){return SET.thread!==false&&typeof Worker!=='undefined'&&!!document.getElementById('simcode')}
function threadStart(){THR.versucht=true;if(!threadErlaubt())return;
 try{const code=document.getElementById('simcode').textContent;THR.w=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));}
 catch(e){console.warn('Simulations-Thread nicht verfügbar, rechne im Hauptstrang',e);THR.w=null;return}
 THR.w.onmessage=e=>{THR.lief=true;threadNachricht(e)};THR.w.onerror=e=>{console.error('Simulations-Thread abgestürzt',e.message);threadStop(THR.lief)};
 THR.an=true;THR.bereitT=performance.now();threadVoll();threadAbgleich()}
// Bei einem Fehler im Thread: Simulation läuft im Hauptstrang weiter, mit dem letzten Stand des Threads
function threadStop(fehler){if(!THR.w)return;THR.w.terminate();THR.w=null;THR.an=false;if(fehler)toast('Die Simulation läuft wieder im Hauptstrang.')}
const thrPost=(m,t)=>{if(THR.w)THR.w.postMessage(m,t||[])};
// Spielstand komplett an den Thread
function threadVoll(){if(!THR.an)return;THR.schatten.clear();THR.gSchatten={};THR.stand=null;thrPost({typ:'stand',s:JSON.stringify(standDaten())});threadAbgleich(true)}
/* --- Abgleich: Einstellungen und Oberflächen-Felder des Spielstands --- */
const konfWert=v=>v===undefined?null:v;
const vergl=v=>v!==null&&typeof v==='object'?JSON.stringify(v):v;
function threadAbgleich(nurMerken){if(!THR.an||!G)return;const l=[];
 for(const e of E.values()){if(!e.inv&&!e.buf&&e.k!=='greifer'&&e.k!=='langgreifer')continue;let s=THR.schatten.get(e.id);if(!s){s={};THR.schatten.set(e.id,s)}
  for(const f of KONF){const v=konfWert(e[f]),c=vergl(v);if(s[f]!==c){if(!nurMerken||s[f]!==undefined)l.push([e.id,f,v]);s[f]=c}}}
 if(l.length&&!nurMerken)thrPost({typ:'konf',l});
 const d={};let n=0;for(const k of G_OBERFL){const c=JSON.stringify(k==='sps'?(G.sps||[]).map(r=>({...r,q:undefined})):G[k]);if(THR.gSchatten[k]!==c){THR.gSchatten[k]=c;d[k]=G[k];n++}}
 if(n&&!nurMerken)thrPost({typ:'g',d})}
// Nach jeder Eingabe (nachdem die Oberfläche reagiert hat) und einmal pro Sekunde vergleichen
for(const t of['pointerup','click','keyup','change','input'])document.addEventListener(t,()=>{if(THR.an)queueMicrotask(threadAbgleich)},true);
setInterval(()=>threadAbgleich(),1000);
/* --- Bedienfunktionen spiegeln: nur der äußerste Aufruf geht an den Thread --- */
function spiegeln(name,f,werte,nurWenn){return function(...a){if(!THR.an||THR.tiefe)return f.apply(this,a);THR.tiefe++;try{threadAbgleich();const r=f.apply(this,a);if(!nurWenn||nurWenn(r))thrPost({typ:'ruf',n:name,a:werte(...a)});return r}finally{THR.tiefe--}}}
const idv=e=>e&&e.id;
place=spiegeln('place',place,(k,x,y,r)=>[k,x,y,r],r=>r===true);
remove=spiegeln('remove',remove,e=>[idv(e)]);
buildFund=spiegeln('buildFund',buildFund,(a,b)=>[a,b,fundUp]);
removeFund=spiegeln('removeFund',removeFund,(x,y)=>[x,y],r=>!!r);
tierUp=spiegeln('tierUp',tierUp,e=>[idv(e)],r=>!!r);
reparieren=spiegeln('reparieren',reparieren,l=>[l.map(idv)]);
reparaturAnfordern=spiegeln('reparaturAnfordern',reparaturAnfordern,e=>[idv(e)]);
auftragAn=spiegeln('auftragAn',auftragAn,id=>[id]);
auftragAusliefern=spiegeln('auftragAusliefern',auftragAusliefern,id=>[id]);
auftragAbbrechen=spiegeln('auftragAbbrechen',auftragAbbrechen,id=>[id]);
personalAendern=spiegeln('personalAendern',personalAendern,d=>[d]);
komplexSchalten=spiegeln('komplexSchalten',komplexSchalten,(id,aus)=>[id,aus]);
raketeStarten=spiegeln('raketeStarten',raketeStarten,e=>[idv(e)]);
halleUmbau=spiegeln('halleUmbau',halleUmbau,x=>[x.id]);
halleAuf=spiegeln('halleAuf',halleAuf,x=>[x.id]);
// Ganze Welt neu: danach den kompletten Stand an den Thread
for(const n of['fresh','standAnwenden','schauFabrik']){const f=globalThis[n];const w=function(...a){THR.tiefe++;let r;try{r=f.apply(this,a)}finally{THR.tiefe--}if(THR.an&&!THR.tiefe)threadVoll();return r};
 if(n==='fresh')fresh=w;else if(n==='standAnwenden')standAnwenden=w;else schauFabrik=w}
/* --- Nachrichten vom Thread --- */
function threadNachricht(ev){const m=ev.data;
 if(m.typ==='schnell'){THR.it=m.it;THR.itT=performance.now();THR.gr=m.gr;
  for(let i=0;i<m.gr.length;i+=3){const e=E.get(m.gr[i]);if(e){const v=m.gr[i+1];e.h=v?THR.items[v-1]||null:null;e.t=m.gr[i+2]}}
  ARB.w.length=0;for(const w of m.arb)ARB.w.push(w);if(m.hov){const b=E.get(m.hov[0]);if(b&&b.it)b.it=m.hov[1].map(k=>({k,t:.5}))}}
 else if(m.typ==='langsam'){Object.assign(G,m.g);
  for(const z of m.ms){const e=E.get(z.id);if(!e)continue;const warBau=!!e.bau,fl=e.fly;
   for(const f in z){if(f==='id')continue;const v=z[f];
    // Ein Rezept, das die Simulation selbst gewählt hat, nur übernehmen, wenn die Oberfläche keins gesetzt hat
    if(f==='rez'){if(e.rez===undefined&&v!==null){e.rez=v;const s=THR.schatten.get(e.id);if(s)s.rez=v}continue}
    if(v===null&&f!=='fly'&&f!=='zug')delete e[f];else e[f]=v}
   // Laufende Drohnenflüge nicht zurückspringen lassen: Der Hauptstrang schreibt sie zwischen den Abgleichen selbst fort
   if(fl&&e.fly&&fl.dur===e.fly.dur&&fl.rein===e.fly.rein&&fl.t>e.fly.t&&fl.t-e.fly.t<.25)e.fly.t=fl.t;
   if(warBau!==!!e.bau)dirtyK=true}
  m.nets.forEach((v,i)=>{const n=nets[i];if(n){n.gen=v[0];n.dem=v[1];n.sat=v[2]}});
  (G.sps||[]).forEach((r,i)=>{r.q=m.sps[i]});
  for(const[a,b]of m.melde){if(a==='toast')toast(b);else if(a==='sfx')sfx(b)}
  // Stimmt die Welt nicht mehr überein (Anzahl oder nächste ID), holt sich der Hauptstrang nach kurzer Zeit den Stand des Threads
  const ok=m.pruef[0]===E.size&&m.pruef[1]===nextId;THR.falsch=ok?0:THR.falsch+1;if(THR.falsch>=10){THR.falsch=0;thrPost({typ:'speichern'});THR.abgleichNoetig=true}}
 else if(m.typ==='selten'){const a=m.amt;for(let i=0;i<a.length;i+=2){const t=a[i],alt=AMT[t];AMT[t]=a[i+1];if(PID[t]>=0)PT[PID[t]]=(PT[PID[t]]||0)+a[i+1]-alt;if(!a[i+1])dirtyK=true}if(a.length)updateDeco();
  HAL.io.clear();for(const id in m.hal)HAL.io.set(+id,m.hal[id]);rateShow=m.rate}
 else if(m.typ==='stand'){THR.stand=m.s;if(THR.nachschreiben&&!THR.abgleichNoetig){THR.nachschreiben=false;THR.ohnePost=true;try{save(true)}finally{THR.ohnePost=false}}if(THR.abgleichNoetig){THR.abgleichNoetig=false;console.warn('Welt weicht vom Simulations-Thread ab, übernehme dessen Stand');THR.tiefe++;try{const s=JSON.parse(m.s);standAnwenden(s);dirtyB=dirtyK=dirtyP=dirtyF=true}finally{THR.tiefe--}threadAbgleich(true)}}
 else if(m.typ==='bereit'){THR.items=m.items}
 else if(m.typ==='fehler')console.error('Simulations-Thread:',m.text)}
/* --- Im Bild: Puls an den Thread, Material auf Bändern aus dem Thread zeichnen, laufende Bewegungen fortschreiben --- */
function threadPuls(dt){sichtFeld();thrPost({typ:'puls',pause:paused||SHELL.titel,sicht:SICHT.slice(),hov:hoverBand(),sel:sel?sel.id:0});
 for(const e of byKind.versand||[])if(e.fly)e.fly.t=Math.min(.999,e.fly.t+dt*G.speed/e.fly.dur);
 for(const e of byKind.drohnenhafen||[])if(e.fly)e.fly.t=Math.min(.999,e.fly.t+dt*G.speed/(e.fly.dur||1));
 for(const e of byKind.raketensilo||[])if(e.launch!==undefined)e.launch+=dt*G.speed}
function hoverBand(){const e=typeof hover!=='undefined'&&hover?at(hover[0],hover[1]):null;return e&&isBelt(e)?e.id:0}
function threadItems(){const weit=C.dist>200,gr=weit?Math.min(2.8,C.dist/200):1,a=THR.it,alter=Math.min((performance.now()-THR.itT)/1000,.05),keys=THR.items;
 for(const t in IP)IP[t].beginne();
 for(let i=0;i<a.length;i+=7){if(weit&&(i/7)&1)continue;const k=keys[a[i+6]];if(!k||!ITEMS[k])continue;IP[ITEMS[k][2]].setzeDirekt(a[i]+a[i+3]*alter,a[i+1]+a[i+4]*alter,a[i+2]+a[i+5]*alter,gr,icol[k])}
 for(const t in IP)IP[t].abschliessen()}
// Speichern: Im Thread-Betrieb kommt der Spielstand vom Thread (er hat den echten Stand aller Bänder und Maschinen)
// Gespeichert wird sofort der letzte Stand des Threads (höchstens 10 s alt); sobald der frisch angeforderte da ist, wird er nachgeschrieben
{const _t=standText;standText=function(){if(!THR.an||!THR.stand)return _t();if(!THR.ohnePost&&!THR.nachschreiben){THR.nachschreiben=true;thrPost({typ:'speichern'})}return THR.stand}}
