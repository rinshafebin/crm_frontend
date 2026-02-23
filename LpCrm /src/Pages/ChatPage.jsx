import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Paperclip, Search, MoreVertical, Phone, Video,
  ArrowLeft, Users, MessageSquare, Plus, X, Check, CheckCheck,
  Loader2, WifiOff, RefreshCw
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

function getConversationInitials(conv, currentUser) {
  return getInitials(getConversationName(conv, currentUser));
}

// Stable color per name
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

const Avatar = ({ name = '', online, size = 'md', isGroup = false }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const dotSizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };
  const [bg, text] = getColor(name);
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full ${bg} ${text} font-semibold flex items-center justify-center ring-2 ring-white`}>
        {isGroup ? <Users size={size === 'sm' ? 12 : 16} /> : getInitials(name)}
      </div>
      {online !== undefined && !isGroup && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-white ${online ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      )}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
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
  const [showNewGroup, setShowNewGroup] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // ── Load conversations ──
  const loadConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      let token = accessToken || await refreshAccessToken();
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
  }, [accessToken, refreshAccessToken]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages when conversation selected ──
  const loadMessages = useCallback(async (convId) => {
    try {
      setMsgLoading(true);
      let token = accessToken || await refreshAccessToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/chat/messages/${convId}/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages((prev) => ({ ...prev, [convId]: data.results || data }));
    } catch (e) {
      // fail silently on poll
    } finally {
      setMsgLoading(false);
    }
  }, [accessToken, refreshAccessToken]);

  useEffect(() => {
    if (!selectedConv) return;
    loadMessages(selectedConv.id);
    // Poll every 5 seconds for new messages
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

    // Optimistic update
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
      let token = accessToken || await refreshAccessToken();
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMessages = selectedConv ? messages[selectedConv.id] || [] : [];

  const filteredConvs = conversations.filter((c) =>
    getConversationName(c, user).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const convName = selectedConv ? getConversationName(selectedConv, user) : '';
  const convInitials = selectedConv ? getConversationInitials(selectedConv, user) : '';
  const isGroup = selectedConv?.type === 'GROUP';

  const Sidebar = (
    <aside
      className={`
        flex flex-col bg-gray-50/80 border-r border-gray-200
        ${selectedConv ? 'hidden md:flex' : 'flex'}
        w-full md:w-72 lg:w-80 flex-shrink-0
      `}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="text-[15px] font-semibold text-gray-800 tracking-tight">Messages</h2>
          </div>
          <button
            onClick={() => setShowNewGroup(true)}
            title="New group"
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 transition-shadow"
          />
        </div>
      </div>

      {/* List */}
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
            <button
              onClick={() => loadConversations()}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : filteredConvs.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No conversations" desc="Start a new conversation." />
        ) : (
          filteredConvs.map((conv) => {
            const name = getConversationName(conv, user);
            const isSelected = selectedConv?.id === conv.id;
            const lastMsg = conv.last_message;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-100 group
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
                        {lastMsg.sender?.id === user?.id && (
                          <span className="text-indigo-400 mr-1">You:</span>
                        )}
                        {lastMsg.text}
                      </>
                    ) : (
                      <span className="italic text-gray-400">No messages yet</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );

  const ChatWindow = (
    <div
      className={`
        flex flex-col flex-1 bg-white min-w-0
        ${selectedConv ? 'flex' : 'hidden md:flex'}
      `}
    >
      {selectedConv ? (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
            <button
              onClick={() => setSelectedConv(null)}
              className="md:hidden p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
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
                <button
                  key={i}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
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
                        {!isMe && (
                          <Avatar name={msg.sender?.username || ''} size="sm" />
                        )}
                        <div className={`max-w-xs lg:max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && isGroup && (
                            <span className="text-[10px] font-medium text-indigo-500 mb-1 px-1">
                              {msg.sender?.username}
                            </span>
                          )}
                          <div
                            className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm
                              ${isMe
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'}`}
                          >
                            {msg.text}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
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

          {/* Input */}
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
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 self-end shadow-sm active:scale-95"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
          </div>
        </>
      ) : (
        <EmptyState icon={MessageSquare} title="Select a conversation" desc="Choose from the list to start chatting." />
      )}
    </div>
  );

  const [groupName, setGroupName] = useState('');
  const [groupIds, setGroupIds] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);

  const handleCreateGroup = async () => {
    const name = groupName.trim();
    const ids = groupIds.split(',').map((s) => parseInt(s.trim())).filter(Boolean);
    if (!name) return;
    setGroupLoading(true);
    try {
      let token = accessToken || await refreshAccessToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/chat/create-group/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, user_ids: ids }),
      });
      if (!res.ok) throw new Error('Failed to create group');
      await loadConversations();
      setShowNewGroup(false);
      setGroupName('');
      setGroupIds('');
    } catch {
      alert('Failed to create group.');
    } finally {
      setGroupLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
        <div className="flex w-full max-w-7xl mx-auto border-x border-gray-200 shadow-sm">
          {Sidebar}
          {ChatWindow}
        </div>
      </div>

      {/* New Group Modal */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">New Group Chat</h3>
              <button onClick={() => setShowNewGroup(false)} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
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
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Member IDs <span className="font-normal text-gray-400">(comma-separated)</span></label>
                <input
                  type="text"
                  value={groupIds}
                  onChange={(e) => setGroupIds(e.target.value)}
                  placeholder="e.g. 2, 5, 8"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowNewGroup(false)}
                className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || groupLoading}
                className="flex-1 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-1.5"
              >
                {groupLoading ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
