import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Loader from '../components/UI/Loader';

const ROLE_ICONS = {
  'Frontend': 'fa-solid fa-palette', 'Frontend Lead': 'fa-solid fa-palette',
  'Backend': 'fa-solid fa-server', 'Backend Lead': 'fa-solid fa-server',
  'Full Stack': 'fa-solid fa-layer-group', 'ML Engineer': 'fa-solid fa-brain',
  'UI/UX Designer': 'fa-solid fa-pen-ruler', 'Mobile Dev': 'fa-solid fa-mobile-screen',
  'DevOps': 'fa-solid fa-gears',
};
const MEMBER_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#22d3ee', '#8b5cf6'];

export default function Developers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devReq, teamReq] = await Promise.all([
        api.get('/users/developers'),
        api.get('/users/my-teams')
      ]);
      setDevelopers(devReq.data);
      // Filter so only teams I own where slots are open are shown
      setMyTeams(teamReq.data.filter(t => 
        (t.createdBy._id === user._id || t.createdBy === user._id) 
      ));
    } catch (err) {
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const filteredDevs = developers.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.role?.toLowerCase().includes(search.toLowerCase()) ||
    d.skills?.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSendInvite = async (teamId, targetUserId) => {
    setSendingInvite(true);
    try {
      await api.post(`/auth/teams/${teamId}/invite-user`, { userId: targetUserId, message: inviteMessage });
      toast.success('Invitation sent successfully!');
      setShowInviteModal(null);
      setInviteMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading) return <Loader text="Loading developers..." />;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <span className="material-symbols-outlined filled">search</span>
          Discover Developers
        </h1>
        <p className="page-subtitle">Browse all developers, find the perfect match, and manually invite them to your team.</p>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="glass-card-static" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', padding: 'var(--space-md)' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
          <input 
            type="text" 
            placeholder="Search by name, role, or specific skill (e.g., React, Python)..." 
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', flex: 1, fontSize: '1rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredDevs.length === 0 ? (
        <div className="team-empty-state glass-card-static">
          <div className="team-empty-icon"><i className="fa-solid fa-user-slash"></i></div>
          <h3>No Developers Found</h3>
          <p>Try adjusting your search filters to find available developers.</p>
        </div>
      ) : (
        <div className="team-members-grid stagger-children">
          {filteredDevs.map((dev, i) => (
            <div key={dev._id} className="team-member-card glass-card animate-fadeInUp">
              <div className="team-member-header">
                <div className="team-member-avatar" style={{ '--member-color': MEMBER_COLORS[i % MEMBER_COLORS.length] }}>
                  {dev.name?.[0]?.toUpperCase()}
                </div>
                <div className="team-member-info">
                  <h3 className="team-member-name">{dev.name}</h3>
                  <div className="team-member-role"><i className={ROLE_ICONS[dev.role] || 'fa-solid fa-code'}></i>{dev.role || 'Developer'}</div>
                </div>
                <div className="team-member-level">
                  <span className="team-member-xp"><i className="fa-solid fa-bolt"></i> {dev.xp || 0}</span>
                  <span className={`badge badge-${dev.level === 'Legend' ? 'danger' : dev.level === 'Pro' ? 'warning' : 'primary'}`}>{dev.level || 'Rookie'}</span>
                </div>
              </div>
              
              <div className="team-member-skills" style={{ minHeight: '32px' }}>
                {(dev.skills || []).slice(0, 6).map(s => (
                  <span key={s.name} className={`skill-tag ${s.verified ? 'verified' : ''}`}>
                    {s.name}{s.verified && <span className="material-symbols-outlined filled" style={{ fontSize: '0.75rem' }}>verified</span>}
                  </span>
                ))}
              </div>

              <div className="team-member-meta" style={{ minHeight: '24px' }}>
                {dev.githubUsername && <a href={dev.githubData?.profileUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}><i className="fa-brands fa-github"></i> {dev.githubUsername}</a>}
                {dev.goals && <span><i className="fa-solid fa-bullseye"></i> {dev.goals}</span>}
              </div>

              <div className="team-member-actions">
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setShowInviteModal(dev)}>
                  <i className="fa-solid fa-envelope"></i> Invite to Team
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/chat?target=${dev._id}`)}>
                  <i className="fa-solid fa-message"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(null)}>
          <div className="modal-content glass-card-static animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-envelope-open-text" style={{ color: 'var(--accent-primary-light)' }}></i> Invite {showInviteModal.name}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {myTeams.length === 0 ? (
              <div className="text-center" style={{ padding: 'var(--space-xl) 0' }}>
                <i className="fa-solid fa-shield" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}></i>
                <p style={{ color: 'var(--text-secondary)' }}>You don't own any teams with open slots.</p>
                <button className="btn btn-primary" onClick={() => navigate('/team')} style={{ marginTop: 'var(--space-md)' }}>
                  Go to Team Hub
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
                  Write a short message to introduce yourself and your project.
                </p>
                <textarea
                  className="glass-input"
                  placeholder={`Hi ${showInviteModal.name.split(' ')[0]}, I loved your profile and think you'd be a great fit for...`}
                  value={inviteMessage}
                  onChange={e => setInviteMessage(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', marginBottom: 'var(--space-lg)' }}
                />
                
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>Select Team</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxHeight: '200px', overflowY: 'auto' }}>
                  {myTeams.map(team => (
                    <div key={team._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm) var(--space-md)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{team.teamName || `Team #${team.token?.slice(0, 6)}`}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="fa-solid fa-users"></i> {team.members?.length || 0}/{team.teamSlots} Members</div>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleSendInvite(team._id, showInviteModal._id)} 
                        disabled={sendingInvite || team.members?.length >= team.teamSlots}
                      >
                        {sendingInvite ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : (team.members?.length >= team.teamSlots ? 'Full' : 'Send Invite')}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
