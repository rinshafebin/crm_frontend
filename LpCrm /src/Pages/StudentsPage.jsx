import React, { useState } from 'react';
import Navbar from '../Components/layouts/Navbar';
import { Plus } from 'lucide-react';
import StatsCards from '../Components/students/StatsCards'
import SearchFilters from '../Components/students/SearchFilters'
import StudentGrid from '../Components/students/StudentGrid'
import Pagination from '../Components/students/Pagination'

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const students = [
    {
      id: 1,
      name: 'Alex Martinez',
      email: 'alex.martinez@email.com',
      phone: '+1 (555) 111-1111',
      course: 'Web Development',
      enrollmentDate: 'Sep 01, 2025',
      status: 'active',
      progress: 75,
      grade: 'A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    {
      id: 2,
      name: 'Sophia Chen',
      email: 'sophia.chen@email.com',
      phone: '+1 (555) 222-2222',
      course: 'Data Science',
      enrollmentDate: 'Sep 05, 2025',
      status: 'active',
      progress: 88,
      grade: 'A+',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia'
    },
    {
      id: 3,
      name: 'Ethan Parker',
      email: 'ethan.parker@email.com',
      phone: '+1 (555) 333-3333',
      course: 'Mobile Development',
      enrollmentDate: 'Aug 28, 2025',
      status: 'active',
      progress: 62,
      grade: 'B+',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan'
    },
    {
      id: 4,
      name: 'Olivia Brown',
      email: 'olivia.brown@email.com',
      phone: '+1 (555) 444-4444',
      course: 'UI/UX Design',
      enrollmentDate: 'Sep 10, 2025',
      status: 'active',
      progress: 45,
      grade: 'B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia'
    },
    {
      id: 5,
      name: 'Noah Williams',
      email: 'noah.williams@email.com',
      phone: '+1 (555) 555-5555',
      course: 'Cloud Computing',
      enrollmentDate: 'Aug 20, 2025',
      status: 'completed',
      progress: 100,
      grade: 'A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah'
    },
    {
      id: 6,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+1 (555) 666-6666',
      course: 'Cybersecurity',
      enrollmentDate: 'Sep 15, 2025',
      status: 'inactive',
      progress: 30,
      grade: 'C',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    }
  ];

  const courses = ['Web Development', 'Data Science', 'Mobile Development', 'UI/UX Design', 'Cloud Computing', 'Cybersecurity'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
              <p className="text-gray-600 mt-2">Manage student enrollments and track progress</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200">
              <Plus size={20} />
              Add New Student
            </button>
          </div>
        </div>

        <StatsCards />

        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCourse={filterCourse}
          setFilterCourse={setFilterCourse}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          courses={courses}
        />

        <StudentGrid students={students} />

        <Pagination />
      </div>
    </div>
  );
}