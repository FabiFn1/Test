/* ====== Schau-Fabrik: ein Endgame-Werk bis zur Rakete, zum Ansehen und Weiterbauen ======
   Vier Werke, jedes mit eigenem Hauptbus: Am Buskopf liefern Versandstationen die Grundstoffe aus der Zentrale an,
   von dort laufen sortenreine Bänder und Rohre nach Osten. Jede Maschine zapft ihre Zutaten mit einem Verteiler ab;
   das Abzweigband kreuzt die übrigen Bänder über Brücken. Zwischenprodukte bekommen ein eigenes Band vom Hersteller bis
   zum letzten Abnehmer. Fertige Teile gehen per Versandstation in die Zentrale und von dort ins nächste Werk.
   Die Maschinenzahlen folgen dem Mengenverhältnis für drei Raketen-Maschinen. Rohstoffe kommen von Vorwerken an den Vorkommen. */
function schauFabrik(){const Z=byKind.zentrale[0],zx=Z.x,zy=Z.y,zc=[zx+3,zy+3];let gebaut=0;
 const n=(k,z)=>Array(z).fill(k),el=[...n('draht',3),...n('schaltkreis',2),...n('kabel',2),...n('logikmodul',3)];
 // basis: Stoff -> Zahl der Lieferstationen; aus: was das Werk in die Zentrale abgibt
 const WERKE=[
  {name:'Leichtbau',basis:{eisenplatte:3,kohle:2,bauxit:4,kunststoff:1,stein:1},aus:['stahl','stahlblech','aluminium','rahmen','hitzeschild'],
   reihe:[...n('stahl',5),'blech',...n('aluminium',5),...n('verbundplatte',4),...n('stahl',4),'blech',...n('aluminium',4),...n('verbundplatte',3),'rahmen','rahmen','zement','betonteil','hitzeschild']},
  {name:'Elektronik',basis:{kupferplatte:4,eisenplatte:1,gummi:2,kunststoff:1,schwefel:2,glas:1,stahlblech:1},aus:['raketensteuerung','akkupack','draht','schaltkreis','logikmodul','sensor'],
   reihe:[...el,...el,...n('draht',3),...n('schaltkreis',2),...n('kabel',3),...n('logikmodul',2),'saeure','saeure',...n('prozessor',3),...n('sensor',3),'computer','raketensteuerung','raketensteuerung',...n('batterie',4),'akkupack','akkupack']},
  {name:'Triebwerksbau',basis:{eisenplatte:1,stahl:1,aluminium:1,treibstoff:1,hitzeschild:1},aus:['triebwerk','rotor','kugellager'],
   reihe:['stange','schraube','schraube','rotor','rotor','lager','lager',...n('turbine',3),...n('triebwerk',3)]},
  {name:'Endmontage',basis:{schwefel:1,kohle:1,schmierstoff:1,rahmen:1,raketensteuerung:1,triebwerk:1,akkupack:1,eisenplatte:1,draht:1,rotor:1,kugellager:1,stahlblech:1,schaltkreis:1,logikmodul:1,sensor:1},aus:['roboter'],silo:true,
   reihe:['sprengstoff',...n('raketenteil',3),'rohr','zahnrad','stator','motor','getriebe','antrieb','roboterarm','roboter']}];
 for(const e of[...E.values()])if(e.k!=='zentrale')del(e);
 const bau=rez=>{const b=REZ[rez].b;return b==='ofen'?'elektroofen':b==='fertiger'?'montagewerk':b},art=k=>FL.has(k)?'leitung':'expressband',voll=k=>k==='raketenteil'?null:k;
 /* 1. Plan je Werk: Lieferstationen, Maschinenplätze, Bänder je Stoff, Zeilen im Bus */
 const plane=(w,x0,y0)=>{const B=Object.keys(w.basis),nb=B.length,sum=B.reduce((a,k)=>a+w.basis[k],0),bahnen={},M=[];let cx=x0+2*sum+3,mw=0;
  B.forEach((k,i)=>{let xi=x0;for(let j=i+1;j<nb;j++)xi+=2*w.basis[B[j]];bahnen[k]={basis:true,xi,k:w.basis[k],y:y0+3+i,zapf:[]}});
  for(const rez of w.reihe){const r=REZ[rez],ein=Object.keys(r.in).sort((a,b)=>FL.has(b)-FL.has(a)),gross=ein.length>3,c=cx+(gross?2:0),m={rez,c,ein,aus:r.out[0],rc:c+(gross?6:3),gross};M.push(m);cx+=gross?10:5;mw+=K[bau(rez)].p;
   const b=bahnen[m.aus]=bahnen[m.aus]||{start:m.rc,zapf:[],her:[]};if(b.basis)throw new Error(w.name+': '+m.aus+' ist Grundstoff und Erzeugnis');b.her.push(m)}
  for(const m of M)m.ein.forEach((k,j)=>{if(!bahnen[k])throw new Error(w.name+': '+k+' fehlt für '+m.rez);bahnen[k].zapf.push({x:j<3?m.c+j:j===3?m.c-2:m.c+4,seite:j>=3})});
  // Abgabe: Versandstation am Ende der Reihe, das Raketensilo ganz am Schluss
  const ab=[];for(const k of w.aus){if(!bahnen[k])throw new Error(w.name+': '+k+' wird nicht hergestellt');bahnen[k].zapf.push({x:cx});ab.push({k:'versand',x:cx});cx+=3;mw+=6}
  if(w.silo){bahnen.raketenteil.zapf.push({x:cx+2});ab.push({k:'raketensilo',x:cx});cx+=6;mw+=20}
  const zeilen=[];for(const k in bahnen){const b=bahnen[k];b.zapf.sort((p,q)=>p.x-q.x);if(b.basis||!b.zapf.length)continue;const ende=b.zapf[b.zapf.length-1].x;let z=zeilen.findIndex(e=>e<b.start-1);if(z<0){z=zeilen.length;zeilen.push(0)}zeilen[z]=ende;b.y=y0+3+nb+z}
  const my=y0+3+nb+zeilen.length+1,xm=x0+2*sum+3,proReihe=Math.max(1,Math.floor((cx-xm)/3)),sol=Math.ceil(mw/10)+2,sr=Math.ceil(sol/proReihe);
  return{w,x0,y0,B,sum,bahnen,M,ab,my,xm,xe:cx,sol,proReihe,sr,unten:my+8+sr*4+1,box:[x0-3,y0-8,cx+4,my+8+sr*4+3]}};
 let hoch=0;for(const w of WERKE)hoch+=plane(w,0,0).unten+12;let yc=Math.max(16,Math.min(N-16-hoch,zy+3-Math.round(hoch/2)));
 const PL=WERKE.map(w=>{const p=plane(w,zx+16,yc+8);yc=p.unten+12;return p}),inBox=(x,y)=>PL.some(p=>x>=p.box[0]&&x<=p.box[2]&&y>=p.box[1]&&y<=p.box[3]);
 /* 2. Baufelder einebnen */
 const cv=new Set(G.carve||[]);for(const p of PL)for(let y=Math.max(1,p.box[1]);y<=Math.min(N-2,p.box[3]);y++)for(let x=Math.max(1,p.box[0]);x<=Math.min(N-2,p.box[2]);x++){cv.add(y*N+x);AMT[y*N+x]=0}
 G.carve=[...cv];genTer(G.carve);patchTotals();
 // Setzt ein Bauwerk ohne den Umweg über das Bauwerkzeug: Bei Tausenden Teilen wäre das Neuaufbauen der Listen nach jedem Stück zu langsam
 const P=(k,x,y,r,opt)=>{if(!canPlace(k,x,y))return null;const ex=at(x,y);if(ex){if(!isBelt(ex))return null;del(ex)}const e=add(k,x,y,r,opt||{});if(e.inv)e.st='wait';gebaut++;return e};
 // Legt eine Strecke; wo schon ein Band oder Rohr liegt, entsteht eine Brücke. Mit `voll` liegt der Stoff schon auf dem Band, damit das Werk nicht erst lange einschwingen muss
 const bahn=(k,pts,voll)=>{for(let i=0;i+1<pts.length;i++){const[a,b]=pts[i],[c,d]=pts[i+1],dx=Math.sign(c-a),dy=Math.sign(d-b),r=dx>0?0:dy>0?1:dx<0?2:3;let x=a,y=b;while(x!==c||y!==d){if(isBelt(at(x,y)))P('kreuzung',x,y,0);else{const e=P(k,x,y,r);if(e&&voll)e.it=[.875,.625,.375,.125].map(t=>({t,k:voll}))}x+=dx;y+=dy}}};
 /* 3. Werke bauen */
 for(const p of PL){const{y0,my,bahnen,M}=p,tief=z=>z.seite?my+2:my;
  for(const m of M){P(bau(m.rez),m.c,my,1,{rez:m.rez});P('mast',m.rc+1,my+1,0);P('mast',m.rc+1,my+5,0);if(m.gross){P('greifer',m.c-1,my+1,0);P('greifer',m.c+3,my+1,2)}}
  for(const a of p.ab){P(a.k,a.x,my,1,a.k==='versand'?{tier:2}:null);P('mast',a.x+(a.k==='versand'?2:5),my+1,0)}
  // Buskopf: Lieferstationen, darüber ihre Solarparks
  for(const k of p.B){const b=bahnen[k];for(let j=0;j<b.k;j++)P('versand',b.xi+2*j,y0,1,{f:k,tier:2})}
  for(let x=p.x0;x<p.x0+2*p.sum+2;x+=3){P('solar',x,y0-5,0);P('mast',x+1,y0-1,0)}
  // Bänder bis zum letzten Abnehmer, dann Abzweige, Zuführungen der Hersteller und der weiteren Lieferstationen
  for(const k in bahnen){const b=bahnen[k],l=b.zapf[b.zapf.length-1];if(!l)continue;bahn(art(k),[...(b.basis?[[b.xi+1,y0+2],[b.xi+1,b.y]]:[[b.start,b.y]]),[l.x,b.y],[l.x,tief(l)]],voll(k))}
  for(const k in bahnen){const b=bahnen[k];for(const z of b.zapf.slice(0,-1)){bahn(art(k),[[z.x,b.y+1],[z.x,tief(z)]],voll(k));P('verteiler',z.x,b.y,0,{zu:{l:true}})}
   for(const m of b.her||[])bahn(art(k),[[m.c+1,my+3],[m.rc,my+3],[m.rc,b.y]],voll(k));
   if(b.basis)for(let j=1;j<b.k;j++)bahn(art(k),[[b.xi+2*j+1,y0+2],[b.xi+2*j+1,b.y]],k)}
  // Solarfeld unter dem Werk
  let s=0;for(let r=0;r<p.sr;r++){const y=my+8+r*4;for(let i=0;i<p.proReihe&&s<p.sol;i++,s++)P('solar',p.xm+3*i,y,0);for(let x=p.xm+1;x<p.xe;x+=6)P('mast',x,y+3,0)}
  bahn('strasse',[[p.x0-2,p.unten+3],[p.xe+3,p.unten+3]])}
 /* 4. Vorwerke an den Vorkommen: Bohrer oder Pumpe, Verarbeitung und Versandstation direkt hintereinander, eigene Solarparks */
 const weg=l=>{for(const e of l)if(e){del(e);gebaut--}},frei3=(x,y)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++)if(at(x+i,y+j)||(ORE[(y+j)*N+x+i]&&AMT[(y+j)*N+x+i]))return false;return canPlace('solar',x,y)};
 const strom=(px,py)=>{for(let r=3;r<=12;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=px+i,y=py+j;if(x<2||y<2||x>N-6||y>N-6||inBox(x,y)||!frei3(x,y))continue;
   for(const[a,b]of[[x+3,y+1],[x-1,y+1],[x+1,y+3],[x+1,y-1]])if(!at(a,b)&&canPlace('mast',a,b)){const s=P('solar',x,y,0);if(!s)continue;const m=P('mast',a,b,0);if(m)return[s,m];weg([s])}}return null};
 const vorwerk=(t,stufen,x,y)=>{const oel=t===7,b=P(oel?'oelpumpe':'schnellbohrer',x,y,0);if(!b)return false;oreInfo(b);if(b.ore!==t||b.oreN<3){weg([b]);return false}
  const l=[b];let px=x+2,mw=oel?6:5,ok=true;for(const rez of stufen){const k=oel?'raffinerie':bau(rez),e=P(k,px,y,0,{rez});if(!e){ok=false;break}l.push(e);px+=K[k].s;mw+=K[k].p}
  const v=ok&&P('versand',px,y,0,{tier:2});if(v){l.push(v);mw+=6;const m=[[x+1,y+2],[x+1,y-1],[px-1,y+3],[px-1,y-1],[px+1,y+2]].find(([a,c])=>!at(a,c)&&canPlace('mast',a,c)),ma=m&&P('mast',m[0],m[1],0);if(ma){l.push(ma);for(let i=0;i<Math.ceil(mw/10);i++){const s=strom(x+2,y);if(!s){ok=false;break}l.push(...s)}}else ok=false}else ok=false;
  if(!ok)weg(l);return ok};
 const abbau=(t,stufen,soll)=>{const l=PATCHES.filter(p=>p[0]===t&&!inBox(p[1],p[2])).sort((a,b)=>Math.hypot(a[1]-zc[0],a[2]-zc[1])-Math.hypot(b[1]-zc[0],b[2]-zc[1])).slice(0,14),st=t===7?1:2;let z=0;
  for(const[,px,py,r]of l)for(let y=Math.floor(py-r-2);y<=py+r&&z<soll;y+=st+1)for(let x=Math.floor(px-r-2);x<=px+r&&z<soll;x+=st)if(vorwerk(t,stufen,x,y)){z++;x+=6+3*stufen.length}return z};
 const vw={eisen:abbau(1,['platte'],13),kupfer:abbau(2,['kupfer'],11),bauxit:abbau(6,[],9),kohle:abbau(4,[],5),schwefel:abbau(8,[],3),stein:abbau(3,[],2),glas:abbau(5,['glas'],1),kunststoff:abbau(7,['kunststoff'],12),gummi:abbau(7,['gummi'],16),treibstoff:abbau(7,['treibstoff'],3),schmierstoff:abbau(7,['schmierstoff'],1)};
 const erz=Object.values(vw).reduce((a,b)=>a+b,0);
 /* 5. Komplexe und Lager */
 relist();G.kx=PL.map((p,i)=>({id:i+1,name:p.w.name,x0:p.xm,y0:p.my,x1:p.xe,y1:p.my+2}));G.kxN=G.kx.length;
 const grund=new Set(['eisenplatte','kupferplatte','kohle','stein','bauxit','schwefel','glas','kunststoff','gummi','treibstoff','schmierstoff']);
 for(const k in ITEMS)if(k!=='rakete'&&k!=='ausschuss'&&k!=='raketenteil')G.stock[k]=Math.max(G.stock[k]||0,grund.has(k)?20000:3000);G.cr=Math.max(G.cr||0,50000);G.arb=Math.max(G.arb||0,20);G.help=true;G.tut=-1;
 const anz=PL.reduce((a,p)=>a+p.M.length,0);relist();power();weltAufbauen(false);C.tx=C.x=PL[0].xm+40;C.tz=C.z=PL[0].my-6;C.tyaw=C.yaw=.5;C.tdist=C.dist=90;
 toast(`Schau-Fabrik steht: ${PL.length} Werke mit ${anz} Maschinen, ${erz} Vorwerke an den Vorkommen, Raketensilo. Bau einfach weiter.`);return{gebaut,erz,vw,anz}}
