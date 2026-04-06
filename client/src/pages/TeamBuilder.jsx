import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import TeamHealthDashboard from '../components/Team/TeamHealthDashboard';

export default function TeamBuilder() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateTeam = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/match/team/${user._id}`);
      setTeam(data.team);
      setIdeas(data.ideas || []);
    } catch (err) {
      console.error('Team generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <span className="material-symbols-outlined filled">groups</span>
          AI Team Builder
        </h1>
        <p className="page-subtitle">Let AI assemble your dream hackathon team with complementary skills</p>
      </div>

      {!team && !loading && (
        <div className="glass-card-static" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--accent-primary)', marginBottom: 'var(--space-lg)', display: 'block' }}>
            diversity_3
          </span>
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>Build Your Dream Team</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto var(--space-xl)' }}>
            Our AI analyzes all available developers and picks the best 3 teammates with diverse, complementary skills for your profile.
          </p>
          <button className="btn btn-primary btn-lg" onClick={generateTeam}>
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Generate Team
          </button>
        </div>
      )}

      {loading && <Loader text="AI is assembling your dream team..." />}

      {team && (
        <div className="animate-fadeInUp">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-people-group" style={{ color: 'var(--accent-primary-light)' }}></i>
              Your Dream Team
            </h2>
            <button className="btn btn-secondary btn-sm" onClick={generateTeam}>
              <i className="fa-solid fa-rotate"></i> Regenerate
            </button>
          </div>

          <div className="grid-4 stagger-children" style={{ marginBottom: 'var(--space-2xl)' }}>
            {team.map((member, i) => (
              <div key={member.user._id || i} className="glass-card animate-fadeInUp" style={{ textAlign: 'center' }}>
                <div className="match-avatar" style={{ width: 64, height: 64, fontSize: '1.5rem', margin: '0 auto var(--space-md)' }}>
                  {member.user.name?.[0]?.toUpperCase()}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{member.user.name}</h3>
                <div className="badge badge-primary" style={{ marginBottom: 'var(--space-md)' }}>
                  <i className="fa-solid fa-tag"></i> {member.role}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center' }}>
                  {(member.user.skills || []).slice(0, 4).map(s => (
                    <span key={s.name} className="skill-tag" style={{ fontSize: '0.6875rem' }}>
                      {s.name}
                    </span>
                  ))}
                </div>
                {i === 0 && (
                  <div className="badge badge-warning" style={{ marginTop: 'var(--space-sm)' }}>
                    <i className="fa-solid fa-star"></i> You
                  </div>
                )}
              </div>
            ))}
          </div>

          <TeamHealthDashboard team={team} />

          {ideas.length > 0 && (
            <>
              <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-lightbulb" style={{ color: 'var(--warning)' }}></i>
                AI Project Ideas
              </h2>
              <div className="grid-3 stagger-children">
                {ideas.map((idea, i) => (
                  <div key={i} className="glass-card animate-fadeInUp">
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--accent-secondary)' }}>auto_awesome</span>
                      {idea.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                      {idea.description}
                    </p>
                    {idea.roleMapping && (
                      <div style={{ marginTop: 'var(--space-md)', fontSize: '0.8125rem' }}>
                        {Object.entries(idea.roleMapping).map(([name, responsibility]) => (
                          <div key={name} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-user" style={{ color: 'var(--accent-primary)', marginTop: '2px' }}></i>
                            <span><strong>{name}:</strong> {responsibility}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
