/* ====== Bedienung: Icons, Bauhilfen, Verteiler, Aufträge, Rezepte ====== */
/* --- Icons für alle Materialien --- */
const ICONS={},ICELL={};
function iconArt(k){const t=ITEMS[k][2];if(t==='lump')return'brocken';if(/draht|kabel/.test(k))return'spule';if(/schaltkreis|logik|prozessor|computer|sensor|steuerung|solarzelle/.test(k))return'chip';if(/^f\d$/.test(k))return'kolben';if(/rohoel|schmierstoff|treibstoff|saeure|gummi|kunststoff|zement/.test(k))return'fass';if(/zahnrad|getriebe|lager|rotor|stator|motor|antrieb|turbine|triebwerk/.test(k))return'rad';if(/stange|rohr|schraube|brennstab|pellet/.test(k))return'stab';if(/batterie|akku/.test(k))return'akku';if(/roboter|rakete/.test(k))return'figur';return t==='plate'?'platte':'kiste'}
const ICATLAS=(function(){const A=document.createElement('canvas');A.width=A.height=640;const ag=A.getContext('2d');let n=0;
 for(const k in ITEMS){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),col=new T.Color(ITEMS[k][1]),hex=f=>'#'+col.clone().multiplyScalar(f).getHexString(),hell='#'+col.clone().lerp(new T.Color(1,1,1),.45).getHexString(),a=iconArt(k);
  g.fillStyle='#101a1fe6';g.beginPath();g.roundRect(2,2,60,60,12);g.fill();g.strokeStyle='#3c5059';g.lineWidth=2;g.stroke();g.lineJoin='round';g.lineWidth=3;g.strokeStyle='#0a0f12';g.fillStyle=hex(1);
  const poly=p=>{g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();g.stroke()};
  if(a==='brocken'){poly([[14,40],[20,20],[36,13],[50,24],[52,42],[38,52],[22,51]]);g.fillStyle=hell;poly([[24,24],[36,18],[44,26],[32,32]])}
  else if(a==='platte'){for(let i=2;i>=0;i--){g.fillStyle=i?hex(.75):hex(1);poly([[10,38-i*-5-6],[32,26+i*5-6],[54,38+i*5-6],[32,50+i*5-6]])}g.fillStyle=hell;poly([[18,32],[32,25],[40,29],[26,36]])}
  else if(a==='spule'){g.lineWidth=7;g.strokeStyle='#0a0f12';g.beginPath();g.arc(32,32,17,0,6.3);g.stroke();g.lineWidth=5;g.strokeStyle=hex(1);g.beginPath();g.arc(32,32,17,0,6.3);g.stroke();g.strokeStyle=hell;g.beginPath();g.arc(32,32,9,0,6.3);g.stroke()}
  else if(a==='chip'){g.strokeStyle='#c9d2d8';g.lineWidth=3;for(let i=0;i<4;i++){const q=20+i*8;g.beginPath();g.moveTo(q,10);g.lineTo(q,54);g.moveTo(10,q);g.lineTo(54,q);g.stroke()}g.strokeStyle='#0a0f12';g.fillStyle=hex(1);g.beginPath();g.roundRect(16,16,32,32,4);g.fill();g.stroke();g.fillStyle=hell;g.fillRect(24,24,16,16)}
  else if(a==='kolben'){poly([[27,12],[37,12],[37,26],[50,48],[46,54],[18,54],[14,48],[27,26]]);g.fillStyle=hell;poly([[24,40],[40,40],[45,49],[19,49]])}
  else if(a==='fass'){g.beginPath();g.roundRect(18,12,28,42,6);g.fill();g.stroke();g.fillStyle=hell;g.fillRect(19,22,26,5);g.fillRect(19,39,26,5)}
  else if(a==='rad'){g.beginPath();for(let i=0;i<16;i++){const r=i%2?21:15,w=i*.3927;g.lineTo(32+Math.cos(w)*r,32+Math.sin(w)*r)}g.closePath();g.fill();g.stroke();g.fillStyle='#101a1f';g.beginPath();g.arc(32,32,6,0,6.3);g.fill();g.stroke()}
  else if(a==='stab'){g.save();g.translate(32,32);g.rotate(-.7);for(const y of[-9,3]){g.beginPath();g.roundRect(-22,y,44,8,3);g.fill();g.stroke()}g.restore()}
  else if(a==='akku'){g.fillRect(27,10,10,6);g.strokeRect(27,10,10,6);g.beginPath();g.roundRect(18,15,28,39,5);g.fill();g.stroke();g.fillStyle=hell;poly([[34,22],[25,36],[32,36],[29,47],[39,32],[32,32]])}
  else if(a==='figur'){g.beginPath();g.roundRect(22,10,20,16,4);g.fill();g.stroke();g.beginPath();g.roundRect(17,28,30,20,4);g.fill();g.stroke();g.fillRect(22,48,7,8);g.fillRect(35,48,7,8);g.fillStyle=hell;g.fillRect(26,15,4,4);g.fillRect(34,15,4,4)}
  else{poly([[12,24],[32,14],[52,24],[52,44],[32,54],[12,44]]);g.fillStyle=hex(.7);poly([[32,34],[52,24],[52,44],[32,54]]);g.fillStyle=hell;poly([[12,24],[32,14],[52,24],[32,34]])}
  ICONS[k]=c.toDataURL();ICELL[k]=[n%10,Math.floor(n/10)];ag.drawImage(c,(n%10)*64,Math.floor(n/10)*64);n++}
 const t=new T.CanvasTexture(A);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t})();
