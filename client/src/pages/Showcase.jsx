import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Loader from '../components/UI/Loader';

export default function Showcase() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    teamName: '', projectName: '', hackathonName: '',
    description: '', githubUrl: '', demoUrl: '', techStack: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/showcase');
      setProjects(data);
    } catch (err) {
      console.error('Showcase load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/showcase', {
        ...form,
        techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
        members: [user._id]
      });
      setShowForm(false);
      setForm({ teamName: '', projectName: '', hackathonName: '', description: '', githubUrl: '', demoUrl: '', techStack: '' });
      loadProjects();
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const { data } = await api.post(`/showcase/${id}/upvote`);
      setProjects(prev => prev.map(p => p._id === id ? { ...p, upvotes: data.upvotes } : p));
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  if (loading) return <Loader text="Loading showcase..." />;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">
            <i className="fa-solid fa-rocket"></i>
            Project Showcase
          </h1>
          <p className="page-subtitle">Projects built by DevMatch teams</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fa-solid fa-plus"></i>
          Publish Project
        </button>
      </div>

      {showForm && (
        <div className="glass-card-static animate-fadeInDown" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined">publish</span> Publish Your Project
          </h3>
          <form onSubmit={handleSubmit} className="flex-col gap-md">
            <div className="grid-2 gap-md">
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input className="glass-input" value={form.teamName} onChange={e => setForm(p => ({ ...p, teamName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input className="glass-input" value={form.projectName} onChange={e => setForm(p => ({ ...p, projectName: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hackathon Name</label>
              <input className="glass-input" value={form.hackathonName} onChange={e => setForm(p => ({ ...p, hackathonName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="glass-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2 gap-md">
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input className="glass-input" value={form.githubUrl} onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Demo URL</label>
                <input className="glass-input" value={form.demoUrl} onChange={e => setForm(p => ({ ...p, demoUrl: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tech Stack (comma-separated)</label>
              <input className="glass-input" value={form.techStack} onChange={e => setForm(p => ({ ...p, techStack: e.target.value }))} placeholder="React, Node.js, MongoDB" />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button type="submit" className="btn btn-primary">
                <i className="fa-solid fa-paper-plane"></i> Publish
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="glass-card-static empty-state">
          <div className="empty-state-icon"><i className="fa-solid fa-folder-open"></i></div>
          <h3 className="empty-state-title">No projects yet</h3>
          <p className="empty-state-desc">Be the first to showcase your hackathon project!</p>
        </div>
      ) : (
        <div className="grid-2 stagger-children">
          {projects.map((project, i) => (
            <div key={project._id || i} className="glass-card animate-fadeInUp">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{project.projectName}</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-users"></i>
                    {project.teamName}
                    {project.hackathonName && (
                      <span> | <i className="fa-solid fa-trophy" style={{ marginRight: '0.25rem' }}></i>{project.hackathonName}</span>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleUpvote(project._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent-primary-light)' }}
                >
                  <i className="fa-solid fa-arrow-up"></i>
                  <span style={{ fontWeight: 700 }}>{project.upvotes}</span>
                </button>
              </div>

              {project.description && (
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                  {project.description}
                </p>
              )}

              {project.techStack?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: 'var(--space-md)' }}>
                  {project.techStack.map(t => (
                    <span key={t} className="skill-tag" style={{ fontSize: '0.75rem' }}>{t}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    <i className="fa-brands fa-github"></i> Code
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Demo
                  </a>
                )}
              </div>

              {project.members?.length > 0 && (
                <div style={{ display: 'flex', marginTop: 'var(--space-md)' }}>
                  {project.members.map((m, j) => (
                    <div key={m._id || j} className="user-avatar" style={{
                      width: 28, height: 28, fontSize: '0.6875rem',
                      marginLeft: j > 0 ? '-6px' : 0, border: '2px solid var(--bg-primary)'
                    }} title={m.name}>
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
