import React, { useEffect, useState } from 'react';
import { getReports, deleteReport } from '../utils/api';
import { Trash2, ExternalLink, RefreshCw } from 'lucide-react';

export default function HistoryPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getReports();
      setReports(res.data.audits || []);
    } catch {
      setError('Could not load history. Make sure MongoDB is connected.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    await deleteReport(id);
    setReports(r => r.filter(x => x._id !== id));
  };

  const scoreClass = (s) => s >= 70 ? 'score-high' : s >= 40 ? 'score-mid' : 'score-low';

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading reports...</p>
    </div>
  );

  return (
    <div style={{ padding: '60px 0' }}>
      <div className="container">
        <div className="section-heading">
          Audit History
          <span>{reports.length} reports</span>
          <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {reports.length === 0 && !error ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            No audits yet. Run your first scan!
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Score</th>
                <th>Status</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r._id} className="history-row">
                  <td>
                    <a href={r.url} target="_blank" rel="noreferrer" className="history-url">
                      {r.domain || r.url} <ExternalLink size={11} />
                    </a>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.pageTitle}</div>
                  </td>
                  <td>
                    <span className={`score-pill ${scoreClass(r.overallScore)}`}>{r.overallScore}</span>
                  </td>
                  <td>
                    <span className={`status-badge badge-${r.overallStatus}`}>
                      {r.overallStatus}
                    </span>
                  </td>
                  <td style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.summary?.passed ?? '—'}</td>
                  <td style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.summary?.failed ?? '—'}</td>
                  <td style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {r.scanDate ? new Date(r.scanDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(r._id)} style={{
                      background: 'none', border: 'none', color: 'var(--text-3)',
                      cursor: 'pointer', padding: '4px'
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
