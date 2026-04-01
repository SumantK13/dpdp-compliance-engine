import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AuditResult from './components/AuditResult';
import HistoryPage from './pages/HistoryPage';
import { runAudit } from './utils/api';
import { Shield, History, Search, ArrowRight } from 'lucide-react';

const LOADING_STEPS = [
  'Fetching website...',
  'Scanning privacy policy pages...',
  'Checking consent mechanisms...',
  'Analyzing DPDP compliance...',
  'Generating report...'
];

const INFO_CARDS = [
  { icon: '🔒', title: 'Consent Mechanism (§6)', desc: 'Checks for valid, granular consent banners with accept/reject options.' },
  { icon: '📋', title: 'Privacy Notice (§5)', desc: 'Verifies existence and completeness of a privacy policy page.' },
  { icon: '👤', title: 'Data Principal Rights (§11-13)', desc: 'Access, correction, and erasure rights for personal data.' },
  { icon: '🏢', title: 'Grievance Redressal (§13)', desc: 'Data Protection Officer details and complaint mechanism.' },
  { icon: '🌍', title: 'Cross-border Transfer (§16)', desc: 'Disclosures about international data transfers.' },
  { icon: '🔐', title: 'Security Safeguards (§8)', desc: 'HTTPS enforcement, encryption disclosures, breach notifications.' },
  { icon: '👶', title: "Children's Data (§9)", desc: 'Age verification and parental consent for minors.' },
  { icon: '⏱️', title: 'Retention Policy (§8)', desc: 'Clear data retention periods and deletion procedures.' },
];

function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    // Normalize URL on client side too
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) normalized = 'https://' + trimmed;

    // Basic validation before sending
    try { new URL(normalized); } catch {
      setError('Invalid URL. Please enter a valid website address like example.com');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setLoadStep(0);

    const stepInterval = setInterval(() => {
      setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 2500);

    try {
      const res = await runAudit(normalized);
      clearInterval(stepInterval);
      setResult(res.data.audit);
    } catch (err) {
      clearInterval(stepInterval);
      const data = err?.response?.data;
      const status = err?.response?.status;
      let msg = 'Audit failed. Please try again.';
      if (data?.error) msg = data.error;
      if (data?.suggestion) msg += '\n' + data.suggestion;
      if (status === 422) {
        msg = 'Could not reach that website — it may be blocking automated requests. Try entering the direct privacy policy URL instead, e.g. https://example.com/privacy-policy';
      }
      if (!err?.response) {
        msg = 'Cannot connect to backend server. Make sure the backend is running:\n  cd backend && npm run dev';
      }
      setError(msg);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScan(e);
  };

  return (
    <main>
      <section className="hero container">
        <div className="hero-eyebrow">
          <Shield size={14} /> DPDP Act 2023 Compliance
        </div>
        <h1>Check Your Website's<br /><span>Data Privacy</span> Compliance</h1>
        <p>
          Analyze any website against India's Digital Personal Data Protection Act, 2023.
          Get an instant compliance score with actionable recommendations.
        </p>

        <form onSubmit={handleScan} style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="url-bar">
            <span className="url-prefix">URL</span>
            <input
              className="url-input"
              type="text"
              placeholder="https://example.com  or  example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="url"
              spellCheck={false}
            />
            <button className="scan-btn" type="submit" disabled={loading || !url.trim()}>
              {loading
                ? 'Scanning...'
                : <><Search size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />Scan Now</>}
            </button>
          </div>
        </form>

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 14, fontFamily: 'var(--font-mono)' }}>
          Try: flipkart.com · meesho.com · cleartrip.com · nykaa.com
        </p>
      </section>

      <div className="container">
        {!result && !loading && (
          <div className="stats-bar">
            <div className="stat"><span className="stat-num">11</span><div className="stat-label">DPDP Provisions</div></div>
            <div className="stat"><span className="stat-num">2023</span><div className="stat-label">Act Year</div></div>
            <div className="stat"><span className="stat-num">100</span><div className="stat-label">Max Score</div></div>
            <div className="stat"><span className="stat-num">§4–§16</span><div className="stat-label">Sections Covered</div></div>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: 15 }}>Analyzing DPDP Compliance</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
              {url}
            </p>
            <div className="loading-steps">
              {LOADING_STEPS.map((step, i) => (
                <div key={i} className={`loading-step ${i === loadStep ? 'active' : i < loadStep ? 'done' : ''}`}>
                  <span className="step-dot" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="error-box">
            <strong>⚠️ Audit Failed</strong><br />
            <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
              <strong>Tips:</strong>
              <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.8 }}>
                <li>Make sure the backend server is running: <code>cd backend && npm run dev</code></li>
                <li>Try the full URL with protocol: <code>https://example.com</code></li>
                <li>Some sites block bots — try their <code>/privacy-policy</code> page directly</li>
                <li>Check browser console and backend terminal for detailed errors</li>
              </ul>
            </div>
          </div>
        )}

        {result && !loading && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => { setResult(null); setError(null); setUrl(''); }}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text-2)', padding: '8px 16px', cursor: 'pointer',
                  fontSize: 13, fontFamily: 'var(--font-display)'
                }}
              >
                ← New Scan
              </button>
            </div>
            <AuditResult audit={result} />
          </>
        )}

        {!result && !loading && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>What We Check</h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
              Automated analysis against key sections of the DPDP Act 2023
            </p>
            <div className="info-cards">
              {INFO_CARDS.map((c, i) => (
                <div key={i} className="info-card">
                  <div className="info-icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 40, padding: '20px 24px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', display: 'flex', alignItems: 'flex-start', gap: 12
            }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <strong style={{ fontSize: 14 }}>Disclaimer</strong>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.6 }}>
                  This tool performs automated, heuristic-based analysis and is for educational/informational
                  purposes only. It is not a legal audit and should not be treated as legal advice.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <a className="nav-logo" onClick={() => navigate('/')} href="/">
        <Shield size={18} color="#3b82f6" />
        DPDP<span style={{ color: 'var(--text-3)' }}>.</span>check
        <span className="logo-badge">β</span>
      </a>
      <div className="nav-links">
        <button className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
          <Search size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Scan
        </button>
        <button className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`} onClick={() => navigate('/history')}>
          <History size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />History
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
        <footer style={{
          textAlign: 'center', padding: '40px 0 24px',
          fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
          borderTop: '1px solid var(--border)'
        }}>
          Built for DPDP Act 2023 compliance education ·{' '}
          <a href="https://www.meity.gov.in/data-protection-framework" target="_blank" rel="noreferrer"
            style={{ color: 'var(--accent)' }}>
            Read the Act <ArrowRight size={10} style={{ verticalAlign: 'middle' }} />
          </a>
        </footer>
      </div>
    </BrowserRouter>
  );
}
