const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'chairs.json');

function readState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { chairs: {} };
  }
}

function writeState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/chairs
// Body: { chairId: string, is_occupied: boolean }
app.post('/api/chairs', (req, res) => {
  const { chairId, is_occupied } = req.body || {};

  if (!chairId || typeof is_occupied !== 'boolean') {
    return res.status(400).json({ error: 'chairId (string) and is_occupied (boolean) are required' });
  }

  const state = readState();
  const previous = state.chairs[chairId] || null;

  state.chairs[chairId] = {
    is_occupied,
    updatedAt: new Date().toISOString(),
  };

  try {
    writeState(state);
  } catch (err) {
    console.error('Failed to write state:', err);
  }

  console.log(`Chair update: ${chairId} -> ${is_occupied} (prev: ${previous ? previous.is_occupied : 'unknown'})`);

  res.json({ success: true, previous, current: state.chairs[chairId] });
});

// GET current state
app.get('/api/chairs', (req, res) => {
  const state = readState();
  res.json(state);
});

const os = require('os');

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // bind to all interfaces so the server is reachable on the LAN

// Optional API key middleware: if API_KEY env var is set, require header 'x-api-key'
if (process.env.API_KEY) {
  app.use((req, res, next) => {
    const key = req.get('x-api-key') || req.get('X-API-KEY');
    if (key !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Missing or invalid API key' });
    }
    next();
  });
}

function listLocalAddresses() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

app.listen(PORT, HOST, () => {
  console.log(`Chair-tracking server listening on ${HOST}:${PORT}`);
  const addrs = listLocalAddresses();
  if (addrs.length) {
    console.log('Accessible on your LAN at:');
    addrs.forEach(a => console.log(`  http://${a}:${PORT}`));
  } else {
    console.log('No non-internal IPv4 addresses found; access via localhost only.');
  }
});
