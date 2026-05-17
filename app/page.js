'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoClick = () => {
    setRepoUrl('https://github.com/ch1n-may/demo-ecommerce-app/pull/1');
    setInstructions('Add comments to page.js');
  };

  const handleAnalyze = async () => {
    if (!repoUrl || !instructions) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUrl: repoUrl,
          userIntent: instructions
        })
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.status === 'success') {
        // Store results in sessionStorage for the results page
        const dataToStore = result.data;
        console.log('Storing analysis data:', dataToStore);
        sessionStorage.setItem('analysisResult', JSON.stringify(dataToStore));
        
        // Verify storage
        const stored = sessionStorage.getItem('analysisResult');
        console.log('Verified stored data:', stored ? 'Data saved successfully' : 'Failed to save data');
        
        router.push('/results');
      } else {
        // Handle error
        alert(`Error: ${result.message || 'Failed to analyze code'}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('An error occurred while analyzing. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text flex flex-col">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Premium Scanner Watch Logo */}
            <div className="flex items-center gap-3 font-sans select-none">
              {/* Scanner Watch Icon */}
              <div className="relative w-9 h-9 border border-[#1a2035] bg-[#0D1421] rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
                {/* Radar Sweep Grid - Rotating Background */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(45deg, transparent 48%, rgba(79, 142, 247, 0.1) 49%, rgba(79, 142, 247, 0.1) 51%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(79, 142, 247, 0.1) 49%, rgba(79, 142, 247, 0.1) 51%, transparent 52%)',
                    backgroundSize: '8px 8px',
                    animation: 'radar-sweep 8s linear infinite'
                  }}
                ></div>
                
                {/* Corner Brackets - Tech Aesthetic */}
                <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-[#4F8EF7]/40"></div>
                <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-[#4F8EF7]/40"></div>
                <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-[#4F8EF7]/40"></div>
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-[#4F8EF7]/40"></div>
                
                {/* Glowing Core Dot - Dual Layer */}
                <div className="relative flex items-center justify-center">
                  {/* Ping Animation Layer */}
                  <div className="absolute w-2.5 h-2.5 bg-[#4F8EF7] rounded-full animate-[ping_2s_infinite_ease-in-out]"></div>
                  {/* Solid Core with Glow */}
                  <div className="relative w-2.5 h-2.5 bg-[#4F8EF7] rounded-full shadow-[0_0_6px_#4F8EF7]"></div>
                </div>
              </div>
              
              {/* Typography Layout */}
              <div className="flex flex-col">
                {/* Brand Name */}
                <div className="flex items-center gap-0.5">
                  <span className="text-xl font-bold font-mono text-white">Bob</span>
                  <span className="text-xl font-bold font-mono text-[#4F8EF7]">Watch</span>
                </div>
                {/* Sub-tag */}
                <div className="text-[10px] uppercase tracking-widest text-slate-500 -mt-0.5">
                  AI Governance
                </div>
              </div>
            </div>
            
            {/* Demo Button */}
            <button
              onClick={handleDemoClick}
              className="px-6 py-2 border-2 border-accent text-accent rounded-lg hover:bg-accent hover:text-white transition-all duration-200 font-medium"
            >
              See Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Centered */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl w-full text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
            Trust What Bob Built
          </h1>
          <p className="text-lg sm:text-xl text-text/80 max-w-2xl mx-auto mb-12">
            See exactly what Bob changed — and what it shouldn't have.
          </p>

          {/* Input Block */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-xl">
              {/* GitHub Repo URL Input */}
              <div className="mb-6">
                <label htmlFor="repo-url" className="block text-text text-sm font-medium mb-3 text-left">
                  GitHub Repo URL
                </label>
                <input
                  id="repo-url"
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              {/* Intent Input */}
              <div className="mb-8">
                <label htmlFor="instructions" className="block text-text text-sm font-medium mb-3 text-left">
                  What did you tell Bob to do?
                </label>
                <input
                  id="instructions"
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g., Add a login page with authentication"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !repoUrl || !instructions}
                className="w-full py-4 bg-accent text-white font-bold text-lg rounded-lg hover:bg-accent/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:active:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing your code...
                  </span>
                ) : (
                  'ANALYZE WITH BOBWATCH'
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar at Bottom */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {/* Time Saved */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div className="text-left">
                <div className="text-accent font-bold text-lg">45 Min Saved</div>
                <div className="text-text/60 text-xs">Average per analysis</div>
              </div>
            </div>

            {/* Users Verified */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="text-2xl">👥</span>
              <div className="text-left">
                <div className="text-accent font-bold text-lg">80k Users Verified</div>
                <div className="text-text/60 text-xs">Trust in automation</div>
              </div>
            </div>

            {/* Unintended Changes */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="text-2xl">🚨</span>
              <div className="text-left">
                <div className="text-accent font-bold text-lg">40% Unintended Changes</div>
                <div className="text-text/60 text-xs">Detected & prevented</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Made with Bob