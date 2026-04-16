import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import { AuthContext } from "../context/AuthContext";


function Projects() {
  const [projects, setProjects] = useState([]);
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [members, setMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fetchProjects = async () => {
    const { data } = await API.get("/projects");
    setProjects(data);
  };

  useEffect(() => {
    if (user && user.role == "admin") {
      setIsAdmin(true);
      API.get("/timelogs/admin/members").then(({ data }) => setMembers(data)).catch(() => {});
    }
    fetchProjects();
  }, [user]);

  const createProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await API.post("/projects", form);
    setForm({ name: "", description: "", members: [] });
    await fetchProjects();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8 space-y-8">
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
            Projects
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
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
              New Project
            </h2>
          </div>

          <form
            onSubmit={createProject}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
            {/* Name input */}
            <div className="relative flex-1">
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
                placeholder="Project name"
                className="w-full bg-gray-800/80 border border-white/10 text-sm text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Short description"
                className="w-full bg-gray-800/80 border border-white/10 text-sm text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !form.name.trim()}
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
              {isSubmitting ? "Adding..." : "Add Project"}
            </button>
            </div>

            {members.length > 0 && (
              <div className="w-full mt-1 bg-gray-800/40 border border-white/5 rounded-xl p-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Assign Members</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <label key={m._id} className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer transition-all ${form.members.includes(m._id) ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-500/10" : "bg-gray-900 border-white/10 hover:border-emerald-500/30"}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={form.members.includes(m._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, members: [...form.members, m._id] });
                          } else {
                            setForm({ ...form, members: form.members.filter((id) => id !== m._id) });
                          }
                        }}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${form.members.includes(m._id) ? "bg-emerald-500 border-emerald-500" : "bg-gray-800 border-white/20"}`}>
                        {form.members.includes(m._id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${form.members.includes(m._id) ? "text-emerald-400" : "text-white"}`}>{m.name}</p>
                        <p className="text-[10px] text-gray-500">{m.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="text-center"></div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Projects Grid */}
      <div className="space-y-4">
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
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              All Projects
            </h2>
          </div>
          {projects.length > 0 && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          )}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
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
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">No projects yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Create your first project above to get started
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;

