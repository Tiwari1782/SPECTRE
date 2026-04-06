import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';

const MEMBER_COLORS = [
  { fill: 'rgba(99,102,241,0.6)', stroke: '#6366f1' },
  { fill: 'rgba(16,185,129,0.5)', stroke: '#10b981' },
  { fill: 'rgba(245,158,11,0.5)', stroke: '#f59e0b' },
  { fill: 'rgba(236,72,153,0.5)', stroke: '#ec4899' },
];

const BAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export default function TeamHealthDashboard({ team }) {
  const { radarData, barData, allSkillNames, missing } = useMemo(() => {
    if (!team || team.length === 0) return { radarData: [], barData: [], allSkillNames: [], missing: [] };

    // Collect all unique skills
    const skillSet = new Set();
    team.forEach(member => {
      (member.user?.skills || []).forEach(s => skillSet.add(s.name));
    });
    const allSkillNames = [...skillSet].slice(0, 10);

    // Build radar data: each data point = one skill, each member contributes a field
    const radarData = allSkillNames.map(skillName => {
      const point = { skill: skillName };
      team.forEach((member, i) => {
        const memberSkill = (member.user?.skills || []).find(s => s.name === skillName);
        point[`m${i}`] = memberSkill?.level || 0;
      });
      return point;
    });

    // Build bar data: each bar = one member, value = total skill levels
    const barData = team.map((member, i) => ({
      name: member.user?.name?.split(' ')[0] || `Member ${i + 1}`,
      totalSkills: (member.user?.skills || []).reduce((sum, s) => sum + s.level, 0),
      skillCount: (member.user?.skills || []).length,
      role: member.role || member.user?.role || 'Unassigned',
      fill: BAR_COLORS[i % BAR_COLORS.length],
    }));

    // Detect missing roles
    const roles = team.map(t => t.role || t.user?.role);
    const missing = [];
    if (!roles.some(r => r?.toLowerCase().includes('front'))) missing.push('Frontend');
    if (!roles.some(r => r?.toLowerCase().includes('back'))) missing.push('Backend');
    if (!roles.some(r => r?.toLowerCase().includes('design') || r?.toLowerCase().includes('ui'))) missing.push('Design');

    return { radarData, barData, allSkillNames, missing };
  }, [team]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="recharts-custom-tooltip">
          <div className="recharts-tooltip-label">{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.stroke || p.fill, fontSize: '0.8125rem' }}>
              {p.name}: Level {p.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!team || team.length === 0) return null;

  return (
    <div className="team-health-section animate-fadeInUp">
      <h2 className="section-heading">
        <i className="fa-solid fa-heart-pulse" style={{ color: 'var(--accent-primary)' }}></i>
        Team Health Analysis
      </h2>

      <div className="team-health-grid">
        {/* Radar Chart */}
        <div className="glass-card-static recharts-card">
          <h3 className="recharts-card-title">
            <span className="material-symbols-outlined">radar</span>
            Skill Coverage Radar
          </h3>
          {radarData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="rgba(148,163,184,0.12)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                />
                {team.map((member, i) => (
                  <Radar
                    key={i}
                    name={member.user?.name?.split(' ')[0] || `M${i + 1}`}
                    dataKey={`m${i}`}
                    stroke={MEMBER_COLORS[i % MEMBER_COLORS.length].stroke}
                    fill={MEMBER_COLORS[i % MEMBER_COLORS.length].fill}
                    fillOpacity={0.35}
                    animationDuration={800}
                    animationBegin={i * 200}
                  />
                ))}
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <span className="material-symbols-outlined">analytics</span>
              Need at least 3 shared skills for radar
            </div>
          )}
        </div>

        {/* Bar Chart + Gap Analysis */}
        <div className="glass-card-static recharts-card">
          <h3 className="recharts-card-title">
            <i className="fa-solid fa-chart-simple" style={{ color: 'var(--accent-secondary)' }}></i>
            Member Strength
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(value, name, props) => [`${value} pts (${props.payload.skillCount} skills)`, props.payload.role]}
              />
              <Bar dataKey="totalSkills" radius={[8, 8, 0, 0]} animationDuration={800}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Gap Analysis */}
          <div style={{ marginTop: 'var(--space-lg)' }}>
            {missing.length > 0 ? (
              <div className="team-alert team-alert-warning">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <div>
                  <strong>Potential Gap</strong>
                  <span>Consider adding: {missing.join(', ')}</span>
                </div>
              </div>
            ) : (
              <div className="team-alert team-alert-success">
                <i className="fa-solid fa-shield-check"></i>
                <div>
                  <strong>Highly Balanced</strong>
                  <span>All core disciplines covered!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 