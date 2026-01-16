import React, { useEffect, useState } from "react";
import axios from "axios";
import { GraduationCap, UserCheck, CheckCircle, UserX } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StatsCards() {
  const { accessToken, refreshAccessToken } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pausedDropped: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        let token = accessToken || (await refreshAccessToken());
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const res = await axios.get(`${API_BASE_URL}/students/stats/`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          if (res.data.total !== undefined) {
            // Normalize keys to camelCase
            setStats({
              total: res.data.total,
              active: res.data.ACTIVE || 0,
              completed: res.data.COMPLETED || 0,
              pausedDropped: res.data.PAUSED_DROPPED || 0,
            });
          } else if (res.data.results) {
            const students = res.data.results;
            const total = students.length;
            const active = students.filter((s) => s.status === "ACTIVE").length;
            const completed = students.filter((s) => s.status === "COMPLETED").length;
            const pausedDropped = students.filter((s) =>
              ["PAUSED", "DROPPED", "INACTIVE"].includes(s.status)
            ).length;

            setStats({ total, active, completed, pausedDropped });
          }
        } catch (statsError) {
          console.log(
            "Stats endpoint not available, calculating from students list"
          );

          const res = await axios.get(`${API_BASE_URL}/students/`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          const students = res.data.results || res.data;
          const total = students.length;
          const active = students.filter((s) => s.status === "ACTIVE").length;
          const completed = students.filter((s) => s.status === "COMPLETED").length;
          const pausedDropped = students.filter((s) =>
            ["PAUSED", "DROPPED", "INACTIVE"].includes(s.status)
          ).length;

          setStats({ total, active, completed, pausedDropped });
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
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
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse"
          >
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
      <StatCard
        title="Total Students"
        value={stats.total}
        icon={<GraduationCap className="w-7 h-7 text-white" />}
        bgFrom="blue-500"
        bgTo="blue-600"
      />

      {/* Active */}
      <StatCard
        title="Active"
        value={stats.active}
        icon={<UserCheck className="w-7 h-7 text-white" />}
        bgFrom="green-500"
        bgTo="emerald-600"
      />

      {/* Completed */}
      <StatCard
        title="Completed"
        value={stats.completed}
        icon={<CheckCircle className="w-7 h-7 text-white" />}
        bgFrom="purple-500"
        bgTo="indigo-600"
      />

      {/* Paused / Dropped */}
      <StatCard
        title="Paused / Dropped"
        value={stats.pausedDropped}
        icon={<UserX className="w-7 h-7 text-white" />}
        bgFrom="red-500"
        bgTo="red-600"
      />
    </div>
  );
}

// Reusable StatCard component
const StatCard = ({ title, value, icon, bgFrom, bgTo }) => (
  <div className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-3">
          {title}
        </p>
        <h3 className="text-5xl font-bold text-gray-900 mb-4 group-hover:text-gray-900 transition-colors">
          {value}
        </h3>
      </div>
      <div
        className={`w-14 h-14 bg-gradient-to-br from-${bgFrom} to-${bgTo} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>
  </div>
);
