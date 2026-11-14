/* ====== Zustand ====== */
const UI={toast(){},msDraw(){},toolsDraw(){},ende(){},wires(){},removed(){}};const rate={};

let G,nextId=1;const E=new Map();let grid=new Int32Array(N*N);let belts=[],machines=[],splits=[],nodes=[],gens=[];
let dirtyB=true,dirtyK=true,dirtyP=true,byKind={};
function fresh(){G=SW.neuerSpielstand(START_STOCK,window.NEUOPT);weltNeu();AMT.set(AMT0);patchTotals();E.clear();grid.fill(0);nextId=1;F.fill(0);genTer();
 const o=OX;add('zentrale',45+o,45+o,0);add('bohrer',37+o,47+o,0);add('band',39+o,47+o,0);add('band',40+o,47+o,0);add('ofen',41+o,47+o,0);add('band',43+o,47+o,0);add('band',44+o,47+o,0);add('mast',40+o,45+o,0);add('mast',36+o,45+o,0);relist()}
function ents(k){return[...E.values()].filter(e=>e.k===k)}
function foot(k,x,y){const s=K[k].s,r=[];for(let j=0;j<s;j++)for(let i=0;i<s;i++)r.push([x+i,y+j]);return r}
function add(k,x,y,r,extra){const e={id:nextId++,k,x,y,r,...extra};if(e.z===undefined)e.z=Lv(x,y);if(BK(k)){e.it=e.it||[];e.cv=0}else if(k==='verteiler'||k==='sortierer'){e.buf=e.buf||[];e.nx=e.nx||0}else if(k==='greifer'||k==='langgreifer'){e.t=0}else if(k==='kreuzung'){e.sl=e.sl&&Array.isArray(e.sl[0])?e.sl:[[],[]]}else if(K[k].s>1&&k!=='zentrale'){e.inv=e.inv||{};e.out=e.out||[];e.prog=e.prog||0;e.st='wait';e.sat=0;e.burn=e.burn||0}
 for(const[a,b]of foot(k,x,y))grid[b*N+a]=e.id;E.set(e.id,e);dirtyB=dirtyK=dirtyP=true;if(k==='bohrer'||k==='schnellbohrer'||k==='oelpumpe')oreInfo(e);return e}
function del(e){for(const[a,b]of foot(e.k,e.x,e.y))grid[b*N+a]=0;E.delete(e.id);dirtyB=dirtyK=dirtyP=true;UI.removed(e)}
function relist(){belts=[];machines=[];splits=[];nodes=[];gens=[];byKind={};for(const e of E.values()){const k=e.k;(byKind[k]=byKind[k]||[]).push(e);if(BK(k))belts.push(e);else if(k==='verteiler'||k==='kreuzung'||k==='sortierer'||k==='greifer'||k==='langgreifer')splits.push(e);else if(k==='mast'||k==='grossmast'||k==='zentrale')nodes.push(e);if(e.inv)machines.push(e)}shapes();wire();EV.melde('liste')}
function at(x,y){return x<0||y<0||x>=N||y>=N?null:E.get(grid[y*N+x])||null}
function isBelt(e){return e&&(BK(e.k))}
function outTile(e){const s=K[e.k].s,m=(s-1)>>1,{x,y,r}=e;return r===0?[x+s,y+m,0]:r===1?[x+s-1-m,y+s,1]:r===2?[x-1,y+s-1-m,2]:[x+m,y-1,3]}
function feeds(e,x,y,d){ // speist e das Feld x,y in Richtung d?
 if(!e)return false;if(isBelt(e))return e.r===d&&e.x+DX[d]===x&&e.y+DY[d]===y;if(e.k==='verteiler'||e.k==='kreuzung'||e.k==='sortierer')return true;if(e.out&&!K[e.k].gen){const o=outTile(e);return o[0]===x&&o[1]===y&&o[2]===d}return false}
