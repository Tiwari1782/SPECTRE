import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import SkillQuiz from '../components/Profile/SkillQuiz';
import VoiceIntro from '../components/Profile/VoiceIntro';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ROLES = ['Frontend', 'Backend', 'Full Stack', 'ML Engineer', 'UI/UX Designer', 'Mobile Dev', 'DevOps'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
const AVAILABILITY = ['Full-time', 'Part-time', 'Flexible'];
const GOALS = ['Win', 'Learn', 'Network', 'Build'];
const INTERESTS = ['Web App', 'AI Project', 'Blockchain', 'Mobile App', 'Open'];
const STYLES = ['Fast-ship', 'Perfectionist', 'Async', 'In-person'];

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB',
  'Express', 'Django', 'Flask', 'TensorFlow', 'PyTorch', 'Docker',
  'AWS', 'Firebase', 'PostgreSQL', 'GraphQL', 'Flutter', 'Swift',
  'Kotlin', 'Figma', 'Next.js', 'Vue', 'Angular', 'Tailwind',
  'Java', 'Go', 'Rust', 'C++', 'Solidity', 'Web3'
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', role: 'Full Stack', experience: 'Intermediate',
    availability: 'Full-time', goals: 'Build', projectInterest: 'Open',
    workingStyle: 'Fast-ship', skills: [], githubUsername: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Full Stack',
        experience: user.experience || 'Intermediate',
        availability: user.availability || 'Full-time',
        goals: user.goals || 'Build',
        projectInterest: user.projectInterest || 'Open',
        workingStyle: user.workingStyle || 'Fast-ship',
        skills: user.skills || [],
        githubUsername: user.githubUsername || ''
      });
      setGithubConnected(!!user.githubUsername);
    }
  }, [user]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const addSkill = (skillName) => {
    if (!skillName.trim()) return;
    if (form.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) return;
    setForm(prev => ({
      ...prev,
      skills: [...prev.skills, { name: skillName.trim(), level: 3, verified: false }]
    }));
    setNewSkill('');
    setSaved(false);
  };

  const removeSkill = (index) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
    setSaved(false);
  };

  const updateSkillLevel = (index, level) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => i === index ? { ...s, level } : s)
    }));
    setSaved(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.post('/users/profile', form);
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const connectGithub = async () => {
    if (!form.githubUsername) return;
    setGithubLoading(true);
    try {
      const { data } = await api.get(`/github/${form.githubUsername}`);
      const detectedSkills = data.detectedSkills || [];
      const existingNames = form.skills.map(s => s.name.toLowerCase());
      const newSkills = detectedSkills
        .filter(s => !existingNames.includes(s.toLowerCase()))
        .map(name => ({ name, level: 3, verified: false }));
      setForm(prev => ({ ...prev, skills: [...prev.skills, ...newSkills] }));
      setGithubConnected(true);
    } catch (err) {
      console.error('GitHub connect failed:', err);
    } finally {
      setGithubLoading(false);
    }
  };

  const radarData = form.skills.length > 0 ? {
    labels: form.skills.map(s => s.name),
    datasets: [{
      label: 'Skill Level',
      data: form.skills.map(s => s.level),
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: 'rgba(99, 102, 241, 0.8)',
      borderWidth: 2,
      pointBackgroundColor: form.skills.map(s => s.verified ? '#10b981' : '#6366f1'),
      pointBorderColor: 'transparent',
      pointRadius: 5
    }]
  } : null;

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        ticks: { stepSize: 1, color: '#64748b', backdropColor: 'transparent' },
        grid: { color: 'rgba(148,163,184,0.1)' },
        angleLines: { color: 'rgba(148,163,184,0.1)' },
        pointLabels: { color: '#94a3b8', font: { size: 11 } }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fa-solid fa-user-gear"></i>
          Your Profile
        </h1>
        <p className="page-subtitle">Set up your skills and preferences for better matches</p>
      </div>

      <div className="profile-grid">
        <div className="flex-col gap-lg">
          {/* Basic Info */}
          <div className="glass-card-static">
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined">person</span> Basic Info
            </h3>
            <div className="flex-col gap-md">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="glass-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="glass-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="grid-2 gap-md">
                <div className="form-group">
                  <label className="form-label">Primary Role</label>
                  <select className="glass-select" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <select className="glass-select" value={form.experience} onChange={e => handleChange('experience', e.target.value)}>
                    {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Intro */}
          <VoiceIntro />

          {/* Preferences */}
          <div className="glass-card-static">
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined">tune</span> Preferences
            </h3>
            <div className="grid-2 gap-md">
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select className="glass-select" value={form.availability} onChange={e => handleChange('availability', e.target.value)}>
                  {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Goal</label>
                <select className="glass-select" value={form.goals} onChange={e => handleChange('goals', e.target.value)}>
                  {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Interest</label>
                <select className="glass-select" value={form.projectInterest} onChange={e => handleChange('projectInterest', e.target.value)}>
                  {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Working Style</label>
                <select className="glass-select" value={form.workingStyle} onChange={e => handleChange('workingStyle', e.target.value)}>
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--glass-bg-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-user-secret"></i> Anonymous / Blind Matching
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Hide your name/identity. Teams match purely on skills.</div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={form.blindMode || false} 
                  onChange={e => handleChange('blindMode', e.target.checked)} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* GitHub */}
          <div className="glass-card-static">
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-brands fa-github"></i> GitHub Integration
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <input
                className="glass-input"
                placeholder="GitHub username"
                value={form.githubUsername}
                onChange={e => handleChange('githubUsername', e.target.value)}
              />
              <button className="btn btn-secondary" onClick={connectGithub} disabled={githubLoading || !form.githubUsername}>
                {githubLoading ? (
                  <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                ) : githubConnected ? (
                  <><span className="material-symbols-outlined filled" style={{ fontSize: '1rem', color: 'var(--success)' }}>check_circle</span> Connected</>
                ) : (
                  <><i className="fa-solid fa-plug"></i> Connect</>
                )}
              </button>
            </div>
            {githubConnected && user?.githubData && (
              <div style={{ marginTop: 'var(--space-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <i className="fa-solid fa-code-branch" style={{ marginRight: '0.375rem' }}></i>
                {user.githubData.contributions} repos
                {user.githubData.languages?.length > 0 && (
                  <span> | Languages: {user.githubData.languages.join(', ')}</span>
                )}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={saveProfile} disabled={saving}>
            {saving ? (
              <><div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Saving...</>
            ) : saved ? (
              <><span className="material-symbols-outlined filled">check_circle</span> Profile Saved!</>
            ) : (
              <><i className="fa-solid fa-floppy-disk"></i> Save Profile</>
            )}
          </button>
        </div>

        {/* Right side: Skills + Radar */}
        <div className="profile-sidebar">
          <div className="glass-card-static">
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined">code</span> Skills
            </h3>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <input
                className="glass-input"
                placeholder="Add a skill..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)}
              />
              <button className="btn btn-primary btn-sm" onClick={() => addSkill(newSkill)}>
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: 'var(--space-lg)' }}>
              {COMMON_SKILLS.filter(s => !form.skills.find(fs => fs.name.toLowerCase() === s.toLowerCase())).slice(0, 12).map(s => (
                <button key={s} className="skill-tag" onClick={() => addSkill(s)} style={{ cursor: 'pointer', fontSize: '0.75rem' }}>
                  <i className="fa-solid fa-plus" style={{ fontSize: '0.625rem' }}></i> {s}
                </button>
              ))}
            </div>

            <div className="flex-col gap-sm">
              {form.skills.map((skill, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                  padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--glass-bg-light)'
                }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {skill.name}
                    </span>
                    {skill.verified ? (
                      <span className="material-symbols-outlined filled" style={{ fontSize: '1rem', color: 'var(--success)' }}>verified</span>
                    ) : (
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.125rem 0.5rem', fontSize: '0.65rem' }}
                        onClick={() => setActiveQuiz(skill.name)}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(level => (
                      <button
                        key={level}
                        onClick={() => updateSkillLevel(i, level)}
                        style={{
                          width: 20, height: 20, borderRadius: '4px', fontSize: '0.6rem',
                          background: skill.level >= level ? 'var(--accent-primary)' : 'rgba(148,163,184,0.1)',
                          color: skill.level >= level ? 'white' : 'var(--text-muted)',
                          border: 'none', cursor: 'pointer', transition: 'all 150ms ease'
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => removeSkill(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {radarData && form.skills.length >= 3 && (
            <div className="glass-card-static">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">radar</span> Skill Radar
              </h3>
              <Radar data={radarData} options={radarOptions} />
            </div>
          )}
        </div>
      </div>

      {activeQuiz && (
        <SkillQuiz 
          skill={activeQuiz} 
          onClose={() => setActiveQuiz(null)} 
          onSuccess={() => {
            // Locally update the UI to show verified
            setForm(prev => ({
              ...prev,
              skills: prev.skills.map(s => s.name === activeQuiz ? { ...s, verified: true } : s)
            }));
          }} 
        />
      )}
    </div>
  );
}
