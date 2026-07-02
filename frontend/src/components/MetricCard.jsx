import React from 'react';

export default function MetricCard({ title, value, change, icon: Icon, colorClass, borderGlow }) {
  return (
    <div className={`glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-glow ${borderGlow || ''}`}>
      {/* Decorative Gradient Background */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-2 font-mono tracking-tight text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass || 'bg-slate-800/50 text-slate-400 border border-slate-700/30'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {change && (
        <div className="mt-4 flex items-center space-x-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change.type === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
            change.type === 'negative' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
          }`}>
            {change.value}
          </span>
          <span className="text-xs text-slate-500">{change.label}</span>
        </div>
      )}
    </div>
  );
}
