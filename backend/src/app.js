const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: '🎯 Live Polling System API',
    status: 'Running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = app;