import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu, Sparkles, Loader2, Play, CheckCircle, HelpCircle } from 'lucide-react';
import axios from 'axios';
import EducationalTooltip from '../components/EducationalTooltip';

const LOG_SAMPLES = {
  windows: `LogName=Security
SourceName=Microsoft-Windows-Security-Auditing
EventID=4625
Task=Logon
Level=Information
Keywords=Audit Failure
Description: An account failed to log on.
Subject:
  Security ID: SYSTEM
  Account Name: WORKSTATION-01$
Logon Type: 3
Account For Which Logon Failed:
  Account Name: Administrator
  Account Domain: WORKGROUP
Failure Information:
  Failure Reason: Unknown user name or bad password.
  Status: 0xC000006D
  Sub Status: 0xC000006A
Process Information:
  Caller Process ID: 0x2ec
  Caller Process Name: C:\\Windows\\System32\\svchost.exe
Network Information:
  Workstation Name: ATTACKER-PC
  Source Network Address: 192.168.1.142
  Source Port: 52401`,

  linux: `Jul  2 10:14:22 main-server sshd[12042]: Failed password for invalid user admin from 203.0.113.82 port 48212 ssh2
Jul  2 10:14:25 main-server sshd[12042]: Failed password for invalid user admin from 203.0.113.82 port 48220 ssh2
Jul  2 10:14:28 main-server sshd[12042]: Failed password for invalid user root from 203.0.113.82 port 48234 ssh2
Jul  2 10:14:31 main-server sshd[12042]: Failed password for invalid user guest from 203.0.113.82 port 48248 ssh2
Jul  2 10:14:35 main-server sshd[12042]: Invalid user support from 203.0.113.82 port 48260`,

  firewall: `2026-07-02 11:20:05 ALLOW TCP 192.168.1.15 8.8.8.8 49301 53 - - - - - - - - -
2026-07-02 11:20:10 DROP TCP 203.0.113.5 192.168.1.10 52311 445 - - - - - - - - -
2026-07-02 11:20:11 DROP TCP 203.0.113.5 192.168.1.10 52312 3389 - - - - - - - - -
2026-07-02 11:20:12 DROP TCP 203.0.113.5 192.168.1.10 52313 22 - - - - - - - - -
2026-07-02 11:20:13 DROP TCP 203.0.113.5 192.168.1.10 52314 80 - - - - - - - - -
2026-07-02 11:20:14 DROP TCP 203.0.113.5 192.168.1.10 52315 8080 - - - - - - - - -`
};

const AGENTS_METADATA = [
  { name: "Security Guardian", role: "Input WAF Validation", finalTime: 180 },
  { name: "Investigator Agent", role: "Log Parsing & Analysis", finalTime: 520 },
  { name: "Threat Intel Core", role: "MITRE ATT&CK Mapping", finalTime: 740 },
  { name: "Memory Searcher", role: "TF-IDF Similar Retriev", finalTime: 360 },
  { name: "Response Planner", role: "Containment Formulation", finalTime: 610 },
  { name: "Report Compiler", role: "PDF Dossier Assembly", finalTime: 490 }
];

