import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, HelpCircle, Eye, RefreshCw, X } from 'lucide-react';

export default function Incidents({ incidents, onUpdateIncident }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.source_ip && incident.source_ip.includes(searchTerm)) ||
      (incident.description && incident.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = severityFilter === 'ALL' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || incident.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleUpdateStatus = (id, newStatus) => {
    onUpdateIncident(id, { status: newStatus });
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident({ ...selectedIncident, status: newStatus });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Incident Management Feed</h2>
          <p className="text-slate-400 text-sm mt-1">Audit log of all detected intrusion vectors, alerts, and autonomous responses.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search by IP, name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Severity */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-mono">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-350 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-350 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNRESOLVED">Unresolved</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="MITIGATED">Mitigated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Table of Incidents */}
        <div className="glass-panel rounded-2xl p-6 xl:col-span-2 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-4">Incident ID</th>
                <th className="pb-3">Threat Detail</th>
                <th className="pb-3 text-center">Severity</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-sm">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-mono">
                    No matching incidents found.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-900/35 transition-colors duration-150">
                    <td className="py-4 pl-4 font-mono text-xs text-slate-400">
                      #{incident.id}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{incident.title}</span>
                        <span className="text-[11px] text-slate-500 max-w-xs truncate">{incident.description}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-1">Source: {incident.source_ip || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
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
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="bg-slate-800 text-slate-300 border border-slate-700/50 hover:bg-slate-700 px-2 py-1 rounded text-xs transition-colors flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Incident Drawer */}
        <div className="xl:col-span-1">
          {selectedIncident ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6 border border-indigo-500/20 relative animate-slide-in">
              <button 
                onClick={() => setSelectedIncident(null)}
                className="absolute right-4 top-4 text-slate-500 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Incident details
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedIncident.title}
                </h3>
                <span className="text-xs text-slate-500 font-mono">ID: #{selectedIncident.id}</span>
              </div>

              {/* Status Update Control */}
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-900 space-y-2">
                <span className="text-xs text-slate-450 font-medium">Manage Status</span>
                <div className="flex space-x-2">
                  {['UNRESOLVED', 'INVESTIGATING', 'MITIGATED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedIncident.id, status)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold transition-all border ${
                        selectedIncident.status === status
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-slate-200'
                      }`}
                    >
                      {status.replace('ING', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="space-y-4 text-xs">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-450">Severity Rank:</span>
                  <span className="font-mono text-white font-semibold">{selectedIncident.severity}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-450">Source Host IP:</span>
                  <span className="font-mono text-white">{selectedIncident.source_ip || 'Internal System'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-450">Trigger Date:</span>
                  <span className="font-mono text-slate-350">{selectedIncident.timestamp || 'Unknown'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-455 block">Incident Description:</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-2.5 rounded-lg border border-slate-900">
                    {selectedIncident.description}
                  </p>
                </div>

                {selectedIncident.response_action && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold font-mono text-[10px]">
                      Mitigated with rule: {selectedIncident.response_action}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center text-slate-500 border border-dashed border-slate-800">
              <HelpCircle className="w-12 h-12 text-slate-600 mb-2" />
              <p className="text-sm font-medium">No Incident Selected</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Select an incident card in the left list to inspect detailed parameters, variables, and mitigation states.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
