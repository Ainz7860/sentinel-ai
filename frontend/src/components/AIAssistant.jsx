import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, HelpCircle, X, MessageSquare, ShieldCheck, Play, ChevronRight, Volume2, VolumeX } from 'lucide-react';

const SECURITY_TIPS = [
  "MITRE ATT&CK maps real-world adversary tactics. Use it to understand the hacker's ultimate goal.",
  "SSH Brute Force attacks target default accounts. Enforce public-key authentication to shut them down.",
  "DNS Tunneling routes malicious payloads through normal DNS requests. Monitor unusual TXT query spikes.",
  "Prompt Injection exploits AI agents by feeding malicious inputs. Keep LLM guardrails active and strict.",
  "Credential stuffing attacks reuse passwords. Multi-factor authentication is your strongest defense.",
  "A high Risk Score means multiple threat signals have correlated on a single host. Investigate immediately!"
];

// Context definitions for educational topics
const TOPIC_EXPLANATIONS = {
  "risk-score": {
    topic: "Risk Score",
    detailed: "A weighted rating from 0 to 100 calculated by correlating threat events. Any score exceeding 75 triggers instant quarantine.",
    short: "Correlated risk rating. Over 75 initiates autonomous blocks.",
    advanced: "Calculated dynamically: R = min(100, Sum(Weight_i * Confidence_i * Severity_i)). This reduces false positives by requiring correlation across multiple agents."
  },
  "mitre-attack": {
    topic: "MITRE ATT&CK Mapping",
    detailed: "An industry-standard framework documenting adversary tactics. Mapping threats to it helps identify the attacker's ultimate intent.",
    short: "Industry framework mapping attacker tactics and techniques.",
    advanced: "Matches logs against specific technique codes (e.g. T1110 for Brute Force). This allows SecOps engines to predict lateral movement vectors."
  },
  "observability": {
    topic: "Observability Metrics",
    detailed: "Monitors execution speeds and error logs across our cognitive agent pools to detect latency anomalies.",
    short: "Real-time performance metrics tracking agent response speeds.",
    advanced: "Measures average response speeds per run. Sudden spikes indicate model timeouts, API throttling, or prompt processing delays."
  },
  "auto-mitigation": {
    topic: "Autonomous Mitigation",
    detailed: "Let's Sentinel AI automatically apply firewall drops or quarantine rules for severe incidents without manual review.",
    short: "Automatic containment of critical threats without analyst prompts.",
    advanced: "Integrates with Edge APIs to inject real-time block rules. Operates on a feedback loop to prevent service disruption."
  },
  "prompt-injection": {
    topic: "Prompt Injection",
    detailed: "A vulnerability where malicious users insert system commands into logs to trick or bypass LLM guardrails.",
    short: "Exploiting AI by feeding malicious command inputs.",
    advanced: "Sentinel AI enforces strict schema parsing and uses secondary validator models to screen raw logs before main inference."
  },
  "semantic-memory": {
    topic: "Semantic Memory",
    detailed: "A vector database matching historical incidents to retrieve verified playbooks, saving diagnostic time.",
    short: "Vector database storing past incident resolutions.",
    advanced: "Transforms incident logs into vector embeddings, calculating cosine similarity ratios. Matches above 85% retrieve playbooks automatically."
  },
  "gemini-api": {
    topic: "Gemini Reasoner",
    detailed: "Our primary model reasoning core. It handles complex security logs, maps tactics, and designs mitigation rules.",
    short: "Google Gemini engine powering threat analysis.",
    advanced: "Configured for low temperature to minimize hallucinations, utilizing dynamic system prompts with few-shot threat templates."
  },
  "demo-mode": {
    topic: "Demo Mode Simulator",
    detailed: "Bypasses live FastAPI calls to show pre-packaged security incident flows, allowing instant feature testing.",
    short: "Mock environment simulator for offline capstone judging.",
    advanced: "Intercepts network requests and seeds mock telemetry, database incidents, and agent timers to emulate production performance."
  },
  "pdf-report": {
    topic: "PDF Incident Export",
    detailed: "Generates comprehensive PDF summaries including incident scores, MITRE mappings, and timestamps for compliance records.",
    short: "Forensic PDF reports documenting investigation findings.",
    advanced: "Uses Python ReportLab in the backend to compile vector flow diagrams, risk charts, and audit trails into secure read-only files."
  },
  "threat-intelligence": {
    topic: "Threat Intelligence",
    detailed: "Feeds external database logs (IP reputation lists, known malware patterns) to verify if source IPs are malicious.",
    short: "IP lookup reputation verification feeds.",
    advanced: "Correlates source headers with known malicious ranges. Signals are sent to the investigator agent to adjust threat severity."
  }
};

