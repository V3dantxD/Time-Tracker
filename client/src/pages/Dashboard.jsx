import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../components/Timer";
import API from "../api/axios";
import TimeLogs from "../components/TimeLogs";
import Stats from "../components/Stats";
import ProjectCard from "../components/ProjectCard";
import ScreenMonitor from "../components/ScreenMonitor";
import { AuthContext } from "../context/AuthContext";

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [attendance, setAttendance] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Attendance check-in on mount
  useEffect(() => {
    const checkIn = async () => {
      try {
        const { data } = await API.post("/attendance/checkin");
        setAttendance(data);
      } catch {
        /* already checked in today — no-op */
      }
    };
    if (user && user.role !== "admin") checkIn();

    // Check-out on unload
    const handleUnload = () => {
      navigator.sendBeacon &&
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/attendance/checkout`,
        );
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [user]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await API.get("/projects");
      setProjects(data);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await API.get("/timelogs/stats");
      setStats(data);
    };
    fetchStats();
  }, []);

  const formatTime = (isoStr) => {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8 space-y-10">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
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
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
      </div>

      {/* Attendance Status Banner */}
      {attendance && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <p className="text-sm text-emerald-300 font-medium">
            Checked in at{" "}
            <span className="text-white">{formatTime(attendance.checkIn)}</span>
            {attendance.status === "late" && (
              <span className="ml-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2 py-0.5">
                Late
              </span>
            )}
          </p>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today */}
        <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
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
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Today
            </p>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatDuration(stats.todayTime || 0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">tracked today</p>
        </div>

        {/* This Week */}
        <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-teal-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              This Week
            </p>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatDuration(stats.weeklyTime || 0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">tracked this week</p>
        </div>
      </div>

      {/* Projects Section */}
      {projects.length > 0 && (
        <div className="space-y-4">
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
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Projects
              </h2>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Timer */}
      <Timer />

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Screen Monitoring Widget */}
      <ScreenMonitor />

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Time Logs + Stats */}
      <TimeLogs />
      <Stats />
    </div>
  );
}

// import { useEffect, useState } from "react";
// import Timer from "../components/Timer";
// import API from "../api/axios";
// import TimeLogs from "../components/TimeLogs";
// import Stats from "../components/Stats";

// export default function Dashboard() {
//   const [projects, setProjects] = useState([]);
//   const [stats, setStats] = useState({});

//   useEffect(() => {
//     const fetchProjects = async () => {
//       const { data } = await API.get("/projects");
//       setProjects(data);
//     };

//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     const fetchStats = async () => {
//       const { data } = await API.get("/timelogs/stats");
//       setStats(data);
//     };

//     fetchStats();
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl mb-4">Dashboard</h1>

//       {projects.map((p) => (
//         <div key={p._id} className="border p-4 mb-2">
//           <h2>{p.name}</h2>
//           <p>{p.description}</p>
//         </div>
//       ))}

//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <div className="p-4 border rounded">
//           <h3>Today</h3>
//           <p>{stats.todayTime || 0} sec</p>
//         </div>

//         <div className="p-4 border rounded">
//           <h3>This Week</h3>
//           <p>{stats.weeklyTime || 0} sec</p>
//         </div>
//       </div>

//       <Timer />
//       <TimeLogs />
//       <Stats />
//     </div>
//   );
// }
