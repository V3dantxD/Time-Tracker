import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import API from "../api/axios";

/* ── tiny SVG icon helpers ───────────────────────────────────────────── */
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IconTasks = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const IconFolder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ── NavItem component ───────────────────────────────────────────────── */
const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({ textDecoration: "none" })}
    className={({ isActive }) =>
      `relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl
       transition-all duration-200 group
       ${isActive
         ? "text-white bg-white/10 shadow-inner"
         : "text-gray-400 hover:text-white hover:bg-white/6"
       }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Glowing accent bar at bottom */}
        {isActive && (
          <span
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-[2px] rounded-full
                       bg-gradient-to-r from-emerald-400 to-teal-400
                       shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]"
          />
        )}
        <span className={`transition-colors duration-200 ${isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-emerald-400"}`}>
          {icon}
        </span>
        {label}
      </>
    )}
  </NavLink>
);

/* ── Main Navbar ─────────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await API.post("/attendance/checkout"); } catch { /* best effort */ }
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Inline styles for animations we can't do in Tailwind utility classes alone */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .navbar-root {
          font-family: 'Inter', sans-serif;
        }

        /* Animated gradient border at very bottom of nav */
        .navbar-root::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(52,211,153,0.4) 20%,
            rgba(45,212,191,0.6) 50%,
            rgba(52,211,153,0.4) 80%,
            transparent 100%);
        }

        /* Subtle animated shimmer on the logo mark */
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(52,211,153,0.35); }
          50%       { box-shadow: 0 0 22px 6px rgba(52,211,153,0.65); }
        }
        .logo-glow { animation: pulse-glow 3s ease-in-out infinite; }

        /* Avatar ring pulse for admin */
        @keyframes ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.45); }
          60%       { box-shadow: 0 0 0 4px rgba(167,139,250,0); }
        }
        .avatar-admin { animation: ring-pulse 2.5s ease-in-out infinite; }

        /* Logout shake on hover */
        .logout-btn:hover svg { transform: translateX(3px); }
        .logout-btn svg { transition: transform 0.2s ease; }

        /* Role badge glow */
        .role-admin  { color: #a78bfa; text-shadow: 0 0 8px rgba(167,139,250,0.7); }
        .role-member { color: #6ee7b7; text-shadow: 0 0 8px rgba(52,211,153,0.5); }
      `}</style>

      <nav className="navbar-root relative w-full px-6 py-2.5 flex items-center justify-between
                      bg-[#080c14]/95 backdrop-blur-xl
                      border-b border-white/[0.06] shadow-2xl shadow-black/60
                      sticky top-0 z-50">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(user ? (isAdmin ? "/admin" : "/dashboard") : "/")}
          className="flex items-center gap-2.5 cursor-pointer group"
          style={{ background: "none", border: "none" }}
        >
          <div className="logo-glow w-8 h-8 rounded-xl
                          bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500
                          flex items-center justify-center shrink-0
                          group-hover:scale-110 transition-transform duration-300">
            <IconClock />
          </div>
          <span className="text-base font-bold tracking-tight text-white leading-none">
            Time
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400
                             bg-clip-text text-transparent ml-0.5">
              Tracker
            </span>
          </span>
        </button>

        {/* ── Center nav links (only when logged in) ────────────────── */}
        {user && (
          <div className="absolute left-1/2 -translate-x-1/2
                          hidden sm:flex items-center gap-1
                          bg-white/[0.04] border border-white/[0.07]
                          rounded-2xl px-2 py-1 backdrop-blur-sm">
            {isAdmin ? (
              <NavItem to="/admin" icon={<IconShield />} label="Admin Panel" />
            ) : (
              <NavItem to="/dashboard" icon={<IconGrid />} label="Dashboard" />
            )}
            <NavItem to="/tasks"    icon={<IconTasks />}  label="Tasks"    />
            <NavItem to="/projects" icon={<IconFolder />} label="Projects" />
          </div>
        )}

        {/* ── Right side ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* User chip */}
              <div className={`flex items-center gap-2.5
                               bg-white/[0.04] border rounded-xl px-3 py-1.5
                               ${isAdmin ? "border-violet-500/20" : "border-emerald-500/15"}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                                 text-xs font-bold shrink-0 select-none
                                 ${isAdmin
                                   ? "avatar-admin bg-gradient-to-br from-violet-500/25 to-purple-600/25 border border-violet-500/40 text-violet-300"
                                   : "bg-gradient-to-br from-emerald-400/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300"
                                 }`}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                {/* Name + role */}
                <div className="hidden sm:block leading-none">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <span className={`text-[10px] font-medium capitalize
                                   ${isAdmin ? "role-admin" : "role-member"}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                id="logout-btn"
                onClick={handleLogout}
                title="Logout"
                className="logout-btn flex items-center gap-1.5 px-3 py-2 text-xs font-semibold
                           text-gray-400 hover:text-red-400 rounded-xl
                           border border-transparent hover:border-red-500/20 hover:bg-red-500/5
                           transition-all duration-200"
              >
                <IconLogout />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-xl
                           transition-all duration-200 hover:bg-white/8
                           border border-transparent hover:border-white/10"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl
                           bg-gradient-to-r from-emerald-500 to-teal-500
                           hover:from-emerald-400 hover:to-teal-400
                           shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50
                           transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