const TAB_INTRODUCTIONS = {
  dashboard: "Welcome to the Command Hub. We monitor real-time threat levels, risk indexing, and autonomous blocks here.",
  analyzer: "Paste your Windows, Linux, or Firewall logs here. I will trigger a multi-agent Gemini scan to parse them.",
  incidents: "This is the active threat ledger. You can inspect deep security variables or trigger manual IP blocks.",
  memory: "I search long-term memory for similar past incident patterns here to retrieve tested mitigation guides.",
  observability: "This charts agent performance and latency. Sub-second response limits are our target!",
  settings: "Adjust Gemini model targets, API URLs, and toggle automatic autonomous mitigation parameters here."
};

// Presenter walkthrough steps
const WALKTHROUGH_STEPS = [
  {
    tab: "dashboard",
    title: "Step 1: Security Dashboard",
    text: "Welcome to the Sentinel AI Walkthrough! Here you monitor overall threat conditions, risk indexes, and block metrics at a glance.",
    expression: "happy",
    color: "cyan"
  },
  {
    tab: "analyzer",
    title: "Step 2: Log Analyzer",
    text: "Let's check the Log Analyzer page. This is where we feed raw security logs into our cognitive reasoning loops.",
    expression: "thinking",
    color: "cyan"
  },
  {
    tab: "analyzer",
    title: "Step 3: Feed Raw Logs",
    text: "We can select a pre-loaded threat log (like Linux SSH Brute Force) or paste custom security logs.",
    expression: "normal",
    color: "cyan"
  },
  {
    tab: "analyzer",
    title: "Step 4: Execute Agent Grid",
    text: "When analysis runs, you see the active Agent Sequencing Grid. Each agent calculates task timers to ensure transparency.",
    expression: "thinking",
    color: "amber"
  },
  {
    tab: "incidents",
    title: "Step 5: Incident Ledger",
    text: "Let's review the Incident Feed. This stores all past logs, threat rankings, and containment actions.",
    expression: "alert",
    color: "rose"
  },
  {
    tab: "incidents",
    title: "Step 6: Containment Action",
    text: "You can click on any card to inspect IP addresses, MITRE codes, and manually update mitigation rules.",
    expression: "happy",
    color: "cyan"
  },
  {
    tab: "memory",
    title: "Step 7: Semantic Memory",
    text: "Here we search the TF-IDF vector index to retrieve matching past resolutions, preventing duplicate analysis.",
    expression: "thinking",
    color: "cyan"
  },
  {
    tab: "observability",
    title: "Step 8: System Health",
    text: "In the Observability tab, we track latencies and invocation volumes to verify that the Gemini engine runs efficiently.",
    expression: "happy",
    color: "cyan"
  },
  {
    tab: "settings",
    title: "Step 9: Policy Config",
    text: "Finally, in Settings, you can configure model names, base URLs, and toggle real-time auto-mitigation policies.",
    expression: "thinking",
    color: "cyan"
  },
  {
    tab: "dashboard",
    title: "Tour Complete!",
    text: "That completes our tour! Feel free to upload logs or toggle Demo Mode to explore the system at your leisure.",
    expression: "happy",
    color: "emerald"
  }
];

