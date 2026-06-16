'use strict';

Object.assign(UI, {
  p_injuryward(){
    const t = myTeam();
    const injured = t.players.map(id=>G.players[id]).filter(p=>p && p.injury).sort((a,b)=>b.injury.weeks-a.injury.weeks);
    const suspended = t.players.map(id=>G.players[id]).filter(p=>p && p.suspended && p.suspended.weeks>0).sort((a,b)=>b.suspended.weeks-a.suspended.weeks);
    const canPlay = p => p.injury && p.injury.weeks <= 2 && !/ACL|Pectoral|Broken|Syndesmosis/i.test(p.injury.n);
    const row = p => {
      const ok = canPlay(p);
      return `<tr class="click" onclick="UI.playerModal(${p.id})">
        <td><b>${esc(p.name)}</b> <span class="pos-tag">${p.pos}</span></td>
        <td>${esc(p.injury.n)}</td>
        <td class="num">${p.injury.weeks}</td>
        <td class="num">${Math.round(p.cond)}%</td>
        <td>${ok?'<span style="color:var(--brass)">Could play through</span>':'<span style="color:var(--red)">Unavailable</span>'}</td>
        <td onclick="event.stopPropagation()">${ok?`<button class="btn sm ${p.playInjured?'primary':''}" onclick="UI.togglePlayInjured(${p.id})">${p.playInjured?'Playing hurt':'Allow playing hurt'}</button>`:''}</td>
      </tr>`;
    };
    return `<h1 class="page">Injury Ward</h1>
    <p class="page-sub">Manage unavailable players. Playing through minor injuries allows selection, but increases re-injury risk and can worsen the injury.</p>
    <div class="btnrow"><button class="btn" onclick="UI.go('teamsheet')">Team sheet</button><button class="btn" onclick="UI.go('squad')">Squad</button></div>
    <h2 class="sec">Injuries</h2>
    <div class="card" style="padding:6px;overflow-x:auto"><table><thead><tr><th class="noclick">Player</th><th class="noclick">Injury</th><th class="noclick num">Weeks</th><th class="noclick num">Cond</th><th class="noclick">Status</th><th class="noclick"></th></tr></thead><tbody>
      ${injured.map(row).join('') || '<tr><td colspan="6" style="color:var(--muted)">No current injuries.</td></tr>'}
    </tbody></table></div>
    <h2 class="sec">Suspensions</h2>
    <div class="card" style="padding:6px;overflow-x:auto"><table><thead><tr><th class="noclick">Player</th><th class="noclick num">Weeks</th><th class="noclick">Status</th></tr></thead><tbody>
      ${suspended.map(p=>`<tr class="click" onclick="UI.playerModal(${p.id})"><td><b>${esc(p.name)}</b> <span class="pos-tag">${p.pos}</span></td><td class="num">${p.suspended.weeks}</td><td><span class="inj">Unavailable</span></td></tr>`).join('') || '<tr><td colspan="3" style="color:var(--muted)">No current suspensions.</td></tr>'}
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
