import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, HelpCircle, Eye, RefreshCw, X, AlertOctagon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EducationalTooltip from '../components/EducationalTooltip';

export default function Incidents({ incidents, onUpdateIncident, demoMode, apiBase }) {
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
    <div className="space-y-8 animate-fade-in-up relative">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Incident Management Feed</h2>
          <p className="text-slate-400 text-sm mt-1">Audit log of all detected intrusion vectors, alerts, and autonomous responses.</p>
        </div>
        <div className="flex items-center space-x-1.5">
          <EducationalTooltip term="MITRE ATT&CK" />
          <EducationalTooltip term="Block Rules" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center justify-between shadow-lg">
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
            className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-350 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Severity */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-mono">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-850 text-slate-350 text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
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
              className="bg-slate-950/80 border border-slate-850 text-slate-350 text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
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
        <div className="glass-panel rounded-2xl p-6 xl:col-span-2 overflow-x-auto shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-4">Incident ID</th>
                <th className="pb-3">Threat Detail</th>
                <th className="pb-3 text-center">Severity</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-sm">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-650 font-mono">
                    No matching incidents found.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-indigo-950/5 hover:border-l-2 hover:border-indigo-500/35 transition-all duration-150">
                    <td className="py-4 pl-4 font-mono text-xs text-slate-400">
                      #{incident.id}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 text-xs">{incident.title}</span>
                        <span className="text-[10px] text-slate-500 max-w-xs truncate mt-0.5">{incident.description}</span>
                        <span className="text-[10px] text-slate-450 font-mono mt-1 flex items-center space-x-1">
                          <span>Source: {incident.source_ip || 'System'}</span>
                          {incident.risk_score && (
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-sans ml-2">
                              Risk: {incident.risk_score}/100
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                        incident.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]' :
                        incident.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        incident.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
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
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="bg-slate-900 text-slate-300 border border-slate-800 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white px-2.5 py-1 rounded text-xs transition-all duration-200 flex items-center space-x-1 ml-auto cursor-pointer hover:scale-105"
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

        {/* Selected Incident Drawer (Sliding Panel) */}
        <div className="xl:col-span-1 h-full min-h-[350px]">
          <AnimatePresence mode="wait">
            {selectedIncident ? (
              <motion.div
                key={selectedIncident.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="glass-panel p-6 rounded-2xl space-y-6 border border-indigo-500/20 relative shadow-2xl"
              >
                <button 
                  onClick={() => setSelectedIncident(null)}
                  className="absolute right-4 top-4 text-slate-500 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                    Incident details
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 uppercase tracking-wide leading-snug">
                    {selectedIncident.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-500 font-mono">ID: #{selectedIncident.id}</span>
                    {selectedIncident.risk_score && (
                      <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.2 rounded font-bold font-mono">
                        RISK: {selectedIncident.risk_score}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Update Control */}
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-900 space-y-2.5 shadow-inner">
                  <span className="text-xs text-slate-450 font-semibold uppercase tracking-wider font-mono text-[10px]">Manage Containment Status</span>
                  <div className="flex space-x-2">
                    {['UNRESOLVED', 'INVESTIGATING', 'MITIGATED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedIncident.id, status)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all border cursor-pointer ${
                          selectedIncident.status === status
                            ? 'bg-indigo-650/30 text-indigo-300 border-indigo-500/40 shadow-inner'
                            : 'bg-slate-900/60 text-slate-450 border-slate-850 hover:text-slate-200'
                        }`}
                      >
                        {status.replace('ING', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Specs */}
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-450 flex items-center">
                      Severity Rank
                      <EducationalTooltip term="Threat Level" />
                    </span>
                    <span className={`font-mono font-bold ${
                      selectedIncident.severity === 'CRITICAL' ? 'text-rose-455' :
                      selectedIncident.severity === 'HIGH' ? 'text-orange-400' :
                      selectedIncident.severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{selectedIncident.severity}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-450">Source Host IP:</span>
                    <span className="font-mono text-white font-medium">{selectedIncident.source_ip || 'Internal System'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-450">Trigger Date:</span>
                    <span className="font-mono text-slate-400">{selectedIncident.timestamp ? new Date(selectedIncident.timestamp).toLocaleString() : 'Just now'}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-slate-450 block font-semibold">Incident Description:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-900/80 font-sans shadow-inner">
                      {selectedIncident.description}
                    </p>
                  </div>

                  {selectedIncident.response_action && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 p-3.5 rounded-xl flex items-center space-x-2.5 shadow-md shadow-emerald-500/5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold font-mono text-[9px] tracking-wider uppercase">
                        Mitigated with rule: {selectedIncident.response_action}
                      </span>
                    </div>
                  )}

                  {selectedIncident.pdf_path && (
                    <a
                      href={`${apiBase}${selectedIncident.pdf_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-indigo-650/15 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white font-semibold py-3 rounded-xl transition-all duration-200 text-xs flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01] mt-3"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Download PDF Incident Dossier</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center text-slate-500 border border-dashed border-slate-800 shadow-md">
                <AlertOctagon className="w-12 h-12 text-slate-650 mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-slate-350">No Incident Selected</p>
                <p className="text-xs text-slate-550 mt-1 max-w-xs leading-relaxed">
                  Select an incident card in the left ledger to audit forensic variables, risk coefficients, and mitigation logs.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
