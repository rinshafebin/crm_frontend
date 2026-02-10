import React from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';

const IncomingCallModal = ({ isOpen, onClose, callData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-96 overflow-hidden">

        {/* Top band */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Phone size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold mb-1">Incoming Call</h3>
          <p className="text-green-100 text-sm">Answer to start conversation</p>
        </div>

        {/* Caller info */}
        <div className="p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={48} className="text-indigo-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {callData?.leadName || 'Unknown Caller'}
          </h2>
          <p className="text-gray-500 text-sm mb-1">
            {callData?.leadName ? 'Lead in CRM' : 'Not in CRM'}
          </p>
          <p className="text-lg font-semibold text-gray-700 mt-3">
            {callData?.phoneNumber || '—'}
          </p>

          {callData?.program && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Interested in: {callData.program}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 px-8 pb-8">
          <button onClick={() => onClose('rejected')}
            className="flex-1 group bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneOff size={24} />
            </div>
            <span className="text-lg">Decline</span>
          </button>

          <button onClick={() => onClose('accepted')}
            className="flex-1 group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 animate-pulse">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone size={24} />
            </div>
            <span className="text-lg">Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;