import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import ScoreRing from '../components/UI/ScoreRing';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState({});

  useEffect(() => {
    if (user) loadMatches();
  }, [user]);

  const loadMatches = async () => {
    try {
      const { data } = await api.get(`/match/${user._id}`);
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const getExplanation = async (targetId) => {
    if (explanations[targetId]) return;
    setLoadingExplanation(prev => ({ ...prev, [targetId]: true }));
    try {
      const { data } = await api.get(`/match/explain/${user._id}/${targetId}`);
      setExplanations(prev => ({ ...prev, [targetId]: data.explanation }));
    } catch (err) {
      setExplanations(prev => ({ ...prev, [targetId]: 'Could not generate explanation.' }));
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [targetId]: false }));
    }
  };

  if (loading) return <Loader text="Finding your best matches..." />;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-sparkles"></i>
          Your Matches
        </h1>
        <p className="page-subtitle">AI-ranked teammates based on your profile ({matches.length} found)</p>
      </div>

      {matches.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-state-icon"><i className="fa-solid fa-user-group"></i></div>
          <h3 className="empty-state-title">No matches found</h3>
          <p className="empty-state-desc">Complete your profile and wait for other developers to join.</p>
        </div>
      ) : (
        <div className="flex-col gap-lg stagger-children">
          {matches.map((match, i) => (
            <div key={match.user._id || i} className="glass-card match-card animate-fadeInUp">
              <div className={`match-avatar ${match.user.blindMode ? 'anonymous' : ''}`}>
                {match.user.blindMode ? <i className="fa-solid fa-user-secret"></i> : match.user.name?.[0]?.toUpperCase()}
              </div>

              <div className="match-info">
                <div className="match-name">
                  {match.user.blindMode ? 'Anonymous Developer' : match.user.name}
                </div>
                <div className="match-role">
                  <i className="fa-solid fa-briefcase" style={{ marginRight: '0.375rem', fontSize: '0.75rem' }}></i>
                  {match.assignedRole || match.user.role}
                  {match.user.experience && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                      / {match.user.experience}
                    </span>
                  )}
                </div>
                <div className="match-skills">
                  {(match.user.skills || []).slice(0, 5).map(s => (
                    <span key={s.name} className={`skill-tag ${s.verified ? 'verified' : ''}`}>
                      {s.name}
                      {s.verified && <span className="material-symbols-outlined filled" style={{ fontSize: '0.875rem' }}>verified</span>}
                    </span>
                  ))}
                  {(match.user.skills || []).length > 5 && (
                    <span className="skill-tag">+{match.user.skills.length - 5}</span>
                  )}
                </div>

                {match.sharedSkills?.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <i className="fa-solid fa-link" style={{ marginRight: '0.25rem' }}></i>
                    Shared: {match.sharedSkills.join(', ')}
                  </div>
                )}

                {explanations[match.user._id] && (
                  <div className="match-explanation">
                    <i className="fa-solid fa-quote-left" style={{ marginRight: '0.5rem', opacity: 0.5 }}></i>
                    {explanations[match.user._id]}
                  </div>
                )}
              </div>

              <div className="match-actions">
                <ScoreRing score={match.compatibility} />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => getExplanation(match.user._id)}
                  disabled={loadingExplanation[match.user._id]}
                >
                  {loadingExplanation[match.user._id] ? (
                    <><div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div></>
                  ) : explanations[match.user._id] ? (
                    <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>visibility</span> Explained</>
                  ) : (
                    <><i className="fa-solid fa-brain"></i> AI Explain</>
                  )}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => window.location.href = `/chat?target=${match.user._id}`}>
                  <i className="fa-solid fa-message"></i> Chat
                </button>
              </div>

              {match.breakdown && (
                <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-md)' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-sm)' }}>
                      {Object.entries(match.breakdown)
                          .filter(([_, v]) => v > 0)
                          .map(([key, value]) => {
                             const labels = { skillOverlap: 'Skills', verifiedSkills: 'Verified', roleComplement: 'Role', goalsMatch: 'Goals', availabilityMatch: 'Availability', heatmapOverlap: 'Schedule', domainMatch: 'Domain', vibeMatch: 'Vibe' };
                             const colors = { skillOverlap: '#6366f1', verifiedSkills: '#10b981', roleComplement: '#22d3ee', goalsMatch: '#f59e0b', availabilityMatch: '#8b5cf6', heatmapOverlap: '#14b8a6', domainMatch: '#ec4899', vibeMatch: '#ef4444' };
                             return (
                               <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{labels[key] || key}</span>
                                    <span style={{ fontWeight: 600 }}>{value}</span>
                                 </div>
                                 <div style={{ height: '4px', background: 'rgba(148,163,184,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(value/30)*100}%`, background: colors[key] || '#6366f1' }} />
                                 </div>
                               </div>
                             );
                          })}
                   </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}