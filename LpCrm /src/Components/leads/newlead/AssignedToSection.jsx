// Components/leads/newlead/AssignedToSection.jsx
import React, { useEffect, useState } from 'react';
import { UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AssignedToSection = ({ formData, errors, onChange }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, refreshAccessToken, user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      let token = accessToken;
      if (!token) token = await refreshAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/leads/available-users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      const filteredUsers = filterUsersByRole(data, user?.role);
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAvailableUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsersByRole = (users, userRole) => {
    if (!userRole) return users;


    if (userRole === 'ADM_MANAGER') {
      return users.filter(u => 
        u.role === 'ADM_MANAGER' || 
        u.role === 'ADM_EXEC' || 
        u.role === 'FOE'
      );
    }

    if (userRole === 'FOE' || userRole === 'ADM_EXEC') {
      return users.filter(u => u.id === user?.id);
    }

    return users;
  };


  const getRoleDisplayName = (role) => {
    const roleMap = {
      'ADMIN': 'General Manager',
      'OPS': 'Operations Manager',
      'ADM_MANAGER': 'Admission Manager',
      'ADM_EXEC': 'Admission Executive',
      'CM': 'Center Manager',
      'BDM': 'Business Development Manager',
      'FOE': 'FOE Cum TC',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Assignment</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Assigned To Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Assign To
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={onChange}
            disabled={loading}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
              errors.assignedTo
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          >
            <option value="">
              {loading ? 'Loading users...' : 'Select a staff member'}
            </option>
            
            {availableUsers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.first_name} {staff.last_name} - {getRoleDisplayName(staff.role)}
              </option>
            ))}
          </select>

          {errors.assignedTo && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{errors.assignedTo}</span>
            </div>
          )}

          {!loading && availableUsers.length === 0 && (
            <p className="mt-2 text-sm text-red-600 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                No staff members available for assignment.
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedToSection;