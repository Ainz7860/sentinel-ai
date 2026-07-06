import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LogAnalyzer from './pages/LogAnalyzer';
import Incidents from './pages/Incidents';
import Settings from './pages/Settings';
import MemoryView from './pages/MemoryView';
import ObservabilityView from './pages/ObservabilityView';
import Login from './pages/Login';

// Import newly designed UI components
import BootScreen from './components/BootScreen';
import AIAssistant from './components/AIAssistant';
import ProductTour from './components/ProductTour';
import Toast from './components/Toast';

const demoIncidents = [
  {
    id: 201,
    title: 'SSH brute force logon',
    description: 'Multiple failed password attempts detected on user root over SSH port 22. In conformity with automated credential audit sweeps.',
    severity: 'HIGH',
    source_ip: '203.0.113.82',
    status: 'MITIGATED',
    response_action: 'BLOCK_IP',
    risk_score: 82,
    pdf_path: '/static/reports/ssh_brute_force.pdf',
    timestamp: '2026-07-03T11:45:00Z'
  },
  {
    id: 202,
    title: 'Outbound DNS Tunneling payload',
    description: 'Encrypted exfiltration payload identified routing inside TXT queries to non-standard nameservers. Anomalous traffic weight.',
    severity: 'CRITICAL',
    source_ip: '192.168.1.18',
    status: 'UNRESOLVED',
    risk_score: 95,
    pdf_path: '/static/reports/dns_tunneling.pdf',
    timestamp: '2026-07-03T12:05:00Z'
  },
  {
    id: 203,
    title: 'SQL Injection payload on API endpoints',
    description: 'Raw SQL union select syntax parsed in request query headers targeting relational customer schema. Blocked by active guard.',
    severity: 'HIGH',
    source_ip: '198.51.100.12',
    status: 'INVESTIGATING',
    risk_score: 79,
    timestamp: '2026-07-03T12:30:00Z'
  },
  {
    id: 204,
    title: 'Privileged Account Logon Hijack',
    description: 'Domain Controller recorded logon event ID 4624 for DOMAIN\\Administrator from anomalous workstation workstation-99.',
    severity: 'CRITICAL',
    source_ip: '10.0.0.12',
    status: 'UNRESOLVED',
    risk_score: 91,
    timestamp: '2026-07-03T12:55:00Z'
  },
  {
    id: 205,
    title: 'Quarantined Phishing Executable',
    description: 'Antivirus gateway intercepted runtime of unknown unsigned binary file invoice_details.exe. Endpoint host quarantined.',
    severity: 'MEDIUM',
    source_ip: '192.168.1.44',
    status: 'MITIGATED',
    response_action: 'ISOLATE_HOST',
    risk_score: 64,
    timestamp: '2026-07-03T10:15:00Z'
  },
  {
    id: 206,
    title: 'Lateral Movement WMI Execution',
    description: 'SecOps engine flagged remote process launch command via WMI targeting system administrative shares. Signature matches MITRE T1047.',
    severity: 'HIGH',
    source_ip: '192.168.1.88',
    status: 'INVESTIGATING',
    risk_score: 87,
    timestamp: '2026-07-03T13:10:00Z'
  },
  {
    id: 207,
    title: 'Tor Exit Node Scan Traffic',
    description: 'Host network router flagged external connection request originating from public Tor gateway registry. Port scan on multiple listeners.',
    severity: 'MEDIUM',
    source_ip: '185.220.101.5',
    status: 'MITIGATED',
    response_action: 'BLOCK_IP',
    risk_score: 55,
    timestamp: '2026-07-03T09:20:00Z'
  }
];

