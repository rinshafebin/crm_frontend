import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const LeadsFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterSource,
  setFilterSource,
  filterStaff,
  setFilterStaff,
  staffMembers,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="space-y-4">

        {/* Search Bar */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 text-gray-900 font-medium"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Status</option>
              <option value="enquiry">Enquiry</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="registered">Registered</option>
              <option value="lost">Lost</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="appearance-none w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Source Filter */}
          <div className="relative">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="appearance-none w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Sources</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="website">Website</option>
              <option value="walk_in">Walk-in</option>
              <option value="automation">Automation</option>
              <option value="other">Other</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Staff Filter - Now showing username */}
          <div className="relative">
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="appearance-none w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Staff</option>
              {staffMembers && staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {/* Show username if available, otherwise fallback to first_name last_name */}
                  {staff.username || `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || `Staff #${staff.id}`}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterPriority('all');
              setFilterSource('all');
              setFilterStaff('all');
            }}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:border-red-300 flex items-center justify-center gap-2 transition-all duration-200 font-semibold text-gray-700 hover:text-red-700 group"
          >
            <Filter size={20} className="group-hover:rotate-12 transition-transform" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadsFilters;