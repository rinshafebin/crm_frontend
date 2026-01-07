import React, { useState } from 'react';
import { Calendar, User, Flag, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TaskCreationForm() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignTo: '',
    priority: 'Medium',
    deadline: ''
  });

  const teamMembers = [
    'Ashwathy Sudharsanan - Admission Executive',
    'shahida - Admission Manager',
    'stephy roby - Trainer',
    'Manu M - Human Resources',
    'Lathika - Center Manager',
    'anusree - Admission Manager',
    'aneeta bernad - Processing Executive',
    'jobitha philipose - Admission Executive',
    'Navya Rajgopal - Operations Manager',
    'aleena shaji - Admission Manager',
    'Amina Babu - Admission Executive',
    'ayilya - FOE Cum TC',
    'sana husain - Admission Executive',
    'Roni Jose - Trainer',
    'jyothi K.S - Admission Manager',
    'lifeplanner media - Media Team',
    'Megha Jayaprakasan - Trainer',
    'Sujin C Cherian - General Manager',
    'shahida Beevi p - Admission Manager',
    'elizit - FOE Cum TC',
    'Akhil Alocious - BDM',
    'ishi elizabeth - Trainer'
  ];

  const priorities = [
    { value: 'Low', color: 'bg-green-50 border-green-300 text-green-700', icon: '○' },
    { value: 'Medium', color: 'bg-blue-50 border-blue-300 text-blue-700', icon: '◐' },
    { value: 'High', color: 'bg-orange-50 border-orange-300 text-orange-700', icon: '◉' },
    { value: 'Urgent', color: 'bg-red-50 border-red-300 text-red-700', icon: '⬤' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Task created:', formData);
    alert('Task created successfully!');
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      assignTo: '',
      priority: 'Medium',
      deadline: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Create New Task</h1>
            <p className="text-slate-600">Fill in the details to create a new task for your team</p>
          </div>
        </div>
        
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                placeholder="Enter a clear and concise task title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="5"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-900"
                placeholder="Provide detailed information about the task objectives and requirements"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Assign To */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User className="w-4 h-4 text-indigo-600" />
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.assignTo}
                  onChange={(e) => setFormData({...formData, assignTo: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-10 text-slate-900"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 1rem center'
                  }}
                >
                  <option value="">Select team member</option>
                  {teamMembers.map((member, index) => (
                    <option key={index} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                <Flag className="w-4 h-4 text-indigo-600" />
                Priority Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorities.map((priority) => (
                  <label
                    key={priority.value}
                    className={`relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.priority === priority.value
                        ? priority.color + ' shadow-md scale-105'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="absolute opacity-0"
                    />
                    <span className="text-lg">{priority.icon}</span>
                    <span className="font-semibold text-sm">{priority.value}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-8 py-6 flex items-center justify-end gap-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}