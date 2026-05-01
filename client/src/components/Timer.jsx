import { useState, useEffect, useRef, useCallback } from "react";
import API from "../api/axios";

const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return { h, m, s };
};

// Domains considered "distractions" — used to label window-blur events
const DISTRACTION_IDLE_MS = 30_000; // blur > 30 s = 1 distraction hit
const INACTIVITY_WARN_MS  = 4.5 * 60 * 1000; // 4 min 30 s → show warning
const INACTIVITY_STOP_MS  = 5   * 60 * 1000; // 5 min      → auto-stop
const PING_INTERVAL_MS    = 30_000;           // ping server every 30 s

export default function Timer() {
  const [projects, setProjects]         = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isRunning, setIsRunning]       = useState(false);
  const [seconds, setSeconds]           = useState(0);

  // Productivity tracking (live, client-side)
  const [activeSeconds, setActiveSeconds]       = useState(0);
  const [unwantedUrlHits, setUnwantedUrlHits]   = useState(0);

  // Toast / warning state
  const [toast, setToast]       = useState(null); // { type: "warn"|"info"|"error", msg }
  const [showWarning, setShowWarning] = useState(false);

  // Refs (avoid stale closure issues inside event handlers)
  const isRunningRef         = useRef(false);
  const lastActivityRef      = useRef(Date.now());
  const activeSecondsRef     = useRef(0);
  const unwantedHitsRef      = useRef(0);
  const blurTimeRef          = useRef(null);   // when window lost focus
  const warningShownRef      = useRef(false);
  const stopCalledRef        = useRef(false);  // prevent double-stop

  // Keep refs in sync with state
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { activeSecondsRef.current = activeSeconds; }, [activeSeconds]);
  useEffect(() => { unwantedHitsRef.current = unwantedUrlHits; }, [unwantedUrlHits]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const showToast = useCallback((type, msg, durationMs = 4000) => {
    setToast({ type, msg });
    if (durationMs > 0) setTimeout(() => setToast(null), durationMs);
  }, []);

  const dismissWarning = () => {
    setShowWarning(false);
    warningShownRef.current = false;
    lastActivityRef.current = Date.now(); // reset the clock
  };

  // ── fetch projects ────────────────────────────────────────────────────────

  useEffect(() => {
    API.get("/projects")
      .then(({ data }) => setProjects(data))
      .catch(() => {});
  }, []);

  // ── restore active timer on mount ────────────────────────────────────────

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await API.get("/timelogs/active");
        if (data) {
          setIsRunning(true);
          const diff = Math.floor((Date.now() - new Date(data.startTime)) / 1000);
          setSeconds(diff);
          setSelectedProject(data.project?._id ?? data.project ?? "");
          // restore any already-tracked activity from the server
          setActiveSeconds(data.activeSeconds || 0);
          setUnwantedUrlHits(data.unwantedUrlHits || 0);
          activeSecondsRef.current  = data.activeSeconds || 0;
          unwantedHitsRef.current   = data.unwantedUrlHits || 0;
        }
      } catch {
        /* no active timer — fine */
      }
    };
    check();
  }, []);

  // ── clock tick ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // ── mouse / keyboard activity listeners ──────────────────────────────────

  useEffect(() => {
    if (!isRunning) return;

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      // Dismiss warning toast if user becomes active again
      if (warningShownRef.current) dismissWarning();
    };

    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("mousedown", onActivity, { passive: true });
    window.addEventListener("keydown",   onActivity, { passive: true });
    window.addEventListener("scroll",    onActivity, { passive: true });
    window.addEventListener("touchstart",onActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove",  onActivity);
      window.removeEventListener("mousedown",  onActivity);
      window.removeEventListener("keydown",    onActivity);
      window.removeEventListener("scroll",     onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── accumulate activeSeconds each second ─────────────────────────────────

  useEffect(() => {
    if (!isRunning) return;
    // Every second: if the user was active within the last 3 s, count it
    const id = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs < 3000) {
        setActiveSeconds((p) => {
          activeSecondsRef.current = p + 1;
          return p + 1;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // ── window blur/focus → distraction detection ────────────────────────────

  useEffect(() => {
    if (!isRunning) return;

    const onBlur = () => {
      blurTimeRef.current = Date.now();
    };

    const onFocus = () => {
      if (blurTimeRef.current === null) return;
      const awayMs = Date.now() - blurTimeRef.current;
      blurTimeRef.current = null;
      if (awayMs >= DISTRACTION_IDLE_MS) {
        setUnwantedUrlHits((p) => {
          unwantedHitsRef.current = p + 1;
          return p + 1;
        });
      }
    };

    window.addEventListener("blur",  onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur",  onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [isRunning]);

  // ── inactivity watchdog ───────────────────────────────────────────────────

  const performAutoStop = useCallback(async () => {
    if (stopCalledRef.current || !isRunningRef.current) return;
    stopCalledRef.current = true;
    setShowWarning(false);
    warningShownRef.current = false;

    try {
      await API.post("/timelogs/stop", {
        activeSeconds: activeSecondsRef.current,
        unwantedUrlHits: unwantedHitsRef.current,
      });
    } catch { /* best-effort */ }

    setIsRunning(false);
    setSeconds(0);
    setActiveSeconds(0);
    setUnwantedUrlHits(0);
    activeSecondsRef.current = 0;
    unwantedHitsRef.current  = 0;
    stopCalledRef.current    = false;
    showToast("info", "⏱ Timer stopped automatically after 5 min of inactivity.", 6000);
  }, [showToast]);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs >= INACTIVITY_STOP_MS) {
        clearInterval(id);
        performAutoStop();
      } else if (idleMs >= INACTIVITY_WARN_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        setShowWarning(true);
      } else if (idleMs < INACTIVITY_WARN_MS && warningShownRef.current) {
        // user moved before stop — cancel warning
        warningShownRef.current = false;
        setShowWarning(false);
      }
    }, 5000); // check every 5 s

    return () => clearInterval(id);
  }, [isRunning, performAutoStop]);

  // ── activity ping to server every 30 s ───────────────────────────────────

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(async () => {
      if (!isRunningRef.current) return;
      try {
        await API.post("/timelogs/activity", {
          activeSeconds: activeSecondsRef.current,
          unwantedUrlHits: unwantedHitsRef.current,
        });
      } catch { /* silent — ping is best-effort */ }
    }, PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isRunning]);

  // ── timer start / stop ────────────────────────────────────────────────────

  const startTimer = async () => {
    if (!selectedProject) {
      showToast("error", "Select a project first.", 3000);
      return;
    }
    await API.post("/timelogs/start", {
      project: selectedProject,
      description: "Working...",
    });
    lastActivityRef.current = Date.now();
    warningShownRef.current  = false;
    stopCalledRef.current    = false;
    setActiveSeconds(0);
    setUnwantedUrlHits(0);
    activeSecondsRef.current = 0;
    unwantedHitsRef.current  = 0;
    setIsRunning(true);
  };

  const stopTimer = async () => {
    if (stopCalledRef.current) return;
    stopCalledRef.current = true;
    try {
      await API.post("/timelogs/stop", {
        activeSeconds: activeSecondsRef.current,
        unwantedUrlHits: unwantedHitsRef.current,
      });
    } catch { /* ignore */ }
    setIsRunning(false);
    setSeconds(0);
    setActiveSeconds(0);
    setUnwantedUrlHits(0);
    activeSecondsRef.current = 0;
    unwantedHitsRef.current  = 0;
    setShowWarning(false);
    warningShownRef.current  = false;
    stopCalledRef.current    = false;
  };

  // ── derived display values ────────────────────────────────────────────────

  const { h, m, s } = formatTime(seconds);

  const sessionDuration = seconds || 1;
  const rawScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (activeSeconds / sessionDuration) * 100 - unwantedUrlHits * 5,
      ),
    ),
  );

  const scoreColor =
    rawScore >= 70
      ? "text-emerald-400"
      : rawScore >= 40
      ? "text-yellow-400"
      : "text-red-400";

  const scoreBg =
    rawScore >= 70
      ? "from-emerald-500 to-teal-400"
      : rawScore >= 40
      ? "from-yellow-500 to-amber-400"
      : "from-red-500 to-orange-400";

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative">

      {/* ── Inactivity warning overlay ─────────────────────────────────── */}
      {showWarning && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-gray-950/90 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-yellow-500/40 bg-gray-900 p-6 shadow-2xl shadow-yellow-500/10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/15 border border-yellow-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p className="mb-1 text-sm font-semibold text-yellow-400">Inactivity Detected</p>
            <p className="mb-5 text-xs text-gray-400">
              No mouse or keyboard activity for 4.5 minutes.<br/>
              Timer will <span className="font-semibold text-white">auto-stop in 30 seconds</span>.
            </p>
            <button
              onClick={dismissWarning}
              className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 py-2.5 text-sm font-semibold text-gray-900 hover:from-yellow-400 hover:to-amber-400 transition-all duration-200 active:scale-[0.98]"
            >
              I'm still here — keep running
            </button>
          </div>
        </div>
      )}

      {/* ── Main card ──────────────────────────────────────────────────── */}
      <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden">

        {/* Ambient glow */}
        <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isRunning ? "bg-emerald-500/15" : "bg-white/5"}`} />

        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent transition-opacity duration-500 ${isRunning ? "opacity-100" : "opacity-30"}`} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Timer</h2>
          {isRunning && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Project selector */}
        <div className="relative mb-6">
          <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Project</label>
          <div className="relative">
            <select
              className="w-full bg-gray-800/80 border border-white/10 text-sm text-white rounded-xl px-4 py-3 pr-10 appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={isRunning}
            >
              <option value="" className="bg-gray-900">
                {projects.length === 0 ? "No projects available" : "Select a project"}
              </option>
              {projects.map((p) => (
                <option key={p._id} value={p._id} className="bg-gray-900">{p.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
          {projects.length === 0 && (
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Create a project first to start tracking time
            </p>
          )}
        </div>

        {/* Clock display */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {[h, m, s].map((unit, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="bg-gray-800/80 border border-white/10 rounded-xl px-4 py-3 min-w-[64px] text-center shadow-inner">
                <span className={`text-4xl font-mono font-bold tabular-nums tracking-tight transition-colors duration-300 ${isRunning ? "text-emerald-400" : "text-white"}`}>
                  {unit}
                </span>
                <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">
                  {["hrs", "min", "sec"][i]}
                </p>
              </div>
              {i < 2 && (
                <span className={`text-2xl font-mono font-bold mb-4 transition-colors duration-300 ${isRunning ? "text-emerald-500/60" : "text-gray-700"}`}>:</span>
              )}
            </div>
          ))}
        </div>

        {/* ── Productivity bar (only while running) ── */}
        {isRunning && (
          <div className="mb-6 bg-gray-800/60 border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Live Productivity</p>
              <span className={`text-sm font-bold ${scoreColor}`}>{rawScore}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-700/60 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${scoreBg} rounded-full transition-all duration-700`}
                style={{ width: `${rawScore}%` }}
              />
            </div>
            {/* Stats row */}
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span className="text-gray-400">{activeSeconds}s active</span>
              </span>
              {unwantedUrlHits > 0 && (
                <span className="flex items-center gap-1 text-orange-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {unwantedUrlHits} distraction{unwantedUrlHits !== 1 ? "s" : ""}
                </span>
              )}
              <span className="text-gray-600">
                Based on input activity
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-white/10 mb-6" />

        {/* Action button */}
        {!isRunning ? (
          <button
            onClick={startTimer}
            disabled={projects.length === 0}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Start Timer
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gray-800/80 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/60 shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            <span className="text-red-400">Stop Timer</span>
          </button>
        )}
      </div>

      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div
          className={`mt-3 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg transition-all duration-300
            ${toast.type === "warn"  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" : ""}
            ${toast.type === "info"  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : ""}
            ${toast.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : ""}
          `}
        >
          <span className="mt-0.5 shrink-0">
            {toast.type === "warn"  && "⚠"}
            {toast.type === "info"  && "ℹ"}
            {toast.type === "error" && "✕"}
          </span>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-auto shrink-0 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}
