import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getProperties } from '../utils/api';
import PropertyCard from '../components/common/PropertyCard';
import './SearchPage.css';

const CITIES = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties]     = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [pages, setPages]               = useState(1);
  const [loading, setLoading]           = useState(true);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const [filters, setFilters] = useState({
    search:         searchParams.get('search') || '',
    city:           searchParams.get('city')   || '',
    area:           '',
    type:           '',
    minPrice:       '',
    maxPrice:       '',
    furnished:      '',
    bachelorAllowed:'',
  });

  const fetchProperties = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page: pg, limit: 12 };
      // Remove empty strings
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const { data } = await getProperties(params);
      setProperties(data.properties);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProperties(1); }, [filters, fetchProperties]);

  const handleFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    // sync URL
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setFilters({ search:'', city:'', area:'', type:'', minPrice:'', maxPrice:'', furnished:'', bachelorAllowed:'' });
    setSearchParams({});
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="search-page container">
      {/* Top bar */}
      <div className="search-page__bar">
        <div className="search-page__input-wrap">
          <Search size={18} className="search-page__icon" />
          <input
            className="search-page__input"
            placeholder="Search area, city, title..."
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
          />
          {filters.search && (
            <button onClick={() => handleFilter('search','')} className="search-page__clear-x"><X size={15}/></button>
          )}
        </div>
        <button
          className={`btn btn-outline ${filtersOpen ? 'btn-primary' : ''}`}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={16} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        {activeCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={14}/> Clear all
          </button>
        )}
      </div>

      {/* Expandable filters */}
      {filtersOpen && (
        <div className="search-page__filters fade-up">
          <div className="search-page__filters-grid">
            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-input form-select" value={filters.city} onChange={e => handleFilter('city', e.target.value)}>
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Area</label>
              <input className="form-input" placeholder="e.g. Johar Town" value={filters.area} onChange={e => handleFilter('area', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input form-select" value={filters.type} onChange={e => handleFilter('type', e.target.value)}>
                <option value="">All Types</option>
                <option value="room">Room</option>
                <option value="hostel">Hostel</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Min Price (Rs)</label>
              <input type="number" className="form-input" placeholder="e.g. 5000" value={filters.minPrice} onChange={e => handleFilter('minPrice', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Price (Rs)</label>
              <input type="number" className="form-input" placeholder="e.g. 20000" value={filters.maxPrice} onChange={e => handleFilter('maxPrice', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Furnished</label>
              <select className="form-input form-select" value={filters.furnished} onChange={e => handleFilter('furnished', e.target.value)}>
                <option value="">Any</option>
                <option value="true">Furnished</option>
                <option value="false">Unfurnished</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bachelors Allowed</label>
              <select className="form-input form-select" value={filters.bachelorAllowed} onChange={e => handleFilter('bachelorAllowed', e.target.value)}>
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="search-page__meta">
        {!loading && <span><strong>{total}</strong> properties found</span>}
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h3>No properties found</h3>
          <p>Try adjusting your filters or search terms.</p>
          <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="properties-grid">
            {properties.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="search-page__pagination">
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => fetchProperties(page-1)}>← Prev</button>
              <span>Page {page} of {pages}</span>
              <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => fetchProperties(page+1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
