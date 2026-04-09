import React from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Inline SVG Icons ───────────────────────────────────────────── */
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="3" width="4" height="18" /><rect x="10" y="8" width="4" height="13" /><rect x="2" y="13" width="4" height="8" />
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-hidden flex flex-col font-sans">
      {/* ── Background Effects ────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] rounded-full bg-cyan-600/10 blur-[130px]" />
      </div>

      {/* ── Hero Section ────────────────────────── */}
      <main className="relative z-10 flex-grow flex flex-col pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Empowering Modern Workforces
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Workforce Analytics for
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              Distributed Teams
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Time Tracker's AI-powered workforce analytics solution for distributed, remote, and in-office teams offers peace of mind, accountability, and actionable insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 text-base font-bold text-[#080c14] rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(52,211,153,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Start Free Trial <IconArrowRight />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-base font-bold text-white rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] hover:border-emerald-500/40 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* ── Feature Cards ────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6 w-full mb-24">
          <div className="bg-white/[0.02] border border-white/[0.05] hover:border-teal-500/30 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <IconChart />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Spot inefficiencies</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Find better ways of working. Hidden inefficiencies slow progress before anyone notices. Track where time goes to re-allocate focus.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><IconCheck /> <span className="text-sm text-gray-300">AI-powered tracking</span></li>
              <li className="flex items-start gap-3"><IconCheck /> <span className="text-sm text-gray-300">Early warning signals</span></li>
            </ul>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <IconUsers />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Build performance</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Burnout creeps in quietly. Keep your teams aligned around clear priorities. Reduce bias in recognition, coaching, and planning.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><IconCheck /> <span className="text-sm text-gray-300">Align remote teams</span></li>
              <li className="flex items-start gap-3"><IconCheck /> <span className="text-sm text-gray-300">Fair performance views</span></li>
            </ul>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <IconShield />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Privacy & Security</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Accurate time tracking without micromanagement. Protect privacy with role-based controls and optional screenshot blurring.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><IconCheck /> <span className="text-sm text-gray-300">Role-based permissions</span></li>
              <li className="flex items-start gap-3"><IconCheck /> <span className="text-sm text-gray-300">Secure data storage</span></li>
            </ul>
          </div>
        </div>

        {/* ── Call to Action Panel ────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 to-[#080c14] border border-emerald-500/20 p-12 text-center">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Stop wondering. Start improving.</h2>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of organizations that rely on our analytics to transform their workforce performance. Set up in minutes.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="px-10 py-4 text-lg font-bold text-white rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all hover:scale-105"
          >
            Create Your Account
          </button>
        </div>
      </main>

      {/* ── Footer ────────────────────────── */}
      <footer className="border-t border-white/[0.05] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Time Tracker zt. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
