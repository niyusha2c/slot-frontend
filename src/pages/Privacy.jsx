import { useEffect } from 'react';

export default function Privacy() {
  useEffect(() => {
    document.title = 'privacy — slot.';
  }, []);

  return (
    <div style={styles.container}>
      <a href="/" style={styles.logo}>slot.</a>
      
      <h1 style={styles.title}>privacy</h1>
      
      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.heading}>what we collect</h2>
          <p style={styles.text}>
            almost nothing. we don't ask for your name, email, or any personal information.
          </p>
          <p style={styles.text}>
            when you drop a thought, we store only:
          </p>
          <ul style={styles.list}>
            <li>a hashed device identifier (anonymous, not traceable to you)</li>
            <li>the mode used (type, speak, or draw)</li>
            <li>character count (not the content itself)</li>
            <li>timestamp</li>
          </ul>
          <p style={styles.text}>
            <strong>we never store what you write or draw.</strong> your thoughts disappear into the void.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>cookies</h2>
          <p style={styles.text}>
            we don't use cookies for tracking. no ads, no analytics, no third-party scripts watching you.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>your data</h2>
          <p style={styles.text}>
            since we don't collect personal data, there's nothing to delete or export. 
            the anonymous device hash cannot be linked back to you.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>changes</h2>
          <p style={styles.text}>
            if this policy changes, we'll update this page. last updated: february 2026.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>contact</h2>
          <p style={styles.text}>
            questions? reach out at hello@oneslot.day
          </p>
        </section>
      </div>

      <a href="/" style={styles.back}>← back</a>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fafafa',
    fontFamily: '"Outfit", sans-serif',
    padding: '60px 24px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#000',
    textDecoration: 'none',
  },
  title: {
    fontSize: '18px',
    fontWeight: 300,
    color: '#000',
    margin: '48px 0 32px',
  },
  content: {
    lineHeight: 1.7,
  },
  section: {
    marginBottom: '32px',
  },
  heading: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#000',
    marginBottom: '12px',
  },
  text: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#666',
    marginBottom: '12px',
  },
  list: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#666',
    marginLeft: '20px',
    marginBottom: '12px',
  },
  back: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#999',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '24px',
  },
};