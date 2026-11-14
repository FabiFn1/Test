/* ====== Züge ====== */
NOWEAR.add('bahnhof');let zugV=0;{const _r=relist;relist=function(){_r();zugV++}}
function zugPfad(a,b){const ziel=new Set(),rand=(e,f)=>{const s=K[e.k].s;for(let i=0;i<s;i++){f(e.x-1,e.y+i);f(e.x+s,e.y+i);f(e.x+i,e.y-1);f(e.x+i,e.y+s)}},istG=(x,y)=>{const q=at(x,y);return !!q&&q.k==='gleis'&&q.z===a.z};
 rand(b,(x,y)=>{if(istG(x,y))ziel.add(y*N+x)});if(!ziel.size)return null;const vor=new Map(),q=[];rand(a,(x,y)=>{const i=y*N+x;if(istG(x,y)&&!vor.has(i)){vor.set(i,-1);q.push(i)}});
 for(let h=0;h<q.length;h++){const i=q[h];if(ziel.has(i)){const p=[];for(let j=i;j!==-1;j=vor.get(j))p.push([j%N+.5,(j/N|0)+.5]);return p.reverse()}const x=i%N,y=i/N|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,j=Y*N+X;if(istG(X,Y)&&!vor.has(j)){vor.set(j,i);q.push(j)}}}return null}
function zugWeg(e){if(e._pv!==zugV){e._pv=zugV;const z=E.get(e.link);e._pf=z&&z.k==='bahnhof'?zugPfad(e,z):null}return e._pf}
function zugStep(e,dt){const z=E.get(e.link),p=z?zugWeg(e):null,zg=e.zug;
 if(!zg){if(!z||!p){e.st='wait';return}const n=total(e);e.st='ok';if(n){e.idle=(e.idle||0)+dt;if(n>=100||e.idle>8){const l=[];for(const i in e.inv)while(e.inv[i]>0&&l.length<100){e.inv[i]--;l.push(i)}e.idle=0;e.zug={t:0,s:'hin',l};G.zuege=(G.zuege||0)+1;sfx('pfiff')}}return}
 e.st='ok';if(!p){if(zg.s==='hin'){for(const i of zg.l)e.inv[i]=(e.inv[i]||0)+1}e.zug=null;return}const L=p.length-1;
 if(zg.s==='hin'){zg.t=Math.min(L,zg.t+dt*5);if(zg.t>=L){if(z.out.length<80){z.out.push(...zg.l);zg.l=[];zg.s='zurueck'}else e.st='blocked'}}
 else{zg.t-=dt*5;if(zg.t<=0)e.zug=null}}
// Darstellung: Gleise
const GLEIS={max:8000,teile:MODELS.gleis.map(q=>{const g=q.g.clone();const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)*.5+.25);const m=new T.InstancedMesh(g,M(q.m),8000);m.count=0;m.frustumCulled=false;m.receiveShadow=true;scene.add(m);return m})};
function gleisBauen(){const o=GB.ob;let n=0;const l=byKind.gleis||[];for(const e of l){const y=YL(e.z);let k=0;const seg=d=>{if(n>=GLEIS.max)return;o.position.set(e.x+.5,y,e.y+.5);o.rotation.set(0,-d*Math.PI/2,0);o.scale.set(1,1,1);o.updateMatrix();for(const m of GLEIS.teile)m.setMatrixAt(n,o.matrix);n++;k++};
  for(let d=0;d<4;d++){const q=at(e.x+DX[d],e.y+DY[d]);if(q&&(q.k==='gleis'||q.k==='bahnhof'))seg(d)}if(!k){seg(0);seg(2)}else if(k===1){for(let d=0;d<4;d++){const q=at(e.x+DX[d],e.y+DY[d]);if(q&&(q.k==='gleis'||q.k==='bahnhof')){seg((d+2)%4);break}}}}
 for(const m of GLEIS.teile){m.count=n;m.instanceMatrix.needsUpdate=true}}
{const _k=rebuildK;rebuildK=function(){_k();gleisBauen();EV.melde('gebaeude')}}
// Darstellung: Züge
ZUGM.lokI=ZUGM.lok.map(q=>inst(q,120));ZUGM.wagI=ZUGM.wagen.map(q=>inst(q,240));
function zugZeichnen(){const o=GB.ob;let nl=0,nw=0;const pos=(p,t)=>{t=Math.max(0,Math.min(p.length-1,t));const i=Math.min(p.length-2,Math.floor(t)),u=t-i;if(p.length<2)return[p[0][0],p[0][1],0];const a=p[i],b=p[i+1];return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])]};
 for(const e of byKind.bahnhof||[]){const zg=e.zug,p=e._pf;if(!zg||!p||nl>=120)continue;const y=YL(e.z)+.1,rw=zg.s==='zurueck';
  for(let k=0;k<3;k++){const t=zg.t+(rw?1:-1)*k*.98;if(t<-.4||t>p.length-.6)continue;const q=pos(p,t);o.position.set(q[0],y,q[1]);o.rotation.set(0,-q[2]+(rw?Math.PI:0),0);o.scale.set(1,1,1);o.updateMatrix();
   if(k===0){for(const m of ZUGM.lokI)m.setMatrixAt(nl,o.matrix);nl++;if(!paused&&Math.random()<.5)emit('dampf',q[0],y+.8,q[1],0,.6,0,1.6,.15,.7)}else{for(const m of ZUGM.wagI)m.setMatrixAt(nw,o.matrix);nw++}}}
 for(const m of ZUGM.lokI){m.count=nl;m.instanceMatrix.needsUpdate=true}for(const m of ZUGM.wagI){m.count=nw;m.instanceMatrix.needsUpdate=true}}
{const _r=renderBild;renderBild=function(){zugZeichnen();_r()}}
LAMP.bahnhof=NBA.bahnhof.lampe;
ERF.push(['zug','Fahrplan','Lass deinen ersten Güterzug fahren.',()=>(G.zuege||0)>=1]);
{const _io=ioUpdate;ioUpdate=function(){_io();if(drag&&drag.g){const l=linePath(drag.g,drag.b).slice(0,400);beltGhost.count=l.length;l.forEach((t,i)=>{dm.position.set(t[0]+.5,.16+YL(Lv(t[0],t[1])),t[1]+.5);dm.rotation.set(0,0,0);dm.scale.set(1,.5,1.2);dm.updateMatrix();beltGhost.setMatrixAt(i,dm.matrix);beltGhost.setColorAt(i,canPlace(drag.gk,t[0],t[1])?GBELT:GROT)});beltGhost.instanceMatrix.needsUpdate=true;if(beltGhost.instanceColor)beltGhost.instanceColor.needsUpdate=true;IO.feld.visible=false}}}
