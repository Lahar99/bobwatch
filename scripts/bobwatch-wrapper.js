#!/usr/bin/env node

/**
 * BobWatch Real-Time IDE Middleware Wrapper
 * 
 * A futuristic security monitoring system that acts as an in-flight background
 * listener, intercepting code as it's being built and automatically remediating
 * security vulnerabilities in real-time.
 * 
 * Usage:
 *   node scripts/bobwatch-wrapper.js
 *   npm run watch
 *   npm run watch:dev
 */

const config = require('./config/wrapper-config');
const FileWatcher = require('./lib/file-watcher');
const BackupManager = require('./lib/backup-manager');
const AnalysisClient = require('./lib/analysis-client');
const RemediationEngine = require('./lib/remediation-engine');
const AuditLogger = require('./lib/audit-logger');

class BobWatchWrapper {
  constructor() {
    this.config = config;
    this.fileWatcher = null;
    this.backupManager = null;
    this.analysisClient = null;
    this.remediationEngine = null;
    this.auditLogger = null;
    this.isRunning = false;
    this.concurrentAnalysis = 0;
  }

  /**
   * Initialize all components
   */
  async initialize() {
    try {
      console.log('[BobWatch] 🔧 Initializing components...\n');

      // Initialize audit logger
      this.auditLogger = new AuditLogger(this.config);
      await this.auditLogger.initialize();

      // Initialize backup manager
      this.backupManager = new BackupManager(this.config);
      await this.backupManager.initialize();

      // Initialize analysis client
      this.analysisClient = new AnalysisClient(this.config);

      // Check if analysis endpoint is available
      const health = await this.analysisClient.getHealth();
      if (!health.available) {
        console.error('[BobWatch] ❌ Analysis endpoint not available!');
        console.error('[BobWatch] 💡 Make sure Next.js dev server is running: npm run dev');
        process.exit(1);
      }

      // Initialize remediation engine
      this.remediationEngine = new RemediationEngine(
        this.config,
        this.backupManager,
        this.auditLogger
      );

      // Initialize file watcher
      this.fileWatcher = new FileWatcher(this.config);

      console.log('[BobWatch] ✅ All components initialized\n');
    } catch (error) {
      console.error('[BobWatch] ❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Start the wrapper
   */
  async start() {
    try {
      await this.initialize();

      // Set up graceful shutdown
      this.setupShutdownHandlers();

      // Start file watcher with callback
      this.fileWatcher.start(async (filePath, fileContent) => {
        await this.handleFileChange(filePath, fileContent);
      });

      this.isRunning = true;
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to start:', error.message);
      process.exit(1);
    }
  }

  /**
   * Handle file change event
   * @param {string} filePath - Path to the changed file
   * @param {string} fileContent - Content of the file
   */
  async handleFileChange(filePath, fileContent) {
    // Check concurrent analysis limit
    if (this.concurrentAnalysis >= this.config.performance.maxConcurrentAnalysis) {
      console.log('[BobWatch] ⏳ Analysis queue full, waiting...');
      return;
    }

    this.concurrentAnalysis++;

    try {
      console.log('[BobWatch] 🔍 Analyzing for vulnerabilities...');

      // Analyze file
      const analysisResult = await this.analysisClient.analyzeFile(filePath, fileContent);

      if (analysisResult.hasVulnerabilities) {
        console.log(`[BobWatch] 🚨 THREAT DETECTED: ${analysisResult.vulnerabilities.length} vulnerability(ies) found`);

        // Remediate vulnerabilities
        const remediationResult = await this.remediationEngine.remediateFile(
          filePath,
          analysisResult.vulnerabilities
        );

        if (remediationResult.success) {
          console.log('');
        } else {
          console.error('[BobWatch] ❌ Remediation failed:', remediationResult.reason);
        }
      } else {
        console.log('[BobWatch] ✅ No vulnerabilities detected\n');
        await this.auditLogger.logClean(filePath);
      }
    } catch (error) {
      console.error('[BobWatch] ❌ Error analyzing file:', error.message);
      await this.auditLogger.logAnalysisError(filePath, error);
    } finally {
      this.concurrentAnalysis--;
    }
  }

  /**
   * Set up graceful shutdown handlers
   */
  setupShutdownHandlers() {
    const shutdown = async (signal) => {
      console.log(`\n[BobWatch] 📡 Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('[BobWatch] ❌ Uncaught exception:', error);
      this.stop().then(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[BobWatch] ❌ Unhandled rejection at:', promise, 'reason:', reason);
    });
  }

  /**
   * Stop the wrapper
   */
  async stop() {
    if (!this.isRunning) return;

    try {
      // Stop file watcher
      if (this.fileWatcher) {
        this.fileWatcher.stop();
      }

      // Print statistics
      await this.printStatistics();

      this.isRunning = false;
      console.log('[BobWatch] 👋 Goodbye!\n');
    } catch (error) {
      console.error('[BobWatch] ❌ Error during shutdown:', error.message);
    }
  }

  /**
   * Print wrapper statistics
   */
  async printStatistics() {
    try {
      console.log('\n[BobWatch] 📊 Session Statistics:');
      console.log('─────────────────────────────────');

      // Remediation stats
      const remediationStats = await this.remediationEngine.getStatistics();
      console.log(`  Vulnerabilities Remediated: ${remediationStats.totalRemediated}`);
      console.log(`  Remediation Failures: ${remediationStats.totalFailed}`);
      console.log(`  Total Backups Created: ${remediationStats.totalBackups}`);
      console.log(`  Backup Storage Used: ${remediationStats.backupSizeMB} MB`);

      // Threat type breakdown
      if (Object.keys(remediationStats.byThreatType).length > 0) {
        console.log('\n  Threats by Type:');
        for (const [threatType, count] of Object.entries(remediationStats.byThreatType)) {
          console.log(`    ${threatType}: ${count}`);
        }
      }

      console.log('─────────────────────────────────\n');
    } catch (error) {
      console.error('[BobWatch] ❌ Error printing statistics:', error.message);
    }
  }

  /**
   * Get wrapper status
   */
  getStatus() {
    return {
      running: this.isRunning,
      concurrentAnalysis: this.concurrentAnalysis,
      maxConcurrentAnalysis: this.config.performance.maxConcurrentAnalysis,
      watchedDirectories: this.config.watchDirs,
      filePatterns: this.config.filePatterns
    };
  }
}

// Main execution
if (require.main === module) {
  const wrapper = new BobWatchWrapper();
  
  // Display banner
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║              🛡️  BobWatch Security Wrapper  🛡️             ║');
  console.log('║                                                           ║');
  console.log('║         Real-Time AI-Powered Security Monitoring          ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Start wrapper
  wrapper.start().catch((error) => {
    console.error('[BobWatch] ❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = BobWatchWrapper;

// Made with Bob
