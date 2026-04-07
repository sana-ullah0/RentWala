import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm]       = useState({ name:'', phone:'', password:'', role: searchParams.get('role') || 'tenant' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      loginUser(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      if (data.user.role === 'owner') navigate('/owner/add-property');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">🏠 Nest<em>IQ</em></Link>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join thousands of students finding homes</p>

        {/* Role toggle */}
        <div className="auth-role-toggle">
          {['tenant','owner'].map(r => (
            <button key={r} type="button"
              className={`auth-role-btn ${form.role===r?'auth-role-btn--active':''}`}
              onClick={()=>setForm(f=>({...f,role:r}))}>
              {r === 'tenant' ? '🎓 I\'m a Student' : '🏠 I\'m an Owner'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Muhammad Ali" required
              value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" placeholder="03001234567" required
              value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" required minLength={6}
              value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" style={{width:18,height:18}}/> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
