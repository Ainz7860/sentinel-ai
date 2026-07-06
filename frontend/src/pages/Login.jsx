import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ apiBase, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiBase}/api/auth/login`, {
        username,
        password
      });
      const { access_token } = response.data;
      onLoginSuccess(access_token);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.detail || "Incorrect username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03060c] p-6 relative overflow-hidden font-sans">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      
      {/* Moving scanning line */}
      <div className="absolute left-0 right-0 h-[1.5px] bg-indigo-500/20 blur-xs animate-scanline pointer-events-none" />

      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-indigo-650/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-indigo-500/15 relative z-10 space-y-8 shadow-2xl animate-fade-in-up stagger-in">
        {/* Glowing border accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-indigo-500 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-500 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-indigo-500 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-indigo-500 rounded-br-3xl" />

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center rounded-2xl mx-auto shadow-[0_0_20px_rgba(99,102,241,0.15)] animate-pulse">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-[0.2em] bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              SENTINEL AI
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
              Autonomous SecOps Portal
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-455 px-4 py-3 rounded-xl flex items-center space-x-2.5 text-xs font-mono shadow-[0_0_10px_rgba(244,63,94,0.05)]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider font-mono">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-650" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950/70 border border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-300 placeholder-slate-650 focus:outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/30"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider font-mono">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-655" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/70 border border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-300 placeholder-slate-655 focus:outline-none focus:border-indigo-500/50 transition-all focus:ring-1 focus:ring-indigo-500/30"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm mt-8 shadow-lg shadow-indigo-600/10 cursor-pointer hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating Core Access...</span>
              </>
            ) : (
              <span className="font-semibold uppercase tracking-wider text-xs">Access Command Center</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