const ic=(k,s)=>`<img src="${ICONS[k]}" alt="" style="width:${s||22}px;height:${s||22}px;vertical-align:middle">`;
document.head.insertAdjacentHTML('beforeend',`<style>
#meld{position:fixed;left:50%;top:132px;transform:translateX(-50%);z-index:7;background:var(--tafel);border:1px solid var(--gut);box-shadow:0 3px 0 #0f171b;padding:8px 18px 10px;display:grid;gap:2px;min-width:280px;max-width:520px;text-align:center;zoom:var(--ui)}#meld b{font:700 20px var(--display)}
#ktliste{display:none!important}#rezsuch{background:#0f171b;color:var(--text);border:1px solid var(--linie);font:16px var(--display);padding:5px 9px;width:min(320px,100%)}
#ketten>#rezliste{display:grid;grid-template-columns:1fr;gap:3px;font-size:15px}.rz .zu span{white-space:nowrap}#rezliste h4{margin:10px 0 2px;font:600 13px var(--display);letter-spacing:.1em;text-transform:uppercase;color:var(--signal)}
.rz{display:grid;grid-template-columns:minmax(150px,210px) 20px minmax(0,1fr) 130px;gap:8px;align-items:center;background:var(--tafel2);border:1px solid var(--linie);padding:3px 8px}.rz .zu{display:flex;flex-wrap:wrap;gap:3px 12px}.rz small{color:var(--matt);font:12px var(--mono);text-align:right}
#insp .rez button[data-r]{display:flex;align-items:center;gap:6px}#insp .vt{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.ak button:disabled{opacity:.45;cursor:default}.ak .ok{color:var(--gut)}.ak .fehlt{color:var(--signal)}
@media (max-width:700px){.rz{grid-template-columns:1fr}}
</style>`);
document.body.insertAdjacentHTML('beforeend','<div id="meld" hidden><span class="etikett" id="meldk"></span><b id="meldn"></b><span id="meldt" class="matt"></span></div>');
let meldT=0;function meldung(kopf,name,text,ton){$('meldk').textContent=kopf;$('meldn').textContent=name;$('meldt').textContent=text;$('meld').hidden=false;sfx(ton||'kasse');clearTimeout(meldT);meldT=setTimeout(()=>{$('meld').hidden=true},6000)}
/* --- Reihenfolge der Rezepte: nach dem Meilenstein, für den man sie zuerst braucht --- */
const STUFE={};(function(){const f=(k,tiefe)=>{if(STUFE[k]!==undefined)return STUFE[k];if(tiefe>12)return 99;let s=MS.findIndex(m=>m.need0?m.need0[k]:m.need[k]);if(s<0)s=99;STUFE[k]=s;for(const id in REZ){const r=REZ[id];if(r.in[k])s=Math.min(s,f(r.out[0],tiefe+1))}return STUFE[k]=s};for(const k in ITEMS)f(k,0)})();
const REZSORT=Object.keys(REZ).sort((a,b)=>(STUFE[REZ[a].out[0]]-STUFE[REZ[b].out[0]])||ITEMS[REZ[a].out[0]][0].localeCompare(ITEMS[REZ[b].out[0]][0]));
/* --- Technikbaum: Rezeptliste mit Suche und Icons --- */
{const k=$('ketten');k.insertAdjacentHTML('beforeend','<input id="rezsuch" type="search" placeholder="Rezept suchen: Material oder Maschine" aria-label="Rezept suchen"><div id="rezliste"></div>');let alt=null;
 const zeig=()=>{const q=$('rezsuch').value.trim().toLowerCase(),key=q+'|'+G.ms;if(key===alt)return;alt=key;let h='',st=-2;for(const id of REZSORT){const r=REZ[id],o=r.out[0],txt=(ITEMS[o][0]+' '+K[r.b].n+' '+Object.keys(r.in).map(i=>ITEMS[i][0]).join(' ')).toLowerCase();if(q&&!txt.includes(q))continue;const s=STUFE[o];
   if(s!==st){st=s;h+=`<h4>${s>=99?'Ohne Meilenstein':'Ab Meilenstein '+(s+1)+' · '+MS[s].n}${s<G.ms?' · geschafft':s===G.ms?' · aktuell':''}</h4>`}
   h+=`<div class="rz"><div>${ic(o,26)} <b>${ITEMS[o][0]}${r.out[1]>1?' ×'+r.out[1]:''}</b></div><span>←</span><div class="zu">${Object.entries(r.in).map(([i,n])=>`<span>${ic(i,20)} ${n} ${ITEMS[i][0]}</span>`).join('')}</div><small>${K[r.b].n} · ${r.t} s</small></div>`}
  $('rezliste').innerHTML=h||'<p class="matt">Kein Rezept gefunden.</p>'};
 $('rezsuch').addEventListener('input',zeig);$('rezsuch').addEventListener('keydown',ev=>ev.stopPropagation());const _b=baumDraw;baumDraw=function(){_b();zeig()}}
