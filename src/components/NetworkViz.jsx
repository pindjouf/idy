import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Wifi, Lock, ShieldAlert, Server, Database, Globe, Activity, AlertCircle, Network } from "lucide-react";
import _ from 'lodash';

const NetworkViz = () => {
  const [selectedHost, setSelectedHost] = useState(null);
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
          const ip = lines[0].trim();
          const ports = [];
          
          lines.forEach(line => {
            const portMatch = line.match(/(\d+)\/tcp\s+(open|filtered)\s+(\S+)/);
            if (portMatch) {
              ports.push({
                port: parseInt(portMatch[1]),
                state: portMatch[2],
                service: portMatch[3]
              });
            }
          });
          
          return { ip, ports };
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
        {/* Ambient glow effects */}
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
          {/* Host Groups */}
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
                                  className="inline-flex items-center gap-2 px-3 py-1 
                                         bg-gruvbox-bg-hard/30 rounded-lg text-sm
                                         text-gruvbox-fg group-hover:text-gruvbox-yellow
                                         transition-colors duration-300">
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

          {/* Selected Host Details */}
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
                             className="p-3 bg-gruvbox-bg-hard/30 rounded-xl 
                                      border border-gruvbox-fg/10
                                      hover:border-gruvbox-yellow
                                      transition-all duration-300 group">
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
                             className="p-3 bg-gruvbox-bg-hard/30 rounded-xl
                                      border border-gruvbox-fg/10
                                      hover:border-gruvbox-yellow
                                      transition-all duration-300 group">
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
    </div>
  );
};

export default NetworkViz;
