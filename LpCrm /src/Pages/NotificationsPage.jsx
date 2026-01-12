import React, { useState, useMemo, useCallback } from 'react';
import Navbar from '../Components/layouts/Navbar';
import NotificationsHeader from '../Components/notifications/NotificationsHeader';
import NotificationsStats from '../Components/notifications/NotificationsStats';
import NotificationsFilter from '../Components/notifications/NotificationsFilter';
import NotificationItem from '../Components/notifications/NotificationItem';
import { Bell, Users, AlertCircle, Calendar, CheckCheck, FileText, Info, Mail, CheckCircle } from 'lucide-react';

const initialNotifications = [
  { id: 1, type: 'lead', title: 'New Lead Registered', message: 'John Doe has registered as a new lead for Web Development course', time: '5 mins ago', read: false, icon: Users, color: 'bg-blue-500' },
  { id: 2, type: 'task', title: 'Task Deadline Approaching', message: 'Review student applications - Due tomorrow at 5:00 PM', time: '15 mins ago', read: false, icon: AlertCircle, color: 'bg-orange-500' },
  { id: 3, type: 'student', title: 'Student Enrollment Complete', message: 'Sarah Wilson has completed enrollment in Data Science program', time: '1 hour ago', read: false, icon: CheckCircle, color: 'bg-green-500' },
  { id: 4, type: 'report', title: 'Monthly Report Generated', message: 'December 2025 sales report is ready for download', time: '2 hours ago', read: true, icon: FileText, color: 'bg-purple-500' },
  { id: 5, type: 'system', title: 'System Maintenance Scheduled', message: 'System maintenance scheduled for Jan 2, 2026 at 2:00 AM', time: '3 hours ago', read: true, icon: Info, color: 'bg-gray-500' },
  { id: 6, type: 'staff', title: 'New Staff Member Added', message: 'Jessica Wilson has been added to the Marketing team', time: '5 hours ago', read: true, icon: Users, color: 'bg-indigo-500' },
  { id: 7, type: 'lead', title: 'Lead Converted', message: 'Michael Brown has been converted to a student', time: '6 hours ago', read: true, icon: CheckCircle, color: 'bg-green-500' },
  { id: 8, type: 'task', title: 'Task Completed', message: 'Staff training session has been marked as completed', time: '8 hours ago', read: true, icon: CheckCircle, color: 'bg-green-500' },
  { id: 9, type: 'email', title: 'New Email Campaign', message: 'Q1 Marketing campaign has been sent to 2,500 contacts', time: 'Yesterday', read: true, icon: Mail, color: 'bg-pink-500' },
  { id: 10, type: 'event', title: 'Upcoming Meeting', message: 'Client meeting scheduled for Dec 30, 2025 at 3:00 PM', time: 'Yesterday', read: true, icon: Calendar, color: 'bg-yellow-500' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterType, setFilterType] = useState('all');

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAsRead = useCallback((id) => {
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(notifications => notifications.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const filteredNotifications = useMemo(() => {
    if (filterType === 'all') return notifications;
    if (filterType === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filterType);
  }, [notifications, filterType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <NotificationsHeader 
          unreadCount={unreadCount} 
          markAllAsRead={markAllAsRead} 
          clearAll={clearAll} 
        />
        <NotificationsStats notifications={notifications} unreadCount={unreadCount} />
        <NotificationsFilter filterType={filterType} setFilterType={setFilterType} />
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                markAsRead={markAsRead}
                deleteNotification={deleteNotification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