/* --- Maschinenfenster: Rezepte sortiert mit Icons, Verteiler-Einstellungen, Verbrauch pro Minute --- */
{const _s=select;select=function(e){_s(e);if(!sel)return;const el=$('insp'),box=el.querySelector('.rez');
 if(box&&el.querySelector('[data-r]')){const bs=[...box.querySelectorAll('[data-r]')];bs.sort((a,b)=>REZSORT.indexOf(a.dataset.r)-REZSORT.indexOf(b.dataset.r));for(const b of bs){const r=REZ[b.dataset.r];b.innerHTML=ic(r.out[0],24)+`<span>${ITEMS[r.out[0]][0]}${r.out[1]>1?' ×'+r.out[1]:''} <small style="color:var(--matt)">← ${Object.entries(r.in).map(([i,n])=>n+' '+ITEMS[i][0]).join(' + ')}</small></span>`;box.appendChild(b)}}
 if(e.k==='verteiler'){const zu=e.zu||{},N_={g:'Geradeaus',l:'Links',r:'Rechts'};$('live').insertAdjacentHTML('beforebegin',`<div class="etikett">Ausgänge (in Laufrichtung)</div><div class="vt">${['l','g','r'].map(q=>`<button data-vz="${q}" class="${zu[q]?'':'an'}">${N_[q]}: ${zu[q]?'zu':'offen'}</button>`).join('')}</div><div class="etikett">Vorrang: erst diesen Ausgang füllen, Rest läuft über</div><div class="vt">${['l','g','r'].map(q=>`<button data-vp="${q}" class="${e.prio===q?'an':''}">${N_[q]}</button>`).join('')}</div><button data-vp="" class="${e.prio?'':'an'}">Kein Vorrang, gleichmäßig aufteilen</button>`);
  el.querySelectorAll('[data-vz]').forEach(b=>b.onclick=()=>{e.zu=e.zu||{};e.zu[b.dataset.vz]=!e.zu[b.dataset.vz];if(e.zu.g&&e.zu.l&&e.zu.r){e.zu[b.dataset.vz]=false;toast('Mindestens ein Ausgang muss offen bleiben.')}select(e)});el.querySelectorAll('[data-vp]').forEach(b=>b.onclick=()=>{e.prio=b.dataset.vp||undefined;select(e)})}}}
{const _l=inspLive;inspLive=function(){_l();if(!sel||!E.has(sel.id)||$('insp').hidden)return;const e=sel,l=$('live'),k=K[e.k];if(!l)return;let t='';const f=v=>v>=100?Math.round(v):v>=10?v.toFixed(1):v.toFixed(2);
 if(e.k==='verteiler')t='Teilt Material auf die offenen Ausgänge auf.'+(e.prio?'\nVorrang: '+({g:'geradeaus',l:'links',r:'rechts'})[e.prio]:'');
 if(e.rez&&REZ[e.rez]&&RB.has(base(e.k))){const r=REZ[e.rez],sp=TS(e)*(k.sp||1)*60/r.t;t+='\nPro Minute bei vollem Strom:\n'+Object.entries(r.in).map(([i,n])=>'  − '+f(n*sp)+' '+ITEMS[i][0]).join('\n')+'\n  + '+f(r.out[1]*sp)+' '+ITEMS[r.out[0]][0]}
 else if(e.ore)t+='\nPro Minute: + '+f(TS(e)*e.oreN/4*e.pur/k.t*60)+' '+ITEMS[ORES[e.ore]][0];
 if(k.burn)t+='\nVerbrauch: '+f(60/k.burn)+' '+ITEMS[k.fuel||'kohle'][0]+' pro Minute';
 if(k.p)t+='\nStrombedarf: '+f(k.p*(e.oc||1)*(e.oc||1)*TIER[e.tier||0].pw)+' MW';
 if(t)l.textContent=(l.textContent+'\n'+t).replace(/\n{2,}/g,'\n')}}
