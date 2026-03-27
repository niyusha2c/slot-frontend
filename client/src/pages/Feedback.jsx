import { useState } from 'react';

const API = 'https://slot-backend-production.up.railway.app';

export default function Feedback() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, sent

  const handleSubmit = async () => {
    if (!message.trim() || status === 'sending') return;
    
    setStatus('sending');
    try {
      await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });
      setStatus('sent');
      setMessage('');
    } catch (err) {
      setStatus('idle');
    }
  };

  return (
    <div style={s.container}>
      <a href="/" style={s.logo}>slot.</a>

      <div style={s.content}>
        <h1 style={s.title}>feedback</h1>
        <p style={s.subtitle}>anonymous. we read everything.</p>

        {status === 'sent' ? (
          <div style={s.sent}>
            <p style={s.sentText}>dropped.</p>
            <button 
              onClick={() => setStatus('idle')} 
              style={s.another}
            >
              send another
            </button>
          </div>
        ) : (
          <>
            <textarea
              style={s.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              placeholder="bug, idea, thought..."
              rows={5}
              autoFocus
            />
            <div style={s.footer}>
              <span style={s.count}>{message.length}/1000</span>
              <button
                style={{
                  ...s.button,
                  opacity: message.trim() ? 1 : 0.4,
                }}
                onClick={handleSubmit}
                disabled={!message.trim() || status === 'sending'}
              >
                {status === 'sending' ? 'dropping...' : 'drop'}
              </button>
            </div>
          </>
        )}
      </div>

      <a href="/about" style={s.back}>← back</a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #fafafa; }
        textarea:focus { outline: none; }
      `}</style>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    background: '#fafafa',
    fontFamily: '"Outfit", sans-serif',
    padding: '60px 24px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#000',
    textDecoration: 'none',
  },
  content: {
    marginTop: '80px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 300,
    color: '#000',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#999',
    marginBottom: '32px',
  },
  textarea: {
    width: '100%',
    padding: '16px',
    fontSize: '15px',
    fontFamily: '"Outfit", sans-serif',
    fontWeight: 300,
    lineHeight: 1.6,
    border: '1px solid #eee',
    borderRadius: '8px',
    background: '#fff',
    resize: 'none',
    color: '#000',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
  },
  count: {
    fontSize: '12px',
    fontWeight: 300,
    color: '#ccc',
  },
  button: {
    padding: '8px 20px',
    fontSize: '13px',
    fontFamily: '"Outfit", sans-serif',
    fontWeight: 300,
    background: 'transparent',
    color: '#000',
    border: '1px solid #ccc',
    borderRadius: '16px',
    cursor: 'pointer',
},
  sent: {
    textAlign: 'center',
    padding: '40px 0',
  },
  sentText: {
    fontSize: '16px',
    fontWeight: 300,
    color: '#000',
    marginBottom: '24px',
  },
  another: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#999',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  back: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#999',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '48px',
  },
};