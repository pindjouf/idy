import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import NetworkViz from './components/NetworkViz.jsx';
import { GithubIcon, ExternalLinkIcon, ShieldIcon } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react"

const SEO_CONFIG = {
  title: 'IDY - Transform Nmap Data Into Pure Eye Candy 🍬',
  description: 'Transform your Nmap scan results into interactive visualizations. Professional-grade network infrastructure analysis tool for security professionals and penetration testers.',
  keywords: [
    'nmap visualization',
    'network security tool',
    'security visualization',
    'network mapping',
    'penetration testing',
    'infrastructure analysis',
    'port scanning',
    'network reconnaissance',
    'cybersecurity tool',
    'security assessment'
  ].join(', '),
  author: 'pindjouf',
  social: {
    twitter: '@pindjouf',
    github: 'pindjouf/idy'
  },
  organization: {
    name: 'IDY',
    logo: '/logo.png',
    sameAs: [
      'https://github.com/pindjouf/idy',
      'https://twitter.com/pindjouf'
    ]
  }
};

function App() {
  const [fileKey, setFileKey] = useState(0);
  const [scanFile, setScanFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsProcessing(true);
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const textContent = e.target.result;
          window.fs = {
            readFile: async (filename, options) => {
              if (options?.encoding === 'utf8') {
                return textContent;
              }
              return new TextEncoder().encode(textContent);
            }
          };
          setScanFile(file.name);
          setFileKey(prevKey => prevKey + 1);
        };

        reader.onerror = () => {
          console.error('File reading failed');
        };

        reader.readAsText(file);
      } catch (error) {
        console.error('Error processing file:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <html lang="en" />
        <title>{SEO_CONFIG.title}</title>
        <meta name="title" content={SEO_CONFIG.title} />
        <meta name="description" content={SEO_CONFIG.description} />
        <meta name="keywords" content={SEO_CONFIG.keywords} />
        <meta name="author" content={SEO_CONFIG.author} />
        <meta name="theme-color" content="#1d2021" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={SEO_CONFIG.title} />
        <meta property="og:description" content={SEO_CONFIG.description} />
        <meta property="og:image" content="/preview.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={SEO_CONFIG.title} />
        <meta property="twitter:description" content={SEO_CONFIG.description} />
        <meta property="twitter:image" content="/preview.png" />
        <meta name="twitter:creator" content={SEO_CONFIG.social.twitter} />

        {/* Structured Data / JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: SEO_CONFIG.organization.name,
            description: SEO_CONFIG.description,
            author: {
              '@type': 'Organization',
              name: SEO_CONFIG.organization.name,
              logo: SEO_CONFIG.organization.logo,
              sameAs: SEO_CONFIG.organization.sameAs
            },
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            }
          })}
        </script>

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-gruvbox-bg relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gruvbox-bg-hard via-gruvbox-bg to-gruvbox-bg-soft opacity-50"></div>
          
          {/* Animated orbs */}
          <div className="absolute top-0 -left-20 w-72 h-72 bg-gruvbox-blue/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-20 w-72 h-72 bg-gruvbox-purple/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-gruvbox-aqua/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          {/* Header Section */}
          <header role="banner" className="w-full pt-8 pb-4 px-4">
            <div className="max-w-7xl mx-auto text-center space-y-4">
              {/* Title with Gruvbox gradient */}
              <h1 className="text-7xl font-bold tracking-tight relative group">
                <span className="bg-gradient-to-r from-gruvbox-blue via-gruvbox-aqua to-gruvbox-purple
                               bg-clip-text text-transparent animate-gradient bg-300%
                               relative z-10 group-hover:animate-none
                               drop-shadow-[0_0_25px_rgba(131,165,152,0.3)]">
                  IDY
                </span>
              </h1>

              {/* Subtitle with glass effect */}
              <p className="text-xl text-gruvbox-gray max-w-2xl mx-auto
                         backdrop-blur-lg bg-gruvbox-bg-soft/30 p-4 rounded-xl
                         border border-gruvbox-fg/10 shadow-lg">
                Advanced Network Mapping Visualization Tool for Security Professionals
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto px-4">
                {['Interactive Network Visualization', 'Real-time Port Analysis', 
                  'System Classification', 'Risk Assessment'].map((feature, i) => (
                  <div key={i} 
                       className="backdrop-blur-lg bg-gruvbox-bg-soft/30 p-3 rounded-lg
                                border border-gruvbox-fg/10 
                                transform hover:-translate-y-1 hover:shadow-lg
                                transition-all duration-300 group">
                    <span className="text-gruvbox-fg group-hover:text-gruvbox-yellow
                                   transition-colors duration-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 mt-4 buttons-container">
                  <a href="https://github.com/pindjouf/idy"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-4 py-2
                              backdrop-blur-lg bg-gruvbox-bg-soft/30
                              border border-gruvbox-fg/10 rounded-lg
                              text-gruvbox-fg hover:text-gruvbox-yellow
                              transform hover:-translate-y-1 hover:shadow-lg
                              transition-all duration-300 group">
                    <GithubIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>View on GitHub</span>
                    <ExternalLinkIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                  
                  <a href="https://hub.docker.com/r/pindjouf/idy"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-4 py-2
                              backdrop-blur-lg bg-gruvbox-bg-soft/30
                              border border-gruvbox-fg/10 rounded-lg
                              text-gruvbox-fg hover:text-gruvbox-yellow
                              transform hover:-translate-y-1 hover:shadow-lg
                              transition-all duration-300 group">
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/>
                    </svg>
                    <span>View on Docker</span>
                    <ExternalLinkIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </div>
            </div>
          </header>

          {/* Main Content */}
          <main role="main" className="max-w-7xl mx-auto px-4 py-6">
            {/* Upload Section */}
            <div className="backdrop-blur-xl bg-gruvbox-bg-soft/30 p-8 rounded-xl
                          border border-gruvbox-fg/10 shadow-2xl
                          relative overflow-hidden group mb-8">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-gruvbox-blue/5 via-gruvbox-aqua/5 to-gruvbox-purple/5
                           opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Icon */}
              <ShieldIcon className="w-16 h-16 text-gruvbox-aqua mx-auto mb-4
                                   group-hover:text-gruvbox-yellow 
                                   transition-colors duration-300
                                   drop-shadow-[0_0_8px_rgba(131,165,152,0.3)]" />

              {/* Upload Title */}
              <h2 className="text-3xl font-bold mb-3 text-center
                           bg-gradient-to-r from-gruvbox-fg to-gruvbox-yellow
                           bg-clip-text text-transparent">
                Upload Your Nmap Scan Results
              </h2>

              {/* Description */}
              <p className="text-gruvbox-gray text-lg mb-6 text-center">
                Transform your network scan data into interactive visualizations.
              </p>

              {/* File Input */}
              <label className="block">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="relative block w-full text-gruvbox-gray
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-semibold
                           file:bg-gruvbox-blue/80 file:text-gruvbox-bg
                           file:cursor-pointer
                           hover:file:bg-gruvbox-yellow
                           file:transition-all file:duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </label>

              {/* Current File Display */}
              {scanFile && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2
                                backdrop-blur-md bg-gruvbox-bg-soft/30 rounded-lg
                                border border-gruvbox-fg/10">
                    <span className="text-gruvbox-gray">Current file:</span>
                    <span className="text-gruvbox-yellow">{scanFile}</span>
                  </span>
                </div>
              )}
            </div>

            {/* NetworkViz Component */}
            {scanFile && <NetworkViz key={fileKey} />}
          </main>

          {/* Footer */}
          <footer role="contentinfo" className="w-full py-6 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <p className="inline-flex items-center gap-3 px-6 py-3
                         backdrop-blur-md bg-gruvbox-bg-soft/30 rounded-xl
                         border border-gruvbox-fg/10">
                <span className="text-gruvbox-gray">Version 1.0.0</span>
                <span className="text-gruvbox-fg/30">•</span>
                <span className="text-gruvbox-gray">Made with</span>
                <span className="text-gruvbox-red animate-pulse">❤️</span>
                <span className="text-gruvbox-gray">by Claude.ai & <a href="https://pindjouf.xyz"><b>@pindjouf</b></a></span>
              </p>
            </div>
          </footer>
        </div>
      </div>
      <Analytics />
    </>
  );
}

export default App;
