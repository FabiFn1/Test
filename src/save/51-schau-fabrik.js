/* ====== Schau-Fabrik: ein Endgame-Werk bis zur Rakete, zum Ansehen und Weiterbauen ======
   Vier Werke, jedes mit eigenem Hauptbus: Am Buskopf liefern Versandstationen die Grundstoffe aus der Zentrale an,
   von dort laufen sortenreine Bänder und Rohre nach Osten. Jede Maschine zapft ihre Zutaten mit einem Verteiler ab;
   das Abzweigband kreuzt die übrigen Bänder über Brücken. Zwischenprodukte bekommen ein eigenes Band vom Hersteller bis
   zum letzten Abnehmer. Fertige Teile gehen per Versandstation in die Zentrale und von dort ins nächste Werk.
   Die Maschinenzahlen folgen dem Mengenverhältnis für drei Raketen-Maschinen. Rohstoffe kommen von Vorwerken an den Vorkommen. */
// mal: so oft wird jedes der vier Werke gebaut. schnell: Maschinen auf Tier 3 und doppelt übertaktet (3,2-faches Tempo, 6,8-facher Strom)
function schauFabrik(mal,schnell){mal=mal||1;const tempo=schnell?3.2:1,kraft=schnell?6.8:1,stufe=schnell?{tier:2,oc:2}:{},stoff=k=>k.split('#')[0];const Z=byKind.zentrale[0],zx=Z.x,zy=Z.y,zc=[zx+3,zy+3];let gebaut=0;
 const n=(k,z)=>Array(z).fill(k),el=['draht','draht','schaltkreis','kabel','draht','kabel','schaltkreis',...n('logikmodul',3)];
 // basis: Stoff -> Bedarf in Teilen je Sekunde (daraus die Zahl der Lieferstationen, je nach Flugweite); aus: was das Werk in die Zentrale abgibt
 const WERKE=[
  {name:'Leichtbau',basis:{eisenplatte:9.4,kohle:4.6,bauxit:13.7,kunststoff:1.5,stein:1.8},aus:['stahl','stahlblech','aluminium','rahmen','hitzeschild'],
   reihe:[...n('stahl',5),'blech',...n('aluminium',5),...n('verbundplatte',4),...n('stahl',4),'blech',...n('aluminium',4),...n('verbundplatte',3),'rahmen','rahmen','zement','betonteil','hitzeschild']},
  {name:'Elektronik',basis:{kupferplatte:15,eisenplatte:2.3,gummi:5.4,kunststoff:2.3,schwefel:4.2,glas:.7,stahlblech:.2},aus:['raketensteuerung','akkupack','draht','schaltkreis','logikmodul','sensor'],
   reihe:[...el,...el,'draht','draht','schaltkreis','kabel','draht','kabel','schaltkreis','kabel',...n('logikmodul',2),'saeure','saeure',...n('prozessor',3),...n('sensor',3),'computer','raketensteuerung','raketensteuerung',...n('batterie',4),'akkupack','akkupack']},
  {name:'Triebwerksbau',basis:{eisenplatte:2,stahl:.7,aluminium:.6,treibstoff:.75,hitzeschild:.08},aus:['triebwerk','rotor','kugellager'],
   reihe:['stange','schraube','schraube','rotor','rotor','lager','lager',...n('turbine',3),...n('triebwerk',3)]},
  {name:'Endmontage',basis:{schwefel:.3,kohle:.3,schmierstoff:.15,rahmen:.3,raketensteuerung:.08,triebwerk:.08,akkupack:.15,eisenplatte:.7,draht:.9,rotor:.1,kugellager:.1,stahlblech:.1,schaltkreis:.2,logikmodul:.1,sensor:.1},aus:['roboter'],silo:true,
   reihe:['sprengstoff',...n('raketenteil',3),'rohr','zahnrad','stator','motor','getriebe','antrieb','roboterarm','roboter']}];
 for(const e of[...E.values()])if(e.k!=='zentrale')del(e);
 const bau=rez=>{const b=REZ[rez].b;return b==='ofen'?'elektroofen':b==='fertiger'?'montagewerk':b},art=k=>FL.has(stoff(k))?'leitung':'expressband',voll=k=>k==='raketenteil'?null:stoff(k);
 /* 1. Plan je Werk: Lieferstationen, Maschinenplätze, Bänder je Stoff, Zeilen im Bus */
 // A: Spiegelachse für Werke westlich der Zentrale (Planposition x liegt real bei A-x, die Lieferstationen also auf der Seite zur Zentrale)
 const plane=(w,x0,y0,A=null)=>{const flug=Math.hypot((A===null?x0:A-x0)-zc[0],y0+12-zc[1])/14+2,bahnen={},M=[],B=[];
  // Je Grundstoff so viele Bänder, dass keines über 20 Teile/s tragen muss, und so viele Lieferstationen, wie Bedarf und Flugweite verlangen
  for(const k in w.basis){const rate=w.basis[k]*tempo,nl=Math.max(1,Math.ceil(rate/20)),ns=Math.max(1,Math.ceil(rate*flug/30*1.2/nl));for(let j=0;j<nl;j++)B.push({key:j?k+'#'+(j+1):k,k,ns})}
  const nb=B.length,sum=B.reduce((a,b)=>a+b.ns,0);let cx=x0+2*sum+3,mw=0;
  B.forEach((b,i)=>{let xi=x0;for(let j=i+1;j<nb;j++)xi+=2*B[j].ns;bahnen[b.key]={basis:true,xi,k:b.ns,y:y0+3+i,zapf:[]}});
  const wahl=k=>Object.keys(bahnen).filter(q=>stoff(q)===k).sort((a,b)=>bahnen[a].zapf.length-bahnen[b].zapf.length)[0];
  for(const rez of w.reihe){const r=REZ[rez],ein=Object.keys(r.in).sort((a,b)=>FL.has(b)-FL.has(a)),gross=ein.length>3,c=cx+(gross?2:0),m={rez,c,ein,aus:r.out[0],rc:c+(gross?6:3),gross};M.push(m);cx+=gross?10:5;mw+=K[bau(rez)].p*kraft;
   const b=bahnen[m.aus]=bahnen[m.aus]||{start:m.rc,zapf:[],her:[]};if(b.basis)throw new Error(w.name+': '+m.aus+' ist Grundstoff und Erzeugnis');b.her.push(m)}
  for(const m of M)m.ein.forEach((k,j)=>{const q=wahl(k);if(!q)throw new Error(w.name+': '+k+' fehlt für '+m.rez);bahnen[q].zapf.push({x:j<3?m.c+j:j===3?m.c-2:m.c+4,seite:j>=3})});
  // Abgabe: Versandstation am Ende der Reihe, das Raketensilo ganz am Schluss
  const ab=[];for(const k of w.aus){if(!bahnen[k])throw new Error(w.name+': '+k+' wird nicht hergestellt');bahnen[k].zapf.push({x:cx});ab.push({k:'versand',x:cx});cx+=3;mw+=6}
  if(w.silo){bahnen.raketenteil.zapf.push({x:cx+2});ab.push({k:'raketensilo',x:cx});cx+=6;mw+=20}
  const zeilen=[];for(const k in bahnen){const b=bahnen[k];b.zapf.sort((p,q)=>p.x-q.x);if(b.basis||!b.zapf.length)continue;const ende=b.zapf[b.zapf.length-1].x;let z=zeilen.findIndex(e=>e<b.start-1);if(z<0){z=zeilen.length;zeilen.push(0)}zeilen[z]=ende;b.y=y0+3+nb+z}
  const my=y0+3+nb+zeilen.length+1,xm=x0+2*sum+3,proReihe=Math.max(1,Math.floor((cx-xm)/3)),sol=Math.ceil(mw/10)+2,sr=Math.ceil(sol/proReihe),ksol=Math.ceil(sum*.6)+1,kpro=Math.max(1,Math.floor((2*sum+2)/3)),ksr=Math.ceil(ksol/kpro);
  const box=[x0-3,y0-6-4*ksr,cx+4,my+8+sr*4+3];return{w,x0,y0,A,B,sum,bahnen,M,ab,my,xm,xe:cx,sol,proReihe,sr,ksol,kpro,ksr,kopf:5+4*ksr,unten:my+8+sr*4+1,box,rb:A===null?box:[A-box[2],box[1],A-box[0],box[3]]}};
 const ALLE=[];for(let i=0;i<mal;i++)for(const w of WERKE)ALLE.push({...w,name:w.name+(mal>1?' '+(i+1):'')});
 // Die Werke stehen untereinander östlich der Zentrale; reicht die Höhe der Karte nicht, kommt eine zweite Spalte im Westen dazu
 // Werke auf zwei Spalten verteilen: Osten ab der Zentrale, Westen bis zur Zentrale, jede Spalte um die Zentrale herum zentriert (kurze Drohnenflüge).
 const PL=[],mass=w=>{const p=plane(w,zx+16,zy);return{w,breit:p.box[2]-p.box[0]+2,hoch:p.unten-p.y0+p.kopf+14}},
  spalten=[{links:zx+16,rechts:N-10,l:[],h:0},{links:10,rechts:zx-14,l:[],h:0}];
 // Je Werk die niedrigere passende Spalte; in der Spalte stehen die breitesten Werke in der Mitte, nahe der Zentrale (je weiter weg, desto mehr Lieferstationen)
 for(const m of ALLE.map(mass).sort((a,b)=>b.breit-a.breit)){const sp=spalten.filter(c=>m.breit+40<=c.rechts-c.links&&c.h+m.hoch<=N-28).sort((a,b)=>a.h-b.h)[0];if(!sp)throw new Error('Kein Platz mehr für '+m.w.name);sp.l.push(m);sp.h+=m.hoch}
 for(const sp of spalten){const d=[];sp.l.forEach((m,i)=>i%2?d.push(m):d.unshift(m));sp.l=d}
 for(const sp of spalten){let y=Math.max(14,Math.min(N-14-sp.h,zy+3-Math.round(sp.h/2)));const ost=sp===spalten[0],x0=ost?sp.links:100,A=ost?null:sp.rechts+x0-3;
  for(const m of sp.l){const p0=plane(m.w,x0,y+12,A),p=plane(m.w,x0,y+p0.kopf+3,A);if(p.rb[0]<2||p.rb[2]>N-4)throw new Error(m.w.name+' passt nicht auf die Karte');PL.push(p);y=p.unten+12}}
 const inBox=(x,y)=>PL.some(p=>x>=p.rb[0]&&x<=p.rb[2]&&y>=p.rb[1]&&y<=p.rb[3]);
 /* 2. Baufelder einebnen */
 const cv=new Set(G.carve||[]);for(const p of PL)for(let y=Math.max(1,p.rb[1]);y<=Math.min(N-2,p.rb[3]);y++)for(let x=Math.max(1,p.rb[0]);x<=Math.min(N-2,p.rb[2]);x++){cv.add(y*N+x);AMT[y*N+x]=0}
 G.carve=[...cv];genTer(G.carve);patchTotals();
 // Setzt ein Bauwerk ohne den Umweg über das Bauwerkzeug: Bei Tausenden Teilen wäre das Neuaufbauen der Listen nach jedem Stück zu langsam
 // Mit gesetzter Spiegelachse (spg) wird x gespiegelt und Ost/West getauscht. Eine Lieferstation rückt dabei ein Feld weiter, damit ihr Ausgang wieder über dem Zubringer liegt.
 let spg=null;const spX=(k,x,opt)=>spg===null?x:spg-x-(K[k].s-1)-(k==='versand'&&opt&&opt.f?1:0),spR=r=>spg===null||r%2?r:(r+2)%4;
 const P=(k,x,y,r,opt)=>{x=spX(k,x,opt);r=spR(r);if(k==='verteiler'&&spg!==null&&opt&&opt.zu)opt={...opt,zu:{r:opt.zu.l,l:opt.zu.r,g:opt.zu.g}};if(!canPlace(k,x,y))return null;const ex=at(x,y);if(ex){if(!isBelt(ex))return null;del(ex)}const e=add(k,x,y,r,opt||{});if(e.inv)e.st='wait';gebaut++;return e};
 // Legt eine Strecke; wo schon ein Band oder Rohr liegt, entsteht eine Brücke. Mit `voll` liegt der Stoff schon auf dem Band, damit das Werk nicht erst lange einschwingen muss
 const bahn=(k,pts,voll)=>{for(let i=0;i+1<pts.length;i++){const[a,b]=pts[i],[c,d]=pts[i+1],dx=Math.sign(c-a),dy=Math.sign(d-b),r=dx>0?0:dy>0?1:dx<0?2:3;let x=a,y=b;while(x!==c||y!==d){const rx=spg===null?x:spg-x;if(isBelt(at(rx,y)))P('kreuzung',x,y,0);else{const e=P(k,x,y,r);if(e&&voll)e.it=[.875,.625,.375,.125].map(t=>({t,k:voll}))}x+=dx;y+=dy}}};
 /* 3. Werke bauen */
 for(const p of PL){const{y0,my,bahnen,M}=p,tief=z=>z.seite?my+2:my;spg=p.A;
  for(const m of M){P(bau(m.rez),m.c,my,1,{rez:m.rez,...stufe});P('mast',m.rc+1,my+1,0);P('mast',m.rc+1,my+5,0);if(m.gross){P('greifer',m.c-1,my+1,0);P('greifer',m.c+3,my+1,2)}}
  for(const a of p.ab){P(a.k,a.x,my,1,a.k==='versand'?{tier:2}:{auto:true});P('mast',a.x+(a.k==='versand'?2:5),my+1,0)}
  // Buskopf: Lieferstationen, darüber ihre Solarparks
  for(const q of p.B){const b=bahnen[q.key];for(let j=0;j<b.k;j++)P('versand',b.xi+2*j,y0,1,{f:q.k,tier:2})}
  {let z=0;for(let r=0;r<p.ksr;r++){for(let i=0;i<p.kpro&&z<p.ksol;i++,z++)P('solar',p.x0+3*i,y0-5-4*r,0);for(let x=p.x0+1;x<p.x0+2*p.sum+2;x+=5)P('mast',x,y0-2-4*r,0)}}
  // Bänder bis zum letzten Abnehmer, dann Abzweige, Zuführungen der Hersteller und der weiteren Lieferstationen
  for(const k in bahnen){const b=bahnen[k],l=b.zapf[b.zapf.length-1];if(!l)continue;bahn(art(k),[...(b.basis?[[b.xi+1,y0+2],[b.xi+1,b.y]]:[[b.start,b.y]]),[l.x,b.y],[l.x,tief(l)]],voll(k))}
  for(const k in bahnen){const b=bahnen[k];for(const z of b.zapf.slice(0,-1)){bahn(art(k),[[z.x,b.y+1],[z.x,tief(z)]],voll(k));P('verteiler',z.x,b.y,0,{zu:{l:true}})}
   for(const m of b.her||[])bahn(art(k),[[m.c+1,my+3],[m.rc,my+3],[m.rc,b.y]],voll(k));
   if(b.basis)for(let j=1;j<b.k;j++)bahn(art(k),[[b.xi+2*j+1,y0+2],[b.xi+2*j+1,b.y]],voll(k))}
  // Solarfeld unter dem Werk
  let s=0;for(let r=0;r<p.sr;r++){const y=my+8+r*4;for(let i=0;i<p.proReihe&&s<p.sol;i++,s++)P('solar',p.xm+3*i,y,0);for(let x=p.xm+1;x<p.xe;x+=6)P('mast',x,y+3,0)}
  bahn('strasse',[[p.x0-2,p.unten+3],[p.xe+3,p.unten+3]])}
 spg=null;
 /* 4. Vorwerke an den Vorkommen: Bohrer oder Pumpe, Verarbeitung und Versandstation direkt hintereinander, eigene Solarparks */
 const weg=l=>{for(const e of l)if(e){del(e);gebaut--}},frei3=(x,y)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++)if(at(x+i,y+j)||(ORE[(y+j)*N+x+i]&&AMT[(y+j)*N+x+i]))return false;return canPlace('solar',x,y)};
 const strom=(px,py)=>{for(let r=3;r<=12;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=px+i,y=py+j;if(x<2||y<2||x>N-6||y>N-6||inBox(x,y)||!frei3(x,y))continue;
   for(const[a,b]of[[x+3,y+1],[x-1,y+1],[x+1,y+3],[x+1,y-1]])if(!at(a,b)&&canPlace('mast',a,b)){const s=P('solar',x,y,0);if(!s)continue;const m=P('mast',a,b,0);if(m)return[s,m];weg([s])}}return null};
 const vorwerk=(t,stufen,x,y)=>{const oel=t===7,b=P(oel?'oelpumpe':'schnellbohrer',x,y,0);if(!b)return false;oreInfo(b);if(b.ore!==t||b.oreN<3){weg([b]);return false}
  const l=[b];let px=x+2,mw=oel?6:5,ok=true;for(const rez of stufen){const k=oel?'raffinerie':bau(rez),e=P(k,px,y,0,{rez});if(!e){ok=false;break}l.push(e);px+=K[k].s;mw+=K[k].p}
  const v=ok&&P('versand',px,y,0,{tier:2});if(v){l.push(v);mw+=6;const m=[[x+1,y+2],[x+1,y-1],[px-1,y+3],[px-1,y-1],[px+1,y+2]].find(([a,c])=>!at(a,c)&&canPlace('mast',a,c)),ma=m&&P('mast',m[0],m[1],0);if(ma){l.push(ma);for(let i=0;i<Math.ceil(mw/10);i++){const s=strom(x+2,y);if(!s){ok=false;break}l.push(...s)}}else ok=false}else ok=false;
  if(!ok)weg(l);return ok};
 const abbau=(t,stufen,soll)=>{const l=PATCHES.filter(p=>p[0]===t&&!inBox(p[1],p[2])).sort((a,b)=>Math.hypot(a[1]-zc[0],a[2]-zc[1])-Math.hypot(b[1]-zc[0],b[2]-zc[1])).slice(0,14*mal),st=t===7?1:2;let z=0;
  for(const[,px,py,r]of l)for(let y=Math.floor(py-r-2);y<=py+r&&z<soll;y+=st+1)for(let x=Math.floor(px-r-2);x<=px+r&&z<soll;x+=st)if(vorwerk(t,stufen,x,y)){z++;x+=6+3*stufen.length}return z};
 const vw={eisen:abbau(1,['platte'],32*mal),kupfer:abbau(2,['kupfer'],20*mal),bauxit:abbau(6,[],9*mal),kohle:abbau(4,[],5*mal),schwefel:abbau(8,[],3*mal),stein:abbau(3,[],2*mal),glas:abbau(5,['glas'],mal),kunststoff:abbau(7,['kunststoff'],12*mal),gummi:abbau(7,['gummi'],16*mal),treibstoff:abbau(7,['treibstoff'],3*mal),schmierstoff:abbau(7,['schmierstoff'],mal)};
 const erz=Object.values(vw).reduce((a,b)=>a+b,0);
 /* 5. Komplexe und Lager */
 relist();G.kx=PL.map((p,i)=>({id:i+1,name:p.w.name,x0:p.A===null?p.xm:p.A-p.xe,y0:p.my,x1:p.A===null?p.xe:p.A-p.xm,y1:p.my+2}));G.kxN=G.kx.length;
 const grund=new Set(['eisenplatte','kupferplatte','kohle','stein','bauxit','schwefel','glas','kunststoff','gummi','treibstoff','schmierstoff']);
 for(const k in ITEMS)if(k!=='rakete'&&k!=='ausschuss'&&k!=='raketenteil')G.stock[k]=Math.max(G.stock[k]||0,grund.has(k)?(schnell?4e6:20000*mal):(schnell?20000:3000*mal));G.cr=Math.max(G.cr||0,50000);G.arb=Math.max(G.arb||0,20);G.help=true;G.tut=-1;
 const anz=PL.reduce((a,p)=>a+p.M.length,0);relist();power();weltAufbauen(false);C.tx=C.x=PL[0].xm+40;C.tz=C.z=PL[0].my-6;C.tyaw=C.yaw=.5;C.tdist=C.dist=90;
 toast(`Schau-Fabrik steht: ${PL.length} Werke mit ${anz} Maschinen, ${erz} Vorwerke an den Vorkommen, Raketensilo. Bau einfach weiter.`);return{gebaut,erz,vw,anz}}
