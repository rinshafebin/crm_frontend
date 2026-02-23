import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Paperclip, Search, MoreVertical, Phone, Video,
  ArrowLeft, Users, MessageSquare, Plus, X, Check, CheckCheck,
  Loader2, WifiOff, RefreshCw, UserPlus, Hash, ChevronDown,
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
  ['#e0e7ff', '#4338ca'], // indigo
  ['#ede9fe', '#6d28d9'], // violet
  ['#e0f2fe', '#0369a1'], // sky
  ['#d1fae5', '#065f46'], // emerald
  ['#fef3c7', '#92400e'], // amber
  ['#fce7f3', '#9d174d'], // pink
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
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center font-bold select-none ring-2 ring-white"
      style={{ width: px, height: px, background: bg, color: fg, fontSize: fs }}
    >
      {isGroup
        ? <Users size={ic} strokeWidth={2.2} />
        : getInitials(name)}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center select-none">
    <div className="relative">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner"
        style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
        <Icon size={30} strokeWidth={1.5} style={{ color: '#6366f1' }} />
      </div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#a5b4fc' }} />
      </div>
    </div>
    <div>
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{desc}</p>
    </div>
  </div>
);

const EmployeePicker = ({ employees, selected, onToggle, search, onSearch, single = false, empLoading = false }) => (
  <div>
    <div className="relative mb-3">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9ca3af' }} />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search employees…"
        className="w-full pl-8 pr-3 py-2.5 text-sm border rounded-xl focus:outline-none transition-shadow"
        style={{ borderColor: '#e5e7eb', background: '#f9fafb', color: '#374151' }}
        onFocus={e => { e.target.style.boxShadow = '0 0 0 3px #e0e7ff'; e.target.style.borderColor = '#818cf8'; }}
        onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e5e7eb'; }}
      />
    </div>
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#f3f4f6', maxHeight: 210, overflowY: 'auto' }}>
      {empLoading ? (
        <div className="flex items-center justify-center py-8 gap-2" style={{ color: '#a5b4fc' }}>
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading employees…</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="py-6 text-center text-sm" style={{ color: '#9ca3af' }}>No employees found.</div>
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: bg, color: fg }}>
                {getInitials(emp.username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1f2937' }}>{emp.username}</p>
                {emp.role && <p className="text-xs truncate capitalize" style={{ color: '#9ca3af' }}>{emp.role}</p>}
              </div>
              <div className={`flex-shrink-0 flex items-center justify-center transition-all ${single
                ? 'w-4 h-4 rounded-full border-2'
                : 'w-5 h-5 rounded-md border-2'}`}
                style={{
                  borderColor: isSelected ? '#4f46e5' : '#d1d5db',
                  background: isSelected && !single ? '#4f46e5' : 'white',
                }}>
                {isSelected && !single && <Check size={11} color="white" strokeWidth={3} />}
                {isSelected && single && <div className="w-2 h-2 rounded-full" style={{ background: '#4f46e5' }} />}
              </div>
            </button>
          );
        })
      )}
    </div>
    {!single && selected.length > 0 && (
      <p className="text-xs font-medium mt-2 px-1" style={{ color: '#6366f1' }}>
        {selected.length} member{selected.length > 1 ? 's' : ''} selected
      </p>
    )}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm rounded-2xl flex flex-col shadow-2xl border animate-fade-in"
        style={{ background: 'white', borderColor: '#f1f5f9', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: '#f1f5f9' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose}
            className="rounded-lg p-1 transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm"
    style={{ background: 'white', border: '1px solid #f3f4f6', width: 'fit-content' }}>
    {[0, 1, 2].map(i => (
      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
        style={{ background: '#94a3b8', animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

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
    } catch { if (!silent) setError('Could not load conversations.'); }
    finally { if (!silent) setLoading(false); }
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
      text,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => ({ ...prev, [selectedConv.id]: [...(prev[selectedConv.id] || []), optimistic] }));
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/chat/send/`, {
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
      const res = await fetch(`${API_BASE_URL}/chat/create-direct/`, {
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
      const res = await fetch(`${API_BASE_URL}/chat/create-group/`, {
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { font-family: 'Geist', sans-serif; }
        .mono { font-family: 'Geist Mono', monospace; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeSlideUp 0.2s ease-out; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
        .conv-item { transition: background 0.12s ease, border-color 0.12s ease; }
        .msg-bubble { transition: opacity 0.15s ease; }
        .send-btn { transition: background 0.12s ease, transform 0.1s ease, box-shadow 0.12s ease; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .send-btn:active:not(:disabled) { transform: scale(0.96); }
      `}</style>

      <Navbar />

      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 64px)', background: '#f8fafc' }}>
        <div className="flex w-full max-w-7xl mx-auto overflow-hidden shadow-lg" style={{ border: '1px solid #e2e8f0', borderRadius: 0 }}>

          {/* ── Sidebar ── */}
          <aside className={`flex flex-col flex-shrink-0 chat-scroll overflow-y-auto
            ${selectedConv ? 'hidden md:flex' : 'flex'}`}
            style={{ width: 300, borderRight: '1px solid #e2e8f0', background: '#ffffff' }}>

            {/* Sidebar header */}
            <div className="flex-shrink-0 px-4 pt-5 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(-1)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                    <ArrowLeft size={15} />
                  </button>
                  <span className="font-semibold text-sm" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Messages</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowDirect(true)}
                    title="New direct message"
                    className="p-1.5 rounded-lg transition-all text-xs flex items-center gap-1"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                    <UserPlus size={14} />
                  </button>
                  <button
                    onClick={() => setShowGroup(true)}
                    title="New group"
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl focus:outline-none transition-shadow"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b' }}
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 3px #e0e7ff'; e.target.style.borderColor = '#818cf8'; }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e2e8f0'; }}
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto chat-scroll">
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2" style={{ color: '#a5b4fc' }}>
                  <Loader2 size={17} className="animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-10 gap-3 px-4 text-center">
                  <WifiOff size={22} style={{ color: '#cbd5e1' }} />
                  <p className="text-sm" style={{ color: '#64748b' }}>{error}</p>
                  <button onClick={() => loadConversations()}
                    className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#6366f1' }}>
                    <RefreshCw size={11} /> Retry
                  </button>
                </div>
              ) : filteredConvs.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No conversations" desc="Start one using the buttons above." />
              ) : (
                filteredConvs.map((conv) => {
                  const name = getConversationName(conv, user);
                  const isSel = selectedConv?.id === conv.id;
                  const lastMsg = conv.last_message;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left conv-item"
                      style={{
                        background: isSel ? '#eef2ff' : 'transparent',
                        borderBottom: '1px solid #f8fafc',
                        borderLeft: `3px solid ${isSel ? '#6366f1' : 'transparent'}`,
                      }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Avatar name={name} isGroup={conv.type === 'GROUP'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-sm font-semibold truncate" style={{ color: isSel ? '#3730a3' : '#1e293b' }}>
                            {name}
                          </span>
                          <span className="mono text-[10px] flex-shrink-0" style={{ color: '#94a3b8' }}>
                            {lastMsg ? formatTime(lastMsg.created_at) : ''}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
                          {lastMsg ? (
                            <>
                              {lastMsg.sender?.id === user?.id && (
                                <span style={{ color: '#a5b4fc' }}>You: </span>
                              )}
                              {lastMsg.text}
                            </>
                          ) : <span style={{ fontStyle: 'italic' }}>No messages yet</span>}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── Chat area ── */}
          <div className={`flex flex-col flex-1 min-w-0 ${selectedConv ? 'flex' : 'hidden md:flex'}`}
            style={{ background: '#fafbff' }}>

            {selectedConv ? (
              <>
                {/* Chat header */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    borderBottom: '1px solid #e2e8f0',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}>
                  <button onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 rounded-lg transition-all" style={{ color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <ArrowLeft size={17} />
                  </button>
                  <Avatar name={convName} isGroup={isGroup} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#0f172a' }}>{convName}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
                      <p className="text-xs" style={{ color: '#64748b' }}>
                        {isGroup
                          ? `${selectedConv.participants?.length || 0} members`
                          : (() => {
                              const other = selectedConv.participants?.find(p => p.id !== user?.id);
                              return other?.role ? other.role : 'Member';
                            })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[Phone, Video, MoreVertical].map((Icon, i) => (
                      <button key={i} className="p-2 rounded-lg transition-all" style={{ color: '#94a3b8' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#4f46e5'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1 chat-scroll"
                  style={{ background: 'linear-gradient(180deg, #f8faff 0%, #fafbff 100%)' }}>
                  {msgLoading && currentMessages.length === 0 ? (
                    <div className="flex items-center justify-center py-16 gap-2" style={{ color: '#a5b4fc' }}>
                      <Loader2 size={17} className="animate-spin" />
                      <span className="text-sm">Loading messages…</span>
                    </div>
                  ) : currentMessages.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="No messages yet" desc="Send the first message 👋" />
                  ) : (
                    (() => {
                      let lastDate = null;
                      return currentMessages.map(msg => {
                        const isMe = msg.sender?.id === user?.id;
                        const msgDate = new Date(msg.created_at).toLocaleDateString();
                        const showDate = msgDate !== lastDate;
                        lastDate = msgDate;
                        return (
                          <React.Fragment key={msg.id}>
                            {showDate && (
                              <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                                <span className="mono text-[10px] px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                  {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                              </div>
                            )}
                            <div className={`flex items-end gap-2.5 msg-bubble animate-fade-in ${isMe ? 'justify-end' : 'justify-start'}`}
                              style={{ opacity: msg.optimistic ? 0.65 : 1 }}>
                              {!isMe && <Avatar name={msg.sender?.username || ''} size="sm" />}
                              <div className={`flex flex-col max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && isGroup && (
                                  <span className="text-[10px] font-semibold mb-1 px-1" style={{ color: '#818cf8' }}>
                                    {msg.sender?.username}
                                  </span>
                                )}
                                <div
                                  className="px-4 py-2.5 text-sm leading-relaxed"
                                  style={isMe
                                    ? {
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: 'white',
                                        borderRadius: '18px 18px 4px 18px',
                                        boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                                      }
                                    : {
                                        background: 'white',
                                        color: '#1e293b',
                                        borderRadius: '18px 18px 18px 4px',
                                        border: '1px solid #f1f5f9',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                      }}
                                >
                                  {msg.text}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <span className="mono text-[10px]" style={{ color: '#94a3b8' }}>
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {isMe && !msg.optimistic && <CheckCheck size={11} style={{ color: '#a5b4fc' }} />}
                                  {isMe && msg.optimistic && <Check size={11} style={{ color: '#cbd5e1' }} />}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="px-5 py-4 flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.95)', borderTop: '1px solid #e2e8f0', backdropFilter: 'blur(12px)' }}>
                  <div
                    className="flex items-end gap-3 rounded-2xl px-3 py-2.5 transition-shadow"
                    style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                    onFocusCapture={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 0 0 3px #e0e7ff'; }}
                    onBlurCapture={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <button className="p-1.5 rounded-lg flex-shrink-0 self-end mb-0.5 transition-colors"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                      <Paperclip size={16} />
                    </button>
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={e => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      className="flex-1 resize-none bg-transparent text-sm focus:outline-none leading-relaxed py-1"
                      style={{ maxHeight: 120, color: '#1e293b' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="send-btn p-2.5 rounded-xl flex-shrink-0 self-end shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: 'white',
                      }}>
                      {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </div>
                  <p className="mono text-center mt-1.5 text-[10px]" style={{ color: '#cbd5e1' }}>
                    ↵ send · ⇧↵ new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-6">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner"
                  style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
                  <MessageSquare size={38} strokeWidth={1.5} style={{ color: '#6366f1' }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg" style={{ color: '#0f172a' }}>Your messages</p>
                  <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
                    Select a conversation or start a new one
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDirect(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: '#6366f1', color: 'white', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                    onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}>
                    <UserPlus size={15} /> New Message
                  </button>
                  <button
                    onClick={() => setShowGroup(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: '#f1f5f9', color: '#475569' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                    <Users size={15} /> New Group
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── New Direct Modal ── */}
      <Modal
        open={showDirect}
        onClose={() => { setShowDirect(false); setDirectSelected([]); setDirectSearch(''); }}
        title="New Direct Message"
      >
        <p className="text-xs -mt-2" style={{ color: '#64748b' }}>
          Select an employee to start a private conversation.
        </p>
        <EmployeePicker
          employees={filteredForDirect}
          selected={directSelected}
          onToggle={toggleDirect}
          search={directSearch}
          onSearch={setDirectSearch}
          single={true}
          empLoading={empLoading}
        />
        <button
          onClick={handleCreateDirect}
          disabled={directSelected.length !== 1 || directSaving}
          className="w-full py-2.5 text-sm rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white' }}>
          {directSaving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          Start Conversation
        </button>
      </Modal>

      {/* ── New Group Modal ── */}
      <Modal
        open={showGroup}
        onClose={() => { setShowGroup(false); setGroupSelected([]); setGroupName(''); setGroupSearch(''); }}
        title="New Group Chat"
      >
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: '#475569' }}>Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="e.g. Design Team"
            className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-shadow"
            style={{ border: '1px solid #e2e8f0', color: '#1e293b', background: '#f9fafb' }}
            onFocus={e => { e.target.style.boxShadow = '0 0 0 3px #e0e7ff'; e.target.style.borderColor = '#818cf8'; }}
            onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e2e8f0'; }}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 flex items-center gap-2" style={{ color: '#475569' }}>
            Add Members
            {groupSelected.length > 0 && (
              <span style={{ color: '#6366f1' }}>{groupSelected.length} selected</span>
            )}
          </label>
          <EmployeePicker
            employees={filteredForGroup}
            selected={groupSelected}
            onToggle={toggleGroup}
            search={groupSearch}
            onSearch={setGroupSearch}
            single={false}
            empLoading={empLoading}
          />
        </div>
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || groupSelected.length === 0 || groupSaving}
          className="w-full py-2.5 text-sm rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white' }}>
          {groupSaving ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
          Create Group
        </button>
      </Modal>
    </>
  );
};

export default ChatPage;
