'use strict';

/* ---------- API-based save / load ---------- */

async function listSaves(){
  try{
    const r = await fetch('/api/saves');
    if(!r.ok) return [];
    return await r.json();
  }catch{ return []; }
}

async function saveToSlot(slot){
  const meta = {
    savedAt: new Date().toISOString(),
    season:  G.season,
    round:   G.round,
    phase:   G.phase,
    year:    G.year,
    coach:   G.coach.name,
    club:    myTeam().nick,
  };
  try{
    const r = await fetch(`/api/saves/${slot}`, {
      method:  'PUT',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({minto:1, pid:_pid, G, meta}),
    });
    return r.ok;
  }catch{ return false; }
}

async function loadFromSlot(slot){
  try{
    const r = await fetch(`/api/saves/${slot}`);
    if(!r.ok) return false;
    const d = await r.json();
    if(!d.minto || !d.G) return false;
    G = d.G; _pid = d.pid || 99999;
    return true;
  }catch{ return false; }
}

async function deleteSave(slot){
  try{
    const r = await fetch(`/api/saves/${slot}`, {method:'DELETE'});
    return r.ok;
  }catch{ return false; }
}

async function autoSave(){
  if(!G) return;
  await saveToSlot('autosave');
}

/* ---------- file export / import (manual backup) ---------- */

function exportSave(){
  const blob = new Blob([JSON.stringify({minto:1, pid:_pid, G})], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `minto-save-${G.year}-r${G.round+1}.json`;
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}

function importSave(file){
  const fr = new FileReader();
  fr.onload = () => {
    try{
      const d = JSON.parse(fr.result);
      if(!d.minto || !d.G) throw new Error('bad file');
      G = d.G; _pid = d.pid || 99999;
      UI.toast('Save loaded.');
      UI.go('dashboard');
    }catch(e){ UI.toast('Could not read that save file.'); }
  };
  fr.readAsText(file);
}

/* ================================================================
   UI
   ================================================================ */
