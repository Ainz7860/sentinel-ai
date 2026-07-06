import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

const DEFINITIONS = {
  "Risk Score": "Calculated dynamically based on threat severity, log anomaly weight, and host asset priority. Scores above 70 indicate a severe active threat.",
  "Threat Level": "The global hazard state of the network. Derived dynamically from the number of unresolved critical and high-severity incidents.",
  "MITRE ATT&CK": "A globally recognized framework documenting real-world adversary tactics, techniques, and procedures (TTPs) to help map attacks.",
  "IOC": "Indicator of Compromise. Forensic metadata (such as malicious IP addresses, domain names, file hashes) indicating a system breach.",
  "Threat Intelligence": "Refers to context-rich evidence about cyber hazards, enabling SecOps teams to profile actors and block known threat vectors.",
  "Prompt Injection": "An attack vector targeting LLMs, where malicious prompts trick the AI into ignoring system instructions or leak sensitive data.",
  "Semantic Memory": "A database matching past incidents using TF-IDF similarity vector models, which feeds historical playbooks into our planning agents.",
  "Autonomous Mitigation": "Instant firewall changes or host network isolation executed automatically by our AI core to contain threats in sub-seconds.",
  "Observability": "The telemetry mapping of AI operations, focusing on agent execution counts, tool call counts, and processing latencies.",
  "Block Rules": "Active firewall parameters configured dynamically on gateway routers to drop all incoming packets from confirmed malicious IP addresses."
};

const TERM_TO_TOPIC = {
  "Risk Score": "risk-score",
  "Threat Level": "risk-score",
  "MITRE ATT&CK": "mitre-attack",
  "IOC": "threat-intelligence",
  "Threat Intelligence": "threat-intelligence",
  "Prompt Injection": "prompt-injection",
  "Semantic Memory": "semantic-memory",
  "Autonomous Mitigation": "auto-mitigation",
  "Observability": "observability",
  "Block Rules": "auto-mitigation"
};

export default function EducationalTooltip({ term }) {
  const [show, setShow] = useState(false);
  const definition = DEFINITIONS[term] || "No explanation defined for this security term.";

  const handleShow = (visible) => {
    setShow(visible);
    if (visible) {
      const topicKey = TERM_TO_TOPIC[term];
      if (topicKey) {
        window.dispatchEvent(new CustomEvent('trigger-senti', {
          detail: {
            topicKey,
            expression: "thinking",
            color: "amber"
          }
        }));
      }
    }
  };

  return (
    <span className="relative inline-flex items-center ml-1.5 z-20">
      <button
        type="button"
        onMouseEnter={() => handleShow(true)}
        onMouseLeave={() => handleShow(false)}
        onClick={() => handleShow(!show)}
        className="text-slate-500 hover:text-indigo-400 focus:outline-none transition-colors cursor-pointer"
        title={`What is ${term}?`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 glass-panel border border-indigo-500/30 rounded-xl shadow-xl text-[10.5px] leading-relaxed text-slate-300 font-sans pointer-events-none animate-fade-in-up">
          <span className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#080c18] border-r border-b border-indigo-500/30 rotate-45" />
          <strong className="block text-white mb-1 font-semibold uppercase tracking-wider text-[9px] font-mono text-indigo-300">
            {term}
          </strong>
          {definition}
        </span>
      )}
    </span>
  );
}
