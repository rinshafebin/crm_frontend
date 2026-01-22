// Components/common/Pagination.jsx - REFACTORED
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange = () => {},
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        icon={ChevronLeft}
        iconPosition="left"
      >
        Previous
      </Button>
      
      <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        icon={ChevronRight}
        iconPosition="right"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;