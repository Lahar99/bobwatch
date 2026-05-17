/**
 * Remediation Engine
 * 
 * Automatically remediates security vulnerabilities by overwriting
 * files with secure code. Implements atomic writes and rollback capability.
 */

const fs = require('fs').promises;
const path = require('path');

class RemediationEngine {
  constructor(config, backupManager, auditLogger) {
    this.config = config;
    this.backupManager = backupManager;
    this.auditLogger = auditLogger;
    this.enabled = config.remediation.enabled;
    this.validateSyntax = config.remediation.validateSyntax;
    this.atomicWrites = config.remediation.atomicWrites;
  }

  /**
   * Remediate vulnerabilities in a file
   * @param {string} filePath - Path to the file
   * @param {Array} vulnerabilities - Array of vulnerability objects
   * @returns {Object} Remediation result
   */
  async remediateFile(filePath, vulnerabilities) {
    if (!this.enabled) {
      return { success: false, reason: 'Remediation disabled' };
    }

    if (!vulnerabilities || vulnerabilities.length === 0) {
      return { success: false, reason: 'No vulnerabilities to remediate' };
    }

    const results = [];
    let backupPath = null;

    try {
      // Create backup before any modifications
      if (this.config.backup.createBeforeRemediation) {
        backupPath = await this.backupManager.createBackup(filePath);
        console.log(`[BobWatch] 💾 Backup created: ${path.basename(backupPath)}`);
      }

      // Process each vulnerability
      for (const vulnerability of vulnerabilities) {
        try {
          const result = await this.remediateVulnerability(
            filePath,
            vulnerability,
            backupPath
          );
          results.push(result);

          if (result.success) {
            console.log(`[BobWatch] 🛡️ Real-Time Self-Healing Active: Patched vulnerability in ${path.basename(filePath)}`);
            console.log(`[BobWatch] 📋 Threat Type: ${vulnerability.threatType}`);
            if (backupPath) {
              console.log(`[BobWatch] 💾 Backup saved: ${path.basename(backupPath)}`);
            }
            console.log(`[BobWatch] ✅ File remediated successfully`);
          }
        } catch (error) {
          console.error(`[BobWatch] ❌ Failed to remediate vulnerability: ${error.message}`);
          results.push({
            success: false,
            vulnerability,
            error: error.message
          });
        }
      }

      return {
        success: results.some(r => r.success),
        results,
        backupPath
      };
    } catch (error) {
      console.error(`[BobWatch] ❌ Remediation failed: ${error.message}`);
      
      // Attempt rollback if backup exists
      if (backupPath) {
        try {
          await this.backupManager.restore(backupPath, filePath);
          console.log(`[BobWatch] ↩️ Rolled back to backup`);
        } catch (rollbackError) {
          console.error(`[BobWatch] ❌ Rollback failed: ${rollbackError.message}`);
        }
      }

      throw error;
    }
  }

  /**
   * Remediate a single vulnerability
   * @param {string} filePath - Path to the file
   * @param {Object} vulnerability - Vulnerability object
   * @param {string} backupPath - Path to backup file
   * @returns {Object} Result object
   */
  async remediateVulnerability(filePath, vulnerability, backupPath) {
    try {
      const { remediatedCode, threatType, explanation } = vulnerability;

      if (!remediatedCode || typeof remediatedCode !== 'string') {
        throw new Error('Invalid remediated code');
      }

      // Validate syntax if enabled
      if (this.validateSyntax) {
        this.performBasicValidation(remediatedCode, filePath);
      }

      // Write remediated code to file
      if (this.atomicWrites) {
        await this.atomicWrite(filePath, remediatedCode);
      } else {
        await fs.writeFile(filePath, remediatedCode, 'utf8');
      }

      // Log successful remediation
      await this.auditLogger.logRemediation(filePath, vulnerability, backupPath);

      return {
        success: true,
        vulnerability,
        filePath
      };
    } catch (error) {
      // Log failed remediation
      await this.auditLogger.logFailure(filePath, vulnerability, error);
      throw error;
    }
  }

  /**
   * Perform atomic file write (write to temp, then rename)
   * @param {string} filePath - Target file path
   * @param {string} content - Content to write
   */
  async atomicWrite(filePath, content) {
    const tempPath = `${filePath}.tmp.${Date.now()}`;

    try {
      // Write to temporary file
      await fs.writeFile(tempPath, content, 'utf8');

      // Atomic rename
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Perform basic validation on remediated code
   * @param {string} code - Code to validate
   * @param {string} filePath - File path for context
   */
  performBasicValidation(code, filePath) {
    // Check for empty or whitespace-only code
    if (!code.trim()) {
      throw new Error('Remediated code is empty');
    }

    // Check for placeholder comments
    const placeholders = [
      '// rest of code',
      '// ... rest of code',
      '// TODO',
      '// FIXME',
      '/* ... */',
      '...'
    ];

    for (const placeholder of placeholders) {
      if (code.includes(placeholder)) {
        throw new Error(`Remediated code contains placeholder: ${placeholder}`);
      }
    }

    // Basic syntax check for JavaScript/TypeScript files
    const ext = path.extname(filePath).toLowerCase();
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      this.validateJavaScriptSyntax(code);
    }

    // Basic syntax check for JSON files
    if (ext === '.json') {
      try {
        JSON.parse(code);
      } catch (error) {
        throw new Error(`Invalid JSON syntax: ${error.message}`);
      }
    }
  }

  /**
   * Validate JavaScript syntax (basic checks)
   * @param {string} code - JavaScript code
   */
  validateJavaScriptSyntax(code) {
    // Check for balanced braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      throw new Error('Unbalanced braces in JavaScript code');
    }

    // Check for balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      throw new Error('Unbalanced parentheses in JavaScript code');
    }

    // Check for balanced brackets
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    
    if (openBrackets !== closeBrackets) {
      throw new Error('Unbalanced brackets in JavaScript code');
    }

    // Try to parse as JavaScript (will throw on syntax errors)
    try {
      new Function(code);
    } catch (error) {
      // Only throw if it's a clear syntax error
      if (error instanceof SyntaxError) {
        throw new Error(`JavaScript syntax error: ${error.message}`);
      }
    }
  }

  /**
   * Check if a file should be remediated based on threat type
   * @param {Object} vulnerability - Vulnerability object
   * @returns {boolean} True if should remediate
   */
  shouldRemediate(vulnerability) {
    if (!this.enabled) {
      return false;
    }

    // If criticalThreatsOnly is enabled, only remediate CRITICAL threats
    if (this.config.remediation.criticalThreatsOnly) {
      const criticalKeywords = ['CRITICAL', 'EXPOSED SECRETS', 'AUTH BYPASS', 'SQL INJECTION'];
      return criticalKeywords.some(keyword => 
        vulnerability.threatType.toUpperCase().includes(keyword)
      );
    }

    return true;
  }

  /**
   * Get remediation statistics
   */
  async getStatistics() {
    const auditStats = await this.auditLogger.getStatistics();
    const backupStats = await this.backupManager.getStatistics();

    return {
      enabled: this.enabled,
      totalRemediated: auditStats.remediated,
      totalFailed: auditStats.failed,
      totalBackups: backupStats.totalBackups,
      backupSizeMB: backupStats.totalSizeMB,
      byThreatType: auditStats.byThreatType
    };
  }
}

module.exports = RemediationEngine;

// Made with Bob
