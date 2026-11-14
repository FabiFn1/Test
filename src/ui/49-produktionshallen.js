/* ====== Produktionshallen: ein Komplex wird zur geschlossenen Halle mit Toren und gemessenem Durchsatz ====== */
const HAL={feld:new Uint16Array(N*N),io:new Map(),gr:new T.Group(),neu:true,offen:0,
 tor:new T.MeshStandardMaterial({color:0x0b0e10,roughness:.9}),rahmen:new T.MeshStandardMaterial({color:0xe0a81f,roughness:.55,metalness:.2}),wand:M('Paneel').clone(),dach:M('Blechdach').clone()};HAL.wand.side=HAL.dach.side=T.DoubleSide;
scene.add(HAL.gr);
const hallen=()=>(G&&G.kx||[]).filter(x=>x.halle);
function hallenFeld(){HAL.feld.fill(0);for(const x of hallen())for(let y=x.y0;y<=x.y1;y++)HAL.feld.fill(x.id,y*N+x.x0,y*N+x.x1+1);for(const e of E.values())e.hh=HAL.feld[e.y*N+e.x]||0;HAL.neu=true}
// Zählt jede Übergabe über eine Hallengrenze (Band, Rohr, Greifarm, Maschinenausgang)
HALZ=function(x,y,d,k){const a=HAL.feld[y*N+x],b=HAL.feld[(y-DY[d])*N+x-DX[d]];if(a===b)return;if(a){const o=hallenIO(a).ein;o[k]=(o[k]||0)+1}if(b){const o=hallenIO(b).aus;o[k]=(o[k]||0)+1}};
function hallenIO(id){let o=HAL.io.get(id);if(!o){o={ein:{},aus:{},ein0:null,aus0:null,t:0};HAL.io.set(id,o)}return o}
// Je Minute: letzte volle Minute, davor Hochrechnung der laufenden
function hallenRate(id,art){const o=hallenIO(id),r={};if(o[art+'0']){Object.assign(r,o[art+'0']);return r}const f=60/Math.max(5,o.t);for(const k in o[art])r[k]=Math.round(o[art][k]*f);return r}
EV.an('schritt',h=>{for(const o of HAL.io.values()){o.t+=h;if(o.t>=60){o.t=0;o.ein0=o.ein;o.aus0=o.aus;o.ein={};o.aus={}}}});
function hallenTore(x){const t=[],drin=(a,b)=>a>=x.x0&&a<=x.x1&&b>=x.y0&&b<=x.y1;for(const b of belts){const nx=b.x+DX[b.r],ny=b.y+DY[b.r],i=drin(b.x,b.y),j=drin(nx,ny);if(i===j)continue;t.push({x:b.x+.5+DX[b.r]*.5,z:b.y+.5+DY[b.r]*.5,r:b.r,y:YL(b.z),rohr:b.k==='leitung',aus:i})}
 for(const e of machines){if(!e.out||K[e.k].gen||!drin(e.x,e.y))continue;const o=outTile(e);if(!drin(o[0],o[1]))t.push({x:o[0]+.5-DX[o[2]]*.5,z:o[1]+.5-DY[o[2]]*.5,r:o[2],y:YL(e.z),rohr:false,aus:true})}return t}
function hallePruefen(x){const w=x.x1-x.x0+1,h=x.y1-x.y0+1;if(w<4||h<4)return'Eine Halle braucht mindestens 4 × 4 Felder.';let n=0;
 for(const e of E.values()){const s=K[e.k].s;if(e.x+s<=x.x0||e.x>x.x1||e.y+s<=x.y0||e.y>x.y1)continue;if(e.x<x.x0||e.y<x.y0||e.x+s-1>x.x1||e.y+s-1>x.y1)return K[e.k].n+' ragt über den Rand des Komplexes.';if(e.k==='zentrale')return'Die Zentrale kann nicht in einer Halle stehen.';if(e.bau)return'Im Komplex wird noch gebaut.';if(e.inv)n++}
 if(!n)return'Im Komplex steht keine Maschine.';for(const q of hallen())if(q!==x&&q.x0<=x.x1&&q.x1>=x.x0&&q.y0<=x.y1&&q.y1>=x.y0)return'Der Komplex überschneidet sich mit '+q.name+'.';return''}
const halleKosten=x=>({eisenplatte:2*(x.x1-x.x0+x.y1-x.y0+2)*2,stein:(x.x1-x.x0+1)*(x.y1-x.y0+1)});
function halleBauen(x){const f=hallePruefen(x);if(f){toast(f);return false}const c=halleKosten(x);if(!G.frei){for(const k in c)if((G.stock[k]||0)<c[k]){toast(`Für die Halle fehlen ${c[k]-(G.stock[k]||0)} ${ITEMS[k][0]}.`);return false}for(const k in c)G.stock[k]-=c[k]}
 x.halle=true;HAL.io.delete(x.id);hallenFeld();select(null);toast(x.name+' ist jetzt eine Produktionshalle. Die Anlagen laufen darin weiter, ein Klick auf die Halle zeigt den Durchsatz.');return true}
