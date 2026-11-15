/* ====== In Blender gebaute Modelle einsetzen ======
   Jedes Modell hat einen Atlas (Farbe mit Umgebungsverdeckung, dazu Rauheit und Metall) und damit nur ein Material:
   ein Zeichenaufruf statt eines je Teil. Leuchtende Teile behalten das Spielmaterial 'Glut'. */
{const lade=new T.TextureLoader();
 for(const k in BLENDER){const d=BLENDER[k],farbe=lade.load(d.farbe),orm=lade.load(d.orm);farbe.colorSpace=T.SRGBColorSpace;farbe.anisotropy=8;
  const mat='Atlas_'+k;mats[mat]=new T.MeshStandardMaterial({map:farbe,roughnessMap:orm,metalnessMap:orm,roughness:1,metalness:1,envMapIntensity:1.1});
  MODELS[k]=d.teile.map(q=>({g:geo(q),m:q.m==='Atlas'?mat:q.m,piv:null}));
  if(NBA[k])for(const p in d.punkte)NBA[k][p]=d.punkte[p]}}
