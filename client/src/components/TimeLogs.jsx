import { useEffect, useState } from "react";
import API from "../api/axios";

export default function TimeLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await API.get("/timelogs");
      setLogs(data);
    };
    fetchLogs();
  }, []);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="mt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Time Logs
          </h2>
        </div>

        {/* Log count badge */}
        {logs.length > 0 && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            {logs.length} {logs.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {/* Empty State */}
      {logs.length === 0 && (
        <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-400">No time logs yet</p>
          <p className="text-xs text-gray-600 mt-1">
            Start tracking to see your logs here
          </p>
        </div>
      )}

      {/* Logs List */}
      <div className="space-y-3">
        {logs.map((log, index) => (
          <div
            key={log._id}
            className="relative group bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl px-5 py-4 shadow-lg hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Top accent line on hover */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Glow blob */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-center justify-between gap-4">
              {/* Left — index + project */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-gray-600 w-5 text-right shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="w-px h-6 bg-white/10 shrink-0" />

                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">
                    Project
                  </p>
                  <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300 truncate">
                    {log.project?.name ?? "—"}
                  </p>
                </div>
              </div>

              {/* Right — duration pill */}
              <div className="shrink-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm font-semibold text-emerald-400">
                  {formatDuration(log.duration)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
