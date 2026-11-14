/* ====== Schau-Fabrik: ein laufendes Beispielwerk zum Ansehen und Weiterbauen ====== */
function schauFabrik(){const Z=byKind.zentrale[0],zx=Z.x,zy=Z.y,zc=[zx+3,zy+3];let gebaut=0;
 const setz=(k,x,y,r,opt)=>{if(!place(k,x,y,r,true))return null;const e=at(x,y);if(!e||e.k!==k)return null;delete e.bau;delete e.bau0;e.st='wait';if(opt)Object.assign(e,opt);gebaut++;return e};
 const weg=l=>{for(const e of l)if(e){del(e);gebaut--}};
 const frei3=(x,y,s)=>{for(let j=0;j<s;j++)for(let i=0;i<s;i++)if(at(x+i,y+j)||ORE[(y+j)*N+x+i])return false;return canPlace(s===3?'solar':'mast',x,y)};
 // Solarpark mit Mast in der Nähe eines Punkts
 const strom=(px,py,r0,r1)=>{for(let r=r0;r<=r1;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;const x=px+i,y=py+j;if(x<2||y<2||x>N-6||y>N-6||!frei3(x,y,3))continue;
   for(const[a,b]of[[x+3,y+1],[x-1,y+1],[x+1,y+3],[x+1,y-1]])if(!at(a,b)&&canPlace('mast',a,b)){const s=setz('solar',x,y,0);if(!s)continue;if(setz('mast',a,b,0))return s;weg([s])}}return null};
 /* 1. Rohstoffe: Bohrer, Ofen und Versandstation direkt hintereinander auf den nächsten Vorkommen */
 const einheit=(t,rez,x,y)=>{const b=setz('bohrer',x,y,0);if(!b)return false;oreInfo(b);if(b.ore!==t||b.oreN<3){weg([b]);return false}
  const o=rez?setz('ofen',x+2,y,0,{rez}):b,v=o&&setz('versand',x+(rez?4:2),y,0);if(!v){weg(rez?[b,o]:[b]);return false}
  const m=[[x+1,y+2],[x+1,y-1],[x+3,y+2],[x+3,y-1]].map(([a,c])=>!at(a,c)&&canPlace('mast',a,c)?[a,c]:null).find(q=>q),ma=m&&setz('mast',m[0],m[1],0),s=ma&&strom(x+2,y,3,9);
  if(!s){weg([b,rez?o:null,v,ma]);return false}return true};
 const abbau=(t,rez,soll)=>{const l=PATCHES.filter(p=>p[0]===t).sort((a,b)=>Math.hypot(a[1]-zc[0],a[2]-zc[1])-Math.hypot(b[1]-zc[0],b[2]-zc[1])).slice(0,3);let n=0;
  for(const[,cx,cy,r]of l)for(let y=Math.floor(cy-r-2);y<=cy+r&&n<soll;y+=3)for(let x=Math.floor(cx-r-2);x<=cx+r&&n<soll;x+=2)if(einheit(t,rez,x,y)){n++;x+=8}return n};
 const erz={eisen:abbau(1,'platte',10),kupfer:abbau(2,'kupfer',5),ziegel:abbau(3,'ziegel',2),kohle:abbau(4,null,2)};
 /* 2. Teilefertigung rund um die Zentrale: Greifarme holen Material aus dem Lager, Drohnen bringen die Teile zurück */
 const zelle=(seite,j,rez)=>{const ein=Object.keys(REZ[rez].in),f=i=>ein[Math.min(i,ein.length-1)];let m,v;
  if(seite==='n'){const x=zx+3*j;m=setz('fertiger',x,zy-4,3,{rez});v=setz('versand',x,zy-6,3);for(let i=0;i<3;i++)setz('greifer',x+i,zy-1,3,{f:f(i)})}
  else if(seite==='s'){const x=zx+3*j;m=setz('fertiger',x,zy+7,1,{rez});v=setz('versand',x,zy+10,1);for(let i=0;i<3;i++)setz('greifer',x+i,zy+6,1,{f:f(i)})}
  else{const y=zy+3*j;m=setz('fertiger',zx+7,y,0,{rez});v=setz('versand',zx+10,y,0);for(let i=0;i<3;i++)setz('greifer',zx+6,y+i,0,{f:f(i)})}return m&&v};
 zelle('n',0,'zahnrad');zelle('n',1,'stange');zelle('s',0,'draht');zelle('s',1,'schaltkreis');zelle('o',0,'rohr');zelle('o',1,'f1');
 for(let i=0;i<7;i++)strom(zc[0],zc[1],9,16);
 /* 3. Halle, Komplex, Straßen */
 G.kx=[{id:1,name:'Teilefertigung',x0:zx,y0:zy-6,x1:zx+5,y1:zy-2,halle:true},{id:2,name:'Elektrik',x0:zx,y0:zy+6,x1:zx+5,y1:zy+11}];G.kxN=2;
 const R=14;for(let i=-R;i<=R;i++)for(const[x,y]of[[zc[0]+i,zc[1]-R],[zc[0]+i,zc[1]+R],[zc[0]-R,zc[1]+i],[zc[0]+R,zc[1]+i]])if(!at(x,y)&&!ORE[y*N+x])setz('strasse',x,y,0);
 for(let i=7;i<R;i++)if(!at(zc[0]-i,zc[1]+5))setz('strasse',zc[0]-i,zc[1]+5,0);
 Object.assign(G.stock,{eisenplatte:Math.max(G.stock.eisenplatte||0,3000),kupferplatte:Math.max(G.stock.kupferplatte||0,3000),stein:2000});G.cr=Math.max(G.cr||0,20000);G.help=true;G.tut=-1;
 relist();power();weltAufbauen(false,true);C.tx=C.x=zc[0];C.tz=C.z=zc[1];C.tdist=C.dist=58;
 toast(`Schau-Fabrik steht: ${erz.eisen+erz.kupfer+erz.ziegel+erz.kohle} Förderanlagen, 6 Fertiger, eine Produktionshalle. Bau einfach weiter.`);return{gebaut,erz}}
