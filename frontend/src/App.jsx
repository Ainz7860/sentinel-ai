import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LogAnalyzer from './pages/LogAnalyzer';
import Incidents from './pages/Incidents';
import Settings from './pages/Settings';
import MemoryView from './pages/MemoryView';
import ObservabilityView from './pages/ObservabilityView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiBase, setApiBase] = useState('http://localhost:8000');
  
  // Local state for incidents
  const [incidents, setIncidents] = useState([]);
  
  // Local state for statistics
  const [stats, setStats] = useState({
    threatLevel: 'LOW',
    unresolved: 0,
    totalLogs: 0,
    blockRules: 0
  });

  // Load stats and incidents list from backend
  const fetchTelemetry = async () => {
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
  }, [apiBase]);

  // Handler to add a new incident detected by the analyzer
  const handleNewIncident = (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
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
    // Attempt backend update
    try {
      const response = await axios.patch(`${apiBase}/api/incidents/${id}`, updates);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? response.data : inc)));
    } catch (err) {
      console.warn("Backend update failed. Syncing local state.");
      // Fallback local update
      setIncidents((prev) => 
        prev.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc))
      );
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
        return <Dashboard stats={stats} incidents={incidents} onUpdateIncident={handleUpdateIncident} />;
      case 'analyzer':
        return <LogAnalyzer onNewIncident={handleNewIncident} apiBase={apiBase} />;
      case 'incidents':
        return <Incidents incidents={incidents} onUpdateIncident={handleUpdateIncident} />;
      case 'memory':
        return <MemoryView apiBase={apiBase} />;
      case 'observability':
        return <ObservabilityView apiBase={apiBase} />;
      case 'settings':
        return <Settings apiBase={apiBase} setApiBase={setApiBase} />;
      default:
        return <Dashboard stats={stats} incidents={incidents} onUpdateIncident={handleUpdateIncident} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Panel Content */}
      <main className="flex-1 min-h-screen pl-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
