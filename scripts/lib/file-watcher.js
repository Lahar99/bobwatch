/**
 * File Watcher
 * 
 * Monitors file system changes in real-time with intelligent debouncing
 * to prevent duplicate events and reduce analysis overhead.
 */

const fs = require('fs');
const path = require('path');

class FileWatcher {
  constructor(config) {
    this.watchDirs = config.watchDirs;
    this.filePatterns = config.filePatterns;
    this.ignorePatterns = config.ignorePatterns;
    this.debounceTime = config.debounceTime;
    this.watchers = [];
    this.eventQueue = new Map(); // Map of filePath -> timeout
    this.callback = null;
  }

  /**
   * Start watching directories
   * @param {Function} callback - Function to call when file changes
   */
  start(callback) {
    this.callback = callback;

    console.log('[BobWatch] 🚀 Real-Time Security Wrapper Started');
    console.log(`[BobWatch] 📁 Watching: ${this.watchDirs.join(', ')}`);
    console.log(`[BobWatch] 🔍 Monitoring: ${this.filePatterns.join(', ')}`);
    console.log('[BobWatch] ✅ Ready for real-time protection\n');

    // Watch each directory
    for (const dir of this.watchDirs) {
      try {
        this.watchDirectory(dir);
      } catch (error) {
        console.error(`[BobWatch] ❌ Failed to watch directory ${dir}:`, error.message);
      }
    }
  }

  /**
   * Watch a directory recursively
   * @param {string} dir - Directory to watch
   */
  watchDirectory(dir) {
    try {
      // Check if directory exists
      if (!fs.existsSync(dir)) {
        console.warn(`[BobWatch] ⚠️ Directory not found: ${dir}`);
        return;
      }

      // Watch directory recursively
      const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        const filePath = path.join(dir, filename);
        this.handleFileEvent(eventType, filePath);
      });

      this.watchers.push({ dir, watcher });
    } catch (error) {
      console.error(`[BobWatch] ❌ Error watching ${dir}:`, error.message);
    }
  }

  /**
   * Handle file system event
   * @param {string} eventType - Type of event (change, rename)
   * @param {string} filePath - Path to the file
   */
  handleFileEvent(eventType, filePath) {
    // Ignore if file doesn't match patterns
    if (!this.shouldProcess(filePath)) {
      return;
    }

    // Debounce: Clear existing timeout for this file
    if (this.eventQueue.has(filePath)) {
      clearTimeout(this.eventQueue.get(filePath));
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      this.eventQueue.delete(filePath);
      this.processFile(filePath);
    }, this.debounceTime);

    this.eventQueue.set(filePath, timeoutId);
  }

  /**
   * Check if a file should be processed
   * @param {string} filePath - Path to the file
   * @returns {boolean} True if should process
   */
  shouldProcess(filePath) {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Check ignore patterns
    for (const pattern of this.ignorePatterns) {
      if (normalizedPath.includes(pattern)) {
        return false;
      }
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!this.filePatterns.includes(ext)) {
      return false;
    }

    // Check if file exists (might have been deleted)
    try {
      fs.accessSync(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Process a file change
   * @param {string} filePath - Path to the file
   */
  async processFile(filePath) {
    try {
      // Read file content
      const content = await fs.promises.readFile(filePath, 'utf8');

      // Call callback with file info
      if (this.callback) {
        console.log(`[BobWatch] 📝 File changed: ${path.basename(filePath)}`);
        await this.callback(filePath, content);
      }
    } catch (error) {
      console.error(`[BobWatch] ❌ Error processing file ${filePath}:`, error.message);
    }
  }

  /**
   * Stop watching all directories
   */
  stop() {
    console.log('\n[BobWatch] 🛑 Stopping file watcher...');

    // Clear all pending timeouts
    for (const timeoutId of this.eventQueue.values()) {
      clearTimeout(timeoutId);
    }
    this.eventQueue.clear();

    // Close all watchers
    for (const { dir, watcher } of this.watchers) {
      try {
        watcher.close();
      } catch (error) {
        console.error(`[BobWatch] ❌ Error closing watcher for ${dir}:`, error.message);
      }
    }

    this.watchers = [];
    console.log('[BobWatch] ✅ File watcher stopped');
  }

  /**
   * Get watcher statistics
   */
  getStatistics() {
    return {
      watchedDirectories: this.watchers.length,
      pendingEvents: this.eventQueue.size,
      filePatterns: this.filePatterns,
      ignorePatterns: this.ignorePatterns,
      debounceTime: this.debounceTime
    };
  }

  /**
   * Check if a specific directory is being watched
   * @param {string} dir - Directory to check
   * @returns {boolean} True if being watched
   */
  isWatching(dir) {
    return this.watchers.some(w => w.dir === dir);
  }

  /**
   * Add a directory to watch
   * @param {string} dir - Directory to watch
   */
  addDirectory(dir) {
    if (!this.isWatching(dir)) {
      this.watchDirectory(dir);
      console.log(`[BobWatch] ➕ Added directory: ${dir}`);
    }
  }

  /**
   * Remove a directory from watching
   * @param {string} dir - Directory to stop watching
   */
  removeDirectory(dir) {
    const index = this.watchers.findIndex(w => w.dir === dir);
    if (index !== -1) {
      const { watcher } = this.watchers[index];
      watcher.close();
      this.watchers.splice(index, 1);
      console.log(`[BobWatch] ➖ Removed directory: ${dir}`);
    }
  }
}

module.exports = FileWatcher;

// Made with Bob
