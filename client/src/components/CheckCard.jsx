import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, XCircle, AlertTriangle, MinusCircle, Search } from 'lucide-react';

const STATUS_META = {
  pass: { icon: <CheckCircle2 size={16} />, label: 'Pass', cls: 'badge-pass', border: 'border-pass', fill: 'fill-pass' },
  fail: { icon: <XCircle size={16} />, label: 'Fail', cls: 'badge-fail', border: 'border-fail', fill: 'fill-fail' },
  warn: { icon: <AlertTriangle size={16} />, label: 'Warning', cls: 'badge-warn', border: 'border-warn', fill: 'fill-warn' },
  na: { icon: <MinusCircle size={16} />, label: 'N/A', cls: 'badge-na', border: 'border-na', fill: 'fill-na' }
};

const HIGHLIGHT_KEYWORDS = {
  consent_mechanism: ['consent', 'cookie', 'accept', 'reject', 'decline', 'opt-out', 'opt out', 'manage preferences', 'cookie settings', 'agree'],
  privacy_notice: ['privacy policy', 'privacy notice', 'data protection', 'last updated', 'effective date', 'personal data', 'we collect', 'information we collect'],
  right_to_access: ['right to access', 'access your data', 'download your data', 'data request', 'export', 'DSAR', 'data subject access'],
  right_to_erasure: ['delete account', 'close account', 'erasure', 'right to deletion', 'erase', 'remove your data', 'deactivate', 'edit profile', 'update profile'],
  grievance_redressal: ['grievance officer', 'data protection officer', 'DPO', 'privacy officer', 'privacy@', 'dpo@', 'grievance@', 'respond within', 'business days'],
  data_minimization: ['only collect', 'necessary data', 'data minimization', 'purpose limitation', 'optional', 'required field'],
  childrens_data: ['age verification', 'parental consent', 'children', 'minor', 'under 18', 'guardian', 'COPPA', 'date of birth'],
  data_retention: ['retain', 'retention period', 'how long', 'delete after', 'stored for', 'years', 'months', 'days', 'erasure policy'],
  data_security: ['encrypt', 'SSL', 'TLS', 'HTTPS', 'security', 'safeguard', 'breach', 'notification', 'HSTS'],
  cross_border_transfer: ['transfer', 'cross-border', 'international', 'outside India', 'third countries', 'standard contractual', 'SCC'],
  lawful_processing: ['legal basis', 'lawful basis', 'legitimate interest', 'consent', 'terms of service', 'purpose of processing'],
};

function highlightText(text, keywords) {
  if (!text || !keywords || keywords.length === 0) return text;
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{
          background: 'rgba(59,130,246,0.25)',
          color: 'var(--text)',
          borderRadius: 3,
          padding: '1px 3px',
          fontWeight: 600,
        }}>{part}</mark>
      : part
  );
}

function extractSnippet(fullText, keywords, maxLength = 160) {
  if (!fullText || !keywords) return null;
  const lower = fullText.toLowerCase();
  for (const kw of keywords) {
    const idx = lower.indexOf(kw.toLowerCase());
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(fullText.length, idx + kw.length + 100);
      let snippet = fullText.slice(start, end).trim();
      if (start > 0) snippet = '...' + snippet;
      if (end < fullText.length) snippet = snippet + '...';
      return snippet.slice(0, maxLength + 6);
    }
  }
  return null;
}

export default function CheckCard({ check, pageText = '' }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[check.status] || STATUS_META.na;
  const keywords = HIGHLIGHT_KEYWORDS[check.id] || [];
  const foundSnippet = pageText ? extractSnippet(pageText, keywords) : null;

  return (
    <div className={`check-card ${meta.border}`}>
      <div className="check-header" onClick={() => setOpen(o => !o)}>
        <div className="check-score-bar">
          <div className={`check-score-fill ${meta.fill}`} style={{ width: `${check.score}%` }} />
        </div>
        <div className="check-title">
          <h3>{check.section}</h3>
          <p>{check.law}</p>
        </div>
        <div className={`status-badge ${meta.cls}`}>{meta.icon} {meta.label}</div>
        <ChevronDown size={16} className={`chevron ${open ? 'open' : ''}`} />
      </div>

      {open && (
        <div className="check-body">
          {check.description && (
            <p className="check-description">{check.description}</p>
          )}

          {check.evidence && check.evidence.length > 0 && (
            <div className="evidence-list">
              {check.evidence.map((ev, i) => (
                <span key={i} className={`evidence-chip ${ev.startsWith('✓') ? 'evidence-found' : 'evidence-missing'}`}>
                  {ev}
                </span>
              ))}
            </div>
          )}

          {/* Found on page — highlighted snippet */}
          {foundSnippet && (
            <div style={{
              margin: '12px 0',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: 8,
              padding: '12px 14px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 8, fontSize: 11,
                fontFamily: 'var(--font-mono)', color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <Search size={12} /> Found on page
              </div>
              <p style={{
                fontSize: 13, color: 'var(--text-2)',
                lineHeight: 1.7, fontFamily: 'var(--font-mono)', margin: 0,
              }}>
                {highlightText(foundSnippet, keywords)}
              </p>
            </div>
          )}

          {/* Not found box for failed checks */}
          {check.status === 'fail' && !foundSnippet && keywords.length > 0 && (
            <div style={{
              margin: '12px 0',
              background: 'var(--red-dim)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderLeft: '3px solid var(--red)',
              borderRadius: 8,
              padding: '12px 14px',
            }}>
              <div style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: 'var(--red)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 6,
              }}>
                Not found on page
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, lineHeight: 1.6 }}>
                Looked for: {keywords.slice(0, 6).join(', ')}
              </p>
            </div>
          )}

          {check.details && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
              {check.details}
            </p>
          )}

          {check.recommendation && (
            <div className="recommendation">
              <strong>💡 Recommendation &nbsp;</strong>
              <br />{check.recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}