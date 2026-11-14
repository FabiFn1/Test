/* ====== Versandstation: Drohnen bringen Material in die Zentrale ====== */
NOWEAR.add('versand');LAMP.versand=NBA.versand.lampe;MHOEHE.versand=1.1;
function versandStep(e,dt){const z=nodes.find(n=>n.k==='zentrale');if(!z){e.st='wait';return}
 // Liefern: Ist ein Stoff gewählt, holen die Drohnen ihn aus der Zentrale und die Station gibt ihn am Ausgang ab
 if(e.f){const cap=[10,20,30][e.tier||0];if(e.fly){e.st='ok';e.fly.t+=dt/e.fly.dur;if(e.fly.t>=1){if(e.fly.rein)for(const i of e.fly.l)e.out.push(i);else for(const i of e.fly.l)deliver(i);e.fly=null}return}
  if(e.out.length>cap){e.st='blocked';return}const n=Math.min(cap,Math.floor(G.stock[e.f]||0));if(n<1){e.st='wait';return}
  G.stock[e.f]-=n;G.entn=G.entn||{};G.entn[e.f]=(G.entn[e.f]||0)+n;G.geliefert=(G.geliefert||0)+n;e.fly={t:0,dur:Math.hypot(z.x+3-e.x-1,z.y+3-e.y-1)/14+2,l:Array(n).fill(e.f),rein:1};e.st='ok';return}
 if(e.fly){e.st='ok';e.fly.t+=dt/e.fly.dur;if(e.fly.t>=1){for(const i of e.fly.l)deliver(i);G.versand=(G.versand||0)+e.fly.l.length;e.fly=null}return}
 const n=total(e);if(!n){e.st='wait';e.idle=0;return}e.st='ok';e.idle=(e.idle||0)+dt;const cap=[10,20,30][e.tier||0];if(n>=cap||e.idle>3){const l=[];for(const i in e.inv)while(e.inv[i]>0&&l.length<cap){e.inv[i]--;l.push(i)}e.idle=0;if(e.hh)for(const i of l)hallenZaehlen(e.hh,'aus',i);e.fly={t:0,dur:Math.hypot(z.x+3-e.x-1,z.y+3-e.y-1)/14+2,l}}}
{const _r=renderBild;renderBild=function(){const z=nodes.find(n=>n.k==='zentrale');if(z)for(const e of byKind.versand||[]){if(!e.fly)continue;const n=DRN[0].count;if(n>=200)break;const u=e.fly.rein?1-e.fly.t:e.fly.t,a=lokal(e,...NBA.versand.start),bx=z.x+3,bz=z.y+3,q=Math.sin(Math.PI*u),y=a[1]*(1-u)+(YL(z.z)+3.6)*u+Math.min(q*2.5,1)*6;
  dm.position.set(a[0]+(bx-a[0])*u,y,a[2]+(bz-a[2])*u);dm.rotation.set(0,Math.atan2(a[0]-bx,a[2]-bz),0);dm.scale.set(1,1,1);dm.updateMatrix();for(const m of DRN){m.setMatrixAt(n,dm.matrix);m.count=n+1;m.instanceMatrix.needsUpdate=true}}_r()}}
ERF.push(['versand','Luftfracht','Schick 1.000 Teile per Versandstation in die Zentrale.',()=>(G.versand||0)>=1000]);
