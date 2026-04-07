import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, PlusCircle, MapPin, Home } from 'lucide-react';
import { createProperty } from '../../utils/api';
import toast from 'react-hot-toast';
import './OwnerPages.css';

const INITIAL = {
  title: '', price: '', city: '', area: '', type: 'room',
  rooms: '1', bathrooms: '1', furnished: 'false', bachelorAllowed: 'false',
  description: '', contact: '', mapLink: '', lat: '', lng: '',
};

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INITIAL);
  const [images, setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) return toast.error('Maximum 10 images allowed');
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 1) return toast.error('Please upload at least 1 image');
    if (!form.title || !form.price || !form.city || !form.area || !form.description || !form.contact)
      return toast.error('Please fill all required fields');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));

      await createProperty(fd);
      toast.success('Listing submitted for admin approval!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-page">
      <div className="container container--mid">
        <div className="page-header">
          <PlusCircle size={28} className="page-header__icon" />
          <div>
            <h1>Add New Listing</h1>
            <p>Fill in property details — your listing will go live after admin approval.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="property-form">
          {/* Section: Basic Info */}
          <div className="form-section">
            <h3 className="form-section__title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group form-group--full">
                <label>Property Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Furnished Room in Johar Town near LUMS" required />
              </div>
              <div className="form-group">
                <label>Monthly Rent (PKR) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 12000" min="0" required />
              </div>
              <div className="form-group">
                <label>Property Type *</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="room">Room</option>
                  <option value="hostel">Hostel</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
              <div className="form-group">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Lahore" required />
              </div>
              <div className="form-group">
                <label>Area / Locality *</label>
                <input name="area" value={form.area} onChange={handleChange} placeholder="e.g. Johar Town" required />
              </div>
            </div>
          </div>

          {/* Section: Details */}
          <div className="form-section">
            <h3 className="form-section__title">Property Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Number of Rooms *</label>
                <input name="rooms" type="number" min="1" value={form.rooms} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Number of Bathrooms *</label>
                <input name="bathrooms" type="number" min="1" value={form.bathrooms} onChange={handleChange} required />
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
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={4} placeholder="Describe the property, nearby facilities, rules, etc." required />
              </div>
            </div>
          </div>

          {/* Section: Contact & Location */}
          <div className="form-section">
            <h3 className="form-section__title"><MapPin size={16} /> Contact &amp; Location</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Contact Number *</label>
                <input name="contact" value={form.contact} onChange={handleChange} placeholder="03XX XXXXXXX" required />
              </div>
              <div className="form-group">
                <label>Google Maps Link (optional)</label>
                <input name="mapLink" value={form.mapLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
              </div>
              <div className="form-group">
                <label>Latitude (optional)</label>
                <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="e.g. 31.5204" />
              </div>
              <div className="form-group">
                <label>Longitude (optional)</label>
                <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="e.g. 74.3587" />
              </div>
            </div>
          </div>

          {/* Section: Images */}
          <div className="form-section">
            <h3 className="form-section__title"><Upload size={16} /> Property Images *</h3>
            <p className="section-hint">Upload at least 1 image (max 10). Clear, well-lit photos get more inquiries.</p>

            <div className="image-upload-area">
              <label className="image-upload-btn">
                <Upload size={24} />
                <span>Click to upload images</span>
                <span className="hint">JPG, PNG, WEBP — max 5MB each</span>
                <input type="file" multiple accept="image/*" onChange={handleImages} hidden />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((src, i) => (
                  <div key={i} className="preview-item">
                    <img src={src} alt={`Preview ${i + 1}`} />
                    <button type="button" className="preview-remove" onClick={() => removeImage(i)}>
                      <X size={14} />
                    </button>
                    {i === 0 && <span className="preview-main-badge">Main</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-submit-row">
            <button type="button" className="btn btn--outline" onClick={() => navigate('/owner/listings')}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Submitting…</> : <><Home size={16} /> Submit for Approval</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
