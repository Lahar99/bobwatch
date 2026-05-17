# BobWatch Wrapper - Installation & Testing Guide

## ✅ Implementation Complete

The BobWatch Real-Time IDE Middleware Wrapper has been successfully implemented with all planned features.

---

## 📦 What Was Created

### Core Components (1,150+ lines of code)

1. **Configuration System**
   - `scripts/config/wrapper-config.js` (72 lines)

2. **Library Modules**
   - `scripts/lib/audit-logger.js` (233 lines) - JSON Lines audit logging
   - `scripts/lib/backup-manager.js` (227 lines) - Timestamped backup system
   - `scripts/lib/analysis-client.js` (177 lines) - API communication with retry logic
   - `scripts/lib/remediation-engine.js` (273 lines) - Atomic file remediation
   - `scripts/lib/file-watcher.js` (217 lines) - Debounced file monitoring

3. **Main Wrapper**
   - `scripts/bobwatch-wrapper.js` (243 lines) - Orchestration and lifecycle management

4. **API Endpoint**
   - `app/api/analyze-file/route.js` (234 lines) - Single-file security analysis

5. **Documentation**
   - `BOBWATCH_WRAPPER_PLAN.md` (673 lines) - Complete implementation plan
   - `BOBWATCH_WRAPPER_QUICKSTART.md` (346 lines) - User guide
   - `API_ANALYZE_FILE_SPEC.md` (449 lines) - API specification
   - `WRAPPER_IMPLEMENTATION_SUMMARY.md` (346 lines) - Executive summary
   - `scripts/README.md` (159 lines) - Scripts documentation
   - `.bobwatch/README.md` (95 lines) - Backup/audit documentation

6. **Test Files**
   - `scripts/test-files/vulnerable-example.js` (58 lines) - Test vulnerabilities

7. **Configuration Updates**
   - `package.json` - Added npm scripts
   - `.gitignore` - Excluded wrapper files
   - `AGENTS.md` - Added implementation notes

---

## 🚀 Installation Steps

### Step 1: Verify Files

Check that all files were created:

```bash
# Core files
ls scripts/bobwatch-wrapper.js
ls scripts/config/wrapper-config.js
ls scripts/lib/*.js
ls app/api/analyze-file/route.js

# Documentation
ls BOBWATCH_WRAPPER_*.md
ls API_ANALYZE_FILE_SPEC.md
```

### Step 2: Install Dependencies (if needed)

The wrapper uses only built-in Node.js modules and existing project dependencies. However, for the `watch:dev` script, you may want to install `concurrently`:

```bash
npm install --save-dev concurrently
```

**Note:** This is optional. You can run the wrapper and dev server in separate terminals without `concurrently`.

### Step 3: Verify Environment

Ensure your `.env.local` file has the Gemini API key:

```bash
# Check if API key is configured
cat .env.local | grep GEMINI_API_KEY
```

If not configured:

```bash
echo "GEMINI_API_KEY=your_api_key_here" >> .env.local
```

---

## 🧪 Testing the Wrapper

### Test 1: Basic Functionality

1. **Start the Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **In a new terminal, start the wrapper:**
   ```bash
   npm run watch
   ```

3. **Expected output:**
   ```
   ╔═══════════════════════════════════════════════════════════╗
   ║                                                           ║
   ║              🛡️  BobWatch Security Wrapper  🛡️             ║
   ║                                                           ║
   ║         Real-Time AI-Powered Security Monitoring          ║
   ║                                                           ║
   ╚═══════════════════════════════════════════════════════════╝

   [BobWatch] 🔧 Initializing components...
   [BobWatch] ✅ All components initialized
   [BobWatch] 🚀 Real-Time Security Wrapper Started
   [BobWatch] 📁 Watching: app, scripts, .bob
   [BobWatch] 🔍 Monitoring: .js, .json, .yaml, .yml
   [BobWatch] ✅ Ready for real-time protection
   ```

### Test 2: Vulnerability Detection

1. **With the wrapper running, modify the test file:**
   ```bash
   # Add a comment to trigger file change
   echo "// test change" >> scripts/test-files/vulnerable-example.js
   ```

2. **Expected wrapper output:**
   ```
   [BobWatch] 📝 File changed: vulnerable-example.js
   [BobWatch] 🔍 Analyzing for vulnerabilities...
   [BobWatch] 🚨 THREAT DETECTED: X vulnerability(ies) found
   [BobWatch] 💾 Backup created: vulnerable-example.js.1715939100000.backup
   [BobWatch] 🛡️ Real-Time Self-Healing Active: Patched vulnerability in vulnerable-example.js
   [BobWatch] 📋 Threat Type: 🚨 THREAT TYPE: EXPOSED SECRETS
   [BobWatch] 💾 Backup saved: vulnerable-example.js.1715939100000.backup
   [BobWatch] ✅ File remediated successfully
   ```

3. **Check the backup was created:**
   ```bash
   ls .bobwatch/backups/
   ```

4. **Check the audit log:**
   ```bash
   cat .bobwatch/audit.log | jq '.'
   ```

### Test 3: API Endpoint

Test the analysis endpoint directly:

```bash
curl -X POST http://localhost:3000/api/analyze-file \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "test.js",
    "fileContent": "const API_KEY = \"secret123\";",
    "fileType": "javascript"
  }'
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "hasVulnerabilities": true,
    "vulnerabilities": [
      {
        "threatType": "🚨 THREAT TYPE: EXPOSED SECRETS",
        "explanation": "...",
        "remediatedCode": "..."
      }
    ]
  }
}
```

### Test 4: Graceful Shutdown

1. **Stop the wrapper with Ctrl+C**

