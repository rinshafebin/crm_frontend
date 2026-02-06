import React, { useCallback } from 'react';
import { Search } from 'lucide-react';

const StudentsSearchFilters = React.memo(({
  searchTerm,
  setSearchTerm,
  filterCourse,
  setFilterCourse,
  filterStatus,
  setFilterStatus,
  courses
}) => {
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  const handleCourseChange = useCallback((e) => {
    setFilterCourse(e.target.value);
  }, [setFilterCourse]);

  const handleStatusChange = useCallback((e) => {
    setFilterStatus(e.target.value);
  }, [setFilterStatus]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search students by name, email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Course/Batch Filter */}
        <select
          value={filterCourse}
          onChange={handleCourseChange}
          className="px-4 py-3 border border-gray-200 rounded-xl bg-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                     transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Batches</option>
          {courses.map((course) => (
            <option key={course.value} value={course.value}>
              {course.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={handleStatusChange}
          className="px-4 py-3 border border-gray-200 rounded-xl bg-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                     transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>
    </div>
  );
});

StudentsSearchFilters.displayName = 'StudentsSearchFilters';

export default StudentsSearchFilters;