/* ====== Touch-Steuerung (Handy und Tablet) ====== */
const TOUCH=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
(function(){
 const sp=canvas.setPointerCapture.bind(canvas);canvas.setPointerCapture=id=>{try{sp(id)}catch(e){}};
 const tp=new Map();let mode=null,first=null,gest=null,lp=null,pipette=false;
 const fwd=(type,x,y,id)=>{const e=new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'mouse',isPrimary:true,clientX:x,clientY:y,button:type==='pointermove'?-1:0,buttons:type==='pointerup'?0:1});e.__fwd=true;canvas.dispatchEvent(e)};
 const dragTool=()=>tool==='x'||tool==='fundament'||tool==='kx'||tool==='fx'||tool==='gleis'||(tool&&BK(tool));
 const panBy=(dx,dy)=>{const sc=C.dist*.00125*(devicePixelRatio>1.5?1.3:1),c=Math.cos(C.yaw),s=Math.sin(C.yaw);C.tx-=(dx*c+dy*s)*sc;C.tz-=(-dx*s+dy*c)*sc;clampC()};
 const two=()=>{const[a,b]=[...tp.values()];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)||1,w:Math.atan2(b.y-a.y,b.x-a.x)}};
 const stopLP=()=>{if(lp){clearTimeout(lp);lp=null}};
 function pip(x,y){const w=pick({clientX:x,clientY:y});pipette=false;$('tb-pip').classList.remove('an');if(!w)return;const e=at(Math.floor(w[0]),Math.floor(w[1]));if(e&&avail().includes(e.k)){setTool(e.k);rot=e.r||0;pickRez=e.rez?[e.k,e.rez]:null;toast(K[e.k].n+' übernommen')}else toast('Hier steht nichts zum Übernehmen.')}
 canvas.addEventListener('pointerdown',ev=>{if(ev.__fwd||ev.pointerType!=='touch')return;ev.stopImmediatePropagation();ev.preventDefault();
  tp.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(tp.size===1){first={id:ev.pointerId,sx:ev.clientX,sy:ev.clientY,x:ev.clientX,y:ev.clientY};mode='pending';fwd('pointermove',ev.clientX,ev.clientY,ev.pointerId);
   stopLP();lp=setTimeout(()=>{lp=null;if(mode==='pending'){mode='done';if(tool){setTool(null);toast('Werkzeug abgelegt')}else select(null)}},600)}
  else if(tp.size===2){stopLP();if(mode==='game'){drag=null}mode='gesture';gest=two()}},true);
 canvas.addEventListener('pointermove',ev=>{if(ev.__fwd||ev.pointerType!=='touch')return;ev.stopImmediatePropagation();const p=tp.get(ev.pointerId);if(!p)return;const dx=ev.clientX-p.x,dy=ev.clientY-p.y;p.x=ev.clientX;p.y=ev.clientY;
  if(mode==='gesture'){if(tp.size<2)return;const g=two();panBy(g.x-gest.x,g.y-gest.y);C.tdist=T.MathUtils.clamp(C.tdist*gest.d/g.d,14,260);let dw=g.w-gest.w;if(dw>Math.PI)dw-=2*Math.PI;if(dw<-Math.PI)dw+=2*Math.PI;C.tyaw-=dw;gest=g;return}
  if(!first||ev.pointerId!==first.id)return;first.x=ev.clientX;first.y=ev.clientY;
  if(mode==='pending'&&Math.hypot(ev.clientX-first.sx,ev.clientY-first.sy)>10){stopLP();if(pipette||!tool){mode='pan';panBy(ev.clientX-first.sx,ev.clientY-first.sy);return}if(dragTool()){mode='game';fwd('pointerdown',first.sx,first.sy,ev.pointerId)}else mode='aim'}
  if(mode==='pan')panBy(dx,dy);else if(mode==='game'||mode==='aim')fwd('pointermove',ev.clientX,ev.clientY,ev.pointerId)},true);
 const up=ev=>{if(ev.__fwd||ev.pointerType!=='touch')return;ev.stopImmediatePropagation();if(!tp.has(ev.pointerId))return;tp.delete(ev.pointerId);stopLP();const cancel=ev.type==='pointercancel';
  if(mode==='gesture'){if(!tp.size)mode=null;return}
  if(!first||ev.pointerId!==first.id)return;const x=first.x,y=first.y;
  if(mode==='pending'&&!cancel){if(pipette)pip(x,y);else{fwd('pointerdown',x,y,ev.pointerId);fwd('pointerup',x,y,ev.pointerId)}}
  else if(mode==='aim'&&!cancel){fwd('pointerdown',x,y,ev.pointerId);fwd('pointerup',x,y,ev.pointerId)}
  else if(mode==='game'){if(cancel)drag=null;else fwd('pointerup',x,y,ev.pointerId)}
  mode=null;first=null};
 canvas.addEventListener('pointerup',up,true);canvas.addEventListener('pointercancel',up,true);
 if(!TOUCH)return;
 document.documentElement.classList.add('touch');
 const bar=document.createElement('nav');bar.id='tbar';bar.className='tafel';bar.setAttribute('aria-label','Touch-Werkzeuge');
 bar.innerHTML='<button id="tb-rot" title="Bauwerk drehen">⟳ Drehen</button><button id="tb-ab" title="Werkzeug ablegen">✕ Ablegen</button><button id="tb-pip" title="Maschine übernehmen">Pipette</button><button id="tb-ql" title="Kamera links drehen">↶</button><button id="tb-qr" title="Kamera rechts drehen">↷</button><button id="tb-hoch" title="Kamera steiler">▲</button><button id="tb-flach" title="Kamera flacher">▼</button><button id="tb-map" title="Karte groß">Karte</button>';
 document.body.appendChild(bar);
 $('tb-rot').onclick=()=>{if(tool==='fundament'){fundUp=(fundUp+1)%3;toast('Fundament: '+(fundUp+1)+' Ebene(n) höher')}else rot=(rot+1)%4};
 $('tb-ab').onclick=()=>{setTool(null);select(null);pipette=false;$('tb-pip').classList.remove('an')};
 $('tb-pip').onclick=()=>{pipette=!pipette;$('tb-pip').classList.toggle('an',pipette);if(pipette)toast('Tippe auf eine Maschine, um sie zu übernehmen.')};
 $('tb-ql').onclick=()=>{C.tyaw-=Math.PI/4};$('tb-qr').onclick=()=>{C.tyaw+=Math.PI/4};
 $('tb-hoch').onclick=()=>{C.pitch=T.MathUtils.clamp(C.pitch+.15,.45,1.4)};$('tb-flach').onclick=()=>{C.pitch=T.MathUtils.clamp(C.pitch-.15,.45,1.4)};
 $('tb-map').onclick=()=>{$('mini').classList.toggle('gross');miniDraw()};
 $('ms').addEventListener('click',()=>$('ms').classList.toggle('klein'));if(innerHeight<520||innerWidth<700)$('ms').classList.add('klein');
 const tab=document.querySelector('#hilfe table');if(tab)tab.innerHTML=[
  ['Ein Finger ziehen','Karte bewegen (ohne Werkzeug)'],['Zwei Finger','Verschieben, Zoomen (Spreizen) und Kamera drehen'],['▲ / ▼, ↶ / ↷','Kamera neigen und in 45°-Schritten drehen'],
  ['Antippen','Bauwerk setzen, ohne Werkzeug: Details zur Maschine'],['Finger auf Karte ziehen','Bänder, Fundament und Abriss: Strecke oder Fläche ziehen; andere Bauwerke: zielen und loslassen'],
  ['Leiste unten','Bauwerk wählen, Menü öffnet Baumenü und Technikbaum'],['⟳ Drehen','Bauwerk drehen, der gelbe Pfeil zeigt den Ausgang'],['✕ Ablegen / lange drücken','Werkzeug ablegen'],
  ['Pipette','Danach auf eine Maschine tippen: übernimmt sie samt Rezept und Richtung'],['Karte','Minimap vergrößern, Tippen springt dorthin'],['Meilenstein-Tafel antippen','Tafel ein- und ausklappen'],['II / 1× / 3×','Pause und Tempo']]
  .map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('')})();
