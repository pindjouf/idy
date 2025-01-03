import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Wifi, Lock, ShieldAlert, Server, Database, Globe, Activity, AlertCircle, Network, DownloadIcon } from "lucide-react";
import _ from 'lodash';
import { generateReport } from '../utils/reportGenerator';

const PortDetailPopup = ({ port, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gruvbox-bg/60 backdrop-blur-sm" />
      
      {/* Popup card with zoom animation */}
      <div 
        onClick={e => e.stopPropagation()}
        className="relative bg-gruvbox-bg-soft/90 border border-gruvbox-fg/10 rounded-xl
                  p-6 shadow-2xl backdrop-blur-md w-full max-w-md
                  transform transition-all duration-300 scale-100
                  animate-in fade-in zoom-in-95"
      >
        {/* Port number and service header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-gruvbox-blue to-gruvbox-aqua 
                         bg-clip-text text-transparent">
            Port {port.port} ({port.service})
          </h3>
          <span className={`px-2 py-1 rounded-lg text-sm
                        ${port.state === 'open' 
                          ? 'bg-gruvbox-green/20 text-gruvbox-green'
                          : 'bg-gruvbox-yellow/20 text-gruvbox-yellow'}`}>
            {port.state}
          </span>
        </div>

        {/* Service details with glass effect */}
        <div className="space-y-3 bg-gruvbox-bg-hard/30 rounded-lg p-4 border border-gruvbox-fg/5">
          {port.product && (
            <div>
              <span className="text-gruvbox-gray">Product:</span>
              <span className="ml-2 text-gruvbox-purple">{port.product}</span>
            </div>
          )}
          
          {port.version && (
            <div>
              <span className="text-gruvbox-gray">Version:</span>
              <span className="ml-2 text-gruvbox-yellow">{port.version}</span>
            </div>
          )}
          
          {port.extraInfo && (
            <div>
              <span className="text-gruvbox-gray">Extra Info:</span>
              <span className="ml-2 text-gruvbox-fg">{port.extraInfo}</span>
            </div>
          )}
        </div>

        {/* Script output section */}
        {port.scripts && port.scripts.length > 0 && (
          <div className="mt-4">
            <h4 className="text-gruvbox-aqua mb-2">Script Output</h4>
            <div className="bg-gruvbox-bg-hard/50 rounded-lg p-4 font-mono text-sm
                          border border-gruvbox-fg/5 max-h-48 overflow-y-auto">
              {port.scripts.map((script, i) => (
                <div key={i} className="text-gruvbox-fg/80">{script}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NetworkViz = () => {
  const [selectedHost, setSelectedHost] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [filterState, setFilterState] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await window.fs.readFile('paste.txt', { encoding: 'utf8' });
        const hostBlocks = response.split('\nNmap scan report for ').slice(1);
        
        const parsedHosts = hostBlocks.map(block => {
          const lines = block.split('\n');
          let ip = lines[0].trim();
          const ports = [];
          let hostname = null;

          if (ip.includes('(') && ip.includes(')')) {
            const parts = ip.split('(');
            hostname = parts[0].trim();
            ip = parts[1].replace(')', '').trim();
          }
          
          lines.forEach(line => {
            const portMatch = line.match(/(\d+)\/tcp\s+(open|filtered)\s+(\S+)/);
            const versionMatch = line.match(/(\d+)\/tcp\s+open\s+(\S+)\s+(.*)/);
            
            if (portMatch) {
              const port = {
                port: parseInt(portMatch[1]),
                state: portMatch[2],
                service: portMatch[3],
                version: null,
                product: null,
                extraInfo: null
              };

              if (versionMatch) {
                const details = versionMatch[3].split(/\s+/);
                if (details.length > 0) {
                  port.product = details[0];
                  port.version = details[1];
                  port.extraInfo = details.slice(2).join(' ');
                }
              }

              let scriptOutput = [];
              let i = lines.indexOf(line) + 1;
              while (i < lines.length && lines[i].startsWith('|_')) {
                scriptOutput.push(lines[i].substring(2));
                i++;
              }
              if (scriptOutput.length > 0) {
                port.scripts = scriptOutput;
              }

              ports.push(port);
            }
          });
          
          return { ip, hostname, ports };
        });
        
        setHosts(parsedHosts);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load network scan data');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getSystemType = (host) => {
    const services = host.ports.map(p => p.service);
    if (services.includes('microsoft-ds') || services.includes('netbios-ssn')) return 'Windows';
    if (services.includes('ssh') && !services.includes('microsoft-ds')) return 'Linux';
    return 'Unknown';
  };

  const getServiceIcon = (service) => {
    const iconClass = "w-4 h-4 group-hover:text-gruvbox-yellow transition-colors duration-300";
    switch (service) {
      case 'http':
      case 'https':
        return <Globe className={iconClass} />;
      case 'ssh':
        return <Lock className={iconClass} />;
      case 'domain':
      case 'dns':
        return <Wifi className={iconClass} />;
      case 'ldap':
      case 'ms-sql-s':
      case 'mysql':
        return <Database className={iconClass} />;
      case 'msrpc':
      case 'netbios-ssn':
        return <Network className={iconClass} />;
      case 'microsoft-ds':
        return <Server className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getRiskLevel = (host) => {
    const openPorts = host.ports.filter(p => p.state === 'open').length;
    if (openPorts > 10) return 'high';
    if (openPorts > 5) return 'medium';
    return 'low';
  };

  const getRiskStyles = (risk) => {
    switch (risk) {
      case 'high':
        return 'bg-gruvbox-red/10 border-gruvbox-red/30 group-hover:border-gruvbox-red';
      case 'medium':
        return 'bg-gruvbox-yellow/10 border-gruvbox-yellow/30 group-hover:border-gruvbox-yellow';
      default:
        return 'bg-gruvbox-green/10 border-gruvbox-green/30 group-hover:border-gruvbox-green';
    }
  };

  const filteredHosts = hosts.filter(host => 
    host.ip.toLowerCase().includes(searchTerm.toLowerCase()) || 
    host.ports.some(p => 
      p.service.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.port.toString().includes(searchTerm)
    )
  );

  const groupedHosts = () => {
    switch (groupBy) {
      case 'system':
        return _.groupBy(filteredHosts, getSystemType);
      case 'risk':
        return _.groupBy(filteredHosts, host => {
          const risk = getRiskLevel(host);
          return risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk';
        });
      default:
        return { 'All Hosts': filteredHosts };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gruvbox-blue animate-pulse">Loading network data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gruvbox-red">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card className="backdrop-blur-xl bg-gruvbox-bg-soft/30 border-gruvbox-fg/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gruvbox-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gruvbox-aqua/5 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between text-gruvbox-fg">
            <span className="text-xl font-semibold">Network Infrastructure Analysis</span>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search hosts, ports, services..."
                className="px-4 py-2 bg-gruvbox-bg-hard/50 border border-gruvbox-fg/10 rounded-xl
                         text-gruvbox-fg placeholder-gruvbox-gray/50
                         focus:outline-none focus:border-gruvbox-yellow/50
                         transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => generateReport(hosts, getSystemType, getRiskLevel)}
                className="inline-flex items-center gap-2 px-4 py-2
                          backdrop-blur-md bg-gruvbox-bg-soft/30 rounded-lg
                          border border-gruvbox-fg/10 hover:bg-gruvbox-blue/20
                          transition-all duration-300 group"
              >
                <DownloadIcon className="w-4 h-4 text-gruvbox-blue group-hover:text-gruvbox-yellow" />
                <span className="text-gruvbox-fg group-hover:text-gruvbox-yellow">Export Report</span>
              </button>
              <select 
                className="px-4 py-2 bg-gruvbox-bg-hard/50 border border-gruvbox-fg/10 rounded-xl
                         text-gruvbox-fg focus:outline-none focus:border-gruvbox-yellow/50
                         transition-all duration-300"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="none">No Grouping</option>
                <option value="system">Group by System Type</option>
                <option value="risk">Group by Risk Level</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          {Object.entries(groupedHosts()).map(([group, groupHosts]) => (
            <div key={group} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gruvbox-yellow">
                {group} ({groupHosts.length} hosts)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupHosts.map(host => {
                  const riskLevel = getRiskLevel(host);
                  const riskStyles = getRiskStyles(riskLevel);
                  
                  return (
                    <div
                      key={host.ip}
                      onClick={() => setSelectedHost(host)}
                      className={`p-6 rounded-xl cursor-pointer
                                backdrop-blur-md ${riskStyles}
                                border transition-all duration-300
                                hover:shadow-lg group
                                ${selectedHost?.ip === host.ip ? 'ring-2 ring-gruvbox-yellow' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gruvbox-fg group-hover:text-gruvbox-yellow 
                                     transition-colors duration-300">
                          {host.ip}
                        </span>
                        <span className="text-sm px-3 py-1 rounded-lg bg-gruvbox-bg-hard/30 
                                     text-gruvbox-gray group-hover:text-gruvbox-yellow
                                     transition-colors duration-300">
                          {getSystemType(host)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gruvbox-gray space-y-1">
                        <div className="flex justify-between">
                          <span>Open Ports:</span>
                          <span className="text-gruvbox-aqua">
                            {host.ports.filter(p => p.state === 'open').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Filtered:</span>
                          <span className="text-gruvbox-purple">
                            {host.ports.filter(p => p.state === 'filtered').length}
                          </span>
                        </div>
                      </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {host.ports
                          .filter(p => p.state === 'open')
                          .slice(0, 3)
                          .map(port => (
                            <span key={port.port}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPort(port);
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-1 
                                         bg-gruvbox-bg-hard/30 rounded-lg text-sm
                                         text-gruvbox-fg group-hover:text-gruvbox-yellow
                                         transition-colors duration-300 cursor-zoom-in">
                              {getServiceIcon(port.service)}
                              <span>{port.service}</span>
                            </span>
                          ))}
                        {host.ports.filter(p => p.state === 'open').length > 3 && (
                          <span className="px-3 py-1 bg-gruvbox-bg-hard/30 rounded-lg text-sm 
                                       text-gruvbox-gray">
                            +{host.ports.filter(p => p.state === 'open').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedHost && (
            <div className="mt-8 p-6 backdrop-blur-md bg-gruvbox-bg-soft/30 rounded-xl 
                         border border-gruvbox-fg/10 shadow-xl">
              <h3 className="text-xl font-semibold mb-6 text-gruvbox-yellow">
                Host Details: {selectedHost.ip}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4 text-gruvbox-aqua">Open Ports</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedHost.ports
                      .filter(p => p.state === 'open')
                      .map(port => (
                        <div key={port.port} 
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedPort(port);
                             }}
                             className="p-3 bg-gruvbox-bg-hard/30 rounded-xl 
                                      border border-gruvbox-fg/10
                                      hover:border-gruvbox-yellow
                                      transition-all duration-300 group cursor-zoom-in">
                          <div className="font-medium text-gruvbox-fg group-hover:text-gruvbox-yellow
                                        transition-colors duration-300">
                            Port {port.port}
                          </div>
                          <div className="text-sm text-gruvbox-gray flex items-center gap-2">
                            {getServiceIcon(port.service)}
                            <span>{port.service}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4 text-gruvbox-purple">Filtered Ports</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedHost.ports
                      .filter(p => p.state === 'filtered')
                      .map(port => (
                        <div key={port.port} 
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedPort(port);
                             }}
                             className="p-3 bg-gruvbox-bg-hard/30 rounded-xl
                                      border border-gruvbox-fg/10
                                      hover:border-gruvbox-yellow
                                      transition-all duration-300 group cursor-zoom-in">
                          <div className="font-medium text-gruvbox-fg group-hover:text-gruvbox-yellow
                                        transition-colors duration-300">
                            Port {port.port}
                          </div>
                          <div className="text-sm text-gruvbox-gray">
                            {port.service}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPort && (
        <PortDetailPopup 
          port={selectedPort} 
          onClose={() => setSelectedPort(null)} 
        />
      )}
    </div>
  );
};

export default NetworkViz;
