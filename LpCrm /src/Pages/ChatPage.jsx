import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Paperclip, Search, MoreVertical, ArrowLeft, Users,
  MessageSquare, X, Check, CheckCheck, Loader2, WifiOff,
  RefreshCw, UserPlus, Hash, ChevronDown, Info, Shield,
  Crown, User as UserIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Components/layouts/Navbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function getConversationName(conv, currentUser) {
  if (conv.type === 'GROUP') return conv.name || 'Group';
  const other = conv.participants?.find((p) => p.id !== currentUser?.id);
  return other?.username || 'Unknown';
}

const COLORS = [
  ['#e0e7ff', '#4338ca'],
  ['#ede9fe', '#6d28d9'],
  ['#e0f2fe', '#0369a1'],
  ['#d1fae5', '#065f46'],
  ['#fef3c7', '#92400e'],
  ['#fce7f3', '#9d174d'],
];

function getColor(name = '') {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return COLORS[n % COLORS.length];
}

const Avatar = ({ name = '', size = 'md', isGroup = false }) => {
  const px = { sm: 32, md: 40, lg: 48 }[size];
  const fs = { sm: 11, md: 13, lg: 15 }[size];
  const ic = { sm: 13, md: 16, lg: 19 }[size];
  const [bg, fg] = getColor(name);
  return (
    <div style={{
      width: px, height: px, borderRadius: isGroup ? '12px' : '50%',
      background: bg, color: fg, fontSize: fs, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {isGroup ? <Users size={ic} /> : getInitials(name)}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, desc }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px', color: '#94a3b8' }}>
    <Icon size={36} strokeWidth={1.2} />
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontWeight: 600, color: '#475569', fontSize: 14 }}>{title}</p>
      <p style={{ fontSize: 12, marginTop: 4 }}>{desc}</p>
    </div>
  </div>
);

const EmployeePicker = ({ employees, selected, onToggle, search, onSearch, single = false, empLoading = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ position: 'relative' }}>
      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Search employees..."
        className="w-full pl-8 pr-3 py-2.5 text-sm border rounded-xl focus:outline-none transition-shadow"
        style={{ borderColor: '#e5e7eb', background: '#f9fafb', color: '#374151' }}
        onFocus={e => { e.target.style.boxShadow = '0 0 0 3px #e0e7ff'; e.target.style.borderColor = '#818cf8'; }}
        onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e5e7eb'; }}
      />
    </div>
    <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: 12 }}>
      {empLoading ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading employees...</div>
      ) : employees.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No employees found.</div>
      ) : (
        employees.map((emp, idx) => {
          const isSelected = selected.includes(emp.id);
          const [bg, fg] = getColor(emp.username);
          return (
            <button
              key={emp.id}
              onClick={() => onToggle(emp.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
              style={{
                background: isSelected ? '#eef2ff' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, color: fg, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getInitials(emp.username)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', truncate: true }}>{emp.username}</p>
                {emp.role && <p style={{ fontSize: 11, color: '#94a3b8' }}>{emp.role}</p>}
              </div>
              {isSelected && !single && <Check size={14} style={{ color: '#6366f1', flexShrink: 0 }} />}
              {isSelected && single && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />}
            </button>
          );
        })
      )}
    </div>
    {!single && selected.length > 0 && (
      <p style={{ fontSize: 11, color: '#6366f1', textAlign: 'right' }}>
        {selected.length} member{selected.length > 1 ? 's' : ''} selected
      </p>
    )}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 440, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '16px 20px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 12px' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
    ))}
  </div>
);

