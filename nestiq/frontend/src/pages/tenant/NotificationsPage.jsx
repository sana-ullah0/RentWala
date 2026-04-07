import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllRead, deleteNotification } from '../../utils/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './TenantPages.css';

const TYPE_ICONS = {
  property_available: '🏠',
  new_listing:        '✨',
  price_update:       '💰',
  listing_approved:   '✅',
  listing_rejected:   '❌',
  general:            '🔔',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  const load = () => {
    getNotifications()
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleReadAll = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch { toast.error('Error'); }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="tenant-page">
      <div className="container">
        <div className="page-header">
          <Bell size={28} className="page-header__icon" />
          <div>
            <h1>Notifications {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}</h1>
            <p>Stay updated on your saved properties</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn--outline btn--sm ml-auto" onClick={handleReadAll}>
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="notif-list">
            {[...Array(4)].map((_, i) => <div key={i} className="notif-skeleton" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={56} />
            <h3>No notifications yet</h3>
            <p>We'll notify you when saved properties become available or when new listings match your area.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item ${!n.isRead ? 'notif-item--unread' : ''}`}
                onClick={() => !n.isRead && handleRead(n._id)}
              >
                <div className="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
                <div className="notif-body">
                  <p className="notif-message">{n.message}</p>
                  {n.property && (
                    <Link
                      to={`/property/${n.property._id}`}
                      className="notif-property-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {n.property.title} — {n.property.area}
                    </Link>
                  )}
                  <span className="notif-time">{formatTime(n.createdAt)}</span>
                </div>
                <div className="notif-actions">
                  {!n.isRead && (
                    <button
                      className="notif-action-btn"
                      title="Mark as read"
                      onClick={(e) => { e.stopPropagation(); handleRead(n._id); }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    className="notif-action-btn notif-action-btn--del"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
