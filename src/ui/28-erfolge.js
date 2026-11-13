/* ====== Erfolge ====== */
const gesamtMW=()=>{const n=nodes.find(q=>q.k==='zentrale');return n&&n.net?n.net.gen:0};
const ERF=[
 ['start','Erste Schicht','Bau dein erstes eigenes Bauwerk.',()=>E.size>9],
 ['ms1','Anlauf geschafft','Schließ den ersten Meilenstein ab.',()=>G.ms>=1],
 ['ms5','Werk im Aufbau','Schließ 5 Meilensteine ab.',()=>G.ms>=5],
 ['ms10','Mittelstand','Schließ 10 Meilensteine ab.',()=>G.ms>=10],
 ['ms20','Großindustrie','Schließ 20 Meilensteine ab.',()=>G.ms>=20],
 ['ms31','Alle Meilensteine','Schließ alle 31 Meilensteine ab.',()=>G.ms>=MS.length],
 ['band100','Fließband','Verlege 100 Bänder.',()=>belts.length>=100],
 ['band1000','Bandsalat','Verlege 1.000 Bänder.',()=>belts.length>=1000],
 ['masch25','Maschinenpark','Betreibe 25 Maschinen.',()=>machines.length>=25],
 ['masch100','Industriegebiet','Betreibe 100 Maschinen.',()=>machines.length>=100],
 ['mw50','Unter Strom','Erzeuge 50 MW in deinem Hauptnetz.',()=>gesamtMW()>=50],
 ['mw500','Großkraftwerk','Erzeuge 500 MW in deinem Hauptnetz.',()=>gesamtMW()>=500],
 ['solar','Sonnenstrom','Bau einen Solarpark.',()=>(byKind.solar||[]).length>0],
 ['kern','Kernspaltung','Bau ein Kernkraftwerk.',()=>(byKind.kernkraftwerk||[]).length>0],
 ['stahl','Stahlkocher','Liefere 1.000 Stahl.',()=>(G.total.stahl||0)>=1000],
 ['robo','Robotik','Liefere 100 Roboter.',()=>(G.total.roboter||0)>=100],
 ['auftrag','Zufriedener Kunde','Erfülle deinen ersten Kundenauftrag.',()=>(G.aufOk||0)>=1],
 ['auftrag10','Stammlieferant','Erfülle 10 Kundenaufträge.',()=>(G.aufOk||0)>=10],
 ['cr','Volle Kasse','Besitze 10.000 Credits.',()=>(G.cr||0)>=10000],
 ['drohne','Luftbrücke','Verbinde zwei Drohnenhäfen.',()=>(byKind.drohnenhafen||[]).some(e=>e.link)],
 ['tier3','Spitzentechnik','Rüste eine Maschine auf Tier 3 auf.',()=>machines.some(e=>e.tier===2)],
 ['gruen','Alles im grünen Bereich','Lass 30 Maschinen gleichzeitig laufen.',()=>machines.filter(e=>e.st==='ok').length>=30],
 ['nacht','Nachtschicht','Überstehe deine erste Nacht.',()=>(G.t||0)>=TN.len*.9],
 ['zeit','Überstunden','Spiele 2 Stunden.',()=>(G.t||0)>=7200],
 ['rakete','Abgehoben','Starte deine erste Rakete.',()=>(G.rockets||0)>=1],
 ['rakete5','Raumfahrtprogramm','Starte 5 Raketen.',()=>(G.rockets||0)>=5]];
