import React, { useEffect, useState } from "react";
import axios from "axios";
import { GraduationCap, UserCheck, CheckCircle, UserX } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ label, value, color, Icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  </div>
);

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
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Always render the cards, even with 0 values
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        label="Total Students" 
        value={stats.total} 
        color="bg-blue-500" 
        Icon={GraduationCap} 
      />
      <StatCard 
        label="Active" 
        value={stats.active} 
        color="bg-green-500" 
        Icon={UserCheck} 
      />
      <StatCard 
        label="Completed" 
        value={stats.completed} 
        color="bg-purple-500" 
        Icon={CheckCircle} 
      />
      <StatCard 
        label="Paused / Dropped" 
        value={stats.inactive} 
        color="bg-red-500" 
        Icon={UserX} 
      />
    </div>
  );
}