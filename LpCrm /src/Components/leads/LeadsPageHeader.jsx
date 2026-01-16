import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadsPageHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Leads Management
            </h1>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Manage and track all your leads with powerful insights
          </p>
        </div>

        <button
          onClick={() => navigate('/addnewlead')}
          className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10">Add New Lead</span>
          <Sparkles size={16} className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

export default LeadsPageHeader;