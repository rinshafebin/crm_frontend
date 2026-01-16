import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const LeadsFilters = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search leads by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 text-gray-900 font-medium"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-6 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-gray-50 min-w-[180px]"
          >
            <option value="all">All Status</option>
            <option value="enquiry">Enquiry</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          <SlidersHorizontal className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>

        <button className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 flex items-center gap-2 transition-all duration-200 font-semibold text-gray-700 hover:text-blue-700 group">
          <Filter size={20} className="group-hover:rotate-12 transition-transform" />
          More Filters
        </button>
      </div>
    </div>
  );
};

export default LeadsFilters;