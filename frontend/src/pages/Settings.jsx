import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Cpu, Server, Key, AlertTriangle } from 'lucide-react';

export default function Settings({ apiBase, setApiBase }) {
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [autoMitigate, setAutoMitigate] = useState(true);
  const [mitigateThreshold, setMitigateThreshold] = useState('CRITICAL');
  const [backendUrl, setBackendUrl] = useState(apiBase);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiBase(backendUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Agent Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Configure Sentinel AI autonomous responses, threshold parameters, and backend services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* API & Backend configuration */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Backend Endpoints</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">FastAPI API Base URL</label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Gemini Engine parameters */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Gemini Reasoner Configuration</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-400 font-mono">Model ID</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 text-indigo-300 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500/50 font-mono"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep reasoning)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Autonomous Playbook policies */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 md:col-span-2">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Autonomous Mitigation Policies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Enable Real-time Auto-Mitigate</p>
                  <p className="text-xs text-slate-500 mt-0.5">Let Sentinel AI trigger firewall changes automatically without human prompt.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoMitigate}
                  onChange={(e) => setAutoMitigate(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded border-slate-800 bg-slate-950 cursor-pointer"
                />
              </div>
            </div>

            {autoMitigate && (
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">Auto-Mitigation Severity Threshold</label>
                <select
                  value={mitigateThreshold}
                  onChange={(e) => setMitigateThreshold(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 text-indigo-300 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500/50 font-mono"
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
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md flex items-center space-x-2"
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
