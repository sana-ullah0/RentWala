import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-dark)',
      color: 'rgba(255,255,255,.6)',
      padding: '3rem 0 1.5rem',
      marginTop: '4rem',
    }}>
      <div className="container" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'2rem' }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800, color:'#fff', marginBottom:'.75rem' }}>
            🏠 Nest<em style={{color:'var(--accent)',fontStyle:'normal'}}>IQ</em>
          </div>
          <p style={{ fontSize:'.9rem', lineHeight:1.7, maxWidth:280 }}>
            Pakistan's student housing platform. Find rooms, hostels & apartments — no brokers, no hassle.
          </p>
        </div>
        <div>
          <div style={{ color:'#fff', fontWeight:700, marginBottom:'.75rem', fontFamily:'var(--font-display)' }}>Explore</div>
          {[['/', 'Home'], ['/search', 'Browse Listings'], ['/register', 'Post Your Property']].map(([to, label]) => (
            <Link key={to} to={to} style={{ display:'block', fontSize:'.9rem', marginBottom:'.4rem', transition:'color .2s' }}
              onMouseEnter={e=>e.target.style.color='#fff'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.6)'}>{label}</Link>
          ))}
        </div>
        <div>
          <div style={{ color:'#fff', fontWeight:700, marginBottom:'.75rem', fontFamily:'var(--font-display)' }}>Account</div>
          {[['/login', 'Sign In'], ['/register', 'Join Free'], ['/profile', 'My Profile']].map(([to, label]) => (
            <Link key={to} to={to} style={{ display:'block', fontSize:'.9rem', marginBottom:'.4rem', transition:'color .2s' }}
              onMouseEnter={e=>e.target.style.color='#fff'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.6)'}>{label}</Link>
          ))}
        </div>
      </div>
      <div className="container" style={{ marginTop:'2rem', paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,.1)', fontSize:'.82rem', textAlign:'center' }}>
        © {new Date().getFullYear()} NestIQ — Built for students, by students.
      </div>
    </footer>
  );
}
