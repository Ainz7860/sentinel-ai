import React from 'react';
import { Shield, ShieldAlert, FileText, CheckCircle2, UserX, Network, Ban, AlertOctagon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ stats, incidents, onUpdateIncident }) {
  // Safe Fallback data for charts if none exists
  const trendData = [
    { name: '08:00', incidents: 2 },
    { name: '10:00', incidents: 5 },
    { name: '12:00', incidents: 3 },
    { name: '14:00', incidents: 8 },
    { name: '16:00', incidents: 4 },
    { name: '18:00', incidents: 10 },
    { name: '20:00', incidents: 6 },
  ];

  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.severity === 'CRITICAL').length || 1, color: '#f87171' },
    { name: 'High', value: incidents.filter(i => i.severity === 'HIGH').length || 3, color: '#fb923c' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'MEDIUM').length || 5, color: '#fbbf24' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'LOW').length || 8, color: '#34d399' },
  ];

  const recentIncidents = incidents.slice(0, 5);

  const handleMitigate = async (incidentId, action) => {
    onUpdateIncident(incidentId, { status: 'MITIGATED', response_action: action });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Security Operations Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time autonomous intrusion detection, threat parsing, and response center.</p>
        </div>
        <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-xs font-semibold text-emerald-400 font-mono uppercase tracking-wider">
            Active Guard: Autonomous
          </span>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Threat Level Status"
          value={stats.threatLevel || 'MODERATE'}
          icon={ShieldAlert}
          colorClass="bg-rose-500/10 text-rose-400 border border-rose-500/20"
          borderGlow="glow-alert-yellow"
          change={{ value: 'Elevated', label: 'past 24h logs', type: 'negative' }}
        />
        <MetricCard
          title="Unresolved Incidents"
          value={stats.unresolved || 0}
          icon={AlertOctagon}
          colorClass="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />
        <MetricCard
          title="Total Logs Parsed"
          value={stats.totalLogs || 0}
          icon={FileText}
          colorClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        />
        <MetricCard
          title="Active Block Rules"
          value={stats.blockRules || 0}
          icon={CheckCircle2}
          colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incident Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Incident Activity Trend</h3>
            <p className="text-xs text-slate-400">Triggered events categorized by 2-hour intervals.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Threat Severity Profile</h3>
            <p className="text-xs text-slate-400">Incidents grouped by danger level.</p>
          </div>
          <div className="h-64 flex flex-col justify-between">
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
              {severityData.map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-slate-400 font-mono">{d.name}</span>
                  <span className="text-xs font-bold text-white font-mono mt-0.5">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Incident Feed & Quick Control */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Active Intrusion Alerts</h3>
            <p className="text-xs text-slate-400">Recently parsed threats requiring response planning.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-4">Timestamp</th>
                <th className="pb-3">Source IP / User</th>
                <th className="pb-3">Threat Type</th>
                <th className="pb-3 text-center">Severity</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-4 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {recentIncidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-mono">
                    No active threat logs detected. Paste logs in "Log Analyzer" to populate.
                  </td>
                </tr>
              ) : (
                recentIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-800/20 transition-colors duration-150">
                    <td className="py-4 pl-4 font-mono text-xs text-slate-400">{incident.timestamp || 'Just now'}</td>
                    <td className="py-4 font-semibold text-slate-200">
                      {incident.source_ip || incident.username || 'System'}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-300 font-medium">{incident.title}</span>
                        <span className="text-[11px] text-slate-500 max-w-xs truncate">{incident.description}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded font-mono ${
                        incident.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        incident.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        incident.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        incident.status === 'MITIGATED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        incident.status === 'INVESTIGATING' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      {incident.status === 'UNRESOLVED' ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleMitigate(incident.id, 'BLOCK_IP')}
                            className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                            title="Block Source IP"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Block</span>
                          </button>
                          <button
                            onClick={() => handleMitigate(incident.id, 'ISOLATE_HOST')}
                            className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-650 hover:text-white px-2.5 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                            title="Isolate Host Endpoint"
                          >
                            <Network className="w-3.5 h-3.5" />
                            <span>Isolate</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">
                          Action: {incident.response_action || 'Mitigated'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
