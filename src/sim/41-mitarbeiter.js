/* ====== Mitarbeiter: Lohn, Baustellen, Reparaturen ====== */
const ARB={w:[],tA:0,tK:0,lohn:3,preis:50,max:40,stamp:new Uint32Array(N*N),vor:new Int32Array(N*N),q:new Int32Array(N*N),nr:0};
function geh(x,y){if(x<0||y<0||x>=N||y>=N||Lv(x,y)<1)return false;const e=E.get(grid[y*N+x]);return !e||K[e.k].s===1}
function arbPfad(sx,sy,ziel){const st=ARB.stamp,vor=ARB.vor,q=ARB.q,nr=++ARB.nr,s=sy*N+sx;let h=0,t=0;q[t++]=s;st[s]=nr;vor[s]=-1;
 while(h<t){const i=q[h++];if(ziel.has(i)){const p=[];for(let j=i;j!==-1;j=vor[j])p.push(j);return p.reverse()}const x=i%N,y=(i/N)|0,l=Lv(x,y);
  for(let d=0;d<4;d++){const X=x+DX[d],Y=y+DY[d],j=Y*N+X;if(X<0||Y<0||X>=N||Y>=N||st[j]===nr)continue;st[j]=nr;if(!geh(X,Y)||Math.abs(Lv(X,Y)-l)>1)continue;vor[j]=i;q[t++]=j}}return null}
function randFelder(e){const s=K[e.k].s,z=new Set();for(let i=-1;i<=s;i++)for(const[x,y]of[[e.x+i,e.y-1],[e.x+i,e.y+s],[e.x-1,e.y+i],[e.x+s,e.y+i]])if(geh(x,y))z.add(y*N+x);return z}
function arbHeim(){const z=nodes.find(n=>n.k==='zentrale');if(!z)return[CX,CX];for(const[x,y]of[[z.x+2,z.y+6],[z.x+3,z.y+6],[z.x+6,z.y+3],[z.x-1,z.y+3],[z.x+3,z.y-1]])if(geh(x,y))return[x,y];const r=[...randFelder(z)][0];return r===undefined?[z.x,z.y+6]:[r%N,(r/N)|0]}
function arbBedarf(m){return wears(m)&&!m.bau&&(m.kaputt||(m.hp??1)<.25||m.repW)}
function arbStep(dt){if(G.arb===undefined)G.arb=3;const W=ARB.w,pleite=(G.cr||0)<0,tempo=pleite?.4:1;
 G.cr=Math.max(-300,(G.cr||0)-G.arb*ARB.lohn/60*dt);
 while(W.length<G.arb){const h=arbHeim();W.push({x:h[0]+.5,y:h[1]+.5,job:0,typ:'',path:null,pi:0,t:0})}
 while(W.length>G.arb){let i=W.findIndex(w=>!w.job);if(i<0)i=W.length-1;const w=W[i],m=E.get(w.job);if(m&&w.typ==='rep')delete m.job;W.splice(i,1)}
 ARB.tA+=dt;if(ARB.tA>.5){ARB.tA=0;arbZuteilen()}ARB.tK+=dt;let waechst=false;
 for(const w of W){const e=w.job?E.get(w.job):null;
  if(w.job&&w.typ!=='trag'&&(!e||(w.typ==='bau'&&!e.bau)||(w.typ==='rep'&&!arbBedarf(e)))){if(e&&w.typ==='rep')delete e.job;w.job=0;w.path=null}
  if(w.path){const j=w.path[w.pi],tx=j%N+.5,ty=((j/N)|0)+.5,dx=tx-w.x,dy=ty-w.y,d=Math.hypot(dx,dy),v=2.6*tempo*dt*(istStr(Math.floor(w.x),Math.floor(w.y))?1.8:1);if(d<=v){w.x=tx;w.y=ty;if(++w.pi>=w.path.length)w.path=null}else{w.x+=dx/d*v;w.y+=dy/d*v;w.r=Math.atan2(-dy,dx)}continue}
  if(!w.job||w.typ==='trag')continue;
  if(w.typ==='bau'){e.bau-=dt*tempo;waechst=true;if(e.bau<=0){delete e.bau;delete e.bau0;delete e.unr;e.st='wait';dirtyK=dirtyP=true;sfx('bau');w.job=0}}
  else{w.t+=dt*tempo;if(w.t>=3){repMit(e);e.repW=false;delete e.job;w.job=0}}}
 if(waechst&&ARB.tK>.35){ARB.tK=0;dirtyK=true}}
