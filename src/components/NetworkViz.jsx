import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Lock, ShieldAlert, Server, Database, Globe, Activity, AlertCircle, Network, DownloadIcon, Fingerprint, ExternalLink } from "lucide-react";
import _ from 'lodash';
import { generateReport } from '../utils/reportGenerator';

const PortDetailPopup = ({ port, onClose }) => {
  useEffect(() => {
    // Lock scroll when popup is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Full screen backdrop with enhanced blur */}
      <div className="fixed inset-0 bg-gruvbox-bg/60 backdrop-blur" />
      
      {/* Popup card with zoom animation */}
      <div 
        onClick={e => e.stopPropagation()}
        className="relative bg-gruvbox-bg-soft/90 border border-gruvbox-fg/10 rounded-xl
                  p-6 shadow-2xl backdrop-blur-md w-full max-w-2xl mx-4
                  transform transition-all duration-300
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
                          : port.state === 'filtered'
                            ? 'bg-gruvbox-yellow/20 text-gruvbox-yellow'
                            : 'bg-gruvbox-red/20 text-gruvbox-red'}`}>
            {port.state}
          </span>
        </div>

        {/* Service details with glass effect */}
        <div className="space-y-4 bg-gruvbox-bg-hard/30 rounded-lg p-4 border border-gruvbox-fg/5">
          {(!port.product && !port.version && !port.extraInfo && 
            !(port.service === 'ssh' && port.hostKeys?.length > 0) && 
            !port.ssl && !(port.scripts && port.scripts.length > 0)) ? (
            <div className="text-center py-4">
              <span className="text-gruvbox-gray italic">No additional information available for this port</span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-gruvbox-blue font-medium">Service Details:</span>
              <div className="pl-4">
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
              </div>
            </div>
          )}
          
          {/* SSH Host Keys */}
          {port.service === 'ssh' && port.hostKeys && port.hostKeys.length > 0 && (
            <div className="space-y-2">
              <span className="text-gruvbox-blue font-medium">Host Keys:</span>
              <div className="pl-4 space-y-1">
                {port.hostKeys.map((key, i) => (
                  <div key={i} className="font-mono text-sm break-all">
                    <span className="text-gruvbox-purple">{key.type}:</span>
                    <span className="text-gruvbox-fg/80 ml-2">{key.fingerprint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SSL/TLS Details */}
          {port.ssl && (
            <div className="space-y-2">
              <span className="text-gruvbox-blue font-medium">SSL/TLS Info:</span>
              <div className="pl-4 space-y-1">
                <div>
                  <span className="text-gruvbox-purple">Subject:</span>
                  <span className="text-gruvbox-fg/80 ml-2">{port.ssl.subject}</span>
                </div>
                <div>
                  <span className="text-gruvbox-purple">Valid From:</span>
                  <span className="text-gruvbox-fg/80 ml-2">{port.ssl.validFrom}</span>
                </div>
                <div>
                  <span className="text-gruvbox-purple">Valid Until:</span>
                  <span className="text-gruvbox-fg/80 ml-2">{port.ssl.validUntil}</span>
                </div>
              </div>
            </div>
          )}

          {/* Extra Info */}
          {port.extraInfo && (
            <div className="space-y-1">
              <span className="text-gruvbox-blue font-medium">Additional Info:</span>
              <div className="pl-4 text-gruvbox-fg/80">{port.extraInfo}</div>
            </div>
          )}
        </div>

        {/* Script output section */}
        {port.scripts && port.scripts.length > 0 && (
          <div className="mt-4">
            <h4 className="text-gruvbox-blue font-medium mb-2">Script Output</h4>
            <div className="bg-gruvbox-bg-hard/50 rounded-lg p-4 font-mono text-sm
                          border border-gruvbox-fg/5 max-h-96 overflow-y-auto">
              {port.scripts.map((script, i) => (
                <div key={i} className="text-gruvbox-fg/80 whitespace-pre-wrap mb-2">{script}</div>
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
  const hostDetailsRef = useRef(null);

  // Smooth scroll to host details when selected
  useEffect(() => {
    if (selectedHost && hostDetailsRef.current) {
      hostDetailsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [selectedHost]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await window.fs.readFile('scan.txt', { encoding: 'utf8' });
        const hostBlocks = response.split('\nNmap scan report for ').slice(1);
        
        const parsedHosts = hostBlocks.map(block => {
          const lines = block.split('\n');
          let ip = lines[0].trim();
          const ports = [];
          let hostname = null;
          let osInfo = null;
          let distance = null;

          if (ip.includes('(') && ip.includes(')')) {
            const parts = ip.split('(');
            hostname = parts[0].trim();
            ip = parts[1].replace(')', '').trim();
          }
          
          lines.forEach((line, index) => {
            // Parse OS info
            if (line.includes('OS details:')) {
              osInfo = line.split('OS details:')[1].trim();
            }
            
            // Parse network distance
            if (line.includes('Network Distance:')) {
              distance = parseInt(line.split('Network Distance:')[1].trim().split(' ')[0]);
            }

            // Parse port information
            const portMatch = line.match(/(\d+)\/tcp\s+(open|filtered|closed)\s+(\S+)(?:\s+(.*))?/);
            if (portMatch) {
              const port = {
                port: parseInt(portMatch[1]),
                state: portMatch[2],
                service: portMatch[3],
                product: null,
                version: null,
                extraInfo: null,
                hostKeys: [],
                ssl: null
              };

              // Parse version/product info
              if (portMatch[4]) {
                const details = portMatch[4].split(/\s+/);
                if (details.length > 0) {
                  port.product = details[0];
                  port.version = details[1];
                  port.extraInfo = details.slice(2).join(' ');
                }
              }

              // Look for SSH host keys
              if (port.service === 'ssh') {
                let i = index + 1;
                while (i < lines.length && lines[i].includes('ssh-hostkey:')) {
                  const keyMatch = lines[i].match(/(\d+)\s+(\w+)\s+(\w+)\s+\((\w+)\)/);
                  if (keyMatch) {
                    port.hostKeys.push({
                      type: keyMatch[4],
                      fingerprint: keyMatch[3]
                    });
                  }
                  i++;
                }
              }

              // Look for SSL info
              if (lines[index - 1]?.includes('ssl-cert:')) {
                port.ssl = {
                  subject: lines[index - 1].match(/Subject: (.+)/)?.[1],
                  validFrom: lines[index].match(/Not valid before: (.+)/)?.[1],
                  validUntil: lines[index + 1].match(/Not valid after: (.+)/)?.[1]
                };
              }

              // Parse script output
              let scriptOutput = [];
              let i = index + 1;
              while (i < lines.length && lines[i].startsWith('|')) {
                scriptOutput.push(lines[i].substring(2));
                i++;
              }
              if (scriptOutput.length > 0) {
                port.scripts = scriptOutput;
              }

              ports.push(port);
            }
          });
          
          return { 
            ip, 
            hostname, 
            ports,
            osInfo,
            distance
          };
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
    if (host.osInfo) return host.osInfo.split(' ')[0];
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
    (host.hostname && host.hostname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (host.osInfo && host.osInfo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    host.ports.some(p => 
      p.service.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.port.toString().includes(searchTerm) ||
      (p.product && p.product.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.version && p.version.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="space-y-6 p-4 relative">
      <Card className="sticky top-4 z-50 backdrop-blur-xl bg-gruvbox-bg-soft/30 border-gruvbox-fg/10 shadow-2xl">
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between text-gruvbox-fg">
            <span className="text-xl font-semibold">Network Infrastructure Analysis</span>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search hosts, ports, services, OS info..."
                className="px-4 py-2 bg-gruvbox-bg-hard/50 border border-gruvbox-fg/10 rounded-xl
                         text-gruvbox-fg placeholder-gruvbox-gray/50
                         focus:outline-none focus:border-gruvbox-yellow/50
                         transition-all duration-300 w-80"
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
              <h3 className="text-lg font-semibold mb-4 text-gruvbox-yellow flex items-center gap-2">
                {group} ({groupHosts.length} hosts)
                {group.includes('Risk') && (
                  <ShieldAlert className={`w-5 h-5 ${
                    group.includes('High') ? 'text-gruvbox-red' :
                    group.includes('Medium') ? 'text-gruvbox-yellow' :
                    'text-gruvbox-green'
                  }`} />
                )}
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
                                hover:shadow-lg hover:-translate-y-1 group
                                ${selectedHost?.ip === host.ip ? 'ring-2 ring-gruvbox-yellow' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gruvbox-fg group-hover:text-gruvbox-yellow 
                                     transition-colors duration-300">
                          {host.ip}
                          {host.hostname && (
                            <span className="text-sm text-gruvbox-gray ml-2">
                              ({host.hostname})
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {host.distance && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-gruvbox-bg-hard/30 
                                         text-gruvbox-purple">
                              {host.distance} hop{host.distance !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-sm px-3 py-1 rounded-lg bg-gruvbox-bg-hard/30 
                                       text-gruvbox-gray group-hover:text-gruvbox-yellow
                                       transition-colors duration-300 flex items-center gap-1">
                            <Fingerprint className="w-4 h-4" />
                            {getSystemType(host)}
                          </span>
                        </div>
                      </div>
                      
                      {host.osInfo && (
                        <div className="text-sm text-gruvbox-gray mb-3 bg-gruvbox-bg-hard/30 
                                      rounded-lg p-2 border border-gruvbox-fg/5">
                          {host.osInfo}
                        </div>
                      )}
                      
                        <div className="text-sm text-gruvbox-gray space-y-1">
                          <div className="flex justify-between">
                            <span>Open Ports:</span>
                            <span className="text-gruvbox-green font-medium">
                              {host.ports.filter(p => p.state === 'open').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Filtered:</span>
                            <span className="text-gruvbox-yellow font-medium">
                              {host.ports.filter(p => p.state === 'filtered').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Closed:</span>
                            <span className="text-gruvbox-red font-medium">
                              {host.ports.filter(p => p.state === 'closed').length}
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
                              {port.version && (
                                <span className="text-xs text-gruvbox-gray">v{port.version}</span>
                              )}
                            </span>
                          ))}
                        {host.ports.filter(p => p.state === 'open').length > 3 && (
                          <span className="px-3 py-1 bg-gruvbox-bg-hard/30 rounded-lg text-sm 
                                       text-gruvbox-gray hover:text-gruvbox-yellow
                                       transition-colors duration-300 cursor-pointer">
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
            <div ref={hostDetailsRef} 
                 className="mt-8 p-6 backdrop-blur-md bg-gruvbox-bg-soft/30 rounded-xl 
                         border border-gruvbox-fg/10 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gruvbox-yellow flex items-center gap-2">
                  Host Details: {selectedHost.ip}
                  {selectedHost.hostname && (
                    <span className="text-base text-gruvbox-gray">
                      ({selectedHost.hostname})
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4">
                  {selectedHost.osInfo && (
                    <span className="text-sm px-3 py-1 rounded-lg bg-gruvbox-bg-hard/30 
                                 text-gruvbox-purple border border-gruvbox-fg/10">
                      {selectedHost.osInfo}
                    </span>
                  )}
                  {selectedHost.distance && (
                    <span className="text-sm px-3 py-1 rounded-lg bg-gruvbox-bg-hard/30 
                                 text-gruvbox-aqua border border-gruvbox-fg/10">
                      {selectedHost.distance} hop{selectedHost.distance !== 1 ? 's' : ''} away
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4 text-gruvbox-aqua flex items-center gap-2">
                    Open Ports
                    <span className="text-sm px-2 py-1 rounded-lg bg-gruvbox-bg-hard/30 text-gruvbox-gray">
                      {selectedHost.ports.filter(p => p.state === 'open').length} total
                    </span>
                  </h4>
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
                                      hover:border-gruvbox-yellow hover:-translate-y-0.5
                                      transition-all duration-300 group cursor-zoom-in">
                          <div className="font-medium text-gruvbox-fg group-hover:text-gruvbox-yellow
                                        transition-colors duration-300 flex items-center justify-between">
                            <span>Port {port.port}</span>
                            {port.version && (
                              <span className="text-xs text-gruvbox-purple">v{port.version}</span>
                            )}
                          </div>
                          <div className="text-sm text-gruvbox-gray flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getServiceIcon(port.service)}
                              <span>{port.service}</span>
                            </div>
                            {port.product && (
                              <span className="text-xs text-gruvbox-aqua">{port.product}</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4 text-gruvbox-purple flex items-center gap-2">
                    Filtered/Closed Ports
                    <span className="text-sm px-2 py-1 rounded-lg bg-gruvbox-bg-hard/30 text-gruvbox-gray">
                      {selectedHost.ports.filter(p => p.state !== 'open').length} total
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedHost.ports
                      .filter(p => p.state !== 'open')
                      .map(port => (
                        <div key={port.port} 
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedPort(port);
                             }}
                             className="p-3 bg-gruvbox-bg-hard/30 rounded-xl
                                      border border-gruvbox-fg/10
                                      hover:border-gruvbox-yellow hover:-translate-y-0.5
                                      transition-all duration-300 group cursor-zoom-in">
                          <div className="font-medium text-gruvbox-fg group-hover:text-gruvbox-yellow
                                        transition-colors duration-300">
                            Port {port.port}
                          </div>
                          <div className="text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gruvbox-gray">
                              {getServiceIcon(port.service)}
                              <span>{port.service}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-lg 
                                        ${port.state === 'filtered' 
                                          ? 'bg-gruvbox-yellow/20 text-gruvbox-yellow'
                                          : 'bg-gruvbox-red/20 text-gruvbox-red'}`}>
                              {port.state}
                            </span>
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
