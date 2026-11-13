/* ====== Neue Gebäudemodelle (prozedural) ====== */
/* --- Materialien: Ziegel mit Fugen, Trapezblech, Holz, Rost, Paneele --- */
(function(){const R=rnd(4711),n=512;
 const mk=(draw,hf,st,opt)=>{const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');draw(g);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return{map:t,normalMap:normalKarte(n,hf,st),...opt}};
 const speck=(g,k,a)=>{for(let i=0;i<k;i++){const v=R()<.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${a})`;g.fillRect(R()*n,R()*n,1+R()*3,1+R()*3)}};
 // Ziegel: 8 Steine breit, 16 Lagen hoch je Einheit
 const zh=new Float32Array(n*n);const ziegel=mk(g=>{g.fillStyle='#8f8a80';g.fillRect(0,0,n,n);for(let r=0;r<16;r++)for(let c=-1;c<8;c++){const x=c*64+(r%2?32:0),y=r*32,q=R(),l=q<.12?.62:q>.9?1.14:.86+R()*.2;g.fillStyle=`rgb(${Math.round(156*l)},${Math.round((70+R()*14)*l)},${Math.round((52+R()*10)*l)})`;g.fillRect(x+2,y+2,60,28);
   for(let yy=y+2;yy<y+30;yy++)for(let xx=x+2;xx<x+62;xx++){if(xx>=0&&xx<n)zh[yy*n+xx]=.8+R()*.2}}speck(g,9000,.07)},zh,3,{roughness:.9,metalness:0});
 // Trapezblech: 8 Rippen je Einheit, senkrecht
 const bh=new Float32Array(n*n),prof=x=>{const u=x%64;return u<24?1:u<32?1-(u-24)/8:u<56?0:(u-56)/8};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)bh[y*n+x]=prof(x)+(y%256<2?-.5:0);
 const blech=mk(g=>{for(let x=0;x<n;x++){const p=prof(x),v=Math.round(178+p*52);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x,0,1,n)}for(let i=0;i<70;i++){const x=R()*n,l=40+R()*300,y=R()*n;g.fillStyle=`rgba(40,34,26,${.05+R()*.07})`;g.fillRect(x,y,1+R()*2,l)}g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,n,2);g.fillRect(0,256,n,2);speck(g,5000,.04)},bh,2.2,{roughness:.45,metalness:.55});
 // Holz: waagerechte Bretter
 const hh=new Float32Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++)hh[y*n+x]=(y%64<3?0:1)+R()*.15;
 const holz=mk(g=>{for(let r=0;r<8;r++){const l=.8+R()*.35;g.fillStyle=`rgb(${Math.round(150*l)},${Math.round(112*l)},${Math.round(70*l)})`;g.fillRect(0,r*64,n,64);for(let i=0;i<26;i++){g.fillStyle=`rgba(60,38,18,${.08+R()*.12})`;g.fillRect(0,r*64+R()*64,n,1)}g.fillStyle='rgba(30,20,10,.7)';g.fillRect(0,r*64,n,3);g.fillRect((r*173)%n,r*64,3,64)}},hh,2,{roughness:.85,metalness:0});
 // Rost
 const rf=rauschFeld(n,33,[[6,.5],[20,.3],[70,.2]]);const rost=mk(g=>{const im=g.createImageData(n,n);for(let i=0;i<n*n;i++){const v=rf[i],k=v>.52?1:v>.44?(v-.44)/.08:0,s=.8+R()*.3;im.data[i*4]=(70+k*75)*s;im.data[i*4+1]=(66-k*10)*s;im.data[i*4+2]=(64-k*36)*s;im.data[i*4+3]=255}g.putImageData(im,0,0)},rf,4,{roughness:.8,metalness:.45});
 // Paneele: glatte Sandwichplatten mit Fugen
 const ph=new Float32Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++)ph[y*n+x]=(x%256<3||y%128<2)?0:1;
 const paneel=mk(g=>{g.fillStyle='#e9ebea';g.fillRect(0,0,n,n);g.fillStyle='rgba(60,70,80,.55)';for(let x=0;x<n;x+=256)g.fillRect(x,0,3,n);for(let y=0;y<n;y+=128)g.fillRect(0,y,n,2);for(let i=0;i<50;i++){g.fillStyle=`rgba(70,70,60,${.03+R()*.04})`;g.fillRect(R()*n,R()*n,2,60+R()*200)}speck(g,3000,.03)},ph,1.5,{roughness:.4,metalness:.15});
 const neu=(name,b,col,extra)=>{mats[name]=new T.MeshStandardMaterial({map:b.map,normalMap:b.normalMap,roughness:b.roughness,metalness:b.metalness,color:col,...extra})};
 neu('Ziegel2',ziegel,0xffffff);neu('Ziegel_Dunkel',ziegel,0x9a8f8a);neu('Blech_Hell',blech,0xd9dcd8);neu('Blech_Dunkel',blech,0x4a5258);neu('Blech_Rot',blech,0x9c3a2c);neu('Blech_Blau',blech,0x3d6288);neu('Blech_Gruen',blech,0x4f6b52);neu('Blechdach',blech,0x5e6468);neu('Blechdach_Rot',blech,0x7d3b30);
 neu('Holz',holz,0xffffff);neu('Rost',rost,0xffffff);neu('Paneel',paneel,0xffffff);neu('Paneel_Blau',paneel,0x2f5f95);
 mats.Kupfer=new T.MeshStandardMaterial({color:0xb86a3a,roughness:.35,metalness:.9});mats.Kohle=new T.MeshStandardMaterial({color:0x17181b,roughness:.4,metalness:.2,flatShading:true});
 mats.Glut_Hell=new T.MeshStandardMaterial({color:0xffb060,emissive:0xff7a1c,emissiveIntensity:2.2,roughness:.6})})();
/* --- Baukasten --- */
const UVS={Beton:.625,Beton_Hell:.625,Lack_Dunkel:1.25,Lack_Grau:1.25,Lack_Gelb:1.25,Lack_Rot:1.25,Lack_Blau:1.25,Lack_Weiss:1.25,Stahl_Verzinkt:1.25,Dach:.3125,Warnstreifen:2.5,Silo:.7};
const nbO=new T.Object3D();function nbM(x,y,z,rx,ry,rz){nbO.position.set(x,y,z);nbO.rotation.set(rx||0,ry||0,rz||0);nbO.scale.set(1,1,1);nbO.updateMatrix();return nbO.matrix.clone()}
function Bau(){this.P={}}
Bau.prototype.add=function(mat,geo,mx,o){o=o||{};const g=geo.index?geo.toNonIndexed():geo.clone();if(mx)g.applyMatrix4(mx);const p=g.attributes.position.array,n=g.attributes.normal.array,u0=g.attributes.uv&&g.attributes.uv.array,d=this.P[mat]||(this.P[mat]={p:[],n:[],u:[]}),s=o.s||UVS[mat]||1;
 for(let t=0;t<p.length;t+=9){let ax=0;if(!o.uv){const ux=p[t+3]-p[t],uy=p[t+4]-p[t+1],uz=p[t+5]-p[t+2],vx=p[t+6]-p[t],vy=p[t+7]-p[t+1],vz=p[t+8]-p[t+2],nx=Math.abs(uy*vz-uz*vy),ny=Math.abs(uz*vx-ux*vz),nz=Math.abs(ux*vy-uy*vx);ax=ny>=nx&&ny>=nz?1:nx>=nz?0:2}
  for(let k=0;k<3;k++){const i=t+k*3,v=i/3;d.p.push(p[i],p[i+1],p[i+2]);d.n.push(n[i],n[i+1],n[i+2]);
   if(o.uv==='fit')d.u.push(u0[v*2]*(o.ru||1),u0[v*2+1]*(o.rv||1));else if(o.uv==='own')d.u.push(u0[v*2]*(o.su||1),u0[v*2+1]*(o.sv||1));
   else{let a,b;if(ax===1){a=p[i];b=p[i+2]}else if(ax===0){a=p[i+2];b=p[i+1]}else{a=p[i];b=p[i+1]}if(o.rot)d.u.push(b*s,a*s);else d.u.push(a*s,b*s)}}}
 return this};
Bau.prototype.box=function(mat,x,y,z,w,h,d,o){return this.add(mat,new T.BoxGeometry(w,h,d),nbM(x,y+h/2,z,o&&o.rx,o&&o.ry,o&&o.rz),o)};
Bau.prototype.cyl=function(mat,x,y,z,r,h,o){o=o||{};const r2=o.r2===undefined?r:o.r2,s=o.s||UVS[mat]||1;return this.add(mat,new T.CylinderGeometry(r2,r,h,o.seg||16,1,!!o.open),nbM(x,o.rx||o.rz?y:y+h/2,z,o.rx,0,o.rz),{uv:'own',su:6.283*Math.max(r,r2)*s,sv:h*s})};
Bau.prototype.rohr=function(mat,a,b,r,o){o=o||{};const d=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),l=d.length(),s=o.s||UVS[mat]||1;nbO.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);nbO.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());nbO.scale.set(1,1,1);nbO.updateMatrix();const m=nbO.matrix.clone();nbO.rotation.set(0,0,0);
 return this.add(mat,new T.CylinderGeometry(r,r,l,o.seg||10,1,false),m,{uv:'own',su:6.283*r*s,sv:l*s})};
Bau.prototype.kugel=function(mat,x,y,z,r,o){o=o||{};const s=o.s||UVS[mat]||1;return this.add(mat,new T.SphereGeometry(r,o.seg||16,o.ring||10,0,6.283,0,o.halb?Math.PI/2:Math.PI),nbM(x,y,z),{uv:'own',su:6.283*r*s,sv:3.14*r*s})};
Bau.prototype.lathe=function(mat,x,y,z,prof,o){o=o||{};const s=o.s||UVS[mat]||1;let rm=0,h=0;for(const q of prof){rm=Math.max(rm,q[0]);h=Math.max(h,q[1])}const g=new T.LatheGeometry(prof.map(q=>new T.Vector2(Math.max(q[0],.0001),q[1])),o.seg||24);
 return this.add(mat,g,nbM(x,y,z),{uv:'own',su:6.283*rm*s,sv:h*s})};
// ebenes Vieleck; aus = ungefähre Richtung nach außen
Bau.prototype.poly=function(mat,pts,aus,o){o=o||{};const a=pts[0],b=pts[1],c=pts[2],ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
 let P=pts,U=o.uvs;if(nx*aus[0]+ny*aus[1]+nz*aus[2]<0){P=pts.slice().reverse();if(U)U=U.slice().reverse();nx=-nx;ny=-ny;nz=-nz}
 const d=this.P[mat]||(this.P[mat]={p:[],n:[],u:[]}),s=o.s||UVS[mat]||1,ax=Math.abs(ny)>=Math.abs(nx)&&Math.abs(ny)>=Math.abs(nz)?1:Math.abs(nx)>=Math.abs(nz)?0:2;
 const uv=(q,i)=>{if(U)return U[i];let a,b;if(o.hang){a=o.hang==='x'?q[2]:q[0];b=o.hang==='x'?q[0]:q[2]}else if(ax===1){a=q[0];b=q[2]}else if(ax===0){a=q[2];b=q[1]}else{a=q[0];b=q[1]}return o.rot?[b*s,a*s]:[a*s,b*s]};
 for(let i=1;i<P.length-1;i++)for(const k of[0,i,i+1]){const q=P[k];d.p.push(q[0],q[1],q[2]);d.n.push(nx,ny,nz);const t=uv(q,k);d.u.push(t[0],t[1])}return this};
// Wandfläche mit eingepasster Textur (Fenster, Tore, Schilder); dir 0:+x 1:+z 2:-x 3:-z
Bau.prototype.wand=function(mat,dir,cx,cy,cz,w,h,ru,rv,u0,v0){u0=u0||0;v0=v0||0;ru=ru||1;rv=rv||1;const n=[[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]][dir],r=[n[2],0,-n[0]];const P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[cx+r[0]*a*w/2,cy+b*h/2,cz+r[2]*a*w/2]);
 return this.poly(mat,P,n,{uvs:[[u0,v0],[u0+ru,v0],[u0+ru,v0+rv],[u0,v0+rv]]})};
Bau.prototype.schild=function(dir,cx,cy,cz,row,w){w=w||.6;const n=[[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]][dir];this.box('Stahl_Verzinkt',cx-n[0]*.005,cy-.06,cz-n[2]*.005,dir%2?w+.04:.02,.12,dir%2?.02:w+.04);return this.wand('Schilder',dir,cx+n[0]*.008,cy,cz+n[2]*.008,w,w/6,.375,.0625,.3125,row*.0625)};
Bau.prototype.fenster=function(dir,cx,cy,cz,w,h){const n=[[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]][dir];this.wand('Sprossenfenster',dir,cx+n[0]*.012,cy,cz+n[2]*.012,w,h,Math.max(1,Math.round(w/.14))/4,Math.max(1,Math.round(h/.14))/4);
 const q=dir%2?[w+.06,.04,.05]:[.05,.04,w+.06];this.box('Beton_Hell',cx+n[0]*.02,cy-h/2-.04,cz+n[2]*.02,q[0],q[1],q[2]);return this};
// Satteldach, First entlang z (ax='z') oder x; first: 0..1 Lage des Firsts (0 = Shed mit senkrechter Seite)
Bau.prototype.dach=function(mR,mG,a0,a1,y,h,b0,b1,o){o=o||{};const f=o.first===undefined?.5:o.first,am=a0+(a1-a0)*f,ue=o.ue||0,X=o.ax==='x',P=(a,yy,b)=>X?[b,yy,a]:[a,yy,b],hang=X?'z':'x';
 const lo=(a,ya,top)=>{/* Traufe mit Überstand */const t=ue/Math.max(.001,Math.abs(top-a));return[a+(a-top)*t,ya-h*t]};
 if(f<1){const[e,ey]=lo(a1,y,am);this.poly(mR,[P(am,y+h,b0-ue),P(e,ey,b0-ue),P(e,ey,b1+ue),P(am,y+h,b1+ue)],[0,1,0],{hang,rot:o.rot})}
 if(f>0){const[e,ey]=lo(a0,y,am);this.poly(mR,[P(am,y+h,b0-ue),P(e,ey,b0-ue),P(e,ey,b1+ue),P(am,y+h,b1+ue)],[0,1,0],{hang,rot:o.rot})}
 if(mG){this.poly(mG,[P(a0,y,b0),P(a1,y,b0),P(am,y+h,b0)],X?[-1,0,0]:[0,0,-1]);this.poly(mG,[P(a0,y,b1),P(a1,y,b1),P(am,y+h,b1)],X?[1,0,0]:[0,0,1])}return this};
Bau.prototype.gelaender=function(mat,x0,z0,x1,z1,y,h){h=h||.22;const l=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(l/.3));for(let i=0;i<=n;i++){const t=i/n;this.box(mat,x0+(x1-x0)*t,y,z0+(z1-z0)*t,.02,h,.02)}this.rohr(mat,[x0,y+h,z0],[x1,y+h,z1],.013,{seg:5});this.rohr(mat,[x0,y+h*.5,z0],[x1,y+h*.5,z1],.01,{seg:5});return this};
Bau.prototype.teile=function(spin,piv){const r=[];for(const m in this.P){const d=this.P[m],g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(d.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(d.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(d.u,2));g.computeBoundingSphere();r.push(spin?{g,m,spin:1,piv}:{g,m,piv:null})}return r};
function nbFertig(k,b,spin,piv){const alt=(MODELS[k]||[]).filter(q=>q.m==='BandStill'||q.m==='Rahmen');MODELS[k]=[...alt,...b.teile(),...(spin?spin.teile(true,piv):[])]}
function nbLuefter(r,mat){const b=new Bau();for(let i=0;i<5;i++){const a=i*1.2566;b.add(mat||'Lack_Dunkel',new T.BoxGeometry(r*.85,.012,r*.3),nbM(Math.cos(a)*r*.5,0,Math.sin(a)*r*.5,.35,-a,0))}b.cyl(mat||'Lack_Dunkel',0,-.02,0,r*.18,.05,{seg:8});return b}
// Wiederkehrende Details
Bau.prototype.schaltschrank=function(x,z,dir){this.box('Lack_Gelb',x,.1,z,dir%2?.4:.2,.46,dir%2?.2:.4);this.box('Warnstreifen',x,.56,z,dir%2?.42:.22,.06,dir%2?.22:.42);return this};
Bau.prototype.fallrohr=function(x,z,y0,y1){this.rohr('Stahl_Verzinkt',[x,y0,z],[x,y1,z],.03,{seg:6});return this};
Bau.prototype.klima=function(x,y,z,w,d){this.box('Lack_Grau',x,y,z,w,.22,d);this.cyl('Lack_Dunkel',x,y+.22,z,Math.min(w,d)*.36,.03,{seg:14});this.box('Stahl_Verzinkt',x,y,z,w+.04,.03,d+.04);return this};
const NBA={};// Ankerpunkte für Lampen, Dampf, Rauch
/* --- Fertiger: Backstein-Werkstatt mit Sheddach --- */
(function(){const b=new Bau(),x0=-1.36,x1=1.14,zd=1.3,wh=1.45;
 b.box('Beton',0,0,0,2.96,.1,2.96);b.box('Beton_Hell',(x0+x1)/2,.1,0,x1-x0+.06,.2,zd*2+.06);b.box('Ziegel2',(x0+x1)/2,.3,0,x1-x0,wh-.2,zd*2);b.box('Beton_Hell',(x0+x1)/2,.1+wh,0,x1-x0+.07,.07,zd*2+.07);
 for(const x of[x0,x0+.833,x0+1.667,x1])for(const z of[-zd,zd])b.box('Ziegel2',x,.3,z,.14,wh-.2,.1);
 const tw=(x1-x0)/3,ry=.17+wh;for(let i=0;i<3;i++){const a=x0+i*tw,c=a+tw;b.poly('Blechdach',[[a,ry+.52,-zd-.04],[c,ry,-zd-.04],[c,ry,zd+.04],[a,ry+.52,zd+.04]],[0,1,0],{hang:'x'});
  b.wand('Verglasung',2,a,ry+.28,0,zd*2-.08,.42,5,1);b.box('Stahl_Verzinkt',a,ry,0,.04,.07,zd*2+.08);b.box('Stahl_Verzinkt',a,ry+.5,0,.05,.04,zd*2+.1);
  b.poly('Ziegel2',[[a,ry,-zd],[c,ry,-zd],[a,ry+.52,-zd]],[0,0,-1]);b.poly('Ziegel2',[[a,ry,zd],[c,ry,zd],[a,ry+.52,zd]],[0,0,1])}
 for(const z of[-.8,0,.8]){b.fenster(2,x0,.95,z,.5,.7)}for(const s of[-1,1])for(const x of[-.94,-.11,.72])b.fenster(s>0?1:3,x,.95,s*zd,.52,.7);
 b.wand('Sektionaltor',0,x1+.012,.72,.74,.9,.86);b.box('Stahl_Verzinkt',x1+.02,1.17,.74,.05,.05,1);b.fenster(0,x1,1.0,-.82,.5,.6);
 b.box('Lack_Dunkel',x1+.1,.22,0,.22,.36,.62);b.schild(0,x1+.013,1.38,.74,15);
 b.box('Lack_Grau',.3,ry-.02,-.62,.46,.62,.46);b.box('Stahl_Verzinkt',.3,ry+.6,-.62,.52,.04,.52);b.cyl('Lack_Grau',.3,ry+.64,-.62,.2,.08,{seg:14});
 b.rohr('Stahl_Verzinkt',[-1.18,.3,zd+.1],[-1.18,2.45,zd+.1],.065);b.cyl('Stahl_Verzinkt',-1.18,2.45,zd+.1,.1,.05,{r2:.02});b.box('Lack_Grau',-1.18,.1,zd+.1,.24,.3,.16);
 b.fallrohr(x1-.08,-zd-.05,.12,ry);b.fallrohr(x0+tw,zd+.05,.12,ry);b.schaltschrank(1.34,-.62,0);
 b.box('Holz',1.32,.1,1.25,.26,.2,.26);b.box('Holz',1.32,.3,1.22,.2,.16,.2);
 nbFertig('fertiger',b,nbLuefter(.2),[.3,ry+.75,-.62]);NBA.fertiger={lampe:[x1-.1,ry+.12,zd-.1],rl:[x1,wh+.2,-zd],dampf:[-1.18,2.5,zd+.1]}})();
/* --- Montagewerk: helle Halle mit gelbem Stahlskelett und Oberlichtern --- */
(function(){const b=new Bau(),x0=-1.34,x1=1.14,zd=1.24,wh=1.75;
 b.box('Beton',0,0,0,2.96,.1,2.96);b.box('Beton',(x0+x1)/2,.1,0,x1-x0+.04,.34,zd*2+.04);b.box('Blech_Hell',(x0+x1)/2,.44,0,x1-x0,wh-.34,zd*2);b.box('Lack_Gelb',(x0+x1)/2,1.3,0,x1-x0+.02,.1,zd*2+.02);
 b.box('Dach',(x0+x1)/2,.1+wh,0,x1-x0+.1,.06,zd*2+.1);b.box('Stahl_Verzinkt',(x0+x1)/2,.16+wh,0,x1-x0+.12,.03,zd*2+.12);
 for(const x of[x0+.05,x0+.87,x0+1.69,x1-.05]){for(const s of[-1,1])b.box('Lack_Gelb',x,.1,s*(zd+.09),.09,wh+.22,.09);b.box('Lack_Gelb',x,wh+.25,0,.09,.09,zd*2+.27)}
 for(const s of[-1,1]){b.rohr('Lack_Gelb',[x0+.05,.2,s*(zd+.09)],[x0+.87,wh,s*(zd+.09)],.022,{seg:5});b.rohr('Lack_Gelb',[x1-.05,.2,s*(zd+.09)],[x0+1.69,wh,s*(zd+.09)],.022,{seg:5})}
 for(const z of[-.6,.6]){b.dach('Verglasung','Stahl_Verzinkt',z-.17,z+.17,.19+wh,.17,x0+.25,x1-.25,{ax:'x'});b.box('Stahl_Verzinkt',(x0+x1)/2,.19+wh,z,x1-x0-.46,.02,.38)}
 for(const s of[-1,1])b.wand('Verglasung',s>0?1:3,(x0+x1)/2,.92,s*(zd+.012),x1-x0-.5,.42,5,1);
 b.wand('Sektionaltor',0,x1+.012,.86,.66,1.1,1.14);b.box('Lack_Gelb',x1+.02,1.46,.66,.05,.06,1.24);b.box('Lack_Dunkel',x1+.1,.22,0,.22,.36,.62);b.schild(0,x1+.013,1.6,-.6,14);
 b.klima(-.75,.19+wh,0,.5,.34);b.klima(.55,.19+wh,0,.4,.3);b.box('Lack_Grau',-.1,.19+wh,0,.36,.1,.36);b.cyl('Lack_Grau',-.1,.29+wh,0,.17,.1,{seg:14});
 b.rohr('Stahl_Verzinkt',[-.75,.32+wh,.17],[-.75,.32+wh,.42],.05);b.rohr('Stahl_Verzinkt',[x0-.07,.3,-.7],[x0-.07,wh+.5,-.7],.06);b.cyl('Stahl_Verzinkt',x0-.07,wh+.5,-.7,.09,.05,{r2:.02});
 b.schaltschrank(1.34,-.62,0);b.box('Lack_Blau',1.3,.1,1.2,.3,.3,.3);b.cyl('Lack_Rot',1.33,.1,-1.25,.09,.3);b.cyl('Lack_Rot',1.14,.1,-1.3,.09,.3);
 nbFertig('montagewerk',b,nbLuefter(.16),[-.1,wh+.42,0]);NBA.montagewerk={lampe:[x1-.15,wh+.3,zd-.3],rl:[x1-.05,wh+.36,-zd-.09],dampf:[x0-.07,wh+.56,-.7]}})();
/* --- Präzisionswerk: Reinraum-Gebäude mit Fensterband und Kühltechnik --- */
(function(){const b=new Bau(),x0=-1.36,x1=1.14,zd=1.3,wh=1.5;
 b.box('Beton',0,0,0,2.96,.1,2.96);b.box('Beton_Hell',(x0+x1)/2,.1,0,x1-x0+.04,.16,zd*2+.04);b.box('Paneel',(x0+x1)/2,.26,0,x1-x0,wh-.16,zd*2);b.box('Paneel_Blau',(x0+x1)/2,1.28,0,x1-x0+.015,.2,zd*2+.015);
 for(const s of[-1,1]){b.wand('Verglasung',s>0?1:3,(x0+x1)/2,.86,s*(zd+.012),x1-x0-.3,.4,6,1);b.box('Stahl_Verzinkt',(x0+x1)/2,.63,s*(zd+.02),x1-x0-.26,.03,.04);b.box('Stahl_Verzinkt',(x0+x1)/2,1.06,s*(zd+.02),x1-x0-.26,.03,.04)}
 b.wand('Verglasung',2,x0-.012,.86,0,zd*2-.3,.4,6,1);b.box('Paneel',(x0+x1)/2,.1+wh,0,x1-x0+.08,.12,zd*2+.08);b.box('Dach',(x0+x1)/2,.2+wh,0,x1-x0-.04,.03,zd*2-.04);
 const ry=.23+wh;b.box('Paneel',-.55,ry,-.5,1.0,.42,1.0);b.box('Paneel_Blau',-.55,ry+.42,-.5,1.04,.05,1.04);b.klima(-.55,ry+.47,-.5,.56,.56);
 for(const z of[.35,.85]){b.box('Lack_Grau',.5,ry,z,.7,.26,.34);for(let i=0;i<6;i++)b.box('Stahl_Verzinkt',.2+i*.12,ry+.03,z,.02,.2,.37);b.cyl('Lack_Dunkel',.5,ry+.26,z,.13,.025,{seg:12})}
 b.rohr('Stahl_Verzinkt',[-.05,ry+.2,-.5],[.5,ry+.2,-.5],.07);b.rohr('Stahl_Verzinkt',[.5,ry+.2,-.5],[.5,ry+.2,.15],.07);b.kugel('Stahl_Verzinkt',.5,ry+.2,-.5,.085);
 b.rohr('Lack_Blau',[-1.0,ry,.6],[-1.0,ry+.3,.6],.035);b.rohr('Lack_Blau',[-1.0,ry+.3,.6],[.15,ry+.3,.6],.035);
 b.kugel('Lack_Weiss',-.9,ry+.0,1.0,.2,{halb:true});b.rohr('Stahl_Verzinkt',[.95,ry,-1.1],[.95,ry+.8,-1.1],.012,{seg:5});b.rohr('Stahl_Verzinkt',[.83,ry+.6,-1.1],[1.07,ry+.6,-1.1],.008,{seg:5});
 b.wand('Sektionaltor',0,x1+.012,.6,.8,.66,.82);b.box('Paneel_Blau',x1+.06,1.06,.8,.14,.04,.9);b.box('Lack_Dunkel',x1+.1,.22,0,.22,.36,.62);b.wand('Verglasung',0,x1+.012,.86,-.75,.7,.4,2,1);b.schild(0,x1+.013,1.44,0,13);
 b.box('Lack_Grau',x0-.06,.1,-.9,.1,.9,.5);b.rohr('Stahl_Verzinkt',[x0-.06,1.0,-.9],[x0-.06,ry+.3,-.9],.05);b.schaltschrank(1.34,-.62,0);
 b.cyl('Lack_Weiss',1.3,.1,1.2,.13,.62,{seg:12});b.kugel('Lack_Weiss',1.3,.72,1.2,.13,{halb:true});b.cyl('Lack_Weiss',1.3,.1,.88,.13,.62,{seg:12});b.kugel('Lack_Weiss',1.3,.72,.88,.13,{halb:true});
 nbFertig('praezision',b,nbLuefter(.19),[-.55,ry+.72,-.5]);NBA.praezision={lampe:[x1-.15,ry+.02,-zd+.2],rl:[x1-.1,ry,zd-.1],dampf:[x0-.06,ry+.36,-.9]}})();
/* --- Recycler: Schrottanlage mit Schrägband, Aufgabetrichter und Schredder --- */
(function(){const b=new Bau(),x0=-1.34,x1=1.14,zc=-.45,zd=.85,wh=1.3;
 b.box('Beton',0,0,0,2.96,.1,2.96);b.box('Beton',(x0+x1)/2,.1,zc,x1-x0+.04,.3,zd*2+.04);b.box('Blech_Dunkel',(x0+x1)/2,.4,zc,x1-x0,wh-.3,zd*2);b.box('Lack_Rot',(x0+x1)/2,wh+.02,zc,x1-x0+.03,.1,zd*2+.03);
 b.dach('Blechdach','Blech_Dunkel',zc-zd,zc+zd,.1+wh,.4,x0,x1,{ax:'x',ue:.06});
 // Schredder mit Aufgabetrichter
 const tx=-.8,tz=1.0,ty=1.15;b.box('Lack_Rot',tx,.1,tz,.62,.74,.62);b.box('Lack_Dunkel',tx,.84,tz,.5,.31,.5);b.cyl('Lack_Grau',tx-.42,.5,tz,.16,.3,{rz:Math.PI/2,seg:12});b.cyl('Lack_Dunkel',tx,.5,tz+.34,.2,.06,{rx:Math.PI/2,seg:14});
 for(const[dx,dz,o]of[[1,0,[1,0,0]],[-1,0,[-1,0,0]],[0,1,[0,0,1]],[0,-1,[0,0,-1]]]){const t=dx?[[tx+dx*.5,ty+.5,tz-.5],[tx+dx*.5,ty+.5,tz+.5],[tx+dx*.25,ty,tz+.25],[tx+dx*.25,ty,tz-.25]]:[[tx-.5,ty+.5,tz+dz*.5],[tx+.5,ty+.5,tz+dz*.5],[tx+.25,ty,tz+dz*.25],[tx-.25,ty,tz+dz*.25]];b.poly('Rost',t,o);b.poly('Rost',t,[-o[0],.01,-o[2]])}
 for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])b.rohr('Lack_Rot',[tx+dx*.48,ty+.5,tz+dz*.48],[tx+dx*.4,.1,tz+dz*.4],.022,{seg:5});
 for(let i=0;i<8;i++)b.add(i%3?'Rost':'Stahl_Verzinkt',new T.BoxGeometry(.12+((i*7)%4)*.04,.05+((i*3)%3)*.03,.12),nbM(tx+((i*17)%7-3)*.07,ty+.36+((i*5)%3)*.03,tz+((i*11)%5-2)*.07,i*.7,i*1.3,i*.4));
 // Schrägband vom Hof zum Trichter
 const a=Math.atan2(1.35,1.5),L=Math.hypot(1.35,1.5);b.add('Lack_Grau',new T.BoxGeometry(L,.06,.4),nbM(.35,1.12,tz,0,0,-a));b.add('BandStill',new T.BoxGeometry(L-.04,.02,.3),nbM(.36,1.16,tz,0,0,-a),{s:3});
 for(const[x,y]of[[.1,1.3],[.75,.72]])for(const s of[-1,1])b.rohr('Lack_Rot',[x,.1,tz+s*.2],[x,y,tz+s*.2],.025,{seg:5});b.box('Lack_Grau',1.12,.1,tz,.3,.34,.5);
 // Abluft: Rohr vom Schredder aufs Dach, Filter mit Kamin
 b.rohr('Stahl_Verzinkt',[tx-.2,.9,tz-.3],[tx-.2,.9,zc+zd-.2],.07);b.rohr('Stahl_Verzinkt',[tx-.2,.9,zc+zd-.25],[tx-.2,wh+.5,zc+zd-.25],.07);
 b.box('Lack_Grau',-.6,wh+.3,zc,.6,.42,.5);b.cyl('Stahl_Verzinkt',-.6,wh+.72,zc,.1,.6,{seg:10});b.cyl('Stahl_Verzinkt',-.6,wh+1.32,zc,.14,.05,{r2:.03,seg:10});
 b.box('Lack_Grau',.45,wh+.36,zc,.42,.3,.42);b.cyl('Lack_Grau',.45,wh+.66,zc,.18,.07,{seg:14});
 b.wand('Sektionaltor',0,x1+.012,.66,-.82,.8,.92);b.box('Lack_Dunkel',x1+.1,.22,0,.22,.36,.62);b.box('Lack_Rot',x1+.02,1.14,-.82,.05,.05,.9);b.schild(0,x1+.013,1.3,-.2,2,.5);
 for(const x of[-.85,-.1,.65])b.fenster(3,x,.95,zc-zd,.5,.44);b.fenster(2,x0,.95,zc,.9,.44);
 // Schrottcontainer
 b.box('Blech_Blau',.3,.1,.62,.6,.3,.3);b.box('Rost',.3,.4,.62,.56,.03,.26);
 b.schaltschrank(1.34,-1.2,0);
 nbFertig('recycler',b,nbLuefter(.17),[.45,wh+.76,zc]);NBA.recycler={lampe:[x1-.1,wh+.3,zc+zd-.2],rl:[x1-.02,wh+.14,zc-zd+.1],dampf:[-.6,wh+1.4,zc]}})();
/* --- Ofen: gemauerter Hochofen mit Gichtbühne und Schornstein --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,1.96,.1,1.96);
 b.box('Ziegel_Dunkel',-.12,.1,-.1,1.24,.72,1.24);b.box('Beton_Hell',-.12,.82,-.1,1.3,.06,1.3);for(const[x,z]of[[-.74,-.72],[.5,-.72],[-.74,.52],[.5,.52]])b.box('Ziegel_Dunkel',x,.1,z,.12,.72,.12);
 // Abstich mit Glut
 b.box('Lack_Dunkel',.52,.16,.2,.06,.5,.56);b.wand('Glut',0,.555,.4,.2,.4,.34);b.box('Stahl_Verzinkt',.56,.6,.2,.04,.05,.5);b.box('Rost',.78,.1,.2,.42,.07,.16);b.box('Glut',.78,.165,.2,.4,.012,.09);
 // Schacht
 b.lathe('Ziegel2',-.12,.88,-.1,[[.5,0],[.56,.35],[.4,1.25],[.4,1.4]],{seg:20});for(const y of[.95,1.23,1.9,2.2]){const t=y-.88,r=t<.35?.5+t/.35*.06:t<1.25?.56-(t-.35)/.9*.16:.4;b.cyl('Stahl_Verzinkt',-.12,y-.02,-.1,r+.012,.045,{seg:20,open:true})}
 b.lathe('Lack_Dunkel',-.12,2.28,-.1,[[.42,0],[.42,.08],[.16,.36],[.16,.5]],{seg:16});b.cyl('Lack_Dunkel',-.12,2.78,-.1,.2,.04,{seg:12});
 // Gichtbühne
 b.cyl('Stahl_Verzinkt',-.12,1.62,-.1,.78,.03,{seg:8});b.cyl('Lack_Dunkel',-.12,1.6,-.1,.8,.02,{seg:8,open:true});for(let i=0;i<8;i++){const a=i*.7854+.39,a2=a+.7854;b.gelaender('Lack_Gelb',-.12+Math.cos(a)*.76,-.1+Math.sin(a)*.76,-.12+Math.cos(a2)*.76,-.1+Math.sin(a2)*.76,1.65,.2)}
 for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])b.rohr('Lack_Dunkel',[-.12+dx*.52,.88,-.1+dz*.52],[-.12+dx*.52,1.62,-.1+dz*.52],.025,{seg:5});
 // Gasabzug zum Staubsack
 b.rohr('Rost',[-.12,2.6,-.1],[-.12,2.6,.62],.07);b.kugel('Rost',-.12,2.6,.62,.08);b.rohr('Rost',[-.12,2.6,.62],[-.12,1.25,.62],.07);b.lathe('Rost',-.12,.5,.62,[[.04,0],[.2,.3],[.2,.75],[.07,.85]],{seg:12});b.rohr('Lack_Dunkel',[-.12,.1,.62],[-.12,.5,.62],.03);
 // Schornstein
 const sx=-.7,sz=.7;b.box('Ziegel_Dunkel',sx,.1,sz,.4,.3,.4);b.lathe('Ziegel2',sx,.4,sz,[[.17,0],[.115,2.85]],{seg:14});b.cyl('Beton_Hell',sx,3.25,sz,.135,.08,{seg:14});b.cyl('Stahl_Verzinkt',sx,1.6,sz,.155,.04,{seg:14,open:true});b.cyl('Stahl_Verzinkt',sx,2.5,sz,.137,.04,{seg:14,open:true});
 // Winderhitzer-Leitung und Kleinkram
 b.rohr('Stahl_Verzinkt',[.5,.45,-.6],[.5,1.0,-.6],.06);b.rohr('Stahl_Verzinkt',[.5,1.0,-.6],[.2,1.0,-.45],.06);b.kugel('Stahl_Verzinkt',.5,1.0,-.6,.07);b.box('Lack_Blau',.62,.1,-.66,.3,.36,.3);
 b.box('Kohle',.7,.1,.74,.36,.12,.36);for(let i=0;i<6;i++)b.add('Kohle',new T.IcosahedronGeometry(.07,0),nbM(.6+((i*13)%5)*.05,.24+(i%2)*.04,.64+((i*7)%5)*.05,i,i,i));
 nbFertig('ofen',b);NBA.ofen={lampe:[.52,.95,-.72],rauch:[sx,3.36,sz],glut:[.7,.42,.2]}})();
/* --- Lagerkiste: Lagerschuppen mit Rolltor, Paletten und Fässern --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,1.96,.08,1.96);
 b.box('Beton_Hell',-.14,.08,.12,1.5,.12,1.36);b.box('Blech_Gruen',-.14,.2,.12,1.46,.72,1.32);b.dach('Blechdach','Blech_Gruen',-.54,.78,.92,.34,-.87,.59,{ax:'x',ue:.07});
 b.box('Stahl_Verzinkt',-.14,1.25,.12,1.62,.03,.06);b.wand('Sektionaltor',0,.602,.5,.3,.7,.6);b.box('Lack_Gelb',.61,.82,.3,.04,.05,.8);b.schild(0,.603,1.0,.12,2,.5);
 b.box('Lack_Dunkel',.68,.2,-.5,.2,.34,.6);b.box('Blech_Gruen',.3,.08,-.72,.56,.56,.36);b.box('Blechdach',.3,.64,-.72,.62,.03,.42);
 for(const z of[-.3,.5])b.fenster(2,-.87,.62,z-.0,.36,.3);b.fenster(1,-.2,.62,.78,.5,.3);
 // Paletten mit Kisten, Fässer
 for(const[x,z,n]of[[.8,.82,2],[.36,.86,1]]){b.box('Holz',x,.08,z,.34,.04,.3);for(let i=0;i<n;i++)b.box('Holz',x,.12+i*.22,z,.3-(i*.04),.22,.26,{ry:i*.2})}
 for(const[x,z]of[[-.72,-.78],[-.52,-.8],[-.62,-.62]])b.cyl('Lack_Blau',x,.08,z,.085,.26,{seg:10});b.cyl('Lack_Rot',-.3,.08,-.76,.085,.26,{seg:10});
 b.fallrohr(.55,.8,.1,.9);nbFertig('lagerkiste',b);NBA.lagerkiste={lampe:[.5,1.0,-.3]}})();
/* --- Generator: Dampfkessel mit Kohlebunker und Dynamo --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,1.96,.1,1.96);
 for(const z of[-.22,.22])b.box('Lack_Dunkel',-.1,.1,z-.05,1.5,.1,.08);
 // Feuerbüchse und Kessel
 b.box('Ziegel_Dunkel',-.62,.2,-.05,.42,.62,.62);b.wand('Glut',2,-.835,.42,-.05,.26,.22);b.box('Lack_Dunkel',-.84,.26,-.05,.03,.4,.4);
 b.cyl('Lack_Dunkel',-.02,.55,-.05,.3,.86,{rz:Math.PI/2,seg:18});b.kugel('Lack_Dunkel',.41,.55,-.05,.3,{seg:14});for(const x of[-.3,-.02,.26])b.cyl('Kupfer',x,.55,-.05,.308,.035,{rz:Math.PI/2,seg:18,open:true});
 b.kugel('Kupfer',.05,.84,-.05,.12);b.cyl('Kupfer',.05,.8,-.05,.12,.05,{seg:12});b.rohr('Kupfer',[.05,.95,-.05],[.05,1.05,-.05],.02,{seg:6});b.rohr('Kupfer',[.05,1.05,-.05],[.62,1.05,-.05],.02,{seg:6});b.rohr('Kupfer',[.62,1.05,-.05],[.62,.7,-.05],.02,{seg:6});
 // Schornstein
 b.cyl('Lack_Dunkel',-.62,.82,-.05,.11,.95,{r2:.085,seg:12});b.cyl('Stahl_Verzinkt',-.62,1.74,-.05,.11,.05,{seg:12});b.cyl('Stahl_Verzinkt',-.62,1.2,-.05,.105,.03,{seg:12,open:true});
 // Dynamo
 b.box('Lack_Dunkel',.68,.2,-.05,.4,.08,.5);b.cyl('Lack_Blau',.68,.5,-.05,.21,.36,{rx:Math.PI/2,seg:16});b.cyl('Kupfer',.68,.5,-.05,.215,.1,{rx:Math.PI/2,seg:16,open:true});b.cyl('Lack_Dunkel',.68,.5,.19,.26,.05,{rx:Math.PI/2,seg:16});b.box('Lack_Blau',.68,.28,-.05,.3,.1,.34);
 // Kohlebunker
 b.box('Rost',-.45,.1,-.72,.8,.36,.36);b.box('Kohle',-.45,.46,-.72,.74,.03,.3);for(let i=0;i<8;i++)b.add('Kohle',new T.IcosahedronGeometry(.07+(i%3)*.012,0),nbM(-.75+i*.09,.5+((i*7)%3)*.025,-.72+((i*11)%5-2)*.04,i,i*2,i));
 b.add('Rost',new T.BoxGeometry(.2,.03,.5),nbM(-.62,.52,-.42,.55,0,0));
 // Kühler mit Lüfter, Schaltschrank, Wassertank
 b.box('Lack_Grau',.62,.1,.66,.5,.5,.42);for(let i=0;i<7;i++)b.box('Stahl_Verzinkt',.41+i*.07,.14,.66,.015,.42,.44);b.cyl('Lack_Dunkel',.62,.6,.66,.19,.04,{seg:14,open:true});
 b.cyl('Stahl_Verzinkt',-.45,.36,.66,.2,.7,{rz:Math.PI/2,seg:14});for(const x of[-.7,-.2])b.box('Lack_Dunkel',x,.1,.66,.06,.2,.36);b.rohr('Stahl_Verzinkt',[-.45,.56,.66],[-.45,.72,.66],.025,{seg:6});b.rohr('Stahl_Verzinkt',[-.45,.72,.66],[-.45,.72,.2],.025,{seg:6});
 b.box('Lack_Gelb',.72,.1,-.72,.3,.5,.24);b.box('Warnstreifen',.72,.6,-.72,.32,.05,.26);
 nbFertig('generator',b,nbLuefter(.17),[.62,.63,.66]);NBA.generator={lampe:[.72,.72,-.72],rauch:[-.62,1.82,-.05],glut:[-.9,.42,-.05]}})();
/* --- Kraftwerk: Kesselhaus, Maschinenhalle, Kühlturm und Schornstein --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,2.96,.1,2.96);
 // Kesselhaus
 const kx=-.78,kz=-.55;b.box('Beton_Hell',kx,.1,kz,1.16,.2,1.66);b.box('Ziegel2',kx,.3,kz,1.1,1.9,1.6);b.box('Beton_Hell',kx,2.2,kz,1.18,.08,1.68);b.box('Ziegel2',kx,2.28,kz,1.1,.12,1.6);b.box('Dach',kx,2.3,kz,1.0,.08,1.5);
 for(const z of[-1.0,-.1]){b.fenster(2,kx-.55,1.2,kz+ (z+.55),.44,1.3);b.fenster(0,kx+.55,1.35,kz+(z+.55),.44,1.0)}b.fenster(3,kx,1.2,kz-.8,.6,1.3);
 for(const[x,z]of[[kx-.55,kz-.8],[kx+.55,kz-.8],[kx-.55,kz+.8],[kx+.55,kz+.8],[kx-.55,kz],[kx+.55,kz]])b.box('Ziegel2',x,.3,z,.14,1.9,.14);
 b.box('Lack_Grau',kx-.2,2.38,kz-.3,.4,.2,.4);b.cyl('Lack_Dunkel',kx-.2,2.58,kz-.3,.15,.03,{seg:12});b.box('Lack_Grau',kx+.2,2.38,kz+.35,.3,.14,.5);
 // Maschinenhalle
 const mz=.82;b.box('Beton_Hell',kx,.1,mz,1.16,.16,1.0);b.box('Blech_Hell',kx,.26,mz,1.1,.9,.94);b.dach('Blechdach','Blech_Hell',mz-.47,mz+.47,1.16,.3,kx-.55,kx+.55,{ax:'x',ue:.05});b.box('Stahl_Verzinkt',kx,1.44,mz,1.0,.08,.16);
 b.wand('Verglasung',1,kx,.8,mz+.482,.9,.36,4,1);b.wand('Sektionaltor',0,kx+.562,.56,mz,.6,.6);
 // Kühlturm
 const tx=.72,tz=.66;b.lathe('Beton',tx,.1,tz,[[.66,0],[.56,.5],[.45,1.3],[.42,1.75],[.45,2.2],[.5,2.55]],{seg:28});b.cyl('Beton_Hell',tx,2.65,tz,.5,.04,{seg:28,open:true});b.cyl('Lack_Dunkel',tx,2.5,tz,.47,.02,{seg:20});
 for(let i=0;i<12;i++){const a=i*.5236;b.rohr('Beton_Hell',[tx+Math.cos(a)*.7,.1,tz+Math.sin(a)*.7],[tx+Math.cos(a+.26)*.63,.42,tz+Math.sin(a+.26)*.63],.022,{seg:5})}
 // Schornstein rot-weiß
 const sx=.5,sz=-.95;b.cyl('Beton',sx,.1,sz,.24,.3,{seg:14});let y=.4,r=.17;for(let i=0;i<8;i++){const h=.42,r2=r-.011;b.cyl(i%2?'Lack_Weiss':'Lack_Rot',sx,y,sz,r,h,{r2,seg:14});y+=h;r=r2}b.cyl('Lack_Dunkel',sx,y,sz,r+.015,.05,{seg:14});
 b.gelaender('Stahl_Verzinkt',sx-.2,sz-.2,sx+.2,sz-.2,2.9,.14);b.cyl('Stahl_Verzinkt',sx,2.88,sz,.22,.02,{seg:10});
 // Rauchgaskanal, Rohrbrücke, Kohleband
 b.rohr('Rost',[kx+.55,1.7,-.95],[sx-.1,1.7,-.95],.1);b.rohr('Stahl_Verzinkt',[kx+.55,.9,.5],[tx-.5,.9,.5],.06);b.rohr('Stahl_Verzinkt',[kx+.55,.7,.72],[tx-.56,.7,.72],.06);for(const x of[-.05,.1])b.box('Lack_Dunkel',x,.1,.61,.04,.82,.3);
 b.add('Lack_Grau',new T.BoxGeometry(1.5,.06,.26),nbM(.5,.95,-.28,0,0,-.62));b.add('BandStill',new T.BoxGeometry(1.46,.02,.2),nbM(.5,.99,-.28,0,0,-.62));for(const[x,y]of[[.3,1.06],[.8,.7]])b.rohr('Lack_Dunkel',[x,.1,-.28],[x,y,-.28],.025,{seg:5});
 b.box('Rost',1.22,.1,-.28,.34,.3,.4);for(let i=0;i<6;i++)b.add('Kohle',new T.IcosahedronGeometry(.07,0),nbM(1.12+((i*13)%5)*.05,.42+(i%2)*.03,-.38+((i*7)%5)*.05,i,i,i));
 // Trafo
 b.box('Lack_Grau',1.2,.1,-1.2,.4,.4,.4);for(let i=0;i<5;i++)b.box('Stahl_Verzinkt',1.04+i*.08,.14,-1.2,.015,.3,.46);for(const z of[-1.3,-1.2,-1.1])b.cyl('Lack_Weiss',1.2,.5,z,.025,.14,{seg:6});
 nbFertig('kraftwerk',b);NBA.kraftwerk={lampe:[kx+.4,2.42,kz+.6],dampf:[tx,2.7,tz],rauch:[sx,3.85,sz],licht:[sx,3.86,sz]}})();
/* --- Elektroofen: Lichtbogenofen mit Elektrodenportal und Trafo --- */
(function(){const b=new Bau(),x0=-1.36,x1=.2,zd=1.3,wh=1.6;
 b.box('Beton',0,0,0,2.96,.1,2.96);b.box('Beton',(x0+x1)/2,.1,0,x1-x0+.04,.3,zd*2+.04);b.box('Blech_Dunkel',(x0+x1)/2,.4,0,x1-x0,wh-.3,zd*2);
 b.dach('Blechdach','Blech_Dunkel',x0,x1,.1+wh,.42,-zd,zd,{ue:.05});b.box('Blech_Dunkel',(x0+x1)/2,wh+.42,0,.36,.2,zd*2-.3);b.dach('Blechdach','Blech_Dunkel',(x0+x1)/2-.22,(x0+x1)/2+.22,wh+.62,.1,-zd+.12,zd-.12);
 b.wand('Lack_Dunkel',0,x1+.012,.8,.5,1.1,1.3);b.box('Lack_Gelb',x1+.02,1.48,.5,.06,.07,1.2);for(const s of[-1,1])b.wand('Verglasung',s>0?1:3,(x0+x1)/2,1.25,s*(zd+.012),1.2,.3,4,1);
 // Ofengefäß
 const ox=.78,oz=.5;b.lathe('Rost',ox,.3,oz,[[.25,0],[.42,.12],[.46,.5],[.42,.56]],{seg:20});b.cyl('Glut_Hell',ox,.8,oz,.36,.02,{seg:20});b.cyl('Lack_Dunkel',ox,.84,oz,.44,.06,{seg:20,open:true});
 for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])b.box('Lack_Dunkel',ox+dx*.3,.1,oz+dz*.3,.1,.26,.1);b.add('Rost',new T.BoxGeometry(.3,.06,.16),nbM(ox+.5,.52,oz,0,0,-.3));b.add('Glut',new T.BoxGeometry(.28,.012,.09),nbM(ox+.5,.555,oz,0,0,-.3));
 // Elektroden und Portal
 for(const[dx,dz]of[[0,-.14],[.12,.07],[-.12,.07]]){b.cyl('Lack_Dunkel',ox+dx,.86,oz+dz,.045,.9,{seg:8});b.cyl('Kupfer',ox+dx,1.7,oz+dz,.06,.08,{seg:8})}
 b.box('Lack_Gelb',ox-.56,.1,oz,.14,1.9,.14);b.box('Lack_Gelb',ox-.25,1.82,oz,.8,.1,.12);b.box('Lack_Gelb',ox,1.76,oz,.36,.06,.36);b.rohr('Lack_Gelb',[ox-.56,1.3,oz],[ox-.2,1.82,oz],.03,{seg:5});
 for(const dz of[-.1,0,.1])b.rohr('Kupfer',[ox-.5,1.95,oz+dz],[ox-.5,1.95,-.6+dz],.022,{seg:6});
 // Trafo
 b.box('Lack_Grau',.72,.1,-.72,.66,.72,.56);for(let i=0;i<8;i++)b.box('Stahl_Verzinkt',.43+i*.083,.16,-.72,.016,.56,.64);b.box('Lack_Grau',.72,.82,-.72,.5,.1,.3);for(const dz of[-.1,0,.1]){b.cyl('Lack_Weiss',.3,.92,-.72+dz*1.6,.03,.2,{seg:6});b.rohr('Kupfer',[.3,1.12,-.72+dz*1.6],[ox-.5,1.95,-.6+dz],.012,{seg:5})}
 b.cyl('Stahl_Verzinkt',1.0,.92,-.72,.1,.16,{rz:Math.PI/2,seg:10});b.schaltschrank(1.34,-1.25,0);
 // Abzug
 b.rohr('Stahl_Verzinkt',[-.9,wh+.3,.8],[-.9,wh+1.0,.8],.09);b.cyl('Stahl_Verzinkt',-.9,wh+1.0,.8,.13,.06,{r2:.03});
 nbFertig('elektroofen',b);NBA.elektroofen={lampe:[x1-.1,wh+.25,-zd+.15],bogen:[ox,.92,oz],dampf:[-.9,wh+1.1,.8],glut:[ox,.9,oz]}})();
/* --- Material Solarzellen --- */
(function(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#0b1c38';g.fillRect(0,0,256,256);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const q=g.createLinearGradient(x*64,y*64,x*64+64,y*64+64);q.addColorStop(0,'#16345f');q.addColorStop(1,'#0a1a36');g.fillStyle=q;g.fillRect(x*64+2,y*64+2,60,60)}g.fillStyle='rgba(170,185,205,.8)';for(let i=0;i<=256;i+=64){g.fillRect(i-1,0,2,256);g.fillRect(0,i-1,256,2)}g.fillStyle='rgba(170,185,205,.25)';for(let i=32;i<256;i+=64)g.fillRect(i,0,1,256);
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;mats.Solar=new T.MeshStandardMaterial({map:t,roughness:.16,metalness:.5,envMapIntensity:1.3})})();
// Markierung „H“ mit Ring auf Landeflächen
Bau.prototype.landeplatz=function(x,y,z,r){for(let i=0;i<16;i++){const a=i*.3927;this.add('Lack_Gelb',new T.BoxGeometry(r*.4,.012,.05),nbM(x+Math.cos(a)*r,y,z+Math.sin(a)*r,0,-a+Math.PI/2,0))}const h=r*.42;for(const s of[-1,1])this.box('Lack_Weiss',x,y-.006,z+s*h*.6,h*1.6,.012,.07);this.box('Lack_Weiss',x,y-.006,z,.07,.012,h*1.2);return this};
Bau.prototype.tank=function(mat,x,z,r,h,y0){y0=y0||.1;this.cyl('Beton',x,y0,z,r+.05,.06,{seg:20});this.cyl(mat,x,y0+.06,z,r,h,{seg:24});this.lathe(mat,x,y0+.06+h,z,[[r,0],[r*.6,r*.16],[.02,r*.24]],{seg:24});this.cyl('Stahl_Verzinkt',x,y0+.06+h-.03,z,r+.012,.04,{seg:24,open:true});this.cyl('Stahl_Verzinkt',x,y0+.06+h*.5,z,r+.008,.03,{seg:24,open:true});return this};
Bau.prototype.kolonne=function(mat,x,z,r,h){this.cyl('Beton',x,.1,z,r+.08,.12,{seg:12});this.cyl(mat,x,.22,z,r,h,{seg:16});this.kugel(mat,x,.22+h,z,r,{halb:true});for(let y=.95;y<h;y+=.8){this.cyl('Stahl_Verzinkt',x,y,z,r+.17,.025,{seg:10});this.cyl('Lack_Gelb',x,y+.17,z,r+.16,.016,{seg:10,open:true});for(let i=0;i<10;i++){const a=i*.628;this.box('Lack_Gelb',x+Math.cos(a)*(r+.16),y+.02,z+Math.sin(a)*(r+.16),.014,.16,.014)}}
 this.box('Stahl_Verzinkt',x+r+.025,.22,z,.02,h,.09);return this};
/* --- Raffinerie: Kolonnen, Rohrbrücke, Tanks und Fackel --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,2.96,.1,2.96);
 b.kolonne('Stahl_Verzinkt',-.85,.85,.2,3.1);b.kolonne('Silo',-.2,1.05,.15,2.1);b.rohr('Stahl_Verzinkt',[-.85,2.9,.85],[-.2,2.9,.85],.04);b.rohr('Stahl_Verzinkt',[-.2,2.9,.85],[-.2,2.35,1.05],.04);
 // Fackel
 const fx=-1.2,fz=-1.2;b.box('Beton',fx,.1,fz,.36,.1,.36);b.cyl('Lack_Dunkel',fx,.2,fz,.045,4.0,{seg:8});b.cyl('Rost',fx,4.2,fz,.075,.16,{seg:10});for(const[dx,dz]of[[1,0],[-.5,.87],[-.5,-.87]]){b.rohr('Stahl_Verzinkt',[fx+dx*.2,.2,fz+dz*.2],[fx,2.6,fz],.012,{seg:4});b.rohr('Stahl_Verzinkt',[fx+dx*.2,.2,fz+dz*.2],[fx,1.3,fz],.012,{seg:4})}
 // Prozessofen
 b.box('Ziegel_Dunkel',-.55,.1,-.62,.74,.2,.66);b.box('Rost',-.55,.3,-.62,.7,.8,.62);b.dach('Rost','Rost',-.9,-.2,1.1,.24,-.93,-.31);b.cyl('Stahl_Verzinkt',-.55,1.3,-.62,.09,.9,{seg:10});b.cyl('Stahl_Verzinkt',-.55,2.2,-.62,.12,.05,{r2:.03,seg:10});
 for(const z of[-.8,-.62,-.44])b.rohr('Kupfer',[-.2,.45,z],[-.05,.45,z],.02,{seg:5});b.wand('Glut',0,-.198,.42,-.62,.1,.08);
 // Tanks
 b.tank('Lack_Weiss',.74,.92,.42,.95);b.tank('Lack_Weiss',.74,-.92,.4,.75);b.gelaender('Lack_Gelb',.44,.62,1.04,.62,1.15,.14);b.box('Stahl_Verzinkt',1.18,.16,.92,.03,.95,.1);
 // Rohrbrücke
 for(const x of[-1.05,-.35,.35,1.0]){for(const z of[-.26,.26])b.box('Lack_Dunkel',x,.1,z,.05,.88,.05);b.box('Lack_Dunkel',x,.94,0,.05,.05,.57)}
 b.rohr('Stahl_Verzinkt',[-1.2,1.04,-.15],[1.05,1.04,-.15],.045);b.rohr('Lack_Gelb',[-1.2,1.03,0],[1.05,1.03,0],.035);b.rohr('Lack_Rot',[-1.2,1.02,.15],[1.05,1.02,.15],.028);
 b.rohr('Stahl_Verzinkt',[-.85,1.04,-.15],[-.85,1.04,.62],.045);b.rohr('Lack_Rot',[.74,1.02,.15],[.74,1.02,.5],.028);b.rohr('Lack_Gelb',[.74,1.03,0],[.74,1.03,-.52],.035);b.rohr('Stahl_Verzinkt',[-.55,1.04,-.15],[-.55,1.04,-.32],.045);
 for(const x of[-1.2,1.05]){b.rohr('Stahl_Verzinkt',[x,1.04,-.15],[x,.2,-.15],.045);b.rohr('Lack_Gelb',[x,1.03,0],[x,.2,0],.035)}
 // Pumpenhaus
 b.box('Blech_Blau',.1,.1,-1.05,.5,.46,.5);b.dach('Blechdach','Blech_Blau',-.15,.35,.56,.14,-1.3,-.8,{ue:.04});b.cyl('Lack_Grau',.1,.22,-.72,.09,.2,{rz:Math.PI/2,seg:10});
 nbFertig('raffinerie',b);NBA.raffinerie={lampe:[.1,.84,-1.05],fackel:[fx,4.38,fz],dampf:[-.55,2.3,-.62]}})();
/* --- Chemiefabrik: Reaktoren im Stahlgerüst, Kugeltanks, Labor --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,2.96,.1,2.96);
 b.box('Beton_Hell',-.98,.1,0,.74,.14,2.56);b.box('Paneel',-.98,.24,0,.7,.9,2.5);b.box('Paneel_Blau',-.98,.9,0,.715,.14,2.515);b.box('Dach',-.98,1.14,0,.76,.05,2.56);b.wand('Verglasung',0,-.618,.6,0,2.1,.32,7,1);b.wand('Verglasung',1,-.98,.6,1.262,.5,.32,2,1);
 b.klima(-.98,1.19,-.8,.4,.4);b.klima(-.98,1.19,.6,.4,.5);b.rohr('Stahl_Verzinkt',[-.98,1.3,-.55],[-.98,1.3,.3],.05);
 // Gerüst
 for(const x of[-.42,.4])for(const z of[-1.0,0,1.0])b.box('Lack_Gelb',x,.1,z,.06,1.72,.06);for(const z of[-1.0,0,1.0])b.box('Lack_Gelb',-.01,1.76,z,.88,.06,.06);for(const x of[-.42,.4])b.box('Lack_Gelb',x,1.76,0,.06,.06,2.06);
 b.box('Stahl_Verzinkt',-.01,1.0,0,.92,.03,2.1);b.gelaender('Lack_Gelb',.44,-1.04,.44,1.04,1.03,.2);b.gelaender('Lack_Gelb',-.44,1.04,.44,1.04,1.03,.2);b.gelaender('Lack_Gelb',-.44,-1.04,.44,-1.04,1.03,.2);
 const R=[];for(const z of[-.52,.52]){b.lathe('Stahl_Verzinkt',-.01,.42,z,[[.05,0],[.3,.26],[.3,1.0],[.2,1.12],[.06,1.18]],{seg:20});for(const y of[.75,1.3])b.cyl('Lack_Blau',-.01,y,z,.31,.05,{seg:20,open:true});b.rohr('Stahl_Verzinkt',[-.01,.42,z],[-.01,.2,z],.04);b.rohr('Stahl_Verzinkt',[-.01,.2,z],[.6,.2,z],.04);R.push([-.01,1.6,z])}
 // Kugeltanks
 for(const z of[-.92,.92]){b.kugel('Lack_Weiss',.92,.62,z,.38,{seg:20,ring:14});b.cyl('Lack_Blau',.92,.6,z,.385,.04,{seg:20,open:true});for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])b.rohr('Lack_Grau',[.92+dx*.27,.1,z+dz*.27],[.92+dx*.24,.55,z+dz*.24],.025,{seg:5});b.rohr('Stahl_Verzinkt',[.92,1.0,z],[.92,1.1,z],.03);b.rohr('Stahl_Verzinkt',[.92,1.1,z],[.42,1.1,z*.57],.03)}
 // Wäscherkolonne
 b.cyl('Beton',-.3,.1,1.28,.16,.1,{seg:10});b.cyl('Lack_Weiss',-.3,.2,1.28,.11,2.0,{seg:12});b.cyl('Lack_Blau',-.3,1.2,1.28,.115,.3,{seg:12,open:true});b.cyl('Stahl_Verzinkt',-.3,2.2,1.28,.14,.06,{r2:.05,seg:12});b.rohr('Stahl_Verzinkt',[-.3,.5,1.28],[-.01,.5,.82],.035);
 b.schaltschrank(1.34,-.62-.0,0);for(const[x,z]of[[1.3,.55],[1.14,.5]])b.cyl('Lack_Blau',x,.1,z,.08,.26,{seg:10});
 nbFertig('chemiefabrik',b);NBA.chemiefabrik={lampe:[.4,1.9,1.0],ruehr:R,dampf:[-.3,2.3,1.28]}})();
/* --- Kernkraftwerk: Reaktorkuppel, Maschinenhaus, zwei Kühltürme --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,4.96,.1,4.96);
 const rx=-1.3,rz=-1.05;b.cyl('Beton_Hell',rx,.1,rz,.98,1.5,{seg:32});b.kugel('Beton_Hell',rx,1.6,rz,.98,{halb:true,seg:32,ring:12});b.cyl('Beton',rx,1.52,rz,1.0,.1,{seg:32,open:true});b.cyl('Beton',rx,.1,rz,1.02,.2,{seg:32,open:true});b.cyl('Lack_Grau',rx,2.56,rz,.14,.1,{seg:10});
 b.box('Beton',rx,.1,.12,2.0,1.05,.8);b.box('Dach',rx,1.15,.12,2.06,.05,.86);b.wand('Verglasung',2,rx-1.012,.72,.12,.6,.3,2,1);b.box('Beton',rx+1.15,.1,rz,.5,.8,.9);b.box('Dach',rx+1.15,.9,rz,.54,.04,.94);
 // Maschinenhaus
 const hx=-1.05,hz=1.5;b.box('Beton_Hell',hx,.1,hz,2.76,.18,1.56);b.box('Blech_Hell',hx,.28,hz,2.7,1.15,1.5);b.box('Paneel_Blau',hx,1.2,hz,2.72,.12,1.52);b.dach('Blechdach','Blech_Hell',hz-.75,hz+.75,1.43,.34,hx-1.35,hx+1.35,{ax:'x',ue:.06});
 b.wand('Verglasung',1,hx,.75,hz+.762,2.3,.4,8,1);b.wand('Sektionaltor',2,hx-1.362,.6,hz,.9,.9);for(const x of[-.9,-.3,.3,.9])b.klima(hx+x,1.62,hz,.3,.26);
 // Kühltürme
 const TT=[[1.42,1.28],[1.42,-1.22]];for(const[tx,tz]of TT){b.lathe('Beton',tx,.1,tz,[[1.0,0],[.86,.8],[.7,2.0],[.64,2.8],[.67,3.5],[.75,4.05]],{seg:36});b.cyl('Beton_Hell',tx,4.15,tz,.75,.05,{seg:36,open:true});b.cyl('Lack_Dunkel',tx,4.0,tz,.72,.02,{seg:24});
  for(let i=0;i<18;i++){const a=i*.349;b.rohr('Beton_Hell',[tx+Math.cos(a)*1.05,.1,tz+Math.sin(a)*1.05],[tx+Math.cos(a+.17)*.95,.6,tz+Math.sin(a+.17)*.95],.028,{seg:5})}}
 // Abluftkamin
 const sx=-2.15,sz=-2.15;b.cyl('Beton',sx,.1,sz,.2,.24,{seg:12});let y=.34,r=.13;for(let i=0;i<9;i++){const r2=r-.007;b.cyl(i%2?'Lack_Weiss':'Lack_Rot',sx,y,sz,r,.46,{r2,seg:12});y+=.46;r=r2}
 // Dampfleitungen und Schaltanlage
 b.rohr('Stahl_Verzinkt',[-.6,1.0,-.5],[-.6,1.0,.76],.09);b.rohr('Stahl_Verzinkt',[-1.6,1.0,-.2],[-1.6,1.0,.76],.09);b.rohr('Stahl_Verzinkt',[.3,.7,1.5],[.62,.7,1.4],.1);b.rohr('Stahl_Verzinkt',[.3,.45,1.1],[.75,.45,.9],.08);
 for(const x of[-.95,-.45,.05]){b.box('Lack_Grau',x,.1,-2.12,.34,.42,.4);for(let i=0;i<4;i++)b.box('Stahl_Verzinkt',x-.13+i*.085,.14,-2.12,.014,.32,.46);for(const dz of[-.1,0,.1])b.cyl('Lack_Weiss',x,.52,-2.12+dz,.022,.14,{seg:6})}
 for(const x of[-1.25,.35])b.box('Stahl_Verzinkt',x,.1,-1.78,.05,1.0,.05);b.box('Stahl_Verzinkt',-.45,1.08,-1.78,1.66,.05,.05);for(const x of[-.95,-.45,.05])b.rohr('Kupfer',[x,.66,-2.12],[x,1.08,-1.78],.01,{seg:4});
 b.box('Paneel',2.12,.1,.03,.5,.42,.34);b.box('Dach',2.12,.52,.03,.56,.04,.4);
 nbFertig('kernkraftwerk',b);NBA.kernkraftwerk={lampe:[hx+1.2,1.85,hz],dampf:TT.map(q=>[q[0],4.2,q[1]]),licht:[sx,y+.05,sz]}})();
/* --- Zentrifuge: Halle mit großer Trommel und Kaskade --- */
(function(){const b=new Bau(),hx=-.8;b.box('Beton',0,0,0,2.96,.1,2.96);
 b.box('Beton_Hell',hx,.1,0,1.14,.16,2.64);b.box('Paneel',hx,.26,0,1.1,1.0,2.6);b.box('Lack_Gelb',hx,1.0,0,1.115,.12,2.615);b.box('Dach',hx,1.26,0,1.16,.05,2.66);b.wand('Verglasung',0,hx+.562,.7,0,2.0,.3,7,1);b.wand('Verglasung',2,hx-.562,.7,0,2.0,.3,7,1);
 b.klima(hx,1.31,-.8,.44,.4);b.klima(hx,1.31,.8,.44,.4);b.rohr('Stahl_Verzinkt',[hx,1.42,-.58],[hx,1.42,.58],.05);
 const cx=.52;b.cyl('Beton',cx,.1,0,.7,.14,{seg:28});b.cyl('Lack_Grau',cx,.24,0,.6,.82,{seg:28});for(const y of[.3,.62,.98])b.cyl('Stahl_Verzinkt',cx,y,0,.615,.06,{seg:28,open:true});b.cyl('Lack_Gelb',cx,.76,0,.607,.1,{seg:28,open:true});
 for(let i=0;i<6;i++){const a=i*1.047+.5;b.box('Lack_Dunkel',cx+Math.cos(a)*.66,.1,Math.sin(a)*.66,.08,.5,.08)}
 b.box('Lack_Blau',cx,.1,-.92,.34,.4,.3);b.cyl('Lack_Blau',cx,.34,-.74,.13,.2,{rx:Math.PI/2,seg:12});
 for(const s of[-1,1]){for(let i=0;i<5;i++){const x=.05+i*.24;b.cyl('Lack_Weiss',x,.1,s*1.2,.075,.95,{seg:10});b.cyl('Lack_Gelb',x,.75,s*1.2,.078,.08,{seg:10,open:true});b.kugel('Lack_Weiss',x,1.05,s*1.2,.075,{halb:true,seg:10})}b.rohr('Stahl_Verzinkt',[-.05,1.16,s*1.2],[1.1,1.16,s*1.2],.03);b.rohr('Stahl_Verzinkt',[-.05,1.16,s*1.2],[-.24,1.16,s*1.2],.03)}
 b.rohr('Stahl_Verzinkt',[cx,.5,.6],[cx,.5,1.12],.05);b.schaltschrank(1.34,-.62,0);
 nbFertig('zentrifuge',b);NBA.zentrifuge={lampe:[hx+.4,1.4,1.1],deckel:[cx,1.08,0],licht:[cx,1.26,0]}})();
/* --- Drohnenhafen: Landeplatz, Tower und Hangar --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,2.96,.08,2.96);
 b.cyl('Beton',.1,.08,0,1.12,.12,{seg:8});b.cyl('Dach',.1,.2,0,1.04,.02,{seg:8});b.landeplatz(.1,.228,0,.8);
 for(const[x,z]of[[1.3,1.3],[1.3,-1.3],[-1.3,1.3]])b.cyl('Lack_Dunkel',x,.08,z,.03,.05,{seg:6});
 const tx=-1.2,tz=-1.2;b.box('Beton_Hell',tx,.08,tz,.34,1.3,.34);b.box('Stahl_Verzinkt',tx,1.38,tz,.56,.04,.56);for(let d=0;d<4;d++){const n=[[1,0],[0,1],[-1,0],[0,-1]][d];b.wand('Verglasung',d,tx+n[0]*.24,1.56,tz+n[1]*.24,.48,.28,2,1)}b.box('Lack_Dunkel',tx,1.7,tz,.58,.05,.58);b.rohr('Stahl_Verzinkt',[tx+.15,1.75,tz+.15],[tx+.15,2.3,tz+.15],.012,{seg:5});b.gelaender('Lack_Gelb',tx-.28,tz+.28,tx+.28,tz+.28,1.42,.12);
 b.box('Beton_Hell',-1.1,.08,.55,.64,.08,1.36);b.box('Blech_Blau',-1.1,.16,.55,.6,.5,1.3);b.cyl('Blechdach',-1.1,.66,.55,.3,1.32,{rx:Math.PI/2,seg:16});b.wand('Sektionaltor',0,-.788,.42,.55,.9,.5);b.box('Lack_Gelb',-.78,.69,.55,.04,.04,1.0);
 b.rohr('Stahl_Verzinkt',[1.3,.08,.75],[1.3,.95,.75],.014,{seg:5});b.cyl('Lack_Rot',1.19,.93,.75,.05,.22,{r2:.02,rz:Math.PI/2,seg:8});
 b.box('Holz',.9,.08,-1.25,.3,.22,.26);b.box('Holz',.55,.08,-1.3,.24,.16,.22);b.cyl('Lack_Rot',-.55,.08,-1.3,.08,.26,{seg:10});
 nbFertig('drohnenhafen',b);NBA.drohnenhafen={lampe:[-1.1,1.0,.55],rl:[tx,1.75,tz]}})();
/* --- Wartungsstation: Werkstatt mit Dachlandeplatz und Radarmast --- */
(function(){const b=new Bau(),x0=-1.36,x1=.56,zd=1.3,wh=1.1;
 b.box('Beton',0,0,0,2.96,.1,2.96);b.box('Beton_Hell',(x0+x1)/2,.1,0,x1-x0+.04,.18,zd*2+.04);b.box('Blech_Hell',(x0+x1)/2,.28,0,x1-x0,wh-.18,zd*2);b.box('Lack_Rot',(x0+x1)/2,.98,0,x1-x0+.015,.14,zd*2+.015);
 b.box('Beton_Hell',(x0+x1)/2,.1+wh,0,x1-x0+.08,.1,zd*2+.08);b.box('Dach',(x0+x1)/2,.2+wh,0,x1-x0-.06,.03,zd*2-.06);b.landeplatz(0,.238+wh,0,.55);
 for(const z of[-.65,.65]){b.wand('Sektionaltor',0,x1+.012,.56,z,1.0,.72);b.box('Warnstreifen',x1+.03,.1,z-.55,.06,.5,.06);b.box('Warnstreifen',x1+.03,.1,z+.55,.06,.5,.06)}b.box('Lack_Rot',x1+.2,1.0,0,.4,.04,zd*2-.2);for(const z of[-1.15,0,1.15])b.rohr('Stahl_Verzinkt',[x1+.38,1.0,z],[x1+.02,1.2,z],.012,{seg:4});
 for(const x of[-.9,-.2])b.fenster(1,x,.66,zd,.5,.34);for(const x of[-.9,-.2])b.fenster(3,x,.66,-zd,.5,.34);b.schild(0,x1+.013,1.14,0,3,.5);
 // Radarmast
 const mx=-1.08,mz=-1.04;for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]]){b.rohr('Stahl_Verzinkt',[mx+dx*.12,wh+.2,mz+dz*.12],[mx+dx*.03,2.36,mz+dz*.03],.014,{seg:4})}for(const y of[1.6,1.95,2.3])b.box('Stahl_Verzinkt',mx,y,mz,.2-(y-1.6)*.14,.015,.2-(y-1.6)*.14);
 // Hof: Ersatzteile, Gasflaschen, Kran
 b.box('Holz',1.1,.1,1.15,.4,.26,.34);b.box('Holz',1.14,.36,1.13,.28,.2,.26);b.box('Holz',.82,.1,1.25,.24,.2,.24);for(const z of[-1.3,-1.16])b.cyl('Lack_Rot',1.3,.1,z,.055,.4,{seg:8});b.cyl('Lack_Blau',1.16,.1,-1.26,.055,.4,{seg:8});
 b.box('Lack_Gelb',1.3,.1,.5,.1,.9,.1);b.box('Lack_Gelb',1.05,.94,.5,.6,.07,.07);b.rohr('Lack_Dunkel',[.82,.94,.5],[.82,.6,.5],.008,{seg:4});b.box('Lack_Dunkel',.82,.52,.5,.05,.08,.05);
 b.klima(-.9,.23+wh,.8,.4,.4);
 nbFertig('wartungsstation',b);NBA.wartungsstation={lampe:[x1-.1,wh+.26,zd-.15]}})();
/* --- Solarpark: aufgeständerte Modulreihen mit Wechselrichter --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,2.96,.06,2.96);
 for(const z of[-.92,0,.92]){b.add('Solar',new T.BoxGeometry(2.56,.03,.74),nbM(0,.5,z,.5,0,0),{s:2});b.add('Stahl_Verzinkt',new T.BoxGeometry(2.6,.03,.78),nbM(0,.48,z,.5,0,0));
  for(const x of[-1.1,-.37,.37,1.1]){b.box('Stahl_Verzinkt',x,.06,z-.26,.04,.56,.04);b.box('Stahl_Verzinkt',x,.06,z+.28,.04,.24,.04);b.rohr('Stahl_Verzinkt',[x,.1,z+.28],[x,.56,z-.26],.01,{seg:4})}}
 b.box('Lack_Grau',1.3,.06,-1.3,.26,.5,.22);for(let i=0;i<5;i++)b.box('Stahl_Verzinkt',1.2+i*.05,.1,-1.3,.012,.4,.26);b.rohr('Lack_Dunkel',[1.3,.1,-1.2],[1.3,.1,1.2],.025,{seg:6});
 nbFertig('solar',b);NBA.solar={lampe:[1.3,.62,-1.3]}})();
/* --- Material Uhr --- */
(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#2a3338';g.fillRect(0,0,128,128);g.beginPath();g.arc(64,64,58,0,6.3);g.fillStyle='#f2efe4';g.fill();g.lineWidth=5;g.strokeStyle='#1b2226';g.stroke();g.lineWidth=4;for(let i=0;i<12;i++){const a=i*.5236;g.beginPath();g.moveTo(64+Math.sin(a)*44,64-Math.cos(a)*44);g.lineTo(64+Math.sin(a)*52,64-Math.cos(a)*52);g.stroke()}
 g.lineCap='round';g.lineWidth=6;g.beginPath();g.moveTo(64,64);g.lineTo(64-24,64-18);g.stroke();g.lineWidth=4;g.beginPath();g.moveTo(64,64);g.lineTo(64+14,64-42);g.stroke();const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;mats.Uhr=new T.MeshStandardMaterial({map:t,roughness:.5,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.25})})();
// Sheddach: n Zähne entlang x, Glas nach -x
Bau.prototype.shed=function(x0,x1,n,y,h,z0,z1,mG){const tw=(x1-x0)/n,zm=(z0+z1)/2,zl=z1-z0;for(let i=0;i<n;i++){const a=x0+i*tw,c=a+tw;this.poly('Blechdach',[[a,y+h,z0-.04],[c,y,z0-.04],[c,y,z1+.04],[a,y+h,z1+.04]],[0,1,0],{hang:'x'});
 this.wand('Verglasung',2,a,y+h*.54,zm,zl-.08,h*.8,Math.round(zl/.5),1);this.box('Stahl_Verzinkt',a,y,zm,.04,.07,zl+.08);this.box('Stahl_Verzinkt',a,y+h-.02,zm,.05,.04,zl+.1);
 this.poly(mG,[[a,y,z0],[c,y,z0],[a,y+h,z0]],[0,0,-1]);this.poly(mG,[[a,y,z1],[c,y,z1],[a,y+h,z1]],[0,0,1])}return this};
// Gittermast: vier Eckstiele von halber Breite w0 (unten) auf w1 (oben), n Felder mit Kreuzstreben
Bau.prototype.gitter=function(mat,x,z,y0,y1,w0,w1,n,r){r=r||.02;const W=t=>w0+(w1-w0)*t,E=[[-1,-1],[1,-1],[1,1],[-1,1]];for(const[dx,dz]of E)this.rohr(mat,[x+dx*w0,y0,z+dz*w0],[x+dx*w1,y1,z+dz*w1],r,{seg:5});
 for(let i=0;i<n;i++){const ya=y0+(y1-y0)*i/n,yb=y0+(y1-y0)*(i+1)/n,wa=W(i/n),wb=W((i+1)/n);for(let s=0;s<4;s++){const A=E[s],B=E[(s+1)%4];this.rohr(mat,[x+A[0]*wa,ya,z+A[1]*wa],[x+B[0]*wb,yb,z+B[1]*wb],r*.55,{seg:4});if(i%2===0)this.rohr(mat,[x+B[0]*wa,ya,z+B[1]*wa],[x+A[0]*wb,yb,z+A[1]*wb],r*.55,{seg:4});this.rohr(mat,[x+A[0]*wb,yb,z+A[1]*wb],[x+B[0]*wb,yb,z+B[1]*wb],r*.55,{seg:4})}}return this};
/* --- Bohrer und Schnellbohrer: Bohrturm mit Maschinenhaus --- */
for(const[k,farbe,gross]of[['bohrer','Lack_Blau',0],['schnellbohrer','Lack_Rot',1]])(function(){const b=new Bau();b.box('Beton',0,0,0,1.96,.1,1.96);b.box('Beton_Hell',-.1,.1,.1,1.24,.06,1.24);b.cyl('Lack_Dunkel',-.1,.16,.1,.16,.1,{seg:12});
 b.gitter(farbe,-.1,.1,.16,2.85,.56,.13,gross?6:5,.028);b.box(farbe,-.1,2.85,.1,.36,.08,.36);b.box('Lack_Dunkel',-.1,2.93,.1,.2,.12,.14);b.cyl('Lack_Dunkel',-.1,3.0,.1,.07,.03,{rx:Math.PI/2,seg:10});
 // Arbeitsbühne
 b.box('Stahl_Verzinkt',-.1,.62,.1,.98,.03,.98);for(const[a,c,d,e]of[[-.59,-.39,.39,-.39],[.39,-.39,.39,.59],[.39,.59,-.59,.59],[-.59,.59,-.59,-.39]])b.gelaender('Lack_Gelb',a,c,d,e,.65,.2);
 b.cyl('Stahl_Verzinkt',-.1,.65,.1,.2,.05,{seg:14});
 // Maschinenhaus und Spülung
 b.box('Blech_Dunkel',.62,.1,.68,.56,.44,.44);b.dach('Blechdach','Blech_Dunkel',.46,.9,.54,.14,.34,.9,{ax:'x',ue:.03});b.rohr('Stahl_Verzinkt',[.8,.6,.68],[.8,1.05,.68],.03,{seg:6});
 b.cyl('Lack_Grau',-.68,.3,.74,.17,.5,{rz:Math.PI/2,seg:12});for(const x of[-.86,-.5])b.box('Lack_Dunkel',x,.1,.74,.05,.14,.3);b.rohr('Lack_Grau',[-.5,.36,.74],[-.2,.36,.3],.03,{seg:6});
 if(gross){b.box('Lack_Gelb',-.72,.1,-.6,.4,.5,.4);b.cyl('Lack_Dunkel',-.72,.6,-.6,.13,.06,{seg:10});b.rohr('Lack_Gelb',[-.52,.4,-.6],[-.3,.4,-.2],.04,{seg:6})}
 // Rutsche zum Ausgang
 b.add('Rost',new T.BoxGeometry(.9,.04,.3),nbM(.42,.5,-.3,0,.42,-.3));b.box('Lack_Dunkel',.84,.1,-.5,.2,.3,.5);b.schaltschrank(.86,-.86,1);
 const sp=new Bau();sp.cyl('Stahl_Verzinkt',0,-.7,0,.045,2.4,{seg:8});sp.cyl('Lack_Dunkel',0,-.2,0,.17,.05,{seg:6});sp.box('Lack_Gelb',0,1.5,0,.14,.2,.14);sp.cyl('Lack_Dunkel',0,-.72,0,.1,.14,{r2:.05,seg:6});
 nbFertig(k,b,sp,[-.1,.88,.1]);NBA[k]={lampe:[.62,.76,.68],rl:[.39,.86,-.39],staub:[-.1,.1]}})();
/* --- Strommast --- */
(function(){const b=new Bau();b.cyl('Beton',0,0,0,.13,.14,{seg:8});b.cyl('Holz',0,.14,0,.055,3.4,{r2:.038,seg:8,s:3});b.box('Holz',0,3.2,0,.86,.06,.06);b.rohr('Stahl_Verzinkt',[-.3,3.2,0],[0,2.9,0],.012,{seg:4});b.rohr('Stahl_Verzinkt',[.3,3.2,0],[0,2.9,0],.012,{seg:4});
 for(const x of[-.38,0,.38]){b.cyl('Lack_Weiss',x,3.26,0,.03,.1,{seg:6});b.cyl('Lack_Weiss',x,3.3,0,.045,.02,{seg:6})}b.cyl('Lack_Weiss',0,3.54,0,.03,.1,{seg:6});
 b.cyl('Lack_Grau',.1,2.35,0,.09,.3,{seg:8});b.box('Stahl_Verzinkt',.05,2.45,0,.1,.03,.03);
 b.rohr('Stahl_Verzinkt',[0,2.95,0],[0,3.02,.34],.012,{seg:4});b.box('Lack_Dunkel',0,2.98,.36,.07,.03,.14);b.box('Lack_Gelb',0,1.0,.058,.06,.1,.004);
 nbFertig('mast',b)})();
/* --- Hochspannungsmast --- */
(function(){const b=new Bau();for(const[x,z]of[[-.34,-.34],[.34,-.34],[.34,.34],[-.34,.34]])b.box('Beton',x,0,z,.14,.12,.14);
 b.gitter('Stahl_Verzinkt',0,0,.1,4.4,.34,.1,6,.022);b.gitter('Stahl_Verzinkt',0,0,4.4,5.9,.1,.03,2,.016);
 for(const[y,w]of[[3.5,.86],[4.4,.7],[5.2,.5]]){for(const s of[-1,1]){b.rohr('Stahl_Verzinkt',[0,y+.16,.08],[s*w,y,0],.014,{seg:4});b.rohr('Stahl_Verzinkt',[0,y+.16,-.08],[s*w,y,0],.014,{seg:4});b.rohr('Stahl_Verzinkt',[0,y-.1,0],[s*w,y,0],.014,{seg:4});
   b.cyl('Lack_Weiss',s*w,y-.2,0,.022,.2,{seg:5});for(const d of[.04,.1,.16])b.cyl('Lack_Weiss',s*w,y-.2+d,0,.04,.015,{seg:6})}}
 b.box('Warnstreifen',0,.9,.3,.2,.14,.005);nbFertig('grossmast',b)})();
/* --- Raketensilo: Startkomplex mit Versorgungsturm --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,4.96,.12,4.96);b.cyl('Beton_Hell',0,.12,0,1.5,.14,{seg:12});b.cyl('Lack_Dunkel',0,.26,0,.72,.015,{seg:20});
 for(let i=0;i<12;i++){const a=i*.5236;b.add(i%2?'Lack_Gelb':'Lack_Dunkel',new T.BoxGeometry(.36,.012,.1),nbM(Math.cos(a)*1.36,.265,Math.sin(a)*1.36,0,-a+Math.PI/2,0))}
 b.box('Lack_Dunkel',0,.02,-1.9,.9,.11,1.1);b.box('Rost',0,.13,-1.9,1.0,.02,1.2);
 // Versorgungsturm
 const tx=2.02;b.gitter('Lack_Rot',tx,0,.12,6.6,.3,.3,11,.03);b.box('Lack_Rot',tx,6.6,0,.74,.08,.74);b.rohr('Stahl_Verzinkt',[tx,6.68,0],[tx,7.3,0],.014,{seg:5});
 for(const y of[1.9,3.5,5.1]){b.box('Stahl_Verzinkt',tx,y,0,.8,.03,.8);b.box('Lack_Gelb',tx-.82,y+.02,0,1.06,.06,.16);b.rohr('Lack_Gelb',[tx-.3,y+.5,0],[tx-1.3,y+.06,0],.014,{seg:4});b.box('Lack_Dunkel',tx-1.36,y-.04,0,.1,.16,.2)}
 b.box('Lack_Grau',tx,.12,.46,.3,6.4,.2);
 // Blitzschutzmasten
 for(const[x,z]of[[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]]){b.gitter('Stahl_Verzinkt',x,z,.12,5.2,.14,.03,6,.014);b.rohr('Stahl_Verzinkt',[x,5.2,z],[x,6.4,z],.01,{seg:4})}
 // Tanklager
 b.kugel('Lack_Weiss',-1.85,.72,-1.2,.46,{seg:20,ring:14});for(const[dx,dz]of[[-1,-1],[1,-1],[-1,1],[1,1]])b.rohr('Lack_Grau',[-1.85+dx*.34,.12,-1.2+dz*.34],[-1.85+dx*.3,.62,-1.2+dz*.3],.03,{seg:5});
 b.cyl('Lack_Weiss',-1.85,.5,-.2,.26,1.0,{rx:Math.PI/2,seg:16});for(const z of[-.6,.2])b.kugel('Lack_Weiss',-1.85,.5,z,.26,{seg:14});for(const z of[-.5,.1])b.box('Lack_Dunkel',-1.85,.12,z,.4,.14,.08);
 b.rohr('Stahl_Verzinkt',[-1.4,.4,-1.2],[-.6,.4,-1.2],.04);b.rohr('Stahl_Verzinkt',[-.6,.4,-1.2],[-.6,.4,-.5],.04);b.rohr('Lack_Blau',[-1.6,.4,-.2],[-.8,.4,-.2],.035);b.kugel('Stahl_Verzinkt',-.6,.4,-1.2,.05);
 // Leitbunker
 b.box('Beton',-1.75,.12,1.75,1.0,.56,.9);b.box('Beton_Hell',-1.75,.68,1.75,1.08,.08,.98);b.wand('Verglasung',0,-1.238,.46,1.75,.6,.16,3,1);b.wand('Schiebetor',1,-1.75,.4,2.212,.4,.5);b.rohr('Stahl_Verzinkt',[-2.1,.76,2.0],[-2.1,1.5,2.0],.012,{seg:4});b.kugel('Lack_Weiss',-1.5,.76,1.6,.16,{halb:true});
 // Flutlicht
 for(const z of[-2.0,2.0]){b.rohr('Stahl_Verzinkt',[1.0,.12,z],[1.0,2.2,z],.025,{seg:6});b.box('Lack_Dunkel',1.0,2.2,z,.3,.14,.08)}
 nbFertig('raketensilo',b);NBA.raketensilo={lampe:[-1.75,.9,1.3],licht:[[tx,7.34,0],[-2.2,6.44,-2.2],[2.2,6.44,2.2]]}})();
/* --- Zentrale: Stammwerk mit Sheddach-Halle, Verwaltung, Uhrturm und Wasserturm --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,5.96,.1,5.96);
 // Produktionshalle
 const x0=-2.76,x1=1.14,z0=-2.74,z1=.9,wh=2.0;b.box('Beton_Hell',(x0+x1)/2,.1,(z0+z1)/2,x1-x0+.08,.26,z1-z0+.08);b.box('Ziegel2',(x0+x1)/2,.36,(z0+z1)/2,x1-x0,wh-.26,z1-z0);b.box('Beton_Hell',(x0+x1)/2,.1+wh,(z0+z1)/2,x1-x0+.08,.08,z1-z0+.08);
 b.shed(x0,x1,5,.18+wh,.62,z0,z1,'Ziegel2');
 for(let i=0;i<=5;i++){const x=x0+i*.78;for(const z of[z0,z1])b.box('Ziegel2',x,.36,z,.16,wh-.26,.12)}for(let i=0;i<=4;i++){const z=z0+i*.91;b.box('Ziegel2',x0,.36,z,.12,wh-.26,.16)}
 for(let i=0;i<5;i++){const x=x0+.39+i*.78;if(i!==2)b.fenster(1,x,1.2,z1,.52,1.1);b.fenster(3,x,1.2,z0,.52,1.1)}for(let i=0;i<4;i++)b.fenster(2,x0,1.2,z0+.455+i*.91,.6,1.1);
 b.wand('Schiebetor',1,x0+.39+1.56,.86,z1+.012,.7,1.0);b.box('Lack_Dunkel',x0+1.95,1.4,z1+.2,.9,.04,.4);for(const s of[-1,1])b.rohr('Stahl_Verzinkt',[x0+1.95+s*.4,1.42,z1+.38],[x0+1.95+s*.4,1.7,z1+.02],.012,{seg:4});
 b.schild(1,x0+1.95,1.66,z1+.07,15,.6);
 // Verwaltung
 const vx0=1.14,vx1=2.76,vz0=-2.74,vz1=.2,vh=3.0;b.box('Beton_Hell',(vx0+vx1)/2,.1,(vz0+vz1)/2,vx1-vx0+.06,.3,vz1-vz0+.06);b.box('Ziegel2',(vx0+vx1)/2,.4,(vz0+vz1)/2,vx1-vx0,vh-.3,vz1-vz0);b.box('Beton_Hell',(vx0+vx1)/2,.1+vh,(vz0+vz1)/2,vx1-vx0+.1,.12,vz1-vz0+.1);b.box('Dach',(vx0+vx1)/2,.22+vh,(vz0+vz1)/2,vx1-vx0-.1,.03,vz1-vz0-.1);
 for(const y of[.95,1.85,2.65]){for(let i=0;i<5;i++){const z=vz0+.4+i*.56;if(!(y<1.2&&i===2))b.fenster(0,vx1,y,z,.36,.5)}for(let i=0;i<2;i++)b.fenster(1,vx0+.45+i*.72,y,vz1,.4,.5)}
 for(const y of[1.35,2.25])b.box('Beton_Hell',(vx0+vx1)/2,y,(vz0+vz1)/2,vx1-vx0+.03,.05,vz1-vz0+.03);
 b.wand('Schiebetor',0,vx1+.012,.72,vz0+.4+1.12,.44,.74);b.box('Beton_Hell',vx1+.14,1.12,vz0+1.52,.3,.05,.7);b.box('Beton_Hell',vx1+.16,.1,vz0+1.52,.3,.08,.6);
 b.schild(0,vx1+.02,3.36,(vz0+vz1)/2,0,1.5);b.box('Stahl_Verzinkt',vx1-.02,3.22,(vz0+vz1)/2,.04,.1,1.6);
 b.klima((vx0+vx1)/2-.2,.25+vh,-.5,.5,.5);b.klima((vx0+vx1)/2+.3,.25+vh,-1.3,.4,.4);
 // Uhrturm
 const ux=2.5,uz=-2.48,uh=4.5;b.box('Ziegel2',ux,.1+vh,uz,.52,uh-vh,.52);b.box('Beton_Hell',ux,.1+uh,uz,.6,.08,.6);for(let d=0;d<4;d++){const n=[[1,0],[0,1],[-1,0],[0,-1]][d];b.wand('Uhr',d,ux+n[0]*.264,uh-.3,uz+n[1]*.264,.36,.36)}
 b.add('Blechdach_Rot',new T.ConeGeometry(.42,.6,4),nbM(ux,uh+.48,uz,0,Math.PI/4,0),{rot:true});b.rohr('Stahl_Verzinkt',[ux,uh+.78,uz],[ux,uh+1.15,uz],.012,{seg:4});
 // Schornstein
 const sx=-2.3,sz=1.9;b.box('Ziegel_Dunkel',sx,.1,sz,.6,.5,.6);b.box('Beton_Hell',sx,.6,sz,.66,.06,.66);b.lathe('Ziegel2',sx,.66,sz,[[.24,0],[.15,4.9]],{seg:16});b.cyl('Beton_Hell',sx,5.56,sz,.17,.1,{seg:16});for(const y of[2,3.4,4.8])b.cyl('Stahl_Verzinkt',sx,y,sz,.24-(y-.66)*.0184+.012,.05,{seg:16,open:true});
 b.rohr('Rost',[sx,1.4,sz-.2],[sx,1.4,z1],.12);
 // Wasserturm
 const wx=2.05,wz=1.95;b.gitter('Stahl_Verzinkt',wx,wz,.1,2.3,.42,.3,4,.03);b.lathe('Lack_Blau',wx,2.3,wz,[[.1,0],[.5,.25],[.5,.95],[.3,1.15],[.02,1.22]],{seg:20});b.cyl('Stahl_Verzinkt',wx,2.55,wz,.51,.05,{seg:20,open:true});b.cyl('Stahl_Verzinkt',wx,3.2,wz,.51,.05,{seg:20,open:true});b.rohr('Stahl_Verzinkt',[wx,.1,wz],[wx,2.3,wz],.05);
 // Hof: Trafostation mit Dachmast, Stapler, Paletten, Zaun
 b.box('Stahl_Verzinkt',0,2.3,0,.06,1.0,.06);b.box('Stahl_Verzinkt',0,3.22,0,.7,.05,.05);for(const x of[-.3,0,.3])b.cyl('Lack_Weiss',x,3.27,0,.03,.1,{seg:6});
 b.box('Lack_Gelb',.5,.1,1.7,.4,.26,.26);b.box('Lack_Dunkel',.44,.36,1.7,.2,.3,.24);b.box('Lack_Dunkel',.74,.1,1.7,.04,.56,.2);b.box('Stahl_Verzinkt',.84,.14,1.7,.2,.02,.2);for(const[x,z]of[[.36,1.58],[.36,1.82],[.64,1.58],[.64,1.82]])b.cyl('Lack_Dunkel',x,.16,z,.07,.05,{rx:Math.PI/2,seg:8});
 for(const[x,z,n]of[[-.4,1.5,2],[-.8,1.55,3],[-.4,2.0,1],[1.2,2.5,2],[-.9,2.4,1]]){b.box('Holz',x,.1,z,.36,.04,.3);for(let i=0;i<n;i++)b.box('Holz',x,.14+i*.22,z,.3,.22,.26,{ry:i*.25})}
 for(const[x,z]of[[1.4,1.2],[1.56,1.24],[1.46,1.38]])b.cyl('Lack_Blau',x,.1,z,.085,.26,{seg:10});
 for(let i=0;i<9;i++){const x=-1.9+i*.42;if(Math.abs(x-.2)<.5)continue;b.box('Stahl_Verzinkt',x,.1,2.86,.03,.4,.03)}b.box('Stahl_Verzinkt',-1.2,.44,2.86,1.5,.02,.02);b.box('Stahl_Verzinkt',1.1,.44,2.86,.8,.02,.02);
 MODELS.zentrale=b.teile();NBA.zentrale={licht:[sx,5.72,sz]}})();
/* --- Gleis, Bahnhof und Güterzug --- */
mats.Schotter=new T.MeshStandardMaterial({color:0x6b655c,roughness:1,metalness:0});
(function(){const b=new Bau();b.box('Schotter',0,.02,0,1,.06,.62);for(const x of[-.375,-.125,.125,.375])b.box('Holz',x,.07,0,.09,.035,.52);for(const z of[-.17,.17])b.box('Stahl_Verzinkt',0,.1,z,1,.045,.035);MODELS.gleis=b.teile()})();
(function(){const b=new Bau();b.box('Beton',0,0,0,2.96,.1,2.96);
 // Gleisbett entlang z an der Rückseite, Bahnsteig, Halle
 b.box('Schotter',-1.05,.1,0,.7,.06,2.96);for(let i=0;i<10;i++)b.box('Holz',-1.05,.15,-1.3+i*.29,.56,.035,.09);for(const x of[-1.22,-.88])b.box('Stahl_Verzinkt',x,.18,0,.035,.045,2.96);
 b.box('Beton_Hell',-.2,.1,0,.9,.3,2.8);b.box('Warnstreifen',-.62,.4,0,.06,.012,2.8);
 for(const z of[-1.2,-.4,.4,1.2]){b.box('Lack_Gelb',-.2,.4,z,.07,1.25,.07);b.rohr('Lack_Gelb',[-.2,1.4,z],[-.75,1.62,z],.022,{seg:5});b.rohr('Lack_Gelb',[-.2,1.4,z],[.3,1.62,z],.022,{seg:5})}
 b.dach('Blechdach_Rot','Stahl_Verzinkt',-.85,.4,1.62,.16,-1.42,1.42,{ue:.04});
 b.box('Ziegel2',.75,.1,-.55,.8,1.1,1.5);b.box('Beton_Hell',.75,1.2,-.55,.88,.06,1.58);b.dach('Blechdach_Rot','Ziegel2',.35,1.15,1.26,.3,-1.3,.2,{ue:.05});b.fenster(1,.75,.75,.2,.44,.44);b.fenster(0,1.15,.8,-1.0,.4,.44);b.wand('Schiebetor',2,.338,.55,-.55,.5,.7);b.schild(0,1.165,1.05,-.4,2,.5);
 // Ladekran
 b.box('Lack_Gelb',.2,.4,.9,.09,1.0,.09);b.box('Lack_Gelb',-.35,1.36,.9,1.3,.09,.09);b.box('Lack_Dunkel',-.9,1.2,.9,.12,.16,.14);b.rohr('Lack_Dunkel',[-.9,1.2,.9],[-.9,.75,.9],.008,{seg:4});
 for(const[x,z,n]of[[.1,-1.15,2],[.1,.35,1],[-.25,1.2,2]])for(let i=0;i<n;i++)b.box('Holz',x,.4+i*.2,z,.28,.2,.26,{ry:i*.3});
 b.box('Lack_Dunkel',1.3,.1,0,.3,.26,.8);b.box('BandStill',1.38,.365,0,.25,.02,.7);b.schaltschrank(1.34,.9,0);
 MODELS.bahnhof=b.teile();NBA.bahnhof={lampe:[.75,1.5,-.55]}})();
const ZUGM={};
(function(){const lok=new Bau();lok.box('Lack_Dunkel',0,.1,0,.96,.1,.44);lok.cyl('Lack_Rot',.12,.42,0,.17,.6,{rz:Math.PI/2,seg:14});lok.box('Lack_Rot',-.28,.2,0,.34,.52,.44);lok.box('Lack_Dunkel',-.28,.72,0,.4,.04,.5);lok.wand('Verglasung',1,-.28,.56,.222,.22,.16);lok.wand('Verglasung',3,-.28,.56,-.222,.22,.16);
 lok.cyl('Lack_Dunkel',.32,.56,0,.05,.2,{r2:.07,seg:8});lok.cyl('Kupfer',.1,.58,0,.05,.07,{seg:8});lok.box('Lack_Gelb',.5,.14,0,.06,.1,.46);for(const x of[-.3,0,.3])for(const z of[-.2,.2])lok.cyl('Lack_Dunkel',x,.13,z,.11,.05,{rx:Math.PI/2,seg:10});
 const wg=new Bau();wg.box('Lack_Dunkel',0,.1,0,.84,.08,.42);wg.box('Rost',0,.18,0,.8,.03,.44);for(const z of[-.21,.21])wg.box('Blech_Dunkel',0,.2,z,.8,.26,.03);for(const x of[-.39,.39])wg.box('Blech_Dunkel',x,.2,0,.03,.26,.44);wg.box('Holz',0,.24,0,.7,.2,.34);for(const x of[-.26,.26])for(const z of[-.2,.2])wg.cyl('Lack_Dunkel',x,.11,z,.09,.05,{rx:Math.PI/2,seg:10});
 ZUGM.lok=lok.teile();ZUGM.wagen=wg.teile()})();
/* --- Verteiler, Sortierer, Langer Greifarm --- */
for(const[k,farbe]of[['verteiler','Lack_Gelb'],['sortierer','Lack_Blau']])(function(){const b=new Bau();b.box('Lack_Dunkel',0,0,0,.98,.22,.98);b.box('Stahl_Verzinkt',0,.22,0,.92,.1,.92);b.box('Lack_Grau',0,.32,0,.82,.03,.82);
 b.cyl('Stahl_Verzinkt',0,.35,0,.3,.04,{seg:20});b.cyl(farbe,0,.39,0,.24,.02,{seg:20});for(const a of[0,1.571])b.add('Lack_Dunkel',new T.BoxGeometry(.44,.012,.07),nbM(0,.416,0,0,a,0));
 for(const[x,z]of[[-.42,-.42],[.42,-.42],[-.42,.42],[.42,.42]]){b.box(farbe,x,.22,z,.12,.34,.12);b.box('Lack_Dunkel',x,.56,z,.14,.03,.14)}
 for(const[x,z,w,d]of[[0,-.45,.6,.05],[0,.45,.6,.05],[-.45,0,.05,.6],[.45,0,.05,.6]])b.box('Stahl_Verzinkt',x,.33,z,w,.05,d);
 if(k==='sortierer'){b.box('Lack_Blau',0,.6,0,.98,.07,.16);b.box('Lack_Dunkel',0,.5,0,.2,.1,.2);b.box('Glut',0,.49,0,.1,.012,.1)}
 MODELS[k]=b.teile()})();
(function(){const b=new Bau();b.box('Beton',0,0,0,.6,.1,.6);b.cyl('Lack_Grau',0,.1,0,.14,.3,{r2:.1,seg:12});b.cyl('Lack_Dunkel',0,.4,0,.12,.08,{seg:12});
 const sp=new Bau();sp.box('Lack_Blau',.9,0,0,1.8,.07,.09);sp.box('Lack_Blau',.5,.07,0,.9,.04,.05);sp.box('Lack_Dunkel',1.84,-.2,0,.12,.26,.22);sp.box('Lack_Gelb',1.84,-.22,.1,.1,.06,.03);sp.box('Lack_Gelb',1.84,-.22,-.1,.1,.06,.03);sp.cyl('Lack_Dunkel',0,-.04,0,.1,.16,{seg:10});
 nbFertig('langgreifer',b,sp,[0,.5,0])})();
/* --- Versandstation --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,1.96,.1,1.96);b.box('Beton_Hell',-.3,.1,-.3,1.2,.12,1.2);b.box('Blech_Blau',-.3,.22,-.3,1.14,.62,1.14);b.box('Lack_Gelb',-.3,.7,-.3,1.16,.1,1.16);b.box('Dach',-.3,.84,-.3,1.2,.04,1.2);b.landeplatz(-.3,.892,-.3,.4);
 b.wand('Sektionaltor',0,.272,.5,-.3,.7,.5);b.wand('Sektionaltor',1,-.3,.5,.272,.7,.5);b.schild(0,.275,.82,-.3,12,.5);
 b.rohr('Stahl_Verzinkt',[.2,.88,.2],[.2,1.5,.2],.014,{seg:5});b.box('Lack_Dunkel',.2,1.5,.2,.07,.07,.07);
 for(const[x,z,n]of[[.62,.6,2],[.62,.1,1],[.1,.66,1]])for(let i=0;i<n;i++)b.box('Holz',x,.1+i*.2,z,.28,.2,.26,{ry:i*.3});b.box('Warnstreifen',.62,.1,-.6,.3,.03,.4);
 MODELS.versand=b.teile();NBA.versand={lampe:[-.75,.95,.15],start:[-.3,1.0,-.3]}})();
/* --- Sammelstelle für Träger --- */
(function(){const b=new Bau();b.box('Beton',0,0,0,1.96,.08,1.96);for(const[x,z]of[[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])b.box('Holz',x,.08,z,.1,1.0,.1,{s:3});b.dach('Blechdach_Rot','Holz',-.95,.95,1.08,.3,-.95,.95,{ue:.06});
 b.box('Holz',-.45,.08,-.4,.5,.3,.6);b.box('Holz',-.45,.38,-.4,.42,.24,.5,{ry:.2});b.box('Holz',.35,.08,-.5,.4,.26,.4);b.box('Holz',.4,.08,.45,.6,.05,.4);for(const z of[.28,.62])b.cyl('Lack_Dunkel',.62,.1,z,.09,.04,{rx:Math.PI/2,seg:8});b.rohr('Holz',[.1,.14,.45],[-.3,.4,.45],.015,{seg:4});
 b.schild(1,0,.96,.96,12,.5);MODELS.traeger=b.teile();NBA.traeger={lampe:[.8,1.15,.8]}})();
