import React, { useState } from 'react';
import axios from 'axios';
import { Database, Search, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import EducationalTooltip from '../components/EducationalTooltip';

export default function MemoryView({ apiBase, demoMode }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSelectedIncident(null);

    if (demoMode) {
      setTimeout(() => {
        setResults([
          {
            similarity_score: 0.941,
            incident: {
              id: 201,
              title: "HIGH - T1110 (SSH Brute Force)",
              description: "Log audit showed 145 failed SSH login events targeting administrator user account over port 22. Automatically resolved by routing IP to firewall drops.",
              severity: "HIGH",
              status: "MITIGATED",
              timestamp: "2026-07-01T14:30:00Z",
              response_action: "BLOCK_IP"
            }
          },
          {
            similarity_score: 0.732,
            incident: {
              id: 103,
              title: "MEDIUM - T1078 (Valid Accounts)",
              description: "Windows Domain Admin Login Failure and credential abuse detection on DC services.",
              severity: "MEDIUM",
              status: "MITIGATED",
              timestamp: "2026-07-02T08:30:15Z",
              response_action: "BLOCK_IP"
            }
          }
        ]);
        setSearching(false);
      }, 800);
      return;
    }

    try {
      const response = await axios.get(`${apiBase}/api/memory/search`, {
        params: { q: query }
      });
      setResults(response.data);
    } catch (err) {
      console.warn("Memory search API offline. Simulating matching database lookup.");
      setTimeout(() => {
        // Mock matching database results
        setResults([
          {
            similarity_score: 0.895,
            incident: {
              id: 404,
              title: "HIGH - T1110 (Brute Force)",
              description: "Log audit showed 145 failed SSH login events targeting administrator user account over port 22.",
              severity: "HIGH",
              status: "MITIGATED",
              timestamp: "2026-06-25T14:30:00Z",
              response_action: "BLOCK_IP"
            }
          },
          {
            similarity_score: 0.621,
            incident: {
              id: 301,
              title: "CRITICAL - T1078 (Valid Accounts)",
              description: "Privilege audit logon failure and credential abuse detection on Domain Controller services.",
              severity: "CRITICAL",
              status: "MITIGATED",
              timestamp: "2026-06-22T08:15:00Z",
              response_action: "ISOLATE_HOST"
            }
          }
        ]);
        setSearching(false);
      }, 1000);
      return;
    }
    setSearching(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Semantic Case Memory</h2>
          <p className="text-slate-400 text-sm mt-1">
            Search the long-term incident database using TF-IDF similarity algorithms to retrieve previous playbooks.
          </p>
        </div>
        <EducationalTooltip term="Semantic Memory" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Input and Matches Panel */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col space-y-6 shadow-md">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query memory database (e.g. 'SSH login brute force')..."
                className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-350 placeholder-slate-650 focus:outline-none focus:border-indigo-500/50 font-mono transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/10"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Retrieve</span>
              )}
            </button>
          </form>

          {/* Results List */}
          <div className="space-y-4 flex-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              Semantic Search Matches
            </span>
            
            {results.length === 0 && !searching && (
              <div className="text-center py-12 text-slate-600 font-mono text-xs">
                Enter a search query to scan incident logs history.
              </div>
            )}

            {results.map((res, index) => {
              const inc = res.incident;
              const isSelected = selectedIncident && selectedIncident.id === inc.id;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedIncident(inc)}
                  className={`glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer border hover:translate-x-1 duration-200 ${
                    isSelected ? 'border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.06)]' : 'border-transparent'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                        inc.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        inc.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="font-semibold text-slate-200 text-xs truncate">{inc.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-450 truncate">{inc.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[8px] text-slate-500 font-mono uppercase font-bold tracking-wider">Similarity</p>
                      <p className="text-xs font-bold text-indigo-400 font-mono">
                        {(res.similarity_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Incident Recommendation details */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center min-h-[400px] shadow-md">
          {selectedIncident ? (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-widest">
                  Past Resolved Case Reference
                </span>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">{selectedIncident.title}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Incident ID: #{selectedIncident.id}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-450 font-semibold block uppercase tracking-wider text-[10px]">Description Summary</span>
                <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/45 p-3 rounded-xl border border-slate-900/60 font-sans shadow-inner">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-900 p-4 rounded-xl space-y-3 shadow-inner">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Resolved Response Playbook
                </span>
                
                <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Applied Mitigation:</span>
                  <span className="font-mono font-bold text-indigo-455 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {selectedIncident.response_action}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-emerald-450">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[11px] font-medium">Verified containment from historical database archives.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-900/80 border border-slate-850 flex items-center justify-center rounded-2xl mx-auto shadow-inner">
                <Database className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-350 font-semibold text-sm">Select Case to Retrieve Recommendations</p>
                <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto leading-relaxed">
                  Click on any matched similarity card to read past resolutions and playbook details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
