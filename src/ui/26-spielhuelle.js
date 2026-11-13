/* ====== Spielhülle: Einstellungen, Ton, Titel, Pause ====== */
const EK='schichtwerk-einst';
const SET_STD={fpsMax:144,symbole:true,autoQ:true,leben:true,wetter:true,nacht:true,ao:true,gras:true,spiegel:true,master:.8,sfx:.8,musik:.5,umgebung:.5,qual:TOUCH?'mittel':'hoch',rauch:true,fps:false,kamera:1,zoomUm:false,rand:false,ui:1,auto:20};
const SET={...SET_STD};try{Object.assign(SET,JSON.parse(SPEICHER.getItem(EK))||{})}catch(e){}
function setSave(){try{SPEICHER.setItem(EK,JSON.stringify(SET))}catch(e){}}

/* --- Ton: alles wird live mit WebAudio erzeugt --- */
const AU={c:null,m:null,s:null,mu:null,u:null,noise:null,last:{},beat:0,next:0};
function auStart(){if(AU.c){if(AU.c.state==='suspended')AU.c.resume();return}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 try{const c=AU.c=new AC();const g=()=>c.createGain();AU.m=g();AU.s=g();AU.mu=g();AU.u=g();AU.s.connect(AU.m);AU.mu.connect(AU.m);AU.u.connect(AU.m);
  const comp=c.createDynamicsCompressor();AU.m.connect(comp);comp.connect(c.destination);
  const len=c.sampleRate*2,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;AU.noise=b;
  // Musik: Hall über Delay
  const dl=c.createDelay(1),fb=g(),wet=g();dl.delayTime.value=.42;fb.gain.value=.38;wet.gain.value=.35;dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(AU.mu);AU.hall=dl;
  // Werkshalle: gefiltertes Rauschen
  const n=c.createBufferSource();n.buffer=b;n.loop=true;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;AU.hum=g();AU.hum.gain.value=0;n.connect(lp);lp.connect(AU.hum);AU.hum.connect(AU.u);n.start();
  auVol();AU.next=c.currentTime+.3}catch(e){AU.c=null}}
function auVol(){if(!AU.c)return;const t=AU.c.currentTime;AU.m.gain.setTargetAtTime(SET.master,t,.05);AU.s.gain.setTargetAtTime(SET.sfx,t,.05);AU.mu.gain.setTargetAtTime(SET.musik*.55,t,.3);AU.u.gain.setTargetAtTime(SET.umgebung,t,.3)}
function ton(f,typ,t0,dur,vol,ziel,f2){const c=AU.c,o=c.createOscillator(),g=c.createGain();o.type=typ;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(ziel||AU.s);o.start(t0);o.stop(t0+dur+.05)}
function rausch(t0,dur,vol,typ,f,f2,q){const c=AU.c,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;fl.type=typ;fl.frequency.setValueAtTime(f,t0);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t0+dur);fl.Q.value=q||1;g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(fl);fl.connect(g);g.connect(AU.s);s.start(t0,Math.random());s.stop(t0+dur+.05)}
function sfx(n){if(!AU.c||AU.c.state!=='running'||!SET.sfx||!SET.master)return;const now=AU.c.currentTime;if(now-(AU.last[n]||0)<({band:.045,klick:.03,abriss:.06}[n]||.02))return;AU.last[n]=now;const t=now+.005;
 switch(n){
  case'klick':ton(1500,'square',t,.03,.035);break;
  case'band':ton(820+Math.random()*80,'triangle',t,.05,.07);rausch(t,.04,.05,'highpass',3000);break;
  case'bau':ton(150,'sine',t,.16,.35,null,55);rausch(t,.09,.18,'lowpass',900,200);ton(620,'triangle',t+.02,.07,.05);break;
  case'abriss':rausch(t,.28,.22,'bandpass',1400,180,1.5);ton(300,'sawtooth',t,.18,.05,null,80);break;
  case'fehler':ton(150,'sawtooth',t,.09,.08);ton(118,'sawtooth',t+.11,.13,.08);break;
  case'meilenstein':[523.3,659.3,784,1046.5].forEach((f,i)=>{ton(f,'triangle',t+i*.11,.55,.13);ton(f*2,'sine',t+i*.11,.3,.03)});ton(261.6,'sine',t+.33,1.2,.12);break;
  case'donner':rausch(t,2.6,.22,'lowpass',240,50,.6);rausch(t+.15,1.2,.12,'lowpass',900,120,.5);ton(48,'sine',t,2.2,.12,null,30);break;
  case'pfiff':ton(880,'square',t,.35,.05);ton(1108,'square',t,.35,.04);ton(880,'square',t+.45,.5,.05);ton(1108,'square',t+.45,.5,.04);break;
  case'kasse':ton(1318.5,'square',t,.08,.04);ton(1760,'square',t+.07,.18,.04);break;
  case'rakete':rausch(t,4,.35,'lowpass',120,1600,.7);ton(55,'sawtooth',t,3.5,.12,null,110);[392,523.3,659.3,784].forEach((f,i)=>ton(f,'triangle',t+1+i*.2,1.4,.1));break}}
// Generative Musik: ruhige Flächen und vereinzelte Töne in d-Moll
const AKK=[[146.8,174.6,220,261.6],[116.5,146.8,174.6,220],[174.6,220,261.6,329.6],[130.8,164.8,196,246.9]],PENTA=[293.7,349.2,392,440,523.3,587.3,698.5];
function musik(){if(!AU.c||AU.c.state!=='running')return;const c=AU.c;if(!SET.musik||!SET.master){AU.next=c.currentTime+.5;return}while(AU.next<c.currentTime+.6){const t=AU.next,bar=AU.beat++,a=AKK[Math.floor(bar/4)%4];
 if(bar%4===0)for(const f of a){for(const d of[-4,4]){const o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;o.detune.value=d;fl.type='lowpass';fl.frequency.value=650;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022,t+2.2);g.gain.setValueAtTime(.022,t+6);g.gain.linearRampToValueAtTime(0,t+8.4);o.connect(fl);fl.connect(g);g.connect(AU.mu);o.start(t);o.stop(t+8.6)}}
 if(Math.random()<.55){const f=PENTA[Math.floor(Math.random()*PENTA.length)],o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(g);g.connect(AU.mu);g.connect(AU.hall);o.start(t);o.stop(t+1.7)}
 AU.next+=2}}
['pointerdown','keydown','touchstart'].forEach(t=>addEventListener(t,auStart,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AU.c)return;if(document.hidden)AU.c.suspend();else AU.c.resume()});
document.addEventListener('click',ev=>{if(ev.target.closest('button'))sfx('klick')},true);

/* --- Spielfunktionen anhängen (Ton, Fehlerkorrekturen) --- */
{const _place=place;place=function(k,x,y,r,quiet){const ok=_place(k,x,y,r,quiet);if(ok)sfx(BK(k)?'band':'bau');return ok}}
{const _remove=remove;remove=function(e){const n=E.size;_remove(e);if(E.size<n)sfx('abriss')}}
{const _rf=removeFund;removeFund=function(x,y){const ok=_rf(x,y);if(ok)sfx('abriss');return ok}}
{const _bf=buildFund;buildFund=function(a,b){const n=F.reduce((s,v)=>s+v,0);_bf(a,b);if(F.reduce((s,v)=>s+v,0)!==n)sfx('bau')}}
{const _toast=toast;toast=function(s){_toast(s);
 if(/^Meilenstein geschafft/.test(s))sfx('meilenstein');else if(/^Auftrag erfüllt/.test(s))sfx('kasse');else if(/^Rakete im All/.test(s)){sfx('rakete');if(G.rockets===1)ende('rakete')}
 else if(/^(Nicht genug|Hier |Der Boden|Bohrer müssen|Ölpumpen|Dieser Platz|Noch |Material fehlt|Keine Ersatzteile|Das Silo)/.test(s))sfx('fehler')}}
{const _pk=panKeys;panKeys=dt=>_pk(dt*SET.kamera)}
{const _cu=camUp;camUp=function(dt){if(SHELL.titel)C.tyaw+=dt*.045;else if(SET.rand&&mausDrin&&!drag&&!rpan&&!orbit&&$('menu').hidden&&$('lw').hidden){const m=24,v=C.dist*.9*dt*SET.kamera;let f=0,s=0;if(mouse[0]<m)s=-1;else if(mouse[0]>innerWidth-m)s=1;if(mouse[1]<m)f=1;else if(mouse[1]>innerHeight-m)f=-1;if(f||s){const c=Math.cos(C.yaw),n=Math.sin(C.yaw);C.tx+=(s*c-f*n)*v;C.tz+=(-s*n-f*c)*v;clampC()}}_cu(dt)}}
let mausDrin=false;document.addEventListener('mouseleave',()=>{mausDrin=false});document.addEventListener('mousemove',()=>{mausDrin=true});
canvas.addEventListener('wheel',ev=>{if(!SET.zoomUm)return;ev.stopImmediatePropagation();ev.preventDefault();C.tdist=T.MathUtils.clamp(C.tdist*Math.pow(1.0015,-ev.deltaY),14,260)},{passive:false,capture:true});
// Speichern: Intervall aus den Einstellungen, Fehler melden
let lastSave=0,saveWarn=0;
{const _save=save;save=function(force){if(force!==true&&!(force instanceof Event)&&performance.now()-lastSave<SET.auto*1000-50)return true;
 // Das Original fängt Schreibfehler still ab, deshalb wird setItem kurz überwacht
 let ok=true;const orig=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){try{return orig.call(this,k,v)}catch(e){if(k===SK)ok=false;throw e}};try{_save()}catch(e){ok=false}finally{Storage.prototype.setItem=orig}
 lastSave=performance.now();if(!ok){if(performance.now()-saveWarn>60000){saveWarn=performance.now();toast('Speichern fehlgeschlagen: Der Browser-Speicher ist voll.')}}else if(force!==undefined||SHELL.zeig){const g=$('gesp');g.classList.add('an');setTimeout(()=>g.classList.remove('an'),1400)}return ok}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)save(true)});
