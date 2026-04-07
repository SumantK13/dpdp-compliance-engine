import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Check } from 'lucide-react';
import { register } from '../utils/auth';
import { useAuth } from '../context/Authcontext';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    desc: '5 scans / day',
    badge: null,
    features: ['5 scans per day', 'Full scan history', 'Download reports'],
  },
  {
    id: 'pro',
    name: 'Pro',
    desc: 'Unlimited scans',
    badge: 'Most popular',
    features: ['Unlimited scans', 'AI advice per scan', 'Bulk scan (10 URLs)', 'Analytics dashboard'],
  },
];

export default function SignupPage() {
  const navigate       = useNavigate();
  const { setUser }    = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [plan, setPlan] = useState('free');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({ ...form, plan });
      setUser(user);
      setSuccess('Account created! Taking you to the scanner...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
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

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.sub}>Start checking DPDP compliance for free — no credit card needed</p>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Yash Paliwal"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

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
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {/* Plan selector */}
          <div style={styles.field}>
            <label style={styles.label}>Choose your plan</label>
            <div style={styles.planGrid}>
              {PLANS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  style={{
                    ...styles.planCard,
                    ...(plan === p.id ? styles.planCardActive : {}),
                  }}
                >
                  {p.badge && (
                    <div style={styles.planBadge}>{p.badge}</div>
                  )}
                  <div style={styles.planName}>{p.name}</div>
                  <div style={styles.planDesc}>{p.desc}</div>
                  <div style={styles.planFeatures}>
                    {p.features.map((f, i) => (
                      <div key={i} style={styles.planFeatureRow}>
                        <Check size={10} color="var(--green)" strokeWidth={3} />
                        <span style={styles.planFeatureText}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.terms}>
          By signing up you agree to our{' '}
          <a href="#" style={styles.link}>Terms of Service</a>{' '}
          and{' '}
          <a href="#" style={styles.link}>Privacy Policy</a>.
        </p>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
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
    maxWidth: 460,
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
  success: {
    background: 'var(--green-dim)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: 'var(--green)',
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
  planGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  planCard: {
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '14px 12px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    background: 'var(--bg-3)',
  },
  planCardActive: {
    border: '2px solid #3b82f6',
    background: 'rgba(59,130,246,0.06)',
  },
  planBadge: {
    fontSize: 10,
    background: 'rgba(59,130,246,0.15)',
    color: '#3b82f6',
    padding: '2px 8px',
    borderRadius: 4,
    display: 'inline-block',
    marginBottom: 4,
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
  },
  planName: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 2,
  },
  planDesc: {
    fontSize: 11,
    color: 'var(--text-3)',
    marginBottom: 10,
    fontFamily: 'var(--font-mono)',
  },
  planFeatures: { display: 'flex', flexDirection: 'column', gap: 4 },
  planFeatureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  planFeatureText: {
    fontSize: 11,
    color: 'var(--text-3)',
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
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-3)',
    marginTop: 16,
    lineHeight: 1.6,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--text-3)',
    marginTop: 12,
  },
  link: {
    color: '#3b82f6',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
