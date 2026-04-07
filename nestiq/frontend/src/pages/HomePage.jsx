import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Shield, MessageCircle } from 'lucide-react';
import { getProperties } from '../utils/api';
import PropertyCard from '../components/common/PropertyCard';
import './HomePage.css';

const CITIES = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery]         = useState('');
  const [city, setCity]           = useState('');
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getProperties({ limit: 6 })
      .then(({ data }) => setFeatured(data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (city)  params.set('city', city);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="container hero__content">
          <div className="hero__tag fade-up">🎓 Student Housing Platform</div>
          <h1 className="hero__title fade-up" style={{ animationDelay:'.05s' }}>
            Find Your Perfect<br /><span>Student Room</span>
          </h1>
          <p className="hero__sub fade-up" style={{ animationDelay:'.1s' }}>
            Rooms, hostels & apartments across Pakistan — no brokers, no fees.
          </p>

          <form className="hero__search fade-up" style={{ animationDelay:'.15s' }} onSubmit={handleSearch}>
            <div className="hero__search-input">
              <Search size={20} className="hero__search-icon" />
              <input
                type="text"
                placeholder="Search by area, city or keyword..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <select value={city} onChange={e => setCity(e.target.value)} className="hero__city-select">
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn btn-accent btn-lg">
              <Search size={18} /> Search
            </button>
          </form>

          <div className="hero__quick fade-up" style={{ animationDelay:'.2s' }}>
            {CITIES.slice(0,5).map(c => (
              <button key={c} onClick={() => navigate(`/search?city=${c}`)} className="hero__quick-btn">
                <MapPin size={12} />{c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats">
        <div className="container stats__grid">
          {[
            { n:'500+', label:'Active Listings' },
            { n:'12', label:'Cities Covered' },
            { n:'0', label:'Broker Fees' },
            { n:'1000+', label:'Students Helped' },
          ].map(s => (
            <div key={s.label} className="stats__item">
              <span className="stats__num">{s.n}</span>
              <span className="stats__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="section container">
        <div className="section__head">
          <h2>Featured Listings</h2>
          <button onClick={() => navigate('/search')} className="btn btn-outline btn-sm">
            View All →
          </button>
        </div>
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : featured.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No listings yet</h3>
            <p>Be the first to post a property!</p>
          </div>
        ) : (
          <div className="properties-grid">
            {featured.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="how section">
        <div className="container">
          <h2 style={{ textAlign:'center', marginBottom:'2.5rem' }}>How NestIQ Works</h2>
          <div className="how__grid">
            {[
              { icon:<Search size={28}/>, step:'01', title:'Search', desc:'Browse rooms by city, area, price and type.' },
              { icon:<MapPin size={28}/>, step:'02', title:'Explore', desc:'View full details, images and map location.' },
              { icon:<MessageCircle size={28}/>, step:'03', title:'Contact', desc:'Call or WhatsApp the owner directly — no middleman.' },
              { icon:<Shield size={28}/>, step:'04', title:'Rent', desc:'All listings are admin-approved for quality.' },
            ].map(h => (
              <div key={h.step} className="how__card">
                <div className="how__step">{h.step}</div>
                <div className="how__icon">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta container">
        <div className="cta__inner">
          <div>
            <h2>Are You a Property Owner?</h2>
            <p>Post your listing for free and reach thousands of students.</p>
          </div>
          <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/register?role=owner')} className="btn btn-accent btn-lg">
              <TrendingUp size={18} /> Post a Listing
            </button>
            <button onClick={() => navigate('/search')} className="btn btn-outline btn-lg">
              Browse First
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
