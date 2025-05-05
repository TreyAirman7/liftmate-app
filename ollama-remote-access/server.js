const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
// Remove ngrok require as it's handled externally

// Load configuration
const configPath = path.join(__dirname, 'config.json');
let config = {
  ngrokAuthToken: process.env.NGROK_AUTH_TOKEN || '',
  ngrokRegion: 'us',
  port: 3500
};

if (fs.existsSync(configPath)) {
  try {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...config, ...fileConfig };
  } catch (error) {
    console.error('Error loading config file:', error);
  }
}

// Create Express app for the proxy
const app = express();
app.use(cors());
app.use(express.json());

// Store the ngrok URL
let ngrokUrl = '';

// Forward requests to Ollama
app.post('/api/chat', async (req, res) => {
  try {
    const ollamaRes = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!ollamaRes.ok) {
      const errorText = await ollamaRes.text();
      return res.status(ollamaRes.status).json({ error: 'Ollama API error', details: errorText });
    }

    const data = await ollamaRes.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding to Ollama:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ngrokUrl });
});

// Start the server (ngrok is handled externally)
const server = app.listen(config.port, () => {
  console.log(`Ollama proxy server listening on port ${config.port}`);
  // Read ngrok URL saved by start.ps1 if needed for logging or health check
  const ngrokUrlPath = path.join(__dirname, 'ngrok-url.txt');
  if (fs.existsSync(ngrokUrlPath)) {
      ngrokUrl = fs.readFileSync(ngrokUrlPath, 'utf8').trim();
      console.log(`Ngrok tunnel expected at: ${ngrokUrl} (from ngrok-url.txt)`);
  } else {
      console.warn("ngrok-url.txt not found. Health check might not report ngrok URL.");
  }
});

server.on('error', (error) => {
    console.error('Express server error:', error);
    process.exit(1);
});

// Basic graceful shutdown for the server only
function shutdownServerOnly() {
    console.log('\nShutting down Express server...');
    server.close(() => {
        console.log('Express server closed.');
        process.exit(0);
    });
    // Force exit if server doesn't close quickly
    setTimeout(() => process.exit(0), 2000);
}

process.on('SIGINT', shutdownServerOnly); // Ctrl+C
process.on('SIGTERM', shutdownServerOnly); // Termination signal

// Removed startNgrokTunnel function as ngrok is handled externally by start.ps1

