import React, { useState, useRef } from 'react';
import { Plus, Sparkles, Upload, X, CheckCircle, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BulkUploadModal = ({ onClose, authFetch }) => {
  const fileInputRef = useRef(null);
  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);   
  const [error, setError]         = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected || null);
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authFetch(`${API_BASE_URL}/leads/bulk-upload/`, {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets multipart boundary automatically
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed. Please try again.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bulk Upload Leads</h2>
              <p className="text-indigo-100 text-sm">Upload an Excel file to import multiple leads</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Required columns info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm font-semibold mb-2">Required Excel columns:</p>
            <div className="flex flex-wrap gap-2">
              {['name', 'phone', 'source', 'assigned_to'].map(col => (
                <span key={col} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold font-mono">{col}</span>
              ))}
            </div>
            <p className="text-blue-600 text-xs mt-2">
              Optional: <span className="font-mono">email, status, priority, program, location</span>
            </p>
            <p className="text-blue-600 text-xs mt-1">
              <strong>assigned_to</strong> must be the staff member's username. Max file size: 5 MB.
            </p>
          </div>

          {/* Drop zone */}
          {!result && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                file
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet size={24} className="text-indigo-600" />
                  </div>
                  <p className="font-bold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="text-xs text-red-500 hover:text-red-700 underline mt-1"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Drop your Excel file here</p>
                    <p className="text-sm">or click to browse (.xlsx, .xls)</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle size={22} className="text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{result.success_count}</p>
                  <p className="text-sm text-green-600 font-medium">Leads imported</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${
                  result.failed_count > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <AlertCircle size={22} className={`mx-auto mb-1 ${result.failed_count > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                  <p className={`text-2xl font-bold ${result.failed_count > 0 ? 'text-red-700' : 'text-gray-500'}`}>{result.failed_count}</p>
                  <p className={`text-sm font-medium ${result.failed_count > 0 ? 'text-red-600' : 'text-gray-500'}`}>Failed rows</p>
                </div>
              </div>

              {/* Failed rows detail */}
              {result.failed_rows && result.failed_rows.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <p className="text-red-800 font-semibold text-sm mb-2">Failed rows:</p>
                  <div className="space-y-2">
                    {result.failed_rows.map((r, i) => (
                      <div key={i} className="text-xs bg-white rounded-lg p-2 border border-red-100">
                        <span className="font-bold text-red-700">Row {r.row}: </span>
                        <span className="text-red-600">
                          {r.error || (r.errors ? JSON.stringify(r.errors) : 'Unknown error')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload another */}
              <button
                onClick={reset}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-all"
              >
                Upload another file
              </button>
            </div>
          )}

          {/* Actions */}
          {!result && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !file || uploading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Leads
                  </>
                )}
              </button>
            </div>
          )}

          {result && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const LeadsPageHeader = () => {
  const navigate = useNavigate();
  const { accessToken, refreshAccessToken } = useAuth();
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Reuse the same authFetch pattern from LeadsPage
  const authFetch = async (url, options = {}, retry = true) => {
    if (!accessToken) throw new Error('No access token');
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 401 && retry) {
      const tok = await refreshAccessToken();
      if (!tok) throw new Error('Session expired');
      return authFetch(url, options, false);
    }
    return res;
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Leads Management
              </h1>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Manage and track all your leads with powerful insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk Upload */}
            <button
              onClick={() => setShowBulkModal(true)}
              className="group relative bg-white border-2 border-indigo-300 hover:border-indigo-500 text-indigo-600 hover:text-indigo-700 px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
              <span>Bulk Upload</span>
            </button>

            {/* Add New Lead */}
            <button
              onClick={() => navigate('/addnewlead')}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Add New Lead</span>
              <Sparkles size={16} className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          authFetch={authFetch}
        />
      )}
    </>
  );
};

export default LeadsPageHeader;
