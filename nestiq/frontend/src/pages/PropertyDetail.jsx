import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, BedDouble, Bath, Phone, Heart, Flag,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';
import { getProperty, checkFavorite, addFavorite, removeFavorite, submitReport } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PropertyDetail.css';

const TYPE_LABELS = { room: 'Room', hostel: 'Hostel', apartment: 'Apartment' };
const REPORT_REASONS = [
  { value:'fake_listing',   label:'Fake Listing' },
  { value:'wrong_price',    label:'Wrong Price' },
  { value:'already_rented', label:'Already Rented' },
  { value:'inappropriate',  label:'Inappropriate Content' },
  { value:'other',          label:'Other' },
];

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [faved, setFaved]           = useState(false);
  const [imgIdx, setImgIdx]         = useState(0);
  const [reporting, setReporting]   = useState(false);
  const [reportData, setReportData] = useState({ reason:'fake_listing', description:'' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProperty(id)
      .then(({ data }) => {
        setProperty(data.property);
        if (user) {
          checkFavorite(id)
            .then(r => setFaved(r.data.isFavorited))
            .catch(() => {});
        }
      })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleFav = async () => {
    if (!user) { toast.error('Sign in to save listings'); return; }
    try {
      if (faved) { await removeFavorite(id); setFaved(false); toast.success('Removed from favorites'); }
      else { await addFavorite(id); setFaved(true); toast.success('Added to favorites'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to report'); return; }
    setSubmitting(true);
    try {
      await submitReport({ propertyId: id, ...reportData });
      toast.success('Report submitted. Thank you!');
      setReporting(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting report');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!property) return <div className="container" style={{padding:'4rem 0',textAlign:'center'}}>Property not found.</div>;

  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'];
  const waNumber = `92${property.contact?.replace(/^0/, '')}`;

  return (
    <div className="detail container">
      <button onClick={() => navigate(-1)} className="detail__back btn btn-ghost btn-sm">
        <ChevronLeft size={16}/> Back
      </button>

      <div className="detail__layout">
        {/* Left */}
        <div className="detail__left">
          {/* Gallery */}
          <div className="detail__gallery">
            <img src={images[imgIdx]} alt={property.title} className="detail__main-img" />
            {images.length > 1 && (
              <>
                <button className="detail__gallery-btn detail__gallery-btn--left" onClick={() => setImgIdx(i => (i-1+images.length)%images.length)}><ChevronLeft size={20}/></button>
                <button className="detail__gallery-btn detail__gallery-btn--right" onClick={() => setImgIdx(i => (i+1)%images.length)}><ChevronRight size={20}/></button>
                <div className="detail__thumbnails">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`View ${i+1}`} onClick={() => setImgIdx(i)}
                      className={`detail__thumb ${i===imgIdx?'detail__thumb--active':''}`}/>
                  ))}
                </div>
              </>
            )}
            <div className="detail__gallery-count">{imgIdx+1} / {images.length}</div>
          </div>

          {/* Description */}
          <div className="card detail__desc">
            <h3>About this property</h3>
            <p>{property.description}</p>
          </div>

          {/* Map */}
          {property.location?.mapLink && (
            <div className="card detail__map-card">
              <h3>Location</h3>
              <a href={property.location.mapLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                <ExternalLink size={14}/> Open in Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="detail__right">
          {/* Price + title */}
          <div className="card detail__info">
            <div className="detail__badges">
              <span className={`badge badge-${property.status}`}>{property.status === 'available' ? '✓ Available' : '✗ Rented'}</span>
              <span className="badge" style={{background:'#f3f4f6',color:'#374151'}}>{TYPE_LABELS[property.type]}</span>
            </div>
            <div className="detail__price">Rs {property.price?.toLocaleString()}<span>/month</span></div>
            <h1 className="detail__title">{property.title}</h1>
            <div className="detail__location">
              <MapPin size={15}/> {property.area}, {property.city}
            </div>

            {/* Specs */}
            <div className="detail__specs">
              <div className="detail__spec"><BedDouble size={16}/><span>{property.rooms} Bedroom{property.rooms>1?'s':''}</span></div>
              <div className="detail__spec"><Bath size={16}/><span>{property.bathrooms} Bathroom{property.bathrooms>1?'s':''}</span></div>
              <div className="detail__spec">
                {property.furnished ? <CheckCircle2 size={16} color="#16a34a"/> : <XCircle size={16} color="#dc2626"/>}
                <span>{property.furnished ? 'Furnished' : 'Unfurnished'}</span>
              </div>
              <div className="detail__spec">
                {property.bachelorAllowed ? <CheckCircle2 size={16} color="#16a34a"/> : <XCircle size={16} color="#dc2626"/>}
                <span>Bachelors {property.bachelorAllowed ? 'Allowed' : 'Not Allowed'}</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="detail__contact">
              <a href={`tel:${property.contact}`} className="btn btn-primary btn-full">
                <Phone size={17}/> Call Owner
              </a>
              <a
                href={`https://wa.me/${waNumber}?text=Hi, I found your listing "${property.title}" on NestIQ and I'm interested. Is it still available?`}
                target="_blank" rel="noreferrer"
                className="btn btn-full"
                style={{background:'#25d366', color:'#fff'}}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp Owner
              </a>
            </div>

            {/* Favorite + Report */}
            <div className="detail__secondary">
              <button className={`btn btn-outline btn-sm ${faved?'detail__faved':''}`} onClick={handleFav}>
                <Heart size={15} fill={faved?'currentColor':'none'}/> {faved ? 'Saved' : 'Save'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setReporting(!reporting)}>
                <Flag size={15}/> Report
              </button>
            </div>

            {/* Report form */}
            {reporting && (
              <form className="detail__report fade-up" onSubmit={handleReport}>
                <h4>Report this listing</h4>
                <select className="form-input form-select" value={reportData.reason} onChange={e=>setReportData(d=>({...d,reason:e.target.value}))}>
                  {REPORT_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <textarea className="form-input" rows={3} placeholder="Additional details (optional)"
                  value={reportData.description} onChange={e=>setReportData(d=>({...d,description:e.target.value}))}/>
                <div style={{display:'flex',gap:'.5rem'}}>
                  <button type="submit" className="btn btn-danger btn-sm" disabled={submitting}>
                    {submitting?'Submitting...':'Submit Report'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setReporting(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Owner info */}
          <div className="card detail__owner">
            <div className="detail__owner-avatar">{property.owner?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div className="detail__owner-name">{property.owner?.name}</div>
              <div className="detail__owner-label">Property Owner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
