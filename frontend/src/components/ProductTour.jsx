import React, { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, X, Shield, Star } from 'lucide-react';

const TOUR_STEPS = [
  {
    targetTab: "dashboard",
    title: "Security Operations Command Center",
    description: "Your main hub for threat intelligence. Monitor real-time risk scores, active block rules, and automated telemetry trends.",
  },
  {
    targetTab: "analyzer",
    title: "Gemini Log Analyzer",
    description: "The core AI analysis panel. Paste raw security event logs and click Analyze to execute our multi-agent diagnostic pipeline.",
  },
  {
    targetTab: "incidents",
    title: "Incident Management Ledger",
    description: "A chronological audit of all detected intrusions. Review deep data logs, download PDF incident dossiers, or manually block hosts.",
  },
  {
    targetTab: "memory",
    title: "Semantic Case Memory",
    description: "Retrieves past resolved incidents using TF-IDF text similarity, helping you load previous containment rules instantly.",
  },
  {
    targetTab: "observability",
    title: "System Observability Feed",
    description: "Logs agent execution counts and latency charts. Essential for tracking API performance and model transaction overhead.",
  },
  {
    targetTab: "settings",
    title: "Autonomous Policy Configuration",
    description: "Change target Gemini reasoning models, configure FastAPI URLs, and adjust automated containment thresholds.",
  }
];

export default function ProductTour({ activeTab, setActiveTab, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActiveTab(TOUR_STEPS[nextStep].targetTab);
    } else {
      localStorage.setItem('sentinel_tour_completed', 'true');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActiveTab(TOUR_STEPS[prevStep].targetTab);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('sentinel_tour_completed', 'true');
    onComplete();
  };

  const stepInfo = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md glass-panel border border-indigo-500/25 p-6 rounded-2xl relative shadow-2xl animate-fade-in-up stagger-in">
        {/* Glowing corner borders */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br-xl" />

        {/* Close button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-500/30 text-indigo-400">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-indigo-400 font-mono tracking-widest font-bold uppercase">WALKTHROUGH TOUR</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{stepInfo.title}</h3>
          </div>
        </div>

        {/* Content */}
        <p className="text-xs text-slate-350 leading-relaxed mb-6 bg-slate-950/40 p-4 border border-slate-900/60 rounded-xl">
          {stepInfo.description}
        </p>

        {/* Footer controls */}
        <div className="flex justify-between items-center border-t border-slate-800/80 pt-4">
          {/* Progress indicators */}
          <div className="flex space-x-1">
            {TOUR_STEPS.map((_, idx) => (
              <span 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === idx ? 'bg-indigo-400 w-3.5' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono cursor-pointer"
            >
              SKIP
            </button>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 p-1.5 rounded-lg text-xs transition-colors flex items-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? "FINISH" : "NEXT"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
