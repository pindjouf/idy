export const generateReport = (hosts, getSystemType, getRiskLevel) => {
  const now = new Date().toLocaleString();
  const reportContent = {
    title: "Network Infrastructure Analysis Report",
    timestamp: now,
    summary: {
      totalHosts: hosts.length,
      openPorts: hosts.reduce((acc, host) => acc + host.ports.filter(p => p.state === 'open').length, 0),
      totalServices: new Set(hosts.flatMap(host => host.ports.map(p => p.service))).size,
      riskBreakdown: {
        high: hosts.filter(h => getRiskLevel(h) === 'high').length,
        medium: hosts.filter(h => getRiskLevel(h) === 'medium').length,
        low: hosts.filter(h => getRiskLevel(h) === 'low').length
      },
      operatingSystems: hosts.reduce((acc, host) => {
        const os = getSystemType(host);
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      }, {})
    },
    hosts: hosts.map(host => ({
      ip: host.ip,
      hostname: host.hostname || 'N/A',
      os: getSystemType(host),
      riskLevel: getRiskLevel(host),
      ports: host.ports.map(port => ({
        port: port.port,
        state: port.state,
        service: port.service,
        version: port.version || 'Unknown',
        product: port.product || 'Unknown',
        extraInfo: port.extraInfo || 'N/A',
        scripts: port.scripts || []
      }))
    }))
  };

  const htmlReport = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportContent.title}</title>
        <style>
          :root {
            --gruvbox-bg: #1d2021;
            --gruvbox-bg-soft: #282828;
            --gruvbox-fg: #ebdbb2;
            --gruvbox-gray: #928374;
            --gruvbox-red: #fb4934;
            --gruvbox-green: #b8bb26;
            --gruvbox-yellow: #fabd2f;
            --gruvbox-blue: #83a598;
            --gruvbox-purple: #d3869b;
            --gruvbox-aqua: #8ec07c;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--gruvbox-bg);
            color: var(--gruvbox-fg);
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          /* Report Header */
          .report-header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: var(--gruvbox-bg-soft);
            border-radius: 1rem;
            border: 1px solid rgba(235, 219, 178, 0.1);
          }

          .report-header h1 {
            font-size: 2.5rem;
            margin: 0;
            background: linear-gradient(45deg, var(--gruvbox-blue), var(--gruvbox-aqua));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .timestamp {
            color: var(--gruvbox-gray);
            margin-top: 1rem;
          }

          /* Executive Summary */
          .executive-summary {
            background: rgba(131, 165, 152, 0.1);
            border: 1px solid rgba(131, 165, 152, 0.2);
            padding: 2rem;
            border-radius: 1rem;
            margin: 2rem 0;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
          }

          .stat-box {
            background: rgba(40, 40, 40, 0.5);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(235, 219, 178, 0.1);
          }

          .stat-box h3 {
            color: var(--gruvbox-aqua);
            margin: 0 0 0.5rem 0;
          }

          /* Host Cards */
          .host-card {
            background: var(--gruvbox-bg-soft);
            border: 1px solid rgba(235, 219, 178, 0.1);
            border-radius: 1rem;
            padding: 2rem;
            margin: 1.5rem 0;
          }

          .host-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .host-title {
            color: var(--gruvbox-blue);
            font-size: 1.5rem;
            margin: 0;
          }

          /* Port Tables */
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 1.5rem 0;
          }

          th {
            background: rgba(50, 48, 47, 0.7);
            padding: 1rem;
            text-align: left;
            color: var(--gruvbox-aqua);
          }

          td {
            padding: 1rem;
            background: rgba(50, 48, 47, 0.3);
            border-top: 1px solid rgba(235, 219, 178, 0.1);
          }

          tr:hover td {
            background: rgba(50, 48, 47, 0.5);
          }

          /* Risk Levels */
          .risk-high { color: var(--gruvbox-red); }
          .risk-medium { color: var(--gruvbox-yellow); }
          .risk-low { color: var(--gruvbox-green); }

          /* Script Output */
          .script-output {
            background: rgba(40, 40, 40, 0.7);
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            white-space: pre-wrap;
            margin-top: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="report-header">
            <h1>${reportContent.title}</h1>
            <div class="timestamp">Generated on ${reportContent.timestamp}</div>
          </div>

          <div class="executive-summary">
            <h2>Executive Summary</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <h3>Infrastructure Overview</h3>
                <p>Total Hosts: ${reportContent.summary.totalHosts}</p>
                <p>Open Ports: ${reportContent.summary.openPorts}</p>
                <p>Unique Services: ${reportContent.summary.totalServices}</p>
              </div>
              <div class="stat-box">
                <h3>Risk Assessment</h3>
                <p class="risk-high">High Risk: ${reportContent.summary.riskBreakdown.high} hosts</p>
                <p class="risk-medium">Medium Risk: ${reportContent.summary.riskBreakdown.medium} hosts</p>
                <p class="risk-low">Low Risk: ${reportContent.summary.riskBreakdown.low} hosts</p>
              </div>
              <div class="stat-box">
                <h3>Operating Systems</h3>
                ${Object.entries(reportContent.summary.operatingSystems)
                  .map(([os, count]) => `<p>${os}: ${count} hosts</p>`)
                  .join('')}
              </div>
            </div>
          </div>

          <div class="host-details">
            <h2>Host Details</h2>
            ${reportContent.hosts.map(host => `
              <div class="host-card">
                <div class="host-header">
                  <h3 class="host-title">${host.ip} ${host.hostname !== 'N/A' ? `(${host.hostname})` : ''}</h3>
                  <span class="risk-${host.riskLevel.toLowerCase()}">${host.riskLevel.toUpperCase()} RISK</span>
                </div>
                <p>Operating System: ${host.os}</p>
                
                <table>
                  <thead>
                    <tr>
                      <th>Port</th>
                      <th>State</th>
                      <th>Service</th>
                      <th>Version</th>
                      <th>Extra Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${host.ports.map(port => `
                      <tr>
                        <td>${port.port}</td>
                        <td>${port.state}</td>
                        <td>${port.service}</td>
                        <td>${port.product} ${port.version}</td>
                        <td>${port.extraInfo}</td>
                      </tr>
                      ${port.scripts.length > 0 ? `
                        <tr>
                          <td colspan="5">
                            <div class="script-output">${port.scripts.join('\n')}</div>
                          </td>
                        </tr>
                      ` : ''}
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>

          <div class="report-footer">
            <p style="text-align: center; color: var(--gruvbox-gray); margin-top: 3rem;">
              Generated by IDY - Transform Nmap Data Into Pure Eye Candy 🍬
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlReport], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IDY_Report_${now.replace(/[/\\?%*:|"<>]/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
