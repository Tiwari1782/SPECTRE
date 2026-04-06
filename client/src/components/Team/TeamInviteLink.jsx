import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function TeamInviteLink({ hackathonId, buttonStyle, onInviteCreated }) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/invite/create', { hackathonId, teamSlots: 4 });
      setInviteUrl(data.inviteUrl);
      if (onInviteCreated) onInviteCreated();
    } catch (err) {
      console.error('Failed to generate invite:', err);
      toast.error(err.response?.data?.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inviteUrl) {
    return (
      <button 
        className={buttonStyle || "glass-card"} 
        style={buttonStyle ? {} : { textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }} 
        onClick={generateInvite} 
        disabled={loading}
      >
        <div style={buttonStyle ? {} : { width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
          <i className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-user-plus"}></i>
        </div>
        {!buttonStyle && (
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Create Invite Link</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Recruit teammates directly</div>
          </div>
        )}
        {buttonStyle && <span>{loading ? 'Generating...' : 'Create Invite Link'}</span>}
      </button>
    );
  }

  return (
    <div className={buttonStyle ? "" : "glass-card"} style={buttonStyle ? { display: 'flex', gap: '0.5rem', alignItems: 'center' } : { outline: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)', padding: 'var(--space-md)' }}>
      {!buttonStyle && (
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-link" style={{ color: 'var(--accent-primary)' }}></i> Shareable Invite
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <input 
          type="text" 
          value={inviteUrl} 
          readOnly 
          className="glass-input" 
          style={{ flex: 1, fontSize: '0.8125rem', fontFamily: 'monospace' }} 
        />
        <button 
          className="btn btn-primary" 
          onClick={copyToClipboard}
        >
          {copied ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-copy"></i>}
        </button>
      </div>
    </div>
  );
}
