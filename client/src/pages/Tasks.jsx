import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";


function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [form, setForm] = useState({ title: "", project: "", assignedTo: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchTasks = async () => {
    const { data } = await API.get("/tasks");
    setTasks(data);
  };

  const fetchProjects = async () => {
    const { data } = await API.get("/projects");
    setProjects(data);
  };

  useEffect(() => {
    if (user && user.role == "admin") {
      setIsAdmin(true);
      API.get("/timelogs/admin/members").then(({ data }) => setMembers(data)).catch(() => { });
    }
    fetchTasks();
    fetchProjects();
  }, [user]);

  const createTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await API.post("/tasks", form);
    setForm({ title: "", project: "", assignedTo: "" });
    await fetchTasks();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen px-6 py-8 space-y-8" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            Workspace
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Tasks
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
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>

      {isAdmin ? (
        <div className="relative bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              New Task
            </h2>
          </div>

          <form onSubmit={createTask} className="flex flex-col sm:flex-row gap-3">
            {/* Title input */}
            <div className="relative flex-[2]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                  <line x1="17" y1="18" x2="3" y2="18" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Task title"
                className="w-full bg-gray-800/80 border border-white/10 text-sm text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Project select */}
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <select
                className="w-full bg-gray-800/80 border border-white/10 text-sm text-white rounded-xl pl-10 pr-8 py-3 appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 cursor-pointer"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
              >
                <option value="" className="bg-gray-900">
                  Select project
                </option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-gray-900">
                    {p.name}
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <select
                className="w-full bg-gray-800/80 border border-white/10 text-sm text-white rounded-xl pl-10 pr-8 py-3 appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 cursor-pointer"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="" className="bg-gray-900">
                  Assign to (Self)
                </option>
                {members.map((m) => (
                  <option key={m._id} value={m._id} className="bg-gray-900">
                    {m.name}
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !form.title.trim()}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
            >
              {isSubmitting ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
              {isSubmitting ? "Adding..." : "Add Task"}
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center"></div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Tasks List */}
      <div className="space-y-4">
        {/* Section header */}
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
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              All Tasks
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="bg-gray-900/80 border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {tasks.length > 0 && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </span>
            )}
          </div>
        </div>

        {/* Empty state */}
        {(selectedProjectId ? tasks.filter(t => t.project?._id === selectedProjectId) : tasks).length === 0 && (
          <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-lg">
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
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">No tasks yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Create your first task above to get started
            </p>
          </div>
        )}

        {/* Task rows */}
        <div className="space-y-3">
          {(selectedProjectId ? tasks.filter(t => t.project?._id === selectedProjectId) : tasks).map((t, index) => (
            <div
              key={t._id}
              className="relative group bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl px-5 py-4 shadow-lg hover:border-emerald-500/30 hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Top accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Glow blob */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-4">
                {/* Index */}
                <span className="text-xs font-mono text-gray-600 w-5 text-right shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="w-px h-6 bg-white/10 shrink-0" />

                {/* Checkbox-style indicator */}
                <div className="w-5 h-5 rounded-md border border-white/20 group-hover:border-emerald-500/40 flex items-center justify-center shrink-0 transition-colors duration-300">
                  <div className="w-2 h-2 rounded-sm bg-white/10 group-hover:bg-emerald-500/40 transition-colors duration-300" />
                </div>

                {/* Title + project */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300 truncate">
                    {t.title}
                  </p>
                  {t.project?.name && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {t.project.name}
                    </p>
                  )}
                </div>

                {/* Project pill */}
                {t.project?.name && (
                  <div className="shrink-0 hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-emerald-400">
                      {t.project.name}
                    </span>
                  </div>
                )}

                {/* Arrow hint */}
                <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm shrink-0">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tasks;

