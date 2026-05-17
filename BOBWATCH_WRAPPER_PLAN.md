# BobWatch Real-Time IDE Middleware Wrapper - Implementation Plan

## 🎯 Executive Summary

This plan outlines the implementation of `bobwatch-wrapper.js`, a futuristic real-time security monitoring system that acts as an in-flight background listener. It intercepts code as it's being built, analyzes it for security vulnerabilities, and automatically remediates issues before they reach production.

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    A[File System Events] -->|fs.watch| B[File Watcher]
    B -->|Debounce 500ms| C[Event Queue]
    C -->|Filter .js/.json/.yaml| D[File Reader]
    D -->|Read Content| E[Backup Manager]
    E -->|Create .backup| F[Analysis Client]
    F -->|POST Request| G[/api/analyze-file]
    G -->|Gemini 2.5 Flash| H[Security Analysis]
    H -->|Return Results| I{Vulnerabilities?}
    I -->|Yes| J[Auto-Remediation Engine]
    I -->|No| K[Log: Clean]
    J -->|Overwrite File| L[Audit Logger]
    L -->|Append to Log| M[Console Output]
    M -->|Display Status| N[Terminal]
```

---

## 📁 Project Structure

```
bobwatch/
├── scripts/
│   ├── bobwatch-wrapper.js          # Main wrapper script
│   ├── lib/
│   │   ├── file-watcher.js          # File watching logic
│   │   ├── backup-manager.js        # Backup system
│   │   ├── analysis-client.js       # API communication
│   │   ├── remediation-engine.js    # Auto-fix logic
│   │   └── audit-logger.js          # Logging system
│   └── config/
│       └── wrapper-config.js        # Configuration
├── .bobwatch/
│   ├── backups/                     # Backup files (.backup)
│   └── audit.log                    # Remediation audit trail
├── app/
│   └── api/
│       └── analyze-file/
│           └── route.js             # New endpoint
└── package.json                     # Updated scripts
```

---

## 🔧 Component Specifications

### 1. File Watcher (`scripts/lib/file-watcher.js`)

**Purpose:** Monitor file system changes in real-time with intelligent debouncing.

**Key Features:**
- Watch directories: `app/`, `scripts/`, `.bob/`
- File patterns: `*.js`, `*.json`, `*.yaml`, `*.yml`
- Debounce: 500ms (prevents duplicate events)
- Ignore patterns: `node_modules/`, `.next/`, `.git/`, `*.backup`

**Technical Implementation:**
```javascript
const fs = require('fs');
const path = require('path');

class FileWatcher {
  constructor(config) {
    this.watchDirs = config.watchDirs;
    this.filePatterns = config.filePatterns;
    this.debounceTime = config.debounceTime || 500;
    this.watchers = [];
    this.eventQueue = new Map();
  }
  
  start(callback) {
    // Recursive fs.watch with debouncing
    // Filter by file patterns
    // Emit events to callback
  }
  
  stop() {
    // Clean up watchers
  }
}
```

---

### 2. Backup Manager (`scripts/lib/backup-manager.js`)

**Purpose:** Create timestamped backups before any file modification.

**Key Features:**
- Backup location: `.bobwatch/backups/`
- Naming convention: `{filename}.{timestamp}.backup`
- Retention: Keep last 10 backups per file
- Atomic operations: Ensure backup completes before remediation

**Technical Implementation:**
```javascript
const fs = require('fs').promises;
const path = require('path');

class BackupManager {
  constructor(backupDir) {
    this.backupDir = backupDir;
  }
  
  async createBackup(filePath) {
    const timestamp = Date.now();
    const filename = path.basename(filePath);
    const backupPath = path.join(
      this.backupDir,
      `${filename}.${timestamp}.backup`
    );
    
    await fs.copyFile(filePath, backupPath);
    await this.cleanOldBackups(filename);
    
    return backupPath;
  }
  
  async cleanOldBackups(filename) {
    // Keep only last 10 backups
  }
  