export default function AIAssistant({ activeTab, onTabChange }) {
  const [minimized, setMinimized] = useState(true);
  const [bubbleText, setBubbleText] = useState("");
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [faceExpression, setFaceExpression] = useState("normal"); // normal, happy, thinking, alert
  const [hologramColor, setHologramColor] = useState("cyan"); // cyan, amber, rose, emerald
  const [tipIndex, setTipIndex] = useState(0);

  // Walkthrough State
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [walkthroughIdx, setWalkthroughIdx] = useState(0);

  // Session history tracker to prevent repetitive dialogue
  const explainedCount = useRef({});

  // Listen to navigation changes
  useEffect(() => {
    if (walkthroughActive) return; // Ignore tab changes if walkthrough is running
    
    const count = explainedCount.current[activeTab] || 0;
    explainedCount.current[activeTab] = count + 1;

    let dialogue = "";
    if (count === 0) {
      dialogue = TAB_INTRODUCTIONS[activeTab] || "I am monitoring the active session logs.";
    } else if (count === 1) {
      dialogue = `Returned to ${activeTab.toUpperCase()}. Standing by.`;
    } else {
      dialogue = `Monitoring ${activeTab}. Ready for commands.`;
    }

    setBubbleText(dialogue);
    setCurrentTopic(null);
    setShowAdvanced(false);
    setFaceExpression("happy");
    setHologramColor("cyan");
    const timer = setTimeout(() => setFaceExpression("normal"), 1500);
    return () => clearTimeout(timer);
  }, [activeTab, walkthroughActive]);

  // Listen to custom "trigger-senti" events for interactive component hovers/clicks
  useEffect(() => {
    const handleTrigger = (e) => {
      const { topicKey, expression, color } = e.detail;
      const topicObj = TOPIC_EXPLANATIONS[topicKey];
      if (!topicObj) return;

      setMinimized(false);
      setCurrentTopic(topicObj);
      setShowAdvanced(false);
      if (expression) setFaceExpression(expression);
      if (color) setHologramColor(color);

      // Smart conversation logic
      const count = explainedCount.current[topicKey] || 0;
      explainedCount.current[topicKey] = count + 1;

      if (count === 0) {
        setBubbleText(topicObj.detailed);
      } else if (count === 1) {
        setBubbleText(topicObj.short);
      } else {
        setBubbleText(`Explained ${topicObj.topic} previously. Tap below for the advanced breakdown.`);
      }
    };

    window.addEventListener('trigger-senti', handleTrigger);
    return () => window.removeEventListener('trigger-senti', handleTrigger);
  }, []);

  // Handler to progress Walkthrough
  useEffect(() => {
    if (!walkthroughActive) return;
    const step = WALKTHROUGH_STEPS[walkthroughIdx];
    if (!step) return;

    if (onTabChange) onTabChange(step.tab);
    setBubbleText(step.text);
    setFaceExpression(step.expression);
    setHologramColor(step.color);
    setCurrentTopic(null);
    setShowAdvanced(false);
  }, [walkthroughIdx, walkthroughActive]);

  const handleNextWalkthrough = () => {
    if (walkthroughIdx < WALKTHROUGH_STEPS.length - 1) {
      setWalkthroughIdx(walkthroughIdx + 1);
    } else {
      stopWalkthrough();
    }
  };

  const startWalkthrough = () => {
    setWalkthroughActive(true);
    setWalkthroughIdx(0);
    setMinimized(false);
  };

  const stopWalkthrough = () => {
    setWalkthroughActive(false);
    setWalkthroughIdx(0);
    setBubbleText("Walkthrough complete. Standing by.");
    setFaceExpression("happy");
    setHologramColor("cyan");
  };

  const triggerTip = () => {
    const nextIdx = (tipIndex + 1) % SECURITY_TIPS.length;
    setTipIndex(nextIdx);
    setBubbleText(`Security Tip: ${SECURITY_TIPS[nextIdx]}`);
    setFaceExpression("thinking");
    setHologramColor("amber");
    setTimeout(() => setFaceExpression("normal"), 2000);
  };

  const getFaceSVG = () => {
    switch (faceExpression) {
      case "happy":
        return (
          <svg className="w-8 h-4 text-cyan-400" viewBox="0 0 40 20" fill="none">
            <path d="M10 12C12 8 14 8 16 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M24 12C26 8 28 8 30 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M16 16C16 16 18 18 20 18C22 18 24 16 24 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case "thinking":
        return (
          <svg className="w-8 h-4 text-cyan-400" viewBox="0 0 40 20" fill="none">
            <path d="M10 12H16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M24 10C26 8 28 8 30 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M16 16H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "alert":
        return (
          <svg className="w-8 h-4 text-rose-455" viewBox="0 0 40 20" fill="none">
            <circle cx="13" cy="11" r="2.5" fill="currentColor" />
            <circle cx="27" cy="11" r="2.5" fill="currentColor" />
            <path d="M17 16H23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      default: // normal
        return (
          <svg className="w-8 h-4 text-cyan-400" viewBox="0 0 40 20" fill="none">
            <path d="M10 10H15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M25 10H30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M18 15H22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const colorClasses = {
    cyan: "border-cyan-500/20 text-cyan-400 shadow-[0_4px_30px_rgba(6,182,212,0.15)]",
    amber: "border-amber-500/20 text-amber-400 shadow-[0_4px_30px_rgba(245,158,11,0.15)]",
    rose: "border-rose-500/20 text-rose-455 shadow-[0_4px_30px_rgba(244,63,94,0.15)]",
    emerald: "border-emerald-500/20 text-emerald-450 shadow-[0_4px_30px_rgba(16,185,129,0.15)]"
  };

  const droneGlow = {
    cyan: "shadow-[0_0_15px_rgba(6,182,212,0.4)] border-cyan-400",
    amber: "shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-400",
    rose: "shadow-[0_0_15px_rgba(244,63,94,0.4)] border-rose-400",
    emerald: "shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-400"
  };

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="w-14 h-14 bg-slate-900 border border-indigo-500/40 text-cyan-400 hover:text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] transition-all duration-300 hover:scale-105 cursor-pointer relative group"
        >
          <span className="absolute inset-0 rounded-full border border-cyan-400/35 animate-ping opacity-60 pointer-events-none" />
          <MessageSquare className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold font-mono">Senti</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm flex flex-col items-end space-y-3 font-sans select-none">
      {/* Speech Bubble */}
      <div className={`glass-panel border rounded-2xl p-4 relative flex flex-col space-y-2.5 w-72 animate-fade-in-up ${colorClasses[hologramColor]}`}>
        {/* Corner Decors */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-current opacity-40" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-current opacity-40" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-current opacity-40" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-current opacity-40" />

        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-ping" />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">
              {walkthroughActive ? WALKTHROUGH_STEPS[walkthroughIdx].title : "SENTI CO-PILOT"}
            </span>
          </div>
          <button 
            onClick={() => {
              if (walkthroughActive) stopWalkthrough();
              setMinimized(true);
            }}
            className="text-slate-500 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-slate-300 leading-relaxed font-sans min-h-[48px]">
          {bubbleText}
        </p>

        {/* Educational Advanced Mode Toggle */}
        {currentTopic && (
          <div className="space-y-1.5 pt-1 border-t border-slate-900">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[9px] text-cyan-400 hover:text-cyan-300 font-mono tracking-wider flex items-center space-x-1 cursor-pointer"
            >
              <span>{showAdvanced ? "[-] Hide Mechanics" : "[+] Show Advanced Mechanics"}</span>
            </button>
            {showAdvanced && (
              <p className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-900/60 font-mono leading-relaxed shadow-inner">
                {currentTopic.advanced}
              </p>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex space-x-2 pt-1">
          {walkthroughActive ? (
            <>
              <button
                onClick={handleNextWalkthrough}
                className="flex-1 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 text-indigo-400 text-[10px] py-1.5 rounded-lg font-mono font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>{walkthroughIdx === WALKTHROUGH_STEPS.length - 1 ? "FINISH" : "NEXT STEP"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={stopWalkthrough}
                className="px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-455 hover:text-slate-200 text-[10px] py-1.5 rounded-lg font-mono transition-colors cursor-pointer"
              >
                SKIP
              </button>
            </>
          ) : (
            <>
              <button
                onClick={triggerTip}
                className="flex-1 bg-slate-950/40 hover:bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 text-slate-350 text-[9px] py-1.5 rounded-lg font-mono tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>CYBER TIP</span>
              </button>
              <button
                onClick={startWalkthrough}
                className="flex-1 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[9px] py-1.5 rounded-lg font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 hover:scale-[1.02]"
              >
                <Play className="w-3 h-3" />
                <span>DEMO TOUR</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Senti Holographic Drone */}
      <div className="flex items-center space-x-4 pr-4">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm animate-pulse-subtle" />
        
        <div className="relative w-16 h-16 flex items-center justify-center animate-float-medium">
          {/* Glowing Aura rings */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/5 border border-cyan-500/10 blur-sm animate-pulse" />
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/20 animate-spin" style={{ animationDuration: '15s' }} />
          
          {/* Lateral Wings */}
          <div className="absolute left-[-8px] w-3 h-6 bg-cyan-500/20 border border-cyan-400/40 rounded-l-full shadow-inner transition-all duration-300" />
          <div className="absolute right-[-8px] w-3 h-6 bg-cyan-500/20 border border-cyan-400/40 rounded-r-full shadow-inner transition-all duration-300" />

          {/* Core Body */}
          <div className={`w-12 h-12 bg-slate-900 border rounded-full flex flex-col items-center justify-center transition-all duration-300 relative ${droneGlow[hologramColor]}`}>
            {/* Screen Face */}
            <div className="w-9 h-7 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-center">
              {getFaceSVG()}
            </div>
            {/* Core light indicator */}
            <div className="absolute bottom-1 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </div>
  );
}
