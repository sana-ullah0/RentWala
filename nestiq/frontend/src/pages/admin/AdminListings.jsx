import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2, Eye, ListChecks, ExternalLink } from 'lucide-react';
import { getAllListingsAdmin, approveProperty, rejectProperty, deletePropertyAdmin } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('pending');

  const load = (status) => {
    setLoading(true);
    getAllListingsAdmin(status === 'all' ? {} : { status })
      .then(({ data }) => setListings(data.properties || []))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleApprove = async (id) => {
    try {
      await approveProperty(id);
      setListings((prev) => prev.map((p) => p._id === id ? { ...p, approvalStatus: 'approved', status: 'available' } : p));
      toast.success('Approved!');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id, title) => {
    const reason = window.prompt(`Rejection reason for "${title}":`);
    if (reason === null) return;
    try {
      await rejectProperty(id, reason || 'Did not meet guidelines');
      setListings((prev) => prev.map((p) => p._id === id ? { ...p, approvalStatus: 'rejected' } : p));
      toast.success('Rejected');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this listing?')) return;
    try {
      await deletePropertyAdmin(id);
      setListings((prev) => prev.filter((p) => p._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section__title"><ListChecks size={20} /> Manage Listings</h2>

      <div className="tab-bar">
        {STATUS_TABS.map((t) => (
          <button
            key={t} className={`tab-btn ${tab === t ? 'tab-btn--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div>{[...Array(4)].map((_, i) => <div key={i} className="row-skeleton" />)}</div>
        ) : listings.length === 0 ? (
          <div className="admin-empty"><ListChecks size={40} /><p>No listings found</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Owner</th>
                  <th>Price</th>
                  <th>Reports</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="pending-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="pending-thumb">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" /> : '🏠'}
                        </div>
                        <div>
                          <p className="pending-title">{p.title}</p>
                          <p className="pending-meta">{p.area}, {p.city} · {p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontSize: 14 }}>{p.owner?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.owner?.phone}</p>
                    </td>
                    <td><strong style={{ color: 'var(--primary)' }}>PKR {p.price?.toLocaleString()}</strong></td>
                    <td>
                      {p.reportCount > 0
                        ? <span className="report-count-badge">{p.reportCount} report{p.reportCount > 1 ? 's' : ''}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                    </td>
                    <td>
                      <span className={`status-chip status-chip--${p.approvalStatus === 'approved' ? 'green' : p.approvalStatus === 'rejected' ? 'red' : 'orange'}`}>
                        {p.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <Link to={`/property/${p._id}`} className="icon-btn" title="View" target="_blank">
                          <ExternalLink size={15} />
                        </Link>
                        {p.approvalStatus !== 'approved' && (
                          <button className="icon-btn icon-btn--green" title="Approve" onClick={() => handleApprove(p._id)}>
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {p.approvalStatus !== 'rejected' && (
                          <button className="icon-btn icon-btn--orange" title="Reject" onClick={() => handleReject(p._id, p.title)}>
                            <XCircle size={15} />
                          </button>
                        )}
                        <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => handleDelete(p._id)}>
                          <Trash2 size={15} />
                        </button>
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
