import React, { useState, useEffect } from 'react';
import { Flag, ExternalLink, CheckCircle } from 'lucide-react';
import { getAdminReports, updateReport } from '../../utils/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminPages.css';

const REASON_LABELS = {
  fake_listing:  'Fake Listing',
  wrong_price:   'Wrong Price',
  already_rented: 'Already Rented',
  inappropriate: 'Inappropriate',
  other:         'Other',
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminReports()
      .then(({ data }) => setReports(data.reports || []))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateReport(id, status);
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
      toast.success(`Report marked as ${status}`);
    } catch { toast.error('Failed'); }
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="admin-section">
      <h2 className="admin-section__title">
        <Flag size={20} /> Reports
        {pendingCount > 0 && <span className="count-badge">{pendingCount} pending</span>}
      </h2>

      <div className="admin-card">
        {loading ? (
          <div>{[...Array(4)].map((_, i) => <div key={i} className="row-skeleton" />)}</div>
        ) : reports.length === 0 ? (
          <div className="admin-empty"><Flag size={40} /><p>No reports filed yet</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Reported By</th>
                  <th>Reason</th>
                  <th>Details</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.property ? (
                        <Link to={`/property/${r.property._id}`} target="_blank" className="report-prop-link">
                          {r.property.title?.slice(0, 35) || 'Deleted'} <ExternalLink size={11} />
                        </Link>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Deleted listing</span>}
                      {r.property && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.property.area}, {r.property.city}</p>}
                    </td>
                    <td style={{ fontSize: 14 }}>{r.reporter?.name || '—'}<br/><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.reporter?.phone}</span></td>
                    <td><span className="reason-tag">{REASON_LABELS[r.reason] || r.reason}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 160 }}>{r.description || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`status-chip ${r.status === 'pending' ? 'status-chip--orange' : r.status === 'resolved' ? 'status-chip--green' : 'status-chip--gray'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {r.status === 'pending' && (
                          <button className="icon-btn icon-btn--green" title="Mark reviewed" onClick={() => handleStatus(r._id, 'reviewed')}>
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {r.status !== 'resolved' && (
                          <button className="btn btn--success btn--sm" onClick={() => handleStatus(r._id, 'resolved')}>Resolve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
