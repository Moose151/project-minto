'use strict';

/* Staff — assistant coaches, fitness & kicking coaches */
Object.assign(UI, {
  _staffMarket: null,

  p_staff(){
    const staff = G.staff || [];
    const weeks = Math.max(1, (G.fixtures ? G.fixtures.length : 24) + 3);

    const roleInfo = key => STAFF_ROLES.find(r => r.key === key) || {label: key, desc: '', trainingKeys: []};
    const abilityBar = ability => {
      const cls = ability >= 75 ? 'var(--green)' : ability >= 55 ? 'var(--brass)' : 'var(--red)';
      return `<div style="display:flex;align-items:center;gap:6px">
        <div style="flex:1;height:6px;background:var(--card2);border-radius:3px;overflow:hidden">
          <div style="width:${ability}%;height:100%;background:${cls}"></div>
        </div>
        <span style="font-size:12px;font-weight:700;color:${cls};min-width:24px">${ability}</span>
      </div>`;
    };

    const totalStaffSal = staff.reduce((s, x) => s + (x.salary || 0), 0);
    const weeklyStaffCost = staff.length ? Math.round(totalStaffSal / weeks) : 0;

    const specialtyLabel = s => s.posSpecialty ? `${POS_NAME[s.posSpecialty] || s.posSpecialty} Specialist` : '';
    const staffAffects = (s, info) => {
      const base = info.trainingKeys.length ? info.trainingKeys.slice(0,5).map(k=>ATTR_LABEL[k]||k).join(', ') : (info.key==='youth'?'Youth development':'');
      const spec = s.posSpecialty && POS_PROFILE[s.posSpecialty]
        ? `Retraining: ${POS_NAME[s.posSpecialty]} · Key skills: ${Object.entries(POS_PROFILE[s.posSpecialty]).filter(([,v])=>v[1]>=.07).map(([k])=>ATTR_LABEL[k]||k).slice(0,4).join(', ')}`
        : '';
      return [base, spec].filter(Boolean).join(' · ');
    };
    const staffCards = staff.length ? staff.map(s => {
      const info = roleInfo(s.role);
      const affects = staffAffects(s, info);
      const specLbl = specialtyLabel(s);
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <b style="font-size:15px">${esc(s.name)}</b>
            <p style="margin:2px 0;color:var(--brass);font-size:12px;font-weight:600">${esc(info.label)}${specLbl?` <span style="color:var(--blue);font-weight:500">· ${esc(specLbl)}</span>`:''}</p>
            <p style="margin:2px 0;color:var(--muted);font-size:11px">${esc(info.desc)}</p>
          </div>
          <button class="btn sm" style="color:var(--red)" onclick="UI.fireStaff(${s.id})">Fire</button>
        </div>
        <div style="margin:6px 0">${abilityBar(s.ability)}</div>
        <div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap">
          <span style="font-size:12px;color:var(--muted)">Contract: <b>${s.yearsLeft} yr${s.yearsLeft===1?'':'s'}</b></span>
          <span style="font-size:12px;color:var(--muted)">Salary: <b>${money(s.salary)}</b></span>
        </div>
        <p style="margin:6px 0 0;font-size:11px;color:var(--dim)">Boosts: ${esc(affects)}</p>
      </div>`;
    }).join('') : `<div class="card"><p style="color:var(--muted)">No assistant staff hired. Browse the market below to hire coaches.</p></div>`;

    // Generate market if not cached or stale
    if(!UI._staffMarket || UI._staffMarket.year !== G.year){
      UI._staffMarket = { year: G.year, list: UI._genStaffMarket() };
    }
    const market = UI._staffMarket.list.filter(s => !staff.some(x => x.id === s.id));

    const marketRows = market.map(s => {
      const info = roleInfo(s.role);
      const alreadyHaveRole = staff.some(x => x.role === s.role);
      const affects = staffAffects(s, info);
      const specLbl = specialtyLabel(s);
      return `<tr>
        <td><b>${esc(s.name)}</b><br><span style="font-size:11px;color:var(--brass)">${esc(info.label)}${specLbl?` · ${esc(specLbl)}`:''}</span></td>
        <td>${abilityBar(s.ability)}</td>
        <td class="num">${money(s.salary)}</td>
        <td class="num">${s.yearsLeft}yr</td>
        <td style="font-size:11px;color:var(--muted);max-width:180px">${esc(affects)}</td>
        <td>
          ${alreadyHaveRole
            ? `<span style="font-size:11px;color:var(--dim)" title="You already have a ${info.label}">Role filled</span>`
            : `<button class="btn sm primary" onclick="UI.hireStaff(${s.id})">Hire</button>`}
        </td>
      </tr>`;
    }).join('');

    return `<h1 class="page">Staff</h1>
    <p class="page-sub">Assistant coaches improve player development in their specialty area. Staff salaries are paid from club funds.</p>
    <div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">
      <div class="card" style="padding:10px 16px;flex:1;min-width:140px">
        <span style="font-size:11px;color:var(--muted)">Staff employed</span>
        <div style="font-size:22px;font-weight:700;font-family:var(--disp)">${staff.length}</div>
      </div>
      <div class="card" style="padding:10px 16px;flex:1;min-width:140px">
        <span style="font-size:11px;color:var(--muted)">Total staff salary</span>
        <div style="font-size:22px;font-weight:700;font-family:var(--disp)">${money(totalStaffSal)}</div>
      </div>
      <div class="card" style="padding:10px 16px;flex:1;min-width:140px">
        <span style="font-size:11px;color:var(--muted)">Weekly staff cost</span>
        <div style="font-size:22px;font-weight:700;font-family:var(--disp)">${money(weeklyStaffCost)}</div>
      </div>
    </div>
    <h2 class="sec">Current Staff (${staff.length})</h2>
    <div class="grid3" style="margin-bottom:16px">${staffCards}</div>
    <h2 class="sec">Available on Market</h2>
    <p style="font-size:12px;color:var(--muted);margin:-6px 0 10px">Market refreshes each season. You can only have one coach per role.</p>
    <div class="card" style="padding:6px;overflow-x:auto">
      <table>
        <thead><tr>
          <th class="noclick">Name</th>
          <th class="noclick" style="min-width:100px">Ability</th>
          <th class="noclick num">Salary</th>
          <th class="noclick num">Length</th>
          <th class="noclick">Boosts</th>
          <th class="noclick"></th>
        </tr></thead>
        <tbody>${marketRows || '<tr><td colspan="6" style="color:var(--muted)">No available staff on the market.</td></tr>'}</tbody>
      </table>
    </div>`;
  },

  _genStaffMarket(){
    const list = [];
    const usedSpecialties = {};
    for(const role of STAFF_ROLES){
      const n = role.key === 'youth' ? 1 : 2;
      for(let i = 0; i < n; i++){
        const ability = clamp(Math.round(35 + Math.random() * 50), 25, 90);
        const name = `${pick(FIRST)} ${pick(LAST)}`;
        const salary = Math.round((40000 + Math.pow(ability/90, 2.2)*260000)/5000)*5000;
        const yearsLeft = 1 + Math.floor(Math.random() * 3);
        let posSpecialty = null;
        if(role.canHaveSpecialty){
          const tried = usedSpecialties[role.key] || [];
          const remaining = POS.filter(p => !tried.includes(p));
          posSpecialty = pick(remaining.length ? remaining : POS);
          usedSpecialties[role.key] = [...tried, posSpecialty];
        }
        const s = {id: 9000 + list.length + 1, name, role: role.key, ability, salary, yearsLeft};
        if(posSpecialty) s.posSpecialty = posSpecialty;
        list.push(s);
      }
    }
    return list;
  },

  hireStaff(id){
    const market = (UI._staffMarket && UI._staffMarket.list) || [];
    const s = market.find(x => x.id === id);
    if(!s){ UI.toast('Staff member not found.'); return; }
    if((G.staff || []).some(x => x.role === s.role)){
      UI.toast(`You already have a ${STAFF_ROLES.find(r=>r.key===s.role)?.label || s.role}.`);
      return;
    }
    G.staff = G.staff || [];
    G.staff.push(s);
    UI.toast(`${s.name} hired as ${STAFF_ROLES.find(r=>r.key===s.role)?.label || s.role}.`);
    UI.render();
  },

  fireStaff(id){
    if(!G.staff) return;
    const s = G.staff.find(x => x.id === id);
    if(!s) return;
    UI.modal(`<h3>Fire ${esc(s.name)}?</h3>
      <p class="page-sub">This will remove them from your coaching staff immediately.</p>
      <div class="btnrow">
        <button class="btn primary" onclick="UI._confirmFireStaff(${id})">Confirm</button>
        <button class="btn" onclick="UI.closeModal()">Cancel</button>
      </div>`);
  },

  _confirmFireStaff(id){
    G.staff = (G.staff || []).filter(s => s.id !== id);
    UI.closeModal();
    UI.toast('Staff member released.');
    UI.render();
  },
});