function arbZuteilen(){const W=ARB.w,frei=W.filter(w=>!w.job);if(!frei.length)return;const jobs=[],et=G.stock.ersatzteil||0;let etFrei=et-W.filter(w=>w.typ==='rep'&&w.job).length;
 for(const e of machines){if(e.bau>0){if(e.unr&&G.t-e.unr<4)continue;const mx=K[e.k].s>=5?3:K[e.k].s>=3?2:1,n=W.filter(w=>w.job===e.id).length;if(n<mx)jobs.push([e,'bau'])}else if(arbBedarf(e)&&!e.job&&etFrei>0){if(e.unr&&G.t-e.unr<4)continue;jobs.push([e,'rep']);etFrei--}}
 let suchen=0;for(const w of frei){if(!jobs.length){if(!w.path){const h=arbHeim();if(Math.abs(w.x-h[0]-.5)+Math.abs(w.y-h[1]-.5)>1.5&&suchen++<2){const p=arbPfad(Math.floor(w.x),Math.floor(w.y),new Set([h[1]*N+h[0]]));if(p){w.path=p;w.pi=0}else{w.x=h[0]+.5;w.y=h[1]+.5}}}continue}
  if(suchen>=3)break;let bi=0,bd=1e9;jobs.forEach(([e],i)=>{const d=Math.abs(e.x-w.x)+Math.abs(e.y-w.y);if(d<bd){bd=d;bi=i}});const[e,typ]=jobs[bi];suchen++;
  const p=arbPfad(Math.floor(w.x),Math.floor(w.y),randFelder(e));if(!p){e.unr=G.t||1;jobs.splice(bi,1);continue}
  delete e.unr;w.job=e.id;w.typ=typ;w.path=p.length>1?p:null;w.pi=0;w.t=0;if(typ==='rep')e.job='arb';if(typ==='rep'||K[e.k].s<3||W.filter(q=>q.job===e.id).length>=(K[e.k].s>=5?3:2))jobs.splice(bi,1)}}
{const _s=step;step=function(dt){_s(dt);arbStep(dt)}}
{const _f=fresh;fresh=function(){_f();ARB.w.length=0}}
{const _l=load;load=function(){const ok=_l();ARB.w.length=0;return ok}}
{const _z=lebenZeichnen;lebenZeichnen=function(){_z();const L=UM.leute,o=GB.ob;let n=L.count;if(!SHELL.titel)for(const w of ARB.w){if(n>=90)break;const tx=Math.floor(w.x),ty=Math.floor(w.y),arbeitet=w.job&&!w.path;o.position.set(w.x,YL(Lv(tx,ty))+(w.path?Math.abs(Math.sin(GB.t*9+n))*.03:0),w.y);o.rotation.set(arbeitet?Math.sin(GB.t*8+n)*.25:0,w.r||0,0);o.scale.setScalar(1.25);o.updateMatrix();L.setMatrixAt(n,o.matrix);L.setColorAt(n,UM.kittel[w.typ==='rep'&&w.job?3:w.last?2:1]);n++}
 L.count=n;L.instanceMatrix.needsUpdate=true;if(L.instanceColor)L.instanceColor.needsUpdate=true}}