/* --- Symbol über jeder Maschine: was sie herstellt --- */
const MHOEHE={};for(const k in MODELS){let y=0;for(const q of MODELS[k]){q.g.computeBoundingBox();y=Math.max(y,q.g.boundingBox.max.y+(q.piv?q.piv[1]:0))}MHOEHE[k]=y}
const MSYM=(function(){const g=new T.PlaneGeometry(1,1),max=900;g.setAttribute('aO',new T.InstancedBufferAttribute(new Float32Array(max*2),2));
 const m=new T.InstancedMesh(g,new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:ICATLAS}},
  vertexShader:'attribute vec2 aO;varying vec2 vUv;void main(){vUv=(uv+aO)/10.;vec4 mv=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float s=length(instanceMatrix[0].xyz);mv.xy+=position.xy*s;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform sampler2D map;varying vec2 vUv;void main(){vec4 t=texture2D(map,vUv);if(t.a<.05)discard;gl_FragColor=t;\n#include <colorspace_fragment>\n}'}),max);m.count=0;m.frustumCulled=false;m.renderOrder=5;scene.add(m);return m})();
function symUpdate(){const m=MSYM,A=m.geometry.attributes.aO,o=GB.ob;let n=0;if(SET.symbole!==false&&C.dist<95&&!SHELL.titel){const r=Math.max(40,C.dist),s=Math.min(1.15,Math.max(.42,C.dist*.017));
  for(const e of machines){if(e.hh||n>=900||Math.abs(e.x-C.x)>r||Math.abs(e.y-C.z)>r)continue;const it=e.bau?null:e.rez&&REZ[e.rez]?REZ[e.rez].out[0]:e.ore?ORES[e.ore]:null;if(!it)continue;const g=K[e.k].s,c=ICELL[it];o.position.set(e.x+g/2,YL(e.z)+(MHOEHE[e.k]||2)+.2+s*.5,e.y+g/2);o.rotation.set(0,0,0);o.scale.setScalar(s);o.updateMatrix();m.setMatrixAt(n,o.matrix);A.array[n*2]=c[0];A.array[n*2+1]=9-c[1];n++}}
 m.count=n;m.instanceMatrix.needsUpdate=true;A.needsUpdate=true}
