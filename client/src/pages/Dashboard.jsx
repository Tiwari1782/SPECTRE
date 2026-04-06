import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import TeamInviteLink from '../components/Team/TeamInviteLink';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

const XP_LEVELS = [
  { name: 'Rookie', threshold: 0, color: '#94a3b8' },
  { name: 'Hacker', threshold: 100, color: '#6366f1' },
  { name: 'Pro', threshold: 300, color: '#f59e0b' },
  { name: 'Legend', threshold: 700, color: '#ef4444' },
];

const SKILL_COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

function XpProgressChart({ xp, level }) {
  const currentLevelIdx = XP_LEVELS.findIndex(l => l.name === level) || 0;
  const data = XP_LEVELS.map((l, i) => ({
    name: l.name,
    threshold: i === 0 ? 100 : (XP_LEVELS[i]?.threshold - (XP_LEVELS[i - 1]?.threshold || 0)),
    fill: i <= currentLevelIdx ? l.color : 'rgba(148,163,184,0.15)',
    current: l.name === level,
  }));

  return (
    <div className="glass-card-static recharts-card">
      <h3 className="recharts-card-title">
        <i className="fa-solid fa-bolt" style={{ color: 'var(--warning)' }}></i>
        XP Journey
      </h3>
      <div className="recharts-card-subtitle">
        <span className="xp-current">{xp} XP</span> — {level}
      </div>
      <div className="xp-track">
        {XP_LEVELS.map((l, i) => {
          const nextThreshold = XP_LEVELS[i + 1]?.threshold || 1000;
          const prevThreshold = l.threshold;
          const segmentProgress = Math.min(1, Math.max(0, (xp - prevThreshold) / (nextThreshold - prevThreshold)));
          const isActive = xp >= prevThreshold;
          const isCurrentSegment = xp >= prevThreshold && xp < nextThreshold;
          return (
            <div key={l.name} className="xp-segment">
              <div className="xp-segment-bar">
                <div
                  className="xp-segment-fill"
                  style={{
                    width: isActive ? (isCurrentSegment ? `${segmentProgress * 100}%` : '100%') : '0%',
                    background: l.color,
                  }}
                />
              </div>
              <div className={`xp-segment-label ${isCurrentSegment ? 'active' : ''}`}>
                {l.name}
                <span className="xp-segment-threshold">{l.threshold}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillDistributionChart({ skills }) {
  if (!skills || skills.length === 0) return null;
  const data = skills.map((s, i) => ({
    name: s.name,
    value: s.level,
    fill: SKILL_COLORS[i % SKILL_COLORS.length],
    verified: s.verified,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const d = payload[0].payload;
      return (
        <div className="recharts-custom-tooltip">
          <div className="recharts-tooltip-label">
            {d.name} {d.verified ? '✅' : ''}
          </div>
          <div className="recharts-tooltip-value">Level {d.value}/5</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card-static recharts-card">
      <h3 className="recharts-card-title">
        <span className="material-symbols-outlined">pie_chart</span>
        Skill Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            dataKey="value"
            stroke="transparent"
            animationBegin={200}
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="skill-legend">
        {data.map((s, i) => (
          <div key={s.name} className="skill-legend-item">
            <span className="skill-legend-dot" style={{ background: s.fill }} />
            <span>{s.name}</span>
            {s.verified && <span className="material-symbols-outlined filled" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>verified</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchBreakdownChart({ breakdown }) {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  const labels = {
    skillOverlap: 'Skills',
    verifiedSkills: 'Verified',
    roleComplement: 'Role',
    goalsMatch: 'Goals',
    availabilityMatch: 'Availability',
    heatmapOverlap: 'Schedule',
    domainMatch: 'Domain',
    vibeMatch: 'Vibe',
  };
  const colors = {
    skillOverlap: '#6366f1',
    verifiedSkills: '#10b981',
    roleComplement: '#22d3ee',
    goalsMatch: '#f59e0b',
    availabilityMatch: '#8b5cf6',
    heatmapOverlap: '#14b8a6',
    domainMatch: '#ec4899',
    vibeMatch: '#ef4444',
  };
  const data = Object.entries(breakdown)
    .filter(([_, v]) => v > 0)
    .map(([key, value]) => ({
      name: labels[key] || key,
      score: value,
      fill: colors[key] || '#6366f1',
    }));

  return (
    <div className="glass-card-static recharts-card">
      <h3 className="recharts-card-title">
        <i className="fa-solid fa-chart-bar" style={{ color: 'var(--accent-primary-light)' }}></i>
        Top Match Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
          <XAxis type="number" domain={[0, 30]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
          <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            cursor={{ fill: 'rgba(99,102,241,0.06)' }}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} animationDuration={800}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ matches: 0 });
  const [topMatches, setTopMatches] = useState([]);
  const [topBreakdown, setTopBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const { data: matches } = await api.get(`/match/${user._id}`);
      setTopMatches(matches.slice(0, 3));
      setStats(prev => ({ ...prev, matches: matches.length }));
      if (matches[0]?.breakdown) setTopBreakdown(matches[0].breakdown);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const profileComplete = user.name && user.name !== 'New User' && user.skills?.length > 0;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <span className="material-symbols-outlined filled">dashboard</span>
          Welcome back, {user.name || 'Developer'}
        </h1>
        <p className="page-subtitle">Your hackathon command center</p>
      </div>

      {!profileComplete && (
        <div className="glass-card alert-card alert-warning animate-fadeInDown" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="alert-icon-wrap warning">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Complete Your Profile</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Add your skills and preferences to start getting matched with teammates.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')}>
            <i className="fa-solid fa-pen-to-square"></i> Complete Profile
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card stat-gradient-1">
          <div className="stat-card-icon"><i className="fa-solid fa-users"></i></div>
          <div className="stat-card-value">{stats.matches}</div>
          <div className="stat-card-label">Compatible Matches</div>
        </div>
        <div className="glass-card stat-card stat-gradient-2">
          <div className="stat-card-icon"><span className="material-symbols-outlined">verified</span></div>
          <div className="stat-card-value">{user.skills?.filter(s => s.verified).length || 0}</div>
          <div className="stat-card-label">Verified Skills</div>
        </div>
        <div className="glass-card stat-card stat-gradient-3">
          <div className="stat-card-icon"><i className="fa-solid fa-bolt"></i></div>
          <div className="stat-card-value">{user.xp || 0}</div>
          <div className="stat-card-label">Experience Points</div>
        </div>
        <div className="glass-card stat-card stat-gradient-4">
          <div className="stat-card-icon"><i className="fa-solid fa-shield-halved"></i></div>
          <div className="stat-card-value">{user.level || 'Rookie'}</div>
          <div className="stat-card-label">Current Rank</div>
        </div>
      </div>

      {/* Recharts Row */}
      <div className="recharts-row">
        <XpProgressChart xp={user.xp || 0} level={user.level || 'Rookie'} />
        <SkillDistributionChart skills={user.skills} />
        <MatchBreakdownChart breakdown={topBreakdown} />
      </div>

      {/* Main Content */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-fire" style={{ color: 'var(--danger)' }}></i>
              Top Matches
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/matches')}>
              View All <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {topMatches.length > 0 ? (
            <div className="flex-col gap-md stagger-children">
              {topMatches.map((match, i) => (
                <div key={match.user._id || i} className="glass-card animate-fadeInUp match-preview-card" style={{ padding: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="match-avatar">
                      {match.user.blindMode ? '?' : match.user.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="match-name">{match.user.blindMode ? 'Anonymous Developer' : match.user.name}</div>
                      <div className="match-role">
                        <i className="fa-solid fa-code" style={{ marginRight: '0.25rem', fontSize: '0.75rem' }}></i>
                        {match.assignedRole || match.user.role}
                      </div>
                    </div>
                    <div className="match-score-pill" style={{
                      '--score-color': match.compatibility >= 80 ? 'var(--success)' : match.compatibility >= 60 ? 'var(--warning)' : 'var(--danger)'
                    }}>
                      {match.compatibility}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card-static empty-state" style={{ padding: 'var(--space-xl)' }}>
              <div className="empty-state-icon"><i className="fa-solid fa-user-group"></i></div>
              <h3 className="empty-state-title">No matches yet</h3>
              <p className="empty-state-desc">Complete your profile to start getting matched.</p>
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-compass" style={{ color: 'var(--accent-primary-light)' }}></i>
            Quick Actions
          </h2>
          <div className="flex-col gap-md">
            <TeamInviteLink />
            <button className="glass-card quick-action-card" onClick={() => navigate('/matches')}>
              <div className="quick-action-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary-light)' }}>
                <i className="fa-solid fa-sparkles"></i>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Find Teammates</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>AI-powered match suggestions</div>
              </div>
            </button>
            <button className="glass-card quick-action-card" onClick={() => navigate('/hackathons')}>
              <div className="quick-action-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Browse Hackathons</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Devpost + Unstop live feed</div>
              </div>
            </button>
            <button className="glass-card quick-action-card" onClick={() => navigate('/team-builder')}>
              <div className="quick-action-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>AI Team Builder</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Auto-assemble your dream squad</div>
              </div>
            </button>
            <button className="glass-card quick-action-card" onClick={() => navigate('/showcase')}>
              <div className="quick-action-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
                <i className="fa-solid fa-rocket"></i>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Project Showcase</div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Share what you built</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
