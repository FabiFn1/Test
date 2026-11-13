/* ====== Karten, Spielstände, Schwierigkeit, freies Bauen ====== */
MS.forEach(m=>{m.need0={...m.need}});
function schwSetzen(){const f={leicht:.5,schwer:1.5}[G&&G.schw]||1;for(const m of MS)for(const k in m.need0)m.need[k]=Math.max(1,Math.round(m.need0[k]*f))}
function weltNeu(){weltErz(G.seed||0,{leicht:2,schwer:.85}[G.schw]||1);AMT0.set(AMT);patchTotals();miniB=null;schwSetzen()}
{const _a=afford;afford=function(k,m){return G.frei?true:_a(k,m)}}
{const _p=pay;pay=function(k,sg){if(!G.frei)_p(k,sg)}}
{const _v=avail;avail=function(){return G.frei?TOOLS.slice():_v()}}
{const _b=buildFund;buildFund=function(a,b){if(G.frei)G.stock.stein=Math.max(G.stock.stein||0,100000);_b(a,b)}}
const SLOTS=3,slotNr=()=>+SK.split('-')[1]||1,MK=n=>'schichtwerk-meta-'+n;
function slotInfo(n){try{const m=JSON.parse(SPEICHER.getItem(MK(n)));if(m)return m;const s=SPEICHER.getItem('schichtwerk-'+n);if(!s)return null;return SW.platzInfo(JSON.parse(s).G)}catch(e){return null}}
function slotText(m){if(!m)return'leer';const d=m.d?new Date(m.d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}):'';return`Meilenstein ${Math.min(m.ms+1,MS.length)} · ${spielzeit(m.t)} · ${m.frei?'Freies Bauen':{leicht:'Leicht',schwer:'Schwer'}[m.schw]||'Normal'}${d?' · '+d:''}`}
{const _s=save;save=function(f){const ok=_s(f);if(ok&&G)try{SPEICHER.setItem(MK(slotNr()),JSON.stringify(SW.platzInfo(G,Date.now())))}catch(e){}return ok}}
function slotSetzen(n){SK='schichtwerk-'+n;try{SPEICHER.setItem('schichtwerk-slot',String(n))}catch(e){}}
function weltAufbauen(neu,ohneT){if(!ohneT)buildTerrain();dirtyF=dirtyB=dirtyK=true;select(null);setTool(null);miniDraw();msDraw();toolsDraw();power();hud();if(neu){C.tx=C.x=CX-6;C.tz=C.z=CX;C.tyaw=C.yaw=.55;C.tdist=C.dist=44}}
function slotLaden(n){if(n!==slotNr()&&SHELL.hatSpiel)save(true);slotSetzen(n);window.NEUOPT=null;const had=load();if(!had)fresh();weltAufbauen(!had);$('staende').hidden=true;titelZeigen();if(had)toast('Spielstand '+n+' geladen.')}
document.head.insertAdjacentHTML('beforeend',`<style>
#neu,#staende{position:fixed;inset:0;display:grid;place-items:center;z-index:26;background:#0f171bcc;padding:16px}
#neu>div,#staende>div{background:var(--tafel);border:1px solid var(--linie);box-shadow:0 3px 0 #0f171b;width:min(620px,100%);max-height:calc(100% - 8px);overflow:auto;box-sizing:border-box;display:grid;gap:12px;padding:0 0 18px}
#neu>div>*:not(.streifen),#staende>div>*:not(.streifen){margin:0 22px}#neu h2,#staende h2{font-size:30px}
#neu .zl{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;align-items:center;font-size:17px}#neu .seg{display:flex;gap:4px;flex-wrap:wrap}#neu .seg button{flex:1;font-size:15px;padding:5px 6px}
#neu small,#staende small{display:block;font:12px var(--mono);color:var(--matt)}#neu input{background:#0f171b;color:var(--text);border:1px solid var(--linie);font:14px var(--mono);padding:4px 6px;width:110px}
.slot{background:var(--tafel2);border:1px solid var(--linie);border-left:4px solid var(--linie);padding:9px 12px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center;font-size:18px}.slot.akt{border-left-color:var(--signal)}.slot .reihe{justify-content:flex-end}
@media (max-width:560px){#neu .zl{grid-template-columns:1fr}}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="neu" hidden><div role="dialog" aria-label="Neues Spiel"><div class="streifen"></div><h2>Neues Spiel</h2>
 <div class="zl"><div>Spielstand<small>Drei Plätze</small></div><div class="seg" id="n-slot"></div></div>
 <div class="zl"><div>Karte<small id="n-seedinfo"></small></div><div class="seg" id="n-karte"></div></div>
 <div class="zl"><div>Schwierigkeit<small id="n-schwinfo"></small></div><div class="seg" id="n-schw"></div></div>
 <div class="zl"><div>Modus<small id="n-modinfo"></small></div><div class="seg" id="n-mod"></div></div>
 <div class="reihe"><button id="n-start" class="an">Spiel starten</button><button id="n-zu">Abbrechen</button></div></div></div>
<div id="staende" hidden><div role="dialog" aria-label="Spielstände"><div class="streifen"></div><h2>Spielstände</h2><div id="s-liste" style="display:grid;gap:6px"></div><div class="reihe"><button id="s-zu" class="an">Zurück</button></div></div></div>`);
const NEU={slot:1,karte:'standard',seed:0,schw:'normal',frei:false};
function neuDraw(){const sg=(id,opts,cur)=>{$(id).innerHTML=opts.map(([v,n])=>`<button data-v="${v}" class="${String(cur)===String(v)?'an':''}">${n}</button>`).join('')};
 sg('n-slot',[1,2,3].map(n=>[n,n+(slotInfo(n)?' · belegt':' · frei')]),NEU.slot);sg('n-karte',[['standard','Standard'],['zufall','Zufällig']],NEU.karte);sg('n-schw',[['leicht','Leicht'],['normal','Normal'],['schwer','Schwer']],NEU.schw);sg('n-mod',[[false,'Normal'],[true,'Freies Bauen']],NEU.frei);
 $('n-seedinfo').innerHTML=NEU.karte==='zufall'?`Kartennummer <input id="n-seed" type="number" min="1" max="99999" value="${NEU.seed}" aria-label="Kartennummer">`:'Die bekannte Karte';
 $('n-schwinfo').textContent={leicht:'Halbe Meilenstein-Mengen, doppelt so reiche Vorkommen',normal:'Die ausgewogene Standardeinstellung',schwer:'Anderthalbfache Mengen, ärmere Vorkommen'}[NEU.schw];
 $('n-modinfo').textContent=NEU.frei?'Alle Bauwerke frei, Bauen kostet nichts':'Meilensteine schalten Bauwerke frei';const i=$('n-seed');if(i)i.onchange=()=>{NEU.seed=Math.max(1,Math.min(99999,+i.value||1))}}
