'use strict';

/* Hall of Fame — retired legends */
Object.assign(UI, {
  _hofSort: 'score',
  _hofSearch: '',

  p_halloffame(){
    const query = (UI._hofSearch || '').trim().toLowerCase();
    const vals = h => ({
      score:h.score || 0,
      newest:-(h.inductionYear || 0),
      games:h.career ? h.career.games || 0 : 0,
      points:h.career ? h.career.points || 0 : 0,
      tries:h.career ? h.career.tries || 0 : 0,
      peak:h.peakOvr || 0,
      name:h.name || '',
    }[UI._hofSort] ?? (h.score || 0));
    const rows = (G.hallOfFame || [])
      .filter(h=>!query || `${h.name} ${h.team} ${h.nationality} ${h.repTeam} ${h.pos}`.toLowerCase().includes(query))
      .sort((a,b)=>{
        const av = vals(a), bv = vals(b);
        if(typeof av === 'string') return av.localeCompare(bv);
        return bv - av;
      });
    const sortSelect = `<select onchange="UI._hofSort=this.value;UI.render()">
      ${[
        ['score','Sort: legacy score'],['newest','Sort: newest inducted'],['peak','Sort: peak OVR'],['games','Sort: games'],['points','Sort: points'],['tries','Sort: tries'],['name','Sort: name']
      ].map(([v,l])=>`<option value="${v}" ${UI._hofSort===v?'selected':''}>${l}</option>`).join('')}
    </select>`;
    const cards = rows.map(h=>{
      const c = h.career || {};
      const awards = (h.awards || []).slice(0,4).map(a=>`<span class="pos-tag">${esc(a.award)}</span>`).join(' ');
      const team = h.teamId != null && G.teams[h.teamId] ? G.teams[h.teamId] : null;
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
          <div>
            <div style="font-family:var(--disp);font-size:22px;font-weight:700">${nationalityFlag(h.nationality)} ${esc(h.name)}</div>
            <p style="margin:3px 0;color:var(--muted);font-size:12px">${esc(h.pos || '')}${h.pos2?`/${esc(h.pos2)}`:''} · ${esc(h.nationality || 'Unknown')}${h.repTeam?` · ${esc(h.repTeam)}`:''}</p>
            <p style="margin:3px 0;color:var(--brass);font-size:12px">Inducted ${h.inductionYear} · ${esc(h.quality || 'Legend')} · legacy ${h.score}</p>
          </div>
          <div style="text-align:right">
            <div class="ovr ${ovrCls(h.peakOvr || 0)}" style="font-size:20px">${h.peakOvr || '-'}</div>
            <div style="font-size:10px;color:var(--muted)">peak OVR</div>
          </div>
        </div>
        <div class="dash-strip" style="grid-template-columns:repeat(4,minmax(80px,1fr));margin:10px 0">
          <div class="dash-status"><div class="dash-label">Games</div><div class="dash-value">${c.games || 0}</div></div>
          <div class="dash-status"><div class="dash-label">Tries</div><div class="dash-value">${c.tries || 0}</div></div>
          <div class="dash-status"><div class="dash-label">Points</div><div class="dash-value">${c.points || 0}</div></div>
          <div class="dash-status"><div class="dash-label">Prems</div><div class="dash-value">${c.premierships || 0}</div></div>
        </div>
        <p style="font-size:12px;color:var(--muted);margin:0 0 8px">Final club: ${team?`<span onclick="UI.teamModal(${team.id})" style="cursor:pointer;text-decoration:underline">${esc(h.team)}</span>`:esc(h.team || 'Free Agent')}</p>
        <div>${awards || '<span style="color:var(--dim);font-size:12px">No major awards recorded.</span>'}</div>
      </div>`;
    }).join('');
    return `<h1 class="page">Hall of Fame</h1>
    <p class="page-sub">Retired players with exceptional careers are inducted automatically at season review.</p>
    <div class="card history-controls">
      <div class="field"><label>Search Hall of Fame</label><input type="search" value="${esc(UI._hofSearch||'')}" placeholder="Player, club, country..." oninput="UI._hofSearch=this.value;UI.render()"></div>
      <div class="field"><label>Sort</label>${sortSelect}</div>
      <button class="btn sm" onclick="UI._hofSearch='';UI._hofSort='score';UI.render()">Clear</button>
    </div>
    <div class="grid2">${cards || '<div class="card"><p style="color:var(--muted)">No Hall of Fame inductees yet. Legends will appear here when they retire.</p></div>'}</div>`;
  },
});
