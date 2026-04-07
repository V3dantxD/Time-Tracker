export default function ProjectCard({ project }) {
  return (
    <div className="relative group bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Subtle glow blob on hover */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon + Title Row */}
      <div className="flex items-center gap-3 mb-3">
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

        <h2 className="text-base font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors duration-300 truncate">
          {project.name}
        </h2>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
        {project.description}
      </p>

      {/* Bottom divider + arrow hint */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-gray-600 uppercase tracking-widest font-medium">
          Project
        </span>
        <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0 text-sm">
          →
        </span>
      </div>
    </div>
  );
}

// export default function ProjectCard({ project }) {
//   return (
//     <div className="border p-4 rounded shadow">
//       <h2 className="text-lg font-semibold">{project.name}</h2>
//       <p className="text-gray-600">{project.description}</p>
//     </div>
//   );
// }
