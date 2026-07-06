import React, { useState, useEffect } from 'react';

export default function MetricCard({ title, value, change, icon: Icon, colorClass, borderGlow }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Parse numeric value to animate if it's a number or formatted string
    let target = 0;
    let suffix = '';
    let prefix = '';
    
    if (typeof value === 'number') {
      target = value;
    } else if (typeof value === 'string') {
      const match = value.match(/^([^\d]*)([\d]+)(.*)$/);
      if (match) {
        prefix = match[1] || '';
        target = parseInt(match[2], 10);
        suffix = match[3] || '';
      } else {
        setDisplayValue(value);
        return;
      }
    } else {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1200; // 1.2 seconds duration
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + easeProgress * (target - start));
      
      setDisplayValue(`${prefix}${currentVal}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // set precise target at completion
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className={`glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-glow ${borderGlow || ''}`}>
      {/* Decorative Gradient Background */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-2 font-mono tracking-tight text-white">{displayValue}</h3>
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
