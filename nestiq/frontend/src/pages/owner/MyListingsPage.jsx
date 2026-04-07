import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit2, Trash2, ToggleLeft, ToggleRight, Eye, Clock, CheckCircle, XCircle, Home } from 'lucide-react';
import { getMyListings, deleteProperty, updatePropertyStatus } from '../../utils/api';
import toast from 'react-hot-toast';
import './OwnerPages.css';

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'green',  Icon: CheckCircle },
  rented:    { label: 'Rented',    color: 'gray',   Icon: Home },
  pending:   { label: 'Pending',   color: 'orange', Icon: Clock },
  rejected:  { label: 'Rejected',  color: 'red',    Icon: XCircle },
};

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getMyListings()
      .then(({ data }) => setListings(data.properties || []))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteProperty(id);
      setListings((prev) => prev.filter((p) => p._id !== id));
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (id, current) => {
    const next = current === 'available' ? 'rented' : 'available';
    try {
      await updatePropertyStatus(id, next);
      setListings((prev) => prev.map((p) => p._id === id ? { ...p, status: next } : p));
      toast.success(`Marked as ${next}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="owner-page"><div className="container">
      <div className="listings-skeleton">{[...Array(3)].map((_, i) => <div key={i} className="listing-row-skeleton" />)}</div>
    </div></div>
  );

  return (
    <div className="owner-page">
      <div className="container">
        <div className="page-header">
          <Home size={28} className="page-header__icon" />
          <div>
            <h1>My Listings</h1>
            <p>{listings.length} propert{listings.length !== 1 ? 'ies' : 'y'} listed</p>
          </div>
          <Link to="/owner/add-property" className="btn btn--primary ml-auto">
            <PlusCircle size={16} /> Add New
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <Home size={56} />
            <h3>No listings yet</h3>
            <p>Post your first property and start receiving inquiries.</p>
            <Link to="/owner/add-property" className="btn btn--primary">
              <PlusCircle size={16} /> Add Property
            </Link>
          </div>
        ) : (
          <div className="listings-table-wrapper">
            <table className="listings-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Price</th>
                  <th>Approval</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((p) => {
                  const approvalConf = STATUS_CONFIG[p.approvalStatus] || STATUS_CONFIG.pending;
                  const statusConf   = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="listing-cell">
                          <div className="listing-thumb">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.title} />
                              : <Home size={20} />}
                          </div>
                          <div>
                            <p className="listing-title">{p.title}</p>
                            <p className="listing-loc">{p.area}, {p.city}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="listing-price">PKR {p.price?.toLocaleString()}</span></td>
                      <td>
                        <span className={`status-chip status-chip--${approvalConf.color}`}>
                          <approvalConf.Icon size={12} /> {p.approvalStatus}
                        </span>
                        {p.approvalStatus === 'rejected' && p.rejectionReason && (
                          <p className="rejection-reason" title={p.rejectionReason}>
                            {p.rejectionReason.slice(0, 40)}…
                          </p>
                        )}
                      </td>
                      <td>
                        {p.approvalStatus === 'approved' ? (
                          <button
                            className={`toggle-status-btn toggle-status-btn--${p.status}`}
                            onClick={() => toggleStatus(p._id, p.status)}
                            title={`Click to mark as ${p.status === 'available' ? 'rented' : 'available'}`}
                          >
                            {p.status === 'available' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {statusConf.label}
                          </button>
                        ) : (
                          <span className={`status-chip status-chip--${statusConf.color}`}>{statusConf.label}</span>
                        )}
                      </td>
                      <td>
                        <span className="views-count"><Eye size={14} /> {p.views || 0}</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/property/${p._id}`} className="icon-btn" title="View"><Eye size={16} /></Link>
                          <Link to={`/owner/edit/${p._id}`} className="icon-btn" title="Edit"><Edit2 size={16} /></Link>
                          <button
                            className="icon-btn icon-btn--danger"
                            title="Delete"
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
