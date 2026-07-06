import React from 'react';
import { Shield, ShieldAlert, FileText, CheckCircle2, UserX, Network, Ban, AlertOctagon, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import EducationalTooltip from '../components/EducationalTooltip';

export default function Dashboard({ stats, incidents, onUpdateIncident, apiBase, demoMode }) {
  // Safe Fallback data for charts if none exists
  const trendData = demoMode ? [
    { name: '00:00', incidents: 1 },
    { name: '02:00', incidents: 4 },
    { name: '04:00', incidents: 2 },
    { name: '06:00', incidents: 8 },
    { name: '08:00', incidents: 5 },
    { name: '10:00', incidents: 12 },
    { name: '12:00', incidents: 9 },
  ] : [
    { name: '08:00', incidents: 2 },
    { name: '10:00', incidents: 5 },
    { name: '12:00', incidents: 3 },
    { name: '14:00', incidents: 8 },
    { name: '16:00', incidents: 4 },
    { name: '18:00', incidents: 10 },
    { name: '20:00', incidents: 6 },
  ];

  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.severity === 'CRITICAL').length || (demoMode ? 2 : 1), color: '#f43f5e' },
    { name: 'High', value: incidents.filter(i => i.severity === 'HIGH').length || (demoMode ? 3 : 3), color: '#fb923c' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'MEDIUM').length || (demoMode ? 2 : 5), color: '#fbbf24' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'LOW').length || 0, color: '#10b981' },
  ];

  const recentIncidents = incidents.slice(0, 5);
  const reportsList = incidents.filter(i => i.pdf_path);

  // Dynamic metrics calculation
  const riskScores = incidents.map(i => i.risk_score).filter(Boolean);
  const avgRisk = riskScores.length ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : (demoMode ? 81 : 75);
  const activeInvestigations = incidents.filter(i => i.status !== 'MITIGATED').length;

  const handleMitigate = async (incidentId, action) => {
    onUpdateIncident(incidentId, { status: 'MITIGATED', response_action: action });
  };

  return (
    <div className="space-y-8 animate-fade-in-up font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Security Operations Command</h2>
            {demoMode && (
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                SIMULATION ACTIVE
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">Real-time autonomous intrusion detection, threat parsing, and response center.</p>
        </div>
        <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            Active Guard: Autonomous
          </span>
        </div>
      </div>

      {/* Grid Metrics (Staggered Load) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-in">
        <MetricCard
          title={
            <span className="flex items-center">
              Threat Level Status
              <EducationalTooltip term="Threat Level" />
            </span>
          }
          value={stats.threatLevel || 'MODERATE'}
          icon={ShieldAlert}
          colorClass={
            stats.threatLevel === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
            stats.threatLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }
          borderGlow={
            stats.threatLevel === 'CRITICAL' ? 'glow-alert-red' :
            stats.threatLevel === 'HIGH' ? 'glow-alert-yellow' : ''
          }
          change={{ value: 'Elevated', label: 'past 24h logs', type: 'negative' }}
        />
        <MetricCard
          title="Active Investigations"
          value={activeInvestigations}
          icon={AlertOctagon}
          colorClass="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />
        <MetricCard
          title={
            <span className="flex items-center">
              Average Risk Score
              <EducationalTooltip term="Risk Score" />
            </span>
          }
          value={`${avgRisk}/100`}
          icon={Shield}
          colorClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        />
        <MetricCard
          title={
            <span className="flex items-center">
              Active Block Rules
              <EducationalTooltip term="Block Rules" />
            </span>
          }
          value={stats.blockRules || 0}
          icon={CheckCircle2}
          colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incident Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/2 rounded-full blur-2xl" />
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Incident Activity Trend</h3>
              <p className="text-xs text-slate-500">Triggered events categorized by 2-hour intervals.</p>
            </div>
            <div className="text-[10px] text-indigo-400 font-mono bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded">
              REAL-TIME FEED
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#101827" opacity={0.6} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(99,102,241,0.2)', borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorIncidents)" 
                  animationDuration={1800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/2 rounded-full blur-2xl" />
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Threat Severity Profile</h3>
              <p className="text-xs text-slate-550">Incidents grouped by danger level.</p>
            </div>
            <EducationalTooltip term="IOC" />
          </div>
          <div className="h-64 flex flex-col justify-between">
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#101827" opacity={0.6} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(6,182,212,0.2)', borderRadius: '14px' }}
                    labelStyle={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1800}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-900 text-center">
              {severityData.map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: d.color }} />
                  <span className="text-[9px] text-slate-500 font-mono font-semibold uppercase">{d.name}</span>
                  <span className="text-xs font-bold text-white font-mono mt-0.5">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Alerts Feed & Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Incident Feed (Left 2 Columns) */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Active Intrusion Alerts</h3>
            <p className="text-xs text-slate-500">Recently parsed threats requiring response planning.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-4">Timestamp</th>
                  <th className="pb-3">Source / Target</th>
                  <th className="pb-3">Threat Vector</th>
                  <th className="pb-3 text-center">Severity</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-4 text-right">Autonomous Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-sm">
                {recentIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-650 font-mono text-xs">
                      No active threat logs detected. Paste logs in "Log Analyzer" to populate.
                    </td>
                  </tr>
                ) : (
                  recentIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-indigo-950/5 hover:border-l-2 hover:border-indigo-500/30 transition-all duration-200">
                      <td className="py-4 pl-4 font-mono text-[10.5px] text-slate-400">
                        {incident.timestamp ? new Date(incident.timestamp).toLocaleTimeString() : 'Just now'}
                      </td>
                      <td className="py-4 font-semibold text-slate-200">
                        {incident.source_ip || incident.username || 'System'}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-350 font-medium text-xs">{incident.title}</span>
                          <span className="text-[10px] text-slate-500 max-w-xs truncate">{incident.description}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          incident.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]' :
                          incident.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          incident.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          incident.status === 'MITIGATED' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' :
                          incident.status === 'INVESTIGATING' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                        }`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        {incident.status === 'UNRESOLVED' ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleMitigate(incident.id, 'BLOCK_IP')}
                              className="bg-red-650/15 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 flex items-center space-x-1 cursor-pointer hover:scale-105"
                              title="Block Source IP Address"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Block</span>
                            </button>
                            <button
                              onClick={() => handleMitigate(incident.id, 'ISOLATE_HOST')}
                              className="bg-indigo-650/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 flex items-center space-x-1 cursor-pointer hover:scale-105"
                              title="Isolate Target Endpoint"
                            >
                              <Network className="w-3 h-3" />
                              <span>Isolate</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-900/60 border border-slate-950 px-2 py-0.5 rounded">
                            {incident.response_action || 'RESOLVED'}
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

        {/* Generated PDF Reports (Right 1 Column) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Generated Reports</h3>
              <p className="text-xs text-slate-550">Download compiled dossiers.</p>
            </div>
            <EducationalTooltip term="Autonomous Mitigation" />
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {reportsList.length === 0 ? (
              <div className="text-center py-12 text-slate-650 font-mono text-xs">
                No reports compiled yet.
              </div>
            ) : (
              reportsList.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between p-3.5 bg-slate-950/45 rounded-xl border border-slate-900/65 hover:border-slate-800 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                    <p className="text-xs font-semibold text-slate-350 truncate">{inc.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ID #{inc.id} • Risk Index: {inc.risk_score || 70}/100</p>
                  </div>
                  <a
                    href={`${apiBase}${inc.pdf_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
