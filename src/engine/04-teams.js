'use strict';

/* ---------- team & league generation ---------- */
const SQUAD_TEMPLATE = ['FB','FB','WG','WG','WG','WG','CE','CE','CE','CE','FE','FE','HB','HB','HK','HK','PR','PR','PR','PR','PR','SR','SR','SR','SR','LK','LK','HK'];
function fitCap(G, t){ // scale salaries so squad fits under cap
  let total = t.players.reduce((s,id)=>s+G.players[id].salary, 0);
  const target = G.config.cap * rf(.88,.99);
  if(total > target){ const f = target/total; for(const id of t.players){ const p=G.players[id]; p.salary = Math.max(85000, Math.round(p.salary*f/5000)*5000); if(p.contractSchedule && p.contractSchedule.length) p.contractSchedule = p.contractSchedule.map(v=>Math.max(85000, Math.round(v*f/5000)*5000)); } }
}
function genFixtures(teamIds){
  // double round robin, circle method
  const ids = shuffle(teamIds); const n = ids.length;
  const rounds = [];
  const arr = ids.slice();
  for(let r=0; r<n-1; r++){
    const games = [];
    for(let i=0; i<n/2; i++){
      const a = arr[i], b = arr[n-1-i];
      games.push(r%2===0 ? {h:a, a:b} : {h:b, a:a});
    }
    rounds.push(games);
    arr.splice(1,0,arr.pop());
  }
  const second = rounds.map(g => g.map(m => ({h:m.a, a:m.h})));
  return rounds.concat(second).map(g => g.map(m => ({...m, played:false, hs:0, as:0, det:null})));
}