/* --- Material auf Bändern: größer und kräftiger --- */
IM.lump.geometry=new T.DodecahedronGeometry(.17);IM.plate.geometry=new T.BoxGeometry(.34,.09,.34);IM.part.geometry=new T.CylinderGeometry(.165,.165,.15,10);for(const t in IM){IM[t].material.roughness=.4;IM[t].material.envMapIntensity=1.3;IM[t].material.emissive=new T.Color(0x222222)}
/* --- Bandoberfläche: dunkles Gummi mit Richtungspfeilen --- */
{const c=beltTex.image,g=c.getContext('2d'),w=c.width;g.fillStyle='#24272a';g.fillRect(0,0,w,w);for(let i=0;i<2500;i++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.03)':'rgba(0,0,0,.1)';g.fillRect(Math.random()*w,Math.random()*w,2,2)}
 g.strokeStyle='#5b6369';g.lineWidth=w*.07;g.lineJoin='miter';for(const x0 of[.12,.62]){g.beginPath();g.moveTo(w*x0,w*.2);g.lineTo(w*(x0+.2),w*.5);g.lineTo(w*x0,w*.8);g.stroke()}g.fillStyle='#3a4046';g.fillRect(0,0,w,w*.06);g.fillRect(0,w*.94,w,w*.06);beltTex.needsUpdate=true;if(mats.BandStill&&mats.BandStill.map)mats.BandStill.map.needsUpdate=true}
