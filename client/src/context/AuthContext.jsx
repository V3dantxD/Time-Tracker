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

  // ── Timer integration ───────────────────────────────────────────────────
  // Timer registers its stop function so logout() can automatically stop
  // an active timer before wiping user state.
  const timerStopRef = useRef(null);

  const registerTimerStop = useCallback((fn) => {
    timerStopRef.current = fn;
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
    // Stop timer (if active) before wiping user state
    if (typeof timerStopRef.current === "function") {
      try { timerStopRef.current(); } catch { /* ignore */ }
      timerStopRef.current = null;
    }
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, registerScreenStop, registerTimerStop }}>
      {children}
    </AuthContext.Provider>
  );
};
