import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

/**
 * Mandatory screen monitoring consent modal.
 * - Shown on first dashboard load for non-admin employees
 * - "Accept & Start Monitoring" → starts getDisplayMedia → calls onAccepted(stream)
 * - "Decline" or closing → logs warning + logs the user out immediately
 */
export default function ScreenMonitorModal({ onAccepted }) {
  const { logout } = useContext(AuthContext);
  const [step, setStep] = useState("prompt"); // prompt | requesting | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleAccept = async () => {
    setStep("requesting");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1, cursor: "always" },
        audio: false,
      });
      onAccepted(stream);
    } catch (err) {
      setStep("error");
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "You must allow screen sharing to use this application. Please try again or contact your admin."
          : "Could not start screen sharing. Please try again.",
      );
    }
  };

  const handleDecline = async () => {
    try {
      await API.post("/screenshots/warning", {
        reason: "Employee declined mandatory screen monitoring consent — was logged out",
      });
    } catch { /* best effort */ }
    logout();
  };

  return (
    // Prevent closing by clicking outside — overlay is non-interactive
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4 animate-[fadeIn_0.3s_ease]">
        <div className="relative bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500" />

          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-600/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              Screen Monitoring Required
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your organization requires screen monitoring to be active while you work.
              Screenshots are captured randomly and are only visible to your admin.
            </p>
          </div>

          {/* Policy bullets */}
          <div className="mx-8 mb-5 bg-gray-800/60 border border-white/5 rounded-2xl p-4 space-y-3">
            {[
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                text: "Screenshots are taken at unpredictable random intervals",
              },
              {
                icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                text: "Only your admin can see captured screenshots — not you",
              },
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                text: "Stopping monitoring will immediately alert your admin",
              },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
                <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Error message */}
          {step === "error" && (
            <div className="mx-8 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-red-400">{errorMsg}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-8 pb-6 space-y-2.5">
            <button
              id="accept-monitoring-btn"
              onClick={handleAccept}
              disabled={step === "requesting"}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                ${step === "requesting"
                  ? "bg-violet-700/50 text-violet-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 active:scale-[0.98]"
                }`}
            >
              {step === "requesting" ? (
                <>
                  <span className="w-4 h-4 border-2 border-violet-300/40 border-t-violet-300 rounded-full animate-spin" />
                  Starting screen share…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  Accept &amp; Start Monitoring
                </>
              )}
            </button>

            <button
              id="decline-monitoring-btn"
              onClick={handleDecline}
              disabled={step === "requesting"}
              className="w-full py-2.5 rounded-2xl font-medium text-xs text-gray-600 hover:text-red-400 transition-colors duration-200 hover:bg-red-500/5 border border-transparent hover:border-red-500/15"
            >
              Decline — I understand I will be logged out
            </button>
          </div>

          {/* Footer note */}
          <div className="px-8 pb-6 -mt-1 text-center">
            <p className="text-[10px] text-gray-700 leading-relaxed">
              By accepting, you agree to your organization's monitoring policy.
              Stopping or interrupting the screen share will notify your admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
