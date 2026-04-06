import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/UI/Loader';

export default function JoinTeam() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    loadInvite();
  }, [token]);

  const loadInvite = async () => {
    try {
      const { data } = await api.get(`/auth/invite/${token}`);
      setInvite(data);

      // Check if already expired
      if (new Date(data.expiresAt) < new Date()) {
        setError('This invite link has expired.');
      }
      // Check if full
      if (data.members?.length >= data.teamSlots) {
        setError('This team is already full.');
      }
    } catch (err) {
      setError('Invalid or expired invite link.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setJoining(true);
    setError('');
    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const { data } = await api.post(`/auth/invite/${token}/join`, { phone: fullPhone });

      // Store token and user
      localStorage.setItem('devmatch_token', data.token);
      localStorage.setItem('devmatch_user', JSON.stringify(data.user));
      setJoined(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        if (data.isNewUser) {
          navigate('/profile');
        } else {
          navigate('/team');
        }
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <Loader text="Loading invite..." />;

  return (
    <div className="join-page">
      <div className="join-container animate-scaleIn">
        {/* Header */}
        <div className="join-header">
          <div className="join-logo">
            <i className="fa-solid fa-code"></i>
          </div>
          <h1 className="join-title">
            Dev<span style={{ color: 'var(--accent-primary-light)' }}>Match</span>
          </h1>
          <p className="join-subtitle">Team Invitation</p>
        </div>

        {joined ? (
          <div className="join-success animate-fadeInUp">
            <div className="join-success-icon">
              <span className="material-symbols-outlined filled">celebration</span>
            </div>
            <h2>You're In! 🎉</h2>
            <p>Welcome to the team. Redirecting you now...</p>
            <div className="loader" style={{ margin: '1rem auto' }}></div>
          </div>
        ) : error && !invite ? (
          <div className="join-error-state">
            <div className="join-error-icon">
              <i className="fa-solid fa-link-slash"></i>
            </div>
            <h2>Invalid Invite</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginTop: 'var(--space-lg)' }}>
              <i className="fa-solid fa-right-to-bracket"></i> Sign Up Instead
            </button>
          </div>
        ) : invite ? (
          <>
            {/* Team Preview */}
            <div className="join-team-preview glass-card-static">
              <div className="join-team-info">
                <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                  {invite.teamName || `Team by ${invite.createdBy?.name || 'a Developer'}`}
                </h2>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  <span><i className="fa-solid fa-users" style={{ marginRight: '0.25rem' }}></i> {invite.members?.length || 0}/{invite.teamSlots} members</span>
                </div>
              </div>

              {/* Current Members */}
              {invite.members?.length > 0 && (
                <div className="join-team-members">
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                    Current Members
                  </h3>
                  <div className="join-member-list">
                    {invite.members.map(m => (
                      <div key={m._id} className="join-member-item">
                        <div className="join-member-avatar">
                          {m.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.role || 'Developer'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Slots Remaining */}
              <div className="join-slots">
                {Array.from({ length: invite.teamSlots }).map((_, i) => (
                  <div
                    key={i}
                    className={`join-slot ${i < (invite.members?.length || 0) ? 'filled' : 'open'}`}
                    title={i < (invite.members?.length || 0) ? invite.members[i]?.name : 'Open Slot'}
                  >
                    {i < (invite.members?.length || 0)
                      ? <i className="fa-solid fa-user-check"></i>
                      : <i className="fa-solid fa-user-plus"></i>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Join Form */}
            {invite.members?.length < invite.teamSlots && !error ? (
              <div className="join-form">
                <div className="join-phone-input">
                  <span className="join-phone-prefix">+91</span>
                  <input
                    className="glass-input"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    style={{ paddingLeft: '3.5rem' }}
                  />
                </div>
                {error && <p className="join-error-text">{error}</p>}
                <button
                  className="btn btn-primary btn-lg btn-full"
                  onClick={handleJoin}
                  disabled={joining || phone.length < 10}
                >
                  {joining ? (
                    <><div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Joining...</>
                  ) : (
                    <><i className="fa-solid fa-people-arrows"></i> Join Team</>
                  )}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
                  You'll be prompted to complete your profile after joining.
                </p>
              </div>
            ) : (
              <div className="join-closed">
                <i className="fa-solid fa-lock"></i>
                <p>{error || 'This team is full.'}</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
