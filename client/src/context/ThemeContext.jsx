import { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

/* ═══════════════════════════════════════════════════════════════════════
   TWO PREMIUM PALETTES
   dark   → Deep Space      (existing dark navy/black)
   light  → Studio White    (clean professional light with warm accents)
   ═══════════════════════════════════════════════════════════════════════ */

const CSS_VARS = {
  dark: {
    "--bg-base":        "#030712",
    "--bg-surface":     "rgba(17,24,39,0.85)",
    "--bg-elevated":    "#111827",
    "--bg-hover":       "rgba(255,255,255,0.05)",
    "--border-subtle":  "rgba(255,255,255,0.08)",
    "--border-muted":   "rgba(255,255,255,0.06)",
    "--text-primary":   "#f9fafb",
    "--text-secondary": "#9ca3af",
    "--text-muted":     "#4b5563",
    "--nav-bg":         "rgba(8,12,20,0.96)",
    "--input-bg":       "rgba(31,41,55,0.85)",
    "--scroll-thumb":   "rgba(255,255,255,0.10)",
    "--card-shadow":    "0 12px 48px rgba(0,0,0,0.45)",
  },
  light: {
    "--bg-base":        "#f4f6f8",  /* cool silver-white canvas        */
    "--bg-surface":     "#ffffff",
    "--bg-elevated":    "#ffffff",
    "--bg-hover":       "rgba(0,0,0,0.035)",
    "--border-subtle":  "rgba(0,0,0,0.09)",
    "--border-muted":   "rgba(0,0,0,0.06)",
    "--text-primary":   "#0d0d0d",  /* near-black — crisp              */
    "--text-secondary": "#4a4a5a",  /* neutral dark-gray               */
    "--text-muted":     "#8a8a9a",  /* cool muted gray                 */
    "--nav-bg":         "rgba(255,255,255,0.97)",
    "--input-bg":       "#ffffff",
    "--scroll-thumb":   "rgba(0,0,0,0.14)",
    "--card-shadow":    "0 1px 3px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.06)",
  },
};

/* ── Light-mode Tailwind class overrides (attribute-selector approach) ── */
function buildLightCSS() {
  return `
/* ── PAGE / SURFACE BACKGROUNDS ── */
.bg-gray-950      { background-color: #f4f6f8 !important; }
.bg-gray-900      { background-color: #ffffff !important; }
.bg-gray-800      { background-color: #f4f6f8 !important; }
.bg-gray-700      { background-color: #e9eaee !important; }

[class*="bg-gray-900/90"] { background-color: rgba(255,255,255,0.97) !important; }
[class*="bg-gray-900/80"] { background-color: rgba(255,255,255,0.94) !important; }
[class*="bg-gray-900/60"] { background-color: rgba(255,255,255,0.88) !important; }
[class*="bg-gray-800/80"] { background-color: rgba(244,246,248,0.96) !important; }
[class*="bg-gray-800/60"] { background-color: rgba(244,246,248,0.85) !important; }
[class*="bg-gray-800/50"] { background-color: rgba(244,246,248,0.75) !important; }
[class*="bg-gray-800/40"] { background-color: rgba(244,246,248,0.65) !important; }

/* white semi-transparent pills / overlays */
[class*="bg-white/10"]       { background-color: rgba(0,0,0,0.05)  !important; }
[class*="bg-white/5"]        { background-color: rgba(0,0,0,0.03)  !important; }
[class*="bg-white/[0.04]"]   { background-color: rgba(0,0,0,0.03)  !important; }
[class*="bg-white/[0.02]"]   { background-color: rgba(0,0,0,0.015) !important; }

/* ── TEXT ── */
.text-white                { color: #0d0d0d !important; }
[class*="text-gray-100"]   { color: #1a1a1a !important; }
[class*="text-gray-200"]   { color: #2a2a2a !important; }
[class*="text-gray-300"]   { color: #3a3a4a !important; }
[class*="text-gray-400"]   { color: #585868 !important; }
[class*="text-gray-500"]   { color: #787888 !important; }
[class*="text-gray-600"]   { color: #9a9aaa !important; }
[class*="text-gray-700"]   { color: #b8b8c8 !important; }

/* ── BORDERS ── */
[class*="border-white/10"]     { border-color: rgba(0,0,0,0.09)  !important; }
[class*="border-white/5"]      { border-color: rgba(0,0,0,0.05)  !important; }
[class*="border-white/[0.06]"] { border-color: rgba(0,0,0,0.06)  !important; }
[class*="border-white/[0.07]"] { border-color: rgba(0,0,0,0.07)  !important; }

/* ── HORIZONTAL DIVIDERS ── */
[class*="h-px"][class*="bg-white"] { background-color: rgba(0,0,0,0.07) !important; }

/* ── SHADOWS ── */
[class*="shadow-2xl"]   {
  box-shadow: 0 1px 3px rgba(0,0,0,0.07),
              0 8px 24px rgba(0,0,0,0.07) !important;
}
[class*="shadow-xl"]    {
  box-shadow: 0 1px 3px rgba(0,0,0,0.06),
              0 4px 14px rgba(0,0,0,0.06) !important;
}
[class*="shadow-lg"]    { box-shadow: 0 2px 10px rgba(0,0,0,0.07) !important; }
[class*="shadow-inner"] { box-shadow: inset 0 2px 4px rgba(0,0,0,0.05) !important; }
[class*="shadow-black"] { --tw-shadow: none !important; box-shadow: none !important; }

/* Keep accent shadows (emerald/violet) vibrant */
[class*="shadow-emerald-500/25"] { box-shadow: 0 4px 18px rgba(16,185,129,0.28) !important; }
[class*="shadow-emerald-500/50"] { box-shadow: 0 6px 24px rgba(16,185,129,0.38) !important; }
[class*="shadow-violet-500/30"]  { box-shadow: 0 4px 18px rgba(139,92,246,0.22) !important; }

/* ── INPUTS ── */
input, select, textarea {
  background-color: #ffffff !important;
  color: #0d0d0d !important;
  border-color: rgba(0,0,0,0.12) !important;
}
input::placeholder, textarea::placeholder { color: #9a9aaa !important; }
option { background-color: #ffffff !important; color: #0d0d0d !important; }
input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3); }

/* ── HOVER STATES ── */
[class*="hover:bg-white"]:hover { background-color: rgba(0,0,0,0.035) !important; }

/* ── RECHARTS ── */
.recharts-text tspan {
  fill: #585868 !important;
}
.recharts-cartesian-grid-horizontal line,
.recharts-cartesian-grid-vertical line { stroke: rgba(0,0,0,0.07) !important; }
.recharts-tooltip-cursor { fill: rgba(0,0,0,0.03) !important; }

/* ── TABLE ── */
tbody tr:hover { background-color: rgba(16,185,129,0.04) !important; }
[class*="bg-white/[0.02]"] { background-color: rgba(0,0,0,0.012) !important; }

/* ── MODAL OVERLAYS (keep dark for contrast) ── */
.fixed.inset-0[class*="bg-black"] { background-color: rgba(10,10,20,0.68) !important; }
[class*="bg-black/90"] { background-color: rgba(10,10,20,0.80) !important; }
[class*="bg-black/85"] { background-color: rgba(10,10,20,0.75) !important; }
[class*="bg-black/50"] { background-color: rgba(10,10,20,0.25) !important; }

/* ── AMBIENT BLOBS: richer in light mode ── */
[class*="bg-emerald-500/5"]  { background-color: rgba(16,185,129,0.09) !important; }
[class*="bg-teal-500/5"]     { background-color: rgba(13,148,136,0.08) !important; }
[class*="bg-emerald-400/5"]  { background-color: rgba(52,211,153,0.08) !important; }
`;
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("tt-theme") || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;

    /* Toggle html class */
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }

    /* Apply CSS variables directly on <html> */
    const vars = CSS_VARS[theme] || CSS_VARS.dark;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    localStorage.setItem("tt-theme", theme);

    /* Inject / clear light-mode overrides <style> */
    let styleEl = document.getElementById("tt-light-overrides");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "tt-light-overrides";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = theme === "light" ? buildLightCSS() : "";
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
