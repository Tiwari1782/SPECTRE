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