/* ── Group Info Panel ── */
const GroupInfoPanel = ({ conv, currentUser, onClose }) => {
  if (!conv || conv.type !== 'GROUP') return null;
  const participants = conv.participants || [];
  const createdBy = conv.created_by;

  return (
    <div style={{
      width: 280, borderLeft: '1px solid #f1f5f9', background: '#fafbff',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={15} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Group Info</span>
        </div>
        <button onClick={onClose} style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
          onMouseEnter={e => e.currentTarget.style.color = '#475569'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
          <X size={14} />
        </button>
      </div>

      {/* Group avatar + name */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, borderBottom: '1px solid #f1f5f9' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.15)',
        }}>
          <Users size={28} style={{ color: '#6366f1' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{conv.name || 'Group'}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>Group · {participants.length} members</p>
        </div>
      </div>

      {/* Members list */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Members
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {participants.map((p) => {
            const isMe = p.id === currentUser?.id;
            const isAdmin = p.id === createdBy || p.is_admin;
            const [bg, fg] = getColor(p.username || '');
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 12, background: isMe ? '#eef2ff' : '#fff',
                border: `1px solid ${isMe ? '#e0e7ff' : '#f1f5f9'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: bg, color: fg,
                  fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {getInitials(p.username)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.username}{isMe ? ' (You)' : ''}
                    </p>
                    {isAdmin && <Crown size={11} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                  </div>
                  {p.role && <p style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.role}</p>}
                </div>
                {isAdmin && (
                  <span style={{ fontSize: 10, fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 6, flexShrink: 0 }}>
                    Admin
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, accessToken, refreshAccessToken } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [selectedConv, setSelectedConv] = useState(null);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [showDirect, setShowDirect] = useState(false);
  const [directSelected, setDirectSelected] = useState([]);
  const [directSearch, setDirectSearch] = useState('');
  const [directSaving, setDirectSaving] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSelected, setGroupSelected] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupSaving, setGroupSaving] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  const getToken = useCallback(async () => {
    return accessToken || await refreshAccessToken();
  }, [accessToken, refreshAccessToken]);

  /* ─── API calls ─── */
  const fetchEmployees = useCallback(async () => {
    try {
      setEmpLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/employees-list/`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmployees((data.results || data).filter(e => e.id !== user?.id));
    } catch { console.error('employees failed'); }
    finally { setEmpLoading(false); }
  }, [getToken, user?.id]);

  const loadConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/conversations/`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data.results || data);
      setError(null);
    } catch {
      if (!silent) setError('Could not load conversations.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getToken]);

  const loadMessages = useCallback(async (convId) => {
    try {
      setMsgLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/messages/${convId}/`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(prev => ({ ...prev, [convId]: data.results || data }));
    } catch { /* silent */ }
    finally { setMsgLoading(false); }
  }, [getToken]);

  /* ─── Effects ─── */
  useEffect(() => { loadConversations(); fetchEmployees(); }, []);

  useEffect(() => {
    if (!selectedConv) return;
    loadMessages(selectedConv.id);
    setShowGroupInfo(false);
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadMessages(selectedConv.id);
      loadConversations(true);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConv]);

  /* ─── Send message ─── */
  const handleSend = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const optimistic = {
      id: `opt-${Date.now()}`,
      sender: { id: user?.id, username: user?.username },
      text, created_at: new Date().toISOString(), optimistic: true,
    };
    setMessages(prev => ({ ...prev, [selectedConv.id]: [...(prev[selectedConv.id] || []), optimistic] }));
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/send/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversation_id: selectedConv.id, text }),
      });
      if (!res.ok) throw new Error();
      await loadMessages(selectedConv.id);
      loadConversations(true);
    } catch {
      setMessages(prev => ({ ...prev, [selectedConv.id]: (prev[selectedConv.id] || []).filter(m => m.id !== optimistic.id) }));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ─── Create conversations ─── */
  const handleCreateDirect = async () => {
    if (directSelected.length !== 1 || directSaving) return;
    setDirectSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/create-direct/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: directSelected[0] }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      await loadConversations();
      setConversations(prev => {
        const found = prev.find(c => c.id === data.conversation_id);
        if (found) setSelectedConv(found);
        return prev;
      });
      setShowDirect(false); setDirectSelected([]); setDirectSearch('');
    } catch { alert('Failed to start conversation.'); }
    finally { setDirectSaving(false); }
  };

  const handleCreateGroup = async () => {
    const name = groupName.trim();
    if (!name || groupSelected.length === 0 || groupSaving) return;
    setGroupSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/create-group/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, user_ids: groupSelected }),
      });
      if (!res.ok) throw new Error();
      await loadConversations();
      setShowGroup(false); setGroupName(''); setGroupSelected([]); setGroupSearch('');
    } catch { alert('Failed to create group.'); }
    finally { setGroupSaving(false); }
  };

  const toggleDirect = (id) => setDirectSelected([id]);
  const toggleGroup = (id) => setGroupSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filteredConvs = conversations.filter(c =>
    getConversationName(c, user).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredForGroup = employees.filter(e => e.username.toLowerCase().includes(groupSearch.toLowerCase()));
  const filteredForDirect = employees.filter(e => e.username.toLowerCase().includes(directSearch.toLowerCase()));

  const currentMessages = selectedConv ? messages[selectedConv.id] || [] : [];
  const convName = selectedConv ? getConversationName(selectedConv, user) : '';
  const isGroup = selectedConv?.type === 'GROUP';

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: 320, minWidth: 280, borderRight: '1px solid #f1f5f9', background: '#fff',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <button onClick={() => navigate(-1)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#4f46e5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                <ArrowLeft size={16} />
              </button>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', flex: 1 }}>Messages</span>
              <button onClick={() => setShowDirect(true)} title="New direct message" style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                <UserPlus size={15} />
              </button>
              <button onClick={() => setShowGroup(true)} title="New group" style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                <Users size={15} />
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl focus:outline-none transition-shadow"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, borderRadius: 12, outline: 'none' }}
                onFocus={e => { e.target.style.boxShadow = '0 0 0 3px #e0e7ff'; e.target.style.borderColor = '#818cf8'; }}
                onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e2e8f0'; }}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading...</div>
            ) : error ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{error}</p>
                <button onClick={() => loadConversations()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', margin: '0 auto' }}>
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            ) : filteredConvs.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No conversations" desc="Start a new message or group" />
            ) : (
              filteredConvs.map((conv) => {
                const name = getConversationName(conv, user);
                const isSel = selectedConv?.id === conv.id;
                const lastMsg = conv.last_message;
                const group = conv.type === 'GROUP';
                return (
                  <button key={conv.id} onClick={() => setSelectedConv(conv)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      textAlign: 'left', background: isSel ? '#eef2ff' : 'transparent',
                      borderBottom: '1px solid #f8fafc', borderLeft: `3px solid ${isSel ? '#6366f1' : 'transparent'}`,
                      border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Avatar name={name} isGroup={group} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        {lastMsg && <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, marginLeft: 8 }}>{formatTime(lastMsg.created_at)}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastMsg ? (
                          <>
                            {lastMsg.sender?.id === user?.id && <span style={{ fontWeight: 500 }}>You: </span>}
                            {lastMsg.text}
                          </>
                        ) : 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {selectedConv ? (
            <>
              {/* Chat header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <button onClick={() => setSelectedConv(null)}
                  style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'none' }}
                  className="md:hidden">
                  <ArrowLeft size={16} />
                </button>
                <Avatar name={convName} isGroup={isGroup} size="md" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{convName}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>
                    {isGroup
                      ? `${selectedConv.participants?.length || 0} members`
                      : (() => {
                        const other = selectedConv.participants?.find(p => p.id !== user?.id);
                        return other?.role ? other.role : 'Member';
                      })()
                    }
                  </p>
                </div>

                {/* Actions - only Info button for groups, MoreVertical for all */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {isGroup && (
                    <button
                      onClick={() => setShowGroupInfo(v => !v)}
                      title="Group Info"
                      style={{
                        padding: 8, borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        background: showGroupInfo ? '#eef2ff' : 'transparent',
                        color: showGroupInfo ? '#6366f1' : '#94a3b8',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#4f46e5'; }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = showGroupInfo ? '#eef2ff' : 'transparent';
                        e.currentTarget.style.color = showGroupInfo ? '#6366f1' : '#94a3b8';
                      }}
                    >
                      <Info size={17} />
                    </button>
                  )}
                  <button style={{ padding: 8, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                    <MoreVertical size={17} />
                  </button>
                </div>
              </div>

              {/* Chat body: messages + optional group info */}
              <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4, background: '#f8fafc' }}>
                  {msgLoading && currentMessages.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', fontSize: 13 }}>
                      <Loader2 size={18} className="animate-spin" style={{ marginRight: 8 }} /> Loading messages...
                    </div>
                  ) : currentMessages.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="No messages yet" desc="Say hello!" />
                  ) : (
                    (() => {
                      let lastDate = null;
                      return currentMessages.map(msg => {
                        const isMe = msg.sender?.id === user?.id;
                        const msgDate = new Date(msg.created_at).toLocaleDateString();
                        const showDate = msgDate !== lastDate;
                        lastDate = msgDate;
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                                  {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 2, gap: 8, alignItems: 'flex-end' }}>
                              {!isMe && <Avatar name={msg.sender?.username || ''} size="sm" />}
                              <div style={{ maxWidth: '62%' }}>
                                {!isMe && isGroup && (
                                  <p style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', marginBottom: 3, paddingLeft: 2 }}>{msg.sender?.username}</p>
                                )}
                                <div style={{
                                  padding: '9px 13px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                  background: isMe ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#fff',
                                  color: isMe ? '#fff' : '#1e293b', fontSize: 13, lineHeight: 1.5,
                                  boxShadow: isMe ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                                  opacity: msg.optimistic ? 0.7 : 1,
                                }}>
                                  {msg.text}
                                </div>
                                <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'center', gap: 4, marginTop: 3, paddingLeft: 2, paddingRight: 2 }}>
                                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{formatTime(msg.created_at)}</span>
                                  {isMe && !msg.optimistic && <CheckCheck size={12} style={{ color: '#6366f1' }} />}
                                  {isMe && msg.optimistic && <Check size={12} style={{ color: '#94a3b8' }} />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Group Info Panel */}
                {isGroup && showGroupInfo && (
                  <GroupInfoPanel conv={selectedConv} currentUser={user} onClose={() => setShowGroupInfo(false)} />
                )}
              </div>

              {/* Input bar */}
              <div style={{ padding: '12px 20px 16px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-end', gap: 10, background: '#f8fafc',
                  border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '8px 12px',
                  transition: 'all 0.15s',
                }}
                  onFocusCapture={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 0 0 3px #e0e7ff'; }}
                  onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <button style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    <Paperclip size={16} />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    style={{ flex: 1, resize: 'none', background: 'transparent', fontSize: 13, outline: 'none', lineHeight: 1.5, maxHeight: 120, color: '#1e293b', border: 'none', fontFamily: 'inherit', paddingTop: 4, paddingBottom: 4 }}
                  />
                  <button onClick={handleSend} disabled={!input.trim() || sending}
                    style={{
                      padding: 10, borderRadius: 12, border: 'none', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end',
                      opacity: !input.trim() || sending ? 0.4 : 1,
                      boxShadow: '0 2px 8px rgba(99,102,241,0.3)', transition: 'all 0.15s',
                    }}>
                    {sending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                  </button>
                </div>
                <p style={{ textAlign: 'center', fontSize: 10, color: '#cbd5e1', marginTop: 6 }}>
                  ↵ send · ⇧↵ new line
                </p>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
              <div style={{ width: 96, height: 96, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', boxShadow: 'inset 0 2px 8px rgba(99,102,241,0.1)' }}>
                <MessageSquare size={38} strokeWidth={1.5} style={{ color: '#6366f1' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>Your messages</p>
                <p style={{ fontSize: 13, marginTop: 6, color: '#64748b' }}>Select a conversation or start a new one</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowDirect(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
                  <UserPlus size={15} /> New Message
                </button>
                <button onClick={() => setShowGroup(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                  <Users size={15} /> New Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Direct Modal ── */}
      <Modal open={showDirect} onClose={() => { setShowDirect(false); setDirectSelected([]); setDirectSearch(''); }} title="New Direct Message">
        <p style={{ fontSize: 12, color: '#64748b', marginTop: -6 }}>Select an employee to start a private conversation.</p>
        <EmployeePicker employees={filteredForDirect} selected={directSelected} onToggle={toggleDirect} search={directSearch} onSearch={setDirectSearch} single={true} empLoading={empLoading} />
        <button onClick={handleCreateDirect} disabled={directSelected.length !== 1 || directSaving}
          style={{ width: '100%', padding: '10px 0', fontSize: 13, borderRadius: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', cursor: directSelected.length !== 1 || directSaving ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', opacity: directSelected.length !== 1 || directSaving ? 0.4 : 1 }}>
          {directSaving ? <Loader2 size={14} /> : <UserPlus size={14} />} Start Conversation
        </button>
      </Modal>

      {/* ── New Group Modal ── */}
      <Modal open={showGroup} onClose={() => { setShowGroup(false); setGroupSelected([]); setGroupName(''); setGroupSearch(''); }} title="New Group Chat">
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, display: 'block', color: '#475569' }}>Group Name</label>
          <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Design Team"
            style={{ width: '100%', padding: '10px 12px', fontSize: 13, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.boxShadow = '0 0 0 3px #e0e7ff'; e.target.style.borderColor = '#818cf8'; }}
            onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e2e8f0'; }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
            Add Members {groupSelected.length > 0 && <span style={{ color: '#6366f1' }}>{groupSelected.length} selected</span>}
          </label>
          <EmployeePicker employees={filteredForGroup} selected={groupSelected} onToggle={toggleGroup} search={groupSearch} onSearch={setGroupSearch} single={false} empLoading={empLoading} />
        </div>
        <button onClick={handleCreateGroup} disabled={!groupName.trim() || groupSelected.length === 0 || groupSaving}
          style={{ width: '100%', padding: '10px 0', fontSize: 13, borderRadius: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', cursor: !groupName.trim() || groupSelected.length === 0 || groupSaving ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', opacity: !groupName.trim() || groupSelected.length === 0 || groupSaving ? 0.4 : 1 }}>
          {groupSaving ? <Loader2 size={14} /> : <Users size={14} />} Create Group
        </button>
      </Modal>
    </>
  );
};

export default ChatPage;