function shapes(){for(const b of belts){const d=b.r,back=(d+2)%4;const lf=Lv(b.x+DX[d],b.y+DY[d]),lb=Lv(b.x+DX[back],b.y+DY[back]);b.sl=lf===b.z+1?1:lb===b.z+1?-1:0;if(b.sl){b.cv=0;continue}const bk=feeds(at(b.x+DX[back],b.y+DY[back]),b.x,b.y,d);const l=(d+1)%4,rr=(d+3)%4;const fl=feeds(at(b.x+DX[l],b.y+DY[l]),b.x,b.y,(l+2)%4),fr=feeds(at(b.x+DX[rr],b.y+DY[rr]),b.x,b.y,(rr+2)%4);b.cv=bk?0:(fl&&!fr?1:fr&&!fl?-1:0)}}
/* Bohrer */
function erzFeld(k,x,y){if(k==='oelpumpe')return foot(k,x,y);const s=K[k].s,r=[];for(let j=-1;j<=s;j++)for(let i=-1;i<=s;i++){const a=x+i,b=y+j;if(a>=0&&b>=0&&a<N&&b<N)r.push([a,b])}return r}
function oreInfo(e){const pump=e.k==='oelpumpe',c={};let pu=0;for(const[a,b]of erzFeld(e.k,e.x,e.y)){const o=ORE[b*N+a];if(o&&AMT[b*N+a]>0&&(o===7)===pump&&!F[b*N+a]){c[o]=(c[o]||0)+1;pu+=PUR[b*N+a]}}let best=0,n=0;for(const o in c)if(c[o]>n){n=c[o];best=+o}e.ore=best;e.oreN=pump&&n?4:Math.min(4,n);e.pur=n?(pu/(c[best]?Object.values(c).reduce((a,b)=>a+b,0):1))/2:1}
const PURN={.5:'arm',1:'normal',2:'reich'};
/* Strom */
function rangeOK(e,n){const r=n.k==='zentrale'?6:n.k==='grossmast'?2:5,s=K[e.k].s,ns=K[n.k].s;return e.x<n.x+ns+r&&e.x+s>n.x-r&&e.y<n.y+ns+r&&e.y+s>n.y-r}
let links=[],nets=[];
function wire(){links=[];const par=new Map(nodes.map(n=>[n.id,n.id]));const f=a=>{while(par.get(a)!==a)a=par.get(a);return a};
 const c=n=>[n.x+K[n.k].s/2,n.y+K[n.k].s/2];
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=c(nodes[i]),b=c(nodes[j]),gm=nodes[i].k==='grossmast'&&nodes[j].k==='grossmast',rn=gm?24:nodes[i].k==='zentrale'||nodes[j].k==='zentrale'?12:9.5;if(Math.hypot(a[0]-b[0],a[1]-b[1])<=rn){par.set(f(nodes[i].id),f(nodes[j].id));links.push([nodes[i],nodes[j]])}}
 const m=new Map();for(const n of nodes){const r=f(n.id);if(!m.has(r))m.set(r,{gen:0,dem:0,sat:0});n.net=m.get(r)}nets=[...m.values()];
 for(const e of machines){e.net=null;for(const n of nodes)if(rangeOK(e,n)){e.net=n.net;break}}
 dirtyP=false;UI.wires()}
function power(){for(const n of nets){n.gen=0;n.dem=0}for(const n of nodes)if(n.k==='zentrale')n.net.gen+=K.zentrale.gen;
 for(const e of machines){if(!e.net||e.bau)continue;const k=K[e.k];if(k.burn){if(e.burn>0)e.net.gen+=k.gen}else if(e.k==='solar')e.net.gen+=k.gen;else if(e.st!=='wait'&&e.st!=='blocked')e.net.dem+=(k.p||0)*(e.oc||1)*(e.oc||1)*TIER[e.tier||0].pw}
 for(const n of nets)n.sat=n.dem?Math.min(1,n.gen/n.dem):1}
/* Transport */
function ins(b,fromDir,k){if((b.k==='leitung')!==FL.has(k))return false;const it=b.it;if(fromDir===b.r||b.cv!==0){if(it.length&&it[it.length-1].t<GAP)return false;it.push({t:0,k});return true}
 for(const q of it)if(Math.abs(q.t-.5)<GAP)return false;let i=0;while(i<it.length&&it[i].t>.5)i++;it.splice(i,0,{t:.5,k});return true}
