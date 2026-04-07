import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Users, Flag, LogOut, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const NAV = [
  { to: '/admin',          icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/listings', icon: <ListChecks size={18} />,      label: 'Listings' },
  { to: '/admin/users',    icon: <Users size={18} />,           label: 'Users' },
  { to: '/admin/reports',  icon: <Flag size={18} />,            label: 'Reports' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__logo">
          <Home size={22} />
          <span>NestIQ Admin</span>
          <button className="sidebar-close" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      {/* Main area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <h2 className="admin-topbar__title">Admin Panel</h2>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
