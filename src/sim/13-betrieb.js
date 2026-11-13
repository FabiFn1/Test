/* ====== Betrieb: Verschleiß, Qualität, Kennzahlen, Aufträge, Logik ====== */
const TIER=[{sp:1,life:1,sc:1,pw:1},{sp:1.3,life:3,sc:.5,pw:1.3},{sp:1.6,life:8,sc:.2,pw:1.7}];
const TIERCOST=[null,{stahl:30,schaltkreis:20},{stahlblech:60,logikmodul:20}],TIERCR=[0,400,3000];
const LIFE=5400,NOWEAR=new Set(['drohnenhafen','wartungsstation','raketensilo','recycler']),SCR={ofen:.03,elektroofen:.03,fertiger:.06,montagewerk:.06,raffinerie:.04,chemiefabrik:.05,praezision:.09,zentrifuge:.05};
const FX={'Erste Teile':'Kundenaufträge','Forschung I':'Verschleiß und Reparatur','Kraftwerk':'SPS-Logik','Stahl':'Ausschuss','Mechanik':'Tier 2','Forschung IV':'Tier 3'};
const fx=n=>G.ms>MS.findIndex(m=>m.n===n);
const TS=e=>(e.oc||1)*TIER[e.tier||0].sp;
const wears=e=>!!K[e.k].p&&!NOWEAR.has(e.k);
function stats(e){return e.s||(e.s={r:0,w:0,d:0,g:0,b:0})}
const tierFrei=n=>n===1?fx('Mechanik'):n===2?fx('Forschung IV'):true;
function fertig(e,r){const st=stats(e),T_=TIER[e.tier||0],q=fx('Stahl')?(SCR[e.k]??SCR[K[e.k].as]??0)*T_.sc*(1+2*(1-(e.hp??1))):0;for(let i=0;i<r.out[1];i++){if(Math.random()<q){st.b++;e.rej=(e.rej||0)+1;if(e.rej>30){e.rej=30;G.lost=(G.lost||0)+1}}else{st.g++;e.out.push(r.out[0])}}}
function repair(m){m.hp=1;m.kaputt=false;m.lm=.7+Math.random()*.6;delete m.job}
function reparieren(list){let n=0;for(const m of list){if(!wears(m)||(m.hp??1)>.9)continue;if((G.stock.ersatzteil||0)<1){UI.toast('Keine Ersatzteile im Lager.');break}G.stock.ersatzteil--;repair(m);n++}return n}
function station(e,dt){e.st='ok';const t=e.tier||0,cap=[2,4,8][t],r=[18,28,40][t];e.jobs=e.jobs||[];for(let i=e.jobs.length-1;i>=0;i--){const j=e.jobs[i];j.t+=dt/j.dur;if(j.t>=1){const m=E.get(j.id);if(m&&(G.stock.ersatzteil||0)>0){repMit(m);delete m.job}else if(m)delete m.job;e.jobs.splice(i,1)}}
 e.scan=(e.scan||0)-dt;if(e.scan>0||e.jobs.length>=cap)return;e.scan=2;if((G.stock.ersatzteil||0)<1)return;const cx=e.x+1.5,cy=e.y+1.5;for(const m of machines){if(e.jobs.length>=cap)break;if(!wears(m)||m.job||!(m.kaputt||(m.hp??1)<.35))continue;const d=Math.hypot(m.x-cx,m.y-cy);if(d>r)continue;m.job=e.id;e.jobs.push({id:m.id,t:0,dur:d/10+6})}}
function rearT(e){return outTile({...e,r:(e.r+2)%4})}
let bT=0,kT=0,aT=0;
function betrieb(dt){G.t=(G.t||0)+dt;const on=fx('Forschung I');bT+=dt;const dec=bT>=30;if(dec)bT=0;
 for(const e of machines){if(!wears(e))continue;const st=stats(e);if(e.hp===undefined)e.hp=1;
  if(e.st==='ok'){st.r+=dt;if(on&&!e.kaputt){const oc=e.oc||1;e.hp-=dt*oc*oc/(LIFE*TIER[e.tier||0].life*(e.lm||1));if(e.hp<=0){e.hp=0;e.kaputt=true;G.ausf=(G.ausf||0)+1}}}else if(e.st==='defekt'||e.st==='noPower')st.d+=dt;else st.w+=dt;
  if(e.rej>0){const o=rearT(e);if(give(o[0],o[1],o[2],'ausschuss',e.z))e.rej--}
  if(dec)for(const q in st)st[q]*=.95}
 kT+=dt;if(kT>=1){kT=0;spsRun()}aT+=dt;if(aT>=5){aT=0;auftragTakt()}}
