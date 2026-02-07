import React from 'react';
import { Search, Filter, SlidersHorizontal, UserCheck, Users, Activity, X } from 'lucide-react';

const LeadsFilters = ({ 
  searchInput,
  setSearchInput, 
  filterStatus, 
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterSource,
  setFilterSource,
  filterStaff,
  setFilterStaff,
  filterSubStaff,
  setFilterSubStaff,
  filterProcessingStatus,
  setFilterProcessingStatus,
  staffMembers,
  onClearAll
}) => {
  // Check if any filters are active
  const hasActiveFilters = searchInput || 
    filterStatus !== 'all' || 
    filterPriority !== 'all' || 
    filterSource !== 'all' || 
    filterStaff !== 'all' || 
    filterSubStaff !== 'all' || 
    filterProcessingStatus !== 'all';

  // Get employee name by ID
  const getEmployeeName = (id) => {
    const employee = staffMembers.find(s => s.id === parseInt(id));
    return employee ? `${employee.first_name} ${employee.last_name}` : '';
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="space-y-4">
        {/* Search Bar with Debounce Indicator */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or program (type and wait)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 text-gray-900 font-medium"
          />
          {searchInput && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                Searching...
              </span>
              <button
                onClick={() => setSearchInput('')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear search"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Primary Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Status</label>
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
            <SlidersHorizontal className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Priority</label>
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
            <SlidersHorizontal className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Source Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Source</label>
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
            <SlidersHorizontal className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Processing Status Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Processing</label>
            <select
              value={filterProcessingStatus}
              onChange={(e) => setFilterProcessingStatus(e.target.value)}
              className="appearance-none w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Processing</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <Activity className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Assignment Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Primary Assignment Filter - By Employee Name */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5">
              <UserCheck size={14} className="text-indigo-600" />
              <span className="text-xs font-bold text-gray-600 uppercase">Primary Assigned To</span>
            </div>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="appearance-none w-full px-4 py-3 pr-10 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-indigo-50"
            >
              <option value="all">All Primary Staff</option>
              <option value="unassigned">🚫 Unassigned</option>
              {staffMembers && staffMembers.length > 0 && (
                <>
                  <option disabled>──────────</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      👤 {staff.first_name} {staff.last_name}
                    </option>
                  ))}
                </>
              )}
            </select>
            <SlidersHorizontal className="absolute right-3 bottom-3 text-indigo-400 pointer-events-none" size={18} />
          </div>

          {/* Sub Assignment Filter - By Employee Name */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5">
              <Users size={14} className="text-purple-600" />
              <span className="text-xs font-bold text-gray-600 uppercase">Sub Assigned To</span>
            </div>
            <select
              value={filterSubStaff}
              onChange={(e) => setFilterSubStaff(e.target.value)}
              className="appearance-none w-full px-4 py-3 pr-10 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer font-semibold text-gray-700 bg-white hover:bg-purple-50"
            >
              <option value="all">All Sub Staff</option>
              <option value="unassigned">🚫 Unassigned</option>
              {staffMembers && staffMembers.length > 0 && (
                <>
                  <option disabled>──────────</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      👤 {staff.first_name} {staff.last_name}
                    </option>
                  ))}
                </>
              )}
            </select>
            <SlidersHorizontal className="absolute right-3 bottom-3 text-purple-400 pointer-events-none" size={18} />
          </div>

          {/* Clear All Filters Button */}
          <div className="flex items-end">
            <button 
              onClick={onClearAll}
              disabled={!hasActiveFilters}
              className={`w-full px-4 py-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-semibold ${
                hasActiveFilters
                  ? 'border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:border-red-300 text-gray-700 hover:text-red-700 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Filter size={20} className={hasActiveFilters ? 'group-hover:rotate-12 transition-transform' : ''} />
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500 uppercase">Active Filters:</span>
              
              {searchInput && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Search size={12} />
                  Search: "{searchInput}"
                  <button 
                    onClick={() => setSearchInput('')} 
                    className="hover:bg-blue-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Status: {filterStatus}
                  <button 
                    onClick={() => setFilterStatus('all')} 
                    className="hover:bg-purple-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterPriority !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  Priority: {filterPriority}
                  <button 
                    onClick={() => setFilterPriority('all')} 
                    className="hover:bg-yellow-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterSource !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Source: {filterSource}
                  <button 
                    onClick={() => setFilterSource('all')} 
                    className="hover:bg-green-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterProcessingStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <Activity size={12} />
                  Processing: {filterProcessingStatus.replace('_', ' ')}
                  <button 
                    onClick={() => setFilterProcessingStatus('all')} 
                    className="hover:bg-orange-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterStaff !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  <UserCheck size={12} />
                  Primary: {filterStaff === 'unassigned' ? 'Unassigned' : getEmployeeName(filterStaff)}
                  <button 
                    onClick={() => setFilterStaff('all')} 
                    className="hover:bg-indigo-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterSubStaff !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <Users size={12} />
                  Sub: {filterSubStaff === 'unassigned' ? 'Unassigned' : getEmployeeName(filterSubStaff)}
                  <button 
                    onClick={() => setFilterSubStaff('all')} 
                    className="hover:bg-purple-200 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsFilters;