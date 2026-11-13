/* ====== Einweisung für neue Spieler ====== */
const TUT={menu:false,cam:null,steps:[
 ['Willkommen im Werk. Sieh dich um: Bewege die Karte mit WASD oder der rechten Maustaste, zoome mit dem Mausrad.','Sieh dich um: Zieh mit einem Finger über die Karte, zoome mit zwei Fingern.',()=>TUT.cam&&Math.hypot(C.tx-TUT.cam[0],C.tz-TUT.cam[1])>6],
 ['Dein erster Strang läuft schon. Wähl unten den Bohrer und setz einen zweiten auf das braune Eisenerz.',null,()=>(byKind.bohrer||[]).length>=2],
 ['Der Bohrer braucht einen Abnehmer. Bau einen Ofen in die Nähe.',null,()=>(byKind.ofen||[]).length>=2],
 ['Verbinde alles mit Bändern: vom gelben Ausgang des Bohrers zum Ofen und vom Ofen zur Zentrale. Zieh dazu mit dem Band-Werkzeug über die Felder.',null,()=>belts.length>=12],
 ['Maschinen brauchen Strom. Setz Strommasten, bis die neuen Maschinen im gelben Bereich stehen.',null,()=>(byKind.mast||[]).length>=3&&machines.filter(e=>e.net).length>=4],
 ['Wird der Strom knapp, hilft ein Generator. Bau einen und versorge ihn mit Kohle, am einfachsten direkt vor einem Bohrer auf dem schwarzen Kohlefeld.',null,()=>(byKind.generator||[]).length>=1],
 ['Im Baumenü findest du alle Bauwerke und den Technikbaum mit allen Rezepten. Öffne es mit Tab.','Im Baumenü findest du alle Bauwerke und den Technikbaum mit allen Rezepten. Öffne es über „Menü“ in der Leiste.',()=>TUT.menu],
 ['Jetzt liefere 525 Eisenplatten an die Zentrale. Damit schaffst du den ersten Meilenstein und schaltest neue Bauwerke frei.',null,()=>G.ms>=1]]};
{const _m=menuOpen;menuOpen=function(on){if(on&&G&&G.tut>=0)TUT.menu=true;_m(on)}}
function tutTick(){if(G.tut===undefined)G.tut=(G.ms>0||E.size>9)?-1:0;const el=$('tut');if(G.tut<0||SHELL.titel){el.hidden=true;return}
 if(!TUT.cam)TUT.cam=[C.tx,C.tz];const st=TUT.steps[G.tut];if(st[2]()){G.tut++;sfx('kasse');if(G.tut>=TUT.steps.length){G.tut=-1;el.hidden=true;toast('Einweisung abgeschlossen. Viel Erfolg mit deinem Werk.');return}}
 const s=TUT.steps[G.tut];$('tutnr').textContent=`Einweisung · Schritt ${G.tut+1} von ${TUT.steps.length}`;$('tuttxt').textContent=TOUCH&&s[1]?s[1]:s[0];$('tutbar').style.width=(G.tut/TUT.steps.length*100)+'%';el.hidden=!$('hilfe').hidden}
$('tutweg').onclick=()=>{G.tut=-1;$('tut').hidden=true};
{let k=0;setInterval(()=>{if(!G||window.__noloop&&!window.__tick)return;tutTick();if(++k%4===0&&!SHELL.titel)erfCheck()},500)}
