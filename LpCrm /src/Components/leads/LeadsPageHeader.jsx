import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadsPageHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all your leads</p>
        </div>

        <button
          onClick={() => navigate('/addnewlead')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
        >
          <Plus size={20} />
          Add New Lead
        </button>
      </div>
    </div>
  );
};

export default LeadsPageHeader;
