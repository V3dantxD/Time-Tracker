import { createContext, useState, useRef, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  // ── Screen-monitor integration ──────────────────────────────────────────
  // ScreenMonitor registers its stop function here so that logout()
  // always cleans up the screen-share stream before clearing user state.
  const screenStopRef = useRef(null);

  const registerScreenStop = useCallback((fn) => {
    screenStopRef.current = fn;
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────

  const login = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const register = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data);
  };

  const logout = useCallback(() => {
    // Stop screen recording first (if active) before wiping user state
    if (typeof screenStopRef.current === "function") {
      try { screenStopRef.current(); } catch { /* ignore */ }
      screenStopRef.current = null;
    }
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, registerScreenStop }}>
      {children}
    </AuthContext.Provider>
  );
};
