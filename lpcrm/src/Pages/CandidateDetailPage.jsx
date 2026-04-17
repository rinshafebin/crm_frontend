import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/layouts/Navbar";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Star,
  FileText,
  Download
} from "lucide-react";

export default function CandidateDetailPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchCandidate = async () => {
    try {
      const res = await axios.get(`${API_BASE}/candidates/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCandidate(res.data);
    } catch {
      alert("Failed to load candidate");
      navigate("/candidates");
    }
  };

  useEffect(() => {
    if (accessToken) fetchCandidate();
  }, [accessToken]);

  if (!candidate) return null;

  const openResume = () => {
    if (candidate.resume_url) {
      window.open(candidate.resume_url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate("/candidates")}
          className="flex gap-2 mb-4"
        >
          <ArrowLeft /> Back
        </button>

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h1 className="text-3xl font-bold">{candidate.name}</h1>

          <div className="mt-4 space-y-2 text-gray-700">
            <p><Mail /> {candidate.email}</p>
            <p><Phone /> {candidate.phone}</p>
            <p><Briefcase /> {candidate.position_applied}</p>
            <p><Calendar /> {candidate.interview_date}</p>
            <p><Star /> {candidate.rating}/10</p>
          </div>

          {candidate.resume_url && (
            <button
              onClick={openResume}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg flex gap-2"
            >
              <FileText size={16} />
              View Resume
            </button>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-3">Notes</h2>
          <p>{candidate.notes || "No notes available"}</p>
        </div>
      </div>
    </div>
  );
}
