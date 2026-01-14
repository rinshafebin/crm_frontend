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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">

        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search students by name, email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Course Filter */}
        <select
          value={filterCourse}
          onChange={handleCourseChange}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white
             focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Courses</option>
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
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="inactive">Inactive</option>
        </select>

      </div>
    </div>
  );
});

StudentsSearchFilters.displayName = 'StudentsSearchFilters';

export default StudentsSearchFilters;
