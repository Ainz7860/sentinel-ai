import React from 'react';
import { Shield, LayoutDashboard, Terminal, AlertTriangle, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Log Analyzer', icon: Terminal },
    { id: 'incidents', label: 'Incidents Feed', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
          <Shield className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            SENTINEL AI
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Autonomous SecOps
          </p>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                isActive
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-medium shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-500 font-mono">
          v1.0.0-Beta
        </p>
        <p className="text-[10px] text-indigo-400/60 font-mono mt-1">
          Secured by Gemini AI
        </p>
      </div>
    </aside>
  );
}