// Symbole: Baustelle und nicht erreichbar
{const g=ICATLAS.image.getContext('2d'),x=7*64,y=576;g.clearRect(x,y,64,64);g.save();g.beginPath();g.roundRect(x+2,y+2,60,60,12);g.clip();g.fillStyle='#f0b429';g.fillRect(x,y,64,64);g.fillStyle='#1b2226';for(let i=-64;i<64;i+=22){g.beginPath();g.moveTo(x+i,y+64);g.lineTo(x+i+11,y+64);g.lineTo(x+i+75,y);g.lineTo(x+i+64,y);g.fill()}g.restore();g.strokeStyle='#0a0f12';g.lineWidth=3;g.beginPath();g.roundRect(x+2,y+2,60,60,12);g.stroke();ICATLAS.needsUpdate=true}
{const _s=symUpdate;symUpdate=function(){_s();const m=MSYM,A=m.geometry.attributes.aO,o=GB.ob;let n=m.count;if(SHELL.titel)return;const s=Math.min(1.5,Math.max(.55,C.dist*.022)),r=Math.max(70,C.dist*1.3);
 for(const e of machines){if(n>=900)break;if(!e.bau||Math.abs(e.x-C.x)>r||Math.abs(e.y-C.z)>r)continue;const g=K[e.k].s;o.position.set(e.x+g/2,YL(e.z)+1.1+s*.5,e.y+g/2);o.rotation.set(0,0,0);o.scale.setScalar(s);o.updateMatrix();m.setMatrixAt(n,o.matrix);A.array[n*2]=e.unr?9:7;A.array[n*2+1]=0;n++}
 m.count=n;m.instanceMatrix.needsUpdate=true;A.needsUpdate=true}}
// Maschinenfenster: Baustelle
{const _l=inspLive;inspLive=function(){_l();if(!sel||!sel.bau)return;const l=$('ilive'),e=sel,p=$('ipille');if(p){p.className='pille '+(e.unr?'defekt':'wait');p.textContent=e.unr?'nicht erreichbar':'Baustelle';p.hidden=false}const n=ARB.w.filter(w=>w.job===e.id).length,h=`<p>${e.unr?'Kein Mitarbeiter kommt hierher: Wasser oder ein zu hoher Absatz versperrt den Weg. Bau mit dem Fundament einen Übergang.':n?'Wird gebaut.':'Wartet auf einen freien Mitarbeiter.'}</p><div class="balken"><b style="width:${Math.round((1-e.bau/e.bau0)*100)}%"></b></div><div class="kz"><div><span>Fortschritt</span><b>${Math.round((1-e.bau/e.bau0)*100)} %</b></div><div><span>Mitarbeiter hier</span><b>${n}</b></div></div>`;if(l._alt!==h){l._alt=h;l.innerHTML=h;l.style.display=''}}}
// Leitwarte: Personal
document.head.insertAdjacentHTML('beforeend','<style>#pers{display:flex;justify-content:space-between;align-items:center;gap:6px;font:12px var(--mono);color:var(--matt);cursor:pointer;border:1px solid var(--linie);padding:2px 7px;background:var(--tafel2)}#pers:hover{border-color:var(--signal)}#pers b{color:var(--text)}#pers.rot b{color:var(--stoer)}.pk{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}.pk>div{background:var(--tafel2);border:1px solid var(--linie);padding:9px 11px;display:grid;gap:3px}.pk b{font:600 22px var(--mono)}</style>');
$('takt').insertAdjacentHTML('beforebegin','<div id="pers" role="button" tabindex="0" title="Personal in der Leitwarte öffnen"><span>Personal</span><b id="persn"></b></div>');
$('pers').onclick=()=>{lwTab='pers';lwOpen(true)};
{const b=document.createElement('button');b.id='lt-pers';b.textContent='Personal';$('lt-wart').after(b);b.onclick=()=>{lwTab='pers';lwDraw()};
 const _d=lwDraw;lwDraw=function(){if(lwTab!=='pers'){b.classList.remove('an');_d();return}for(const t of['ov','auf','log','wart'])$('lt-'+t).classList.remove('an');b.classList.add('an');persDraw()}}
