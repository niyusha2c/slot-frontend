import { useState, useEffect } from 'react';

const API = 'https://slot-backend-production.up.railway.app';

export default function Admin() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const login = async () => {
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setAuthed(true);
        setError('');
      } else {
        setError('Invalid admin key');
      }
    } catch {
      setError('Connection failed');
    }
  };

  if (!authed) {
    return (
      <div style={s.loginContainer}>
        <div style={s.loginBox}>
          <h1 style={s.loginTitle}>slot. admin</h1>
          <input
            type="password"
            placeholder="Admin key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            style={s.input}
          />
          {error && <p style={s.error}>{error}</p>}
          <button onClick={login} style={s.loginBtn}>Enter</button>
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { height: 100%; }
          body { background: #fafafa; }
        `}</style>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <header style={s.header}>
        <div>
          <span style={s.title}>slot.</span>
          <span style={s.badge}>admin</span>
        </div>
        <a href="/" style={s.backLink}>← Back to site</a>
      </header>

      <main style={s.main}>
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <span style={s.statNum}>{stats?.today || 0}</span>
            <span style={s.statLabel}>today</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{stats?.yesterday || 0}</span>
            <span style={s.statLabel}>yesterday</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{stats?.thisWeek || 0}</span>
            <span style={s.statLabel}>this week</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{stats?.allTime || 0}</span>
            <span style={s.statLabel}>all time</span>
          </div>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Recent drops</h2>
          {stats?.recent?.length > 0 ? (
            <div style={s.recentList}>
              {stats.recent.map((d, i) => (
                <div key={i} style={s.recentRow}>
                  <span style={s.recentMode}>{d.mode}</span>
                  <span style={s.recentChars}>{d.char_count} chars</span>
                  <span style={s.recentTime}>{new Date(d.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={s.empty}>No drops yet</p>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #f5f5f5; }
        a { text-decoration: none; color: inherit; }
      `}</style>
    </div>
  );
}

const s = {
  loginContainer: {
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fafafa', fontFamily: '"Outfit", sans-serif',
  },
  loginBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
  },
  loginTitle: {
    fontSize: '24px', fontWeight: 500, marginBottom: '8px',
  },
  input: {
    width: '240px', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '8px',
    fontFamily: '"Outfit", sans-serif', fontSize: '14px', textAlign: 'center',
  },
  error: {
    fontSize: '13px', color: '#c44',
  },
  loginBtn: {
    padding: '10px 32px', background: '#000', border: 'none', borderRadius: '8px',
    fontFamily: '"Outfit", sans-serif', fontSize: '14px', color: '#fff', cursor: 'pointer',
  },
  container: {
    minHeight: '100vh', background: '#f5f5f5', fontFamily: '"Outfit", sans-serif',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 32px', background: '#fff', borderBottom: '1px solid #eee',
  },
  title: { fontSize: '18px', fontWeight: 500 },
  badge: {
    fontSize: '10px', color: '#fff', background: '#000',
    padding: '2px 8px', borderRadius: '10px', marginLeft: '8px',
  },
  backLink: { fontSize: '13px', color: '#999' },
  main: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff', padding: '20px', borderRadius: '8px',
    border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '4px',
  },
  statNum: { fontSize: '28px', fontWeight: 500 },
  statLabel: { fontSize: '12px', color: '#999', fontWeight: 300 },
  card: {
    background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #eee',
  },
  cardTitle: { fontSize: '14px', fontWeight: 500, marginBottom: '16px' },
  recentList: { display: 'flex', flexDirection: 'column' },
  recentRow: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
    borderBottom: '1px solid #f5f5f5', fontSize: '13px',
  },
  recentMode: {
    fontSize: '11px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px',
  },
  recentChars: { flex: 1, fontWeight: 300, color: '#666' },
  recentTime: { fontSize: '11px', color: '#bbb' },
  empty: { fontSize: '13px', color: '#999', fontWeight: 300 },
};