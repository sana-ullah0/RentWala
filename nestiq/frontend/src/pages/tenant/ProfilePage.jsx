import React, { useState } from 'react';
import { User, Phone, MapPin, Save, LogOut } from 'lucide-react';
import { updateProfile } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './TenantPages.css';

export default function ProfilePage() {
  const { user, logout, loginUser } = useAuth();
  const [form, setForm]     = useState({ name: user?.name || '', city: user?.city || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const { data } = await updateProfile(form);
      // Update local auth context with new user data
      const token = localStorage.getItem('nestiq_token');
      loginUser(token, data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tenant-page">
      <div className="container container--narrow">
        <div className="page-header">
          <User size={28} className="page-header__icon" />
          <div>
            <h1>My Profile</h1>
            <p>Manage your account details</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-role-badge">{user?.role}</div>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label><User size={15} /> Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label><Phone size={15} /> Phone Number</label>
              <input type="tel" value={user?.phone || ''} disabled className="input-disabled" />
              <span className="field-note">Phone number cannot be changed</span>
            </div>

            <div className="form-group">
              <label><MapPin size={15} /> City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Lahore"
              />
            </div>

            <div className="form-group">
              <label>Account Type</label>
              <input value={user?.role === 'owner' ? 'Property Owner' : 'Tenant / Student'} disabled className="input-disabled" />
            </div>

            <div className="profile-form__actions">
              <button type="submit" className="btn btn--primary" disabled={loading}>
                <Save size={16} />
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn--danger-outline" onClick={logout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