  async restore(backupPath, targetPath) {
    // Restore from backup
  }
}
```

---

### 3. Analysis Client (`scripts/lib/analysis-client.js`)

**Purpose:** Communicate with the analysis API endpoint asynchronously.

**Key Features:**
- Endpoint: `http://localhost:3000/api/analyze-file`
- Method: POST
- Timeout: 30 seconds
- Retry logic: 3 attempts with exponential backoff
- Connection pooling: Reuse HTTP connections

**Request Payload:**
```json
{
  "filePath": "app/api/auth/route.js",
  "fileContent": "const token = 'hardcoded_secret';",
  "fileType": "javascript"
}
```

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "hasVulnerabilities": true,
    "vulnerabilities": [
      {
        "threatType": "🚨 THREAT TYPE: EXPOSED SECRETS",
        "explanation": "Hardcoded token detected",
        "remediatedCode": "const token = process.env.API_TOKEN;"
      }
    ]
  }
}
```

---

### 4. Auto-Remediation Engine (`scripts/lib/remediation-engine.js`)

**Purpose:** Automatically overwrite vulnerable files with secure code.

**Key Features:**
- Atomic file writes (write to temp, then rename)
- Preserve file permissions and timestamps
- Validate remediated code syntax before writing
- Rollback capability if write fails

**Technical Implementation:**
```javascript
const fs = require('fs').promises;
const path = require('path');

class RemediationEngine {
  constructor(backupManager, auditLogger) {
    this.backupManager = backupManager;
    this.auditLogger = auditLogger;
  }
  
  async remediate(filePath, remediatedCode, vulnerability) {
    // 1. Create backup
    const backupPath = await this.backupManager.createBackup(filePath);
    
    try {
      // 2. Validate syntax (optional)
      this.validateSyntax(remediatedCode, filePath);
      
      // 3. Atomic write
      const tempPath = `${filePath}.tmp`;
      await fs.writeFile(tempPath, remediatedCode, 'utf8');
      await fs.rename(tempPath, filePath);
      
      // 4. Log success
      await this.auditLogger.log({
        timestamp: new Date().toISOString(),
        filePath,
        threatType: vulnerability.threatType,
        action: 'REMEDIATED',
        backupPath
      });
      
      return { success: true, backupPath };
    } catch (error) {
      // Rollback on failure
      await this.backupManager.restore(backupPath, filePath);
      throw error;
    }
  }
  
  validateSyntax(code, filePath) {
    // Basic syntax validation
  }
}
```

---

### 5. Audit Logger (`scripts/lib/audit-logger.js`)

**Purpose:** Maintain comprehensive audit trail of all remediation actions.

**Key Features:**
- Log file: `.bobwatch/audit.log`
- Format: JSON Lines (one JSON object per line)
- Rotation: Rotate when file exceeds 10MB
- Fields: timestamp, filePath, threatType, action, backupPath

**Log Entry Format:**
```json
{
  "timestamp": "2026-05-17T09:45:00.000Z",
  "filePath": "app/api/auth/route.js",
  "threatType": "🚨 THREAT TYPE: EXPOSED SECRETS",
  "action": "REMEDIATED",
  "backupPath": ".bobwatch/backups/route.js.1715939100000.backup",
  "explanation": "Hardcoded token replaced with environment variable"
}
```

---

### 6. New API Endpoint (`app/api/analyze-file/route.js`)

**Purpose:** Analyze individual file contents for security vulnerabilities.

**Key Features:**
- Accepts file content and metadata
- Uses Gemini 2.5 Flash for analysis
- Returns structured vulnerability data with remediated code
- Optimized prompt for single-file analysis

**Endpoint Specification:**
- **URL:** `/api/analyze-file`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**
```json
{
  "filePath": "app/api/auth/route.js",
  "fileContent": "const token = 'secret123';",
  "fileType": "javascript"
}
```

**Response Body:**
```json
{
  "status": "success",
  "data": {
    "hasVulnerabilities": true,
    "vulnerabilities": [
      {
        "threatType": "🚨 THREAT TYPE: EXPOSED SECRETS",
        "explanation": "Hardcoded authentication token detected in source code",
        "remediatedCode": "const token = process.env.API_TOKEN;"
      }
    ]
  }
}
```

**Gemini Prompt Template:**
```
You are a Senior Security Auditor analyzing a single file for vulnerabilities.

