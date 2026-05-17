/**
 * Backup Manager
 * 
 * Creates and manages timestamped backups of files before remediation.
 * Implements retention policy to keep only the last N backups per file.
 */

const fs = require('fs').promises;
const path = require('path');

class BackupManager {
  constructor(config) {
    this.backupDir = config.backup.directory;
    this.maxBackupsPerFile = config.backup.maxBackupsPerFile;
    this.enabled = config.backup.enabled;
  }

  /**
   * Initialize the backup manager
   * Creates backup directory if it doesn't exist
   */
  async initialize() {
    if (!this.enabled) return;

    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to initialize backup directory:', error.message);
      throw error;
    }
  }

  /**
   * Create a backup of a file
   * @param {string} filePath - Path to the file to backup
   * @returns {string} Path to the backup file
   */
  async createBackup(filePath) {
    if (!this.enabled) {
      return null;
    }

    try {
      // Generate timestamp-based backup filename
      const timestamp = Date.now();
      const filename = path.basename(filePath);
      const backupFilename = `${filename}.${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupFilename);

      // Copy file to backup location
      await fs.copyFile(filePath, backupPath);

      // Clean up old backups for this file
      await this.cleanOldBackups(filename);

      return backupPath;
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to create backup:', error.message);
      throw error;
    }
  }

  /**
   * Clean up old backups, keeping only the last N backups per file
   * @param {string} filename - Original filename (without timestamp)
   */
  async cleanOldBackups(filename) {
    try {
      // Get all backup files for this filename
      const files = await fs.readdir(this.backupDir);
      
      // Filter backups for this specific file
      const backups = files
        .filter(f => f.startsWith(filename + '.') && f.endsWith('.backup'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          // Extract timestamp from filename
          timestamp: parseInt(f.split('.').slice(-2, -1)[0])
        }))
        .filter(b => !isNaN(b.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp); // Sort newest first

      // Delete old backups beyond the retention limit
      if (backups.length > this.maxBackupsPerFile) {
        const toDelete = backups.slice(this.maxBackupsPerFile);
        
        for (const backup of toDelete) {
          try {
            await fs.unlink(backup.path);
          } catch (error) {
            // Ignore errors when deleting old backups
          }
        }
      }
    } catch (error) {
      // Don't throw on cleanup errors
      console.warn('[BobWatch] ⚠️ Failed to clean old backups:', error.message);
    }
  }

  /**
   * Restore a file from backup
   * @param {string} backupPath - Path to the backup file
   * @param {string} targetPath - Path where to restore the file
   */
  async restore(backupPath, targetPath) {
    try {
      await fs.copyFile(backupPath, targetPath);
      return true;
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to restore from backup:', error.message);
      throw error;
    }
  }

  /**
   * List all backups for a specific file
   * @param {string} filename - Original filename
   * @returns {Array} Array of backup info objects
   */
  async listBackups(filename) {
    try {
      const files = await fs.readdir(this.backupDir);
      
      const backups = files
        .filter(f => f.startsWith(filename + '.') && f.endsWith('.backup'))
        .map(f => {
          const timestamp = parseInt(f.split('.').slice(-2, -1)[0]);
          return {
            filename: f,
            path: path.join(this.backupDir, f),
            timestamp,
            date: new Date(timestamp)
          };
        })
        .filter(b => !isNaN(b.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp);

      return backups;
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to list backups:', error.message);
      return [];
    }
  }

  /**
   * Get the most recent backup for a file
   * @param {string} filename - Original filename
   * @returns {Object|null} Backup info object or null
   */
  async getLatestBackup(filename) {
    const backups = await this.listBackups(filename);
    return backups.length > 0 ? backups[0] : null;
  }

  /**
   * Delete all backups for a specific file
   * @param {string} filename - Original filename
   */
  async deleteAllBackups(filename) {
    try {
      const backups = await this.listBackups(filename);
      
      for (const backup of backups) {
        try {
          await fs.unlink(backup.path);
        } catch (error) {
          // Continue even if some deletions fail
        }
      }
      
      return backups.length;
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to delete backups:', error.message);
      return 0;
    }
  }

  /**
   * Get total size of all backups
   * @returns {number} Total size in bytes
   */
  async getTotalSize() {
    try {
      const files = await fs.readdir(this.backupDir);
      let totalSize = 0;

      for (const file of files) {
        if (file.endsWith('.backup')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to calculate backup size:', error.message);
      return 0;
    }
  }

  /**
   * Get backup statistics
   */
  async getStatistics() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(f => f.endsWith('.backup'));
      const totalSize = await this.getTotalSize();

      // Group by original filename
      const byFile = {};
      backupFiles.forEach(f => {
        const parts = f.split('.');
        const originalName = parts.slice(0, -2).join('.');
        byFile[originalName] = (byFile[originalName] || 0) + 1;
      });

      return {
        totalBackups: backupFiles.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        uniqueFiles: Object.keys(byFile).length,
        byFile
      };
    } catch (error) {
      console.error('[BobWatch] ❌ Failed to get backup statistics:', error.message);
      return {
        totalBackups: 0,
        totalSize: 0,
        totalSizeMB: '0.00',
        uniqueFiles: 0,
        byFile: {}
      };
    }
  }
}

module.exports = BackupManager;

// Made with Bob
