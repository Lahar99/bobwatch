/**
 * BobWatch Wrapper Configuration
 * 
 * This file contains all configuration options for the real-time security wrapper.
 * Modify these settings to customize the wrapper's behavior.
 */

module.exports = {
  // Directories to watch (relative to workspace root)
  watchDirs: ['app', 'scripts', '.bob'],
  
  // File patterns to monitor (extensions)
  filePatterns: ['.js', '.json', '.yaml', '.yml'],
  
  // Patterns to ignore (glob patterns)
  ignorePatterns: [
    'node_modules',
    '.next',
    '.git',
    '*.backup',
    'bob_sessions',
    '*.log',
    '.bobwatch'
  ],
  
  // Debounce time in milliseconds (prevents duplicate events)
  debounceTime: 500,
  
  // Analysis endpoint configuration
  analysis: {
    endpoint: 'http://localhost:3000/api/analyze-file',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000 // 1 second
  },
  
  // Backup configuration
  backup: {
    enabled: true,
    directory: '.bobwatch/backups',
    maxBackupsPerFile: 10,
    createBeforeRemediation: true
  },
  
  // Audit logging configuration
  audit: {
    enabled: true,
    logFile: '.bobwatch/audit.log',
    maxLogSize: 10 * 1024 * 1024, // 10MB
    rotateOnSize: true,
    maxRotatedLogs: 5
  },
  
  // Auto-remediation configuration
  remediation: {
    enabled: true,
    requireConfirmation: false, // Set to true for manual approval
    criticalThreatsOnly: false, // Set to true to only fix CRITICAL threats
    validateSyntax: true, // Validate code before writing
    atomicWrites: true // Use atomic file operations
  },
  
  // Performance configuration
  performance: {
    maxConcurrentAnalysis: 3, // Max concurrent API requests
    enableCaching: false, // Cache analysis results (future feature)
    cacheTTL: 60000 // Cache time-to-live in ms
  },
  
  // Console output configuration
  console: {
    enabled: true,
    verbose: false, // Set to true for detailed logging
    colors: true, // Use colored output
    timestamps: true // Include timestamps in logs
  }
};

// Made with Bob
