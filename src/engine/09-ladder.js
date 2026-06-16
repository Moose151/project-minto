'use strict';

/* ---------- ladder ---------- */
function ladder(){
  const rows = G.teams.map(t=>({id:t.id, p:0, w:0, l:0, d:0, pf:0, pa:0, pts:0, form:[]}));
  for(let r=0; r<G.fixtures.length; r++) for(const m of G.fixtures[r]){
    if(!m.played) continue;
    const h = rows[m.h], a = rows[m.a];
    h.p++; a.p++; h.pf+=m.hs; h.pa+=m.as; a.pf+=m.as; a.pa+=m.hs;
    if(m.hs>m.as){ h.w++; a.l++; h.pts+=2; h.form.push('W'); a.form.push('L'); }
    else if(m.as>m.hs){ a.w++; h.l++; a.pts+=2; a.form.push('W'); h.form.push('L'); }
    else { h.d++; a.d++; h.pts++; a.pts++; h.form.push('D'); a.form.push('D'); }
  }
  rows.sort((x,y)=> y.pts-x.pts || (y.pf-y.pa)-(x.pf-x.pa) || y.pf-x.pf);
  return rows;
}
