/* ====== Schau-Fabrik: ein laufendes Werk bis zur Rakete, zum Ansehen und Weiterbauen ======
   Ein Ringband läuft einmal um die Zentrale, an zwei Maschinenreihen vorbei und wieder in die Zentrale.
   Greifarme legen Material aus dem Lager aufs Band, jede Maschine greift sich ihre Zutaten und legt ihr Erzeugnis zurück.
   Flüssigkeiten laufen in einem Rohr-Rundlauf zwischen den beiden Reihen. Rohstoffe und einfache Teile kommen per Drohne von den Vorkommen. */
function schauFabrik(){const Z=byKind.zentrale[0],zx=Z.x,zy=Z.y,zc=[zx+3,zy+3],yT=zy-2,yB=zy+9,m1=zy+3,m2=zy+4,c0=zx+9;let gebaut=0;
 const OBEN=['batterie','akkupack','logikmodul','prozessor','computer','sensor','raketensteuerung','rotor','lager','aluminium','aluminium','turbine','zement','betonteil','verbundplatte','hitzeschild','rahmen','triebwerk','sprengstoff'],
  UNTEN=['stahl','blech','schaltkreis','kabel','saeure','rotor','stator','motor','lager','getriebe','antrieb'],
  FEST=['eisenplatte','kohle','kupferplatte','draht','stahl','stahlblech','schaltkreis','kunststoff','kabel','schwefel','stein','gummi','glas','bauxit','schraube','eisenstange','rohr','zahnrad'],
  NASS=['schwefelsaeure','treibstoff','schmierstoff'],nT=OBEN.length,cr=c0+5*nT,xe=cr+4;
 for(const e of[...E.values()])if(e.k!=='zentrale')del(e);
 /* 0. Baufeld einebnen */
 const box=[zx-8,zy-24,xe+6,zy+19],inBox=(x,y)=>x>=box[0]&&x<=box[2]&&y>=box[1]&&y<=box[3],cv=new Set(G.carve||[]);
 for(let y=Math.max(1,box[1]);y<=Math.min(N-2,box[3]);y++)for(let x=Math.max(1,box[0]);x<=Math.min(N-2,box[2]);x++){cv.add(y*N+x);AMT[y*N+x]=0}
 G.carve=[...cv];genTer(G.carve);patchTotals();
 const P=(k,x,y,r,opt)=>{if(!place(k,x,y,r,true))return null;const e=at(x,y);if(!e||e.k!==k)return null;delete e.bau;delete e.bau0;if(e.inv)e.st='wait';if(opt)Object.assign(e,opt);gebaut++;return e};
 // Legt eine Strecke; wo schon ein Band liegt, entsteht eine Kreuzung
 const bahn=(k,pts)=>{for(let i=0;i+1<pts.length;i++){const[a,b]=pts[i],[c,d]=pts[i+1],dx=Math.sign(c-a),dy=Math.sign(d-b),r=dx>0?0:dy>0?1:dx<0?2:3;let x=a,y=b;while(x!==c||y!==d){if(isBelt(at(x,y)))P('kreuzung',x,y,0);else P(k,x,y,r);x+=dx;y+=dy}}};
 const bau=rez=>{const b=REZ[rez].b;return b==='ofen'?'elektroofen':b},nass=rez=>Object.keys(REZ[rez].in).some(k=>FL.has(k));
 /* 1. Ringband: um die Zentrale, obere Reihe nach Osten, untere Reihe zurück, von Süden in die Zentrale */
 bahn('expressband',[[zx+7,zy+5],[zx+7,zy+7],[zx-2,zy+7],[zx-2,zy-2],[xe,yT],[xe,yB],[zx+5,yB],[zx+5,zy+5]]);
 const platz=[];for(let i=0;i<6;i++)platz.push([zx+i,zy-1,3]);for(let i=0;i<6;i++)platz.push([zx-1,zy+i,2]);for(let i=0;i<5;i++)platz.push([zx+i,zy+6,1]);platz.push([zx+6,zy+5,0]);
 // Takt je Stoff: was viele Maschinen brauchen, wird öfter aufgelegt
 const TAKT={kabel:1,draht:2,schraube:2,kohle:2,stein:2,bauxit:2,eisenplatte:2,schaltkreis:2,kupferplatte:8,glas:8,stahl:8,stahlblech:8,eisenstange:8};
 FEST.forEach((k,j)=>P('greifer',platz[j][0],platz[j][1],platz[j][2],{f:k,gt:TAKT[k]||4}));
 /* 2. Rakete: letzte Maschine der oberen Reihe, greift von Norden und Osten; die Teile laufen in das Silo südlich des Werks */
 P('praezision',cr,yT+2,2,{rez:'raketenteil'});['rahmen','triebwerk','raketensteuerung'].forEach((k,j)=>P('greifer',cr+j,yT+1,1,{f:k}));['akkupack','sprengstoff','rahmen'].forEach((k,j)=>P('greifer',cr+3,yT+2+j,2,{f:k}));
 P('raketensilo',cr-3,yB+2,0);bahn('expressband',[[cr-1,yT+3],[cr-1,yB+2]]);
 /* 3. Maschinenreihen */
 const zelle=(oben,i,rez)=>{const c=c0+5*i,ein=Object.keys(REZ[rez].in).filter(k=>!FL.has(k));P(bau(rez),c,oben?yT+2:yB-4,0,{rez});ein.forEach((k,j)=>P('greifer',c+j,oben?yT+1:yB-1,oben?1:3,{f:k}));
  if(FL.has(REZ[rez].out[0]))P('versand',c+3,oben?yT+2:yB-3,0,{tier:2});else for(let j=0;j<3;j++)P('expressband',c+3,oben?yT+3-j:yB-3+j,oben?3:1);P('mast',c+4,oben?yT+2:yB-3,0)};
 OBEN.forEach((r,i)=>zelle(true,i,r));UNTEN.forEach((r,k)=>zelle(false,nT-2-k,r));
 /* 4. Rohr-Rundlauf: aus der Zentrale an der oberen Reihe entlang und zurück */
 const sp=OBEN.map((r,i)=>nass(r)?i:-1).filter(i=>i>=0),xp=c0+5*Math.max(...sp)+3;
 bahn('leitung',[[zx+7,zy],[zx+7,m1],[xp,m1],[xp,m2],[zx+5,m2]]);NASS.forEach((k,j)=>P('greifer',zx+6,zy+j,0,{f:k,gt:2}));for(const i of sp)P('verteiler',c0+5*i+1,m1,0,{zu:{r:true}});
 /* 5. Solarfeld und Straße */
 P('mast',zx+8,zy-5,0);for(let b=0;b<2;b++){const ym=zy-9-8*b;for(let i=0;i<14;i++){P('solar',zx+10+3*i,ym-3,0);P('solar',zx+10+3*i,ym+1,0)}for(let j=0;j<8;j++)P('mast',zx+10+6*j,ym,0)}
 bahn('strasse',[[zx-5,zy+18],[xe+3,zy+18],[xe+3,zy-5]]);
 /* 6. Vorwerke an den Vorkommen: Bohrer oder Pumpe, Verarbeitung und Versandstation direkt hintereinander, eigene Solarparks */
 const weg=l=>{for(const e of l)if(e){del(e);gebaut--}},frei3=(x,y)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++)if(at(x+i,y+j)||(ORE[(y+j)*N+x+i]&&AMT[(y+j)*N+x+i]))return false;return canPlace('solar',x,y)};
 const strom=(px,py)=>{for(let r=3;r<=11;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=px+i,y=py+j;if(x<2||y<2||x>N-6||y>N-6||inBox(x,y)||!frei3(x,y))continue;
   for(const[a,b]of[[x+3,y+1],[x-1,y+1],[x+1,y+3],[x+1,y-1]])if(!at(a,b)&&canPlace('mast',a,b)){const s=P('solar',x,y,0);if(!s)continue;const m=P('mast',a,b,0);if(m)return[s,m];weg([s])}}return null};
 const vorwerk=(t,stufen,x,y)=>{const oel=t===7,b=P(oel?'oelpumpe':'bohrer',x,y,0);if(!b)return false;oreInfo(b);if(b.ore!==t||b.oreN<3){weg([b]);return false}
  const l=[b];let cx=x+2,mw=oel?6:2,ok=true;for(const rez of stufen){const k=oel?'raffinerie':REZ[rez].b,e=P(k,cx,y,0,{rez});if(!e){ok=false;break}l.push(e);cx+=K[k].s;mw+=K[k].p}
  const v=ok&&P('versand',cx,y,0,{tier:2});if(v){l.push(v);mw+=6;const m=[[x+1,y+2],[x+1,y-1],[cx-1,y+3],[cx-1,y-1]].find(([a,c])=>!at(a,c)&&canPlace('mast',a,c)),ma=m&&P('mast',m[0],m[1],0);if(ma){l.push(ma);for(let i=0;i<Math.ceil(mw/10);i++){const s=strom(x+2,y);if(!s){ok=false;break}l.push(...s)}}else ok=false}else ok=false;
  if(!ok)weg(l);return ok};
 const abbau=(t,stufen,soll)=>{const l=PATCHES.filter(p=>p[0]===t&&!inBox(p[1],p[2])).sort((a,b)=>Math.hypot(a[1]-zc[0],a[2]-zc[1])-Math.hypot(b[1]-zc[0],b[2]-zc[1])).slice(0,5),st=t===7?1:2;let n=0;
  for(const[,cx,cy,r]of l)for(let y=Math.floor(cy-r-2);y<=cy+r&&n<soll;y+=st+1)for(let x=Math.floor(cx-r-2);x<=cx+r&&n<soll;x+=st)if(vorwerk(t,stufen,x,y)){n++;x+=6+3*stufen.length}return n};
 const erz=abbau(1,['platte'],8)+abbau(1,['platte','zahnrad'],2)+abbau(1,['platte','stange'],2)+abbau(1,['platte','stange','schraube'],2)+abbau(1,['platte','rohr'],2)+abbau(2,['kupfer'],3)+abbau(2,['kupfer','draht'],4)
  +abbau(4,[],4)+abbau(3,[],3)+abbau(5,['glas'],3)+abbau(6,[],4)+abbau(8,[],4)+abbau(7,['kunststoff'],3)+abbau(7,['gummi'],3)+abbau(7,['treibstoff'],2)+abbau(7,['schmierstoff'],2);
 /* 7. Komplexe, Halle, Lager */
 relist();const cu=i=>c0+5*(nT-2-i);G.kx=[{id:1,name:'Antriebsbau',x0:cu(10),y0:yB-4,x1:cu(5)+4,y1:yB-1},{id:2,name:'Elektronik',x0:c0+10,y0:yT+1,x1:c0+34,y1:yT+4},{id:3,name:'Raumfahrt',x0:c0+55,y0:yT+1,x1:cr+3,y1:yT+4}];G.kxN=3;
 if(!hallePruefen(G.kx[0]))G.kx[0].halle=true;
 for(const k in ITEMS)if(k!=='rakete'&&k!=='ausschuss'&&k!=='raketenteil')G.stock[k]=Math.max(G.stock[k]||0,1500);G.cr=Math.max(G.cr||0,50000);G.arb=Math.max(G.arb||0,12);G.help=true;G.tut=-1;
 relist();power();weltAufbauen(false);C.tx=C.x=zx+40;C.tz=C.z=zc[1]+2;C.tyaw=C.yaw=.5;C.tdist=C.dist=80;
 toast(`Schau-Fabrik steht: ${nT+UNTEN.length+1} Maschinen am Ringband, ${erz} Vorwerke an den Vorkommen, Raketensilo. Bau einfach weiter.`);return{gebaut,erz}}
