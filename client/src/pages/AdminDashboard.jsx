import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${seconds || 0}s`;
};
const secondsToHours = (s) => parseFloat((s / 3600).toFixed(2));
const fmtTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const fmtDate = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

/* ─────────────── Shared chart sub-components ─────────────── */
const CustomTooltip = ({ active, payload, label, color = "#34d399" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-emerald-500/30 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-lg font-semibold" style={{ color }}>
          {secondsToHours(payload[0].value)}
          <span className="text-xs text-gray-500 ml-1 font-normal">hrs</span>
        </p>
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, children }) => (
  <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
    <p className="text-xs text-gray-500 uppercase tracking-widest mb-5">
      {title}
    </p>
    {children}
  </div>
);

function MemberStatsCharts({ stats }) {
  const projectChartData = Object.entries(stats.projectStats || {}).map(
    ([key, value]) => ({ project: key, time: value }),
  );
  const hourlyFiltered = (stats.hourlyStats || []).filter(
    (h) => parseInt(h.hour) >= 6 && parseInt(h.hour) <= 23,
  );

  return (
    <div className="space-y-4">
      <ChartCard title="Daily Report — Last 7 Days">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.dailyStats || []}>
            <defs>
              <linearGradient id="adminLineGrad" x1="0" y1="0" x2="1" y2="0">
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
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="url(#adminLineGrad)"
              strokeWidth={2.5}
              dot={{ fill: "#34d399", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#34d399" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Hours per Project">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={projectChartData} barCategoryGap="35%">
            <defs>
              <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
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
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="time"
              fill="url(#adminBarGrad)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Productivity by Hour (6am – 11pm)">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={hourlyFiltered} barCategoryGap="20%">
            <defs>
              <linearGradient id="adminHourGrad" x1="0" y1="0" x2="0" y2="1">
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
              content={<CustomTooltip color="#2dd4bf" />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar
              dataKey="duration"
              fill="url(#adminHourGrad)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ═══════════════ TAB: ANALYTICS ═══════════════ */
function AnalyticsTab() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberStats, setMemberStats] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    API.get("/timelogs/admin/members")
      .then(({ data }) => setMembers(data))
      .catch(() => {})
      .finally(() => setLoadingMembers(false));
  }, []);

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setMemberStats(null);
    setLoadingStats(true);
    try {
      const { data } = await API.get(
        `/timelogs/admin/members/${member._id}/stats`,
      );
      setMemberStats(data);
    } catch {}
    setLoadingStats(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Members List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Members
            </h2>
          </div>
          {members.length > 0 && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          )}
        </div>
        {loadingMembers && (
          <div className="bg-gray-900/80 border border-white/10 rounded-xl p-8 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        )}
        {!loadingMembers && members.length === 0 && (
          <div className="bg-gray-900/80 border border-white/10 rounded-xl p-8 flex flex-col items-center text-center">
            <p className="text-sm text-gray-400">No members yet</p>
          </div>
        )}
        <div className="space-y-2">
          {members.map((member) => {
            const isSelected = selectedMember?._id === member._id;
            return (
              <button
                key={member._id}
                onClick={() => handleSelectMember(member)}
                className={`w-full text-left relative group rounded-xl px-4 py-3 border transition-all duration-300 overflow-hidden
                  ${isSelected ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10" : "bg-gray-900/80 backdrop-blur-md border-white/10 hover:border-emerald-500/30"}`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                )}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-400"}`}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${isSelected ? "text-emerald-400" : "text-white group-hover:text-emerald-400"}`}
                    >
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                  <span
                    className={`ml-auto text-sm shrink-0 transition-all duration-300 ${isSelected ? "opacity-100 text-emerald-400" : "opacity-0 group-hover:opacity-100 text-emerald-400"}`}
                  >
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Panel */}
      <div className="lg:col-span-2 space-y-5">
        {!selectedMember && (
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-16 flex flex-col items-center text-center h-full">
            <p className="text-sm font-medium text-gray-400">Select a member</p>
            <p className="text-xs text-gray-600 mt-1">
              Click a member on the left to view their analytics
            </p>
          </div>
        )}
        {selectedMember && loadingStats && (
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        )}
        {selectedMember && memberStats && !loadingStats && (
          <>
            <div className="relative bg-gray-900/80 border border-white/10 rounded-2xl p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-400">
                  {memberStats.member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">
                    Viewing analytics for
                  </p>
                  <p className="text-lg font-bold text-white">
                    {memberStats.member.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {memberStats.member.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Total Tracked",
                  value: formatDuration(memberStats.totalTime),
                },
                {
                  label: "Today",
                  value: formatDuration(memberStats.todayTime),
                },
                {
                  label: "This Week",
                  value: formatDuration(memberStats.weeklyTime),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-gray-900/80 border border-white/10 rounded-xl p-4 shadow-lg"
                >
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className="text-xl font-bold text-emerald-400">{value}</p>
                </div>
              ))}
            </div>
            <MemberStatsCharts stats={memberStats} />
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ TAB: SCREENSHOTS ═══════════════ */
const SERVER_BASE = "http://localhost:3000";

function ScreenshotsTab() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    API.get("/screenshots/admin/all")
      .then(({ data }) => setMembers(data))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  const loadScreenshots = async (memberId, pg = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get(
        `/screenshots/admin/${memberId}?page=${pg}&limit=12`,
      );
      setScreenshots(data.screenshots);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pg);
    } catch {}
    setLoading(false);
  };

  const selectMember = (m) => {
    setSelectedMember(m.member);
    setScreenshots([]);
    setPage(1);
    loadScreenshots(m.member._id, 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Member list with last screenshot */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Employees</h2>
        </div>
        {loadingList && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
          </div>
        )}
        {members.map((m) => {
          const isSelected = selectedMember?._id === m.member._id;
          return (
            <button
              key={m.member._id}
              onClick={() => selectMember(m)}
              className={`w-full text-left rounded-xl border overflow-hidden transition-all duration-300
                ${isSelected ? "border-violet-500/40 bg-violet-500/10" : "border-white/10 bg-gray-900/80 hover:border-violet-500/30"}`}
            >
              {m.latest ? (
                <div className="relative h-24 w-full overflow-hidden">
                  <img
                    src={`${SERVER_BASE}${m.latest.url}`}
                    alt="latest screenshot"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
                </div>
              ) : (
                <div className="h-16 bg-gray-800/50 flex items-center justify-center">
                  <span className="text-xs text-gray-600">No captures yet</span>
                </div>
              )}
              <div className="px-3 py-2">
                <p
                  className={`text-sm font-semibold ${isSelected ? "text-violet-400" : "text-white"}`}
                >
                  {m.member.name}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-500">{m.member.email}</p>
                  <span className="text-xs text-violet-400 font-medium">
                    {m.todayCount} today
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Screenshot gallery */}
      <div className="lg:col-span-2">
        {!selectedMember && (
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-16 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">Select an employee</p>
            <p className="text-xs text-gray-600 mt-1">
              Screenshots will appear here
            </p>
          </div>
        )}

        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  Screenshots for
                </p>
                <p className="text-lg font-bold text-white">
                  {selectedMember.name}
                </p>
              </div>
              <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
                {total} total
              </span>
            </div>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
              </div>
            )}

            {!loading && screenshots.length === 0 && (
              <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-12 flex flex-col items-center text-center">
                <p className="text-sm text-gray-400">No screenshots yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  Screenshots will appear once the employee enables monitoring
                </p>
              </div>
            )}

            {!loading && screenshots.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {screenshots.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => setLightbox(s)}
                      className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-violet-500/40 transition-all duration-300 aspect-video bg-gray-900"
                    >
                      <img
                        src={`${SERVER_BASE}${s.url}`}
                        alt="screenshot"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-white/80">
                          {new Date(s.capturedAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(s.capturedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() =>
                        loadScreenshots(selectedMember._id, page - 1)
                      }
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-400 hover:border-violet-500/40 hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {page} of {pages}
                    </span>
                    <button
                      onClick={() =>
                        loadScreenshots(selectedMember._id, page + 1)
                      }
                      disabled={page === pages}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-400 hover:border-violet-500/40 hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              Close ✕
            </button>
            <img
              src={`${SERVER_BASE}${lightbox.url}`}
              alt="full screenshot"
              className="w-full rounded-2xl border border-white/10 shadow-2xl"
            />
            <p className="text-center text-xs text-gray-500 mt-3">
              Captured at{" "}
              {new Date(lightbox.capturedAt).toLocaleString("en-US")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ TAB: ATTENDANCE ═══════════════ */
function AttendanceTab() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await API.get("/attendance/admin/summary");
        setSummary(data);
      } catch {}
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(
          `/attendance/admin/all?startDate=${startDate}&endDate=${endDate}`,
        );
        setRecords(data);
      } catch {}
      setLoading(false);
    };
    fetchRecords();
  }, [startDate, endDate]);

  const statusColors = {
    present: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    late: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    absent: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const presentCount = summary.filter((s) => s.status === "present").length;
  const lateCount = summary.filter((s) => s.status === "late").length;
  const absentCount = summary.filter((s) => s.status === "absent").length;

  return (
    <div className="space-y-6">
      {/* Today's Summary Cards */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Today's Overview
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Present", count: presentCount, color: "emerald" },
            { label: "Late", count: lateCount, color: "yellow" },
            { label: "Absent", count: absentCount, color: "red" },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              className={`relative bg-gray-900/80 border border-white/10 rounded-xl p-4 overflow-hidden hover:border-${color}-500/30 transition-all duration-300`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${color}-500/40 to-transparent`}
              />
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                {label}
              </p>
              <p className={`text-3xl font-bold text-${color}-400`}>{count}</p>
              <p className="text-xs text-gray-600 mt-0.5">employees</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's per-employee status */}
      {summary.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            Employee Status — Today
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.map(
              ({ member, status, checkIn, checkOut, totalHours }) => (
                <div
                  key={member._id}
                  className="bg-gray-900/80 border border-white/10 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>
                    <span
                      className={`ml-auto text-xs font-medium border rounded-full px-2 py-0.5 capitalize ${statusColors[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>
                      In: <span className="text-white">{fmtTime(checkIn)}</span>
                    </span>
                    <span>
                      Out:{" "}
                      <span className="text-white">{fmtTime(checkOut)}</span>
                    </span>
                    <span>
                      hrs:{" "}
                      <span className="text-emerald-400">
                        {formatDuration(totalHours)}
                      </span>
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Date-filtered History */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Attendance History
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
            />
            <span className="text-gray-600 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/40"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        )}

        {!loading && records.length === 0 && (
          <div className="bg-gray-900/80 border border-white/10 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">
              No attendance records in this date range
            </p>
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="bg-gray-900/80 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-widest font-medium">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-widest font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-widest font-medium">
                    Check In
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-widest font-medium">
                    Check Out
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-widest font-medium">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-widest font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr
                    key={r._id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                          {r.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">
                            {r.user?.name}
                          </p>
                          <p className="text-gray-600 text-[10px]">
                            {r.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {fmtDate(r.date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-white font-medium">
                      {fmtTime(r.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-xs text-white font-medium">
                      {fmtTime(r.checkOut)}
                    </td>
                    <td className="px-4 py-3 text-xs text-emerald-400 font-medium">
                      {formatDuration(r.totalHours)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium border rounded-full px-2 py-0.5 capitalize ${statusColors[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ TAB: MONITORING ═══════════════ */
function MonitoringTab() {
  const [data, setData] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [screenshotRes, attendanceRes, membersRes, warningsRes] =
        await Promise.all([
          API.get("/screenshots/admin/all"),
          API.get("/attendance/admin/summary"),
          API.get("/timelogs/admin/members"),
          API.get("/screenshots/admin/warnings"),
        ]);

      setWarnings(warningsRes.data || []);

      const memberStats = {};
      await Promise.all(
        membersRes.data.map(async (m) => {
          try {
            const { data: stats } = await API.get(
              `/timelogs/admin/members/${m._id}/stats`,
            );
            memberStats[m._id] = stats;
          } catch {}
        }),
      );

      const screenshotMap = {};
      screenshotRes.data.forEach((s) => {
        screenshotMap[s.member._id] = s;
      });

      const attendanceMap = {};
      attendanceRes.data.forEach((a) => {
        attendanceMap[a.member._id] = a;
      });

      const merged = membersRes.data.map((m) => ({
        member: m,
        screenshot: screenshotMap[m._id] || null,
        attendance: attendanceMap[m._id] || null,
        stats: memberStats[m._id] || null,
      }));

      setData(merged);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = (screenshot) => {
    if (!screenshot?.latest) return false;
    const diff = Date.now() - new Date(screenshot.latest.capturedAt).getTime();
    return diff < 5 * 60 * 1000;
  };

  return (
    <div className="space-y-6">
      {/* ── Monitoring Warnings Panel ── */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <p className="text-xs text-red-400 uppercase tracking-widest font-semibold">
              Monitoring Alerts
            </p>
            <span className="text-xs text-white bg-red-500/20 border border-red-500/30 rounded-full px-2 py-0.5 font-bold">
              {warnings.length}
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {warnings.map((w) => (
              <div
                key={w._id}
                className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-red-300">
                      {w.userName}
                    </p>
                    <span className="text-xs text-gray-500">{w.userEmail}</span>
                  </div>
                  <p className="text-xs text-red-300/80 mt-0.5">{w.reason}</p>
                </div>
                <p className="text-[10px] text-gray-600 shrink-0">
                  {new Date(w.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 uppercase tracking-widest">
          Live Employee Overview
        </p>
        <span className="text-xs text-gray-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Auto-refreshes every 30s
        </span>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map(({ member, screenshot, attendance, stats }) => {
          const online = isOnline(screenshot);
          const todayHours = stats?.todayTime || 0;
          const productivity = Math.min(
            100,
            Math.round((todayHours / (8 * 3600)) * 100),
          );

          return (
            <div
              key={member._id}
              className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Latest screenshot thumbnail */}
              {screenshot?.latest ? (
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={`${SERVER_BASE}${screenshot.latest.url}`}
                    alt="last screenshot"
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                  {/* Online badge */}
                  <div
                    className={`absolute top-2 right-2 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border
                    ${online ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-gray-800/80 border-white/10 text-gray-500"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`}
                    />
                    {online ? "Online" : "Offline"}
                  </div>
                  {/* Screenshot count */}
                  <div className="absolute top-2 left-2 text-xs text-white/70 bg-black/50 rounded-full px-2 py-0.5">
                    📸 {screenshot.todayCount} today
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gray-800/40 flex items-center justify-center relative">
                  <p className="text-xs text-gray-700">
                    No screen captures yet
                  </p>
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-800/80 border-white/10 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />{" "}
                    Offline
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg font-bold text-emerald-400 shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Today's hours + attendance */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-gray-500">Today</p>
                    <p className="text-emerald-400 font-bold text-sm">
                      {formatDuration(todayHours)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check In</p>
                    <p className="text-white font-medium">
                      {fmtTime(attendance?.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span
                      className={`text-xs font-medium border rounded-full px-2 py-0.5 capitalize
                      ${
                        attendance?.status === "present"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : attendance?.status === "late"
                            ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                            : "text-red-400 bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      {attendance?.status || "absent"}
                    </span>
                  </div>
                </div>

                {/* Productivity bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">Productivity</p>
                    <p className="text-xs font-semibold text-emerald-400">
                      {productivity}%
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${productivity}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Based on 8h workday
                  </p>
                </div>

                {/* Last screenshot time */}
                {screenshot?.latest && (
                  <p className="text-[10px] text-gray-600">
                    Last capture:{" "}
                    {new Date(screenshot.latest.capturedAt).toLocaleTimeString(
                      "en-US",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && data.length === 0 && (
        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-16 flex flex-col items-center text-center">
          <p className="text-sm text-gray-400">No employees found</p>
          <p className="text-xs text-gray-600 mt-1">
            Employees will appear here once they join your organization
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const TABS = [
  { id: "analytics", label: "Analytics", icon: "M18 20V10M12 20V4M6 20v-6" },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    hasAlert: true,
  },
  {
    id: "screenshots",
    label: "Screenshots",
    icon: "M2 3h20v14H2zM8 21h8M12 17v4",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: "M8 7V3m8 4V3M3 11h18M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  },
];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const [warningCount, setWarningCount] = useState(0);

  // Poll warning count every 15s so badge stays fresh
  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await API.get("/screenshots/admin/warnings");
        setWarningCount(data.length || 0);
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8 space-y-8">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            Admin Panel
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Team Management
          </h1>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-gray-900/60 border border-white/10 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
            {/* Red badge for monitoring alerts */}
            {tab.hasAlert && warningCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/30 animate-pulse">
                {warningCount > 9 ? "9+" : warningCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "monitoring" && <MonitoringTab />}
      {activeTab === "screenshots" && <ScreenshotsTab />}
      {activeTab === "attendance" && <AttendanceTab />}
    </div>
  );
}
