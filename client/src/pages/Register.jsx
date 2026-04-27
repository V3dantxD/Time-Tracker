import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/* ── Themed input with focus ring ───────────────────────────────────── */
function ThemedInput({ icon, type = "text", placeholder, onChange, required, rightSlot }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", pointerEvents: "none", display: "flex",
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "var(--input-bg)",
          border: `1px solid ${focused ? "rgba(52,211,153,0.55)" : "var(--border-subtle)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(52,211,153,0.12)" : "none",
          borderRadius: 12,
          padding: `12px ${rightSlot ? "40px" : "16px"} 12px ${icon ? "40px" : "16px"}`,
          fontSize: 14,
          color: "var(--text-primary)",
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      />
      {rightSlot && (
        <span style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        }}>
          {rightSlot}
        </span>
      )}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
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
const IconSpin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: "spin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IconUserPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

export default function Register() {
  const { register } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await API.post("/auth/register", form);
      register(data);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || !form.name.trim() || !form.email.trim() || !form.password.trim();

  /* ── Shared styles ─────────────────────────────────────────────────── */
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
    background: isDisabled
      ? "linear-gradient(135deg,#6ee7b7,#5eead4)"
      : "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
    border: "none",
    cursor: isDisabled ? "not-allowed" : "pointer",
    boxShadow: isDisabled ? "none" : "0 4px 20px rgba(16,185,129,0.35)",
    opacity: isDisabled ? 0.55 : 1,
    transition: "transform 0.15s, box-shadow 0.15s, opacity 0.2s",
  };

  /* ── Feature badges shown below the form ──────────────────────────── */
  const features = [
    { icon: "⏱", label: "Time Tracking" },
    { icon: "📸", label: "Screen Monitor" },
    { icon: "📊", label: "Analytics" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      background: "var(--bg-base)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-100px", right: "-80px",
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", left: "-60px",
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(40px)",
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #34d399, #0d9488)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 28px rgba(16,185,129,0.38)",
              marginBottom: 14,
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Time
            <span style={{ background: "linear-gradient(90deg,#10b981,#0d9488)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Tracker
            </span>
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Create your account
          </p>
        </div>

        {/* Card */}
        <div style={cardStyle}>
          {/* Top gradient accent bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, #10b981, #0d9488, transparent)",
            borderRadius: "20px 20px 0 0",
          }} />

          {/* Subtle corner glow */}
          <div style={{
            position: "absolute", bottom: -40, right: -40,
            width: 160, height: 160,
            background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
            Sign up
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>
            Fill in the details below to get started
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 20,
              color: "#f87171", fontSize: 13,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <ThemedInput
                icon={<IconUser />}
                type="text"
                placeholder="John Doe"
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <ThemedInput
                icon={<IconMail />}
                type="email"
                placeholder="you@example.com"
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <ThemedInput
                icon={<IconLock />}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={e => setForm({ ...form, password: e.target.value })}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      color: "var(--text-muted)", background: "none",
                      border: "none", cursor: "pointer", display: "flex",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                }
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isDisabled}
              style={primaryBtnStyle}
              onMouseEnter={e => {
                if (!isDisabled) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 28px rgba(16,185,129,0.50)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = isDisabled ? "none" : "0 4px 20px rgba(16,185,129,0.35)";
              }}
            >
              {isSubmitting ? <IconSpin /> : <IconUserPlus />}
              {isSubmitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          {/* Feature pills */}
          <div style={{
            display: "flex", gap: 8, justifyContent: "center",
            marginTop: 24, paddingTop: 20,
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}>
            {features.map(f => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 600,
                color: "var(--text-muted)",
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                borderRadius: 8, padding: "4px 10px",
              }}>
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginTop: 24 }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#10b981", fontWeight: 600, cursor: "pointer" }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
