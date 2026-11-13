/* ====== Ersatzteile nach Schaden ====== */
const repKosten=m=>Math.max(1,Math.ceil((1-(m.hp??1))/.25-1e-6));
function repMit(m){const k=repKosten(m),n=Math.min(k,Math.floor(G.stock.ersatzteil||0));if(n<1)return 0;G.stock.ersatzteil-=n;if(n>=k)repair(m);else{m.hp=Math.min(1,(m.hp??1)+.25*n);if(m.hp>0)m.kaputt=false}return n}