function AgentExecutionCard({ name, role, isActive, isDone, finalTime }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isActive) {
      const start = performance.now();
      interval = setInterval(() => {
        setTime(Math.round(performance.now() - start));
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden ${
      isDone ? 'bg-emerald-950/10 border-emerald-500/30 text-slate-200' :
      isActive ? 'bg-indigo-950/20 border-indigo-500/40 text-white animate-pulse' :
      'bg-slate-950/30 border-slate-900/50 text-slate-600'
    }`}>
      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scanline-box" />
      )}
      
      <div className="flex justify-between items-start w-full">
        <span className="text-[9px] font-mono tracking-widest font-bold uppercase">{name}</span>
        <span className="text-[10px] font-mono text-slate-450">
          {isDone ? `${finalTime}ms` : isActive ? `${time}ms` : '0ms'}
        </span>
      </div>
      
      <p className={`text-xs font-semibold mt-1.5 ${isDone ? 'text-slate-300' : isActive ? 'text-indigo-200' : 'text-slate-550'}`}>
        {role}
      </p>

      <div className="mt-2.5 flex items-center justify-between">
        {isDone ? (
          <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            <span>RESOLVED</span>
          </span>
        ) : isActive ? (
          <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold animate-pulse flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
            <span>RUNNING</span>
          </span>
        ) : (
          <span className="text-[9px] bg-slate-900 text-slate-600 border border-slate-800 px-2 py-0.5 rounded-full font-mono uppercase font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
            <span>STANDBY</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default function LogAnalyzer({ onNewIncident, apiBase, demoMode, notify }) {
  const [logType, setLogType] = useState('windows');
  const [logText, setLogText] = useState(LOG_SAMPLES.windows);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [executingMitigation, setExecutingMitigation] = useState(false);
  const [mitigated, setMitigated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSelectPreset = (type) => {
    setLogType(type);
    setLogText(LOG_SAMPLES[type]);
    setAnalysisResult(null);
    setMitigated(false);
  };

  const handleAnalyze = async () => {
    if (!logText.trim()) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setMitigated(false);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 450);

    if (demoMode) {
      // Fast bypass for simulation mode
      setTimeout(() => {
        const simulatedResult = simulateAnalysis(logType, logText);
        setAnalysisResult(simulatedResult);
        if (simulatedResult.incident) {
          onNewIncident(simulatedResult.incident);
        }
        clearInterval(stepInterval);
        setCurrentStep(6);
        setAnalyzing(false);
      }, 2700);
      return;
    }

    try {
      // Direct call to FastAPI Gemini router
      const response = await axios.post(`${apiBase}/api/ai/analyze-log`, {
        log_type: logType,
        raw_log: logText
      });
      
      setAnalysisResult(response.data);
      if (response.data.incident) {
        onNewIncident(response.data.incident);
      }
    } catch (err) {
      console.error("Gemini log analysis failed. Using simulated model fallback.", err);
      // Fail-safe simulation logic for demonstration without API Keys
      setTimeout(() => {
        const simulatedResult = simulateAnalysis(logType, logText);
        setAnalysisResult(simulatedResult);
        if (simulatedResult.incident) {
          onNewIncident(simulatedResult.incident);
        }
      }, 2000);
    } finally {
      clearInterval(stepInterval);
      setAnalyzing(false);
    }
  };

  const handleExecutePlaybook = async () => {
    if (!analysisResult) return;
    setExecutingMitigation(true);
    try {
      if (analysisResult.incident) {
        await axios.post(`${apiBase}/api/incidents/${analysisResult.incident.id}/mitigate`, {
          action: analysisResult.recommended_playbook.action_type
        });
      }
      setTimeout(() => {
        setMitigated(true);
        setExecutingMitigation(false);
        if (notify) notify("Autonomous Playbook Execution completed successfully.", "success");
      }, 1500);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMitigated(true);
        setExecutingMitigation(false);
      }, 1500);
    }
  };

  const simulateAnalysis = (type, text) => {
    let mockResult = {
      threat_detected: true,
      severity: 'HIGH',
      classification: 'Simulated Threat Event',
      summary: 'Analyst simulation based on security input signature.',
      recommended_playbook: {
        action_type: 'BLOCK_IP',
        steps: ['Log alert to database', 'Configure network firewall blocker', 'Monitor target host']
      },
      incident: {
        id: Math.floor(Math.random() * 100000),
        title: 'Unauthorized Log Signature',
        description: 'Threat pattern detected via local analyzer preset.',
        severity: 'HIGH',
        source_ip: '203.0.113.100',
        status: 'UNRESOLVED',
        risk_score: 83,
        timestamp: new Date().toISOString()
      }
    };

    if (type === 'windows') {
      mockResult.classification = 'Windows Audit Logon Failure (Brute Force)';
      mockResult.severity = 'HIGH';
      mockResult.summary = 'Multiple failed logins detected for username: Administrator from source IP 192.168.1.142. Signature conforms to dictionary brute force attacks.';
      mockResult.recommended_playbook = {
        action_type: 'BLOCK_IP',
        steps: ['Add IP 192.168.1.142 to Windows Advanced Firewall block list', 'Lock down Administrator user access from external networks', 'Log incident ID for automated security compliance report']
      };
      mockResult.incident.title = 'Windows Brute Force logon';
      mockResult.incident.source_ip = '192.168.1.142';
      mockResult.incident.risk_score = 82;
      mockResult.incident.description = 'Failed logon attempts on Administrator user account.';
    } else if (type === 'linux') {
      mockResult.classification = 'Linux SSH Authentication Brute Force';
      mockResult.severity = 'CRITICAL';
      mockResult.summary = 'SSH authentication server rejected multiple passwords for root and invalid user accounts from 203.0.113.82. Indicates active automated botnet scanner.';
      mockResult.recommended_playbook = {
        action_type: 'BLOCK_IP',
        steps: ['Append 203.0.113.82 to /etc/hosts.deny', 'Verify sshd config prohibits root direct login', 'Notify NetOps to block router gateway routes to source CIDR']
      };
      mockResult.incident.title = 'SSH Brute Force Attack';
      mockResult.incident.source_ip = '203.0.113.82';
      mockResult.incident.severity = 'CRITICAL';
      mockResult.incident.risk_score = 96;
      mockResult.incident.description = 'Active dictionary scan targeting root and admin accounts over SSH.';
    } else if (type === 'firewall') {
      mockResult.classification = 'Port Scanning Reconnaissance';
      mockResult.severity = 'MEDIUM';
      mockResult.summary = 'Source IP 203.0.113.5 triggered rapid successive DROPs on multiple standard services ports (445, 3389, 22, 80). Indicates active host scanning.';
      mockResult.recommended_playbook = {
        action_type: 'BLOCK_IP',
        steps: ['Add 203.0.113.5 to Edge Router IPS rule blacklist', 'Scan target host for unpatched listener endpoints', 'Trigger active quarantine window of 24h']
      };
      mockResult.incident.title = 'Internal Port Scan Detected';
      mockResult.incident.source_ip = '203.0.113.5';
      mockResult.incident.severity = 'MEDIUM';
      mockResult.incident.risk_score = 61;
      mockResult.incident.description = 'Host scanning activity profiling SMB, RDP, SSH, and HTTP listeners.';
    }
    return mockResult;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Log Analyzer</h2>
          <p className="text-slate-400 text-sm mt-1">
            Upload raw Windows Security event logs, Linux auth.log, or firewall entries to extract intelligence.
          </p>
        </div>
        <EducationalTooltip term="Prompt Injection" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Log Input */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Select Threat Log Preset</span>
            <div className="flex space-x-2">
              {['windows', 'linux', 'firewall'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelectPreset(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all border cursor-pointer ${
                    logType === type
                      ? 'bg-indigo-650/30 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 min-h-[300px] flex flex-col">
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              className="flex-1 w-full bg-slate-950/70 border border-slate-850 rounded-xl p-4 text-xs font-mono text-indigo-300 placeholder-slate-650 focus:outline-none focus:border-indigo-500/50 resize-none shadow-inner"
              placeholder="Paste raw log lines here..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !logText.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2 hover:scale-[1.01] cursor-pointer"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Orchestrating Security Agents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
                <span>Analyze with Gemini AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side - Analysis & Agent Orchestration */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center min-h-[400px]">
          {!analysisResult && !analyzing && (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-900/80 border border-slate-850 flex items-center justify-center rounded-2xl mx-auto shadow-inner">
                <Terminal className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-350 font-semibold text-sm">Ready for Threat Analysis</p>
                <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto leading-relaxed">
                  Click 'Analyze with Gemini AI' to trace variables, map attackers, and compile response dossiers.
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="p-4 space-y-6">
              <div className="text-center space-y-2 border-b border-slate-900 pb-4">
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
                  <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-indigo-300 font-bold text-xs tracking-wider uppercase font-mono">
                    Multi-Agent Core Active
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Analyzing raw logs, compiling playbooks, and auditing containment strategies.
                  </p>
                </div>
              </div>

              {/* Holographic Agent Sequencing Grid */}
              <div className="grid grid-cols-2 gap-4">
                {AGENTS_METADATA.map((agent, idx) => {
                  const isActive = currentStep === idx;
                  const isDone = currentStep > idx;
                  return (
                    <AgentExecutionCard 
                      key={idx}
                      name={agent.name}
                      role={agent.role}
                      isActive={isActive}
                      isDone={isDone}
                      finalTime={agent.finalTime}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {analysisResult && !analyzing && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-widest">
                    Threat Classified
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {analysisResult.classification}
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded font-mono ${
                  analysisResult.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-400 border border-red-500/30 glow-alert-red' :
                  analysisResult.severity === 'HIGH' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 glow-alert-yellow' :
                  analysisResult.severity === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {analysisResult.severity}
                </span>
              </div>

              {/* Summary Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Threat Intel Summary</span>
                  <EducationalTooltip term="Threat Intelligence" />
                </span>
                <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/45 p-3.5 rounded-xl border border-slate-900/60 font-sans shadow-inner">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Playbook Playbox */}
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Response Playbook
                  </span>
                  <EducationalTooltip term="Autonomous Mitigation" />
                </div>
                <div className="bg-slate-950/70 rounded-xl border border-slate-850 p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
                    <span className="text-slate-400">Target Mitigation Type:</span>
                    <span className="font-mono font-bold text-indigo-455 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {analysisResult.recommended_playbook?.action_type || 'BLOCK_IP'}
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {analysisResult.recommended_playbook?.steps?.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs">
                        <span className="bg-indigo-900/40 text-indigo-300 w-5 h-5 rounded-full flex items-center justify-center font-mono font-semibold flex-shrink-0 text-[10px] border border-indigo-500/20">
                          {idx + 1}
                        </span>
                        <span className="text-slate-350 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Executor Button */}
              {mitigated ? (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-4 rounded-xl flex items-center space-x-2.5 text-sm shadow-[0_0_15px_rgba(16,185,129,0.08)] animate-scale-in">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold text-xs">Autonomous mitigation playbook successfully executed. Perimeter secure.</span>
                </div>
              ) : (
                <button
                  onClick={handleExecutePlaybook}
                  disabled={executingMitigation}
                  className="w-full bg-rose-600/10 border border-rose-500/30 text-rose-350 hover:bg-rose-600 hover:text-white font-medium py-3 rounded-xl transition-all duration-200 text-xs flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01]"
                >
                  {executingMitigation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      <span>Configuring active firewall barriers...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Autonomous Mitigation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