2. **Expected output:**
   ```
   [BobWatch] 📡 Received SIGINT, shutting down gracefully...
   [BobWatch] 🛑 Stopping file watcher...
   [BobWatch] ✅ File watcher stopped

   [BobWatch] 📊 Session Statistics:
   ─────────────────────────────────
     Vulnerabilities Remediated: X
     Remediation Failures: 0
     Total Backups Created: X
     Backup Storage Used: X.XX MB
   ─────────────────────────────────

   [BobWatch] 👋 Goodbye!
   ```

---

## 🎯 Usage Scenarios

### Scenario 1: Development Mode (Recommended)

Run wrapper alongside dev server:

```bash
npm run watch:dev
```

This starts both the Next.js dev server and the wrapper in parallel.

### Scenario 2: Standalone Mode

Run wrapper only (requires dev server running separately):

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run watch
```

### Scenario 3: Background Mode

Run wrapper as background process:

```bash
nohup npm run watch > .bobwatch/wrapper.log 2>&1 &

# View logs
tail -f .bobwatch/wrapper.log

# Stop wrapper
npm run watch:stop
```

---

## 📊 Monitoring & Maintenance

### View Audit Logs

```bash
# All logs
cat .bobwatch/audit.log

# Pretty print
cat .bobwatch/audit.log | jq '.'

# Filter by date
cat .bobwatch/audit.log | jq 'select(.timestamp > "2026-05-17")'

# Count by threat type
cat .bobwatch/audit.log | jq -r '.threatType' | sort | uniq -c
```

### Manage Backups

```bash
# List all backups
ls -lh .bobwatch/backups/

# Find backups for specific file
ls .bobwatch/backups/route.js.*.backup

# Restore a backup
cp .bobwatch/backups/route.js.1715939100000.backup app/api/auth/route.js

# Clean old backups (older than 30 days)
find .bobwatch/backups -name "*.backup" -mtime +30 -delete
```

### Check Statistics

The wrapper displays statistics on shutdown, or you can check:

```bash
# Backup statistics
du -sh .bobwatch/backups/
ls .bobwatch/backups/ | wc -l

# Audit log statistics
wc -l .bobwatch/audit.log
```

---

## ⚙️ Configuration

Edit `scripts/config/wrapper-config.js` to customize:

### Common Customizations

**1. Change watched directories:**
```javascript
watchDirs: ['app', 'scripts', 'src', 'lib']
```

**2. Add more file types:**
```javascript
filePatterns: ['.js', '.ts', '.jsx', '.tsx', '.json', '.yaml']
```

**3. Adjust debounce time:**
```javascript
debounceTime: 1000  // 1 second (slower, fewer duplicate events)
```

**4. Require manual confirmation:**
```javascript
remediation: {
  enabled: true,
  requireConfirmation: true  // Prompt before fixing
}
```

**5. Only fix critical threats:**
```javascript
remediation: {
  enabled: true,
  criticalThreatsOnly: true  // Only fix CRITICAL/EXPOSED SECRETS/etc.
}
```

---

## 🐛 Troubleshooting

### Issue: Wrapper won't start

**Error:** `Analysis endpoint not available`

**Solution:**
```bash
# Ensure Next.js dev server is running
npm run dev

# Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Issue: No vulnerabilities detected

**Problem:** Files change but no analysis happens

**Solution:**
1. Check file extension matches patterns (`.js`, `.json`, `.yaml`)
2. Verify directory is watched (`app/`, `scripts/`, `.bob/`)
3. Check console for errors
4. Verify file is not in ignore patterns

### Issue: Gemini API errors

**Error:** `MISSING_API_KEY` or API timeout

**Solution:**
```bash
# Check API key
cat .env.local | grep GEMINI_API_KEY

# Verify API key is valid
# Check Gemini API quota/limits at https://aistudio.google.com/
```

### Issue: Permission errors

**Error:** `EACCES` or permission denied

**Solution:**
```bash
# Ensure .bobwatch directory is writable
chmod -R 755 .bobwatch

# Check file permissions
ls -la .bobwatch/
```

---

## 🎓 Next Steps

1. **Review the documentation:**
   - [`BOBWATCH_WRAPPER_QUICKSTART.md`](./BOBWATCH_WRAPPER_QUICKSTART.md) - User guide
   - [`API_ANALYZE_FILE_SPEC.md`](./API_ANALYZE_FILE_SPEC.md) - API details
   - [`SECURITY.md`](./SECURITY.md) - Security best practices

2. **Customize configuration:**
   - Edit `scripts/config/wrapper-config.js`
   - Adjust watched directories and file patterns
   - Configure remediation behavior

3. **Integrate with workflow:**
   - Add to git hooks for pre-commit scanning
   - Create VS Code tasks for one-click start
   - Set up CI/CD integration

4. **Monitor and maintain:**
   - Review audit logs regularly
   - Archive old backups
   - Update ignore patterns as needed

---

## ✅ Success Criteria

Your wrapper is working correctly if:

- ✅ Wrapper starts without errors
- ✅ File changes are detected within 500ms
- ✅ Vulnerabilities are identified accurately
- ✅ Backups are created before remediation
- ✅ Files are remediated with secure code
- ✅ Audit logs are written in JSON Lines format
- ✅ Console output shows branded messages
- ✅ Graceful shutdown displays statistics

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review audit logs: `cat .bobwatch/audit.log`
3. Check wrapper logs if running in background
4. Verify configuration in `scripts/config/wrapper-config.js`
5. Ensure all dependencies are installed

---

**Installation Complete!** 🎉

The BobWatch Wrapper is ready for real-time security monitoring. Start it with `npm run watch:dev` and watch it automatically detect and fix vulnerabilities as you code!

---

**Version:** 1.0.0  
**Created:** May 17, 2026  
**Status:** Production Ready