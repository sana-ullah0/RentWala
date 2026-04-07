import React, { useState, useEffect } from 'react';
import { Users, Home, Clock, Flag, TrendingUp } from 'lucide-react';
import { getAdminStats, getPendingListings, approveProperty, rejectProperty } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-card__icon">{icon}</div>
    <div>
      <p className="stat-card__value">{value ?? '—'}</p>
      <p className="stat-card__label">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([getAdminStats(), getPendingListings()]);
      setStats(s.data.stats);
      setPending(p.data.properties || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id, title) => {
    try {
      await approveProperty(id);
      setPending((prev) => prev.filter((p) => p._id !== id));
      setStats((s) => ({ ...s, pendingListings: s.pendingListings - 1, totalProperties: s.totalProperties + 1 }));
      toast.success(`"${title}" approved!`);
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id, title) => {
    const reason = window.prompt(`Rejection reason for "${title}":`);
    if (reason === null) return;
    try {
      await rejectProperty(id, reason || 'Did not meet guidelines');
      setPending((prev) => prev.filter((p) => p._id !== id));
      setStats((s) => ({ ...s, pendingListings: s.pendingListings - 1 }));
      toast.success('Listing rejected');
    } catch { toast.error('Failed to reject'); }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section__title"><TrendingUp size={20} /> Dashboard Overview</h2>

      {loading ? (
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="stat-skeleton" />)}
        </div>
      ) : (
        <div className="stats-grid">
          <StatCard icon={<Users size={24} />}  label="Total Users"     value={stats?.totalUsers}     color="blue" />
          <StatCard icon={<Home size={24} />}   label="Live Listings"   value={stats?.totalProperties} color="green" />
          <StatCard icon={<Clock size={24} />}  label="Pending Review"  value={stats?.pendingListings} color="orange" />
          <StatCard icon={<Flag size={24} />}   label="Pending Reports" value={stats?.totalReports}   color="red" />
        </div>
      )}

      <div className="admin-card" style={{ marginTop: 32 }}>
        <h3 className="admin-card__title">
          <Clock size={18} /> Pending Listings
          {pending.length > 0 && <span className="count-badge">{pending.length}</span>}
        </h3>

        {loading ? (
          <div>{[...Array(3)].map((_, i) => <div key={i} className="row-skeleton" />)}</div>
        ) : pending.length === 0 ? (
          <div className="admin-empty">
            <Clock size={40} />
            <p>No pending listings — you're all caught up!</p>
          </div>
        ) : (
          <div className="pending-list">
            {pending.map((p) => (
              <div key={p._id} className="pending-row">
                <div className="pending-thumb">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.title} /> : <Home size={20} />}
                </div>
                <div className="pending-info">
                  <p className="pending-title">{p.title}</p>
                  <p className="pending-meta">
                    {p.area}, {p.city} · PKR {p.price?.toLocaleString()}/mo · by <strong>{p.owner?.name}</strong>
                  </p>
                </div>
                <div className="pending-actions">
                  <button className="btn btn--success btn--sm" onClick={() => handleApprove(p._id, p.title)}>Approve</button>
                  <button className="btn btn--danger btn--sm"  onClick={() => handleReject(p._id, p.title)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
