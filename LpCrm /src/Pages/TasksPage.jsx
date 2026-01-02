import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Search, Plus, Calendar, Clock, User, Flag, CheckCircle, Circle, AlertCircle, ListTodo, Loader, CheckCheck, AlertTriangle } from 'lucide-react';

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const tasks = [
    {
      id: 1,
      title: 'Review student applications',
      description: 'Review and approve pending student applications for the new semester',
      assignedTo: 'Sarah Wilson',
      dueDate: 'Dec 30, 2025',
      priority: 'high',
      status: 'in-progress',
      category: 'Academic'
    },
    {
      id: 2,
      title: 'Prepare monthly report',
      description: 'Compile and prepare the monthly performance report for management',
      assignedTo: 'John Anderson',
      dueDate: 'Dec 31, 2025',
      priority: 'high',
      status: 'pending',
      category: 'Reporting'
    },
    {
      id: 3,
      title: 'Update course curriculum',
      description: 'Update the web development course curriculum with new content',
      assignedTo: 'Michael Brown',
      dueDate: 'Jan 05, 2026',
      priority: 'medium',
      status: 'in-progress',
      category: 'Academic'
    },
    {
      id: 4,
      title: 'Follow up with leads',
      description: 'Contact all new leads from the past week',
      assignedTo: 'Emily Davis',
      dueDate: 'Dec 29, 2025',
      priority: 'high',
      status: 'pending',
      category: 'Sales'
    },
    {
      id: 5,
      title: 'System maintenance',
      description: 'Perform routine system maintenance and updates',
      assignedTo: 'David Miller',
      dueDate: 'Jan 02, 2026',
      priority: 'low',
      status: 'pending',
      category: 'Technical'
    },
    {
      id: 6,
      title: 'Staff training session',
      description: 'Conduct training session for new staff members',
      assignedTo: 'Jessica Wilson',
      dueDate: 'Dec 28, 2025',
      priority: 'medium',
      status: 'completed',
      category: 'HR'
    },
    {
      id: 7,
      title: 'Marketing campaign planning',
      description: 'Plan Q1 marketing campaigns and budget allocation',
      assignedTo: 'Amanda Thompson',
      dueDate: 'Jan 10, 2026',
      priority: 'medium',
      status: 'pending',
      category: 'Marketing'
    },
    {
      id: 8,
      title: 'Client meeting preparation',
      description: 'Prepare presentation materials for upcoming client meeting',
      assignedTo: 'Robert Johnson',
      dueDate: 'Dec 29, 2025',
      priority: 'high',
      status: 'in-progress',
      category: 'Business'
    }
  ];

  const stats = [
    { label: 'Total Tasks', value: '127', color: 'bg-blue-500', icon: ListTodo },
    { label: 'In Progress', value: '45', color: 'bg-yellow-500', icon: Loader },
    { label: 'Completed', value: '68', color: 'bg-green-500', icon: CheckCheck },
    { label: 'Overdue', value: '14', color: 'bg-red-500', icon: AlertTriangle }
  ];

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };

  const statusIcons = {
    pending: <Circle className="text-gray-400" size={20} />,
    'in-progress': <AlertCircle className="text-yellow-500" size={20} />,
    completed: <CheckCircle className="text-green-500" size={20} />
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tasks Management</h1>
              <p className="text-gray-600 mt-2">Organize and track all your tasks</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200">
              <Plus size={20} />
              Create New Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <IconComponent className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Task Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {statusIcons[task.status]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        {task.assignedTo}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {task.dueDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag size={16} className="text-gray-400" />
                        {task.category}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 text-sm font-medium">
                    View Details
                  </button>
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium">
                    Edit
                  </button>
                  {task.status !== 'completed' && (
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors duration-200">Previous</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors duration-200">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors duration-200">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}