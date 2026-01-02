import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Calendar, FileText, Download, FolderOpen, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('this-month');

  const recentReports = [
    {
      name: 'December 2025 Sales Report',
      type: 'Sales',
      generatedBy: 'John Anderson',
      date: 'Dec 28, 2025',
      size: '2.4 MB'
    },
    {
      name: 'Q4 2025 Performance Analysis',
      type: 'Performance',
      generatedBy: 'Sarah Wilson',
      date: 'Dec 27, 2025',
      size: '3.8 MB'
    },
    {
      name: 'Weekly Lead Report - Week 52',
      type: 'Leads',
      generatedBy: 'Michael Brown',
      date: 'Dec 26, 2025',
      size: '1.2 MB'
    },
    {
      name: 'Student Enrollment - December',
      type: 'Academic',
      generatedBy: 'Emily Davis',
      date: 'Dec 25, 2025',
      size: '1.8 MB'
    },
    {
      name: 'Financial Summary - November',
      type: 'Finance',
      generatedBy: 'David Miller',
      date: 'Dec 01, 2025',
      size: '4.2 MB'
    }
  ];

  const stats = [
    { label: 'Total Reports', value: '342', color: 'bg-blue-500', icon: FolderOpen },
    { label: 'This Month', value: '28', color: 'bg-green-500', icon: TrendingUp },
    { label: 'Scheduled', value: '12', color: 'bg-yellow-500', icon: Clock },
    { label: 'Downloaded', value: '156', color: 'bg-purple-500', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate and download comprehensive reports</p>
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

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Report Period</h3>
                <p className="text-sm text-gray-600">Select date range for report generation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200">
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Report Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Generated By</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentReports.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-gray-400" size={18} />
                          <span className="font-medium text-gray-900">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{report.generatedBy}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.size}</td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium">
                          <Download size={16} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}