C1.set(0x3d5f8a);
/* --- Bauhilfen im Baumodus --- */
let baut=false,abr=null,klemm=null;
function bandKette(b){const seen=new Set([b]),st=[b];while(st.length&&seen.size<3000){const q=st.pop(),n=at(q.x+DX[q.r],q.y+DY[q.r]);if(isBelt(n)&&!seen.has(n)){seen.add(n);st.push(n)}for(let d=0;d<4;d++){const m=at(q.x-DX[d],q.y-DY[d]);if(isBelt(m)&&m.r===d&&!seen.has(m)){seen.add(m);st.push(m)}}}return[...seen]}
function wegMit(l){let n=0;for(const e of l){if(e.k==='zentrale'||!E.has(e.id))continue;pay(e.k,1);del(e);n++}if(n){relist();sfx('abriss')}return n}
canvas.addEventListener('pointerdown',ev=>{if(ev.button===0&&ev.ctrlKey){const w=pick(ev);if(!w)return;ev.stopImmediatePropagation();ev.preventDefault();abr={a:[Math.floor(w[0]),Math.floor(w[1])],b:[Math.floor(w[0]),Math.floor(w[1])]}}},true);
canvas.addEventListener('pointermove',ev=>{if(abr){ev.stopImmediatePropagation();const w=pick(ev);if(w)abr.b=[Math.floor(w[0]),Math.floor(w[1])]}},true);
canvas.addEventListener('pointerup',ev=>{if(abr){ev.stopImmediatePropagation();const x0=Math.min(abr.a[0],abr.b[0]),x1=Math.max(abr.a[0],abr.b[0]),y0=Math.min(abr.a[1],abr.b[1]),y1=Math.max(abr.a[1],abr.b[1]),s=new Set();for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const e=at(x,y);if(e)s.add(e)}abr=null;const n=wegMit([...s]);if(n)toast(n+' Bauwerke abgerissen, Kosten zurück.')}},true);
canvas.addEventListener('pointerdown',ev=>{baut=ev.button===0&&!ev.ctrlKey&&!!tool&&!!K[tool]&&!BK(tool)&&!['x','fx','kx','bp','fundament','gleis'].includes(tool)});
canvas.addEventListener('pointermove',ev=>{if(baut&&(ev.buttons&1)&&tool&&canPlace(tool,hover[0],hover[1]))place(tool,hover[0],hover[1],rot,true)});
addEventListener('pointerup',()=>{baut=false});
addEventListener('keydown',ev=>{if(ev.target.tagName==='INPUT'||SHELL.titel||SHELL.pause||!$('menu').hidden||!$('lw').hidden)return;const k=ev.key.toLowerCase(),ziel=()=>(hoverT&&at(hoverT[0],hoverT[1]))||sel;
 if(k==='delete'||k==='backspace'){const e=ziel();if(!e)return;ev.preventDefault();if(isBelt(e)){const n=wegMit(bandKette(e));toast('Bandstrecke mit '+n+' Feldern entfernt.')}else remove(e)}
 else if((ev.ctrlKey||ev.metaKey)&&k==='c'){const e=ziel();if(!e)return;ev.preventDefault();ev.stopImmediatePropagation();klemm={b:base(e.k),k:e.k,rez:e.rez,oc:e.oc,f:e.f,zu:e.zu?{...e.zu}:null,prio:e.prio};toast('Kopiert: '+K[e.k].n+(e.rez?' · '+ITEMS[REZ[e.rez].out[0]][0]:e.f?' · '+ITEMS[e.f][0]:''))}
 else if((ev.ctrlKey||ev.metaKey)&&k==='v'){const e=ziel();if(!e||!klemm)return;ev.preventDefault();ev.stopImmediatePropagation();if(base(e.k)!==klemm.b&&!(/greifer|sortierer/.test(e.k)&&/greifer|sortierer/.test(klemm.k))){toast('Passt nicht: kopiert wurde '+K[klemm.k].n+'.');return}
  if(klemm.rez&&RB.has(base(e.k))&&e.rez!==klemm.rez){e.rez=klemm.rez;e.prog=0;e.inv={}}if(klemm.oc&&K[e.k].p)e.oc=klemm.oc;if(/greifer|sortierer/.test(e.k))e.f=klemm.f;if(e.k==='verteiler'){e.zu=klemm.zu?{...klemm.zu}:undefined;e.prio=klemm.prio}toast('Eingefügt in '+K[e.k].n+'.');if(sel===e)select(e)}},true);
{const _g=ghostUp;ghostUp=function(){_g();symUpdate();const P=IO.pfeile,o=GB.ob,pf=(x,y,d,col,s)=>{const n=P.count;if(n>=800||x<0||y<0||x>=N||y>=N)return;o.position.set(x+.5,YL(Lv(x,y))+.09,y+.5);o.rotation.set(0,-d*Math.PI/2,0);o.scale.setScalar(s);o.updateMatrix();P.setMatrixAt(n,o.matrix);P.setColorAt(n,col);P.count=n+1};
 // Vorschau: Ein- und Ausgänge des Bauwerks, das gerade platziert wird
 if(tool&&K[tool]&&!drag&&!['x','fx','kx','bp','fundament','gleis','mast','grossmast','solar'].includes(tool)&&!BK(tool)){const s=K[tool].s,f={k:tool,x:hover[0],y:hover[1],r:rot},m=(s-1)>>1,gen=K[tool].gen,kl=/greifer/.test(tool),R=tool==='langgreifer'?2:1;
  if(kl){pf(f.x+DX[rot]*R,f.y+DY[rot]*R,rot,IO.aus,1.2);pf(f.x-DX[rot]*R,f.y-DY[rot]*R,rot,IO.ein,1.2)}
  else if(tool==='verteiler'||tool==='sortierer'||tool==='kreuzung'){}
  else{const ka=tool==='raketensilo'||tool==='versand'||tool==='traeger';if(!gen&&!ka){const q=outTile(f);pf(q[0],q[1],q[2],IO.aus,1.3)}if(RB.has(base(tool))||gen&&K[tool].burn||/lagerkiste|drohnenhafen|bahnhof|raketensilo|versand|traeger/.test(tool))for(let d=0;d<4;d++){if(d===rot&&!gen&&!ka)continue;const q=d===0?[f.x+s,f.y+m]:d===1?[f.x+s-1-m,f.y+s]:d===2?[f.x-1,f.y+s-1-m]:[f.x+m,f.y-1];pf(q[0],q[1],(d+2)%4,IO.ein,1)}}
  P.instanceMatrix.needsUpdate=true;if(P.instanceColor)P.instanceColor.needsUpdate=true}
 // Abrissbereich
 if(abr){const f=IO.feld,x0=Math.min(abr.a[0],abr.b[0]),x1=Math.max(abr.a[0],abr.b[0])+1,y0=Math.min(abr.a[1],abr.b[1]),y1=Math.max(abr.a[1],abr.b[1])+1;f.visible=true;f.position.set((x0+x1)/2,YL(Lv(abr.a[0],abr.a[1]))+.12,(y0+y1)/2);f.scale.set(x1-x0,1,y1-y0);f.material.color.set(0xff5a4a)}
 // Hinweis: Material auf dem Band unter dem Mauszeiger
 if(!tool&&!drag&&!tipHover&&hoverT&&$('menu').hidden){const e=at(hoverT[0],hoverT[1]),tp=$('tip');let ks=null;if(isBelt(e)&&e.it.length)ks=[...new Set(e.it.map(q=>q.k))];else if(e&&e.k==='kreuzung')ks=[...new Set(e.sl.flat().map(q=>q.k))];else if(e&&(e.k==='verteiler'||e.k==='sortierer')&&e.buf.length)ks=[...new Set(e.buf.map(q=>q.k))];
  if(ks&&ks.length){tp.innerHTML=ks.map(k=>ic(k,22)+' <b>'+ITEMS[k][0]+'</b>').join('<br>');tp.style.display='block';tp.style.left=(mouse[0]+18)+'px';tp.style.top=(mouse[1]+14)+'px';tp.style.bottom='auto'}}}}
