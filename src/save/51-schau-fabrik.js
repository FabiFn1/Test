/* ====== Schau-Fabrik: ein laufendes Werk bis zur Rakete, zum Ansehen und Weiterbauen ======
   Hauptbus: Aus der Zentrale laufen sortenreine Bänder und Rohre mit den Grundstoffen nach Osten.
   Jede Maschine zapft ihre Zutaten mit einem Verteiler ab (Vorrang für den Abzweig, der Rest läuft weiter); das Abzweigband kreuzt die übrigen Bänder über Brücken.
   Zwischenprodukte bekommen ein eigenes Band vom Hersteller bis zum letzten Abnehmer. Volle Bänder stauen sich,
   dadurch läuft jede Maschine nur so schnell, wie ihr Erzeugnis gebraucht wird. Grundstoffe kommen per Drohne von den Vorkommen. */
function schauFabrik(){const Z=byKind.zentrale[0],zx=Z.x,zy=Z.y,zc=[zx+3,zy+3];let gebaut=0;
 const NORD=['eisenplatte','kupferplatte','kohle','stein','bauxit','schwefel'],OST=['eisenplatte#2','glas','kunststoff','gummi','treibstoff','schmierstoff'],SUED=['eisenplatte#3','kohle#2'],stoff=k=>k.split('#')[0],
  REIHE=['stahl','stahl','blech','aluminium','aluminium','verbundplatte','verbundplatte','rahmen','stange','schraube','rotor','lager','turbine','zement','betonteil','hitzeschild','triebwerk',
   'draht','schaltkreis','kabel','kabel','logikmodul','logikmodul','saeure','prozessor','computer','sensor','raketensteuerung','batterie','akkupack','sprengstoff','raketenteil'];
 for(const e of[...E.values()])if(e.k!=='zentrale')del(e);
 /* 1. Plan: Maschinenplätze, Bänder je Stoff, Zeilen im Bus */
 const bahnen={},M=[];let cx=zx+12;
 for(const rez of REIHE){const r=REZ[rez],ein=Object.keys(r.in).sort((a,b)=>FL.has(b)-FL.has(a)),gross=ein.length>3,c=cx+(gross?2:0);M.push({rez,c,ein,aus:r.out[0],gross});cx+=gross?9:5}
 for(const k of[...NORD,...OST,...SUED])bahnen[k]={start:null,zapf:[]};
 for(const m of M){if(m.rez!=='raketenteil'){const b=bahnen[m.aus]=bahnen[m.aus]||{start:m.c+3,zapf:[],her:[]};b.her.push(m)}}
 // Gibt es für einen Stoff zwei Bänder, zapft jede Maschine das weniger belastete an
 const wahl=k=>Object.keys(bahnen).filter(q=>stoff(q)===k).sort((a,b)=>bahnen[a].zapf.length-bahnen[b].zapf.length)[0];
 for(const m of M)m.ein.forEach((k,j)=>bahnen[wahl(k)].zapf.push({x:j<3?m.c+j:j===3?m.c-2:m.c+4,seite:j>=3}));
 NORD.forEach((k,i)=>{bahnen[k].y=zy-7+i});OST.forEach((k,i)=>{bahnen[k].y=zy+i});SUED.forEach((k,i)=>{bahnen[k].y=zy+7+i});const y0=zy+7+SUED.length;
 const zeilen=[];for(const k in bahnen){const b=bahnen[k];b.zapf.sort((p,q)=>p.x-q.x);if(b.start===null||!b.zapf.length)continue;const ende=b.zapf[b.zapf.length-1].x;let z=zeilen.findIndex(e=>e<b.start-1);if(z<0){z=zeilen.length;zeilen.push(0)}zeilen[z]=ende;b.y=y0+z}
 const my=y0+zeilen.length+1,xe=cx+4;
 /* 2. Baufeld einebnen */
 const box=[zx-8,zy-12,xe+6,my+34],inBox=(x,y)=>x>=box[0]&&x<=box[2]&&y>=box[1]&&y<=box[3],cv=new Set(G.carve||[]);
 for(let y=Math.max(1,box[1]);y<=Math.min(N-2,box[3]);y++)for(let x=Math.max(1,box[0]);x<=Math.min(N-2,box[2]);x++){cv.add(y*N+x);AMT[y*N+x]=0}
 G.carve=[...cv];genTer(G.carve);patchTotals();
 const P=(k,x,y,r,opt)=>{if(!place(k,x,y,r,true))return null;const e=at(x,y);if(!e||e.k!==k)return null;delete e.bau;delete e.bau0;if(e.inv)e.st='wait';if(opt)Object.assign(e,opt);gebaut++;return e};
 // Legt eine Strecke; wo schon ein Band oder Rohr liegt, entsteht eine Brücke
 const bahn=(k,pts)=>{for(let i=0;i+1<pts.length;i++){const[a,b]=pts[i],[c,d]=pts[i+1],dx=Math.sign(c-a),dy=Math.sign(d-b),r=dx>0?0:dy>0?1:dx<0?2:3;let x=a,y=b;while(x!==c||y!==d){if(isBelt(at(x,y)))P('kreuzung',x,y,0);else P(k,x,y,r);x+=dx;y+=dy}}};
 const art=k=>FL.has(stoff(k))?'leitung':'expressband',bau=rez=>{const b=REZ[rez].b;return b==='ofen'?'elektroofen':b},tief=z=>z.seite?my+2:my;
 /* 3. Maschinen, Rakete mit Silo, Entnahme aus der Zentrale */
 for(const m of M){P(bau(m.rez),m.c,my,1,{rez:m.rez});P('mast',m.c+(m.gross?6:4),my+1,0);P('mast',m.c+(m.gross?6:4),my+6,0);
  if(m.gross){P('raketensilo',m.c-1,my+3,0);P('greifer',m.c-1,my+1,0);P('greifer',m.c+3,my+1,2)}}
 NORD.forEach((k,i)=>P('greifer',zx+i,zy-1,3,{f:stoff(k)}));OST.forEach((k,i)=>P('greifer',zx+6,zy+i,0,{f:stoff(k)}));SUED.forEach((k,i)=>P('greifer',zx+5-i,zy+6,1,{f:stoff(k)}));
 /* 4. Bus: erst alle Bänder bis zum letzten Abnehmer, dann Abzweige und Zuführungen der Hersteller */
 for(const k in bahnen){const b=bahnen[k],l=b.zapf[b.zapf.length-1];if(!l)continue;const i=NORD.indexOf(k),j=SUED.indexOf(k),anf=i>=0?[[zx+i,zy-2],[zx+i,b.y]]:j>=0?[[zx+5-j,zy+7],[zx+5-j,b.y]]:b.start===null?[[zx+7,b.y]]:[[b.start,b.y]];bahn(art(k),[...anf,[l.x,b.y],[l.x,tief(l)]])}
 for(const k in bahnen){const b=bahnen[k];for(const z of b.zapf.slice(0,-1)){bahn(art(k),[[z.x,b.y+1],[z.x,tief(z)]]);P('verteiler',z.x,b.y,0,{zu:{l:true},prio:'r'})}
  for(const m of b.her||[])bahn(art(k),[[m.c+1,my+3],[m.c+3,my+3],[m.c+3,b.y]])}
 /* 5. Solarfeld und Straße */
 for(let b=0;b<2;b++){const ym=my+13+8*b;for(let i=0;i<16;i++){P('solar',zx+12+3*i,ym-3,0);P('solar',zx+12+3*i,ym+1,0)}for(let j=0;j<9;j++)P('mast',zx+12+6*j,ym,0)}
 bahn('strasse',[[zx-5,my+31],[xe+3,my+31],[xe+3,zy-10]]);
 /* 6. Vorwerke an den Vorkommen: Bohrer oder Pumpe, Verarbeitung und Versandstation direkt hintereinander, eigene Solarparks */
 const weg=l=>{for(const e of l)if(e){del(e);gebaut--}},frei3=(x,y)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++)if(at(x+i,y+j)||(ORE[(y+j)*N+x+i]&&AMT[(y+j)*N+x+i]))return false;return canPlace('solar',x,y)};
 const strom=(px,py)=>{for(let r=3;r<=11;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=px+i,y=py+j;if(x<2||y<2||x>N-6||y>N-6||inBox(x,y)||!frei3(x,y))continue;
   for(const[a,b]of[[x+3,y+1],[x-1,y+1],[x+1,y+3],[x+1,y-1]])if(!at(a,b)&&canPlace('mast',a,b)){const s=P('solar',x,y,0);if(!s)continue;const m=P('mast',a,b,0);if(m)return[s,m];weg([s])}}return null};
 const vorwerk=(t,stufen,x,y)=>{const oel=t===7,b=P(oel?'oelpumpe':'bohrer',x,y,0);if(!b)return false;oreInfo(b);if(b.ore!==t||b.oreN<3){weg([b]);return false}
  const l=[b];let px=x+2,mw=oel?6:2,ok=true;for(const rez of stufen){const k=oel?'raffinerie':REZ[rez].b,e=P(k,px,y,0,{rez});if(!e){ok=false;break}l.push(e);px+=K[k].s;mw+=K[k].p}
  const v=ok&&P('versand',px,y,0,{tier:2});if(v){l.push(v);mw+=6;const m=[[x+1,y+2],[x+1,y-1],[px-1,y+3],[px-1,y-1]].find(([a,c])=>!at(a,c)&&canPlace('mast',a,c)),ma=m&&P('mast',m[0],m[1],0);if(ma){l.push(ma);for(let i=0;i<Math.ceil(mw/10);i++){const s=strom(x+2,y);if(!s){ok=false;break}l.push(...s)}}else ok=false}else ok=false;
  if(!ok)weg(l);return ok};
 const abbau=(t,stufen,soll)=>{const l=PATCHES.filter(p=>p[0]===t&&!inBox(p[1],p[2])).sort((a,b)=>Math.hypot(a[1]-zc[0],a[2]-zc[1])-Math.hypot(b[1]-zc[0],b[2]-zc[1])).slice(0,5),st=t===7?1:2;let n=0;
  for(const[,px,py,r]of l)for(let y=Math.floor(py-r-2);y<=py+r&&n<soll;y+=st+1)for(let x=Math.floor(px-r-2);x<=px+r&&n<soll;x+=st)if(vorwerk(t,stufen,x,y)){n++;x+=6+3*stufen.length}return n};
 const erz=abbau(1,['platte'],14)+abbau(2,['kupfer'],5)+abbau(4,[],7)+abbau(3,[],4)+abbau(5,['glas'],3)+abbau(6,[],4)+abbau(8,[],4)+abbau(7,['kunststoff'],3)+abbau(7,['gummi'],3)+abbau(7,['treibstoff'],3)+abbau(7,['schmierstoff'],2);
 /* 7. Komplexe und Lager */
 relist();const feld=(n,a,b)=>({id:0,name:n,x0:M[a].c,y0:my,x1:M[b].c+2,y1:my+2});G.kx=[feld('Leichtbau',0,7),feld('Triebwerksbau',8,16),feld('Elektronik',17,27),feld('Endmontage',28,31)];G.kx.forEach((x,i)=>x.id=i+1);G.kxN=G.kx.length;
 for(const k in ITEMS)if(k!=='rakete'&&k!=='ausschuss'&&k!=='raketenteil')G.stock[k]=Math.max(G.stock[k]||0,1500);G.cr=Math.max(G.cr||0,50000);G.arb=Math.max(G.arb||0,12);G.help=true;G.tut=-1;
 relist();power();weltAufbauen(false);C.tx=C.x=zx+45;C.tz=C.z=zy+12;C.tyaw=C.yaw=.5;C.tdist=C.dist=85;
 toast(`Schau-Fabrik steht: Hauptbus mit ${NORD.length+OST.length+SUED.length} Bändern und Rohren, ${M.length} Maschinen, ${erz} Vorwerke an den Vorkommen, Raketensilo. Bau einfach weiter.`);return{gebaut,erz,my}}
