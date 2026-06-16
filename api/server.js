'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

const SAVES_DIR = process.env.SAVES_DIR || path.join(__dirname, 'saves');

if (!fs.existsSync(SAVES_DIR)) fs.mkdirSync(SAVES_DIR, { recursive: true });

function savePath(slot) {
  const clean = slot.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!clean) throw new Error('invalid slot name');
  return path.join(SAVES_DIR, clean + '.json');
}

// list all saves with metadata only (no full G payload)
app.get('/api/saves', (req, res) => {
  try {
    const files = fs.readdirSync(SAVES_DIR).filter(f => f.endsWith('.json'));
    const saves = files.map(f => {
      const slot = f.replace('.json', '');
      try {
        const raw = fs.readFileSync(path.join(SAVES_DIR, f), 'utf8');
        const d = JSON.parse(raw);
        return { slot, meta: d.meta || null };
      } catch {
        return { slot, meta: null };
      }
    }).sort((a, b) => {
      // autosave always first
      if (a.slot === 'autosave') return -1;
      if (b.slot === 'autosave') return 1;
      const ta = a.meta?.savedAt || '';
      const tb = b.meta?.savedAt || '';
      return tb.localeCompare(ta);
    });
    res.json(saves);
  } catch {
    res.json([]);
  }
});

// load a specific save
app.get('/api/saves/:slot', (req, res) => {
  try {
    const data = fs.readFileSync(savePath(req.params.slot), 'utf8');
    res.type('json').send(data);
  } catch {
    res.status(404).json({ error: 'not found' });
  }
});

// write a save
app.put('/api/saves/:slot', (req, res) => {
  try {
    fs.writeFileSync(savePath(req.params.slot), JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// delete a save
app.delete('/api/saves/:slot', (req, res) => {
  try {
    fs.unlinkSync(savePath(req.params.slot));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Minto save API on :${PORT}`));
