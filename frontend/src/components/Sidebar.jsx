import { Shield, LayoutDashboard, Terminal, AlertTriangle, Settings, Database, Activity, LogOut, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, demoMode, setDemoMode }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Log Analyzer', icon: Terminal },
    { id: 'incidents', label: 'Incidents Feed', icon: AlertTriangle },
    { id: 'memory', label: 'Semantic Memory', icon: Database },
    { id: 'observability', label: 'Observability', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-900/60 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-900/60 flex items-center space-x-3">
        <div className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-500/25">
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
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group relative ${
                isActive
                  ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-medium shadow-[0_0_15px_rgba(99,102,241,0.08)]'
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
              }`}
            >
              {isActive && (
                <span className="absolute left-2 top-1/4 bottom-1/4 w-1 bg-indigo-400 rounded-full" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-450'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Interactive Demo Mode Toggle */}
      <div className="px-4 py-3 border-t border-slate-900/60 space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase font-semibold">DEMO SIMULATION</span>
          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${demoMode ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-500 border border-slate-750'}`}>
            {demoMode ? "ACTIVE" : "OFF"}
          </span>
        </div>
        <button
          onClick={() => setDemoMode(!demoMode)}
          onMouseEnter={() => {
            window.dispatchEvent(new CustomEvent('trigger-senti', {
              detail: {
                topicKey: "demo-mode",
                expression: "thinking",
                color: "cyan"
              }
            }));
          }}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 ${demoMode ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30' : 'bg-slate-900/30 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'} cursor-pointer`}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${demoMode ? 'bg-cyan-400 animate-ping' : 'bg-slate-650'}`} />
            <span className="text-xs font-semibold">Demo Mode</span>
          </div>
          <div className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-300 flex items-center ${demoMode ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'}`}>
            <div className="w-3 h-3 rounded-full bg-white shadow-md" />
          </div>
        </button>
      </div>

      {/* Sign Out Button */}
      <div className="px-4 py-2 border-t border-slate-900/60">
        <button
          onClick={() => setActiveTab('logout')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left text-slate-400 hover:bg-rose-500/10 hover:text-rose-450 border border-transparent group cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-rose-400 transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-900/60 text-center">
        <p className="text-[10px] text-slate-500 font-mono">
          v1.0.0-Beta
        </p>
        <p className="text-[10px] text-indigo-400/50 font-mono mt-1">
          Secured by Gemini AI
        </p>
      </div>
    </aside>
  );
}
