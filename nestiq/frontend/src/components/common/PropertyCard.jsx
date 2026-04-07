import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, BedDouble, Bath, Phone } from 'lucide-react';
import { addFavorite, removeFavorite } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './PropertyCard.css';

const TYPE_LABELS = { room: 'Room', hostel: 'Hostel', apartment: 'Apartment' };

export default function PropertyCard({ property, isFavorited: initFav = false, onFavChange }) {
  const { user } = useAuth();
  const [faved, setFaved] = useState(initFav);
  const [loading, setLoading] = useState(false);

  const handleFav = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to save listings'); return; }
    setLoading(true);
    try {
      if (faved) {
        await removeFavorite(property._id);
        setFaved(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(property._id);
        setFaved(true);
        toast.success('Added to favorites');
      }
      onFavChange && onFavChange(property._id, !faved);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const img = property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80';

  return (
    <Link to={`/property/${property._id}`} className="prop-card fade-up">
      <div className="prop-card__img-wrap">
        <img src={img} alt={property.title} className="prop-card__img" loading="lazy" />
        <span className={`badge badge-${property.status} prop-card__status`}>
          {property.status === 'available' ? '✓ Available' : '✗ Rented'}
        </span>
        <span className="prop-card__type">{TYPE_LABELS[property.type]}</span>
        <button
          className={`prop-card__fav ${faved ? 'prop-card__fav--active' : ''}`}
          onClick={handleFav}
          disabled={loading}
          aria-label="Save to favorites"
        >
          <Heart size={17} fill={faved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="prop-card__body">
        <div className="prop-card__price">
          Rs {property.price?.toLocaleString()}<span>/mo</span>
        </div>
        <h3 className="prop-card__title">{property.title}</h3>
        <div className="prop-card__loc">
          <MapPin size={13} />
          {property.area}, {property.city}
        </div>
        <div className="prop-card__meta">
          <span><BedDouble size={13} /> {property.rooms} Bed{property.rooms > 1 ? 's' : ''}</span>
          <span><Bath size={13} /> {property.bathrooms} Bath</span>
          {property.furnished && <span className="prop-card__tag">Furnished</span>}
          {property.bachelorAllowed && <span className="prop-card__tag prop-card__tag--green">Bachelors ✓</span>}
        </div>
      </div>

      <div className="prop-card__footer">
        <a
          href={`https://wa.me/92${property.contact?.replace(/^0/, '')}`}
          target="_blank" rel="noreferrer"
          className="prop-card__wa"
          onClick={e => e.stopPropagation()}
        >
          <Phone size={14} /> WhatsApp
        </a>
        <span className="prop-card__views">{property.views || 0} views</span>
      </div>
    </Link>
  );
}
