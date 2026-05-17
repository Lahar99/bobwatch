/**
 * Analysis Client
 * 
 * Communicates with the /api/analyze-file endpoint to perform
 * security analysis on file contents.
 */

const path = require('path');

class AnalysisClient {
  constructor(config) {
    this.endpoint = config.analysis.endpoint;
    this.timeout = config.analysis.timeout;
    this.retries = config.analysis.retries;
    this.retryDelay = config.analysis.retryDelay;
  }

  /**
   * Analyze a file for security vulnerabilities
   * @param {string} filePath - Path to the file
   * @param {string} fileContent - Content of the file
   * @returns {Object} Analysis result
   */
  async analyzeFile(filePath, fileContent) {
    const fileType = this.detectFileType(filePath);
    
    const payload = {
      filePath,
      fileContent,
      fileType
    };

    // Retry logic with exponential backoff
    let lastError;
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const result = await this.makeRequest(payload, attempt);
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[BobWatch] ⚠️ Analysis attempt ${attempt} failed, retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(`Analysis failed after ${this.retries} attempts: ${lastError.message}`);
  }

  /**
   * Make HTTP request to analysis endpoint
   * @param {Object} payload - Request payload
   * @param {number} attempt - Current attempt number
   * @returns {Object} Analysis result
   */
  async makeRequest(payload, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // Validate response structure
      if (result.status !== 'success') {
        throw new Error(result.message || 'Analysis failed');
      }

      if (!result.data || typeof result.data.hasVulnerabilities !== 'boolean') {
        throw new Error('Invalid response format from analysis endpoint');
      }

      return result.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Detect file type from extension
   * @param {string} filePath - Path to the file
   * @returns {string} File type
   */
  detectFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    const typeMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.py': 'python',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php'
    };

    return typeMap[ext] || 'text';
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if the analysis endpoint is available
   * @returns {boolean} True if endpoint is reachable
   */
  async checkEndpoint() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.endpoint.replace('/analyze-file', '/analyze'), {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get endpoint health status
   */
  async getHealth() {
    try {
      const isAvailable = await this.checkEndpoint();
      return {
        available: isAvailable,
        endpoint: this.endpoint,
        timeout: this.timeout,
        retries: this.retries
      };
    } catch (error) {
      return {
        available: false,
        endpoint: this.endpoint,
        error: error.message
      };
    }
  }
}

module.exports = AnalysisClient;

// Made with Bob
