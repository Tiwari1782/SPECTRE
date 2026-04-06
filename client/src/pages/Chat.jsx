import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import socket from '../services/socket';
import Loader from '../components/UI/Loader';
import IdeaCopilot from '../components/Chat/IdeaCopilot';
import TeamInviteLink from '../components/Team/TeamInviteLink';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('target');
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const bottomRef = useRef();
  const typingTimeout = useRef();
  const activeContactRef = useRef(activeContact);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    loadContacts();
  }, [user]);

  useEffect(() => {
    if (activeContact) {
      const rid = [user._id, activeContact._id].sort().join('_');
      setRoomId(rid);
      loadMessages(rid);
      // Clear unread count when opening chat
      setUnreadCounts(prev => ({ ...prev, [activeContact._id]: 0 }));
    }
  }, [activeContact]);

  useEffect(() => {
    const handleMessage = (msg) => {
      const currentActive = activeContactRef.current;
      const senderId = msg.sender?._id || msg.sender;
      
      const isFromActiveOrSelf = 
        (currentActive && senderId === currentActive._id) || 
        senderId === user._id || 
        senderId === user;

      if (isFromActiveOrSelf) {
        setMessages(prev => [...prev, msg]);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Not currently chatting with them -> increment unread count
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    };
    const handleTyping = ({ userId }) => {
      if (userId !== user._id) {
        setTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2000);
      }
    };

    socket.on('receive_message', handleMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', () => setTyping(false));

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing');
      clearTimeout(typingTimeout.current);
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = async () => {
    try {
      const { data } = await api.get(`/match/${user._id}`);
      const contactList = data.slice(0, 20).map(m => m.user);
      setContacts(contactList);
      
      // Join all chat rooms so we listen for global incoming messages
      contactList.forEach(contact => {
        socket.emit('join_room', { userId: user._id, targetId: contact._id });
      });

      if (targetId) {
        const target = contactList.find(c => c._id === targetId);
        if (target) setActiveContact(target);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (rid) => {
    try {
      const { data } = await api.get(`/chat/${rid}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !roomId) return;
    socket.emit('send_message', {
      roomId,
      senderId: user._id,
      text: input.trim(),
      prefilledTemplate: false
    });
    setInput('');
    socket.emit('stop_typing', { roomId, userId: user._id });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (roomId) {
      socket.emit('typing', { roomId, userId: user._id });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return <Loader text="Loading conversations..." />;

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-comments" style={{ color: 'var(--accent-primary-light)' }}></i>
            Messages
          </h2>
        </div>
        {contacts.map(contact => (
          <div
            key={contact._id}
            className={`chat-contact ${activeContact?._id === contact._id ? 'active' : ''}`}
            onClick={() => setActiveContact(contact)}
          >
            <div style={{ position: 'relative' }}>
              <div className="user-avatar" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>
                {contact.name?.[0]?.toUpperCase() || '?'}
              </div>
              {unreadCounts[contact._id] > 0 && (
                <div className="unread-badge">
                  {unreadCounts[contact._id]}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{contact.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{contact.role}</div>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-user-plus" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}></i>
            No contacts yet. Match with someone first!
          </div>
        )}
      </div>

      <div className="chat-main">
        {activeContact ? (
          <>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.875rem' }}>
                  {activeContact.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{activeContact.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{activeContact.role}</div>
                </div>
              </div>
              {/* Chat header action buttons */}
              <div className="chat-header-actions">
                <TeamInviteLink buttonStyle="btn btn-sm btn-secondary" />
                <button
                  className={`btn btn-sm ${copilotOpen ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCopilotOpen(prev => !prev)}
                  title={copilotOpen ? 'Close AI Co-Pilot' : 'Open AI Co-Pilot'}
                >
                  <i className="fa-solid fa-lightbulb"></i>
                  AI Co-Pilot
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-2xl)', fontSize: '0.875rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>waving_hand</span>
                  Say hello to {activeContact.name}!
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={msg._id || i}
                  className={`message-bubble ${msg.sender?._id === user._id || msg.sender === user._id ? 'sent' : 'received'}`}
                >
                  {msg.text}
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span style={{ marginLeft: '0.25rem' }}>{activeContact.name} is typing</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-bar">
              <input
                className="glass-input"
                placeholder="Type a message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={!input.trim()}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: 'var(--space-md)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--text-muted)' }}>forum</span>
            <h3 style={{ color: 'var(--text-secondary)' }}>Select a conversation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Choose a match from the sidebar to start chatting</p>
          </div>
        )}
      </div>

      {/* AI Copilot — collapsible panel */}
      {activeContact && (
        <div className={`copilot-panel ${copilotOpen ? 'open' : 'closed'}`}>
          {copilotOpen && (
            <div className="copilot-inner">
              <IdeaCopilot activeContact={activeContact} onClose={() => setCopilotOpen(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
