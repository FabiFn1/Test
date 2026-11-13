/* ====== Karte ====== */
function rnd(s){return()=>(s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,((s^s>>>14)>>>0)/4294967296)}
const ORE=new Uint8Array(N*N),PUR=new Uint8Array(N*N),AMT=new Int32Array(N*N),PID=new Int16Array(N*N).fill(-1),PT=[],PC=[];const ORES=[null,'eisenerz','kupfererz','stein','kohle','quarz','bauxit','rohoel','schwefel','uranerz'];
const PATCHES=[];
function weltErz(seed,ef){seed=seed||0;ef=ef||1;ORE.fill(0);PUR.fill(0);AMT.fill(0);PID.fill(-1);PATCHES.length=0;PC.length=0;const R=rnd(1007+seed*7919),R0=rnd(7+seed*104729),pat=[[1,33+OX,47+OX,8,2],[2,64+OX,40+OX,7,2],[3,47+OX,30+OX,6,2],[4,57+OX,65+OX,7,2],[1,74+OX,70+OX,8,2],[2,22+OX,72+OX,8,2],[4,20+OX,22+OX,7,2],[3,76+OX,18+OX,6,2],[1,50+OX,84+OX,6,1]];
 let add=(t,ring,n,r0,r1)=>{for(let i=0;i<n;i++){for(let tr=0;tr<40;tr++){const a=R()*6.283,d=ring[0]+R()*(ring[1]-ring[0]),x=CX+Math.cos(a)*d,y=CX+Math.sin(a)*d,r=r0+R()*(r1-r0);if(x<r+6||y<r+6||x>N-r-6||y>N-r-6)continue;if(pat.some(p=>Math.hypot(p[1]-x,p[2]-y)<p[3]+r+5))continue;const u=R();pat.push([t,x,y,r,d>250?(u<.45?4:2):(u<.25?1:u<.8?2:4)]);break}}};{const _a=add;add=(t,ring,n,r0,r1)=>_a(t,[ring[0]*2,ring[1]*4.2],n*4,r0*1.15,r1*1.25)}
 add(1,[60,110],9,8,13);add(2,[60,110],8,7,12);add(4,[60,110],6,7,11);add(3,[60,110],5,6,10);add(5,[62,112],6,5,9);add(6,[62,112],6,7,11);add(7,[78,116],7,3.5,5);add(8,[70,116],6,6,10);add(9,[86,118],5,6,9);add(6,[80,116],3,8,11);
 for(const[t,cx,cy,r,p]of pat){PATCHES.push([t,cx,cy,r,p]);const a=[0,1,2,3,4].map(()=>R0()*6.28);for(let y=Math.max(0,Math.floor(cy-r*1.3));y<Math.min(N,cy+r*1.3);y++)for(let x=Math.max(0,Math.floor(cx-r*1.3));x<Math.min(N,cx+r*1.3);x++){const d=Math.hypot(x+.5-cx,y+.5-cy),th=Math.atan2(y-cy,x-cx);if(d<r*(.8+.13*Math.sin(th*2+a[0])+.09*Math.sin(th*3+a[1]))){const i=y*N+x,id=PATCHES.length-1;ORE[i]=t;PUR[i]=p;PID[i]=id;AMT[i]=t===7?1:Math.round(({1:420,2:850,4:1700})[p]*(1.5-.9*d/r)*(1+Math.hypot(x-CX,y-CX)/300)*ef*.25);PC[id]=(PC[id]||0)+1}}}}weltErz(0,1);
const AMT0=AMT.slice();function patchTotals(){PT.length=0;for(let i=0;i<AMT.length;i++)if(PID[i]>=0&&ORE[i]!==7)PT[PID[i]]=(PT[PID[i]]||0)+AMT[i]}patchTotals();
/* Höhenstufen: 1 = Ebene der Zentrale */
const TER=new Uint8Array(N*N),F=new Uint8Array(N*N),H=1;
function genTer(carve){const R=rnd(4242+((typeof G!=='undefined'&&G&&G.seed)||0)*31337),L=[];for(const c of[44,92]){const g=[];for(let i=0;i<(c+1)*(c+1);i++)g.push(R());L.push([c,g])}
 const vn=(x,y)=>{let s=0,w=1,t=0;for(const[c,g]of L){const fx=x/N*c,fy=y/N*c,i=Math.min(Math.floor(fx),c-1),j=Math.min(Math.floor(fy),c-1),u=fx-i,v=fy-j,a=u*u*(3-2*u),b=v*v*(3-2*v),p=(q,r)=>g[r*(c+1)+q];s+=w*((p(i,j)*(1-a)+p(i+1,j)*a)*(1-b)+(p(i,j+1)*(1-a)+p(i+1,j+1)*a)*b);t+=w;w*=.5}return s/t};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=vn(x,y),d=Math.hypot(x-CX,y-CX),e=Math.min(x,y,N-1-x,N-1-y);let l=n<.385?0:n>.615?2:1;const q=Math.min(Math.max(0,d-27),Math.max(0,e-1))/2.1;l=Math.max(Math.ceil(1-q),Math.min(l,Math.floor(1+q)));TER[y*N+x]=l}
 for(const[,cx,cy,r0]of PATCHES){const r=r0+3,l=Math.max(1,TER[Math.floor(cy)*N+Math.floor(cx)]);for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(N,cy+r);y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(N,cx+r);x++)if(Math.hypot(x-cx,y-cy)<r)TER[y*N+x]=l}
 for(let p=0;p<5;p++)for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const i=y*N+x;let eq=0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])if(TER[(y+b)*N+x+a]===TER[i])eq++;if(eq<2){const m=[TER[i+1],TER[i-1],TER[i+N],TER[i-N]].sort();TER[i]=m[1]}}
 for(let p=0;p<40;p++){let ch=false;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const q=x+a,r=y+b;if(q<0||r<0||q>=N||r>=N)continue;const o=TER[r*N+q];if(TER[i]>o+1){TER[i]=o+1;ch=true}}}if(!ch)break}
 for(let i=0;i<TER.length;i++)if(ORE[i]&&!TER[i])TER[i]=1;
 for(const i of carve||[])TER[i]=1}
function Lv(x,y){if(x<0||y<0||x>=N||y>=N)return 1;const i=y*N+x;return Math.max(TER[i],F[i])}
const YL=l=>(l-1)*H;

