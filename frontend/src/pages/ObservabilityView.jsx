import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, Activity, Clock, AlertCircle, BarChart3, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import EducationalTooltip from '../components/EducationalTooltip';

export default function ObservabilityView({ apiBase, demoMode }) {
  const [stats, setStats] = useState({
    agent_invocations: {
      "Security Guardian": 0,
      "Investigator Agent": 0,
      "Threat Intelligence Agent": 0,
      "Response Planner Agent": 0,
      "Orchestrator": 0
    },
    total_tool_calls: 0,
    average_latencies_ms: {
      "Security Guardian": 0.0,
      "Investigator Agent": 0.0,
      "Threat Intelligence Agent": 0.0,
      "Response Planner Agent": 0.0,
      "Orchestrator": 0.0
    },
    error_count: 0
  });

  const fetchStats = async () => {
    if (demoMode) {
      setStats({
        agent_invocations: {
          "Security Guardian": 142,
          "Investigator Agent": 142,
          "Threat Intelligence Agent": 138,
          "Response Planner Agent": 131,
          "Orchestrator": 131
        },
        total_tool_calls: 586,
        average_latencies_ms: {
          "Security Guardian": 150.5,
          "Investigator Agent": 420.2,
          "Threat Intelligence Agent": 640.8,
          "Response Planner Agent": 280.4,
          "Orchestrator": 1490.0
        },
        error_count: 0
      });
      return;
    }

    try {
      const response = await axios.get(`${apiBase}/api/observability/stats`);
      setStats(response.data);
    } catch (err) {
      console.warn("Backend observability offline. Using local simulation.");
      // Seed dummy metrics
      setStats({
        agent_invocations: {
          "Security Guardian": 24,
          "Investigator Agent": 24,
          "Threat Intelligence Agent": 21,
          "Response Planner Agent": 21,
          "Orchestrator": 21
        },
        total_tool_calls: 86,
        average_latencies_ms: {
          "Security Guardian": 420.5,
          "Investigator Agent": 1150.2,
          "Threat Intelligence Agent": 2450.8,
          "Response Planner Agent": 850.4,
          "Orchestrator": 4870.0
        },
        error_count: 1
      });
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [apiBase, demoMode]);

  // Recharts data conversion
  const barData = Object.keys(stats.average_latencies_ms).map(agent => ({
    name: agent.replace(" Agent", ""),
    latency: stats.average_latencies_ms[agent]
  }));

  const radarData = Object.keys(stats.agent_invocations).map(agent => ({
    subject: agent.replace(" Agent", ""),
    invocations: stats.agent_invocations[agent],
    fullMark: 200
  }));

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">System Observability</h2>
          <p className="text-slate-400 text-sm mt-1">
            Monitor execution performance, token allocations, and agent pipeline latencies.
          </p>
        </div>
        <EducationalTooltip term="Observability" />
      </div>

      {/* Observability Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-in">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between transition-glow">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Agent Invocations</p>
            <h3 className="text-3xl font-bold mt-2 font-mono text-white">
              {Object.values(stats.agent_invocations).reduce((a, b) => a + b, 0)}
            </h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between transition-glow">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tool Invocations</p>
            <h3 className="text-3xl font-bold mt-2 font-mono text-white">{stats.total_tool_calls}</h3>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between transition-glow">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center">
              Avg Pipeline Latency
              <EducationalTooltip term="Observability" />
            </p>
            <h3 className="text-3xl font-bold mt-2 font-mono text-white">
              {stats.average_latencies_ms["Orchestrator"] ? `${(stats.average_latencies_ms["Orchestrator"] / 1000).toFixed(2)}s` : "0.0s"}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between transition-glow">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Execution Faults</p>
            <h3 className="text-3xl font-bold mt-2 font-mono text-rose-400">{stats.error_count}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-455 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Latency & Invocation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latency Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/2 rounded-full blur-2xl" />
          <div>
            <h3 className="text-lg font-bold text-white">Agent Execution Latency</h3>
            <p className="text-xs text-slate-500 font-sans">Average time spent in milliseconds by each agent module.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#101827" opacity={0.6} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(99,102,241,0.2)', borderRadius: '14px' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="latency" fill="#6366f1" radius={[6, 6, 0, 0]} name="Latency (ms)" animationDuration={1800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invocations Radar Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/2 rounded-full blur-2xl" />
          <div>
            <h3 className="text-lg font-bold text-white">Agent Invocation Profiler</h3>
            <p className="text-xs text-slate-550">Total transaction distribution across agent instances.</p>
          </div>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#101827" />
                <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#334155" fontSize={8} />
                <Radar name="Invocations" dataKey="invocations" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} animationDuration={1800} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a13', borderColor: 'rgba(6,182,212,0.2)', borderRadius: '14px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
