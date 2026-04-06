import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { login } from '../utils/auth';
import { useAuth } from '../context/Authcontext';

export default function LoginPage() {
  const navigate       = useNavigate();
  const { setUser }    = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form);
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoBox}>
            <Shield size={18} color="#fff" />
          </div>
          <span style={styles.logoText}>
            DPDP<span style={{ color: 'var(--text-3)' }}>.</span>check
          </span>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to access your scan history and reports</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={styles.features}>
          {['View all past audits and scores',
            'Download compliance reports',
            'Track score improvements over time'].map((f, i) => (
            <div key={i} style={styles.featureRow}>
              <div style={styles.checkIcon}>✓</div>
              <span style={styles.featureText}>{f}</span>
            </div>
          ))}
        </div>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 420,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoBox: {
    width: 34,
    height: 34,
    background: '#3b82f6',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    fontFamily: 'var(--font-display)',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text)',
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: 'var(--text-3)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 1.5,
  },
  error: {
    background: 'var(--red-dim)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: 'var(--red)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-2)',
    marginBottom: 6,
    fontFamily: 'var(--font-display)',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    background: 'var(--bg-3)',
    border: '1px solid var(--border-accent)',
    borderRadius: 8,
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font-mono)',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    marginTop: 4,
  },
  features: {
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid var(--border)',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.15)',
    color: 'var(--green)',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    fontSize: 12,
    color: 'var(--text-3)',
  },
  switchText: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--text-3)',
    marginTop: 20,
  },
  link: {
    color: '#3b82f6',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