neuesSpiel=function(){let f=[1,2,3].find(n=>!slotInfo(n));NEU.slot=f||slotNr();NEU.karte='standard';NEU.schw='normal';NEU.frei=false;NEU.seed=1+Math.floor(Math.random()*99998);neuDraw();$('neu').hidden=false;$('n-start').focus()};
$('p-neu').onclick=neuesSpiel;$('t-neu').onclick=neuesSpiel;
$('neu').addEventListener('click',ev=>{const b=ev.target.closest('.seg button');if(!b)return;const id=b.parentNode.id,v=b.dataset.v;if(id==='n-slot')NEU.slot=+v;else if(id==='n-karte')NEU.karte=v;else if(id==='n-schw')NEU.schw=v;else NEU.frei=v==='true';neuDraw()});
$('n-zu').onclick=()=>{$('neu').hidden=true};
{const _j=$('janeu').onclick;$('janeu').onclick=()=>{if(NEU.slot!==slotNr()&&SHELL.hatSpiel)save(true);slotSetzen(NEU.slot);try{SPEICHER.removeItem(MK(NEU.slot))}catch(e){}window.NEUOPT={seed:NEU.karte==='zufall'?NEU.seed:0,schw:NEU.schw,frei:NEU.frei};_j();window.NEUOPT=null;weltAufbauen(true,true);$('neu').hidden=true;if(G.frei)toast('Freies Bauen: Alle Bauwerke sind frei und kosten nichts.')}}
$('n-start').onclick=()=>{if(slotInfo(NEU.slot)){$('frage').querySelector('h2').textContent='Spielstand '+NEU.slot+' überschreiben?';$('frage').firstElementChild.children[1].textContent='Das Werk auf diesem Platz wird gelöscht.';$('frage').hidden=false;$('neinneu').focus()}else $('janeu').onclick()};
function slotsDraw(){$('s-liste').innerHTML=[1,2,3].map(n=>{const m=slotInfo(n),akt=n===slotNr();return`<div class="slot${akt?' akt':''}"><div><b>Spielstand ${n}${akt?' · aktiv':''}</b><small>${slotText(m)}</small></div><div class="reihe">${m&&!akt?`<button data-l="${n}">Laden</button>`:''}${m?`<button data-x="${n}">Löschen</button>`:''}</div></div>`}).join('')}
function slotsZeigen(){if(SHELL.hatSpiel)save(true);slotsDraw();$('staende').hidden=false;$('s-zu').focus()}
$('s-zu').onclick=()=>{$('staende').hidden=true;titelZeigen()};
$('staende').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const d=b.dataset;if(d.l)slotLaden(+d.l);else if(d.x){if(b.dataset.ok){const n=+d.x;try{SPEICHER.removeItem('schichtwerk-'+n);SPEICHER.removeItem(MK(n))}catch(e){}if(n===slotNr()){window.NEUOPT=null;fresh();weltAufbauen(true);SHELL.hatSpiel=false}slotsDraw()}else{b.dataset.ok='1';b.textContent='Wirklich löschen?'}}});
{const b=document.createElement('button');b.id='t-slots';b.textContent='Spielstände';b.onclick=slotsZeigen;$('t-erf').before(b)}
addEventListener('keydown',ev=>{for(const id of['staende','neu'])if(!$(id).hidden&&$('frage').hidden){if(ev.target.tagName==='INPUT'&&ev.key!=='Escape')return;ev.stopImmediatePropagation();if(ev.key==='Escape'){ev.preventDefault();$(id).hidden=true;if(id==='staende')titelZeigen()}return}},true);
