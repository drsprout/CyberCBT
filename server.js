/**
 * server.js — CyberCBT SQL backend
 * =====================================
 * New: user approval flow (status: pending/approved/rejected)
 *      questionCount setting (10 | 20 | 30)
 *
 * QUICK START (SQLite):
 *   npm install express better-sqlite3 cors
 *   node server.js
 *
 * POSTGRESQL:
 *   npm install express pg cors
 *   DB_URL=postgres://user:pass@host:5432/cybercbt node server.js
 *
 * ENV:  PORT, JWT_SECRET, DB_URL, DB_FILE
 */

const express = require('express');
const crypto  = require('crypto');
const path    = require('path');
const fs      = require('fs');

const PORT       = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-use-a-long-random-string';
const DB_URL     = process.env.DB_URL;



// ── DB abstraction ─────────────────────────────────────────────────────────────
// PostgreSQL when DB_URL is set; otherwise sql.js (pure-JS SQLite, no native deps)
let db;
if (DB_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DB_URL });
  db = {
    async run(sql, p=[]) { let n=0; const s=sql.replace(/\?/g,()=>`$${++n}`); await pool.query(s,p); },
    async get(sql, p=[]) { let n=0; const s=sql.replace(/\?/g,()=>`$${++n}`); const r=await pool.query(s,p); return r.rows[0]; },
    async all(sql, p=[]) { let n=0; const s=sql.replace(/\?/g,()=>`$${++n}`); const r=await pool.query(s,p); return r.rows; },
  };
} else {
  // sql.js — pure JavaScript SQLite, zero native dependencies, no deprecated packages
  const initSqlJs = require('sql.js');
  const dbFile    = process.env.DB_FILE || path.join(__dirname, 'cybercbt.db');
  let   sqlDb;   // sql.js Database instance (in-memory, flushed to disk after writes)

  function saveDb() {
    try { fs.writeFileSync(dbFile, Buffer.from(sqlDb.export())); } catch {}
  }

  // Load or create the database file
  async function loadDb() {
    const SQL = await initSqlJs();
    if (fs.existsSync(dbFile)) {
      sqlDb = new SQL.Database(fs.readFileSync(dbFile));
    } else {
      sqlDb = new SQL.Database();
    }
    sqlDb.run('PRAGMA foreign_keys = ON');
  }

  // We expose the same async interface as the pg adapter.
  // sql.js is synchronous internally but we wrap in async for API consistency.
  db = {
    _ready: null,
    ensureReady() {
      if (!this._ready) this._ready = loadDb();
      return this._ready;
    },
    async run(sql, p=[]) {
      await this.ensureReady();
      sqlDb.run(sql, p);
      saveDb();
    },
    async get(sql, p=[]) {
      await this.ensureReady();
      const stmt = sqlDb.prepare(sql);
      stmt.bind(p);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    async all(sql, p=[]) {
      await this.ensureReady();
      const stmt   = sqlDb.prepare(sql);
      stmt.bind(p);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
  };
}

// ── Schema ─────────────────────────────────────────────────────────────────────
async function initDb() {
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    username     TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    password     TEXT NOT NULL,
    role         TEXT NOT NULL DEFAULT 'user',
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT NOT NULL
  )`);

  // Migrations for existing databases
  for (const col of [
    `ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'`,
  ]) { try { await db.run(col); } catch {} }

  await db.run(`CREATE TABLE IF NOT EXISTS attempts (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id  TEXT NOT NULL,
    correct    INTEGER NOT NULL,
    total      INTEGER NOT NULL,
    pct        INTEGER NOT NULL,
    responses  TEXT NOT NULL,
    duration   INTEGER NOT NULL DEFAULT 0,
    ts         INTEGER NOT NULL
  )`);
  try { await db.run(`ALTER TABLE attempts ADD COLUMN duration INTEGER NOT NULL DEFAULT 0`); } catch {}

  await db.run(`CREATE TABLE IF NOT EXISTS progress (
    user_id    TEXT NOT NULL,
    module_id  TEXT NOT NULL,
    q_index    INTEGER NOT NULL DEFAULT 0,
    responses  TEXT NOT NULL DEFAULT '[]',
    started_at INTEGER NOT NULL DEFAULT 0,
    saved_at   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, module_id)
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS certificates (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id    TEXT NOT NULL,
    module_title TEXT NOT NULL DEFAULT '',
    pct          INTEGER NOT NULL,
    issued_at    TEXT NOT NULL,
    org_name     TEXT NOT NULL DEFAULT 'Comp X',
    UNIQUE(user_id, module_id)
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Seed default settings if empty
  const defaults = {
    passMark:           60,
    questionCount:      30,
    orgName:            'Comp X',
    deadlines:          {},
    leaderboardEnabled: true,
    certEnabled:        true,
  };
  for (const [key, val] of Object.entries(defaults)) {
    const ex = await db.get('SELECT key FROM settings WHERE key=?',[key]);
    if (!ex) await db.run('INSERT INTO settings (key,value) VALUES (?,?)',[key,JSON.stringify(val)]);
  }
}

// ── JWT ────────────────────────────────────────────────────────────────────────
function b64url(data) {
  return Buffer.isBuffer(data) ? data.toString('base64url') : Buffer.from(data).toString('base64url');
}
function signToken(payload) {
  const h = b64url(JSON.stringify({ alg:'HS256', typ:'JWT' }));
  const b = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now()/1000)+86400*30 }));
  const s = b64url(crypto.createHmac('sha256',JWT_SECRET).update(`${h}.${b}`).digest());
  return `${h}.${b}.${s}`;
}
function verifyToken(token) {
  try {
    const [h,b,s] = (token||'').split('.');
    if (!h||!b||!s) return null;
    const exp = b64url(crypto.createHmac('sha256',JWT_SECRET).update(`${h}.${b}`).digest());
    if (s!==exp) return null;
    const payload = JSON.parse(Buffer.from(b,'base64url').toString());
    if (payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload;
  } catch { return null; }
}
function hashPw(pw)        { return crypto.createHash('sha256').update(pw+JWT_SECRET).digest('hex'); }
function checkPw(pw, hash) { return hashPw(pw)===hash; }
function uid()             { return crypto.randomBytes(8).toString('hex'); }

function userRow(r) {
  if (!r) return null;
  return { id:r.id, username:r.username, displayName:r.display_name||r.username, role:r.role, status:r.status||'approved', createdAt:r.created_at };
}
function attemptRow(r) {
  if (!r) return null;
  return { id:r.id, moduleId:r.module_id, correct:r.correct, total:r.total, pct:r.pct, duration:r.duration||0, ts:r.ts, responses:typeof r.responses==='string'?JSON.parse(r.responses):(r.responses||[]) };
}
function certRow(r) {
  if (!r) return null;
  return { id:r.id, moduleId:r.module_id, moduleTitle:r.module_title, pct:r.pct, issuedAt:r.issued_at, orgName:r.org_name };
}

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
app.use(require('cors')());
app.use(express.json());

function auth(req,res,next) {
  const t = (req.headers.authorization||'').replace('Bearer ','');
  const p = verifyToken(t);
  if (!p) return res.status(401).json({ error:'Unauthorised' });
  req.userId=p.sub; req.role=p.role; next();
}
function adminOnly(req,res,next) {
  if (req.role!=='admin') return res.status(403).json({ error:'Forbidden' });
  next();
}

// ── AUTH ───────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req,res) => {
  try {
    const { username, password, displayName='' } = req.body;
    // Honeypot: if 'website' field is filled, silently reject (bot)
    if (req.body.website) return res.status(400).json({ error:'Registration failed' });
    if (!username||!password||password.length<8)
      return res.status(400).json({ error:'Username and password (min 8 chars) required' });
    if (await db.get('SELECT id FROM users WHERE username=?',[username]))
      return res.status(409).json({ error:'Username already taken' });
    const all    = await db.all('SELECT id FROM users');
    const isFirst = all.length===0;
    const role   = isFirst ? 'admin' : 'user';
    const status = isFirst ? 'approved' : 'pending';  // first user auto-approved
    const id     = uid();
    const now    = new Date().toISOString();
    const dn     = (displayName||'').trim() || username;
    await db.run(
      'INSERT INTO users (id,username,display_name,password,role,status,created_at) VALUES (?,?,?,?,?,?,?)',
      [id, username, dn, hashPw(password), role, status, now]
    );
    const user = { id, username, displayName:dn, role, status, createdAt:now };
    // Only issue token if approved (first user)
    const token = isFirst ? signToken({sub:id,role}) : null;
    res.json({ token, user });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/auth/login', async (req,res) => {
  try {
    const { username, password } = req.body;
    // Honeypot
    if (req.body.website) return res.status(400).json({ error:'Login failed' });
    const row = await db.get('SELECT * FROM users WHERE username=?',[username]);
    if (!row||!checkPw(password,row.password))
      return res.status(401).json({ error:'Invalid username or password' });
    if (row.status==='pending')  return res.status(403).json({ error:'PENDING' });
    if (row.status==='rejected') return res.status(403).json({ error:'REJECTED' });
    const user = userRow(row);
    res.json({ token:signToken({sub:user.id,role:user.role}), user });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/me', auth, async (req,res) => {
  const row = await db.get('SELECT * FROM users WHERE id=?',[req.userId]);
  res.json(userRow(row)||{});
});

// ── ATTEMPTS ──────────────────────────────────────────────────────────────────
app.get('/api/attempts', auth, async (req,res) => {
  try {
    const rows = await db.all('SELECT * FROM attempts WHERE user_id=? ORDER BY ts ASC',[req.userId]);
    res.json(rows.map(attemptRow));
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/attempts', auth, async (req,res) => {
  try {
    const { moduleId, correct, total, pct, responses, duration=0 } = req.body;
    if (!moduleId) return res.status(400).json({ error:'moduleId required' });
    const id=uid(), ts=Date.now();
    await db.run(
      'INSERT INTO attempts (id,user_id,module_id,correct,total,pct,responses,duration,ts) VALUES (?,?,?,?,?,?,?,?,?)',
      [id,req.userId,moduleId,correct,total,pct,JSON.stringify(responses||[]),duration||0,ts]
    );
    res.json({ id, moduleId, correct, total, pct, duration:duration||0, ts, responses:responses||[] });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.delete('/api/attempts', auth, async (req,res) => {
  try { await db.run('DELETE FROM attempts WHERE user_id=?',[req.userId]); res.json({deleted:true}); }
  catch(e) { res.status(500).json({error:e.message}); }
});

// ── PROGRESS ──────────────────────────────────────────────────────────────────
app.post('/api/progress', auth, async (req,res) => {
  try {
    const { moduleId, qIndex, responses, startedAt } = req.body;
    if (!moduleId) return res.status(400).json({error:'moduleId required'});
    const savedAt = Date.now();
    const ex = await db.get('SELECT user_id FROM progress WHERE user_id=? AND module_id=?',[req.userId,moduleId]);
    if (ex) {
      await db.run('UPDATE progress SET q_index=?,responses=?,started_at=?,saved_at=? WHERE user_id=? AND module_id=?',
        [qIndex||0,JSON.stringify(responses||[]),startedAt||savedAt,savedAt,req.userId,moduleId]);
    } else {
      await db.run('INSERT INTO progress (user_id,module_id,q_index,responses,started_at,saved_at) VALUES (?,?,?,?,?,?)',
        [req.userId,moduleId,qIndex||0,JSON.stringify(responses||[]),startedAt||savedAt,savedAt]);
    }
    res.json({saved:true,savedAt});
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.get('/api/progress/:moduleId', auth, async (req,res) => {
  try {
    const row = await db.get('SELECT * FROM progress WHERE user_id=? AND module_id=?',[req.userId,req.params.moduleId]);
    if (!row) return res.json(null);
    res.json({ moduleId:row.module_id, qIndex:row.q_index, responses:JSON.parse(row.responses||'[]'), startedAt:row.started_at, savedAt:row.saved_at });
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.delete('/api/progress/:moduleId', auth, async (req,res) => {
  try { await db.run('DELETE FROM progress WHERE user_id=? AND module_id=?',[req.userId,req.params.moduleId]); res.json({deleted:true}); }
  catch(e) { res.status(500).json({error:e.message}); }
});

// ── CERTIFICATES ──────────────────────────────────────────────────────────────
app.get('/api/certificates', auth, async (req,res) => {
  try { const rows=await db.all('SELECT * FROM certificates WHERE user_id=? ORDER BY issued_at DESC',[req.userId]); res.json(rows.map(certRow)); }
  catch(e) { res.status(500).json({error:e.message}); }
});

app.post('/api/certificates', auth, async (req,res) => {
  try {
    const { moduleId, moduleTitle='', pct, orgName='Comp X' } = req.body;
    if (!moduleId) return res.status(400).json({error:'moduleId required'});
    const id=`cert-${req.userId}-${moduleId}`, now=new Date().toISOString();
    const ex = await db.get('SELECT id,pct FROM certificates WHERE user_id=? AND module_id=?',[req.userId,moduleId]);
    if (ex) {
      if (pct>ex.pct) await db.run('UPDATE certificates SET pct=?,issued_at=?,module_title=?,org_name=? WHERE user_id=? AND module_id=?',[pct,now,moduleTitle,orgName,req.userId,moduleId]);
    } else {
      await db.run('INSERT INTO certificates (id,user_id,module_id,module_title,pct,issued_at,org_name) VALUES (?,?,?,?,?,?,?)',[id,req.userId,moduleId,moduleTitle,pct,now,orgName]);
    }
    res.json({id,moduleId,moduleTitle,pct,issuedAt:now,orgName});
  } catch(e) { res.status(500).json({error:e.message}); }
});

// ── SETTINGS ──────────────────────────────────────────────────────────────────
app.get('/api/settings', async (req,res) => {
  try {
    const rows = await db.all('SELECT key,value FROM settings');
    const obj  = Object.fromEntries(rows.map(r=>[r.key,JSON.parse(r.value)]));
    res.json({ passMark:60, questionCount:30, orgName:'Comp X', deadlines:{}, leaderboardEnabled:true, certEnabled:true, ...obj });
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.post('/api/settings', auth, adminOnly, async (req,res) => {
  try {
    for (const [key,val] of Object.entries(req.body)) {
      const ex = await db.get('SELECT key FROM settings WHERE key=?',[key]);
      if (ex) await db.run('UPDATE settings SET value=? WHERE key=?',[JSON.stringify(val),key]);
      else    await db.run('INSERT INTO settings (key,value) VALUES (?,?)',[key,JSON.stringify(val)]);
    }
    res.json({saved:true});
  } catch(e) { res.status(500).json({error:e.message}); }
});

// ── USER SELF-SERVICE ─────────────────────────────────────────────────────────
app.delete('/api/users/me', auth, async (req,res) => {
  try { await db.run('DELETE FROM users WHERE id=?',[req.userId]); res.json({deleted:true}); }
  catch(e) { res.status(500).json({error:e.message}); }
});

// ── ADMIN — USERS ─────────────────────────────────────────────────────────────
app.get('/api/admin/users', auth, adminOnly, async (req,res) => {
  try {
    const users    = await db.all('SELECT * FROM users');
    const attCounts= await db.all('SELECT user_id, COUNT(*) as n FROM attempts GROUP BY user_id');
    const certCounts=await db.all('SELECT user_id, COUNT(*) as n FROM certificates GROUP BY user_id');
    const attMap   = Object.fromEntries(attCounts.map(c=>[c.user_id,c.n]));
    const certMap  = Object.fromEntries(certCounts.map(c=>[c.user_id,c.n]));
    res.json(users.map(u=>({ ...userRow(u), attempts:attMap[u.id]||0, certs:certMap[u.id]||0 })));
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.get('/api/admin/users/pending', auth, adminOnly, async (req,res) => {
  try {
    const rows = await db.all("SELECT * FROM users WHERE status='pending' ORDER BY created_at ASC");
    res.json(rows.map(userRow));
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.post('/api/admin/users/:id/approve', auth, adminOnly, async (req,res) => {
  try {
    await db.run("UPDATE users SET status='approved' WHERE id=?",[req.params.id]);
    res.json({approved:true});
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.post('/api/admin/users/:id/reject', auth, adminOnly, async (req,res) => {
  try {
    await db.run("UPDATE users SET status='rejected' WHERE id=?",[req.params.id]);
    res.json({rejected:true});
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.delete('/api/admin/users/:id', auth, adminOnly, async (req,res) => {
  try { await db.run('DELETE FROM users WHERE id=?',[req.params.id]); res.json({deleted:true}); }
  catch(e) { res.status(500).json({error:e.message}); }
});

app.delete('/api/admin/users/:id/progress', auth, adminOnly, async (req,res) => {
  try {
    await db.run('DELETE FROM attempts     WHERE user_id=?',[req.params.id]);
    await db.run('DELETE FROM certificates WHERE user_id=?',[req.params.id]);
    await db.run('DELETE FROM progress     WHERE user_id=?',[req.params.id]);
    res.json({deleted:true});
  } catch(e) { res.status(500).json({error:e.message}); }
});

// ── ADMIN — REPORT ────────────────────────────────────────────────────────────
app.get('/api/admin/report', auth, adminOnly, async (req,res) => {
  try {
    const settingsRows = await db.all('SELECT key,value FROM settings');
    const settingsObj  = Object.fromEntries(settingsRows.map(r=>[r.key,JSON.parse(r.value)]));
    const pm           = Number(settingsObj.passMark)||60;
    const users        = await db.all("SELECT * FROM users WHERE status='approved'");
    const attempts     = await db.all('SELECT * FROM attempts ORDER BY ts ASC');
    const certs        = await db.all('SELECT * FROM certificates');
    const moduleIds    = req.query.modules ? req.query.modules.split(',') : [...new Set(attempts.map(a=>a.module_id))];
    const report = users.map(u=>{
      const ua=attempts.filter(a=>a.user_id===u.id);
      const uc=certs.filter(c=>c.user_id===u.id);
      const modules=moduleIds.map(mid=>{
        const ma=ua.filter(a=>a.module_id===mid).sort((a,b)=>a.ts-b.ts);
        const best=ma.length?Math.max(...ma.map(a=>a.pct)):null;
        const latest=ma.length?ma[ma.length-1]:null;
        const cert=uc.find(c=>c.module_id===mid);
        return { moduleId:mid, attempts:ma.length, best, latestPct:latest?.pct??null, latestTs:latest?.ts??null, passed:best!==null&&best>=pm, certified:!!cert, certDate:cert?.issued_at??null, duration:latest?.duration??null };
      });
      return { user:userRow(u), modules, allPassed:modules.length>0&&modules.every(m=>m.passed), totalAttempts:ua.length, totalTime:ua.reduce((s,a)=>s+(a.duration||0),0) };
    });
    res.json(report);
  } catch(e) { res.status(500).json({error:e.message}); }
});

// ── START ──────────────────────────────────────────────────────────────────────
initDb().then(()=>{
  app.listen(PORT,()=>{
    console.log(`CyberCBT server on http://localhost:${PORT}`);
    console.log(`DB: ${DB_URL?'PostgreSQL':'SQLite (cybercbt.db)'}`);
  });
}).catch(e=>{ console.error('DB init failed:',e); process.exit(1); });
