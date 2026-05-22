// api.js — local localStorage + remote SQL REST abstraction
// New: user approval flow (status: pending/approved/rejected)
//      questionCount setting (10 | 20 | 30)

function ls(k, d=null) {
  try { const v=localStorage.getItem(k); return v!==null ? JSON.parse(v) : d; }
  catch { return d; }
}
function lsSet(k,v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function lsDel(k)   { try { localStorage.removeItem(k); } catch {} }

export const api = {
  getMode()    { return ls('cbt:mode', 'remote'); },
  getBaseUrl() { return ls('cbt:baseUrl', 'http://localhost:3001'); },
  setMode(m)   { lsSet('cbt:mode', m); },
  setBaseUrl(u){ lsSet('cbt:baseUrl', u.replace(/\/$/, '')); },
  getToken()   { return ls('cbt:token', null); },
  getUser()    { return ls('cbt:user',  null); },

  // ── AUTH ──────────────────────────────────────────────────────────────────
  // ── PoW CAPTCHA ──────────────────────────────────────────────────────────
  async fetchPowChallenge() {
    if (api.getMode()==='remote') {
      try { return await _get('/api/captcha/challenge'); } catch { return null; }
    }
    // Local mode: generate a challenge client-side (no server to verify, so PoW is decorative)
    const salt = Math.random().toString(36).slice(2);
    return { challenge: `${salt}:${Date.now() + 300000}`, difficulty: 16, local: true };
  },

  async register(username, password, displayName='') {
    if (api.getMode()==='remote') {
      const r = await _post('/api/auth/register', { username, password, displayName });
      // r.user.status will be 'pending' or 'approved' (first user = admin + approved)
      if (r.token) { lsSet('cbt:token', r.token); lsSet('cbt:user', r.user); }
      return r;
    }
    const users = ls('cbt:users', []);
    if (users.find(u => u.username===username)) throw new Error('Username already taken');
    const isFirst = users.length === 0;
    const user = {
      id:          Date.now().toString(),
      username,
      displayName: displayName.trim() || username,
      role:        isFirst ? 'admin' : 'user',
      status:      isFirst ? 'approved' : 'pending', // first user auto-approved
      createdAt:   new Date().toISOString(),
    };
    lsSet('cbt:users', [...users, { ...user, password }]);
    if (isFirst) {
      lsSet('cbt:user', user);
      lsSet('cbt:token', `local-${user.id}`);
    }
    return { user };
  },

  async login(username, password) {
    if (api.getMode()==='remote') {
      const r = await _post('/api/auth/login', { username, password });
      if (r.token) { lsSet('cbt:token', r.token); lsSet('cbt:user', r.user); }
      return r;
    }
    const users = ls('cbt:users', []);
    const found = users.find(u => u.username===username && u.password===password);
    if (!found) throw new Error('Invalid username or password');
    if (found.status === 'pending')  throw new Error('PENDING');
    if (found.status === 'rejected') throw new Error('REJECTED');
    const { password: _p, ...user } = found;
    lsSet('cbt:user', user);
    lsSet('cbt:token', `local-${user.id}`);
    return { user };
  },

  logout() { lsDel('cbt:token'); lsDel('cbt:user'); },

  // ── ATTEMPTS ──────────────────────────────────────────────────────────────
  async loadAttempts() {
    if (api.getMode()==='remote') return _get('/api/attempts');
    const user = api.getUser();
    if (!user) return [];
    return ls('cbt:attempts', []).filter(a => a.userId===user.id);
  },

  async saveAttempt(att) {
    if (api.getMode()==='remote') return _post('/api/attempts', att);
    const user = api.getUser();
    if (!user) return;
    lsSet('cbt:attempts', [...ls('cbt:attempts', []), { ...att, userId: user.id }]);
  },

  // ── MID-QUIZ PROGRESS ─────────────────────────────────────────────────────
  async saveProgress(moduleId, qIndex, responses, startedAt) {
    const data = { moduleId, qIndex, responses, startedAt, savedAt: Date.now() };
    if (api.getMode()==='remote') return _post('/api/progress', data);
    const user = api.getUser();
    if (!user) return;
    const all = ls('cbt:progress', {});
    all[user.id] = data;
    lsSet('cbt:progress', all);
  },

  async loadProgress(moduleId) {
    if (api.getMode()==='remote') {
      try { return await _get(`/api/progress/${moduleId}`); } catch { return null; }
    }
    const user = api.getUser();
    if (!user) return null;
    const p = ls('cbt:progress', {})[user.id];
    return (p && p.moduleId===moduleId) ? p : null;
  },

  async clearProgress(moduleId) {
    if (api.getMode()==='remote') { try { await _del(`/api/progress/${moduleId}`); } catch {} return; }
    const user = api.getUser();
    if (!user) return;
    const all = ls('cbt:progress', {});
    if (all[user.id]?.moduleId===moduleId) { delete all[user.id]; lsSet('cbt:progress', all); }
  },

  // ── CERTIFICATES ──────────────────────────────────────────────────────────
  async loadCertificates() {
    if (api.getMode()==='remote') return _get('/api/certificates');
    const user = api.getUser();
    if (!user) return [];
    return ls('cbt:certs', []).filter(c => c.userId===user.id);
  },

  async saveCertificate(cert) {
    if (api.getMode()==='remote') return _post('/api/certificates', cert);
    const user = api.getUser();
    if (!user) return;
    const all = ls('cbt:certs', []);
    const filtered = all.filter(c => !(c.userId===user.id && c.moduleId===cert.moduleId));
    lsSet('cbt:certs', [...filtered, { ...cert, userId: user.id }]);
  },

  // ── SETTINGS ──────────────────────────────────────────────────────────────
  async loadSettings() {
    if (api.getMode()==='remote') { try { return await _get('/api/settings'); } catch {} }
    return ls('cbt:settings', {
      passMark:            60,
      questionCount:       30,   // 10 | 20 | 30
      orgName:             'Comp X',
      deadlines:           {},
      leaderboardEnabled:  true,
      certEnabled:         true,
    });
  },

  async saveSettings(s) {
    if (api.getMode()==='remote') return _post('/api/settings', s);
    lsSet('cbt:settings', s);
  },

  // ── WIPE ──────────────────────────────────────────────────────────────────
  async wipeProgress() {
    if (api.getMode()==='remote') return _del('/api/attempts');
    const user = api.getUser();
    if (!user) return;
    lsSet('cbt:attempts', ls('cbt:attempts', []).filter(a => a.userId!==user.id));
    lsSet('cbt:certs',    ls('cbt:certs',    []).filter(c => c.userId!==user.id));
    const prog = ls('cbt:progress', {});
    delete prog[user.id];
    lsSet('cbt:progress', prog);
  },

  async wipeAccount() {
    if (api.getMode()==='remote') { await _del('/api/users/me'); api.logout(); return; }
    const user = api.getUser();
    if (!user) return;
    lsSet('cbt:attempts', ls('cbt:attempts', []).filter(a => a.userId!==user.id));
    lsSet('cbt:certs',    ls('cbt:certs',    []).filter(c => c.userId!==user.id));
    lsSet('cbt:users',    ls('cbt:users',    []).filter(u => u.id!==user.id));
    const prog = ls('cbt:progress', {});
    delete prog[user.id];
    lsSet('cbt:progress', prog);
    api.logout();
  },

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  async adminListUsers() {
    if (api.getMode()==='remote') return _get('/api/admin/users');
    const rawUsers  = ls('cbt:users',    []);
    const attempts  = ls('cbt:attempts', []);
    const certs     = ls('cbt:certs',    []);
    return rawUsers.map(({ password: _p, ...u }) => ({
      ...u,
      attempts: attempts.filter(a => a.userId===u.id).length,
      certs:    certs.filter(c => c.userId===u.id).length,
    }));
  },

  // Pending users awaiting approval
  async adminListPending() {
    if (api.getMode()==='remote') return _get('/api/admin/users/pending');
    return ls('cbt:users', [])
      .filter(u => u.status==='pending')
      .map(({ password: _p, ...u }) => u);
  },

  async adminApproveUser(id) {
    if (api.getMode()==='remote') return _post(`/api/admin/users/${id}/approve`, {});
    const users = ls('cbt:users', []);
    lsSet('cbt:users', users.map(u => u.id===id ? {...u, status:'approved'} : u));
  },

  async adminRejectUser(id) {
    if (api.getMode()==='remote') return _post(`/api/admin/users/${id}/reject`, {});
    const users = ls('cbt:users', []);
    lsSet('cbt:users', users.map(u => u.id===id ? {...u, status:'rejected'} : u));
  },

  async adminDeleteUser(id) {
    if (api.getMode()==='remote') return _del(`/api/admin/users/${id}`);
    lsSet('cbt:users',    ls('cbt:users',    []).filter(u => u.id!==id));
    lsSet('cbt:attempts', ls('cbt:attempts', []).filter(a => a.userId!==id));
    lsSet('cbt:certs',    ls('cbt:certs',    []).filter(c => c.userId!==id));
    const prog = ls('cbt:progress', {});
    delete prog[id];
    lsSet('cbt:progress', prog);
  },

  async adminWipeUserProgress(id) {
    if (api.getMode()==='remote') return _del(`/api/admin/users/${id}/progress`);
    lsSet('cbt:attempts', ls('cbt:attempts', []).filter(a => a.userId!==id));
    lsSet('cbt:certs',    ls('cbt:certs',    []).filter(c => c.userId!==id));
    const prog = ls('cbt:progress', {});
    delete prog[id];
    lsSet('cbt:progress', prog);
  },

  adminGetReport(moduleIds, passMark=60) {
    if (api.getMode()==='remote') {
      const qs = moduleIds.length ? `?modules=${moduleIds.join(',')}` : '';
      return _get(`/api/admin/report${qs}`);
    }
    const rawUsers  = ls('cbt:users',    []);
    const attempts  = ls('cbt:attempts', []);
    const certs     = ls('cbt:certs',    []);
    const pm        = Number(passMark) || 60;

    // Only include approved users in report
    return rawUsers
      .filter(u => u.status==='approved' || !u.status)
      .map(({ password: _p, ...u }) => {
        const ua = attempts.filter(a => a.userId===u.id);
        const uc = certs.filter(c => c.userId===u.id);
        const moduleRows = moduleIds.map(mid => {
          const ma     = ua.filter(a => a.moduleId===mid).sort((a,b) => a.ts-b.ts);
          const best   = ma.length ? Math.max(...ma.map(a => a.pct)) : null;
          const latest = ma.length ? ma[ma.length-1] : null;
          const cert   = uc.find(c => c.moduleId===mid);
          return {
            moduleId:  mid,
            attempts:  ma.length,
            best,
            latestPct: latest?.pct  ?? null,
            latestTs:  latest?.ts   ?? null,
            passed:    best!==null && best>=pm,
            certified: !!cert,
            certDate:  cert?.issuedAt ?? null,
            duration:  latest?.duration ?? null,
          };
        });
        return {
          user:          u,
          modules:       moduleRows,
          allPassed:     moduleRows.length>0 && moduleRows.every(m => m.passed),
          totalAttempts: ua.length,
          totalTime:     ua.reduce((s,a) => s+(a.duration||0), 0),
        };
      });
  },
};

async function _req(method, path, body) {
  const base  = api.getBaseUrl();
  const token = api.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}
const _get  = p     => _req('GET',    p);
const _post = (p,b) => _req('POST',   p, b);
const _del  = p     => _req('DELETE', p);
