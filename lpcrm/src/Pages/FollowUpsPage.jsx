import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Navbar from '../Components/layouts/Navbar';
import {
  CalendarClock, Phone, MessageSquare, Mail, Users,
  CheckCircle, AlertTriangle, Clock, Plus, X, Edit,
  Trash2, ChevronLeft, ChevronRight, Filter, Search,
  SlidersHorizontal, RefreshCw, Calendar, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 20;

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META = {
  call:      { label: 'Call',      Icon: Phone,          bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
  whatsapp:  { label: 'WhatsApp',  Icon: MessageSquare,  bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-200'},
  email:     { label: 'Email',     Icon: Mail,           bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  meeting:   { label: 'Meeting',   Icon: Users,          bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
};

const STATUS_META = {
  pending:       { label: 'Pending',       bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500'  },
  contacted:     { label: 'Contacted',     bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'   },
  not_interested:{ label: 'Not Interested',bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'     },
  rescheduled:   { label: 'Rescheduled',   bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500'  },
};

const PRIORITY_META = {
  high:   { label: 'High',   cls: 'bg-red-100 text-red-700'       },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700' },
  low:    { label: 'Low',    cls: 'bg-gray-100 text-gray-600'     },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const FollowUpModal = ({ isOpen, onClose, onSave, initial, leads }) => {
  const empty = {
    phone_number: '', name: '', follow_up_date: '', follow_up_time: '',
    followup_type: 'call', notes: '', priority: 'medium', status: 'pending',
    lead: '',
  };

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? {
        phone_number:  initial.phone_number || '',
        name:          initial.name || '',
        follow_up_date:initial.follow_up_date || '',
        follow_up_time:initial.follow_up_time || '',
        followup_type: initial.followup_type || 'call',
        notes:         initial.notes || '',
        priority:      initial.priority || 'medium',
        status:        initial.status || 'pending',
        lead:          initial.lead || '',
      } : empty);
      setErrors({});
    }
  }, [isOpen, initial]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.phone_number.trim()) e.phone_number = 'Phone is required';
    if (!form.follow_up_date)      e.follow_up_date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ ...form, lead: form.lead || null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = (field) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarClock className="text-white" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white">
              {initial ? 'Edit Follow-Up' : 'New Follow-Up'}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <X className="text-white" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Lead link */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Link to Lead (optional)</label>
            <select value={form.lead} onChange={e => set('lead', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 bg-white">
              <option value="">— No lead linked —</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
              ))}
            </select>
          </div>

          {/* Phone + Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
              <input value={form.phone_number} onChange={e => set('phone_number', e.target.value)}
                className={inputCls('phone_number')} placeholder="e.g. 9876543210" />
              {errors.phone_number && <p className="text-red-600 text-xs mt-1">{errors.phone_number}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className={inputCls('name')} placeholder="Contact name" />
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Follow-Up Date *</label>
              <input type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)}
                className={inputCls('follow_up_date')} />
              {errors.follow_up_date && <p className="text-red-600 text-xs mt-1">{errors.follow_up_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
              <input type="time" value={form.follow_up_time} onChange={e => set('follow_up_time', e.target.value)}
                className={inputCls('follow_up_time')} />
            </div>
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select value={form.followup_type} onChange={e => set('followup_type', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 bg-white">
                <option value="call">Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 bg-white">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Status (edit only) */}
          {initial && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 bg-white">
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="not_interested">Not Interested</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 resize-none"
              placeholder="Any additional notes…" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Follow-Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────

const FollowUpCard = ({ item, onEdit, onDelete, onStatusChange }) => {
  const type     = TYPE_META[item.followup_type]  || TYPE_META.call;
  const status   = STATUS_META[item.status]        || STATUS_META.pending;
  const priority = PRIORITY_META[item.priority]    || PRIORITY_META.medium;
  const TypeIcon = type.Icon;

  return (
    <div className={`group bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
      item.is_overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-blue-200'
    }`}>
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${type.bg} rounded-xl flex items-center justify-center border ${type.border}`}>
              <TypeIcon size={18} className={type.text} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">
                {item.name || item.phone_number}
              </p>
              {item.name && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone size={11} />
                  {item.phone_number}
                </p>
              )}
            </div>
          </div>

          {item.is_overdue && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200">
              <AlertTriangle size={12} />
              Overdue
            </span>
          )}
        </div>

        {/* Date / time */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
            <Calendar size={14} className="text-orange-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {formatDate(item.follow_up_date)}
            {item.follow_up_time && (
              <span className="text-gray-500 font-normal ml-1">at {formatTime(item.follow_up_time)}</span>
            )}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${priority.cls}`}>
            {priority.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${type.bg} ${type.text}`}>
            {type.label}
          </span>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 mb-3 line-clamp-2">
            {item.notes}
          </p>
        )}

        {/* Quick status change */}
        {item.status === 'pending' && (
          <div className="flex gap-2 mb-3">
            <button onClick={() => onStatusChange(item.id, 'contacted')}
              className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-xl border border-green-200 transition-all">
              ✓ Mark Contacted
            </button>
            <button onClick={() => onStatusChange(item.id, 'rescheduled')}
              className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all">
              ↺ Reschedule
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-all">
            <Edit size={15} />
            Edit
          </button>
          <button onClick={() => onDelete(item.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all">
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/2" />
    <div className="flex gap-2">
      <div className="h-6 bg-gray-100 rounded-full w-20" />
      <div className="h-6 bg-gray-100 rounded-full w-16" />
    </div>
    <div className="h-10 bg-gray-100 rounded-xl" />
  </div>
);

// ── Stats card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, color, Icon }) => (
  <div className="group bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</p>
      </div>
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={22} />
      </div>
    </div>
  </div>
);

// ── Tab button ────────────────────────────────────────────────────────────────

const Tab = ({ label, active, count, onClick }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
      active
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
    }`}>
    {label}
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
      }`}>{count}</span>
    )}
  </button>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FollowUpsPage() {
  const { accessToken, refreshAccessToken, loading: authLoading } = useAuth();
  const tokenRef = useRef(accessToken);
  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);

  const [items, setItems]             = useState([]);
  const [leads, setLeads]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalCount, setTotalCount]   = useState(0);

  // Filters
  const [tab, setTab]                 = useState('all');   // all | today | overdue
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterType, setFilterType]       = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [page, setPage]               = useState(1);

  // Modal
  const [modalOpen, setModalOpen]     = useState(false);
  const [editItem, setEditItem]       = useState(null);

  // Debounce
  const debounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const handleSearch = useCallback(v => {
    setSearchTerm(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); setDebouncedSearch(v); }, 400);
  }, []);

  const authFetch = useCallback(async (url, options = {}, signal = null, retry = true) => {
    let token = tokenRef.current;
    if (!token) throw new Error('No access token');
    const res = await fetch(url, {
      ...options, signal, credentials: 'include',
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (res.status === 401 && retry) {
      const tok = await refreshAccessToken();
      if (!tok) throw new Error('Session expired');
      tokenRef.current = tok;
      return authFetch(url, options, signal, false);
    }
    return res;
  }, [refreshAccessToken]);

  // Fetch
  useEffect(() => {
    if (authLoading || !accessToken) return;
    const controller = new AbortController();
    const { signal } = controller;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Build URL
        let endpoint;
        if (tab === 'today')   endpoint = `${API_BASE_URL}/followups/today/`;
        else if (tab === 'overdue') endpoint = `${API_BASE_URL}/followups/overdue/`;
        else {
          const p = {};
          if (debouncedSearch) p.search = debouncedSearch;
          if (filterStatus !== 'all') p.status = filterStatus;
          if (filterType   !== 'all') p.followup_type = filterType;
          if (filterPriority !== 'all') p.priority = filterPriority;
          endpoint = `${API_BASE_URL}/followups/?${new URLSearchParams(p)}`;
        }

        const [fuRes, leadsRes] = await Promise.all([
          authFetch(endpoint, {}, signal),
          initialLoad ? authFetch(`${API_BASE_URL}/leads/`, {}, signal) : Promise.resolve(null),
        ]);

        if (signal.aborted) return;

        if (leadsRes?.ok) {
          const ld = await leadsRes.json();
          const arr = ld.results?.leads || ld.results || [];
          setLeads(arr.map(l => ({ id: l.id, name: l.name, phone: l.phone })));
        }

        if (!fuRes.ok) throw new Error('Failed to fetch follow-ups');
        const data = await fuRes.json();
        const arr  = Array.isArray(data) ? data : (data.results || []);
        setItems(arr);
        setTotalCount(Array.isArray(data) ? arr.length : (data.count || arr.length));
        setInitialLoad(false);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        alert('Failed to load follow-ups. Please try again.');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };
    fetchAll();
    return () => controller.abort();
  }, [authLoading, accessToken, authFetch, tab, debouncedSearch, filterStatus, filterType, filterPriority, page]);

  // Client-side search for today/overdue tabs (API doesn't support params there)
  const visibleItems = useMemo(() => {
    if (tab === 'all') return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter(i =>
      (!q || (i.name || '').toLowerCase().includes(q) || i.phone_number.includes(q)) &&
      (filterStatus   === 'all' || i.status       === filterStatus) &&
      (filterType     === 'all' || i.followup_type === filterType) &&
      (filterPriority === 'all' || i.priority      === filterPriority)
    );
  }, [items, tab, debouncedSearch, filterStatus, filterType, filterPriority]);

  const stats = useMemo(() => ({
    total:    items.length,
    pending:  items.filter(i => i.status === 'pending').length,
    overdue:  items.filter(i => i.is_overdue).length,
    today:    items.filter(i => i.follow_up_date === new Date().toISOString().slice(0, 10)).length,
  }), [items]);

  // CRUD
  const handleSave = async (formData) => {
    const method  = editItem ? 'PUT' : 'POST';
    const url     = editItem
      ? `${API_BASE_URL}/followups/${editItem.id}/`
      : `${API_BASE_URL}/followups/`;
    const res = await authFetch(url, { method, body: JSON.stringify(formData) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err));
    }
    const saved = await res.json();
    if (editItem) {
      setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
    } else {
      setItems(prev => [saved, ...prev]);
      setTotalCount(c => c + 1);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this follow-up? This cannot be undone.')) return;
    const res = await authFetch(`${API_BASE_URL}/followups/${id}/`, { method: 'DELETE' });
    if (!res.ok) { alert('Delete failed'); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    setTotalCount(c => c - 1);
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await authFetch(`${API_BASE_URL}/followups/${id}/`, {
      method: 'PUT', body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) { alert('Update failed'); return; }
    const saved = await res.json();
    setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
  };

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit   = (item) => { setEditItem(item); setModalOpen(true); };

  const clearFilters = () => {
    setSearchTerm(''); setDebouncedSearch('');
    setFilterStatus('all'); setFilterType('all'); setFilterPriority('all');
    setPage(1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-10 text-center text-gray-500">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarClock className="text-white" size={22} />
              </div>
              Follow-Ups
            </h1>
            <p className="text-gray-500 mt-1 ml-[52px]">Track and manage your scheduled follow-ups</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            <Plus size={20} />
            New Follow-Up
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total"   value={totalCount}      color="bg-blue-500"   Icon={CalendarClock} />
          <StatCard label="Pending" value={stats.pending}   color="bg-yellow-500" Icon={Clock}         />
          <StatCard label="Overdue" value={stats.overdue}   color="bg-red-500"    Icon={AlertTriangle} />
          <StatCard label="Today"   value={stats.today}     color="bg-green-500"  Icon={CheckCircle}   />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Tab label="All"     active={tab === 'all'}     count={totalCount}    onClick={() => { setTab('all');     setPage(1); }} />
          <Tab label="Today"   active={tab === 'today'}   count={stats.today}   onClick={() => { setTab('today');   setPage(1); }} />
          <Tab label="Overdue" active={tab === 'overdue'} count={stats.overdue} onClick={() => { setTab('overdue'); setPage(1); }} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg border border-gray-100">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name or phone…"
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-gray-800 placeholder:text-gray-400"
              />
            </div>
            {/* Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Status */}
              <div className="relative">
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="appearance-none w-full px-4 py-3 pr-9 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold text-gray-700 bg-white">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              {/* Type */}
              <div className="relative">
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
                  className="appearance-none w-full px-4 py-3 pr-9 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold text-gray-700 bg-white">
                  <option value="all">All Types</option>
                  <option value="call">Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              {/* Priority */}
              <div className="relative">
                <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }}
                  className="appearance-none w-full px-4 py-3 pr-9 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold text-gray-700 bg-white">
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              {/* Clear */}
              <button onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 font-semibold text-gray-700 hover:text-red-700 transition-all group">
                <Filter size={18} className="group-hover:rotate-12 transition-transform" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results label */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-500">
            {loading ? 'Updating…' : `${visibleItems.length} follow-up${visibleItems.length !== 1 ? 's' : ''}`}
          </p>
          {loading && !initialLoad && (
            <span className="flex items-center gap-2 text-sm text-indigo-600 animate-pulse font-medium">
              <RefreshCw size={14} className="animate-spin" />
              Loading…
            </span>
          )}
        </div>

        {/* Grid */}
        {initialLoad && loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarClock className="text-gray-400" size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No follow-ups found</h3>
            <p className="text-gray-500 mb-6">
              {tab === 'today'   ? "No follow-ups scheduled for today." :
               tab === 'overdue' ? "No overdue follow-ups. Great job!" :
               "Try adjusting your filters or create a new follow-up."}
            </p>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg">
              <Plus size={18} />
              New Follow-Up
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleItems.map(item => (
              <FollowUpCard
                key={item.id}
                item={item}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      <FollowUpModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editItem}
        leads={leads}
      />
    </div>
  );
}
