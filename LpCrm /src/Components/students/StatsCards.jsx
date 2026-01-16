import React, { useEffect, useState } from "react";
import axios from "axios";
import { GraduationCap, UserCheck, CheckCircle, UserX } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StatsCards() {
  const { accessToken, refreshAccessToken } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        let token = accessToken || await refreshAccessToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Try to fetch from stats endpoint first
        try {
          const res = await axios.get(`${API_BASE_URL}/students/stats/`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });

          if (res.data.total !== undefined) {
            setStats(res.data);
          } else if (res.data.results) {
            const students = res.data.results;
            const total = students.length;
            const active = students.filter(s => s.status === "ACTIVE").length;
            const completed = students.filter(s => s.status === "COMPLETED").length;
            const inactive = students.filter(s => ["PAUSED", "DROPPED", "INACTIVE"].includes(s.status)).length;
            
            setStats({ total, active, completed, inactive });
          }
        } catch (statsError) {
          // If stats endpoint doesn't exist, calculate from students list
          console.log("Stats endpoint not available, calculating from students list");
          
          const res = await axios.get(`${API_BASE_URL}/students/`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });

          const students = res.data.results || res.data;
          const total = students.length;
          const active = students.filter(s => s.status === "ACTIVE").length;
          const completed = students.filter(s => s.status === "COMPLETED").length;
          const inactive = students.filter(s => ["PAUSED", "DROPPED", "INACTIVE"].includes(s.status)).length;
          
          setStats({ total, active, completed, inactive });
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Keep default stats of 0
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [accessToken, refreshAccessToken]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Students */}
      <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-3">Total Students</p>
            <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
              {stats.total}
            </h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Active */}
      <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-3">Active</p>
            <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
              {stats.active}
            </h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <UserCheck className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-3">Completed</p>
            <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
              {stats.completed}
            </h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Paused / Dropped */}
      <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-red-200 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-3">Paused / Dropped</p>
            <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">
              {stats.inactive}
            </h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <UserX className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}