function halleOeffnen(x){x.halle=false;HAL.io.delete(x.id);hallenFeld();halleZeigen(0);toast(x.name+' ist wieder offen.')}
/* --- Hülle --- */
function hallenSchild(name){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.fillStyle='#1d2a30';g.fillRect(0,0,512,96);g.fillStyle='#f0b429';g.fillRect(0,0,512,8);g.fillStyle='#e8ecea';g.font='600 54px "Barlow Condensed",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(name.toUpperCase().slice(0,22),256,54,480);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
function hallenGeo(fl){const p=[],u=[],ix=[];for(const q of fl){const b=p.length/3;for(let i=0;i<4;i++){p.push(q[i*5],q[i*5+1],q[i*5+2]);u.push(q[i*5+3],q[i*5+4])}ix.push(b,b+1,b+2,b,b+2,b+3)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ix);g.computeVertexNormals();return g}
function halleModell(x){const gr=new T.Group(),X0=x.x0,X1=x.x1+1,Z0=x.y0,Z1=x.y1+1,w=X1-X0,d=Z1-Z0;let l0=9,l1=0,mh=3;
 for(let y=x.y0;y<=x.y1;y++)for(let i=x.x0;i<=x.x1;i++){const l=Lv(i,y);if(l<l0)l0=l;if(l>l1)l1=l;const e=at(i,y);if(e)mh=Math.max(mh,(MHOEHE[e.k]||2)+.7)}
 const y0=YL(l0)-.05,y1=YL(l1)+Math.min(6.5,mh),laengs=w>=d,halb=(laengs?d:w)/2,first=Math.min(1.6,halb*.22),ue=.25,s=.5;
 // Wände: vier Seiten, an den Giebelseiten bis zum First hochgezogen
 const wand=[[X0,y0,Z1,0,0, X1,y0,Z1,w*s,0, X1,y1,Z1,w*s,(y1-y0)*s, X0,y1,Z1,0,(y1-y0)*s],[X1,y0,Z0,0,0, X0,y0,Z0,w*s,0, X0,y1,Z0,w*s,(y1-y0)*s, X1,y1,Z0,0,(y1-y0)*s],
  [X1,y0,Z1,0,0, X1,y0,Z0,d*s,0, X1,y1,Z0,d*s,(y1-y0)*s, X1,y1,Z1,0,(y1-y0)*s],[X0,y0,Z0,0,0, X0,y0,Z1,d*s,0, X0,y1,Z1,d*s,(y1-y0)*s, X0,y1,Z0,0,(y1-y0)*s]];
 const yf=y1+first,gs=first*s;
 if(laengs){const zm=(Z0+Z1)/2;wand.push([X1,y1,Z1,0,0, X1,y1,Z0,d*s,0, X1,yf,zm,d*s/2,gs, X1,yf,zm,d*s/2,gs],[X0,y1,Z0,0,0, X0,y1,Z1,d*s,0, X0,yf,zm,d*s/2,gs, X0,yf,zm,d*s/2,gs])}
 else{const xm=(X0+X1)/2;wand.push([X0,y1,Z1,0,0, X1,y1,Z1,w*s,0, xm,yf,Z1,w*s/2,gs, xm,yf,Z1,w*s/2,gs],[X1,y1,Z0,0,0, X0,y1,Z0,w*s,0, xm,yf,Z0,w*s/2,gs, xm,yf,Z0,w*s/2,gs])}
 const mw=new T.Mesh(hallenGeo(wand),HAL.wand);mw.castShadow=mw.receiveShadow=true;gr.add(mw);
 // Dach: zwei geneigte Flächen mit Überstand
 const sl=Math.hypot(halb,first),ys=y1-first*ue/halb;let dach;
 if(laengs){const zm=(Z0+Z1)/2,a=X0-ue,b=X1+ue,L=(b-a)*s;dach=[[a,ys,Z1+ue,0,0, b,ys,Z1+ue,L,0, b,yf,zm,L,sl*s, a,yf,zm,0,sl*s],[b,ys,Z0-ue,0,0, a,ys,Z0-ue,L,0, a,yf,zm,L,sl*s, b,yf,zm,0,sl*s]]}
 else{const xm=(X0+X1)/2,a=Z0-ue,b=Z1+ue,L=(b-a)*s;dach=[[X1+ue,ys,b,0,0, X1+ue,ys,a,L,0, xm,yf,a,L,sl*s, xm,yf,b,0,sl*s],[X0-ue,ys,a,0,0, X0-ue,ys,b,L,0, xm,yf,b,L,sl*s, xm,yf,a,0,sl*s]]}
 const md=new T.Mesh(hallenGeo(dach),HAL.dach);md.castShadow=md.receiveShadow=true;gr.add(md);
 // Sockel, Lichtband am First, Dachlüfter
 const box=(bx,by,bz,px,py,pz,mat)=>{const m=new T.Mesh(new T.BoxGeometry(bx,by,bz),mat);m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;gr.add(m);return m};
 box(w+.12,.45,d+.12,(X0+X1)/2,y0+.22,(Z0+Z1)/2,M('Beton'));
 const lang=laengs?w:d;box(laengs?lang*.8:.4,.1,laengs?.4:lang*.8,(X0+X1)/2,yf+.02,(Z0+Z1)/2,M('Beton_Hell'));
 for(let i=0,n=Math.max(1,Math.floor(lang/7));i<n;i++){const q=(i+.5)/n*lang,px=laengs?X0+q:(X0+X1)/2+halb*.5,pz=laengs?(Z0+Z1)/2+halb*.5:Z0+q;box(.7,.5,.7,px,y1+first*.5+.2,pz,M('Blech_Dunkel'))}
 // Tore an jedem Band und Rohr, das die Wand kreuzt
 for(const t of hallenTore(x)){const q=t.r%2===0,b=t.rohr?.5:.96,h=t.rohr?.5:1.05,yy=t.y+(t.rohr?.42:h/2);box(q?.34:b,h,q?b:.34,t.x,yy,t.z,HAL.tor);box(q?.4:b+.2,.1,q?b+.2:.4,t.x,yy+h/2+.05,t.z,HAL.rahmen);for(const v of[-1,1])box(q?.4:.1,h,q?.1:.4,t.x+(q?0:v*(b/2+.05)),yy,t.z+(q?v*(b/2+.05):0),HAL.rahmen)}
 // Namensschild an der längeren Außenwand
 const sm=new T.Mesh(new T.PlaneGeometry(Math.min(5,lang*.6),Math.min(5,lang*.6)*.1875),new T.MeshStandardMaterial({map:hallenSchild(x.name),roughness:.6}));
 if(laengs)sm.position.set((X0+X1)/2,y1-.75,Z1+.03);else{sm.position.set(X1+.03,y1-.75,(Z0+Z1)/2);sm.rotation.y=Math.PI/2}gr.add(sm);return gr}
function hallenModelle(){HAL.neu=false;for(const g of HAL.gr.children.slice()){HAL.gr.remove(g);g.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(o.material.map&&o.material.map.isCanvasTexture){o.material.map.dispose();o.material.dispose()}}})}for(const x of hallen())HAL.gr.add(halleModell(x))}
EV.an('liste',hallenFeld);EV.an('bild',()=>{if(HAL.neu)hallenModelle()});
/* --- Fenster --- */
document.head.insertAdjacentHTML('beforeend','<style>#halle{position:fixed;right:14px;bottom:110px;width:300px;padding:11px 13px;display:grid;gap:7px;z-index:6}#halle h3{margin:0;font-size:22px}#halle .chips{display:flex;flex-wrap:wrap;gap:4px 10px;font:13px var(--mono)}@media (max-width:700px){#halle{right:8px;bottom:76px;width:240px}}</style>');
document.body.insertAdjacentHTML('beforeend','<div id="halle" class="tafel" hidden></div>');
function halleZeigen(id){const x=hallen().find(q=>q.id===id),el=$('halle');HAL.offen=x?id:0;el.hidden=!x;if(!x)return;select(null);const q=kennz(kxM(x)),chips=r=>{const l=Object.entries(r).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]);return l.length?l.map(([k,n])=>`<span title="${ITEMS[k][0]}">${ic(k,18)} ${n}</span>`).join(''):'<span class="matt">noch nichts gemessen</span>'};
 el.innerHTML=`<h3>${x.name}</h3><div class="matt">Produktionshalle · ${x.x1-x.x0+1} × ${x.y1-x.y0+1} Felder · ${q.n} Maschinen</div>
 <div class="etikett">Eingang je Minute</div><div class="chips">${chips(hallenRate(id,'ein'))}</div><div class="etikett">Ausgang je Minute</div><div class="chips">${chips(hallenRate(id,'aus'))}</div>
 <div class="matt">OEE ${pc(q.oee)} · Zustand ${pc(q.hp)} · Störungen ${q.df}${q.off?` · ${q.off} aus`:''}</div>
 <div class="reihe"><button id="h-auf">Halle öffnen</button><button id="h-schalt">${q.off&&q.off===q.n?'Einschalten':'Ausschalten'}</button><button id="h-zu">Schließen</button></div>`;
 $('h-auf').onclick=()=>halleOeffnen(x);$('h-zu').onclick=()=>halleZeigen(0);$('h-schalt').onclick=()=>{const l=kxM(x),o=!l.every(e=>e.off);l.forEach(e=>e.off=o);halleZeigen(id)}}
setInterval(()=>{if(HAL.offen&&!$('halle').matches(':hover'))halleZeigen(HAL.offen)},1000);
$('lw').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const d=b.dataset;if(d.h){const x=(G.kx||[]).find(q=>q.id===+d.h);if(!x)return;if(x.halle)halleOeffnen(x);else if(halleBauen(x)){C.tx=(x.x0+x.x1)/2;C.tz=(x.y0+x.y1)/2;lwOpen(false);return}lwLive()}else if(d.d)hallenFeld()});
