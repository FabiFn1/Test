/* ====== Bessere Figuren: Arbeiter mit Helm, Warnweste und Laufbewegung ====== */
(function(){const P=[],Nn=[],Cc=[],Tt=[],Vv=[],teil=(g0,mx,col,t,v)=>{const g=g0.index?g0.toNonIndexed():g0.clone();g.applyMatrix4(mx);const c=new T.Color(col),n=g.attributes.position.count;P.push(...g.attributes.position.array);Nn.push(...g.attributes.normal.array);for(let i=0;i<n;i++){Cc.push(c.r,c.g,c.b);Tt.push(t||0);Vv.push(v||0)}};
 const cy=(a,b,h,s)=>new T.CylinderGeometry(a,b,h,s||8),ku=(r,a)=>new T.SphereGeometry(r,10,8,0,6.283,0,a||Math.PI);
 for(const[z,t]of[[-.032,1],[.032,2]]){teil(cy(.024,.019,.2),MX(0,.1,z),0x26303c,t);teil(new T.BoxGeometry(.065,.028,.04),MX(.014,.014,z),0x16181b,t)}
 teil(cy(.052,.044,.16,10),MX(0,.275,0,0,0,0,.82,1,1.25),0xffffff,0,1);teil(cy(.0535,.05,.022,10),MX(0,.262,0,0,0,0,.83,1,1.26),0xdfe6e8);teil(cy(.054,.052,.022,10),MX(0,.305,0,0,0,0,.83,1,1.26),0xdfe6e8);
 teil(ku(.05),MX(0,.352,0,0,0,0,.8,.5,1.25),0xffffff,0,1);
 for(const[z,t]of[[-.078,3],[.078,4]]){teil(cy(.019,.016,.15),MX(0,.275,z),0x3a6ea8,t);teil(ku(.019),MX(0,.196,z),0xd9a982,t)}
 teil(cy(.017,.02,.03),MX(0,.375,0),0xd9a982);teil(ku(.041),MX(.002,.412,0,0,0,0,.95,1.05,.9),0xd9a982);
 teil(ku(.047,1.6),MX(0,.42,0),0xf0b429);teil(cy(.058,.058,.008,12),MX(.012,.422,0),0xf0b429);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(Nn,3));g.setAttribute('color',new T.Float32BufferAttribute(Cc,3));g.setAttribute('aT',new T.Float32BufferAttribute(Tt,1));g.setAttribute('aV',new T.Float32BufferAttribute(Vv,1));
 g.setAttribute('aW',new T.InstancedBufferAttribute(new Float32Array(120*2),2));
 const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:0,envMapIntensity:.7});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=UM.t;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aT,aV;attribute vec2 aW;uniform float uT;')
  .replace('#include <color_vertex>','vColor=vec3(1.);\n#ifdef USE_COLOR\nvColor*=color;\n#endif\n#ifdef USE_INSTANCING_COLOR\nvColor*=mix(vec3(1.),instanceColor,aV);\n#endif')
  .replace('#include <begin_vertex>',`#include <begin_vertex>
  if(aT>.5){float bein=step(aT,2.5),sg=(aT<1.5||aT>3.5)?1.:-1.,amp=abs(aW.x)*(bein>.5?step(0.,aW.x):1.),w=amp*sg*sin(uT*(aW.x<0.?13.:9.)+aW.y)*(bein>.5?.65:.8);if(aW.x<0.&&bein<.5)w=-.9-.5*sin(uT*13.+aW.y+aT);
   float p=bein>.5?.2:.345,c=cos(w),s=sin(w);vec2 d=transformed.xy-vec2(0.,p);transformed.xy=vec2(d.x*c-d.y*s,p+d.x*s+d.y*c);}`)};
 m.customProgramCacheKey=()=>'figur';
 UM.figur=new T.InstancedMesh(g,m,120);UM.figur.count=0;UM.figur.frustumCulled=false;UM.figur.castShadow=true;UM.figur.setColorAt(0,new T.Color());scene.add(UM.figur);
 UM.kiste=new T.InstancedMesh(new T.BoxGeometry(.11,.09,.13),M('Holz'),60);UM.kiste.count=0;UM.kiste.frustumCulled=false;UM.kiste.castShadow=true;scene.add(UM.kiste);
 UM.weste=[0xf26a1b,0xe8d21f,0xf26a1b,0xd8342a,0xf26a1b].map(h=>new T.Color(h))})();
{const _z=lebenZeichnen;lebenZeichnen=function(){_z();UM.leute.count=0;const L=UM.figur,Kk=UM.kiste,A=L.geometry.attributes.aW,o=GB.ob;let n=0,nk=0;
 if(!SHELL.titel)for(const w of ARB.w){if(n>=120)break;if(Math.abs(w.x-C.x)>150||Math.abs(w.y-C.z)>150)continue;const tx=Math.floor(w.x),ty=Math.floor(w.y),y=YL(Lv(tx,ty)),geht=!!w.path,arbeitet=w.job&&!w.path&&w.typ!=='trag',r=w.r||0;
  o.position.set(w.x,y+(geht?Math.abs(Math.sin(GB.t*9+n*1.7))*.012:0),w.y);o.rotation.set(0,r,0);o.scale.setScalar(1.3);o.updateMatrix();L.setMatrixAt(n,o.matrix);L.setColorAt(n,UM.weste[w.typ==='rep'&&w.job?3:w.typ==='bau'&&w.job?1:0]);A.array[n*2]=geht?(w.last?.55:1):arbeitet?-1:0;A.array[n*2+1]=n*1.7;n++;
  if(w.last&&nk<60){o.position.set(w.x+Math.cos(r)*.1,y+.36,w.y-Math.sin(r)*.1);o.scale.setScalar(1);o.updateMatrix();Kk.setMatrixAt(nk++,o.matrix)}}
 L.count=n;Kk.count=nk;L.instanceMatrix.needsUpdate=true;Kk.instanceMatrix.needsUpdate=true;A.needsUpdate=true;if(L.instanceColor)L.instanceColor.needsUpdate=true}}
