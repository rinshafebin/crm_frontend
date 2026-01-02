import React from 'react';
import { Filter } from 'lucide-react';

const filterButtons = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Leads', value: 'lead' },
  { label: 'Tasks', value: 'task' },
  { label: 'Students', value: 'student' },
  { label: 'Reports', value: 'report' },
];

export default React.memo(({ filterType, setFilterType }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
    <div className="flex items-center gap-2 overflow-x-auto">
      <Filter className="text-gray-400 flex-shrink-0" size={20} />
      {filterButtons.map(btn => (
        <button
          key={btn.value}
          onClick={() => setFilterType(btn.value)}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
            filterType === btn.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  </div>
));