// Wartungsaufträge nach dem Laden den neuen Maschinen-IDs zuordnen
{const _load=load;load=function(){let alt=null;try{alt=JSON.parse(SPEICHER.getItem(SK))}catch(e){}const ok=_load();if(ok&&alt){const idm={};let i=0;const es=[...E.values()];for(const o of alt.es){if(es[i])idm[o.oid]=es[i].id;i++}for(const e of es)if(e.jobs)e.jobs=e.jobs.filter(j=>idm[j.id]).map(j=>({...j,id:idm[j.id]}))}return ok}}
function spielzeit(s){s=Math.floor(s||0);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h} h ${m} min`:`${m} min`}

/* --- Grafik --- */
function grafik(){const q=SET.qual,dpr=devicePixelRatio||1;ren.setPixelRatio(q==='niedrig'?Math.min(dpr,1)*.8:q==='mittel'?Math.min(dpr,1.5):Math.min(dpr,2));
 const sh=q!=='niedrig',ms=q==='hoch'?2048:1024;if(ren.shadowMap.enabled!==sh||sun.shadow.mapSize.x!==ms){ren.shadowMap.enabled=sh;sun.castShadow=sh;sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)}})}
 size();smI.visible=false;$('fps').hidden=!SET.fps;document.documentElement.style.setProperty('--ui',SET.ui)}

/* --- Menüs --- */
const SHELL={titel:false,pause:false,vorher:false,zeig:true,hatSpiel:false,zurueck:null};
function offen(id){const e=$(id);return e&&!e.hidden}
function spielStop(){if(!SHELL.pause&&!SHELL.titel)SHELL.vorher=paused;setSpeed(0)}
function spielWeiter(){setSpeed(SHELL.vorher?0:(G.speed||1));canvas.focus()}
function titelZeigen(){spielStop();SHELL.titel=true;document.documentElement.classList.add('titel');$('pause').hidden=true;SHELL.pause=false;setTool(null);select(null);menuOpen(false);lwOpen(false);$('mini').classList.remove('gross');
 SHELL.hatSpiel=E.size>9||G.ms>0||(G.t||0)>60;$('t-weiter').hidden=!SHELL.hatSpiel;$('t-neu').classList.toggle('haupt',!SHELL.hatSpiel);
 const m=MS[G.ms];$('t-info').textContent=SHELL.hatSpiel?`Meilenstein ${Math.min(G.ms+1,MS.length)} von ${MS.length}${m?' · '+m.n:''} · ${spielzeit(G.t)}`:'';$('titel').hidden=false;setTimeout(()=>($(SHELL.hatSpiel?'t-weiter':'t-neu')).focus(),50)}
function titelWeg(){SHELL.titel=false;document.documentElement.classList.remove('titel');$('titel').hidden=true;spielWeiter();if(!G.help)$('hilfe').hidden=false}
function pauseZeigen(){if(SHELL.titel)return;spielStop();SHELL.pause=true;setTool(null);
 const hq=nodes.find(n=>n.k==='zentrale'),n=hq&&hq.net;const lauf=machines.filter(e=>e.st==='ok').length;
 $('p-kenn').innerHTML=[['Spielzeit',spielzeit(G.t)+' · '+uhrzeit()+' Uhr · '+(SET.wetter!==false&&G.wetter?WET.name[G.wetter.typ]:'Klar')],['Meilenstein',`${Math.min(G.ms+1,MS.length)} / ${MS.length}`],['Raketen',G.rockets||0],['Maschinen',machines.length],['davon in Betrieb',lauf],['Strom',n?`${n.dem.toFixed(0)} / ${n.gen.toFixed(0)} MW`:'–']].map(([a,b])=>`<div><span class="etikett">${a}</span><b>${b}</b></div>`).join('');
 $('pause').hidden=false;setTimeout(()=>$('p-weiter').focus(),30)}
function pauseWeg(){$('pause').hidden=true;SHELL.pause=false;spielWeiter()}
function neuesSpiel(){if(SHELL.hatSpiel||E.size>9){$('frage').hidden=false;$('janeu').focus()}else{if(SHELL.titel)titelWeg();else pauseWeg()}}
function hilfeZeigen(zurueck){SHELL.zurueck=zurueck;$('hilfe').hidden=false;$('hzu').textContent=zurueck?'Zurück':'Schicht beginnen';$('hzu').focus()}
function ende(art){const d=$('ende').firstElementChild;d.innerHTML=art==='rakete'?`<div class="streifen"></div><h1>Rakete gestartet.</h1><div>Dein Werk hat es bis ins All geschafft. Du kannst weiterbauen und weitere Raketen starten.</div><button id="endezu">Weiterbauen</button>`:`<div class="streifen"></div><h1>Alle Meilensteine geschafft.</h1><div>Jetzt fehlt nur noch der Start: Bau ein Raketensilo, füll es mit ${SILOTXT} Raketenteilen und schick die Rakete ins All.</div><button id="endezu">Weiterbauen</button>`;$('endezu').onclick=()=>{$('ende').hidden=true;canvas.focus()};$('ende').hidden=false;if(art!=='rakete')sfx('meilenstein')}
UI.ende=()=>ende('ms');

$('t-weiter').onclick=titelWeg;$('t-neu').onclick=neuesSpiel;$('t-einst').onclick=()=>einstZeigen();$('t-hilfe').onclick=()=>hilfeZeigen('titel');$('t-ueber').onclick=()=>{$('ueber').hidden=false;$('u-zu').focus()};$('u-zu').onclick=()=>{$('ueber').hidden=true};
$('p-weiter').onclick=pauseWeg;$('p-speichern').onclick=()=>{if(save(true))toast('Spiel gespeichert.')};$('p-einst').onclick=()=>einstZeigen();$('p-hilfe').onclick=()=>hilfeZeigen('pause');$('p-neu').onclick=neuesSpiel;$('p-titel').onclick=()=>{save(true);titelZeigen()};
$('hzu').onclick=()=>{$('hilfe').hidden=true;if(!SHELL.zurueck){G.help=true;canvas.focus()}SHELL.zurueck=null};
$('bh').onclick=()=>hilfeZeigen(null);
$('bneu').textContent='Menü';$('bneu').title='Pausemenü (Esc)';$('bneu').onclick=pauseZeigen;
$('neinneu').onclick=()=>{$('frage').hidden=true};
{const _ja=$('janeu').onclick;$('janeu').onclick=()=>{_ja();G.help=false;SHELL.hatSpiel=false;$('pause').hidden=true;SHELL.pause=false;SHELL.vorher=false;if(SHELL.titel){SHELL.titel=false;document.documentElement.classList.remove('titel');$('titel').hidden=true}setSpeed(1);$('hilfe').hidden=false;$('hzu').textContent='Schicht beginnen';save(true)}}

/* --- Einstellungen --- */
let eTab='audio';
const seg=(id,opts)=>`<div class="seg">${opts.map(([v,n])=>`<button data-set="${id}" data-v="${v}" class="${String(SET[id])===String(v)?'an':''}">${n}</button>`).join('')}</div>`;
const regler=(id,min,max,st,fmt)=>`<div class="regler"><input type="range" id="r-${id}" data-set="${id}" min="${min}" max="${max}" step="${st}" value="${SET[id]}"><span id="rv-${id}">${fmt(SET[id])}</span></div>`;
const pz=v=>Math.round(v*100)+' %';
const ZEILEN={audio:()=>[['Gesamtlautstärke','',regler('master',0,1,.05,pz)],['Effekte','Bauen, Abriss, Meilensteine',regler('sfx',0,1,.05,pz)],['Musik','Ruhige Begleitmusik',regler('musik',0,1,.05,pz)],['Werkshalle','Maschinengeräusche, Regen und Hintergrundbrummen; lauter beim Heranzoomen',regler('umgebung',0,1,.05,pz)]],
 grafik:()=>[['Qualität','Niedrig: ohne Schatten und Effekte, schont Akku und schwache Geräte',seg('qual',[['niedrig','Niedrig'],['mittel','Mittel'],['hoch','Hoch']])],['Qualität automatisch anpassen','Senkt die Qualität von selbst, wenn das Spiel ruckelt',seg('autoQ',[[true,'An'],[false,'Aus']])],['Umgebungsverdeckung','Weiche Kontaktschatten in Ecken und unter Maschinen',seg('ao',[[true,'An'],[false,'Aus']])],['Gras','Einzelne Halme in Kameranähe, wiegen sich im Wind',seg('gras',[[true,'An'],[false,'Aus']])],['Wasserspiegelung','Gebäude, Bäume und Himmel spiegeln sich im Wasser',seg('spiegel',[[true,'An'],[false,'Aus']])],['Tag und Nacht','Die Sonne wandert, nachts leuchten Fenster und Lampen',seg('nacht',[[true,'An'],[false,'Aus']])],['Arbeiter und Stapler','Figuren laufen ums Werk, Stapler fahren an Zentrale und Lagern',seg('leben',[[true,'An'],[false,'Aus']])],['Wetter','Wolken, Regen, Nebel und Gewitter wechseln sich ab',seg('wetter',[[true,'An'],[false,'Aus']])],['Rauch','Abgase über Öfen und Generatoren',seg('rauch',[[true,'An'],[false,'Aus']])],['Bildrate begrenzen','Höchstens so viele Bilder pro Sekunde, passend zu deinem Monitor',seg('fpsMax',[[60,'60'],[120,'120'],[144,'144'],[240,'240'],[0,'Aus']])],['Bilder pro Sekunde anzeigen','',seg('fps',[[true,'An'],[false,'Aus']])]],
 steuer:()=>[['Kamera-Tempo','Für Tasten und Bildschirmrand',regler('kamera',.4,2.5,.1,pz)],['Zoom umkehren','Mausrad andersherum',seg('zoomUm',[[false,'Normal'],[true,'Umgekehrt']])],['Kamera am Bildschirmrand bewegen','Maus an den Rand schieben',seg('rand',[[false,'Aus'],[true,'An']])]],
 ober:()=>[['Symbole über Maschinen','Zeigt über jeder Maschine, was sie herstellt',seg('symbole',[[true,'An'],[false,'Aus']])],['Größe der Oberfläche','Tafeln, Leiste und Minimap',regler('ui',.75,1.4,.05,pz)],['Automatisch speichern','',seg('auto',[[20,'20 s'],[60,'1 min'],[300,'5 min']])]]};
function einstZeigen(){$('einst').hidden=false;einstDraw();$('e-zu').focus()}
function einstDraw(){for(const t of['audio','grafik','steuer','ober'])$('e-'+t).classList.toggle('an',eTab===t);$('e-body').innerHTML=ZEILEN[eTab]().map(([a,b,c])=>`<div class="zeile"><div>${a}${b?`<small>${b}</small>`:''}</div>${c}</div>`).join('')}
function einstAnwenden(){setSave();auVol();grafik()}
for(const t of['audio','grafik','steuer','ober'])$('e-'+t).onclick=()=>{eTab=t;einstDraw()};
$('e-body').addEventListener('click',ev=>{const b=ev.target.closest('button[data-set]');if(!b)return;const id=b.dataset.set,v=b.dataset.v;SET[id]=v==='true'?true:v==='false'?false:isNaN(+v)?v:+v;einstAnwenden();einstDraw()});
$('e-body').addEventListener('input',ev=>{const r=ev.target;if(!r.dataset.set)return;SET[r.dataset.set]=+r.value;const f=$('rv-'+r.dataset.set);if(f)f.textContent=pz(+r.value);einstAnwenden()});
$('e-zu').onclick=()=>{$('einst').hidden=true};$('e-reset').onclick=()=>{Object.assign(SET,SET_STD);einstAnwenden();einstDraw();toast('Einstellungen zurückgesetzt.')};

/* --- Tastatur: Dialoge zuerst --- */
addEventListener('keydown',ev=>{if(ev.target.tagName==='INPUT'&&ev.target.type!=='range')return;const k=ev.key;
 const zu=(id,f)=>{ev.preventDefault();ev.stopImmediatePropagation();if(f)f();else $(id).hidden=true};
 if(offen('frage'))return k==='Escape'?zu('frage'):(k==='Enter'?undefined:ev.stopImmediatePropagation());
 if(offen('einst'))return k==='Escape'?zu('einst'):ev.stopImmediatePropagation();
 if(offen('ueber'))return k==='Escape'?zu('ueber'):ev.stopImmediatePropagation();
 if(offen('hilfe'))return k==='Escape'||k==='h'||k==='H'?zu('hilfe',()=>$('hzu').click()):ev.stopImmediatePropagation();
 if(offen('ende'))return k==='Escape'?zu('ende'):ev.stopImmediatePropagation();
 if(SHELL.titel){if(k!=='Tab'&&k!=='Enter'&&k!==' ')ev.stopImmediatePropagation();return}
 if(SHELL.pause){if(k==='Escape')zu(null,pauseWeg);else if(k!=='Tab'&&k!=='Enter'&&k!==' ')ev.stopImmediatePropagation();return}
 if(k==='Escape'&&!tool&&!sel&&$('menu').hidden&&$('lw').hidden&&!$('mini').classList.contains('gross'))zu(null,pauseZeigen);
 else if(k==='Escape'&&$('mini').classList.contains('gross')&&!tool)zu(null,()=>{$('mini').classList.remove('gross');miniDraw()})},true);

/* --- Eigene Schleife: Musik, Werkshalle, FPS --- */
{let fz=0,fn=0,ft=performance.now();(function tick(now){requestAnimationFrame(tick);if(now-ft>=500){$('fps').textContent=Math.round((window.__fr-fn)*1000/(now-ft))+' FPS';fn=window.__fr;ft=now}
 if(AU.c&&AU.c.state==='running'){musik();fz+=1;if(fz>15){fz=0;let n=0;const r=Math.max(30,C.dist*.8);for(const e of machines)if(e.st==='ok'&&Math.abs(e.x-C.x)<r&&Math.abs(e.y-C.z)<r)n++;AU.hum.gain.setTargetAtTime(SHELL.titel||paused?0:Math.min(.5,n/40)*.9,AU.c.currentTime,.8)}}})(performance.now())}
// Touch: Menü-Knopf in der Werkzeugleiste
if(TOUCH&&$('tbar')){const b=document.createElement('button');b.textContent='☰ Menü';b.title='Pausemenü';b.onclick=pauseZeigen;$('tbar').prepend(b)}
// Ladefortschritt
{let fertig=0;const gesamt=pending.length||1;pending.forEach(p=>p.then(()=>{fertig++;$('ladebar').style.width=(fertig/gesamt*100)+'%'}))}
SHELL.boot=function(hadSave){grafik();$('laden').hidden=true;titelZeigen();if(window.__altSave)setTimeout(()=>toast('Dein alter Spielstand passt nicht zur neuen großen Karte. Er wurde als Sicherung abgelegt, das Spiel beginnt neu.'),600)};
