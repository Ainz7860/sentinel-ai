import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Cpu, Volume2, VolumeX, Database, Network } from 'lucide-react';

export default function BootScreen({ onComplete }) {
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef(null);

  const bootLogs = [
    { text: "Initializing Sentinel AI core framework...", icon: Shield, delay: 300 },
    { text: "Loading Security Guardian firewall matrices...", icon: Network, delay: 700 },
    { text: "Spawning Investigator agent sub-routines...", icon: Cpu, delay: 1100 },
    { text: "Verifying Threat Intelligence signatures database...", icon: Database, delay: 1500 },
    { text: "Syncing Semantic Case Memory repository...", icon: Database, delay: 1900 },
    { text: "Authenticating Gemini LLM endpoint pipelines...", icon: Cpu, delay: 2300 },
    { text: "System Integrity Scan: 100% OK. Loading Command Center.", icon: Shield, delay: 2800 }
  ];

  // Synth sound generator
  const playBeep = (freq, duration, type = 'sine') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  useEffect(() => {
    // Typewriter log sequencing
    bootLogs.forEach((log, index) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, log]);
        // Play a high-pitched sci-fi chime for log arrival
        playBeep(600 + index * 100, 0.15, 'triangle');
      }, log.delay);
    });

    // Progress bar loader
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Boot completion trigger
    const completeTimeout = setTimeout(() => {
      playBeep(880, 0.3, 'sine');
      setTimeout(() => {
        playBeep(1200, 0.4, 'sine');
      }, 100);
      onComplete();
    }, 3400);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [isMuted]);

  const handleToggleMute = () => {
    // Resume context if browser required interaction
    if (isMuted && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    setIsMuted(!isMuted);
    if (isMuted) {
      // Play brief test sound when unmuting
      setTimeout(() => playBeep(523.25, 0.1, 'sine'), 50);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#03070f] text-slate-200 overflow-hidden font-mono">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-30" />
      
      {/* Moving Scanning Line */}
      <div className="absolute left-0 right-0 h-[2px] bg-indigo-500/35 blur-sm animate-scanline pointer-events-none" />
      
      {/* Audio Toggle Button */}
      <button 
        onClick={handleToggleMute}
        className="absolute top-6 right-6 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center space-x-2 text-xs"
        title={isMuted ? "Unmute Boot Sounds" : "Mute Boot Sounds"}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        <span>{isMuted ? "SOUND OFF" : "SOUND ON"}</span>
      </button>

      {/* Main Terminal Frame */}
      <div className="w-full max-w-2xl px-6 md:px-12 py-10 glass-panel border border-indigo-500/20 rounded-3xl relative z-10 flex flex-col space-y-8">
        
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/35 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Shield className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-[0.25em] bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
              SENTINEL AI
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
              Autonomous Threat Containment & Response
            </p>
          </div>
        </div>

        {/* Diagnostic Logs console */}
        <div className="flex-1 min-h-[220px] bg-slate-950/70 border border-slate-900 rounded-2xl p-6 font-mono text-xs text-indigo-300 space-y-3.5 max-h-[260px] overflow-y-auto shadow-inner">
          <div className="flex items-center space-x-2 text-slate-500 border-b border-slate-900 pb-2">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] tracking-wider font-semibold uppercase">SYSTEM BOOT SEQUENCER v1.0.0</span>
          </div>

          <div className="space-y-2.5">
            {messages.map((msg, idx) => {
              const Icon = msg.icon;
              return (
                <div key={idx} className="flex items-center space-x-3 text-slate-300 animate-fade-in-up">
                  <span className="text-emerald-500 font-bold font-sans">✓</span>
                  <Icon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="font-mono text-slate-300">{msg.text}</span>
                </div>
              );
            })}
          </div>

          {messages.length < bootLogs.length && (
            <div className="flex items-center space-x-2 text-indigo-400/80 pl-6 mt-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
              <span className="cursor-blink pl-1 font-semibold">Running tasks...</span>
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span className="tracking-widest uppercase">BOOTING AI CORE AGENTS</span>
            <span className="font-bold text-indigo-400 font-mono">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-cyan-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
