/* ====== Bauhilfen: Ein-/Ausgangspfeile und Feldmarkierung ====== */
const IO={c:new T.Color(),aus:new T.Color(0xffc21f),ab:new T.Color(0xff4a3c),ein:new T.Color(0x53e07a)};
IO.pfeile=(function(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([.4,0,0,-.02,0,-.3,-.02,0,.3, -.02,0,-.12,-.36,0,-.12,-.36,0,.12, -.02,0,-.12,-.36,0,.12,-.02,0,.12],3));g.computeVertexNormals();
 const m=new T.InstancedMesh(g,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,depthWrite:false,toneMapped:false,side:T.DoubleSide}),800);m.count=0;m.frustumCulled=false;m.setColorAt(0,new T.Color());m.renderOrder=3;scene.add(m);return m})();
IO.feld=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.22)';g.fillRect(0,0,128,128);g.strokeStyle='#fff';g.lineWidth=10;g.strokeRect(5,5,118,118);
 const m=new T.Mesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false,toneMapped:false}));m.visible=false;m.renderOrder=2;scene.add(m);return m})();
function ioUpdate(){const P=IO.pfeile,o=GB.ob;let n=0;const bau=!!tool&&tool!=='x',cx=C.x,cz=C.z,r=Math.max(45,C.dist*.9),puls=1+.12*Math.sin(performance.now()/160);
 const pf=(x,y,d,col,s)=>{if(n>=800||x<0||y<0||x>=N||y>=N)return;o.position.set(x+.5,YL(Lv(x,y))+.07,y+.5);o.rotation.set(0,-d*Math.PI/2,0);o.scale.setScalar(s);o.updateMatrix();P.setMatrixAt(n,o.matrix);P.setColorAt(n++,col)};
 const frei=(x,y)=>!at(x,y);
 const seiten=(e,s,skip)=>{const m=(s-1)>>1;for(let d=0;d<4;d++){if(d===skip)continue;const q=d===0?[e.x+s,e.y+m]:d===1?[e.x+s-1-m,e.y+s]:d===2?[e.x-1,e.y+s-1-m]:[e.x+m,e.y-1];if(frei(q[0],q[1]))pf(q[0],q[1],(d+2)%4,IO.ein,.8*puls)}};
 for(const e of machines){if(Math.abs(e.x-cx)>r||Math.abs(e.y-cz)>r)continue;const k=K[e.k],s=k.s,hatAus=e.out&&!k.gen&&e.k!=='raketensilo'&&e.k!=='versand'&&e.k!=='traeger';
  if(hatAus){const q=outTile(e);if(frei(q[0],q[1]))pf(q[0],q[1],q[2],IO.aus,bau?1.1*puls:.9);if(RB.has(base(e.k))&&fx('Stahl')){const a=rearT(e);if(frei(a[0],a[1])&&(bau||e.rej>0))pf(a[0],a[1],a[2],IO.ab,.85)}}
  if(bau&&(RB.has(base(e.k))||k.burn||e.k==='lagerkiste'||e.k==='drohnenhafen'||e.k==='bahnhof'||e.k==='versand'||e.k==='traeger'||e.k==='raketensilo'))seiten(e,s,hatAus?e.r:-1)}
 if(bau)for(const e of nodes)if(e.k==='zentrale'&&Math.abs(e.x-cx)<r+6&&Math.abs(e.y-cz)<r+6)for(let i=1;i<6;i+=2){for(const[x,y,d]of[[e.x+6,e.y+i,2],[e.x-1,e.y+i,0],[e.x+i,e.y+6,3],[e.x+i,e.y-1,1]])if(frei(x,y))pf(x,y,d,IO.ein,.8*puls)}
 P.count=n;P.instanceMatrix.needsUpdate=true;if(P.instanceColor)P.instanceColor.needsUpdate=true;
 // Feldmarkierung unter dem Mauszeiger
 const f=IO.feld;f.visible=!!tool&&!(drag&&(drag.a||drag.f||drag.kx||drag.g))&&tool!=='kx'&&tool!=='fundament';
 if(f.visible){const xx=tool==='x'||tool==='fx',s=xx?1:K[tool].s,hx=xx&&hoverT?hoverT[0]:hover[0],hy=xx&&hoverT?hoverT[1]:hover[1],ok=xx?false:canPlace(tool,hx,hy)&&afford(tool);
  f.position.set(hx+s/2,YL(Lv(hx,hy))+.05,hy+s/2);f.scale.set(s,1,s);f.material.color.set(ok?0x6dff8f:0xff5a4a);
  if(BK(tool)&&!drag){dm.position.set(hx+.5,.3+YL(Lv(hx,hy)),hy+.5);dm.rotation.set(0,-rot*Math.PI/2,0);dm.scale.set(1,1,1);dm.updateMatrix();beltGhost.setMatrixAt(0,dm.matrix);beltGhost.setColorAt(0,ok?GBELT:GROT);beltGhost.count=1;beltGhost.instanceMatrix.needsUpdate=true;if(beltGhost.instanceColor)beltGhost.instanceColor.needsUpdate=true}}}
{const _g=ghostUp;ghostUp=function(){_g();ioUpdate()}}
gridLines.material.opacity=.2;