/* Komplexe und Kennzahlen */
const inKx=(e,x)=>e.x+K[e.k].s>x.x0&&e.x<=x.x1&&e.y+K[e.k].s>x.y0&&e.y<=x.y1;
const kxM=x=>machines.filter(e=>wears(e)&&(!x||inKx(e,x)));
function kennz(l){let r=0,w=0,d=0,g=0,b=0,hp=0,df=0,off=0;for(const e of l){const s=stats(e);r+=s.r;w+=s.w;d+=s.d;g+=s.g;b+=s.b;hp+=e.hp??1;if(e.kaputt)df++;if(e.off)off++}const a=r+d?r/(r+d):1,p=r+w?r/(r+w):1,q=g+b?g/(g+b):1,tt=r+w+d;return{n:l.length,a,p,q,oee:a*p*q,hp:l.length?hp/l.length:1,sc:1-q,df,off,aus:tt?g/(tt/Math.max(1,l.length))*60:0}}
/* Kundenaufträge */
const KUNDEN=['Nordwerk Logistik','Elbe Maschinenbau','Harzer Getriebe','Rheintal Elektro','Ostsee Werft','Alpen Anlagenbau','Spree Automation','Weser Stahlhandel'];
let aufId=1;
function auftragTakt(){if(!fx('Erste Teile'))return;G.auf=G.auf||[];G.ang=G.ang||[];for(let i=G.auf.length-1;i>=0;i--){const a=G.auf[i];if(G.t>a.bis){UI.toast(`Auftrag abgelaufen: ${a.kunde}. Keine Bezahlung.`);G.auf.splice(i,1)}}
 G.angT=(G.angT||0)+5;if(G.angT<60||G.ang.length>=4)return;G.angT=0;const pool=Object.keys(VAL).filter(k=>(G.total[k]||0)>0&&k!=='ausschuss'&&!REZIN(k));if(!pool.length)return;const k=pool[Math.floor(Math.random()*pool.length)],n=Math.max(250,Math.round(Math.min(80000,(G.total[k]||0)*.6+300+G.ms*150)/50)*50),l=Math.round(n*VAL[k]*(.3+Math.random()*.2));G.ang.push({id:aufId++,kunde:KUNDEN[Math.floor(Math.random()*KUNDEN.length)],k,n,got:0,lohn:l,dauer:Math.max(1800,Math.min(7200,n*2))})}
const REZIN=k=>['eisenerz','kupfererz','kohle','stein','quarz','bauxit','rohoel','schwefel','uranerz'].includes(k);
function auftragAn(id){G.auf=G.auf||[];if(G.auf.length>=3){UI.toast('Höchstens 3 Aufträge gleichzeitig.');return}const i=G.ang.findIndex(a=>a.id===id);if(i<0)return;const a=G.ang.splice(i,1)[0];a.bis=G.t+a.dauer;G.auf.push(a)}
function auftragLiefern(k){return false}
/* SPS: Wenn Bedingung, dann Komplex aus/ein */
function sensor(c){if(c.s==='lager')return G.stock[c.i]||0;const x=(G.kx||[]).find(q=>q.id===+c.x),l=kxM(x);if(c.s==='last'){const n=nodes.find(q=>q.k==='zentrale')?.net;return n&&n.gen?n.dem/n.gen*100:0}if(c.s==='stoer')return l.filter(e=>e.kaputt).length;if(c.s==='zustand')return kennz(l).hp*100;if(c.s==='oee')return kennz(l).oee*100;return 0}
const cmp=(a,o,b)=>o==='<'?a<b:o==='>'?a>b:a===b;
function spsRun(){if(!(G.sps||[]).length||!fx('Kraftwerk'))return;const wun=new Map();for(const r of G.sps){if(r.an===false){r.q=false;continue}let v=cmp(sensor(r.a),r.a.op,+r.a.v);if(r.b)v=v&&cmp(sensor(r.b),r.b.op,+r.b.v);r.q=v;if(!wun.has(+r.x))wun.set(+r.x,false);const aus=r.t==='aus'?v:!v;if(aus)wun.set(+r.x,true)}for(const[x,o]of wun){const q=(G.kx||[]).find(z=>z.id===x);if(q)for(const e of kxM(q))e.off=o}}
function tierUp(e){const n=(e.tier||0)+1;if(n>2)return false;if(!tierFrei(n)){UI.toast('Noch nicht freigeschaltet.');return false}const c=TIERCOST[n];for(const i in c)if((G.stock[i]||0)<c[i]){UI.toast('Material fehlt: '+c[i]+' '+ITEMS[i][0]);return false}if((G.cr||0)<TIERCR[n]){UI.toast('Dafür fehlen Credits.');return false}for(const i in c)G.stock[i]-=c[i];G.cr-=TIERCR[n];e.tier=n;dirtyK=true;return true}

