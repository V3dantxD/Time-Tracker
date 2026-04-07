import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const secondsToHours = (s) => parseFloat((s / 3600).toFixed(2));

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-lg font-semibold text-emerald-400">
          {secondsToHours(payload[0].value)}
          <span className="text-xs text-gray-500 ml-1 font-normal">hrs</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-lg font-semibold text-teal-400">
          {secondsToHours(payload[0].value)}
          <span className="text-xs text-gray-500 ml-1 font-normal">hrs</span>
        </p>
      </div>
    );
  }
  return null;
};

const SectionCard = ({ title, children }) => (
  <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    <p className="text-xs text-gray-500 uppercase tracking-widest mb-5">
      {title}
    </p>
    {children}
  </div>
);

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await API.get("/timelogs/stats");
      setStats(res.data);
    };
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="mt-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
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
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Analytics
          </h2>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const projectChartData = Object.entries(stats.projectStats || {}).map(
    ([key, value]) => ({ project: key, time: value }),
  );

  const topProject = projectChartData.length
    ? projectChartData.reduce((a, b) => (a.time > b.time ? a : b))
    : null;

  const hourlyFiltered = (stats.hourlyStats || []).filter(
    (h) => parseInt(h.hour) >= 6 && parseInt(h.hour) <= 23,
  );

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center gap-3">
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
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white tracking-tight">
          Analytics
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Tracked",
            value: formatDuration(stats.totalTime || 0),
            sub: "all time",
            color: "text-white",
          },
          {
            label: "Today",
            value: formatDuration(stats.todayTime || 0),
            sub: "today",
            color: "text-emerald-400",
          },
          {
            label: "This Week",
            value: formatDuration(stats.weeklyTime || 0),
            sub: "last 7 days",
            color: "text-teal-400",
          },
          {
            label: "Top Project",
            value: topProject?.project || "—",
            sub: topProject ? formatDuration(topProject.time) : "no data",
            color: "text-emerald-400",
          },
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              {label}
            </p>
            <p className={`text-xl font-bold truncate ${color}`}>{value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Daily Report — Last 7 Days">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.dailyStats || []}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${secondsToHours(v)}h`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={<CustomLineTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={{ fill: "#34d399", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#34d399" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Hours per Project">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={projectChartData.map((d) => ({ ...d, time: d.time }))}
            barCategoryGap="35%"
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="project"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${secondsToHours(v)}h`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={<CustomBarTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="time"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Productivity by Hour (6am – 11pm)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyFiltered} barCategoryGap="20%">
            <defs>
              <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={1} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${secondsToHours(v)}h`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={<CustomBarTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="duration"
              fill="url(#hourGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import API from "../api/axios";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// const secondsToHours = (seconds) => parseFloat((seconds / 3600).toFixed(2));

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-gray-900 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
//         <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
//           {label}
//         </p>
//         <p className="text-lg font-semibold text-emerald-400">
//           {secondsToHours(payload[0].value)}
//           <span className="text-xs text-gray-500 ml-1 font-normal">hrs</span>
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function Stats() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       const res = await API.get("/timelogs/stats");

//       const projectData = Object.entries(res.data.projectStats).map(
//         ([key, value]) => ({
//           project: key,
//           time: value, // kept in raw seconds for accurate chart rendering
//         }),
//       );

//       setData(projectData);
//     };

//     fetchStats();
//   }, []);

//   const totalSeconds = data.reduce((sum, d) => sum + d.time, 0);
//   const totalHours = secondsToHours(totalSeconds);
//   const topProject = data.length
//     ? data.reduce((a, b) => (a.time > b.time ? a : b))
//     : null;

//   return (
//     <div className="mt-6 space-y-5">
//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-4 h-4 text-white"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2.5"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <line x1="18" y1="20" x2="18" y2="10" />
//             <line x1="12" y1="20" x2="12" y2="4" />
//             <line x1="6" y1="20" x2="6" y2="14" />
//           </svg>
//         </div>
//         <h2 className="text-lg font-semibold text-white tracking-tight">
//           Analytics
//         </h2>
//       </div>

//       {/* Stat Pills */}
//       <div className="grid grid-cols-2 gap-3">
//         <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
//           <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
//             Total Hours
//           </p>
//           <p className="text-2xl font-bold text-white">
//             {totalHours}
//             <span className="text-sm text-gray-500 font-normal ml-1">hrs</span>
//           </p>
//         </div>
//         <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
//           <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
//             Top Project
//           </p>
//           <p className="text-2xl font-bold text-emerald-400 truncate">
//             {topProject ? topProject.project : "—"}
//           </p>
//         </div>
//       </div>

//       {/* Chart Card */}
//       <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg overflow-hidden">
//         {/* Top accent line */}
//         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

//         {/* Glow blob */}
//         <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

//         <p className="text-xs text-gray-500 uppercase tracking-widest mb-5">
//           Hours per Project
//         </p>

//         <ResponsiveContainer width="100%" height={280}>
//           <BarChart
//             data={data.map((d) => ({ ...d, time: secondsToHours(d.time) }))}
//             barCategoryGap="35%"
//           >
//             <defs>
//               <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
//                 <stop offset="100%" stopColor="#0d9488" stopOpacity={0.7} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
//             <XAxis
//               dataKey="project"
//               tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "inherit" }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <YAxis
//               tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "inherit" }}
//               axisLine={false}
//               tickLine={false}
//               width={30}
//             />
//             <Tooltip
//               content={<CustomTooltip />}
//               cursor={{ fill: "rgba(255,255,255,0.04)" }}
//             />
//             <Bar
//               dataKey="time"
//               fill="url(#barGradient)"
//               radius={[6, 6, 0, 0]}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
