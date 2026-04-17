import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/layouts/Navbar";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Star,
  Eye
} from "lucide-react";

export default function CandidateListPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/candidates/?status=${status}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setCandidates(res.data.results);
    } catch (err) {
      console.error(err);
      alert("Failed to load candidates");
    }
  };

  useEffect(() => {
    if (accessToken) fetchCandidates();
  }, [status, accessToken]);

  const getStatusColor = (status) => {
    switch (status) {
      case "selected":
        return "from-green-100 to-emerald-100 text-green-700";
      case "rejected":
        return "from-red-100 to-rose-100 text-red-700";
      case "interviewed":
        return "from-blue-100 to-indigo-100 text-blue-700";
      default:
        return "from-yellow-100 to-amber-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Candidates</h1>

        {/* Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mb-6 px-4 py-2 border rounded-xl"
        >
          <option value="">All</option>
          <option value="applied">Applied</option>
          <option value="interviewed">Interviewed</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-md p-5 border hover:shadow-lg transition"
            >
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">{c.name}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getStatusColor(
                    c.status
                  )}`}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p className="flex gap-2"><Mail size={16} /> {c.email}</p>
                <p className="flex gap-2"><Phone size={16} /> {c.phone}</p>
                <p className="flex gap-2"><Briefcase size={16} /> {c.position_applied}</p>
                {c.interview_date && (
                  <p className="flex gap-2"><Calendar size={16} /> {c.interview_date}</p>
                )}
                {c.rating && (
                  <p className="flex gap-2"><Star size={16} /> {c.rating}/10</p>
                )}
              </div>

              <button
                onClick={() => navigate(`/candidates/${c.id}`)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                <Eye size={16} /> View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