document.head.insertAdjacentHTML('beforeend',`<style>
#erfpop{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:7;background:var(--tafel);border:1px solid var(--signal);box-shadow:0 3px 0 #0f171b;padding:0 18px 10px;display:grid;gap:2px;min-width:260px;text-align:center;zoom:var(--ui)}
#erfpop .streifen{margin:0 -18px 8px}#erfpop b{font:700 21px var(--display)}
#erfolge{position:fixed;inset:0;display:grid;place-items:center;z-index:25;background:#0f171bcc;padding:16px}
#erfolge>div{background:var(--tafel);border:1px solid var(--linie);box-shadow:0 3px 0 #0f171b;width:min(760px,100%);max-height:calc(100% - 8px);display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;box-sizing:border-box}
#erfolge h2{font-size:30px;margin:14px 20px 0}#erfolge .zahl{margin:2px 20px 10px}
#erfliste{overflow:auto;padding:0 20px 6px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;align-content:start}
.erf{background:var(--tafel2);border:1px solid var(--linie);border-left:4px solid var(--linie);padding:7px 10px;display:grid;gap:1px;font-size:14px;color:var(--matt)}.erf b{font-size:17px;color:var(--matt)}
.erf.da{border-left-color:var(--signal)}.erf.da b{color:var(--text)}.erf.da{color:var(--text)}
#erfolge .fussz{display:flex;justify-content:flex-end;padding:10px 20px 14px}
#tut{left:50%;bottom:112px;transform:translateX(-50%);width:min(520px,calc(100vw - 500px));min-width:280px;padding:0 14px 10px;display:grid;gap:5px;font-size:16px}
#tut .streifen{margin:0 -14px 5px;height:6px}#tut .kopf{display:flex;justify-content:space-between;align-items:baseline;gap:10px}#tut button{font-size:13px;padding:1px 7px}
#tut i{display:block;height:5px;background:#0f171b}#tut i b{display:block;height:100%;background:var(--signal)}
@media (max-width:950px),(max-height:520px){#tut{bottom:74px;width:min(420px,calc(100vw - 260px));font-size:13px;padding-bottom:6px}}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="erfpop" hidden><div class="streifen"></div><span class="etikett">Erfolg freigeschaltet</span><b id="erfname"></b><span id="erftext" class="matt"></span></div>
<div id="erfolge" hidden><div role="dialog" aria-label="Erfolge"><h2>Erfolge</h2><div class="etikett zahl" id="erfzahl"></div><div id="erfliste"></div><div class="fussz"><button id="erfzu" class="an">Zurück</button></div></div></div>
<section id="tut" class="tafel" hidden aria-label="Einweisung"><div class="streifen"></div><div class="kopf"><span class="etikett" id="tutnr"></span><button id="tutweg">Überspringen</button></div><div id="tuttxt"></div><i><b id="tutbar"></b></i></section>`);
const erfQ=[];let erfT=0;
function erfCheck(){G.erf=G.erf||{};for(const[id,n,txt,f]of ERF){if(G.erf[id]!==undefined)continue;let ok=false;try{ok=f()}catch(e){}if(ok){G.erf[id]=Math.floor(G.t||0);erfQ.push([n,txt])}}
 if(erfQ.length&&$('erfpop').hidden&&!SHELL.titel){let[n,txt]=erfQ.shift();if(erfQ.length>2){n=(erfQ.length+1)+' Erfolge freigeschaltet';txt='Schau im Menü unter Erfolge nach.';erfQ.length=0}$('erfname').textContent=n;$('erftext').textContent=txt;$('erfpop').hidden=false;sfx('kasse');clearTimeout(erfT);erfT=setTimeout(()=>{$('erfpop').hidden=true},4200)}}
function erfZeigen(){const e=G.erf||{},n=ERF.filter(q=>e[q[0]]!==undefined).length;$('erfzahl').textContent=`${n} von ${ERF.length} freigeschaltet`;$('erfliste').innerHTML=ERF.map(([id,nm,txt])=>`<div class="erf${e[id]!==undefined?' da':''}"><b>${e[id]!==undefined?'✓ ':''}${nm}</b><span>${txt}</span></div>`).join('');$('erfolge').hidden=false;$('erfzu').focus()}
$('erfzu').onclick=()=>{$('erfolge').hidden=true};
for(const[id,vor]of[['p-erf','p-einst'],['t-erf','t-einst']]){const b=document.createElement('button');b.id=id;b.textContent='Erfolge';b.onclick=erfZeigen;$(vor).before(b)}
addEventListener('keydown',ev=>{if(!$('erfolge').hidden){ev.stopImmediatePropagation();if(ev.key==='Escape'){ev.preventDefault();$('erfolge').hidden=true}}},true);
{const _t=toast;toast=function(s){if(/^Auftrag erfüllt/.test(s))G.aufOk=(G.aufOk||0)+1;_t(s)}}
