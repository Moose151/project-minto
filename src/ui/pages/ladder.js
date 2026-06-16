'use strict';

/* Ladder — full standings with form */
Object.assign(UI, {
  p_ladder(){
    const lad = ladder();
    const finalsSpots = G.teams.length >= 8 ? 8 : 4;
    return `<h1 class="page">Ladder</h1><p class="page-sub">${esc(G.config.leagueName)} · ${G.year} · top ${finalsSpots} qualify for finals</p>
    <div class="card" style="padding:6px; overflow-x:auto"><table>
    <thead><tr><th class="noclick"></th><th class="noclick">Club</th><th class="noclick num">P</th><th class="noclick num">W</th><th class="noclick num">D</th><th class="noclick num">L</th><th class="noclick num">PF</th><th class="noclick num">PA</th><th class="noclick num">Diff</th><th class="noclick num">Pts</th><th class="noclick">Form</th></tr></thead>
    <tbody>${lad.map((r,i)=>{
      const t = G.teams[r.id];
      const diff = r.pf-r.pa;
      return `<tr class="${i===finalsSpots-1?'finals-line':''}" style="${t.id===G.coach.teamId?'background:rgba(210,165,62,.07)':''}">
        <td class="lpos">${i+1}</td><td class="click" onclick="UI.teamModal(${t.id})" style="cursor:pointer">${teamLogo(t,28)} <b>${esc(teamName(t))}</b></td>
        <td class="num">${r.p}</td><td class="num">${r.w}</td><td class="num">${r.d}</td><td class="num">${r.l}</td>
        <td class="num">${r.pf}</td><td class="num">${r.pa}</td><td class="num" style="color:${diff>=0?'var(--green)':'var(--red)'}">${diff>0?'+':''}${diff}</td>
        <td class="num"><b>${r.pts}</b></td>
        <td>${r.form.slice(-5).map(f=>`<span class="form-dot ${f}"></span>`).join('')}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
});