FILE PATH: {filePath}
FILE TYPE: {fileType}

FILE CONTENT:
{fileContent}

TASK: Scan for security vulnerabilities including:
- MCP Boundary Breaches (instruction/data separation failures)
- Confused Deputy / Privilege Escalation
- Exposed secrets and hardcoded credentials
- SQL/Command injection vulnerabilities
- Authentication bypasses
- Path traversal risks

For EACH vulnerability found:
1. Identify the specific threat type
2. Explain the security risk
3. Provide clean, secure remediatedCode

OUTPUT FORMAT (JSON only):
{
  "hasVulnerabilities": true/false,
  "vulnerabilities": [
    {
      "threatType": "🚨 THREAT TYPE: ...",
      "explanation": "...",
      "remediatedCode": "..."
    }
  ]
}
```

---

## 🚀 Main Wrapper Script (`scripts/bobwatch-wrapper.js`)

**Purpose:** Orchestrate all components into a cohesive real-time monitoring system.

**Key Features:**
- Runs as detached background process
- Graceful shutdown handling (SIGINT, SIGTERM)
- Health check endpoint (optional)
- Performance metrics logging

**Execution Flow:**
```
1. Initialize configuration
2. Create backup directory structure
3. Start file watcher
4. On file change event:
   a. Debounce and filter
   b. Read file content
   c. Send to analysis endpoint
   d. If vulnerabilities found:
      - Create backup
      - Apply remediation
      - Log to audit trail
      - Print console message
5. Continue monitoring until shutdown
```

**Console Output Format:**
```
[BobWatch] 🛡️ Real-Time Self-Healing Active: Patched vulnerability in app/api/auth/route.js
[BobWatch] 📋 Threat Type: 🚨 EXPOSED SECRETS
[BobWatch] 💾 Backup saved: .bobwatch/backups/route.js.1715939100000.backup
[BobWatch] ✅ File remediated successfully
```

---

## ⚙️ Configuration (`scripts/config/wrapper-config.js`)

```javascript
module.exports = {
  // Directories to watch
  watchDirs: ['app', 'scripts', '.bob'],
  
  // File patterns to monitor
  filePatterns: ['.js', '.json', '.yaml', '.yml'],
  
  // Ignore patterns
  ignorePatterns: [
    'node_modules',
    '.next',
    '.git',
    '*.backup',
    'bob_sessions'
  ],
  
  // Debounce time (ms)
  debounceTime: 500,
  
  // Analysis endpoint
  analysisEndpoint: 'http://localhost:3000/api/analyze-file',
  
  // Backup settings
  backup: {
    enabled: true,
    directory: '.bobwatch/backups',
    maxBackupsPerFile: 10
  },
  
  // Audit logging
  audit: {
    enabled: true,
    logFile: '.bobwatch/audit.log',
    maxLogSize: 10 * 1024 * 1024 // 10MB
  },
  
  // Auto-remediation
  remediation: {
    enabled: true,
    requireConfirmation: false, // Set to true for manual approval
    criticalThreatsOnly: false  // Set to true to only fix CRITICAL threats
  },
  
  // Performance
  maxConcurrentAnalysis: 3,
  requestTimeout: 30000 // 30 seconds
};
```

---

## 📦 Package.json Updates

Add new scripts for running the wrapper:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "watch": "node scripts/bobwatch-wrapper.js",
    "watch:dev": "concurrently \"npm run dev\" \"npm run watch\"",
    "watch:stop": "pkill -f bobwatch-wrapper"
  }
}
```

**Note:** May need to install `concurrently` for parallel execution:
```bash
npm install --save-dev concurrently
```

---

## 🔒 Security Considerations

### 1. File System Access
- Wrapper runs with same permissions as user
- No privilege escalation required
- Respects file system permissions

### 2. Network Security
- Only communicates with localhost
- No external network calls
- API endpoint requires local server running

### 3. Code Injection Prevention
- Validates remediated code syntax before writing
- Creates backups before any modification
- Atomic file operations prevent corruption

