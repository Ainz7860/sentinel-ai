import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Cpu, Server, Key, AlertTriangle } from 'lucide-react';
import EducationalTooltip from '../components/EducationalTooltip';

export default function Settings({ apiBase, setApiBase, demoMode, notify }) {
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [autoMitigate, setAutoMitigate] = useState(true);
  const [mitigateThreshold, setMitigateThreshold] = useState('CRITICAL');
  const [backendUrl, setBackendUrl] = useState(apiBase);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiBase(backendUrl);
    setSaved(true);
    if (notify) notify("Agent configuration saved successfully.", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Agent Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Configure Sentinel AI autonomous responses, threshold parameters, and backend services.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-in">
        {/* API & Backend configuration */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/2 rounded-full blur-2xl" />
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2.5">
              <Server className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Backend Endpoints</h3>
            </div>
            <EducationalTooltip term="Observability" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] text-slate-450 font-semibold font-mono uppercase tracking-wider">FastAPI API Base URL</label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="bg-slate-950/80 border border-slate-850 rounded-xl p-3 text-sm text-indigo-300 placeholder-slate-650 focus:outline-none focus:border-indigo-500/50 font-mono transition-all focus:ring-1 focus:ring-indigo-500/35"
              />
            </div>
          </div>
        </div>

        {/* Gemini Engine parameters */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/2 rounded-full blur-2xl" />
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gemini Reasoner Configuration</h3>
            </div>
            <EducationalTooltip term="Prompt Injection" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] text-slate-450 font-semibold font-mono uppercase tracking-wider">Model ID</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="bg-slate-950/80 border border-slate-850 text-indigo-300 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500/50 font-mono cursor-pointer transition-all"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep reasoning)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Autonomous Playbook policies */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 md:col-span-2 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/1 rounded-full blur-3xl" />
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-455 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Autonomous Mitigation Policies</h3>
            </div>
            <EducationalTooltip term="Autonomous Mitigation" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/40 p-4 border border-slate-900 rounded-2xl shadow-inner">
                <div>
                  <p className="text-xs font-semibold text-white">Enable Real-time Auto-Mitigate</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">Let Sentinel AI trigger firewall changes automatically without manual verification.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoMitigate}
                  onChange={(e) => setAutoMitigate(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded border-slate-850 bg-slate-950 cursor-pointer transition-transform hover:scale-105"
                />
              </div>
            </div>

            {autoMitigate && (
              <div className="flex flex-col space-y-1.5 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl shadow-inner justify-center">
                <label className="text-[10px] text-slate-450 font-semibold font-mono uppercase tracking-wider">Auto-Mitigation Severity Threshold</label>
                <select
                  value={mitigateThreshold}
                  onChange={(e) => setMitigateThreshold(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-indigo-300 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500/50 font-mono cursor-pointer transition-all mt-1.5"
                >
                  <option value="CRITICAL">Critical Threats Only (Recommended)</option>
                  <option value="HIGH">High & Critical Threats</option>
                  <option value="MEDIUM">Medium, High & Critical Threats</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saved}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 flex items-center space-x-2 hover:scale-[1.01] cursor-pointer"
        >
          {saved ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Config Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