/* Übergabe an das Feld x,y. HALZ zählt Übergaben über Hallengrenzen (siehe Produktionshallen). */
let HALZ=null;
function give(x,y,d,k,h){const ok=gibAn(x,y,d,k,h);if(ok&&HALZ)HALZ(x,y,d,k);return ok}
function gibAn(x,y,d,k,h){const e=at(x,y);if(!e)return false;
 if(isBelt(e)){if(e.r===(d+2)%4)return false;if(e.sl&&d!==e.r)return false;if(h!==undefined&&h!==e.z+(e.sl<0&&d===e.r?1:0))return false;return ins(e,d,k)}
 if(h!==undefined&&h!==e.z)return false;
 if(e.k==='verteiler'||e.k==='sortierer'){const l=e.buf;if(l.length>=4||(l.length&&(l[l.length-1].t||0)<GAP))return false;l.push({k,d,t:0,v:GV||1.6});return true}
 if(e.k==='kreuzung'){const l=e.sl[d%2];if(l.length&&l[l.length-1].t<GAP)return false;l.push({k,d,t:0});return true}
 if(e.k==='zentrale'){deliver(k);return true}
 if(e.inv)return accept(e,k);return false}
function mine(e){const k=ORES[e.ore];if(e.k==='oelpumpe'){e.out.push(k);return}const f=erzFeld(e.k,e.x,e.y);for(let q=0;q<f.length;q++){e.mi=((e.mi||0)+1)%f.length;const i=f[e.mi][1]*N+f[e.mi][0];if(ORE[i]===e.ore&&AMT[i]>0&&!F[i]){AMT[i]--;PT[PID[i]]--;e.out.push(k);stats(e).g++;if(!AMT[i]){oreInfo(e);dirtyK=true}return}}oreInfo(e)}
function total(e){let n=0;for(const i in e.inv)n+=e.inv[i];return n}
const RB=new Set(Object.values(REZ).map(r=>r.b));const base=q=>K[q].as||q;
function accept(e,k){if(e.bau)return false;if(e.k==='lagerkiste'){if(total(e)>=200)return false;e.inv[k]=(e.inv[k]||0)+1;return true}if(e.k==='traeger'){if(total(e)>=40)return false;e.inv[k]=(e.inv[k]||0)+1;return true}if(e.k==='versand'){if(total(e)>=60)return false;e.inv[k]=(e.inv[k]||0)+1;return true}if(e.k==='bahnhof'){if(!e.link||total(e)>=200)return false;e.inv[k]=(e.inv[k]||0)+1;return true}if(e.k==='drohnenhafen'){if(!e.link||total(e)>=40)return false;e.inv[k]=(e.inv[k]||0)+1;return true}if(e.k==='raketensilo'){if(k!=='raketenteil'||(e.inv.raketenteil||0)>=SILO||e.launch!==undefined)return false;e.inv.raketenteil=(e.inv.raketenteil||0)+1;return true}if(K[e.k].burn){const fu=K[e.k].fuel||'kohle';if(k!==fu||(e.inv[fu]||0)>=4)return false;e.inv[fu]=(e.inv[fu]||0)+1;return true}
 if(!RB.has(base(e.k)))return false;
 if(!e.rez){const c=Object.keys(REZ).find(id=>REZ[id].b===base(e.k)&&REZ[id].in[k]);if(!c)return false;e.rez=c}
 const r=REZ[e.rez];if(!r.in[k])return false;const cap=Math.max(r.in[k]*3,4);if((e.inv[k]||0)>=cap)return false;e.inv[k]=(e.inv[k]||0)+1;return true}
