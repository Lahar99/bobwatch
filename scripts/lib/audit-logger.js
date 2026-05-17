/**
 * Audit Logger
 * 
 * Maintains a comprehensive audit trail of all remediation actions
 * using JSON Lines format (newline-delimited JSON).
 */

const fs = require('fs').promises;
const path = require('path');

class AuditLogger {
  constructor(config) {
    this.logFile = config.audit.logFile;
    this.maxLogSize = config.audit.maxLogSize;
    this.rotateOnSize = config.audit.rotateOnSize;
    this.maxRotatedLogs = config.audit.maxRotatedLogs;
    this.enabled = config.audit.enabled;
  }

  /**
   * Initialize the audit logger
   * Creates log directory if it doesn't exist
   */
  async initialize() {
    if (!this.enabled) return;

    try {
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });
      
      // Create log file if it doesn't exist
      try {
        await fs.access(this.logFile);
      } catch {
        await fs.writeFile(this.logFile, '', 'utf8');
      }
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to initialize audit logger:', error.message);
    }
  }

  /**
   * Log a remediation action
   * @param {Object} entry - Log entry object
   */
  async log(entry) {
    if (!this.enabled) return;

    try {
      // Add timestamp if not present
      if (!entry.timestamp) {
        entry.timestamp = new Date().toISOString();
      }

      // Convert to JSON Lines format (single line JSON + newline)
      const logLine = JSON.stringify(entry) + '\n';

      // Append to log file
      await fs.appendFile(this.logFile, logLine, 'utf8');

      // Check if rotation is needed
      if (this.rotateOnSize) {
        await this.checkAndRotate();
      }
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to write audit log:', error.message);
    }
  }

  /**
   * Log a successful remediation
   */
  async logRemediation(filePath, vulnerability, backupPath) {
    await this.log({
      timestamp: new Date().toISOString(),
      action: 'REMEDIATED',
      filePath,
      threatType: vulnerability.threatType,
      explanation: vulnerability.explanation,
      backupPath
    });
  }

  /**
   * Log a failed remediation
   */
  async logFailure(filePath, vulnerability, error) {
    await this.log({
      timestamp: new Date().toISOString(),
      action: 'FAILED',
      filePath,
      threatType: vulnerability.threatType,
      error: error.message
    });
  }

  /**
   * Log a clean file (no vulnerabilities)
   */
  async logClean(filePath) {
    await this.log({
      timestamp: new Date().toISOString(),
      action: 'CLEAN',
      filePath
    });
  }

  /**
   * Log an analysis error
   */
  async logAnalysisError(filePath, error) {
    await this.log({
      timestamp: new Date().toISOString(),
      action: 'ANALYSIS_ERROR',
      filePath,
      error: error.message
    });
  }

  /**
   * Check log file size and rotate if needed
   */
  async checkAndRotate() {
    try {
      const stats = await fs.stat(this.logFile);
      
      if (stats.size >= this.maxLogSize) {
        await this.rotateLogs();
      }
    } catch (error) {
      // Ignore errors (file might not exist yet)
    }
  }

  /**
   * Rotate log files
   * audit.log -> audit.log.1 -> audit.log.2 -> ... -> audit.log.N
   */
  async rotateLogs() {
    try {
      // Shift existing rotated logs
      for (let i = this.maxRotatedLogs - 1; i >= 1; i--) {
        const oldPath = `${this.logFile}.${i}`;
        const newPath = `${this.logFile}.${i + 1}`;
        
        try {
          await fs.access(oldPath);
          if (i === this.maxRotatedLogs - 1) {
            // Delete oldest log
            await fs.unlink(oldPath);
          } else {
            // Rename to next number
            await fs.rename(oldPath, newPath);
          }
        } catch {
          // File doesn't exist, skip
        }
      }

      // Rotate current log to .1
      await fs.rename(this.logFile, `${this.logFile}.1`);
      
      // Create new empty log file
      await fs.writeFile(this.logFile, '', 'utf8');
      
      console.log('[BobWatch] 📋 Audit log rotated');
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to rotate logs:', error.message);
    }
  }

  /**
   * Read all log entries
   * @returns {Array} Array of log entry objects
   */
  async readLogs() {
    if (!this.enabled) return [];

    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      
      return lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(entry => entry !== null);
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to read audit logs:', error.message);
      return [];
    }
  }

  /**
   * Get statistics from audit logs
   */
  async getStatistics() {
    const logs = await this.readLogs();
    
    const stats = {
      total: logs.length,
      remediated: 0,
      failed: 0,
      clean: 0,
      errors: 0,
      byThreatType: {}
    };

    logs.forEach(entry => {
      switch (entry.action) {
        case 'REMEDIATED':
          stats.remediated++;
          if (entry.threatType) {
            stats.byThreatType[entry.threatType] = 
              (stats.byThreatType[entry.threatType] || 0) + 1;
          }
          break;
        case 'FAILED':
          stats.failed++;
          break;
        case 'CLEAN':
          stats.clean++;
          break;
        case 'ANALYSIS_ERROR':
          stats.errors++;
          break;
      }
    });

    return stats;
  }
}

module.exports = AuditLogger;

// Made with Bob
