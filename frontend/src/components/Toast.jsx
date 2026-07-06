import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ id, type, message, onClose }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case 'error':
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'error':
      case 'critical':
        return 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
      case 'warning':
        return 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      default:
        return 'border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]';
    }
  };

  return (
    <div className={`glass-panel p-4 rounded-xl border flex items-center justify-between space-x-3 w-80 shadow-2xl transition-all duration-300 animate-slide-in ${getBorderColor()}`}>
      <div className="flex items-center space-x-3 min-w-0">
        {getIcon()}
        <p className="text-xs text-slate-200 font-medium leading-relaxed truncate-2-lines">
          {message}
        </p>
      </div>
      <button 
        onClick={() => onClose(id)}
        className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