function deliver(k){if(k==='ausschuss'){G.cr=(G.cr||0)+1;return}if(auftragLiefern(k))return;if(G.entn&&G.entn[k]>0){G.entn[k]--;G.stock[k]=(G.stock[k]||0)+1;return}G.cr=(G.cr||0)+(VAL[k]||.5)*.1;G.stock[k]=(G.stock[k]||0)+1;G.total[k]=(G.total[k]||0)+1;rate[k]=(rate[k]||0)+1;const m=MS[G.ms];if(m&&m.need[k])G.del[k]=(G.del[k]||0)+1;checkMS()}
function checkMS(){const m=MS[G.ms];if(!m)return;for(const k in m.need)if((G.del[k]||0)<m.need[k])return;G.ms++;G.del={};{const pr=150+50*G.ms;G.cr=(G.cr||0)+pr;m._pr=pr}UI.toast('Meilenstein geschafft: '+m.n+' · Prämie '+m._pr+' Cr'+(m.un.length?' · Neu: '+m.un.map(u=>K[u].n).join(', '):''));UI.msDraw();UI.toolsDraw();if(G.ms>=MS.length&&!G.won2){G.won2=true;UI.ende()}}
function step(dt){
 for(const b of belts){const v=K[b.k].v*dt,it=b.it;for(let i=0;i<it.length;i++){const mx=i?it[i-1].t-GAP:1;if(it[i].t<mx)it[i].t=Math.min(it[i].t+v,mx)}
  if(it.length&&it[0].t>=1){const k=it[0].k;GV=K[b.k].v;if(give(b.x+DX[b.r],b.y+DY[b.r],b.r,k,b.z+(b.sl>0?1:0)))it.shift();GV=0}}
 for(const e of splits){if(e.k==='verteiler'||e.k==='sortierer'){for(let i=0;i<e.buf.length;i++){const w=e.buf[i],mx=i?e.buf[i-1].t-GAP:1;w.t=Math.min((w.t||0)+(w.v||1.6)*dt,Math.max(w.t||0,mx))}if(e.buf.length&&e.buf[0].t>=1){const q=e.buf[0];let ds;if(e.f)ds=q.k===e.f?[q.d]:[(q.d+1)%4,(q.d+3)%4];else{const zu=e.zu||{};ds=[];if(!zu.g)ds.push(q.d);if(!zu.r)ds.push((q.d+1)%4);if(!zu.l)ds.push((q.d+3)%4);if(e.prio&&!zu[e.prio]){const pd=e.prio==='g'?q.d:e.prio==='r'?(q.d+1)%4:(q.d+3)%4;if(give(e.x+DX[pd],e.y+DY[pd],pd,q.k,e.z)){e.buf.shift();continue}ds=ds.filter(x=>x!==pd);if(!ds.length)continue}}for(let i=0;i<ds.length;i++){const d=ds[(e.nx+i)%ds.length];if(give(e.x+DX[d],e.y+DY[d],d,q.k,e.z)){e.buf.shift();e.nx=(e.nx+i+1)%3;break}}}}
  else if(e.k==='greifer'||e.k==='langgreifer'){e.t+=dt;if(e.t<.55)continue;const d=e.r,R=e.k==='langgreifer'?2:1;if(!e.h){const s=at(e.x-DX[d]*R,e.y-DY[d]*R);if(s&&s.z===e.z){if(isBelt(s)&&s.k==='leitung'){}else if(isBelt(s)){if(e.f){const j=s.it.findIndex(q=>q.k===e.f&&q.t>.2);if(j>=0)e.h=s.it.splice(j,1)[0].k}else if(s.it.length&&s.it[0].t>.55)e.h=s.it.shift().k}else if(s.k==='lagerkiste'){for(const i in s.inv)if(s.inv[i]>0&&(!e.f||i===e.f)){s.inv[i]--;e.h=i;break}}else if(s.k==='zentrale'){if(e.f&&(G.stock[e.f]||0)>=1){G.stock[e.f]--;e.h=e.f;G.entn=G.entn||{};G.entn[e.f]=(G.entn[e.f]||0)+1}}else if(s.out&&s.out.length&&!K[s.k].gen){if(!e.f)e.h=s.out.shift();else{const j=s.out.indexOf(e.f);if(j>=0)e.h=s.out.splice(j,1)[0]}}}}if(e.h&&give(e.x+DX[d]*R,e.y+DY[d]*R,d,e.h,e.z)){e.h=null;e.t=0}}
  else for(let a=0;a<2;a++){const l=e.sl[a];for(let i=0;i<l.length;i++){const mx=i?l[i-1].t-GAP:1;if(l[i].t<mx)l[i].t=Math.min(l[i].t+2.4*dt,mx)}if(l.length&&l[0].t>=1){const q=l[0];if(give(e.x+DX[q.d],e.y+DY[q.d],q.d,q.k,e.z))l.shift()}}}
 for(const e of machines){if(e.bau){e.st='wait';continue}const k=K[e.k],sat=e.net?e.net.sat:0;
  if(e.k==='solar'){e.st=e.net?'ok':'noPower';continue}
  if(k.burn){if(e.burn>0){e.burn-=dt}{const fu=k.fuel||'kohle';if(e.burn<=0&&(e.inv[fu]||0)>0){e.inv[fu]--;e.burn=k.burn}}e.st=!e.net?'noPower':e.burn>0?'ok':'wait';continue}
  if(e.out.length){const o=outTile(e);if(give(o[0],o[1],o[2],e.out[0],e.z))e.out.shift()}
  if(e.k==='traeger'){e.st=total(e)?'ok':'wait';continue}
  if(e.k==='lagerkiste'){e.st='ok';if(!e.out.length)for(const i in e.inv)if(e.inv[i]>0){e.inv[i]--;e.out.push(i);break}continue}
  if(!e.net||!sat){e.st='noPower';continue}
  if(e.off||e.kaputt){e.st=e.kaputt?'defekt':'off';continue}
  if(e.k==='wartungsstation'){station(e,dt);continue}
  if(e.k==='raketensilo'){if(e.launch!==undefined){e.st='ok';e.launch+=dt;if(e.launch>=22){delete e.launch;G.rockets=(G.rockets||0)+1;deliver('rakete');UI.toast('Rakete im All. Starts bisher: '+G.rockets)}}else e.st=(e.inv.raketenteil||0)>=SILO?'ok':'wait';continue}
  if(e.k==='versand'){versandStep(e,dt);continue}
  if(e.k==='bahnhof'){zugStep(e,dt);continue}
  if(e.k==='drohnenhafen'){if(e.fly){e.st='ok';e.fly.t+=dt/e.fly.dur;if(e.fly.t>=1){const z=E.get(e.link);if(z&&z.out.length<60){z.out.push(...e.fly.l);e.fly=null}else{e.fly.t=1;e.st='blocked'}}}else{const n=total(e),z=E.get(e.link);if(z&&n){e.idle=(e.idle||0)+dt;if(n>=20||e.idle>6){const l=[];for(const i in e.inv)while(e.inv[i]>0&&l.length<20){e.inv[i]--;l.push(i)}e.idle=0;const cd=Math.hypot(z.x-e.x,z.y-e.y);e.fly={t:0,dur:cd/12+3,l}}e.st='ok'}else e.st='wait'}continue}
  if(e.ore!==undefined){if(!e.ore){e.st='wait';continue}if(e.out.length>=3){e.st='blocked';continue}e.st='ok';e.prog+=dt*sat*TS(e)*e.oreN/4*e.pur;if(e.prog>=k.t){e.prog=0;mine(e)}continue}
  if(!e.rez){e.st='wait';continue}const r=REZ[e.rez];
  if(e.prog<=0){if(e.out.length>=4){e.st='blocked';continue}if(!hasAll(e,r)){e.st='wait';continue}for(const q in r.in)e.inv[q]-=r.in[q];e.prog=1e-6}
  e.st='ok';e.prog+=dt*sat*TS(e)*(k.sp||1);if(e.prog>=r.t){e.prog=0;fertig(e,r)}}
betrieb(dt)}
function hasAll(e,r){for(const q in r.in)if((e.inv[q]||0)<r.in[q])return false;return true}

