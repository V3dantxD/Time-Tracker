import { useState, useEffect, useRef, useCallback, useContext } from "react";
import API from "../api/axios";
import ScreenMonitorModal from "./ScreenMonitorModal";
import { AuthContext } from "../context/AuthContext";

/**
 * Mandatory screen monitoring component for employees.
 *
 * Behaviour:
 * - Shows the consent modal until the user accepts (or is logged out on decline)
 * - Once accepted: captures screenshots silently at random intervals (45–90s)
 * - The user CANNOT see when the next shot will be taken
 * - The user CANNOT turn off monitoring — no toggle exists
 * - If the browser stream ends (user clicks "Stop sharing" in browser chrome):
 *     → API warning is sent to admin
 *     → Warning banner shown to user
 *     → Consent modal is re-shown (they must restart sharing to continue)
 */
export default function ScreenMonitor() {
  const [phase, setPhase] = useState("modal"); // modal | active | warning
  const [captureCount, setCaptureCount] = useState(0);
  const [warningShown, setWarningShown] = useState(false);

  const { user } = useContext(AuthContext);

  const streamRef = useRef(null);
  const timeoutRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop monitoring if logged out or admin
  useEffect(() => {
    if (!user || user.role === "admin") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }, [user]);

  // Fetch today's count on mount

  useEffect(() => {
    API.get("/screenshots/mine")
      .then(({ data }) => setCaptureCount(data.todayCount || 0))
      .catch(() => {});
  }, []);

  /* ─── capture one screenshot and upload ─── */
  const captureAndUpload = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream || !stream.active) return;

    try {
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      const canvas = canvasRef.current;
      canvas.width = Math.min(bitmap.width, 1280);
      canvas.height = Math.round((bitmap.height / bitmap.width) * canvas.width);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      await API.post("/screenshots/upload", { imageData });
      setCaptureCount((c) => c + 1);
    } catch (err) {
      console.error("Screenshot capture error:", err);
    }
  }, []);

  /* ─── schedule next capture at a random interval (45–90s) ─── */
  const scheduleNext = useCallback(() => {
    // Randomised — user cannot predict when next screenshot happens
    const delay = 45_000 + Math.floor(Math.random() * 45_000);
    timeoutRef.current = setTimeout(async () => {
      await captureAndUpload();
      scheduleNext(); // chain
    }, delay);
  }, [captureAndUpload]);

  /* ─── handle stream ending (user clicked "Stop sharing" in browser) ─── */
  const handleStreamEnded = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    streamRef.current = null;

    // Notify admin via API
    try {
      await API.post("/screenshots/warning", {
        reason: "Employee stopped screen sharing during active monitoring session",
      });
    } catch { /* best effort */ }

    setWarningShown(true);
    setPhase("warning"); // triggers modal re-render
  }, []);

  /* ─── called by modal when user accepts and stream is ready ─── */
  const handleAccepted = useCallback(
    async (stream) => {
      streamRef.current = stream;

      // Detect native browser "Stop sharing" button
      stream.getVideoTracks()[0].addEventListener("ended", handleStreamEnded);

      setPhase("active");
      setWarningShown(false);

      // First capture immediately
      await captureAndUpload();
      scheduleNext();
    },
    [captureAndUpload, scheduleNext, handleStreamEnded],
  );

  /* ─── cleanup on unmount ─── */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (!user || user.role === "admin") return null;

  return (
    <>
      {/* Hidden canvas used for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mandatory consent modal — shown on first load or after stream was stopped */}
      {(phase === "modal" || phase === "warning") && (
        <ScreenMonitorModal onAccepted={handleAccepted} />
      )}

      {/* Status card shown globally — fixed at bottom left */}
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
            ${phase === "active"
              ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30"
              : "bg-red-500/20 border border-red-500/30"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${phase === "active" ? "text-white" : "text-red-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Screen Monitoring</p>
            <p className="text-xs text-gray-500">
              {phase === "active"
                ? "Active — your admin can view your screen activity"
                : "Interrupted — please restart to continue working"}
            </p>
          </div>

          {/* Status pill — read only, no toggle */}
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border
            ${phase === "active"
              ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${phase === "active" ? "bg-violet-400 animate-pulse" : "bg-red-400 animate-pulse"}`} />
            {phase === "active" ? "Monitoring" : "Stopped"}
          </div>
        </div>

        {/* Warning banner — shown after user stopped the stream */}
        {warningShown && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-400">⚠ Monitoring Interrupted</p>
              <p className="text-xs text-red-300/80 mt-0.5">
                You stopped screen sharing. Your admin has been notified. You must
                resume monitoring to continue using the application.
              </p>
            </div>
          </div>
        )}

        {/* Subtle info — deliberately no countdown or next-capture time */}
        {phase === "active" && (
          <div className="mt-3 flex items-center gap-4">
            <p className="text-xs text-gray-600">
              <span className="text-gray-400 font-semibold">{captureCount}</span>{" "}
              captures recorded today
            </p>
            <p className="text-xs text-gray-700">
              Captures happen at unpredictable intervals
            </p>
          </div>
        )}
      </div>
    </>
  );
}
