import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/UI/Loader';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHackathons();
  }, [search, source]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hackathons', { params: { search, source } });
      setHackathons(data.hackathons || data || []);
    } catch (err) {
      console.error('Hackathon fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-trophy"></i>
          Live Hackathons
        </h1>
        <p className="page-subtitle">Discover real hackathons from Devpost and Unstop</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div className="input-with-icon" style={{ flex: 1 }}>
          <i className="fa-solid fa-magnifying-glass input-icon"></i>
          <input
            className="glass-input"
            placeholder="Search hackathons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="glass-select" style={{ width: '180px' }} value={source} onChange={e => setSource(e.target.value)}>
          <option value="all">All Sources</option>
          <option value="devpost">Devpost</option>
          <option value="unstop">Unstop</option>
        </select>
      </div>

      {loading ? (
        <Loader text="Fetching live hackathons..." />
      ) : hackathons.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-state-icon"><i className="fa-solid fa-satellite-dish"></i></div>
          <h3 className="empty-state-title">No hackathons found</h3>
          <p className="empty-state-desc">Try adjusting your search or check back later for new events.</p>
        </div>
      ) : (
        <div className="grid-2 stagger-children">
          {hackathons.map((h, i) => (
            <a
              key={h.id || i}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card hackathon-card animate-fadeInUp"
              style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}
            >
              {h.thumbnailUrl && (
                <img
                  src={h.thumbnailUrl}
                  alt={h.title}
                  className="hackathon-thumb"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="hackathon-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span className={`hackathon-source ${h.source?.toLowerCase()}`}>
                    {h.source === 'Devpost' ? <i className="fa-solid fa-d"></i> : <i className="fa-solid fa-u"></i>}
                    {h.source}
                  </span>
                  {h.status && (
                    <span className="badge badge-success">{h.status}</span>
                  )}
                </div>

                <h3 className="hackathon-title">{h.title}</h3>

                <div className="hackathon-meta">
                  {h.deadline && (
                    <div className="hackathon-meta-item">
                      <i className="fa-regular fa-calendar"></i>
                      {h.deadline}
                    </div>
                  )}
                  {h.prize && (
                    <div className="hackathon-meta-item">
                      <i className="fa-solid fa-coins"></i>
                      {typeof h.prize === 'number' ? `$${h.prize.toLocaleString()}` : h.prize}
                    </div>
                  )}
                  {h.participants && (
                    <div className="hackathon-meta-item">
                      <i className="fa-solid fa-users"></i>
                      {h.participants} registered
                    </div>
                  )}
                  {h.location && (
                    <div className="hackathon-meta-item">
                      <i className="fa-solid fa-location-dot"></i>
                      {h.location}
                    </div>
                  )}
                </div>

                {h.themes?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: 'var(--space-md)' }}>
                    {h.themes.slice(0, 4).map(t => (
                      <span key={t} className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
