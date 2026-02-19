import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Search, MoreVertical, Phone, Video, ArrowLeft, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MOCK_CONTACTS = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'Admin',
    avatar: 'AJ',
    online: true,
    lastMessage: "Sure, I'll review that report shortly.",
    lastTime: '10:42 AM',
    unread: 2,
  },
  {
    id: 2,
    name: 'Bob Martinez',
    role: 'Manager',
    avatar: 'BM',
    online: false,
    lastMessage: 'Meeting rescheduled to 3 PM.',
    lastTime: 'Yesterday',
    unread: 0,
  },
  {
    id: 3,
    name: 'Carol Smith',
    role: 'Developer',
    avatar: 'CS',
    online: true,
    lastMessage: 'The build is passing now ✅',
    lastTime: '9:15 AM',
    unread: 0,
  },
  {
    id: 4,
    name: 'David Lee',
    role: 'Designer',
    avatar: 'DL',
    online: false,
    lastMessage: 'Sent you the updated mockups.',
    lastTime: 'Mon',
    unread: 1,
  },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, from: 'them', text: 'Hey, did you get a chance to look at the Q3 report?', time: '10:30 AM' },
    { id: 2, from: 'me', text: "Not yet, been in meetings all morning. I'll check it now.", time: '10:35 AM' },
    { id: 3, from: 'them', text: "Sure, I'll review that report shortly.", time: '10:42 AM' },
  ],
  2: [
    { id: 1, from: 'them', text: 'Hey, quick heads up — the 2 PM meeting has been moved.', time: 'Yesterday' },
    { id: 2, from: 'me', text: 'Got it, when is the new time?', time: 'Yesterday' },
    { id: 3, from: 'them', text: 'Meeting rescheduled to 3 PM.', time: 'Yesterday' },
  ],
  3: [
    { id: 1, from: 'me', text: 'Is the CI pipeline fixed?', time: '9:10 AM' },
    { id: 2, from: 'them', text: 'The build is passing now ✅', time: '9:15 AM' },
  ],
  4: [
    { id: 1, from: 'them', text: 'Sent you the updated mockups.', time: 'Mon' },
    { id: 2, from: 'me', text: 'Thanks! These look great.', time: 'Mon' },
  ],
};


const Avatar = ({ initials, online, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center`}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            online ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      )}
    </div>
  );
};


const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contacts] = useState(MOCK_CONTACTS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedContact, setSelectedContact] = useState(null);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedContact ? messages[selectedContact.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = () => {
    if (!input.trim() || !selectedContact) return;

    const newMsg = {
      id: Date.now(),
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Sidebar ──
  const Sidebar = (
    <div
      className={`
        flex flex-col bg-gray-50 border-r border-gray-200
        ${selectedContact ? 'hidden md:flex' : 'flex'}
        w-full md:w-80 lg:w-96 flex-shrink-0
      `}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200 flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => setSelectedContact(contact)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-gray-100
              ${
                selectedContact?.id === contact.id
                  ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                  : 'hover:bg-white border-l-4 border-l-transparent'
              }
            `}
          >
            <Avatar initials={contact.avatar} online={contact.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-800 truncate">{contact.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{contact.lastTime}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-gray-500 truncate">{contact.lastMessage}</span>
                {contact.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {contact.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
        {filteredContacts.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">No contacts found.</div>
        )}
      </div>
    </div>
  );

  // ── Chat Window ──
  const ChatWindow = (
    <div
      className={`
        flex flex-col flex-1 bg-white
        ${selectedContact ? 'flex' : 'hidden md:flex'}
      `}
    >
      {selectedContact ? (
        <>
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
            {/* Mobile back */}
            <button
              onClick={() => setSelectedContact(null)}
              className="md:hidden p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <Avatar initials={selectedContact.avatar} online={selectedContact.online} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800">{selectedContact.name}</p>
              <p className="text-xs text-gray-500">
                {selectedContact.online ? (
                  <span className="text-green-600 font-medium">Online</span>
                ) : (
                  'Offline'
                )}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all duration-200">
                <Phone size={18} />
              </button>
              <button className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all duration-200">
                <Video size={18} />
              </button>
              <button className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-all duration-200">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">
            {currentMessages.map((msg) => {
              const isMe = msg.from === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="mr-2 mt-1">
                      <Avatar initials={selectedContact.avatar} size="sm" />
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }
                      `}
                    >
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-end gap-2">
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200 flex-shrink-0">
                <Paperclip size={18} />
              </button>
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 resize-none px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Send size={28} className="text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Select a conversation</h3>
          <p className="text-sm text-gray-400">Choose a contact from the list to start chatting.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-7xl mx-auto">
      {Sidebar}
      {ChatWindow}
    </div>
  );
};

export default ChatPage;
