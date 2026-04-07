import { useState, useEffect } from "react";
import API from "../api/axios";

const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return { h, m, s };
};

export default function Timer() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Fetch projects independently — never blocked by active timer check
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get("/projects");
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchProjects();
  }, []);

  // Tick
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Check for active timer — completely isolated, never affects projects
  useEffect(() => {
    const checkActive = async () => {
      try {
        const { data } = await API.get("/timelogs/active");
        if (data) {
          setIsRunning(true);
          const start = new Date(data.startTime);
          const now = new Date();
          const diff = Math.floor((now - start) / 1000);
          setSeconds(diff);
          setSelectedProject(data.project?._id ?? data.project ?? "");
        }
      } catch (error) {
        // No active timer — expected for new users, safe to ignore
        console.log("No active timer found");
      }
    };
    checkActive();
  }, []);

  const startTimer = async () => {
    if (!selectedProject) {
      alert("Select a project first");
      return;
    }
    await API.post("/timelogs/start", {
      project: selectedProject,
      description: "Working...",
    });
    setIsRunning(true);
  };

  const stopTimer = async () => {
    await API.post("/timelogs/stop");
    setIsRunning(false);
    setSeconds(0);
  };

  const { h, m, s } = formatTime(seconds);

  return (
    <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden">
      {/* Ambient glow when running */}
      <div
        className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isRunning ? "bg-emerald-500/15" : "bg-white/5"}`}
      />

      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent transition-opacity duration-500 ${isRunning ? "opacity-100" : "opacity-30"}`}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white tracking-tight">
          Timer
        </h2>

        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Project Selector */}
      <div className="relative mb-6">
        <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">
          Project
        </label>
        <div className="relative">
          <select
            className="w-full bg-gray-800/80 border border-white/10 text-sm text-white rounded-xl px-4 py-3 pr-10 appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={isRunning}
          >
            <option value="" className="bg-gray-900">
              {projects.length === 0
                ? "No projects available"
                : "Select a project"}
            </option>
            {projects.map((p) => (
              <option key={p._id} value={p._id} className="bg-gray-900">
                {p.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Hint for new users with no projects */}
        {projects.length === 0 && (
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Create a project first to start tracking time
          </p>
        )}
      </div>

      {/* Clock Display */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {[h, m, s].map((unit, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="bg-gray-800/80 border border-white/10 rounded-xl px-4 py-3 min-w-[64px] text-center shadow-inner">
              <span
                className={`text-4xl font-mono font-bold tabular-nums tracking-tight transition-colors duration-300 ${isRunning ? "text-emerald-400" : "text-white"}`}
              >
                {unit}
              </span>
              <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">
                {["hrs", "min", "sec"][i]}
              </p>
            </div>
            {i < 2 && (
              <span
                className={`text-2xl font-mono font-bold mb-4 transition-colors duration-300 ${isRunning ? "text-emerald-500/60" : "text-gray-700"}`}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-6" />

      {/* Action Button */}
      {!isRunning ? (
        <button
          onClick={startTimer}
          disabled={projects.length === 0}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Start Timer
        </button>
      ) : (
        <button
          onClick={stopTimer}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gray-800/80 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/60 shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-red-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <span className="text-red-400">Stop Timer</span>
        </button>
      )}
    </div>
  );
}

// import { useState, useEffect } from "react";
// import API from "../api/axios";

// export default function Timer() {
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState("");
//   const [isRunning, setIsRunning] = useState(false);
//   const [seconds, setSeconds] = useState(0);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       const { data } = await API.get("/projects");
//       setProjects(data);
//     };
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     let interval;
//     if (isRunning) {
//       interval = setInterval(() => {
//         setSeconds((prev) => prev + 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [isRunning]);

//   useEffect(() => {
//     const checkActive = async () => {
//       try {
//         const { data } = await API.get("/timelogs/active");

//         if (data) {
//           setIsRunning(true);

//           const start = new Date(data.startTime);
//           const now = new Date();
//           const diff = Math.floor((now - start) / 1000);

//           setSeconds(diff);
//           setSelectedProject(data.project);
//         }
//       } catch (error) {
//         console.error("No active timer");
//       }
//     };

//     checkActive();
//   }, []);

//   const startTimer = async () => {
//     if (!selectedProject) {
//       alert("Select a project first");
//       return;
//     }

//     await API.post("/timelogs/start", {
//       project: selectedProject,
//       description: "Working...",
//     });

//     setIsRunning(true);
//   };

//   const stopTimer = async () => {
//     await API.post("/timelogs/stop");
//     setIsRunning(false);
//     setSeconds(0);
//   };

//   return (
//     <div className="p-6 border rounded-xl shadow-md">
//       <h2 className="text-xl mb-4">Timer</h2>

//       <select
//         className="border p-2 mb-4 w-full"
//         value={selectedProject}
//         onChange={(e) => setSelectedProject(e.target.value)}
//       >
//         <option value="">Select Project</option>
//         {projects.map((p) => (
//           <option key={p._id} value={p._id}>
//             {p.name}
//           </option>
//         ))}
//       </select>

//       <div className="text-3xl mb-4">
//         {Math.floor(seconds / 3600)}:{Math.floor((seconds % 3600) / 60)}:
//         {seconds % 60}
//       </div>

//       {!isRunning ? (
//         <button
//           onClick={startTimer}
//           className="bg-green-500 text-white px-4 py-2"
//         >
//           Start
//         </button>
//       ) : (
//         <button onClick={stopTimer} className="bg-red-500 text-white px-4 py-2">
//           Stop
//         </button>
//       )}
//     </div>
//   );
// }
