export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'No date';
  
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
};

/**
 * Format a task due date/deadline to a readable format
 * Shows both date and relative time
 */
export const formatTaskTime = (dateString) => {
  if (!dateString) return 'No deadline';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Format options for the date
  const dateOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  // Calculate difference in days
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format the date string
  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
  
  // Add relative time indicator
  let relativeTime = '';
  if (diffDays < 0) {
    relativeTime = ` (${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue)`;
  } else if (diffDays === 0) {
    relativeTime = ' (Today)';
  } else if (diffDays === 1) {
    relativeTime = ' (Tomorrow)';
  } else if (diffDays <= 7) {
    relativeTime = ` (in ${diffDays} days)`;
  }
  
  return `${formattedDate} at ${formattedTime}${relativeTime}`;
};

/**
 * Format a complete date and time in a readable format
 * Used for stats and other detailed displays
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleString('en-US', options);
};

/**
 * Format a date only (no time)
 * Used for simple date displays
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get color class based on task priority
 */
export const getPriorityColor = (priority) => {
  const colors = {
    'HIGH': 'text-red-600 bg-red-100',
    'MEDIUM': 'text-yellow-600 bg-yellow-100',
    'LOW': 'text-green-600 bg-green-100'
  };
  return colors[priority?.toUpperCase()] || 'text-gray-600 bg-gray-100';
};

/**
 * Get status color class
 */
export const getStatusColor = (status) => {
  const colors = {
    'COMPLETED': 'text-green-600 bg-green-100',
    'PENDING': 'text-yellow-600 bg-yellow-100',
    'IN_PROGRESS': 'text-blue-600 bg-blue-100',
    'CANCELLED': 'text-red-600 bg-red-100'
  };
  return colors[status?.toUpperCase()] || 'text-gray-600 bg-gray-100';
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

/**
 * Sort tasks by due date (earliest first)
 */
export const sortTasksByDueDate = (tasks) => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.due_date || a.deadline);
    const dateB = new Date(b.due_date || b.deadline);
    return dateA - dateB;
  });
};