const demoStats = {
  threatLevel: 'CRITICAL',
  unresolved: 3,
  totalLogs: 1485,
  blockRules: 14
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiBase, setApiBase] = useState('http://localhost:8081');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  // Custom boot & demo management states
  const [isBooted, setIsBooted] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Local state for incidents
  const [incidents, setIncidents] = useState([]);
  
  // Local state for statistics
  const [stats, setStats] = useState({
    threatLevel: 'LOW',
    unresolved: 0,
    totalLogs: 0,
    blockRules: 0
  });

  // Notification triggers
  const notify = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Handle global axios auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Handle logout action
  useEffect(() => {
    if (activeTab === 'logout') {
      setToken('');
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  // Load stats and incidents list from backend
  const fetchTelemetry = async () => {
    if (demoMode) return; // Do not fetch from backend in demo mode

    try {
      const incidentsRes = await axios.get(`${apiBase}/api/incidents`);
      setIncidents(incidentsRes.data);
      
      const statsRes = await axios.get(`${apiBase}/api/incidents/stats`);
      setStats(statsRes.data);
    } catch (err) {
      console.warn("FastAPI backend is offline. Using local simulation state.");
      // Seed initial dummy data for standard demonstration if backend is down
      if (incidents.length === 0) {
        const dummyIncidents = [
          {
            id: 101,
            title: 'SSH brute force logon',
            description: 'Failed password audit logging from host 192.168.1.55 on user root.',
            severity: 'HIGH',
            source_ip: '192.168.1.55',
            status: 'UNRESOLVED',
            timestamp: '2026-07-02T10:15:30Z'
          },
          {
            id: 102,
            title: 'Outbound DNS Tunneling signature',
            description: 'Suspicious payload patterns matching DNS text records to unknown domain.',
            severity: 'CRITICAL',
            source_ip: '192.168.1.18',
            status: 'INVESTIGATING',
            timestamp: '2026-07-02T11:05:00Z'
          },
          {
            id: 103,
            title: 'Windows Domain Admin Login Failure',
            description: 'Audit audit log event ID 4625 for DOMAIN\\Administrator from 10.0.0.12.',
            severity: 'MEDIUM',
            source_ip: '10.0.0.12',
            status: 'MITIGATED',
            response_action: 'BLOCK_IP',
            timestamp: '2026-07-02T08:30:15Z'
          }
        ];
        setIncidents(dummyIncidents);
        setStats({
          threatLevel: 'HIGH',
          unresolved: 2,
          totalLogs: 154,
          blockRules: 5
        });
      }
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, [apiBase, demoMode]);

  // Handle Demo Mode switch
  useEffect(() => {
    if (demoMode) {
      setIncidents(demoIncidents);
      setStats(demoStats);
      notify("Demo Simulation Mode activated. Realistic incident telemetry loaded.", "success");
    } else {
      setIncidents([]);
      setStats({
        threatLevel: 'LOW',
        unresolved: 0,
        totalLogs: 0,
        blockRules: 0
      });
      fetchTelemetry();
      notify("Demo Simulation Mode deactivated. Syncing active backend database.", "info");
    }
  }, [demoMode]);

  // Auto-start Guided Tour on first boot
  useEffect(() => {
    if (isBooted && token) {
      const tourCompleted = localStorage.getItem('sentinel_tour_completed');
      if (!tourCompleted) {
        setRunTour(true);
      }
    }
  }, [isBooted, token]);

  // Handler to add a new incident detected by the analyzer
  const handleNewIncident = (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    notify(`AI Guard Alert: ${newIncident.title} classified as ${newIncident.severity}`, newIncident.severity === 'CRITICAL' ? 'critical' : 'warning');
    setStats((prev) => {
      const isCritical = newIncident.severity === 'CRITICAL';
      const isHigh = newIncident.severity === 'HIGH';
      return {
        ...prev,
        totalLogs: prev.totalLogs + 1,
        unresolved: prev.unresolved + 1,
        threatLevel: isCritical ? 'CRITICAL' : isHigh && prev.threatLevel !== 'CRITICAL' ? 'HIGH' : prev.threatLevel
      };
    });
  };

  // Handler to update incident status (e.g. resolve, mitigate)
  const handleUpdateIncident = async (id, updates) => {
    if (demoMode) {
      // Direct local update for demo mode
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc))
      );
      if (updates.response_action) {
        notify(`Autonomous playbook successfully run on Incident #${id}.`, "success");
      } else {
        notify(`Incident #${id} state updated to: ${updates.status}.`, "info");
      }

      setIncidents((currentIncidents) => {
        const updatedList = currentIncidents.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc));
        const unresolvedCount = updatedList.filter((inc) => inc.status !== 'MITIGATED').length;
        const blockRulesCount = updatedList.filter((inc) => inc.response_action === 'BLOCK_IP').length + 11; // base offset
        const hasCritical = updatedList.some((inc) => inc.status !== 'MITIGATED' && inc.severity === 'CRITICAL');
        const hasHigh = updatedList.some((inc) => inc.status !== 'MITIGATED' && inc.severity === 'HIGH');
        const currentThreat = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : unresolvedCount > 0 ? 'MODERATE' : 'LOW';

        setStats((prev) => ({
          ...prev,
          unresolved: unresolvedCount,
          blockRules: blockRulesCount,
          threatLevel: currentThreat
        }));
        return updatedList;
      });
      return;
    }

    // Attempt backend update
    try {
      const response = await axios.patch(`${apiBase}/api/incidents/${id}`, updates);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? response.data : inc)));
      notify(`Incident #${id} status updated successfully.`, "success");
    } catch (err) {
      console.warn("Backend update failed. Syncing local state.");
      // Fallback local update
      setIncidents((prev) => 
        prev.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc))
      );
      notify(`Local threat state updated. Backend sync pending.`, "warning");
    }
    
    // Recalculate stats dynamically
    setIncidents((currentIncidents) => {
      const updatedList = currentIncidents.map(inc => inc.id === id ? { ...inc, ...updates } : inc);
      const unresolvedCount = updatedList.filter(inc => inc.status !== 'MITIGATED').length;
      const blockRulesCount = updatedList.filter(inc => inc.response_action === 'BLOCK_IP').length;
      
      const hasCritical = updatedList.some(inc => inc.status !== 'MITIGATED' && inc.severity === 'CRITICAL');
      const hasHigh = updatedList.some(inc => inc.status !== 'MITIGATED' && inc.severity === 'HIGH');
      const currentThreat = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : unresolvedCount > 0 ? 'MODERATE' : 'LOW';

      setStats(prev => ({
        ...prev,
        unresolved: unresolvedCount,
        blockRules: blockRulesCount,
        threatLevel: currentThreat
      }));
      return updatedList;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} incidents={incidents} onUpdateIncident={handleUpdateIncident} apiBase={apiBase} demoMode={demoMode} />;
      case 'analyzer':
        return <LogAnalyzer onNewIncident={handleNewIncident} apiBase={apiBase} demoMode={demoMode} notify={notify} />;
      case 'incidents':
        return <Incidents incidents={incidents} onUpdateIncident={handleUpdateIncident} demoMode={demoMode} apiBase={apiBase} />;
      case 'memory':
        return <MemoryView apiBase={apiBase} demoMode={demoMode} />;
      case 'observability':
        return <ObservabilityView apiBase={apiBase} demoMode={demoMode} />;
      case 'settings':
        return <Settings apiBase={apiBase} setApiBase={setApiBase} demoMode={demoMode} notify={notify} />;
      default:
        return <Dashboard stats={stats} incidents={incidents} onUpdateIncident={handleUpdateIncident} apiBase={apiBase} demoMode={demoMode} />;
    }
  };

  if (!token) {
    return <Login apiBase={apiBase} onLoginSuccess={setToken} />;
  }

  // Display Cinematic Boot sequence if not completed
  if (!isBooted) {
    return <BootScreen onComplete={() => setIsBooted(true)} />;
  }

  return (
    <div className="min-h-screen flex bg-[#040810] text-slate-100 antialiased font-sans relative overflow-hidden">
      {/* Background Cyber Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} demoMode={demoMode} setDemoMode={setDemoMode} />
      
      {/* Main Panel Content with Page Transitions */}
      <main className="flex-1 min-h-screen pl-64 transition-all duration-300 relative z-10">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Interactive Floating Mascot Senti */}
      <AIAssistant activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Product Walkthrough Spotlight Tour */}
      {runTour && (
        <ProductTour 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onComplete={() => setRunTour(false)} 
        />
      )}

      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-55 flex flex-col space-y-3 pointer-events-none">
        {notifications.map((notif) => (
          <div key={notif.id} className="pointer-events-auto">
            <Toast 
              id={notif.id} 
              type={notif.type} 
              message={notif.message} 
              onClose={removeNotification} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

