/* ====== Kamera ====== */
const C={x:CX-6,z:CX,yaw:.55,dist:44,pitch:.92,tx:CX-6,tz:CX,tyaw:.55,tdist:44};
function camUp(dt){const f=1-Math.pow(.0015,dt);C.x+=(C.tx-C.x)*f;C.z+=(C.tz-C.z)*f;C.yaw+=(C.tyaw-C.yaw)*f;C.dist+=(C.tdist-C.dist)*f;const h=Math.sin(C.pitch)*C.dist,r=Math.cos(C.pitch)*C.dist;const ty=YL(Lv(Math.floor(C.tx),Math.floor(C.tz)));C.y=(C.y||0)+(ty-(C.y||0))*f;cam.position.set(C.x+Math.sin(C.yaw)*r,h+C.y,C.z+Math.cos(C.yaw)*r);cam.lookAt(C.x,C.y,C.z);
 const S=Math.min(C.dist*.9,70),c=sun.shadow.camera;if(c.right!==S){c.left=-S;c.right=S;c.top=S;c.bottom=-S;c.near=1;c.far=S*5;c.updateProjectionMatrix()}sun.target.position.set(C.x,0,C.z);sun.position.set(C.x-S*.9,S*1.8,C.z-S*.6)}
function size(){const w=innerWidth,h=innerHeight;ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',size);size();

