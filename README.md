# CyberCBT

> NCSC-aligned staff cyber security computer-based training.

![NCSC-Aligned](https://img.shields.io/badge/NCSC-Aligned-D4002B?style=flat-square)
![License](https://img.shields.io/badge/License-OGL--v3-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)

---

## Features

- **4 training modules · 30 questions each** — Phishing, Passwords, Devices, Reporting (NCSC *Top Tips for Staff*)
- **Multi-select questions** — some questions require all correct answers to score
- **Resume mid-quiz** — progress saved after every answer; pick up where you left off
- **Configurable question count** — admin sets 10, 20 or 30 questions per module
- **User approval flow** — admin must approve registrations before users can sign in
- **Math CAPTCHA** — visible arithmetic challenge on login and register; no external service
- **Certificates** — auto-issued on passing; printable/downloadable HTML certificate
- **Analytics** — per-user trends, radar chart, score-over-time line chart
- **Admin panel** — completion matrix, at-risk users, pending approvals, module metrics, deadlines
- **Completion report** — CSV export, per-user per-module breakdown
- **Notification system** — bell icon with pending approvals, overdue deadlines, due-soon alerts
- **SQL backend** — SQLite (default) or PostgreSQL via `DB_URL`; falls back to browser localStorage
- **Dark theme** — Material Design v5 with customisable brand colours
- **Single-file deployment** — `CyberCBT.html` runs in any browser with no install

---

## Quick start

### 1. Run the SQL server (recommended)

```bash
npm install express sql.js cors
node server.js
```

Server starts at `http://localhost:3001`. Uses `cybercbt.db` (SQLite) by default.

**PostgreSQL** — set the environment variable before starting:

```bash
DB_URL=postgres://user:pass@host:5432/cybercbt node server.js
```

### 2. Open the app

Open `CyberCBT.html` in any modern browser (Chrome, Edge, Firefox).  
The app connects to `http://localhost:3001` by default.

### 3. First user = admin

The first person to register gets the **admin** role automatically and is approved instantly.  
All subsequent registrations are **pending** until an admin approves them.

---

## Building from source

```bash
npm install
npm run build       # runs webpack → dist/bundle.js
```

---

## Project structure

```
├── src/
│   ├── App.jsx          # Full React app (MUI dark theme, all views)
│   ├── api.js           # Data layer — localStorage or remote SQL REST
│   └── index.jsx        # Entry point
├── server.js            # Node/Express REST API (SQLite / PostgreSQL)
├── webpack.config.js    # Build config
├── package.json
└── CyberCBT.html      # Built single-file app (open in browser)
```

---

## Admin features

| Feature | How to access |
|---|---|
| Approve / reject users | Admin Panel → Pending approvals |
| Completion matrix | Admin Panel → Completion matrix |
| Per-module metrics | Admin Panel → Module metrics |
| Set pass mark, question count | Admin Panel → Settings |
| Set deadlines per module | Admin Panel → Settings |
| Export CSV report | Admin Panel → Export CSV |
| Wipe / delete any user | Admin Panel → Users |

---

## Content & licensing

Course content adapted from the NCSC *Top Tips for Staff* e-learning and supporting guidance at [ncsc.gov.uk](https://www.ncsc.gov.uk).  
UK Crown Copyright, Open Government Licence v3.0.

---

## Server environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the server listens on |
| `JWT_SECRET` | *(insecure default)* | **Change in production** — long random string |
| `DB_URL` | *(unset — uses SQLite)* | PostgreSQL connection string |
| `DB_FILE` | `cybercbt.db` | SQLite file path |
