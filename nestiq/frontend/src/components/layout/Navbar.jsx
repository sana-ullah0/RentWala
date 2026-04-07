import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../utils/api';
import { Home, Search, Heart, Bell, User, Plus, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread]       = useState(0);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      getNotifications()
        .then(({ data }) => setUnread(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setDropOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🏠</span>
          <span>Nest<em>IQ</em></span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar__links">
          <Link to="/search" className="navbar__link">
            <Search size={16} /> Browse
          </Link>
          {user && (
            <>
              <Link to="/favorites" className="navbar__link">
                <Heart size={16} /> Saved
              </Link>
              <Link to="/notifications" className="navbar__link navbar__link--notif">
                <Bell size={16} />
                {unread > 0 && <span className="navbar__badge">{unread}</span>}
              </Link>
            </>
          )}
          {user?.role === 'owner' && (
            <Link to="/owner/add-property" className="btn btn-primary btn-sm">
              <Plus size={15} /> Post Listing
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-primary btn-sm">
              <LayoutDashboard size={15} /> Admin
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="navbar__auth">
          {user ? (
            <div className="navbar__user" onClick={() => setDropOpen(!dropOpen)}>
              <div className="navbar__avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="navbar__name">{user.name.split(' ')[0]}</span>
              {dropOpen && (
                <div className="navbar__dropdown">
                  <Link to="/profile" onClick={() => setDropOpen(false)}>
                    <User size={15} /> Profile
                  </Link>
                  {user.role === 'owner' && (
                    <Link to="/owner/listings" onClick={() => setDropOpen(false)}>
                      <LayoutDashboard size={15} /> My Listings
                    </Link>
                  )}
                  <button onClick={handleLogout} className="navbar__dropdown-danger">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile fade-in">
          <Link to="/search" onClick={() => setMenuOpen(false)}><Search size={16}/> Browse</Link>
          {user && <>
            <Link to="/favorites" onClick={() => setMenuOpen(false)}><Heart size={16}/> Saved</Link>
            <Link to="/notifications" onClick={() => setMenuOpen(false)}><Bell size={16}/> Notifications {unread > 0 && `(${unread})`}</Link>
            <Link to="/profile" onClick={() => setMenuOpen(false)}><User size={16}/> Profile</Link>
          </>}
          {user?.role === 'owner' && <Link to="/owner/add-property" onClick={() => setMenuOpen(false)}><Plus size={16}/> Post Listing</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16}/> Admin Panel</Link>}
          {!user && <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>Join Free</Link>
          </>}
          {user && <button onClick={handleLogout}><LogOut size={16}/> Sign Out</button>}
        </div>
      )}
    </nav>
  );
}
