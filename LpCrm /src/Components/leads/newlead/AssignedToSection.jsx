import React, { useState, useEffect } from 'react';
import { UserCircle, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AssignedToSection = React.memo(({ formData, errors, onChange }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, refreshAccessToken } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const ALLOWED_ROLES = [
    'ADM_MANAGER',      
    'ADM_EXEC',         
    'FOE',              
    'CM',              
    'BDM',             
  ];

  const formatRole = (role) => {
    const roleMap = {
      'ADM_MANAGER': 'Admission Manager',
      'ADM_EXEC': 'Admission Executive',
      'FOE': 'Front Office Executive',
      'CM': 'Center Manager',
      'BDM': 'Business Development Manager',
    };
    return roleMap[role] || role;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        let token = accessToken;
        if (!token) {
          token = await refreshAccessToken();
        }
        if (!token) {
          console.error('No access token available');
          setLoading(false);
          return;
        }

        // Use the /staff/ endpoint and filter client-side for now
        // In production, you might want to use /leads/available-users/
        const response = await fetch(`${API_BASE_URL}/staff/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();
        
        // Filter to only show sales/admission roles
        const filteredEmployees = (data.results || data).filter(emp => 
          emp.is_active && ALLOWED_ROLES.includes(emp.role)
        );
        
        // Sort by role priority, then by name
        const sortedEmployees = filteredEmployees.sort((a, b) => {
          const roleIndexA = ALLOWED_ROLES.indexOf(a.role);
          const roleIndexB = ALLOWED_ROLES.indexOf(b.role);
          
          if (roleIndexA !== roleIndexB) {
            return roleIndexA - roleIndexB;
          }
          
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setEmployees(sortedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [accessToken, refreshAccessToken, API_BASE_URL]);

  return (
    <div className="mb-6 sm:mb-8 pt-6 sm:pt-8 border-t border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Users size={20} className="text-indigo-600" />
        Assignment
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Assign this lead to a sales or admission team member
      </p>

      <div className="grid grid-cols-1 gap-4">
        {/* Assigned To Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <UserCircle size={16} className="text-gray-400" />
            Assign To
          </label>
          
          {loading ? (
            <div className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm sm:text-base">
              Loading team members...
            </div>
          ) : employees.length === 0 ? (
            <div className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle size={16} />
                <span className="text-sm sm:text-base">No sales team members available</span>
              </div>
            </div>
          ) : (
            <select
              name="assignedTo"
              value={formData.assignedTo || ''}
              onChange={onChange}
              className={`w-full px-3 sm:px-4 py-2 border ${
                errors.assignedTo ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base`}
            >
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name} - {formatRole(employee.role)}
                </option>
              ))}
            </select>
          )}
          
          {errors.assignedTo && (
            <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>
          )}
        </div>
      </div>
    </div>
  );
});

AssignedToSection.displayName = 'AssignedToSection';

export default AssignedToSection;