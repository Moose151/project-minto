'use strict';

Object.assign(UI, {
  p_injuryward(){
    const t = myTeam();
    const injured = t.players.map(id=>G.players[id]).filter(p=>p && p.injury).sort((a,b)=>b.injury.weeks-a.injury.weeks);
    const suspended = t.players.map(id=>G.players[id]).filter(p=>p && p.suspended && p.suspended.weeks>0).sort((a,b)=>b.suspended.weeks-a.suspended.weeks);
    const canPlay = p => p.injury && p.injury.weeks <= 2 && !/ACL|Pectoral|Broken|Syndesmosis/i.test(p.injury.n);
    const totalRounds = G.fixtures ? G.fixtures.length : 24;
    const returnRound = p => {
      const ret = G.round + (p.injury.weeks || 0);
      if(ret > totalRounds) return 'Post-season';
      return `Round ${ret + 1}`;
    };
    const severeLabel = p => {
      const wk = p.injury.weeks;
      if(wk >= 20) return {label:'Season over', cls:'var(--red)'};
      if(wk >= 10) return {label:'Long term', cls:'var(--red)'};
      if(wk >= 6)  return {label:'Medium term', cls:'var(--brass)'};
      if(wk >= 3)  return {label:'Short term', cls:'var(--brass)'};
      return {label:'Minor', cls:'var(--green)'};
    };
    const medStaff = (G.staff||[]).find(s=>s.role==='medical');
    const row = p => {
      const ok = canPlay(p);
      const sev = severeLabel(p);
      return `<tr class="click" onclick="UI.playerModal(${p.id})">
        <td><div class="player-cell" style="gap:6px">${playerAvatar(p,30)}<div><b>${esc(p.name)}</b><br><span class="pos-tag">${p.pos}</span> <span style="font-size:11px;color:var(--muted)">OVR ${p.ovr}</span></div></div></td>
        <td>${esc(p.injury.n)}<br><span style="font-size:11px;color:${sev.cls}">${sev.label}</span></td>
        <td class="num">${p.injury.weeks}w<br><span style="font-size:10px;color:var(--muted)">${returnRound(p)}</span></td>
        <td class="num">${Math.round(p.cond)}%</td>
        <td>${ok?'<span style="color:var(--brass);font-size:12px">Could play through</span>':'<span style="color:var(--red);font-size:12px">Unavailable</span>'}</td>
        <td onclick="event.stopPropagation()">${ok?`<button class="btn sm ${p.playInjured?'primary':''}" onclick="UI.togglePlayInjured(${p.id})">${p.playInjured?'Playing hurt':'Allow'}</button>`:''}</td>
      </tr>`;
    };
    const medCard = medStaff ? `<div class="card" style="padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:12px">
      <div style="flex:1">
        <b style="font-size:13px">${esc(medStaff.name)}</b>
        <span style="font-size:10px;color:var(--brass);font-weight:700;margin-left:6px">PHYSIO</span>
        <p style="margin:2px 0;font-size:12px;color:var(--muted)">Ability ${medStaff.ability} — gives injured players a ${Math.round(medStaff.ability/220*100)}% weekly chance of an extra week's recovery.</p>
      </div>
      <div style="font-size:22px;color:var(--green)">+</div>
    </div>` : injured.length ? `<div class="card" style="padding:10px 14px;margin-bottom:12px"><p style="color:var(--muted);font-size:12px;margin:0">No medical staff hired. A Physio on staff gives injured players a weekly chance of accelerated recovery. <span class="click" style="color:var(--brass);cursor:pointer" onclick="UI.go('staff')">Hire one →</span></p></div>` : '';
    return `<h1 class="page">Injury Ward</h1>
    <p class="page-sub">Manage unavailable players. Playing through minor injuries allows selection, but increases re-injury risk and can worsen the injury.</p>
    <div class="btnrow"><button class="btn" onclick="UI.go('teamsheet')">Team sheet</button><button class="btn" onclick="UI.go('squad')">Squad</button></div>
    ${medCard}
    <h2 class="sec">Injuries (${injured.length})</h2>
    <div class="card" style="padding:6px;overflow-x:auto"><table><thead><tr><th class="noclick">Player</th><th class="noclick">Injury</th><th class="noclick num">ETA</th><th class="noclick num">Cond</th><th class="noclick">Status</th><th class="noclick"></th></tr></thead><tbody>
      ${injured.map(row).join('') || '<tr><td colspan="6" style="color:var(--muted)">No current injuries — clean bill of health.</td></tr>'}
    </tbody></table></div>
    <h2 class="sec">Suspensions (${suspended.length})</h2>
    <div class="card" style="padding:6px;overflow-x:auto"><table><thead><tr><th class="noclick">Player</th><th class="noclick">Pos</th><th class="noclick num">Weeks</th><th class="noclick num">Returns</th></tr></thead><tbody>
      ${suspended.map(p=>{
        const ret = G.round + (p.suspended.weeks||0);
        const retStr = ret > totalRounds ? 'Post-season' : `Round ${ret + 1}`;
        return `<tr class="click" onclick="UI.playerModal(${p.id})"><td><b>${esc(p.name)}</b></td><td><span class="pos-tag">${p.pos}</span></td><td class="num">${p.suspended.weeks}</td><td class="num" style="color:var(--muted)">${retStr}</td></tr>`;
      }).join('') || '<tr><td colspan="4" style="color:var(--muted)">No current suspensions.</td></tr>'}
    </tbody></table></div>`;
  },
  togglePlayInjured(id){
    const p = G.players[id]; if(!p || !p.injury) return;
    const allowed = p.injury.weeks <= 2 && !/ACL|Pectoral|Broken|Syndesmosis/i.test(p.injury.n);
    if(!allowed){ UI.toast('That injury is too serious to play through.'); return; }
    p.playInjured = !p.playInjured;
    UI.toast(p.playInjured ? `${p.name} can be selected while injured.` : `${p.name} removed from playing hurt list.`);
    UI.render();
  }
});
