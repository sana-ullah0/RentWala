import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { getProperty, updateProperty } from '../../utils/api';
import toast from 'react-hot-toast';
import './OwnerPages.css';

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getProperty(id)
      .then(({ data }) => {
        const p = data.property;
        setForm({
          title:          p.title || '',
          price:          p.price || '',
          city:           p.city || '',
          area:           p.area || '',
          type:           p.type || 'room',
          rooms:          p.rooms || 1,
          bathrooms:      p.bathrooms || 1,
          furnished:      String(p.furnished ?? false),
          bachelorAllowed: String(p.bachelorAllowed ?? false),
          description:    p.description || '',
          contact:        p.contact || '',
          mapLink:        p.location?.mapLink || '',
        });
      })
      .catch(() => { toast.error('Property not found'); navigate('/owner/listings'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProperty(id, {
        ...form,
        furnished: form.furnished === 'true',
        bachelorAllowed: form.bachelorAllowed === 'true',
        location: { mapLink: form.mapLink },
      });
      toast.success('Listing updated — resubmitted for approval');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="owner-page"><div className="container"><div className="page-loader"><div className="spinner" /></div></div></div>;
  if (!form) return null;

  return (
    <div className="owner-page">
      <div className="container container--mid">
        <div className="page-header">
          <button className="back-btn-sm" onClick={() => navigate('/owner/listings')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Edit Listing</h1>
            <p>Changes will be resubmitted for admin approval.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-section">
            <h3 className="form-section__title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group form-group--full">
                <label>Property Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Monthly Rent (PKR) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Property Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="room">Room</option>
                  <option value="hostel">Hostel</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
              <div className="form-group">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Area *</label>
                <input name="area" value={form.area} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section__title">Property Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Rooms</label>
                <input name="rooms" type="number" min="1" value={form.rooms} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Bathrooms</label>
                <input name="bathrooms" type="number" min="1" value={form.bathrooms} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Furnished?</label>
                <select name="furnished" value={form.furnished} onChange={handleChange}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bachelors Allowed?</label>
                <select name="bachelorAllowed" value={form.bachelorAllowed} onChange={handleChange}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="form-group form-group--full">
                <label>Description *</label>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section__title">Contact &amp; Location</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Number *</label>
                <input name="contact" value={form.contact} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Google Maps Link</label>
                <input name="mapLink" value={form.mapLink} onChange={handleChange} placeholder="https://maps.google.com/…" />
              </div>
            </div>
          </div>

          <div className="form-submit-row">
            <button type="button" className="btn btn--outline" onClick={() => navigate('/owner/listings')}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
