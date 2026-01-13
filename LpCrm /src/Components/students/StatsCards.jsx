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
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      let token = accessToken || await refreshAccessToken();
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/students/?page_size=10000`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const students = res.data.results;

      const total = students.length;
      const active = students.filter(s => s.status === "ACTIVE").length;
      const completed = students.filter(s => s.status === "COMPLETED").length;
      const inactive = students.filter(s => ["PAUSED", "DROPPED"].includes(s.status)).length;

      setStats({ total, active, completed, inactive });
    };

    loadStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard label="Total Students" value={stats.total} color="bg-blue-500" Icon={GraduationCap} />
      <StatCard label="Active" value={stats.active} color="bg-green-500" Icon={UserCheck} />
      <StatCard label="Completed" value={stats.completed} color="bg-purple-500" Icon={CheckCircle} />
      <StatCard label="Paused / Dropped" value={stats.inactive} color="bg-red-500" Icon={UserX} />
    </div>
  );
}
