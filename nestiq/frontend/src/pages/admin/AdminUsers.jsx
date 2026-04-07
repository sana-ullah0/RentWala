import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { getAllUsers, toggleUser } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const ROLE_TABS = ['all', 'tenant', 'owner'];

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('all');

  const load = (role) => {
    setLoading(true);
    getAllUsers(role === 'all' ? {} : { role })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleToggle = async (id, name, isActive) => {
    const action = isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} user "${name}"?`)) return;
    try {
      await toggleUser(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${action}d`);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section__title"><Users size={20} /> Manage Users</h2>

      <div className="tab-bar">
        {ROLE_TABS.map((t) => (
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
          <div>{[...Array(5)].map((_, i) => <div key={i} className="row-skeleton" />)}</div>
        ) : users.length === 0 ? (
          <div className="admin-empty"><Users size={40} /><p>No users found</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 14 }}>{u.phone}</td>
                    <td>
                      <span className={`role-badge role-badge--${u.role}`}>
                        {u.role === 'owner' ? <Shield size={11} /> : null} {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.city || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span className={`status-chip ${u.isActive ? 'status-chip--green' : 'status-chip--red'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`icon-btn ${u.isActive ? 'icon-btn--orange' : 'icon-btn--green'}`}
                        title={u.isActive ? 'Deactivate user' : 'Activate user'}
                        onClick={() => handleToggle(u._id, u.name, u.isActive)}
                      >
                        {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
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
