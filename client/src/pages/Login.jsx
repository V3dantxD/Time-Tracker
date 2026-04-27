import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/* ── Reusable styled input ─────────────────────────────────────────── */
function ThemedInput({ icon, type = "text", placeholder, onChange, required, maxLength, extra = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", pointerEvents: "none", display: "flex"
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "var(--input-bg)",
          border: `1px solid ${focused ? "rgba(52,211,153,0.55)" : "var(--border-subtle)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(52,211,153,0.12)" : "none",
          borderRadius: 12,
          padding: icon ? "12px 16px 12px 40px" : "12px 16px",
          fontSize: 14,
          color: "var(--text-primary)",
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          ...extra,
        }}
      />
    </div>
  );
}

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

export default function Login() {
  const { login } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [step, setStep] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [resetForm, setResetForm] = useState({ email: "", passkey: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg(""); setLoading(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { email: resetForm.email });
      setSuccessMsg(data.message);
      setStep("reset");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg(""); setLoading(true);
    try {
      const { data } = await API.post("/auth/reset-password", resetForm);
      setSuccessMsg(data.message);
      setTimeout(() => { setStep("login"); setForm(p => ({ ...p, email: resetForm.email })); setSuccessMsg(""); }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  /* ── Shared card style ─────────────────────────────────────────────── */
  const cardStyle = {
    position: "relative",
    background: isDark ? "rgba(17,24,39,0.85)" : "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    borderRadius: 20,
    padding: "32px",
    boxShadow: isDark
      ? "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
      : "0 24px 60px rgba(15,23,42,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
    overflow: "hidden",
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 6,
  };

  const primaryBtnStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "13px 20px",
    marginTop: 8,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
    transition: "transform 0.15s, box-shadow 0.15s",
  };

  const secondaryBtnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 20px",
    marginTop: 8,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-secondary)",
    background: "var(--bg-hover)",
    border: `1px solid var(--border-subtle)`,
    cursor: "pointer",
    transition: "background 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "var(--bg-base)", position: "relative", overflow: "hidden" }}>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: 480, height: 480, background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: 400, height: 400, background: "radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div
            onClick={() => navigate("/")}
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #34d399, #0d9488)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 28px rgba(16,185,129,0.38)",
              cursor: "pointer", marginBottom: 14,
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Time<span style={{ background: "linear-gradient(90deg,#10b981,#0d9488)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tracker</span>
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {step === "login" ? "Welcome back" : "Account Recovery"}
          </p>
        </div>

        {/* Card */}
        <div style={cardStyle}>
          {/* Top accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #10b981, #0d9488, transparent)", borderRadius: "20px 20px 0 0" }} />

          {/* Alerts */}
          {errorMsg && (
            <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#f87171", fontSize: 13, textAlign: "center" }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)", color: "#34d399", fontSize: 13, textAlign: "center" }}>
              {successMsg}
            </div>
          )}

          {/* ── LOGIN ── */}
          {step === "login" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Sign in</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>Enter your credentials to continue</p>

              <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <ThemedInput icon={<IconMail />} type="email" placeholder="you@example.com" onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                    <button type="button" onClick={() => { setStep("forgot"); setErrorMsg(""); setSuccessMsg(""); }}
                      style={{ fontSize: 12, color: "#10b981", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                      Forgot Password?
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <ThemedInput icon={<IconLock />} type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={e => setForm({ ...form, password: e.target.value })} required extra={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>
                <button type="submit" style={primaryBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(16,185,129,0.50)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.35)"; }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {step === "forgot" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Forgot Password?</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>Enter your email and we'll send you a 4-digit passkey.</p>
              <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <ThemedInput type="email" placeholder="you@example.com" onChange={e => setResetForm({ ...resetForm, email: e.target.value })} required />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => { setStep("login"); setErrorMsg(""); setSuccessMsg(""); }} style={{ ...secondaryBtnStyle, flex: 1 }}>Back</button>
                  <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, flex: 2, marginTop: 0, opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Sending…" : "Send Passkey"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── RESET PASSWORD ── */}
          {step === "reset" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Enter Passkey</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>Enter the 4-digit code sent to your email and your new password.</p>
              <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>4-Digit Passkey</label>
                  <ThemedInput type="text" maxLength={4} placeholder="• • • •" onChange={e => setResetForm({ ...resetForm, passkey: e.target.value })} required extra={{ textAlign: "center", letterSpacing: "0.4em", fontSize: 20 }} />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <ThemedInput type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} required extra={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => { setStep("login"); setErrorMsg(""); setSuccessMsg(""); }} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, flex: 2, marginTop: 0, opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Resetting…" : "Reset Password"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {step === "login" && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginTop: 24 }}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}
              style={{ color: "#10b981", fontWeight: 600, cursor: "pointer" }}>
              Register
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
