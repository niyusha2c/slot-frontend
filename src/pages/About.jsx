import { useState } from 'react';

export default function About() {
  const [expanded, setExpanded] = useState(null);

  const sections = [
    {
      q: 'What is this?',
      a: 'A slot. You write something — anything — and drop it in. It disappears. That\'s it.',
    },
    {
      q: 'Where does it go?',
      a: 'Nowhere. Nothing is stored, logged, or transmitted. Your words exist for the moment you write them, then they\'re gone.',
    },
    {
      q: 'Why only once a day?',
      a: 'Constraints create meaning. One drop per day makes you consider what\'s worth releasing. Most days you won\'t use it. Some days you\'ll need it.',
    },
    {
      q: 'Is it anonymous?',
      a: 'Completely. No accounts. No cookies tracking content. No analytics on what you write. We count drops, not words.',
    },
    {
      q: 'What are the falling dots?',
      a: 'Other people, right now, dropping things into the void. You can\'t see what they wrote. You just know they\'re there.',
    },
  ];

  return (
    <div style={s.container}>
      <header style={s.header}>
        <a href="/" style={s.back}>← slot.</a>
      </header>

      <main style={s.main}>
        <h1 style={s.title}>About</h1>
        
        <div style={s.sections}>
          {sections.map((sec, i) => (
            <div key={i} style={s.section}>
              <button
                style={s.question}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span>{sec.q}</span>
                <span style={{
                  ...s.arrow,
                  transform: expanded === i ? 'rotate(90deg)' : 'none',
                }}>→</span>
              </button>
              {expanded === i && (
                <p style={s.answer}>{sec.a}</p>
              )}
            </div>
          ))}
        </div>

        <div style={s.footer}>
          <p style={s.footerText}>No data. No trace. One per day.</p>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { background: #fafafa; }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; }
      `}</style>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh', background: '#fafafa', fontFamily: '"Outfit", sans-serif',
    color: '#000',
  },
  header: {
    padding: '24px 32px',
  },
  back: {
    fontSize: '14px', fontWeight: 400, color: '#999',
  },
  main: {
    maxWidth: '520px', margin: '0 auto', padding: '40px 24px 80px',
  },
  title: {
    fontSize: '32px', fontWeight: 500, letterSpacing: '-0.03em',
    marginBottom: '48px',
  },
  sections: {
    display: 'flex', flexDirection: 'column',
  },
  section: {
    borderTop: '1px solid #eee',
  },
  question: {
    width: '100%', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '20px 0', background: 'none',
    border: 'none', fontFamily: '"Outfit", sans-serif', fontSize: '15px',
    fontWeight: 400, color: '#000', textAlign: 'left',
  },
  arrow: {
    fontSize: '14px', color: '#ccc', transition: 'transform 0.2s ease',
    flexShrink: 0, marginLeft: '16px',
  },
  answer: {
    fontSize: '14px', fontWeight: 300, lineHeight: 1.7, color: '#666',
    paddingBottom: '20px',
  },
  footer: {
    marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #eee',
  },
  footerText: {
    fontSize: '13px', fontWeight: 300, color: '#bbb',
  },
};