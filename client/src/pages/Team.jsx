import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import TeamInviteLink from '../components/Team/TeamInviteLink';
import TeamHealthDashboard from '../components/Team/TeamHealthDashboard';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

const MEMBER_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#22d3ee', '#8b5cf6'];
const ROLE_ICONS = {
  'Frontend': 'fa-solid fa-palette', 'Frontend Lead': 'fa-solid fa-palette',
  'Backend': 'fa-solid fa-server', 'Backend Lead': 'fa-solid fa-server',
  'Full Stack': 'fa-solid fa-layer-group', 'ML Engineer': 'fa-solid fa-brain',
  'UI/UX Designer': 'fa-solid fa-pen-ruler', 'Mobile Dev': 'fa-solid fa-mobile-screen',
  'DevOps': 'fa-solid fa-gears',
};

export default function Team() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-team');
  const [myTeams, setMyTeams] = useState([]);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [aiTeam, setAiTeam] = useState(null);
  const [aiIdeas, setAiIdeas] = useState([]);
  const [dismissedAi, setDismissedAi] = useState([]);
  const [browseTeams, setBrowseTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [requestingTeams, setRequestingTeams] = useState({});
  const [acceptingReqs, setAcceptingReqs] = useState({});
  const [rejectingReqs, setRejectingReqs] = useState({});
  const [addingToTeam, setAddingToTeam] = useState({});
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [incomingInvites, setIncomingInvites] = useState([]);
  const [managingInvite, setManagingInvite] = useState({});

  useEffect(() => { loadMyTeams(); loadIncomingInvites(); }, [user]);

  const loadMyTeams = async () => {
    try {
      const { data } = await api.get('/users/my-teams');
      setMyTeams(data);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setMyTeams([]);
    } finally { setLoading(false); }
  };

  const generateAiTeam = async () => {
    setAiLoading(true);
    setDismissedAi([]);
    try {
      const { data } = await api.get(`/match/team/${user._id}`);
      setAiTeam(data.team);
      setAiIdeas(data.ideas || []);
    } catch (err) { console.error('AI Team generation failed:', err); }
    finally { setAiLoading(false); }
  };

  const loadIncomingInvites = async () => {
    try {
      const { data } = await api.get('/users/incoming-invites');
      setIncomingInvites(data);
    } catch (err) {
      console.error('Failed to load incoming invites:', err);
    }
  };

  const handleIncomingInviteResponse = async (teamId, inviteId, action) => {
    setManagingInvite(prev => ({ ...prev, [inviteId]: true }));
    try {
      await api.post(`/auth/teams/${teamId}/invites/${inviteId}/${action}`);
      toast.success(action === 'accept' ? 'Successfully joined the team!' : 'Invite rejected.');
      if (action === 'accept') {
        loadMyTeams();
      }
      loadIncomingInvites();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} invite`);
    } finally {
      setManagingInvite(prev => ({ ...prev, [inviteId]: false }));
    }
  };

  const loadBrowseTeams = async () => {
    setBrowseLoading(true);
    try {
      const { data } = await api.get('/auth/teams/browse');
      setBrowseTeams(data);
    } catch (err) { console.error('Failed to load teams:', err); }
    finally { setBrowseLoading(false); }
  };

  const sendJoinRequest = async (teamId) => {
    setRequestingTeams(prev => ({ ...prev, [teamId]: true }));
    try {
      await api.post(`/auth/teams/${teamId}/request`, { message: requestMessage });
      setShowRequestModal(null);
      setRequestMessage('');
      toast.success('Join request sent successfully!');
      loadBrowseTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestingTeams(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const handleAcceptRequest = async (teamId, requestId) => {
    setAcceptingReqs(prev => ({ ...prev, [requestId]: true }));
    try {
      const { data } = await api.post(`/auth/teams/${teamId}/request/${requestId}/accept`);
      setMyTeams(prev => prev.map(t => t._id === teamId ? data.team : t));
      toast.success('Request accepted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to accept'); }
    finally { setAcceptingReqs(prev => ({ ...prev, [requestId]: false })); }
  };

  const handleRejectRequest = async (teamId, requestId) => {
    setRejectingReqs(prev => ({ ...prev, [requestId]: true }));
    try {
      await api.post(`/auth/teams/${teamId}/request/${requestId}/reject`);
      toast.success('Request rejected');
      loadMyTeams();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
    finally { setRejectingReqs(prev => ({ ...prev, [requestId]: false })); }
  };

  const handleAddAiMember = async (targetUserId, fromModal = false) => {
    if (myTeams.length === 0) {
      toast.warning('Create a team first before adding AI-recommended members');
      return;
    }
    const teamId = myTeams[activeTeamIdx]?._id;
    if (!teamId) return;
    setAddingToTeam(prev => ({ ...prev, [targetUserId]: true }));
    try {
      const { data } = await api.post(`/auth/teams/${teamId}/add-member`, { userId: targetUserId });
      setMyTeams(prev => prev.map(t => t._id === teamId ? data.team : t));
      setDismissedAi(prev => [...prev, targetUserId]);
      toast.success('Member added successfully!');
      if (fromModal) setShowAddMemberModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
    finally { setAddingToTeam(prev => ({ ...prev, [targetUserId]: false })); }
  };

  const dismissAiMember = (targetUserId) => {
    setDismissedAi(prev => [...prev, targetUserId]);
  };

  const activeTeam = myTeams[activeTeamIdx];
  const isOwner = activeTeam?.createdBy?._id === user._id || activeTeam?.createdBy === user._id;
  const pendingRequests = (activeTeam?.joinRequests || []).filter(r => r.status === 'pending');
  const visibleAiTeam = (aiTeam || []).filter(m => !dismissedAi.includes(m.user._id) && m.user._id !== user._id);

  // Aggregate stats
  const teamStats = useMemo(() => {
    const members = activeTeam?.members || [];
    if (members.length === 0) return null;
    const totalXp = members.reduce((acc, m) => acc + (m.xp || 0), 0);
    const skillSet = new Set();
    let verified = 0;
    members.forEach(m => (m.skills || []).forEach(s => { skillSet.add(s.name); if (s.verified) verified++; }));
    return { totalXp, totalSkills: skillSet.size, verified, count: members.length };
  }, [activeTeam]);

  // Radar data
  const radarData = useMemo(() => {
    const members = activeTeam?.members || [];
    if (members.length === 0) return [];
    const ss = new Set(); members.forEach(m => (m.skills || []).forEach(s => ss.add(s.name)));
    return [...ss].slice(0, 10).map(skill => {
      const p = { skill };
      members.forEach((m, i) => { p[`m${i}`] = (m.skills || []).find(s => s.name === skill)?.level || 0; });
      return p;
    });
  }, [activeTeam]);

  if (loading) return <Loader text="Loading your teams..." />;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <span className="material-symbols-outlined filled">groups</span>
          Team Hub
        </h1>
        <p className="page-subtitle">Manage teams, review join requests, and discover open teams</p>
      </div>

      {/* ── Tabs ── */}
      <div className="team-tabs">
        <button className={`team-tab ${activeTab === 'my-team' ? 'active' : ''}`} onClick={() => setActiveTab('my-team')}>
          <i className="fa-solid fa-people-group"></i> My Teams
          {myTeams.length > 0 && <span className="team-tab-count">{myTeams.length}</span>}
        </button>
        <button className={`team-tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => { setActiveTab('browse'); if (browseTeams.length === 0) loadBrowseTeams(); }}>
          <i className="fa-solid fa-compass"></i> Browse Teams
        </button>
        <button className={`team-tab ${activeTab === 'ai-team' ? 'active' : ''}`} onClick={() => { setActiveTab('ai-team'); if (!aiTeam) generateAiTeam(); }}>
          <i className="fa-solid fa-wand-magic-sparkles"></i> AI Suggested
        </button>
      </div>

      {/* ═══════════════ MY TEAMS TAB ═══════════════ */}
      {activeTab === 'my-team' && (
        <div className="animate-fadeInUp">

          {/* Incoming Invites Section */}
          {incomingInvites.length > 0 && (
            <div className="team-section animate-fadeInUp" style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 className="team-section-title">
                <i className="fa-solid fa-envelope-open-text" style={{ color: 'var(--accent-primary-light)' }}></i>
                Incoming Invitations
                <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>{incomingInvites.length} NEW</span>
              </h2>
              <div className="grid-2 stagger-children">
                {incomingInvites.map(team => (
                  <div key={team.myInvite._id} className="glass-card animate-fadeInUp" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{team.teamName || `Team by ${team.createdBy?.name}`}</h3>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                           <i className="fa-solid fa-user-shield"></i> from {team.createdBy?.name}
                        </div>
                      </div>
                      <div className="badge badge-primary">{team.members?.length || 0}/{team.teamSlots} slots</div>
                    </div>
                    {team.myInvite.message && (
                      <div className="request-message" style={{ marginBottom: 'var(--space-md)' }}>
                        <i className="fa-solid fa-quote-left" style={{ fontSize: '0.625rem', opacity: 0.4 }}></i>
                        <span>{team.myInvite.message}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <button 
                        className="btn btn-success btn-sm" 
                        style={{ flex: 1 }} 
                        onClick={() => handleIncomingInviteResponse(team._id, team.myInvite._id, 'accept')}
                        disabled={managingInvite[team.myInvite._id]}
                      >
                         {managingInvite[team.myInvite._id] ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : <><i className="fa-solid fa-check"></i> Accept</>}
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        style={{ flex: 1 }}
                        onClick={() => handleIncomingInviteResponse(team._id, team.myInvite._id, 'reject')}
                        disabled={managingInvite[team.myInvite._id]}
                      >
                         {managingInvite[team.myInvite._id] ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : <><i className="fa-solid fa-xmark"></i> Decline</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myTeams.length === 0 ? (
            <div className="team-empty-state glass-card-static">
              <div className="team-empty-icon"><span className="material-symbols-outlined">group_add</span></div>
              <h3>No Teams Yet</h3>
              <p>Create a team and share the invite link, or browse open teams to request joining.</p>
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <TeamInviteLink buttonStyle="btn btn-primary" onInviteCreated={loadMyTeams} />
                <button className="btn btn-secondary" onClick={() => { setActiveTab('browse'); loadBrowseTeams(); }}>
                  <i className="fa-solid fa-compass"></i> Browse Teams
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Team Selector */}
              {myTeams.length > 1 && (
                <div className="team-selector">
                  {myTeams.map((t, i) => (
                    <button key={t._id} className={`team-selector-btn ${i === activeTeamIdx ? 'active' : ''}`} onClick={() => setActiveTeamIdx(i)}>
                      <i className="fa-solid fa-users"></i>
                      {t.teamName || `Team ${i + 1}`}
                      <span className="team-selector-count">{t.members?.length || 0}/{t.teamSlots}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Hero Card */}
              <div className="team-hero glass-card-static">
                <div className="team-hero-content">
                  <div className="team-hero-left">
                    <div className="team-hero-badge"><span className="material-symbols-outlined filled">shield</span></div>
                    <div>
                      <h2 className="team-hero-name">{activeTeam.teamName || `Team #${activeTeam.token?.slice(0, 6)}`}</h2>
                      <div className="team-hero-meta">
                        <span><i className="fa-solid fa-user-shield"></i> {activeTeam.createdBy?.name || 'You'}</span>
                        <span><i className="fa-solid fa-clock"></i> {new Date(activeTeam.createdAt).toLocaleDateString()}</span>
                        <span className={`team-slots-badge ${activeTeam.members?.length >= activeTeam.teamSlots ? 'full' : ''}`}>
                          <i className="fa-solid fa-users"></i> {activeTeam.members?.length || 0}/{activeTeam.teamSlots}
                        </span>
                        {activeTeam.isOpen && <span className="badge badge-success"><i className="fa-solid fa-door-open"></i> Open</span>}
                        {pendingRequests.length > 0 && <span className="badge badge-warning"><i className="fa-solid fa-bell"></i> {pendingRequests.length} pending</span>}
                      </div>
                    </div>
                  </div>
                  <div className="team-hero-actions">
                    <TeamInviteLink hackathonId={activeTeam.hackathonId} buttonStyle="btn btn-primary btn-sm" onInviteCreated={loadMyTeams} />
                  </div>
                </div>
              </div>

              {/* ── Pending Join Requests (Owner only) ── */}
              {isOwner && pendingRequests.length > 0 && (
                <div className="team-section animate-fadeInUp">
                  <h2 className="team-section-title">
                    <i className="fa-solid fa-bell" style={{ color: 'var(--warning)' }}></i>
                    Join Requests
                    <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>{pendingRequests.length}</span>
                  </h2>
                  <div className="team-requests-grid stagger-children">
                    {pendingRequests.map(req => (
                      <div key={req._id} className="team-request-card glass-card animate-fadeInUp">
                        {/* Requester Profile */}
                        <div className="team-request-header">
                          <div className="team-member-avatar" style={{ width: 44, height: 44, fontSize: '1.125rem' }}>
                            {req.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.125rem' }}>{req.user?.name || 'Unknown'}</h3>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <i className={ROLE_ICONS[req.user?.role] || 'fa-solid fa-code'} style={{ fontSize: '0.6875rem' }}></i>
                              {req.user?.role || 'Developer'}
                              {req.user?.experience && <span style={{ color: 'var(--text-muted)' }}>/ {req.user.experience}</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {req.user?.xp > 0 && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)' }}><i className="fa-solid fa-bolt"></i> {req.user.xp} XP</div>}
                            <div className={`badge badge-${req.user?.level === 'Legend' ? 'danger' : req.user?.level === 'Pro' ? 'warning' : 'primary'}`} style={{ fontSize: '0.625rem' }}>
                              {req.user?.level || 'Rookie'}
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="team-member-skills" style={{ marginTop: 'var(--space-sm)' }}>
                          {(req.user?.skills || []).slice(0, 8).map(s => (
                            <span key={s.name} className={`skill-tag ${s.verified ? 'verified' : ''}`} style={{ fontSize: '0.75rem' }}>
                              {s.name}{s.verified && <span className="material-symbols-outlined filled" style={{ fontSize: '0.625rem' }}>verified</span>}
                            </span>
                          ))}
                        </div>

                        {/* GitHub */}
                        {req.user?.githubUsername && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
                            <i className="fa-brands fa-github" style={{ marginRight: '0.25rem' }}></i>
                            <a href={req.user.githubData?.profileUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>
                              {req.user.githubUsername}
                            </a>
                            {req.user.githubData?.contributions && <span style={{ marginLeft: '0.5rem' }}>{req.user.githubData.contributions} repos</span>}
                          </div>
                        )}

                        {/* Message from requester */}
                        {req.message && (
                          <div className="request-message">
                            <i className="fa-solid fa-quote-left" style={{ fontSize: '0.625rem', opacity: 0.4 }}></i>
                            <span>{req.message}</span>
                          </div>
                        )}

                        {/* Accept / Reject */}
                        <div className="team-request-actions">
                          <button className="btn btn-success btn-sm" onClick={() => handleAcceptRequest(activeTeam._id, req._id)} disabled={acceptingReqs[req._id]}>
                            {acceptingReqs[req._id] ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : <><i className="fa-solid fa-check"></i> Accept</>}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRejectRequest(activeTeam._id, req._id)} disabled={rejectingReqs[req._id]}>
                            {rejectingReqs[req._id] ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : <><i className="fa-solid fa-xmark"></i> Reject</>}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/chat?target=${req.user?._id}`)}>
                            <i className="fa-solid fa-message"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {teamStats && (
                <div className="team-stats-grid stagger-children">
                  <div className="glass-card team-stat-card animate-fadeInUp">
                    <div className="team-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}><i className="fa-solid fa-users"></i></div>
                    <div className="team-stat-value">{teamStats.count}</div>
                    <div className="team-stat-label">Members</div>
                  </div>
                  <div className="glass-card team-stat-card animate-fadeInUp">
                    <div className="team-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><i className="fa-solid fa-code"></i></div>
                    <div className="team-stat-value">{teamStats.totalSkills}</div>
                    <div className="team-stat-label">Unique Skills</div>
                  </div>
                  <div className="glass-card team-stat-card animate-fadeInUp">
                    <div className="team-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><span className="material-symbols-outlined filled">verified</span></div>
                    <div className="team-stat-value">{teamStats.verified}</div>
                    <div className="team-stat-label">Verified</div>
                  </div>
                  <div className="glass-card team-stat-card animate-fadeInUp">
                    <div className="team-stat-icon" style={{ background: 'rgba(236,72,153,0.12)', color: '#ec4899' }}><i className="fa-solid fa-bolt"></i></div>
                    <div className="team-stat-value">{teamStats.totalXp}</div>
                    <div className="team-stat-label">Total XP</div>
                  </div>
                </div>
              )}

              {/* Members */}
              <div className="team-section">
                <h2 className="team-section-title"><i className="fa-solid fa-id-badge" style={{ color: 'var(--accent-primary-light)' }}></i> Team Members</h2>
                <div className="team-members-grid stagger-children">
                  {(activeTeam.members || []).map((member, i) => (
                    <div key={member._id} className="team-member-card glass-card animate-fadeInUp">
                      <div className="team-member-header">
                        <div className="team-member-avatar" style={{ '--member-color': MEMBER_COLORS[i % MEMBER_COLORS.length] }}>{member.name?.[0]?.toUpperCase() || '?'}</div>
                        <div className="team-member-info">
                          <h3 className="team-member-name">
                            {member.name || 'New Member'}
                            {member._id === user._id && <span className="you-badge">You</span>}
                          </h3>
                          <div className="team-member-role"><i className={ROLE_ICONS[member.role] || 'fa-solid fa-code'}></i>{member.role || 'Unassigned'}</div>
                        </div>
                        <div className="team-member-level">
                          <span className="team-member-xp"><i className="fa-solid fa-bolt"></i> {member.xp || 0}</span>
                          <span className={`badge badge-${member.level === 'Legend' ? 'danger' : member.level === 'Pro' ? 'warning' : 'primary'}`}>{member.level || 'Rookie'}</span>
                        </div>
                      </div>
                      <div className="team-member-skills">
                        {(member.skills || []).slice(0, 6).map(s => (
                          <span key={s.name} className={`skill-tag ${s.verified ? 'verified' : ''}`}>{s.name}{s.verified && <span className="material-symbols-outlined filled" style={{ fontSize: '0.75rem' }}>verified</span>}</span>
                        ))}
                      </div>
                      <div className="team-member-meta">
                        {member.experience && <span><i className="fa-solid fa-chart-line"></i> {member.experience}</span>}
                        {member.githubUsername && <a href={member.githubData?.profileUrl || '#'} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-github"></i> {member.githubUsername}</a>}
                        {member.goals && <span><i className="fa-solid fa-bullseye"></i> {member.goals}</span>}
                      </div>
                      {member._id !== user._id && (
                        <div className="team-member-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/chat?target=${member._id}`)}><i className="fa-solid fa-message"></i> Chat</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Empty Slots */}
                  {activeTeam.members && activeTeam.members.length < activeTeam.teamSlots && Array.from({ length: activeTeam.teamSlots - activeTeam.members.length }).map((_, i) => (
                    <div 
                      key={`empty-${i}`} 
                      className={`team-member-card glass-card-static team-member-empty ${isOwner ? 'clickable-slot' : ''}`}
                      onClick={() => isOwner && setShowAddMemberModal(true)}
                      style={isOwner ? { cursor: 'pointer', transition: 'all 0.2s', borderStyle: 'dashed' } : {}}
                    >
                      <div className="team-member-empty-inner">
                        <span className="material-symbols-outlined">{isOwner ? 'person_add' : 'person_search'}</span>
                        <p>{isOwner ? 'Click to fill slot' : 'Open Slot'}</p>
                        <span className="team-empty-hint">{isOwner ? 'Add AI recommendation manually' : 'Wait for requests'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Member Modal */}
              {showAddMemberModal && (
                <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
                  <div className="modal-content glass-card-static animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                      <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fa-solid fa-user-plus" style={{ color: 'var(--accent-primary-light)' }}></i> Add Member
                      </h3>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowAddMemberModal(false)}>
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
                      Choose an AI-recommended member to instantly add to your team.
                    </p>
                    
                    {!aiTeam ? (
                      <div className="text-center" style={{ padding: 'var(--space-xl)' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>You haven't generated AI recommendations yet.</p>
                        <button className="btn btn-primary" onClick={() => { setShowAddMemberModal(false); setActiveTab('ai-team'); generateAiTeam(); }}>
                           <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Recommendations
                        </button>
                      </div>
                    ) : visibleAiTeam.length === 0 ? (
                      <div className="text-center" style={{ padding: 'var(--space-xl)' }}>
                         <p style={{ color: 'var(--text-secondary)' }}>No available recommendations. Try regenerating.</p>
                      </div>
                    ) : (
                      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {visibleAiTeam.map((member, idx) => {
                          const userObj = member.user;
                          // If already in team, skip
                          if (activeTeam.members?.some(m => m._id === userObj._id)) return null;

                          return (
                            <div key={userObj._id} className="glass-card" style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                              <div className="team-member-avatar" style={{ width: 36, height: 36, fontSize: '0.875rem', '--member-color': MEMBER_COLORS[(idx + 1) % MEMBER_COLORS.length] }}>
                                {userObj.name?.[0]?.toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{userObj.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className={ROLE_ICONS[member.role] || 'fa-solid fa-code'}></i> {member.role}</div>
                              </div>
                              <button 
                                className="btn btn-primary btn-sm" 
                                onClick={() => handleAddAiMember(userObj._id, true)} 
                                disabled={addingToTeam[userObj._id]}
                              >
                                {addingToTeam[userObj._id] ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : 'Add'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Radar */}
              {activeTeam.members?.length >= 2 && radarData.length >= 3 && (
                <div className="glass-card-static recharts-card team-chart-card" style={{ marginBottom: 'var(--space-2xl)' }}>
                  <h3 className="recharts-card-title"><span className="material-symbols-outlined">radar</span> Team Skill Radar</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData} outerRadius="75%">
                      <PolarGrid stroke="rgba(148,163,184,0.12)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                      {(activeTeam.members || []).map((m, i) => (
                        <Radar key={i} name={m.name?.split(' ')[0] || `M${i+1}`} dataKey={`m${i}`}
                          stroke={MEMBER_COLORS[i % MEMBER_COLORS.length]} fill={MEMBER_COLORS[i % MEMBER_COLORS.length]}
                          fillOpacity={0.2} animationDuration={800} animationBegin={i * 200} />
                      ))}
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════ BROWSE TEAMS TAB ═══════════════ */}
      {activeTab === 'browse' && (
        <div className="animate-fadeInUp">
          {browseLoading ? <Loader text="Discovering open teams..." /> : browseTeams.length === 0 ? (
            <div className="team-empty-state glass-card-static">
              <div className="team-empty-icon"><i className="fa-solid fa-compass"></i></div>
              <h3>No Open Teams Found</h3>
              <p>No teams are currently accepting members. Create your own team!</p>
              <TeamInviteLink buttonStyle="btn btn-primary btn-lg" />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{browseTeams.length} open teams found</p>
                <button className="btn btn-ghost btn-sm" onClick={loadBrowseTeams}><i className="fa-solid fa-rotate"></i> Refresh</button>
              </div>
              <div className="team-members-grid stagger-children">
                {browseTeams.map(team => (
                  <div key={team._id} className="glass-card browse-team-card animate-fadeInUp">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                      <div className="team-hero-badge" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                        <i className="fa-solid fa-users"></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.125rem' }}>
                          {team.teamName || `Team by ${team.createdBy?.name}`}
                        </h3>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          by {team.createdBy?.name || 'Unknown'} · {team.members?.length}/{team.teamSlots} members
                        </div>
                      </div>
                    </div>

                    {team.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>{team.description}</p>}

                    {/* Team member avatars */}
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: 'var(--space-md)' }}>
                      {(team.members || []).map((m, i) => (
                        <div key={m._id} className="team-member-avatar" style={{ width: 32, height: 32, fontSize: '0.8125rem', '--member-color': MEMBER_COLORS[i % MEMBER_COLORS.length] }}>
                          {m.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      ))}
                      {Array.from({ length: team.teamSlots - (team.members?.length || 0) }).map((_, i) => (
                        <div key={`e-${i}`} style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <i className="fa-solid fa-plus"></i>
                        </div>
                      ))}
                    </div>

                    {/* Existing member skills summary */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: 'var(--space-md)' }}>
                      {[...new Set((team.members || []).flatMap(m => (m.skills || []).map(s => s.name)))].slice(0, 6).map(s => (
                        <span key={s} className="skill-tag" style={{ fontSize: '0.6875rem' }}>{s}</span>
                      ))}
                    </div>

                    {/* Action */}
                    {team.isMember ? (
                      <button className="btn btn-success btn-sm btn-full" disabled><i className="fa-solid fa-check"></i> Already a Member</button>
                    ) : team.hasPendingRequest ? (
                      <button className="btn btn-secondary btn-sm btn-full" disabled><i className="fa-solid fa-clock"></i> Request Pending</button>
                    ) : (
                      <button className="btn btn-primary btn-sm btn-full" onClick={() => setShowRequestModal(team._id)} disabled={requestingTeams[team._id]}>
                        <i className="fa-solid fa-hand"></i> Request to Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Request Modal */}
          {showRequestModal && (
            <div className="modal-overlay" onClick={() => setShowRequestModal(null)}>
              <div className="modal-content glass-card-static animate-scaleIn" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-hand" style={{ color: 'var(--accent-primary-light)' }}></i> Request to Join
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                  Send a brief message to the team owner explaining why you'd be a great fit.
                </p>
                <textarea
                  className="glass-input"
                  placeholder="Hi! I'm interested in joining your team. I bring experience in..."
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', marginBottom: 'var(--space-md)' }}
                />
                <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowRequestModal(null)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={() => sendJoinRequest(showRequestModal)} disabled={requestingTeams[showRequestModal]}>
                    {requestingTeams[showRequestModal] ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : <><i className="fa-solid fa-paper-plane"></i> Send Request</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ AI SUGGESTED TAB ═══════════════ */}
      {activeTab === 'ai-team' && (
        <div className="animate-fadeInUp">
          {aiLoading && <Loader text="AI is assembling your dream team..." />}
          {!aiTeam && !aiLoading && (
            <div className="team-empty-state glass-card-static">
              <div className="team-empty-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
              <h3>AI Dream Team</h3>
              <p>Our AI analyzes all developers and picks complementary teammates. Dismiss the ones you don't want, and add the ones you do!</p>
              <button className="btn btn-primary btn-lg" onClick={generateAiTeam} style={{ marginTop: 'var(--space-lg)' }}>
                <i className="fa-solid fa-robot"></i> Generate Team
              </button>
            </div>
          )}

          {aiTeam && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-robot" style={{ color: 'var(--accent-primary-light)' }}></i> AI Recommendations
                </h2>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={generateAiTeam}><i className="fa-solid fa-rotate"></i> Regenerate</button>
                </div>
              </div>

              {myTeams.length === 0 && (
                <div className="glass-card alert-card alert-warning" style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--warning)', fontSize: '1.25rem' }}></i>
                  <div>
                    <strong>Create a team first</strong> to add AI-recommended members.
                    <TeamInviteLink buttonStyle="btn btn-sm btn-primary" />
                  </div>
                </div>
              )}

              {/* AI Member Cards with Cross/Add */}
              <div className="team-members-grid stagger-children">
                {/* You card */}
                {aiTeam.find(m => m.user._id === user._id) && (
                  <div className="team-member-card glass-card animate-fadeInUp" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                    <div className="team-member-header">
                      <div className="team-member-avatar">{user.name?.[0]?.toUpperCase()}</div>
                      <div className="team-member-info">
                        <h3 className="team-member-name">{user.name}<span className="you-badge">You</span></h3>
                        <div className="team-member-role"><i className={ROLE_ICONS[user.role] || 'fa-solid fa-code'}></i>{aiTeam.find(m => m.user._id === user._id)?.role || user.role}</div>
                      </div>
                    </div>
                    <div className="team-member-skills">
                      {(user.skills || []).slice(0, 5).map(s => (
                        <span key={s.name} className={`skill-tag ${s.verified ? 'verified' : ''}`}>{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other AI members — with cross and add buttons */}
                {visibleAiTeam.map((member, i) => (
                  <div key={member.user._id} className="team-member-card glass-card animate-fadeInUp ai-member-card">
                    {/* Cross dismiss button */}
                    <button className="ai-dismiss-btn" onClick={() => dismissAiMember(member.user._id)} title="Dismiss this recommendation">
                      <i className="fa-solid fa-xmark"></i>
                    </button>

                    <div className="team-member-header">
                      <div className="team-member-avatar" style={{ '--member-color': MEMBER_COLORS[(i + 1) % MEMBER_COLORS.length] }}>
                        {member.user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="team-member-info">
                        <h3 className="team-member-name">{member.user.name}</h3>
                        <div className="team-member-role"><i className={ROLE_ICONS[member.role] || 'fa-solid fa-code'}></i>{member.role}</div>
                      </div>
                    </div>
                    <div className="team-member-skills">
                      {(member.user.skills || []).slice(0, 6).map(s => (
                        <span key={s.name} className={`skill-tag ${s.verified ? 'verified' : ''}`}>
                          {s.name}{s.verified && <span className="material-symbols-outlined filled" style={{ fontSize: '0.75rem' }}>verified</span>}
                        </span>
                      ))}
                    </div>
                    <div className="team-member-actions" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      {myTeams.length > 0 ? (
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                          onClick={() => handleAddAiMember(member.user._id)} disabled={addingToTeam[member.user._id]}>
                          {addingToTeam[member.user._id] ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></div> : <><i className="fa-solid fa-user-plus"></i> Add to Team</>}
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled><i className="fa-solid fa-lock"></i> Create Team First</button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/chat?target=${member.user._id}`)}>
                        <i className="fa-solid fa-message"></i>
                      </button>
                    </div>
                  </div>
                ))}

                {visibleAiTeam.length === 0 && aiTeam.length > 1 && (
                  <div className="glass-card-static" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>All recommendations dismissed.</p>
                    <button className="btn btn-secondary btn-sm" onClick={generateAiTeam} style={{ marginTop: 'var(--space-md)' }}>
                      <i className="fa-solid fa-rotate"></i> Generate New Suggestions
                    </button>
                  </div>
                )}
              </div>

              {/* AI Ideas */}
              {aiIdeas.length > 0 && (
                <div className="team-section" style={{ marginTop: 'var(--space-2xl)' }}>
                  <h2 className="team-section-title"><i className="fa-solid fa-lightbulb" style={{ color: 'var(--warning)' }}></i> AI Project Ideas</h2>
                  <div className="grid-3 stagger-children">
                    {aiIdeas.map((idea, i) => (
                      <div key={i} className="glass-card animate-fadeInUp">
                        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--accent-secondary)' }}>auto_awesome</span>{idea.name}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{idea.description}</p>
                        {idea.roleMapping && (
                          <div style={{ marginTop: 'var(--space-md)', fontSize: '0.8125rem' }}>
                            {Object.entries(idea.roleMapping).map(([n, r]) => (
                              <div key={n} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                                <i className="fa-solid fa-user" style={{ color: 'var(--accent-primary)', marginTop: '2px' }}></i>
                                <span><strong>{n}:</strong> {r}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <TeamHealthDashboard team={aiTeam} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
