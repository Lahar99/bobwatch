'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      if (result.status === 'success') {
        // Store results in sessionStorage for the results page
        sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
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
    <main className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-xl font-bold text-text">BobWatch</span>
            </div>
            
            {/* Demo Button */}
            <button className="px-6 py-2 border-2 border-accent text-accent rounded-lg hover:bg-accent hover:text-white transition-all duration-200 font-medium">
              See Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
          Trust What Bob Built
        </h1>
        <p className="text-lg sm:text-xl text-text/80 max-w-2xl mx-auto">
          See exactly what Bob changed — and what it shouldn&apos;t have.
        </p>
      </section>

      {/* Input Section */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border">
          {/* GitHub Repo URL Input */}
          <div className="mb-6">
            <label htmlFor="repo-url" className="block text-text text-sm font-medium mb-3">
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

          {/* Instructions Input */}
          <div className="mb-8">
            <label htmlFor="instructions" className="block text-text text-sm font-medium mb-3">
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
      </section>
    </main>
  );
}

// Made with Bob
