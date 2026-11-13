/* ====== Träger: Mitarbeiter bringen Material zu Fuß in die Zentrale ====== */
LAMP.traeger=NBA.traeger.lampe;MHOEHE.traeger=1.4;ARB.last=10;
{const _z=arbZuteilen;arbZuteilen=function(){_z();const W=ARB.w,z=nodes.find(n=>n.k==='zentrale');if(!z)return;let suchen=0;
 for(const e of byKind.traeger||[]){if(e.bau||suchen>=2)continue;const n=total(e);if(!n){e.idle=0;continue}if(n<ARB.last&&(e.idle||0)<6)continue;if(e.unr&&G.t-e.unr<4)continue;if(W.filter(w=>w.job===e.id).length>=3)continue;
  let best=null,bd=1e9;for(const w of W){if(w.job||w.path)continue;const d=Math.abs(e.x-w.x)+Math.abs(e.y-w.y);if(d<bd){bd=d;best=w}}if(!best)break;suchen++;
  const p=arbPfad(Math.floor(best.x),Math.floor(best.y),randFelder(e));if(!p){e.unr=G.t||1;continue}delete e.unr;best.job=e.id;best.typ='trag';best.path=p.length>1?p:null;best.pi=0;best.last=null}}}
{const _s=arbStep;arbStep=function(dt){for(const e of byKind.traeger||[])if(total(e))e.idle=(e.idle||0)+dt;
 for(const w of ARB.w){if(w.typ!=='trag'||!w.job||w.path)continue;const e=E.get(w.job),z=nodes.find(n=>n.k==='zentrale');
  if(!w.last){if(!e||e.bau||!total(e)){w.job=0;w.typ='';continue}const l=[];for(const i in e.inv)while(e.inv[i]>0&&l.length<ARB.last){e.inv[i]--;l.push(i)}e.idle=0;const p=z&&arbPfad(Math.floor(w.x),Math.floor(w.y),randFelder(z));if(!p){for(const i of l)e.inv[i]=(e.inv[i]||0)+1;e.unr=G.t||1;w.job=0;w.typ='';continue}w.last=l;w.path=p.length>1?p:null;w.pi=0;if(w.path)continue}
  for(const i of w.last)deliver(i);G.getragen=(G.getragen||0)+w.last.length;w.last=null;w.job=0;w.typ=''}
 // Träger mit Ladung behalten ihren Auftrag, auch wenn die Sammelstelle leer ist
 _s(dt)}}
ERF.push(['traeger','Handarbeit','Lass deine Träger 500 Teile in die Zentrale bringen.',()=>(G.getragen||0)>=500]);
{const _l=inspLive;inspLive=function(){_l();if(!sel||sel.k!=='traeger'||sel.bau)return;const e=sel,l=$('ilive'),n=ARB.w.filter(w=>w.job===e.id).length,h=`<p>${e.unr?'Kein Weg zur Zentrale: Wasser oder ein hoher Absatz versperrt ihn. Bau mit dem Fundament einen Übergang.':'Freie Mitarbeiter holen hier je '+ARB.last+' Teile ab und tragen sie in die Zentrale. Je weiter der Weg, desto weniger schaffen sie.'}</p><div class="kz"><div><span>Wartet</span><b>${total(e)} / 40</b></div><div><span>Träger unterwegs</span><b>${n}</b></div><div><span>Getragen gesamt</span><b>${(G.getragen||0).toLocaleString('de-DE')}</b></div></div>`+(Object.keys(e.inv).some(i=>e.inv[i]>0)?`<div class="etikett">Inhalt</div><div class="chips">${Object.entries(e.inv).filter(([,n])=>n>0).map(([i,n])=>`<span class="chip">${ic(i,20)}${n}</span>`).join('')}</div>`:'');if(l._alt!==h){l._alt=h;l.innerHTML=h;l.style.display=''}const p=$('ipille');if(p&&e.unr){p.className='pille defekt';p.textContent='kein Weg'}}}
