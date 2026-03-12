import { useState } from 'react';

export default function App() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleScan = (e) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setShowResults(false);
    setScanStatus('Initializing Puppeteer Headless Browser...');

    // Fake backend loading sequence
    setTimeout(() => {
      setScanStatus('Navigating to URL & Extracting DOM Elements...');
    }, 1500);

    setTimeout(() => {
      setScanStatus('Intercepting Network Requests (Third-party trackers)...');
    }, 3000);

    setTimeout(() => {
      setScanStatus('Mapping UI to DPDP Section 5 & 6 Compliance Rules...');
    }, 4500);

    setTimeout(() => {
      setIsScanning(false);
      setShowResults(true);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold tracking-tight text-blue-900">
          Nyaya<span className="text-blue-600">Auditor</span>
        </div>
        <div className="text-sm font-medium text-slate-500">
          DPDP Act 2023 Compliance Engine
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto mt-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Automated Privacy Compliance <br />
          <span className="text-blue-600">for Indian Startups</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Run a static and dynamic analysis on any web application to instantly detect violations of India's Digital Personal Data Protection (DPDP) Act.
        </p>

        {/* Input Form */}
        <form onSubmit={handleScan} className="max-w-2xl mx-auto relative shadow-xl rounded-xl">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-startup.com/signup"
            className="w-full px-6 py-5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            required
            disabled={isScanning}
          />
          <button
            type="submit"
            disabled={isScanning}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 rounded-lg transition-colors disabled:bg-blue-400"
          >
            {isScanning ? 'Scanning...' : 'Run Audit'}
          </button>
        </form>

        {/* Scanning State */}
        {isScanning && (
          <div className="mt-12 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-600 font-medium text-lg">{scanStatus}</p>
          </div>
        )}

        {/* Mock Results Dashboard */}
        {showResults && (
          <div className="mt-12 bg-white rounded-xl shadow-lg border border-slate-200 text-left overflow-hidden animate-fade-in">
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-red-800 font-bold text-lg">Audit Complete: High Risk Detected</h3>
                <p className="text-red-600 text-sm">Target: {url}</p>
              </div>
              <div className="bg-red-600 text-white text-2xl font-bold px-4 py-2 rounded-lg">
                Score: 45/100
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Identified Violations (2)</h4>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Section 6</span>
                  <p className="font-semibold text-slate-800">Invalid Consent Architecture</p>
                </div>
                <p className="text-slate-600 text-sm">
                  <strong>DOM Element:</strong> `&lt;input type="checkbox" defaultChecked /&gt;`<br/>
                  <strong>Issue:</strong> Pre-ticked checkboxes do not constitute clear affirmative action under the DPDP Act.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">Section 5</span>
                  <p className="font-semibold text-slate-800">Missing Localized Notice</p>
                </div>
                <p className="text-slate-600 text-sm">
                  <strong>DOM Element:</strong> `&lt;form id="register"&gt;`<br/>
                  <strong>Issue:</strong> No hyperlink to a Privacy Notice found within the viewport of the data collection point. No language toggle available.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}