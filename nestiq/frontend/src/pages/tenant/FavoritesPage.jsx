import React, { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { getFavorites } from '../../utils/api';
import PropertyCard from '../../components/common/PropertyCard';
import { Link } from 'react-router-dom';
import './TenantPages.css';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getFavorites()
      .then(({ data }) => setFavorites(data.favorites || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (propertyId) => {
    setFavorites((prev) => prev.filter((f) => f.property?._id !== propertyId));
  };

  return (
    <div className="tenant-page">
      <div className="container">
        <div className="page-header">
          <Heart size={28} className="page-header__icon" />
          <div>
            <h1>My Favorites</h1>
            <p>Properties you've saved for later</p>
          </div>
        </div>

        {loading ? (
          <div className="cards-grid">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <Heart size={56} />
            <h3>No saved properties yet</h3>
            <p>Tap the ❤️ on any listing to save it here.</p>
            <Link to="/search" className="btn btn--primary">
              <Search size={16} /> Browse Listings
            </Link>
          </div>
        ) : (
          <>
            <p className="result-count">{favorites.length} saved listing{favorites.length !== 1 ? 's' : ''}</p>
            <div className="cards-grid">
              {favorites.map((fav) =>
                fav.property ? (
                  <PropertyCard
                    key={fav._id}
                    property={fav.property}
                    onUnfavorite={handleRemove}
                    isFavorited
                  />
                ) : null
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