function persDraw(){const W=ARB.w,bau=W.filter(w=>w.job&&w.typ==='bau').length,rep=W.filter(w=>w.job&&w.typ==='rep').length,sites=machines.filter(e=>e.bau>0),unr=sites.filter(e=>e.unr),f=n=>Math.round(n).toLocaleString('de-DE');
 $('lwbody').innerHTML=`<div class="pk"><div><span class="etikett">Mitarbeiter</span><b>${G.arb}</b><div class="reihe"><button data-pe="1">Einstellen · ${ARB.preis} Cr</button><button data-pe="-1" ${G.arb<=0?'disabled':''}>Entlassen</button></div></div>
 <div><span class="etikett">Lohn</span><b>${f(G.arb*ARB.lohn)} Cr/min</b><span class="matt">${ARB.lohn} Cr pro Kopf und Minute</span></div>
 <div><span class="etikett">Kasse</span><b style="color:${(G.cr||0)<0?'var(--stoer)':'var(--text)'}">${f(G.cr||0)} Cr</b><span class="matt">${(G.cr||0)<0?'Lohnrückstand: Alle arbeiten nur mit 40 % Tempo.':'Löhne sind bezahlt.'}</span></div>
 <div><span class="etikett">Gerade beschäftigt</span><b>${bau+rep} / ${G.arb}</b><span class="matt">${bau} bauen · ${rep} reparieren · ${G.arb-bau-rep} frei</span></div>
 <div><span class="etikett">Baustellen</span><b>${sites.length}</b><span class="matt">${unr.length?unr.length+' nicht erreichbar':'alle erreichbar'}</span></div></div>
 ${unr.length?`<div class="etikett">Nicht erreichbare Baustellen</div><div class="reihe">${unr.map(e=>`<button data-wz="${e.id}">${K[e.k].n} bei ${e.x}, ${e.y} zeigen</button>`).join('')}</div>`:''}
 <p class="matt">Mitarbeiter bauen neue Gebäude und reparieren Maschinen. Sie laufen von der Zentrale zur Arbeit und brauchen dafür einen Weg über Land: Wasser und Absätze von mehr als einer Ebene überbrückst du mit Fundamenten. Bänder, Greifarme, Verteiler, Masten und Gleise stehen sofort. Geld kommt aus jedem gelieferten Teil, aus Meilenstein-Prämien und aus Kundenaufträgen.</p>`}
$('lw').addEventListener('click',ev=>{const b=ev.target.closest('button[data-pe]');if(!b)return;if(+b.dataset.pe>0){if(G.arb>=ARB.max){toast('Mehr als '+ARB.max+' Mitarbeiter gehen nicht.');return}if((G.cr||0)<ARB.preis){toast('Für die Einstellung fehlen Credits.');return}G.cr-=ARB.preis;G.arb++}else if(G.arb>0)G.arb--;persDraw()});
setInterval(()=>{if(!G||SHELL.titel)return;const frei=ARB.w.filter(w=>!w.job).length;$('persn').textContent=frei+' frei / '+(G.arb??3);$('pers').classList.toggle('rot',(G.cr||0)<0);if(!$('lw').hidden&&lwTab==='pers'&&!$('lwbody').matches(':hover'))persDraw()},1000);
ERKL['Mitarbeiter']=['Mitarbeiter','Dein Werk hat eine Belegschaft. Du startest mit 3 Mitarbeitern und 500 Credits.',['Neue Gebäude sind zuerst eine Baustelle. Ein Mitarbeiter läuft von der Zentrale hin und baut sie auf. Bänder, Greifarme, Verteiler, Masten und Gleise stehen sofort.','Mitarbeiter brauchen einen Weg über Land. Liegt Wasser dazwischen, zeigt die Baustelle „nicht erreichbar“. Bau dann mit dem Fundament einen Übergang.','Jeder Mitarbeiter kostet 3 Credits Lohn pro Minute. Geld bekommst du für jedes gelieferte Teil und als Prämie für jeden Meilenstein.','Mehr Leute stellst du in der Leitwarte unter Personal ein, oder mit einem Klick auf „Personal“ rechts oben.','Ab Meilenstein 2 gibt es die Sammelstelle: Mitarbeiter tragen von dort Material zu Fuß in die Zentrale.'],'Geht das Geld aus, arbeiten alle nur noch mit 40 % Tempo. Später reparieren Mitarbeiter auch defekte Maschinen.'];