/* --- Aufträge: Lieferung direkt aus dem Lager der Zentrale --- */
function aufNummern(){let n=1;for(const a of[...(G.auf||[]),...(G.ang||[])])a.id=n++;aufId=n}
aufDraw=function(){aufNummern();const b=$('lwbody'),A=G.auf||[],O=G.ang||[],f=n=>Math.floor(n).toLocaleString('de-DE');if(!fx('Erste Teile')){b.innerHTML='<p>Kundenaufträge starten nach dem Meilenstein Erste Teile.</p>';return}
 const lager=a=>{const h=G.stock[a.k]||0;return h>=a.n?`<span class="ok">Im Lager: ${f(h)} · reicht</span>`:`<span class="fehlt">Im Lager: ${f(h)} · es fehlen ${f(a.n-h)}</span>`};
 b.innerHTML=`<div class="etikett">Angenommen (höchstens 3)</div><div class="auf">${A.map(a=>{const h=G.stock[a.k]||0;return`<div class="ak"><b>${a.kunde}</b><span>${ic(a.k,22)} ${f(a.n)} ${ITEMS[a.k][0]}</span><i><b style="width:${Math.min(100,h/a.n*100)}%"></b></i>${lager(a)}<span>${f(a.lohn)} Cr · noch ${Math.max(0,Math.round((a.bis-G.t)/60))} min</span><button data-lf="${a.id}" ${h>=a.n?'':'disabled'}>${h>=a.n?'Jetzt ausliefern':'Noch nicht lieferbar'}</button><button data-ab="${a.id}">Abbrechen · Strafe ${f(Math.ceil(a.lohn*.1))} Cr</button></div>`}).join('')||'<p>Kein Auftrag angenommen.</p>'}</div>
 <div class="etikett">Angebote</div><div class="auf">${O.map(a=>`<div class="ak"><b>${a.kunde}</b><span>${ic(a.k,22)} ${f(a.n)} ${ITEMS[a.k][0]}</span>${lager(a)}<span>${f(a.lohn)} Cr · ${Math.round(a.dauer/60)} min Zeit</span><button data-an="${a.id}">Annehmen</button></div>`).join('')||'<p>Neue Angebote kommen laufend herein.</p>'}</div>
 <p class="matt">Aufträge werden aus dem Lager der Zentrale beliefert. Sobald genug Material da ist, lieferst du hier per Knopf aus. Läuft die Frist ab, verfällt der Auftrag ohne Bezahlung. Abbrechen kostet 10 % des Lohns als Strafe. Credits brauchst du für Tier-Aufrüstungen.</p>`};
