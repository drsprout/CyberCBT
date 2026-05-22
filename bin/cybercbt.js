#!/usr/bin/env node
/**
 * cybercbt CLI
 * Usage:
 *   npx cybercbt            — start server on port 3001
 *   npx cybercbt --port 8080
 *   npx cybercbt --open     — open CyberCBT.html in browser after starting
 */
const path = require('path');
const args = process.argv.slice(2);

const portIdx = args.indexOf('--port');
if (portIdx !== -1) process.env.PORT = args[portIdx + 1];

const open = args.includes('--open');

// Start server
require(path.join(__dirname, '..', 'server.js'));

if (open) {
  setTimeout(() => {
    const port = process.env.PORT || 3001;
    const url  = `http://localhost:${port}`;
    const { exec } = require('child_process');
    const cmd = process.platform === 'win32' ? `start ${url}`
              : process.platform === 'darwin' ? `open ${url}`
              : `xdg-open ${url}`;
    exec(cmd);
    console.log(`Opening ${url} in your browser...`);
  }, 1000);
}
