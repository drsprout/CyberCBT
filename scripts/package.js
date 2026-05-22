/**
 * scripts/package.js
 * Inlines dist/bundle.js into CyberCBT.html after a webpack build.
 * Run via: npm run package
 */
const fs   = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'dist', 'bundle.js');
const outPath    = path.join(__dirname, '..', 'CyberCBT.html');

if (!fs.existsSync(bundlePath)) {
  console.error('dist/bundle.js not found — run npm run build first');
  process.exit(1);
}

const js = fs.readFileSync(bundlePath, 'utf-8');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CyberCBT</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;}
    html,body,#root{margin:0;padding:0;min-height:100%;}
    body{font-family:Roboto,Helvetica,Arial,sans-serif;background:#141413;color:#F0EFED;-webkit-font-smoothing:antialiased;}
    ::-webkit-scrollbar{width:8px;}
    ::-webkit-scrollbar-track{background:#1D1D1B;}
    ::-webkit-scrollbar-thumb{background:#3D3D3B;border-radius:4px;}
    ::-webkit-scrollbar-thumb:hover{background:#D4002B;}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>${js}</script>
</body>
</html>`;

fs.writeFileSync(outPath, html, 'utf-8');
console.log(`CyberCBT.html written (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