$('lw').addEventListener('click',ev=>{const b=ev.target.closest('button[data-ab]');if(!b)return;const a=(G.auf||[]).find(q=>q.id===+b.dataset.ab);if(!a)return;if(!b.dataset.ok){b.dataset.ok='1';b.textContent='Wirklich abbrechen?';return}const s=Math.ceil(a.lohn*.1);G.cr=(G.cr||0)-s;G.auf.splice(G.auf.indexOf(a),1);toast(`Auftrag abgebrochen: ${a.kunde}. Strafe ${s.toLocaleString('de-DE')} Cr.`);aufDraw()});
$('lw').addEventListener('click',ev=>{const b=ev.target.closest('button[data-lf]');if(!b)return;const a=(G.auf||[]).find(q=>q.id===+b.dataset.lf);if(!a)return;if((G.stock[a.k]||0)<a.n){toast('Im Lager fehlen noch '+Math.ceil(a.n-(G.stock[a.k]||0)).toLocaleString('de-DE')+' '+ITEMS[a.k][0]+'.');aufDraw();return}G.stock[a.k]-=a.n;G.cr=(G.cr||0)+a.lohn;G.auf.splice(G.auf.indexOf(a),1);toast(`Auftrag erfüllt: ${a.kunde}, +${a.lohn.toLocaleString('de-DE')} Cr`);aufDraw()});
setInterval(()=>{if(!G||SHELL.titel)return;for(const a of G.auf||[]){const da=(G.stock[a.k]||0)>=a.n;if(da&&!a.bereit){a.bereit=true;meldung('Auftrag lieferbar',a.kunde,`${a.n.toLocaleString('de-DE')} ${ITEMS[a.k][0]} liegen im Lager. Liefere in der Leitwarte unter Aufträge aus.`)}else if(!da)a.bereit=false}if(!$('lw').hidden&&lwTab==='auf'&&!$('lwbody').matches(':hover'))aufDraw()},2000);
icons.fx='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><path d="M8 30 27 20l19 10-19 10z" fill="#8a9297" stroke="#1b2226" stroke-width="2"/><path d="M16 12l22 22M38 12 16 34" stroke="#e2574c" stroke-width="6" stroke-linecap="round"/></svg>');