### 4. Resource Management
- Debouncing prevents event flooding
- Connection pooling reduces overhead
- Configurable concurrency limits

---

## 📊 Performance Metrics

**Expected Performance:**
- File change detection: < 100ms
- Analysis request: 1-3 seconds (Gemini API)
- Backup creation: < 50ms
- File remediation: < 100ms
- Total end-to-end: 1.5-3.5 seconds

**Resource Usage:**
- Memory: ~50-100MB (Node.js process)
- CPU: < 5% idle, 10-20% during analysis
- Disk I/O: Minimal (only on file changes)

---

## 🧪 Testing Strategy

### Unit Tests
- File watcher event handling
- Backup creation and restoration
- Remediation engine logic
- Audit logger formatting

### Integration Tests
- End-to-end file change → remediation flow
- API endpoint communication
- Error handling and rollback
- Concurrent file changes

### Test Files
Create sample vulnerable files in `scripts/test-files/`:
- `exposed-secret.js` - Hardcoded credentials
- `sql-injection.js` - Unsafe database queries
- `mcp-boundary-breach.js` - Instruction/data mixing
- `auth-bypass.js` - Authentication vulnerabilities

---

## 📝 Usage Documentation

### Starting the Wrapper

**Option 1: Standalone**
```bash
npm run watch
```

**Option 2: With Development Server**
```bash
npm run watch:dev
```

**Option 3: Background Process**
```bash
nohup npm run watch > .bobwatch/wrapper.log 2>&1 &
```

### Stopping the Wrapper

```bash
npm run watch:stop
# or
Ctrl+C (if running in foreground)
```

### Viewing Audit Logs

```bash
cat .bobwatch/audit.log | jq '.'
```

### Restoring from Backup

```bash
cp .bobwatch/backups/route.js.1715939100000.backup app/api/auth/route.js
```

---

## 🎯 Success Criteria

✅ **Functional Requirements:**
- [ ] Monitors file changes in real-time
- [ ] Detects security vulnerabilities accurately
- [ ] Creates backups before remediation
- [ ] Automatically overwrites vulnerable files
- [ ] Logs all actions to audit trail
- [ ] Displays branded console messages
- [ ] Runs asynchronously without blocking

✅ **Non-Functional Requirements:**
- [ ] < 3 second end-to-end latency
- [ ] < 100MB memory footprint
- [ ] Handles 10+ concurrent file changes
- [ ] Graceful error handling and recovery
- [ ] Zero data loss (backups always created)

---

## 🚧 Implementation Phases

### Phase 1: Core Infrastructure (Tasks 1-3)
- Create directory structure
- Implement file watcher with debouncing
- Build backup system

### Phase 2: API Integration (Tasks 4-5)
- Create `/api/analyze-file` endpoint
- Implement analysis client with retry logic

### Phase 3: Remediation Engine (Tasks 6-8)
- Build auto-remediation logic
- Add audit logging
- Implement console output

### Phase 4: Resilience & Testing (Tasks 9-11)
- Add error handling
- Create npm scripts
- Test with vulnerable files

### Phase 5: Documentation (Task 12)
- Write usage guide
- Document configuration options
- Create troubleshooting guide

---

## 🔮 Future Enhancements

1. **VS Code Extension Integration**
   - Real-time vulnerability highlighting
   - Inline remediation suggestions
   - Status bar indicator

2. **Machine Learning Model**
   - Local vulnerability detection (no API calls)
   - Faster response times
   - Offline capability

3. **Team Collaboration**
   - Shared audit logs
   - Centralized backup storage
   - Team-wide security policies

4. **Advanced Analytics**
   - Vulnerability trends dashboard
   - Developer security scores
   - Compliance reporting

---

## 📚 References

- [Node.js fs.watch Documentation](https://nodejs.org/api/fs.html#fswatchfilename-options-listener)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [MCP Security Best Practices](./SECURITY.md)
- [BobWatch Architecture](./IMPLEMENTATION_PLAN.md)

---

**Plan Created:** May 17, 2026  
**Version:** 1.0.0  
**Status:** Ready for Implementation