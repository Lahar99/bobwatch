'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Results() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [visibleCards, setVisibleCards] = useState([]);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from sessionStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have stored analysis results
        const storedData = sessionStorage.getItem('analysisResult');
        console.log('Results page - checking sessionStorage:', storedData ? 'Data found' : 'No data');
        
        if (storedData) {
          // Use stored data from real analysis
          const parsedData = JSON.parse(storedData);
          console.log('Results page - parsed data:', {
            score: parsedData.score,
            riskyCount: parsedData.risky?.length || 0,
            collateralCount: parsedData.collateral?.length || 0,
            intendedCount: parsedData.intended?.length || 0
          });
          
          setData(parsedData);
          setScore(parsedData.score);
          setIsLoading(false);
        } else {
          // No data available - show error
          console.log('Results page - no data in sessionStorage');
          setError('No analysis data found. Please submit a new analysis from the homepage.');
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to load analysis data: ' + err.message);
        console.error('Error fetching data:', err);
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup: Clear sessionStorage when component unmounts
    return () => {
      console.log('Results page - cleaning up sessionStorage');
      sessionStorage.removeItem('analysisResult');
    };
  }, []);

  // Animate score when data is loaded
  useEffect(() => {
    if (!data) return;

    const duration = 2000;
    const steps = 60;
    const increment = data.score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= data.score) {
        setAnimatedScore(data.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [data]);

  // Stagger card animations when data is loaded
  useEffect(() => {
    if (!data) return;

    const allCards = [
      ...data.risky.map((_, i) => `risky-${i}`),
      ...data.collateral.map((_, i) => `collateral-${i}`),
      ...data.intended.map((_, i) => `intended-${i}`)
    ];

    allCards.forEach((cardId, index) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, cardId]);
      }, index * 100);
    });
  }, [data]);

  const handleNewAnalysis = () => {
    router.push('/');
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p className="text-text/80 text-lg">Loading analysis results...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 text-xl mb-4">⚠️ Error loading results</p>
          <p className="text-text/60 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // Show results when data is loaded
  if (!data) return null;

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
            
            {/* New Analysis Button */}
            <button 
              onClick={handleNewAnalysis}
              className="px-6 py-2 border-2 border-accent text-accent rounded-lg hover:bg-accent hover:text-white transition-all duration-200 font-medium"
            >
              New Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score Section */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-8 text-center">
            Analysis Results
          </h1>
          
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-text mb-4 text-center">
              Intent vs Reality Score
            </h2>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl font-bold text-accent">
                {animatedScore}%
              </span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full bg-background rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-blue-400 transition-all duration-2000 ease-out"
                style={{ width: `${animatedScore}%` }}
              ></div>
            </div>
            
            <p className="text-center text-text/60 mt-4 text-sm">
              {score >= 80 ? 'Excellent alignment with your instructions' : 
               score >= 60 ? 'Good alignment with some concerns' : 
               'Significant deviations detected'}
            </p>
          </div>
        </div>

        {/* File Cards Sections */}
        <div className="space-y-12">
          {/* RISKY Section */}
          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-2">
              <span>🚨</span>
              <span>RISKY</span>
              <span className="text-sm font-normal text-text/60">
                ({data.risky.length} files)
              </span>
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {data.risky.map((file, index) => (
                <div
                  key={index}
                  className={`bg-card rounded-lg p-6 border-2 border-red-500 transition-all duration-500 ${
                    visibleCards.includes(`risky-${index}`) 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                  } animate-pulse-glow`}
                  style={{
                    animation: visibleCards.includes(`risky-${index}`) 
                      ? 'pulse-glow 2s ease-in-out infinite' 
                      : 'none'
                  }}
                >
                  <h3 className="font-mono text-sm text-red-400 mb-3 break-all">
                    {file.filename}
                  </h3>
                  <p className="text-text/80 text-sm leading-relaxed">
                    {file.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* COLLATERAL Section */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
              <span>⚠️</span>
              <span>COLLATERAL</span>
              <span className="text-sm font-normal text-text/60">
                ({data.collateral.length} files)
              </span>
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {data.collateral.map((file, index) => (
                <div
                  key={index}
                  className={`bg-card rounded-lg p-6 border border-yellow-500/50 transition-all duration-500 ${
                    visibleCards.includes(`collateral-${index}`) 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-mono text-sm text-yellow-400 mb-3 break-all">
                    {file.filename}
                  </h3>
                  <p className="text-text/80 text-sm leading-relaxed">
                    {file.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* INTENDED Section */}
          <section>
            <h2 className="text-2xl font-bold text-green-500 mb-6 flex items-center gap-2">
              <span>✅</span>
              <span>INTENDED</span>
              <span className="text-sm font-normal text-text/60">
                ({data.intended.length} files)
              </span>
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {data.intended.map((file, index) => (
                <div
                  key={index}
                  className={`bg-card rounded-lg p-6 border border-green-500/50 transition-all duration-500 ${
                    visibleCards.includes(`intended-${index}`) 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  <h3 className="font-mono text-sm text-green-400 mb-3 break-all">
                    {file.filename}
                  </h3>
                  <p className="text-text/80 text-sm leading-relaxed">
                    {file.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.5),
                        0 0 10px rgba(239, 68, 68, 0.3),
                        0 0 15px rgba(239, 68, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.8),
                        0 0 20px rgba(239, 68, 68, 0.5),
                        0 0 30px rgba(239, 68, 68, 0.3);
          }
        }
      `}</style>
    </main>
  );
}

// Made with Bob
