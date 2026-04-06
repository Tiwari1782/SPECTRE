import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

export default function IdeaCopilot({ teamIds, teamContext, activeContact, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Idea Co-Pilot. Need help brainstorming project ideas, deciding on a tech stack, or dividing tasks based on your skills?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat/copilot', {
        messages: [...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) === 0), userMsg],
        teamIds: teamIds || (activeContact ? [activeContact._id] : [])
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I hit a snag thinking about that. Could we try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="copilot-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-lightbulb" style={{ color: 'var(--warning)' }}></i>
          <h3 style={{ fontWeight: 700, margin: 0, fontSize: '0.9375rem' }}>AI Co-Pilot</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            title="Close Co-Pilot"
          >
            <i className="fa-solid fa-xmark" style={{ fontSize: '1rem' }}></i>
          </button>
        )}
      </div>
      
      <div className="copilot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`copilot-msg ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="typing-dot" style={{ width: 4, height: 4 }}></span>
            <span className="typing-dot" style={{ width: 4, height: 4 }}></span>
            <span className="typing-dot" style={{ width: 4, height: 4 }}></span>
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="copilot-input-bar">
        <input
          className="glass-input"
          placeholder="Ask for ideas..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
        />
        <button 
          className="btn btn-secondary" 
          onClick={handleSend} 
          disabled={!input.trim() || loading}
          style={{ padding: '0.4rem 0.6rem' }}
        >
          <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.875rem' }}></i>
        </button>
      </div>
    </div>
  );
}
