'use strict';

/* Club Management — finances, board, and club overview */
Object.assign(UI, {

  p_clubManagement(){
    const club = G.club || (G.club = {funds:1500000, seasonRevenue:0, seasonWages:0});
    ensureClubFacilities();
    const t = myTeam();
    const lad = ladder();
    const pos = lad.findIndex(r=>r.id===t.id)+1;
    const rec = lad.find(r=>r.id===t.id)||{w:0,l:0,pts:0};

    const cap = G.config ? G.config.cap : 9500000;
    const payroll = teamSalary(t);
    const capUsed = payroll / cap;
    const capRoom = cap - payroll;

    const staffWages = (G.staff||[]).reduce((s,x)=>s+(x.salary||0),0);
    const scoutWages = ((G.scouting&&G.scouting.scouts)||[]).reduce((s,x)=>s+(x.salary||0),0);
    const allNonPlayerWages = staffWages + scoutWages;

    // Board expectation
    const conf = G.coach ? G.coach.conf : 50;
    const totalTeams = G.teams.length;
    const expectedPos = G.coach && G.coach.boardTarget ? G.coach.boardTarget : Math.ceil(totalTeams * 0.5);
    const onTrack = pos <= expectedPos;
    const boardStatus = conf >= 70 ? {label:'Happy', cls:'good'} : conf >= 40 ? {label:'Satisfied', cls:''} : conf >= 20 ? {label:'Concerned', cls:'bad'} : {label:'Critical', cls:'bad'};

    // Season progress estimate (how many rounds played)
    const totalRounds = G.fixtures ? G.fixtures.length : 24;
    const roundsDone = Math.max(0, G.round);
    const seasonProgress = Math.min(1, roundsDone / Math.max(1, totalRounds));
    const projectedRevenue = seasonProgress > 0
      ? Math.round(club.seasonRevenue / seasonProgress)
      : club.seasonRevenue;
    const projectedWages = seasonProgress > 0
      ? Math.round(club.seasonWages / seasonProgress)
      : club.seasonWages;
    const projectedNet = projectedRevenue - projectedWages;

    // Cap bar colour
    const capCls = capUsed > 0.95 ? 'var(--red)' : capUsed > 0.8 ? 'var(--brass)' : 'var(--green)';

    // Funds tone
    const fundsTone = club.funds < 0 ? 'var(--red)' : club.funds > 3000000 ? 'var(--green)' : club.funds > 1000000 ? 'var(--brass)' : 'var(--ink)';

    // Revenue breakdown rows
    const totalGate = club.gateRevenue === undefined ? Math.round(club.seasonRevenue * 0.27) : club.gateRevenue;
    const totalBcast = club.broadcastRevenue === undefined ? club.seasonRevenue - totalGate : club.broadcastRevenue;
    const totalMembers = club.membershipRevenue || 0;
    const totalSponsors = club.sponsorshipRevenue || 0;

    const capBar = pct => `<div style="height:8px;background:var(--card2);border-radius:4px;overflow:hidden;margin:6px 0">
      <div style="width:${Math.min(100, Math.round(pct*100))}%;height:100%;background:${capCls}"></div></div>`;

    const fundBar = `<div style="height:8px;background:var(--card2);border-radius:4px;overflow:hidden;margin:6px 0">
      <div style="width:${Math.min(100,Math.max(0,Math.round(club.funds/5000000*100)))}%;height:100%;background:var(--brass)"></div></div>`;
    const godControls = G.godMode ? `<div class="card" style="margin-bottom:16px;border-color:rgba(200,90,79,.55)">
      <div class="god-badge" style="display:inline-flex;margin-bottom:10px">God Mode</div>
      <div class="grid2">
        <div class="field"><label>Club funds</label><input type="number" step="50000" value="${club.funds}" onchange="UI.setGodFunds(this.value)"></div>
        <div class="field"><label>Board confidence</label><input type="number" min="0" max="100" value="${Math.round(G.coach.conf)}" onchange="UI.setGodBoardConfidence(this.value)"></div>
      </div>
    </div>` : '';

    const statCard = (label, val, sub='', tone='') =>
      `<div class="card" style="padding:10px 16px;flex:1;min-width:140px">
        <span style="font-size:11px;color:var(--muted)">${label}</span>
        <div style="font-size:22px;font-weight:700;font-family:var(--disp);color:${tone||'inherit'}">${val}</div>
        ${sub ? `<div style="font-size:11px;color:var(--muted)">${sub}</div>` : ''}
      </div>`;
    const facilities = ensureClubFacilities();
    const prest = facilityPrestige();
    const facilityCard = key => {
      const def = FACILITY_DEFS[key];
      const lvl = facilityLevel(key);
      const cost = facilityUpgradeCost(key);
      const underConst = typeof facilityUnderConstruction === 'function' && facilityUnderConstruction(key);
      const constInfo = underConst && G.club.construction && G.club.construction[key];
      const weeksLeft = constInfo ? Math.max(0, constInfo.completesRound - G.round) : 0;
      const totalWeeks = constInfo ? (constInfo.completesRound - constInfo.startsRound) : 1;
      const pct = constInfo ? Math.round(100 * (1 - weeksLeft / totalWeeks)) : 0;
      const capLine = key === 'stadium'
        ? ` · capacity ${stadiumCapacity().toLocaleString()}${underConst?' (reduced during works)':''}`
        : '';
      const constBadge = underConst
        ? `<span class="pos-tag" style="background:rgba(210,165,62,.18);color:var(--brass)">🔨 Building Lv${constInfo.targetLevel} — ${weeksLeft}w left</span>`
        : '';
      const progressBar = underConst
        ? `<div style="height:4px;background:var(--line);border-radius:2px;margin:4px 0;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--brass);border-radius:2px;transition:width .3s"></div></div>`
        : `<div class="facility-bar">${Array.from({length:FACILITY_MAX}, (_,i)=>`<i class="${i<lvl?'on':''}"></i>`).join('')}</div>`;
      return `<div class="facility-row">
        <div style="min-width:0;flex:1">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
            <b>${esc(def.label)}</b>
            <div style="display:flex;gap:6px;align-items:center">
              <span class="pos-tag">Level ${lvl}/${FACILITY_MAX}</span>${constBadge}
            </div>
          </div>
          ${progressBar}
          <p style="color:var(--muted);font-size:11px;margin:3px 0 0">${esc(def.desc)}${capLine}</p>
        </div>
        <button class="btn sm ${underConst?'':'primary'}" onclick="${underConst?'':'UI.upgradeFacility(\''+key+'\')'}"
          ${!cost||underConst?'disabled':''}>
          ${underConst?'Under construction':cost?`Upgrade ${money(cost)}`:'Maxed'}
        </button>
      </div>`;
    };

    return `<h1 class="page">Club Management</h1>
    <p class="page-sub">Overview of ${esc(teamName(t))}'s finances, board standing, and season outlook.</p>
    ${godControls}

    <h2 class="sec">Board Standing</h2>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div style="flex:1;min-width:200px">
          <div style="font-size:13px;color:var(--muted)">Board sentiment</div>
          <div style="font-size:24px;font-weight:700;font-family:var(--disp);color:${boardStatus.cls==='good'?'var(--green)':boardStatus.cls==='bad'?'var(--red)':'var(--ink)'}">${boardStatus.label}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">Confidence: <b>${Math.round(conf)}%</b></div>
          <div style="height:6px;background:var(--card2);border-radius:3px;overflow:hidden;margin:6px 0;max-width:200px">
            <div style="width:${Math.round(conf)}%;height:100%;background:${conf>=70?'var(--green)':conf>=40?'var(--brass)':'var(--red)'}"></div>
          </div>
        </div>
        <div style="flex:1;min-width:200px">
          <div style="font-size:13px;color:var(--muted)">Season progress</div>
          <div style="font-size:14px;margin-top:4px">
            <b style="font-size:18px;font-family:var(--disp)">${ord(pos)}</b> of ${totalTeams}
            <span style="color:var(--muted);margin-left:8px">${rec.w}W–${rec.l}L</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">
            Board expects: <b>top ${expectedPos}</b>
            <span style="margin-left:8px;color:${onTrack?'var(--green)':'var(--red)'}">${onTrack ? '✓ On track' : '✗ Off target'}</span>
          </div>
          <div style="font-size:11px;color:var(--dim);margin-top:4px">Round ${roundsDone} of ${totalRounds}</div>
        </div>
      </div>
    </div>

    <h2 class="sec">Club Finances</h2>
    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      ${statCard('Club Funds', money(club.funds), 'Current balance', fundsTone)}
      ${statCard('Season Revenue', money(club.seasonRevenue), `Projected: ${money(projectedRevenue)}`)}
      ${statCard('Season Wages', money(club.seasonWages), `Projected: ${money(projectedWages)}`)}
      ${statCard('Ticket Price', money(club.ticketPrice || 28), 'Set on home match day')}
      ${statCard('Projected Net', money(projectedNet), 'End of season estimate', projectedNet>=0?'var(--green)':'var(--red)')}
    </div>
    ${fundBar}
    <p style="font-size:11px;color:var(--muted);margin:-4px 0 16px">Funds bar: ${money(club.funds)} of $5M target</p>

    <h2 class="sec">Facilities</h2>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div>
          <div style="font-size:11px;color:var(--muted)">Facility standard</div>
          <div style="font-family:var(--disp);font-size:24px;font-weight:700;color:${prest.cls==='good'?'var(--green)':prest.cls==='bad'?'var(--red)':'var(--brass)'}">${prest.label}</div>
        </div>
        <p style="color:var(--muted);font-size:12px;margin:0;max-width:480px">Upgrades are paid from club funds. Stadium capacity now caps home crowds and therefore the ceiling for gate receipts.</p>
      </div>
      <div class="facility-grid">${Object.keys(FACILITY_DEFS).map(facilityCard).join('')}</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div class="card">
        <div style="font-size:11px;color:var(--brass);font-weight:700;text-transform:uppercase;margin-bottom:8px">Revenue This Season</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Memberships</span><b>${money(totalMembers)}</b></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Sponsorship</span><b>${money(totalSponsors)}</b></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Gate receipts</span><b>${money(totalGate)}</b></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Broadcast share</span><b>${money(totalBcast)}</b></div>
        <div style="border-top:1px solid var(--line);margin:8px 0"></div>
        <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700"><span>Total</span><span>${money(club.seasonRevenue)}</span></div>
      </div>
      <div class="card">
        <div style="font-size:11px;color:var(--brass);font-weight:700;text-transform:uppercase;margin-bottom:8px">Wages This Season</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Player wages</span><b>${money(Math.max(0,club.seasonWages - Math.round(allNonPlayerWages * (roundsDone/Math.max(1,totalRounds+3))*3))  )}</b></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Staff wages</span><b>${money(Math.round(staffWages * (roundsDone/Math.max(1,totalRounds+3))*3))}</b></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Scouts</span><b>${money(Math.round(scoutWages * (roundsDone/Math.max(1,totalRounds+3))*3))}</b></div>
        <div style="border-top:1px solid var(--line);margin:8px 0"></div>
        <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700"><span>Total</span><span>${money(club.seasonWages)}</span></div>
      </div>
    </div>

    <h2 class="sec">Salary Cap</h2>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Cap limit</span><b>${money(cap)}</b></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0"><span style="color:var(--muted)">Player payroll</span><b>${money(payroll)}</b></div>
      ${capBar(capUsed)}
      <div style="display:flex;justify-content:space-between;font-size:13px;margin:5px 0">
        <span style="color:var(--muted)">Cap room remaining</span>
        <b style="color:${capRoom < 200000 ? 'var(--red)' : capRoom < 800000 ? 'var(--brass)' : 'var(--green)'}">${money(capRoom)}</b>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin:5px 0;color:var(--muted)">
        <span>Staff wages (outside cap)</span><span>${money(staffWages + scoutWages)}/yr</span>
      </div>
      <div class="btnrow" style="margin-top:10px">
        <button class="btn sm" onclick="UI.go('contracts')">Manage Contracts</button>
        <button class="btn sm" onclick="UI.go('recruitment')">Recruitment</button>
      </div>
    </div>

    <h2 class="sec">Quick Links</h2>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <button class="btn" onclick="UI.go('staff')">Staff</button>
      <button class="btn" onclick="UI.go('scouting')">Scouting</button>
      <button class="btn" onclick="UI.go('training')">Training</button>
      <button class="btn" onclick="UI.go('squad')">Squad</button>
      <button class="btn" onclick="UI.go('history')">History</button>
    </div>`;
  },

  // Alias for the nav key 'club-management'
  get ['p_club-management'](){
    return UI.p_clubManagement;
  },
  setGodFunds(value){
    if(!G.godMode) return;
    const club = G.club || (G.club = {funds:1500000, seasonRevenue:0, seasonWages:0});
    club.funds = Math.round(+value || 0);
    UI.toast(`Club funds set to ${money(club.funds)}.`);
    UI.render();
  },
  setGodBoardConfidence(value){
    if(!G.godMode) return;
    G.coach.conf = clamp(+value || 0, 0, 100);
    UI.toast(`Board confidence set to ${Math.round(G.coach.conf)}%.`);
    UI.render();
  },
  upgradeFacility(key){
    ensureClubFacilities();
    if(!FACILITY_DEFS[key]) return;
    const lvl = facilityLevel(key);
    if(lvl >= FACILITY_MAX){ UI.toast('That facility is already maxed.'); return; }
    if(typeof facilityUnderConstruction === 'function' && facilityUnderConstruction(key)){
      UI.toast('This facility is already under construction.'); return;
    }
    const cost = facilityUpgradeCost(key);
    if((G.club.funds || 0) < cost){ UI.toast(`Not enough club funds. Need ${money(cost)}.`); return; }
    G.club.funds = Math.round(G.club.funds - cost);
    if(!G.club.construction) G.club.construction = {};
    const FACILITY_BUILD_WEEKS_UI = {stadium:8, training:5, gym:3, medical:3, academy:5};
    const buildWeeks = FACILITY_BUILD_WEEKS_UI[key] || 4;
    G.club.construction[key] = { targetLevel: lvl + 1, completesRound: G.round + buildWeeks, startsRound: G.round };
    addNews(`${FACILITY_DEFS[key].label} upgrade to level ${lvl + 1} commenced — completion in ${buildWeeks} weeks.`, {
      title:'Construction Started',
      type:'club',
      tone:'good',
      teamId:G.coach.teamId,
      tag:'Facilities',
    });
    UI.toast(`${FACILITY_DEFS[key].label} construction started — ${buildWeeks} weeks.`);
    UI.render();
  },
});
