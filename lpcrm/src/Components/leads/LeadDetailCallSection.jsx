import React, { useState } from 'react';
import { Phone, PhoneCall, Clock, CheckCircle, XCircle, AlertCircle, Play, Loader } from 'lucide-react';
import { canMakeCall, canViewCallHistory, canPlayRecording, getRoleLabel } from '../../utils/callPermissions';

const MOCK_CALL_HISTORY = [
  { id:1, date:'2024-02-08', time:'14:30', duration:'5m 23s', status:'answered', recordingStatus:'available',   notes:'Discussed program details and pricing.' },
  { id:2, date:'2024-02-07', time:'11:15', duration:'2m 10s', status:'answered', recordingStatus:'processing',  notes:null },
  { id:3, date:'2024-02-06', time:'16:45', duration:'0s',     status:'missed',   recordingStatus:null,          notes:null },
  { id:4, date:'2024-02-05', time:'09:20', duration:'8m 45s', status:'answered', recordingStatus:'available',   notes:'Initial contact – very interested in enrollment.' },
  { id:5, date:'2024-02-04', time:'13:00', duration:'0s',     status:'failed',   recordingStatus:null,          notes:null },
];

const STATUS_BADGE = {
  answered: { cls:'bg-green-100  text-green-700  border-green-200',  Icon:CheckCircle,  label:'Answered' },
  missed:   { cls:'bg-red-100    text-red-700    border-red-200',    Icon:XCircle,      label:'Missed'   },
  failed:   { cls:'bg-gray-100   text-gray-700   border-gray-200',   Icon:AlertCircle,  label:'Failed'   },
  busy:     { cls:'bg-yellow-100 text-yellow-700 border-yellow-200', Icon:AlertCircle,  label:'Busy'     },
};

/**
 * LeadDetailCallSection
 * Placed in the right column of the lead detail page.
 * Respects callPermissions for each role.
 */
const LeadDetailCallSection = ({ lead, userRole = '' }) => {
  const [callStatus,     setCallStatus]     = useState(null);
  const [playingId,      setPlayingId]      = useState(null);

  const allowCall      = canMakeCall(userRole);
  const allowHistory   = canViewCallHistory(userRole);
  const allowRecording = canPlayRecording(userRole);

  const phoneValid = lead?.phone && lead.phone.trim() !== '' && lead.phone !== 'N/A';

  const handleCallNow = async () => {
    if (!phoneValid || callStatus) return;
    const stages = [
      { s:'calling',   d:1500 },
      { s:'ringing',   d:1500 },
      { s:'connected', d:3000 },
      { s:'ended',     d:1500 },
    ];
    for (const { s, d } of stages) {
      setCallStatus(s);
      await new Promise(r => setTimeout(r, d));
    }
    setTimeout(() => setCallStatus(null), 1200);
  };

  // ── No access at all (MEDIA, TRAINER, ACCOUNTS) ──────────────────────────
  if (!allowCall && !allowHistory) {
    return (
      <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="text-orange-400" size={28} />
          </div>
          <p className="text-orange-700 font-bold text-lg">Call Access Restricted</p>
          <p className="text-orange-600 text-sm mt-2">
            {getRoleLabel(userRole)} role does not have access to calling features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Call Action Card ─────────────────────────────────────── */}
      {allowCall && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PhoneCall className="text-green-600" size={22} />
              Call Lead
            </h3>
          </div>

          {/* Phone display */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                <p className="text-lg font-bold text-gray-900">{lead?.phone || 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Live call status */}
          {callStatus && (
            <div className="bg-white rounded-xl p-4 mb-4 border-2 border-green-300">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  callStatus === 'connected' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <PhoneCall size={20} className={`${
                    callStatus === 'connected' ? 'text-green-600' : 'text-yellow-600'
                  } ${callStatus === 'ringing' ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {callStatus === 'calling'   && 'Calling…'}
                    {callStatus === 'ringing'   && 'Ringing…'}
                    {callStatus === 'connected' && 'Connected'}
                    {callStatus === 'ended'     && 'Call Ended'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {callStatus === 'connected' ? 'Call in progress' : 'Please wait'}
                  </p>
                </div>
                {(callStatus === 'calling' || callStatus === 'ringing') && (
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call Now button */}
          <button
            onClick={handleCallNow}
            disabled={!phoneValid || !!callStatus}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
              !phoneValid || callStatus
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            <PhoneCall size={22} className={callStatus ? 'animate-pulse' : ''} />
            {callStatus ? 'Call in Progress…' : 'Call Now'}
          </button>
        </div>
      )}

      {/* ── HR read-only notice ──────────────────────────────────── */}
      {!allowCall && allowHistory && (
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 flex items-center gap-3">
          <AlertCircle className="text-orange-500 shrink-0" size={20} />
          <p className="text-orange-700 text-sm font-medium">
            {getRoleLabel(userRole)} role — call history view only.
          </p>
        </div>
      )}

      {/* ── Call History ─────────────────────────────────────────── */}
      {allowHistory && (
        <div id="call-history" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-blue-600" size={22} />
              Call History
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {MOCK_CALL_HISTORY.length} Calls
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_CALL_HISTORY.map(call => {
              const badge = STATUS_BADGE[call.status] || STATUS_BADGE.failed;
              const { Icon } = badge;

              return (
                <div key={call.id}
                  className="group bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all">

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${badge.cls}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{call.date} at {call.time}</p>
                        <p className="text-sm text-gray-600">Duration: {call.duration}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {call.notes && (
                    <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200 mb-2">
                      <span className="font-semibold">Notes: </span>{call.notes}
                    </p>
                  )}

                  {/* Recording */}
                  {call.recordingStatus === 'processing' && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200">
                      <Loader size={15} className="animate-spin" />
                      <span className="font-medium">Recording processing…</span>
                    </div>
                  )}
                  {call.recordingStatus === 'available' && (
                    allowRecording ? (
                      <button
                        onClick={() => setPlayingId(prev => prev === call.id ? null : call.id)}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 border border-blue-200 hover:border-blue-300 transition-all"
                      >
                        <Play size={15} className={playingId === call.id ? 'animate-pulse' : ''} />
                        {playingId === call.id ? 'Playing…' : 'Play Recording'}
                      </button>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Recording available — insufficient permissions to play</p>
                    )
                  )}
                  {!call.recordingStatus && call.status === 'answered' && (
                    <p className="text-xs text-gray-400 italic">Recording not available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailCallSection;