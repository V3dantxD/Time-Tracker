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

  const formatTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Group logs by calendar day
  const grouped = logs.reduce((acc, log) => {
    const key = formatDate(log.startTime);
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  return (
    <div className="mt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Time Logs</h2>
        </div>

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
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-400">No time logs yet</p>
          <p className="text-xs text-gray-600 mt-1">Start tracking to see your logs here</p>
        </div>
      )}

      {/* Grouped Logs */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([dateLabel, dayLogs]) => (
          <div key={dateLabel}>
            {/* Day separator */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{dateLabel}</span>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-gray-600">
                {formatDuration(dayLogs.reduce((s, l) => s + (l.duration || 0), 0))} total
              </span>
            </div>

            <div className="space-y-2">
              {dayLogs.map((log, index) => (
                <div
                  key={log._id}
                  className="relative group bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3.5 shadow-lg hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* Top accent on hover */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="flex items-center justify-between gap-4">
                    {/* Left — project + task */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Index */}
                      <span className="text-xs font-mono text-gray-600 w-5 text-right shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="w-px h-8 bg-white/10 shrink-0" />

                      <div className="min-w-0">
                        {/* Project name */}
                        <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300 truncate">
                          {log.project?.name ?? "—"}
                        </p>
                        {/* Task name (if present) */}
                        {log.task?.title && (
                          <p className="text-xs text-teal-400/80 mt-0.5 truncate flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 11 12 14 22 4" />
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            {log.task.title}
                          </p>
                        )}
                        {/* Time range */}
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {formatTime(log.startTime)}
                          {log.endTime && ` — ${formatTime(log.endTime)}`}
                        </p>
                      </div>
                    </div>

                    {/* Right — duration + productivity */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-sm font-semibold text-emerald-400">
                          {formatDuration(log.duration)}
                        </span>
                      </div>
                      {/* Productivity score badge */}
                      {log.productivityScore !== null && log.productivityScore !== undefined && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                          ${log.productivityScore >= 70
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : log.productivityScore >= 40
                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                          {log.productivityScore}% productive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
