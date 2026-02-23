import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Paperclip, Search, MoreVertical, Phone, Video,
  ArrowLeft, Users, MessageSquare, Plus, X, Check, CheckCheck,
  Loader2, WifiOff, RefreshCw, UserPlus,
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

const COLOR_PAIRS = [
  ['bg-indigo-100', 'text-indigo-700'],
  ['bg-violet-100', 'text-violet-700'],
  ['bg-sky-100', 'text-sky-700'],
  ['bg-emerald-100', 'text-emerald-700'],
  ['bg-amber-100', 'text-amber-700'],
  ['bg-rose-100', 'text-rose-700'],
];
function getColor(name = '') {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return COLOR_PAIRS[n % COLOR_PAIRS.length];
}

const Avatar = ({ name = '', size = 'md', isGroup = false }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const [bg, fg] = getColor(name);
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full ${bg} ${fg} font-semibold flex items-center justify-center ring-2 ring-white`}>
        {isGroup ? <Users size={size === 'sm' ? 12 : 16} /> : getInitials(name)}
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-10">
    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
      <Icon size={28} className="text-indigo-400" />
    </div>
    <div>
      <p className="font-semibold text-gray-700 text-base">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{desc}</p>
    </div>
  </div>
);


const EmployeePicker = ({ employees, selected, onToggle, search, onSearch, single = false, empLoading = false }) => (
  <div>
    <div className="relative mb-2">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search employees…"
        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
    <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
      {empLoading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-indigo-300">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading employees…</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">No employees found.</div>
      ) : (
        employees.map((emp) => {
          const isSelected = selected.includes(emp.id);
          const [bg, fg] = getColor(emp.username);
          return (
            <button
              key={emp.id}
              onClick={() => onToggle(emp.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all
                ${isSelected ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className={`w-8 h-8 rounded-full ${bg} ${fg} text-xs font-semibold flex items-center justify-center flex-shrink-0`}>
                {getInitials(emp.username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{emp.username}</p>
                {emp.role && <p className="text-[11px] text-gray-400 truncate capitalize">{emp.role}</p>}
              </div>
              {/* Checkbox or radio indicator */}
              <div className={`flex-shrink-0 flex items-center justify-center transition-all
                ${single
                  ? `w-4 h-4 rounded-full border-2 ${isSelected ? 'border-indigo-600' : 'border-gray-300'}`
                  : `w-5 h-5 rounded-md border-2 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}`}
              >
                {isSelected && !single && <Check size={11} className="text-white" strokeWidth={3} />}
                {isSelected && single && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
              </div>
            </button>
          );
        })
      )}
    </div>
    {!single && selected.length > 0 && (
      <p className="text-[11px] text-indigo-500 font-medium mt-2 px-1">
        {selected.length} member{selected.length > 1 ? 's' : ''} selected
      </p>
    )}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-all">
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
  const fetchEmployees = useCallback(async () => {
    try {
      setEmpLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/accounts/employees/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      // Exclude the current logged-in user from the list
      const list = (data.results || data).filter((e) => e.id !== user?.id);
      setEmployees(list);
    } catch (e) {
      console.error('Failed to load employees', e);
    } finally {
      setEmpLoading(false);
    }
  }, [getToken, user?.id]);

  const loadConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/chat/conversations/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data.results || data);
      setError(null);
    } catch (e) {
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
      const res = await fetch(`${API_BASE_URL}/chat/messages/${convId}/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages((prev) => ({ ...prev, [convId]: data.results || data }));
    } catch (e) {
      // fail silently on background poll
    } finally {
      setMsgLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadConversations();
    fetchEmployees();
  }, [loadConversations, fetchEmployees]);
  useEffect(() => {
    if (!selectedConv) return;
    loadMessages(selectedConv.id);
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadMessages(selectedConv.id);
      loadConversations(true);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedConv, loadMessages, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConv]);

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
    setMessages((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), optimistic],
    }));
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/chat/send/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversation_id: selectedConv.id, text }),
      });
      if (!res.ok) throw new Error('Failed to send');
      await loadMessages(selectedConv.id);
      loadConversations(true);
    } catch {
      // Remove optimistic bubble on failure, restore input
      setMessages((prev) => ({
        ...prev,
        [selectedConv.id]: (prev[selectedConv.id] || []).filter((m) => m.id !== optimistic.id),
      }));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Create direct conversation with one employee
  const handleCreateDirect = async () => {
    if (directSelected.length !== 1 || directSaving) return;
    setDirectSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/chat/create-direct/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: directSelected[0] }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      await loadConversations();
      // Auto-select the newly created/existing conversation
      setConversations((prev) => {
        const found = prev.find((c) => c.id === data.conversation_id);
        if (found) setSelectedConv(found);
        return prev;
      });
      setShowDirect(false);
      setDirectSelected([]);
      setDirectSearch('');
    } catch {
      alert('Failed to start conversation.');
    } finally {
      setDirectSaving(false);
    }
  };

  // ── Create group conversation with multiple employees
  const handleCreateGroup = async () => {
    const name = groupName.trim();
    if (!name || groupSelected.length === 0 || groupSaving) return;
    setGroupSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/chat/create-group/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, user_ids: groupSelected }),
      });
      if (!res.ok) throw new Error('Failed');
      await loadConversations();
      setShowGroup(false);
      setGroupName('');
      setGroupSelected([]);
      setGroupSearch('');
    } catch {
      alert('Failed to create group.');
    } finally {
      setGroupSaving(false);
    }
  };

  // ── Employee toggle handlers
  const toggleDirect = (id) => setDirectSelected([id]); // radio: always one
  const toggleGroup = (id) =>
    setGroupSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // ── Filtered lists
  const filteredConvs = conversations.filter((c) =>
    getConversationName(c, user).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredForGroup = employees.filter((e) =>
    e.username.toLowerCase().includes(groupSearch.toLowerCase())
  );
  const filteredForDirect = employees.filter((e) =>
    e.username.toLowerCase().includes(directSearch.toLowerCase())
  );

  const currentMessages = selectedConv ? messages[selectedConv.id] || [] : [];
  const convName = selectedConv ? getConversationName(selectedConv, user) : '';
  const isGroup = selectedConv?.type === 'GROUP';

  return (
    <>
      <Navbar />

      <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
        <div className="flex w-full max-w-7xl mx-auto border-x border-gray-200 shadow-sm">

          <aside className={`flex flex-col bg-gray-50/80 border-r border-gray-200
            ${selectedConv ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-shrink-0`}
          >
            <div className="px-4 pt-4 pb-3 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(-1)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <ArrowLeft size={16} />
                  </button>
                  <h2 className="text-[15px] font-semibold text-gray-800 tracking-tight">Messages</h2>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowDirect(true)} title="New direct message"
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <UserPlus size={15} />
                  </button>
                  <button onClick={() => setShowGroup(true)} title="New group"
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="text" placeholder="Search conversations…" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-indigo-400">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-10 gap-3 px-4 text-center">
                  <WifiOff size={24} className="text-gray-300" />
                  <p className="text-sm text-gray-500">{error}</p>
                  <button onClick={() => loadConversations()}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium">
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              ) : filteredConvs.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No conversations" desc="Start a new one using the buttons above." />
              ) : (
                filteredConvs.map((conv) => {
                  const name = getConversationName(conv, user);
                  const isSelected = selectedConv?.id === conv.id;
                  const lastMsg = conv.last_message;
                  return (
                    <button key={conv.id} onClick={() => setSelectedConv(conv)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-100
                        ${isSelected
                          ? 'bg-indigo-50 border-l-[3px] border-l-indigo-600'
                          : 'hover:bg-white border-l-[3px] border-l-transparent'}`}
                    >
                      <Avatar name={name} isGroup={conv.type === 'GROUP'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>
                            {name}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {lastMsg ? formatTime(lastMsg.created_at) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {lastMsg ? (
                            <>
                              {lastMsg.sender?.id === user?.id && <span className="text-indigo-400 mr-1">You:</span>}
                              {lastMsg.text}
                            </>
                          ) : <span className="italic text-gray-400">No messages yet</span>}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className={`flex flex-col flex-1 bg-white min-w-0 ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
            {selectedConv ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
                  <button onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar name={convName} isGroup={isGroup} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{convName}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isGroup
                        ? `${selectedConv.participants?.length || 0} members`
                        : (() => {
                            const other = selectedConv.participants?.find((p) => p.id !== user?.id);
                            return other?.role ? other.role : 'Member';
                          })()}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[Phone, Video, MoreVertical].map((Icon, i) => (
                      <button key={i} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Icon size={17} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-gradient-to-b from-gray-50/50 to-white">
                  {msgLoading && currentMessages.length === 0 ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-indigo-300">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-sm">Loading messages…</span>
                    </div>
                  ) : currentMessages.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="No messages yet" desc="Say hello 👋" />
                  ) : (
                    (() => {
                      let lastDate = null;
                      return currentMessages.map((msg) => {
                        const isMe = msg.sender?.id === user?.id;
                        const msgDate = new Date(msg.created_at).toLocaleDateString();
                        const showDate = msgDate !== lastDate;
                        lastDate = msgDate;
                        return (
                          <React.Fragment key={msg.id}>
                            {showDate && (
                              <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-100" />
                                <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full">
                                  {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <div className="flex-1 h-px bg-gray-100" />
                              </div>
                            )}
                            <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${msg.optimistic ? 'opacity-70' : ''}`}>
                              {!isMe && <Avatar name={msg.sender?.username || ''} size="sm" />}
                              <div className={`max-w-xs lg:max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && isGroup && (
                                  <span className="text-[10px] font-medium text-indigo-500 mb-1 px-1">
                                    {msg.sender?.username}
                                  </span>
                                )}
                                <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm
                                  ${isMe
                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'}`}
                                >
                                  {msg.text}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                                  {isMe && !msg.optimistic && <CheckCheck size={11} className="text-indigo-400" />}
                                  {isMe && msg.optimistic && <Check size={11} className="text-gray-300" />}
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

                {/* Message input */}
                <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
                    <button className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-lg transition-all flex-shrink-0 self-end mb-0.5">
                      <Paperclip size={16} />
                    </button>
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed py-1"
                      style={{ maxHeight: '120px' }}
                    />
                    <button onClick={handleSend} disabled={!input.trim() || sending}
                      className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 self-end shadow-sm active:scale-95">
                      {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <EmptyState icon={MessageSquare} title="Select a conversation" desc="Choose from the list or start a new one." />
            )}
          </div>

        </div>
      </div>

      <Modal
        open={showDirect}
        onClose={() => { setShowDirect(false); setDirectSelected([]); setDirectSearch(''); }}
        title="New Direct Message"
      >
        <p className="text-xs text-gray-500 -mt-2">Select an employee to start a private conversation.</p>
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
          className="w-full py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
        >
          {directSaving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          Start Conversation
        </button>
      </Modal>

      <Modal
        open={showGroup}
        onClose={() => { setShowGroup(false); setGroupSelected([]); setGroupName(''); setGroupSearch(''); }}
        title="New Group Chat"
      >
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Design Team"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Add Members
            {groupSelected.length > 0 && (
              <span className="ml-2 text-indigo-500 font-normal">{groupSelected.length} selected</span>
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
          className="w-full py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
        >
          {groupSaving ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
          Create Group
        </button>
      </Modal>
    </>
  );
};

export default ChatPage;
