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
  const [verifiedCards, setVerifiedCards] = useState(new Set());
  
  // AI Auto-Remediate states
  const [remediatingCards, setRemediatingCards] = useState(new Set());
  const [securedCards, setSecuredCards] = useState(new Set());
  const [scoreBoost, setScoreBoost] = useState(0);

  // Handle card verification
  const handleVerifyCard = (cardId) => {
    setVerifiedCards(prev => {
      const newSet = new Set(prev);
      newSet.add(cardId);
      return newSet;
    });
  };

  // Handle AI Auto-Remediate
  const handleAutoFix = (cardId) => {
    // Add to remediating set
    setRemediatingCards(prev => new Set([...prev, cardId]));
    
    // Simulate 2-second AI processing
    setTimeout(() => {
      // Remove from remediating, add to secured
      setRemediatingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
      
      setSecuredCards(prev => new Set([...prev, cardId]));
      
      // Increase score by 15%
      setScoreBoost(prev => prev + 15);
    }, 2000);
  };

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
  }, []);

  // Animate score when data is loaded or scoreBoost changes
  useEffect(() => {
    if (!data) return;

    const targetScore = Math.min(data.score + scoreBoost, 100);
    const duration = 2000;
    const steps = 60;
    const increment = (targetScore - animatedScore) / steps;
    let current = animatedScore;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [data, scoreBoost, animatedScore]);

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
    <main className="min-h-screen bg-background text-text flex flex-col">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo with glowing blue dot */}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent shadow-glow-blue"></div>
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
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Score Section - Side by Side Layout */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-6 sm:mb-8 text-center">
            Analysis Results
          </h1>
          
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {/* Score Circle - Centralized */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-text mb-6 text-center">
                Intent vs Reality Score
              </h2>
              
              {/* Circular Score Display */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-border"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - animatedScore / 100)}`}
                      className="text-accent transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-accent">
                      {animatedScore}%
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-text/60 text-sm">
                {animatedScore >= 80 ? '✅ Excellent alignment with your instructions' :
                 animatedScore >= 60 ? '⚠️ Good alignment with some concerns' :
                 '🚨 Significant deviations detected'}
              </p>
            </div>

            {/* AI Confidence & Stats */}
            <div className="bg-gradient-to-br from-card to-background rounded-2xl p-6 sm:p-8 border border-accent/30 shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-text mb-6 flex items-center gap-2">
                <span>🤖</span>
                <span>AI Analysis Metrics</span>
              </h2>
              
              <div className="space-y-4">
                {/* AI Confidence */}
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text/80 text-sm font-medium">AI Confidence</span>
                    <span className="text-accent font-bold text-lg">94%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="h-full bg-accent rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                
                {/* Governance Level */}
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-text/80 text-sm font-medium">Governance Level</span>
                    <span className="text-green-400 font-bold text-sm">Enterprise Compliant</span>
                  </div>
                </div>

                {/* Files Analyzed */}
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-text/80 text-sm font-medium">Files Analyzed</span>
                    <span className="text-accent font-bold text-lg">
                      {data.risky.length + data.collateral.length + data.intended.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Roadmap Component */}
            <div className="bg-gradient-to-br from-card via-background to-card rounded-2xl p-6 sm:p-8 border border-accent/40 shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-text mb-6 flex items-center gap-2">
                <span>🚀</span>
                <span>Roadmap to 100% Intent Alignment</span>
              </h2>
              
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text/70 text-sm font-medium">Overall Progress</span>
                    <span className="text-accent font-bold text-lg">{animatedScore}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${animatedScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dynamic Checklist */}
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {/* RISKY Items */}
                  {data.risky && data.risky.map((file, index) => {
                    const cardId = `risky-${index}`;
                    const isSecured = securedCards.has(cardId);
                    
                    return (
                      <div
                        key={cardId}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ${
                          isSecured
                            ? 'bg-green-900/10 border-green-500/30 opacity-60'
                            : 'bg-red-900/10 border-red-500/30 hover:bg-red-900/20'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isSecured ? (
                            <span className="text-green-400 text-lg">✅</span>
                          ) : (
                            <span className="text-red-400 text-lg">🔴</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isSecured ? 'line-through text-text/50' : 'text-text/90'
                          }`}>
                            {isSecured ? (
                              <>Resolved <span className="font-mono text-xs">{file.filename}</span> threat</>
                            ) : (
                              <>Resolve <span className="font-mono text-xs">{file.filename}</span> threat</>
                            )}
                          </p>
                          {!isSecured && (
                            <p className="text-xs text-text/60 mt-1">
                              +15% Score — Click Auto-Fix to apply secure patch
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* COLLATERAL Items */}
                  {data.collateral && data.collateral.map((file, index) => {
                    const cardId = `collateral-${index}`;
                    const isVerified = verifiedCards.has(cardId);
                    
                    return (
                      <div
                        key={cardId}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ${
                          isVerified
                            ? 'bg-green-900/10 border-green-500/30 opacity-60'
                            : 'bg-yellow-900/10 border-yellow-500/30 hover:bg-yellow-900/20'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isVerified ? (
                            <span className="text-green-400 text-lg">✅</span>
                          ) : (
                            <span className="text-yellow-400 text-lg">⚠️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isVerified ? 'line-through text-text/50' : 'text-text/90'
                          }`}>
                            {isVerified ? (
                              <>Reviewed <span className="font-mono text-xs">{file.filename}</span> modifications</>
                            ) : (
                              <>Review <span className="font-mono text-xs">{file.filename}</span> structural modifications</>
                            )}
                          </p>
                          {!isVerified && (
                            <p className="text-xs text-text/60 mt-1">
                              +5% Score — Verify no downstream breaking changes
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* All Clear Message */}
                  {data.risky.length === 0 && data.collateral.length === 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-900/20 border border-green-500/40">
                      <span className="text-green-400 text-2xl">🎉</span>
                      <div>
                        <p className="text-green-400 font-semibold text-sm">Perfect Alignment!</p>
                        <p className="text-text/60 text-xs mt-1">All changes match your intent</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-background/50 rounded-lg p-2">
                      <div className="text-accent font-bold text-lg">
                        {data.risky.filter((_, i) => securedCards.has(`risky-${i}`)).length}/{data.risky.length}
                      </div>
                      <div className="text-text/60 text-xs">Threats Fixed</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-2">
                      <div className="text-accent font-bold text-lg">
                        {data.collateral.filter((_, i) => verifiedCards.has(`collateral-${i}`)).length}/{data.collateral.length}
                      </div>
                      <div className="text-text/60 text-xs">Reviews Done</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Agent Governance Status */}
            <div className="bg-gradient-to-br from-card via-background to-card rounded-2xl p-6 sm:p-8 border border-red-500/40 shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-text mb-6 flex items-center gap-2">
                <span>🛡️</span>
                <span>AI Agent Governance Status</span>
              </h2>
              
              <div className="space-y-4">
                {/* MCP Infrastructure Subsection */}
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="text-text/70 text-xs font-medium mb-3 uppercase tracking-wide">
                    MCP Infrastructure
                  </div>
                  
                  {/* Compliance Fault Alert Box */}
                  <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 rounded-lg p-4 border border-orange-500/50 shadow-lg">
                    {/* Main Alert with Pulsing Icon */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0">
                        <span className="text-2xl animate-pulse-warning">⚠️</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-orange-400 font-bold text-sm sm:text-base animate-pulse-text">
                          ⚠️ COMPLIANCE FAULT: OVER-PERMISSIONED AGENT RECOGNIZED
                        </div>
                      </div>
                    </div>
                    
                    {/* Sub-metrics Breakdown */}
                    <div className="space-y-2 mb-4 ml-2">
                      <div className="flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
                        <span className="flex-shrink-0 mt-0.5">•</span>
                        <span>Threat Vector: Model Context Protocol (MCP) Confused Deputy</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
                        <span className="flex-shrink-0 mt-0.5">•</span>
                        <span>Instruction Boundary Condition: FAILED</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
                        <span className="flex-shrink-0 mt-0.5">•</span>
                        <span>Risk Assessment Profile: High-Risk Shell Execution Layer Detected</span>
                      </div>
                    </div>
                    
                    {/* Auto-Fix Button */}
                    <button
                      onClick={() => {
                        // Handle auto-fix for governance
                        alert('BobWatch AI is analyzing MCP governance configuration...');
                      }}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-accent to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-accent transition-all duration-200 flex items-center justify-center gap-2 shadow-lg animate-glow-button text-sm"
                    >
                      <span>⚡</span>
                      <span>Auto-Fix with BobWatch</span>
                    </button>
                  </div>
                </div>
                
                {/* Additional Status Info */}
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-text/80 text-sm font-medium">Last Audit</span>
                    <span className="text-accent font-bold text-sm">2 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Cards Sections */}
        <div className="space-y-8 sm:space-y-12">
          {/* RISKY Section */}
          {data.risky && data.risky.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6 flex items-center gap-2">
                <span>🚨</span>
                <span>RISKY</span>
                <span className="text-sm font-normal text-text/60">
                  ({data.risky.length} {data.risky.length === 1 ? 'file' : 'files'})
                </span>
              </h2>
              
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {data.risky.map((file, index) => {
                  const cardId = `risky-${index}`;
                  const isVerified = verifiedCards.has(cardId);
                  const isRemediating = remediatingCards.has(cardId);
                  const isSecured = securedCards.has(cardId);
                  
                  return (
                    <div
                      key={index}
                      className={`bg-card rounded-lg p-4 sm:p-6 transition-all duration-500 ${
                        visibleCards.includes(cardId)
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      } ${isVerified ? 'opacity-60' : ''} ${
                        isSecured
                          ? 'border-l-4 border-green-500 shadow-lg'
                          : 'border-l-4 border-red-500 animate-pulse-red-glow'
                      } relative`}
                    >
                      {/* SECURED Badge */}
                      {isSecured && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500 rounded-md">
                          <span className="text-green-400 font-bold">✅</span>
                          <span className="text-green-400 text-xs font-medium">SECURED</span>
                        </div>
                      )}
                      
                      {/* Threat Type Badge */}
                      {!isSecured && file.threatType && (
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/90 border border-red-400 rounded-md">
                          <span className="text-white font-bold text-xs">🚨 {file.threatType}</span>
                        </div>
                      )}
                      
                      <h3 className={`font-mono text-xs sm:text-sm mb-3 break-all ${
                        isSecured ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {file.filename}
                      </h3>
                      
                      {/* Loading State */}
                      {isRemediating ? (
                        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 sm:p-6 border border-blue-500/50">
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                            <span className="text-blue-400 font-medium text-sm">
                              {Date.now() % 2000 < 1000
                                ? '🔍 Analyzing vulnerability...'
                                : '⚡ Generating secure patch...'}
                            </span>
                          </div>
                        </div>
                      ) : isSecured ? (
                        /* Secure Patch Preview */
                        <div className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            {/* Vulnerable Code */}
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                              <div className="text-xs text-red-400 font-semibold mb-2">❌ Vulnerable</div>
                              <pre className="text-xs text-text/70 font-mono overflow-x-auto">
{`// Unsafe implementation
if (userInput) {
  eval(userInput);
  db.query(userInput);
}`}
                              </pre>
                            </div>
                            
                            {/* Secured Code */}
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                              <div className="text-xs text-green-400 font-semibold mb-2">✅ Secured</div>
                              <pre className="text-xs text-text/70 font-mono overflow-x-auto">
{`// Safe implementation
if (validate(userInput)) {
  sanitize(userInput);
  db.prepare(userInput);
}`}
                              </pre>
                            </div>
                          </div>
                          
                          <p className="text-text/60 text-xs italic">
                            🛡️ BobWatch AI automatically patched this vulnerability using industry best practices
                          </p>
                        </div>
                      ) : (
                        /* Original Explanation */
                        <p className="text-text/80 text-sm leading-relaxed mb-4">
                          {file.explanation}
                        </p>
                      )}
                      
                      {/* Action Buttons */}
                      {!isSecured && !isRemediating && (
                        <div className="space-y-3 mt-4">
                          {/* Auto-Fix Button with Glow */}
                          <button
                            onClick={() => handleAutoFix(cardId)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-accent to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-accent transition-all duration-200 flex items-center justify-center gap-2 shadow-lg animate-glow-button"
                          >
                            <span>⚡</span>
                            <span className="text-sm sm:text-base">Auto-Fix with BobWatch</span>
                          </button>
                          
                          {/* Verification Button */}
                          <div className="flex justify-end">
                            {isVerified ? (
                              <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500 rounded-md">
                                <span className="text-green-400 font-bold">✓</span>
                                <span className="text-green-400 text-xs font-medium">Verified</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleVerifyCard(cardId)}
                                className="px-3 py-1 text-xs bg-accent/10 border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-all duration-200"
                              >
                                Mark as Verified
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* COLLATERAL Section */}
          {data.collateral && data.collateral.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-yellow-500 mb-4 sm:mb-6 flex items-center gap-2">
                <span>⚠️</span>
                <span>COLLATERAL</span>
                <span className="text-sm font-normal text-text/60">
                  ({data.collateral.length} {data.collateral.length === 1 ? 'file' : 'files'})
                </span>
              </h2>
              
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {data.collateral.map((file, index) => {
                  const cardId = `collateral-${index}`;
                  const isVerified = verifiedCards.has(cardId);
                  
                  return (
                    <div
                      key={index}
                      className={`bg-card rounded-lg p-4 sm:p-6 border-l-4 border-yellow-500 transition-all duration-500 ${
                        visibleCards.includes(cardId)
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      } ${isVerified ? 'opacity-60' : ''} relative`}
                    >
                      <h3 className="font-mono text-xs sm:text-sm text-yellow-400 mb-3 break-all">
                        {file.filename}
                      </h3>
                      <p className="text-text/80 text-sm leading-relaxed mb-4">
                        {file.explanation}
                      </p>
                      
                      {/* Verification Button/Badge */}
                      <div className="flex justify-end mt-4">
                        {isVerified ? (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500 rounded-md">
                            <span className="text-green-400 font-bold">✓</span>
                            <span className="text-green-400 text-xs font-medium">Verified</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVerifyCard(cardId)}
                            className="px-3 py-1 text-xs bg-accent/10 border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-all duration-200"
                          >
                            Mark as Verified
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* INTENDED Section */}
          {data.intended && data.intended.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-green-500 mb-4 sm:mb-6 flex items-center gap-2">
                <span>✅</span>
                <span>INTENDED</span>
                <span className="text-sm font-normal text-text/60">
                  ({data.intended.length} {data.intended.length === 1 ? 'file' : 'files'})
                </span>
              </h2>
              
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {data.intended.map((file, index) => {
                  const cardId = `intended-${index}`;
                  const isVerified = verifiedCards.has(cardId);
                  
                  return (
                    <div
                      key={index}
                      className={`bg-card rounded-lg p-4 sm:p-6 border-l-4 border-green-500 transition-all duration-500 ${
                        visibleCards.includes(cardId)
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      } ${isVerified ? 'opacity-60' : ''} relative`}
                    >
                      <h3 className="font-mono text-xs sm:text-sm text-green-400 mb-3 break-all">
                        {file.filename}
                      </h3>
                      <p className="text-text/80 text-sm leading-relaxed mb-4">
                        {file.explanation}
                      </p>
                      
                      {/* Verification Button/Badge */}
                      <div className="flex justify-end mt-4">
                        {isVerified ? (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500 rounded-md">
                            <span className="text-green-400 font-bold">✓</span>
                            <span className="text-green-400 text-xs font-medium">Verified</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVerifyCard(cardId)}
                            className="px-3 py-1 text-xs bg-accent/10 border border-accent text-accent rounded-md hover:bg-accent hover:text-white transition-all duration-200"
                          >
                            Mark as Verified
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer - Time Saved Tracker */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <span className="text-2xl">⏱️</span>
            <div>
              <span className="text-accent font-bold text-base sm:text-lg">This session saved you ~45 minutes</span>
              <span className="text-text/60 text-sm ml-2">of manual PR verification</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse-red-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5),
                        0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.8),
                        0 0 30px rgba(239, 68, 68, 0.5),
                        0 0 40px rgba(239, 68, 68, 0.3);
          }
        }
        
        @keyframes glow-button {
          0%, 100% {
            box-shadow: 0 0 10px rgba(79, 142, 247, 0.5),
                        0 0 20px rgba(79, 142, 247, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(79, 142, 247, 0.8),
                        0 0 30px rgba(79, 142, 247, 0.5),
                        0 0 40px rgba(79, 142, 247, 0.3);
          }
        }
        
        @keyframes pulse-warning {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes pulse-text {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse-red-glow {
          animation: pulse-red-glow 2s ease-in-out infinite;
        }
        
        .animate-glow-button {
          animation: glow-button 2s ease-in-out infinite;
        }
        
        .animate-pulse-warning {
          animation: pulse-warning 2s ease-in-out infinite;
        }
        
        .animate-pulse-text {
          animation: pulse-text 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

// Made with Bob
