/* ====== Werksgelände: Straßen, auf denen Arbeiter schneller laufen, und Laternen ====== */
K.strasse={n:'Straße',s:1,c:{stein:2},info:'Asphaltierter Weg. Mitarbeiter und Träger laufen darauf fast doppelt so schnell. Zieh eine Strecke wie beim Band. Laternen stellen sich von selbst auf.'};
TOOLS.splice(TOOLS.indexOf('fundament')+1,0,'strasse');NOWEAR.add('strasse');
mats.Asphalt=new T.MeshStandardMaterial({color:0x34373a,roughness:.94,metalness:0});
MODELS.strasse=[{g:new T.BoxGeometry(1,.05,1).translate(0,.025,0),m:'Asphalt',piv:null}];MHOEHE.strasse=.3;
const STR=(function(){const R=rnd(815),bild=linie=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#3a3d40';g.fillRect(0,0,256,256);
  for(let i=0;i<5000;i++){const v=40+R()*50|0;g.fillStyle=`rgba(${v},${v},${v+2},.5)`;g.fillRect(R()*256,R()*256,1+R()*2,1+R()*2)}
  for(let i=0;i<6;i++){g.strokeStyle='rgba(20,20,22,.5)';g.lineWidth=1;g.beginPath();let x=R()*256,y=R()*256;g.moveTo(x,y);for(let j=0;j<5;j++){x+=R()*50-25;y+=R()*50-25;g.lineTo(x,y)}g.stroke()}
  if(linie){g.fillStyle='rgba(225,225,215,.85)';g.fillRect(0,10,256,6);g.fillRect(0,240,256,6);g.fillStyle='rgba(230,200,90,.9)';g.fillRect(48,124,160,8)}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t},
 netz=(geo,mat,n,schatten)=>{const m=new T.InstancedMesh(geo,mat,n);m.count=0;m.frustumCulled=false;m.receiveShadow=true;m.castShadow=!!schatten;scene.add(m);return m},
 fl=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),mat=t=>new T.MeshStandardMaterial({map:t,roughness:.93,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
 stahl=new T.MeshStandardMaterial({color:0x59626a,roughness:.5,metalness:.7}),kopf=new T.MeshStandardMaterial({color:0xfff1c8,emissive:0xffd890,emissiveIntensity:0,roughness:.4}),
 sc=document.createElement('canvas');sc.width=sc.height=128;const sg=sc.getContext('2d'),gr=sg.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,214,140,.9)');gr.addColorStop(.5,'rgba(255,200,120,.3)');gr.addColorStop(1,'rgba(255,190,110,0)');sg.fillStyle=gr;sg.fillRect(0,0,128,128);
 const schein=new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 return{max:20000,lmax:3000,gerade:netz(fl,mat(bild(true)),20000),platz:netz(fl,mat(bild(false)),20000),
  mast:netz(new T.CylinderGeometry(.035,.05,2.7,8).translate(0,1.35,0),stahl,3000,true),arm:netz(new T.BoxGeometry(.55,.05,.07).translate(.24,2.7,0),stahl,3000,true),
  kopf:netz(new T.BoxGeometry(.26,.06,.14).translate(.42,2.65,0),kopf,3000),schein:netz(new T.PlaneGeometry(5,5).rotateX(-Math.PI/2),schein,3000),kopfM:kopf,scheinM:schein}})();
const istStr=(x,y)=>{const q=at(x,y);return !!q&&q.k==='strasse'};
function strassenBauen(){const o=GB.ob,l=byKind.strasse||[];let ng=0,np=0,nl=0;o.scale.set(1,1,1);
 for(const e of l){const y=YL(e.z)+.052,a=istStr(e.x+1,e.y),b=istStr(e.x-1,e.y),c=istStr(e.x,e.y+1),d=istStr(e.x,e.y-1),ow=a||b,ns=c||d,ger=ow!==ns||(!ow&&!ns);
  o.position.set(e.x+.5,y,e.y+.5);o.rotation.set(0,ns&&!ow?Math.PI/2:0,0);o.updateMatrix();
  if(ger){if(ng<STR.max)STR.gerade.setMatrixAt(ng++,o.matrix)}else if(np<STR.max)STR.platz.setMatrixAt(np++,o.matrix);
  // Laterne an geraden Stücken, alle paar Felder, abwechselnd links und rechts
  if(ger&&nl<STR.lmax&&(e.x*7+e.y*13)%6===0){const s=(e.x+e.y)%2?1:-1,q=ns&&!ow;o.position.set(e.x+.5+(q?s*.44:0),YL(e.z),e.y+.5+(q?0:s*.44));o.rotation.set(0,q?(s>0?Math.PI:0):(s>0?Math.PI/2:-Math.PI/2),0);o.updateMatrix();STR.mast.setMatrixAt(nl,o.matrix);STR.arm.setMatrixAt(nl,o.matrix);STR.kopf.setMatrixAt(nl,o.matrix);
   o.position.set(e.x+.5,y+.02,e.y+.5);o.rotation.set(0,0,0);o.updateMatrix();STR.schein.setMatrixAt(nl,o.matrix);nl++}}
 STR.gerade.count=ng;STR.platz.count=np;for(const m of[STR.mast,STR.arm,STR.kopf,STR.schein])m.count=nl;for(const m of[STR.gerade,STR.platz,STR.mast,STR.arm,STR.kopf,STR.schein])m.instanceMatrix.needsUpdate=true}
EV.an('gebaeude',strassenBauen);
// Laternen gehen in der Dämmerung an
EV.an('bild',()=>{const n=Math.min(1,Math.max(0,(TN.n-.25)*2.5));STR.kopfM.emissiveIntensity=n*4;STR.scheinM.opacity=n*.55;STR.schein.visible=n>.02});
