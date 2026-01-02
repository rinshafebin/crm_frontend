import React from 'react';

const Pagination = React.memo(() => {
  return (
    <div className="mt-8 flex items-center justify-center">
      <div className="flex gap-2">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors duration-200">
          Previous
        </button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
          1
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors duration-200">
          2
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors duration-200">
          3
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors duration-200">
          Next
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;