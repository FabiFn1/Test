/* ====== Simulationstakt: alles, was mit der Spielzeit läuft ======
   Läuft im Hauptstrang (frame) oder im Simulations-Thread. dt ist echte Zeit in Sekunden. */
// Höchstens 3 Schritte je Aufruf: Ist die Simulation zu langsam, läuft das Spiel etwas langsamer statt die Bildrate in den Keller zu ziehen
const SIM=new SW.Simulationsschleife({hz:30,maxSchritte:3,schritt:h=>{step(h);EV.melde('schritt',h)}});
let pwT=0,trick=0,rateT=0,rateShow={};const rateH=[];
function simTakt(dt){SIM.vor(dt*G.speed);
 pwT+=dt;if(pwT>.25){pwT=0;power()}
 // Notreserve: Ohne Eisenplatten kommt alle 3 Sekunden eine dazu, bis 30 im Lager liegen
 trick+=dt*G.speed;if(trick>3){trick=0;if((G.stock.eisenplatte||0)<30)G.stock.eisenplatte=(G.stock.eisenplatte||0)+1}
 // Liefermengen je Minute aus den letzten 60 Sekunden
 rateT+=dt;if(rateT>=10){rateT=0;rateH.push({...rate});for(const k in rate)delete rate[k];if(rateH.length>6)rateH.shift();rateShow={};for(const r of rateH)for(const k in r)rateShow[k]=(rateShow[k]||0)+r[k];const f=60/(rateH.length*10);for(const k in rateShow)rateShow[k]=Math.round(rateShow[k]*f)}}
