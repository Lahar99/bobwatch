# BobWatch Wrapper - Quick Start Guide

## 🚀 What is BobWatch Wrapper?

BobWatch Wrapper is a **real-time IDE middleware** that acts as an intelligent security guardian for your codebase. It monitors your files as you code, automatically detects vulnerabilities, and fixes them before they reach production.

Think of it as having a senior security engineer watching over your shoulder 24/7, instantly patching security issues the moment they appear.

---

## ✨ Key Features

🔍 **Real-Time Monitoring**
- Watches `app/`, `scripts/`, `.bob/` directories
- Monitors `.js`, `.json`, `.yaml` files
- Debounced event handling (no performance impact)

🛡️ **Automatic Security Fixes**
- Detects MCP boundary breaches
- Finds exposed secrets and hardcoded credentials
- Identifies SQL/command injection vulnerabilities
- Patches authentication bypasses

💾 **Safe Remediation**
- Creates backups before any changes
- Atomic file operations (no corruption)
- Full audit trail of all actions
- Rollback capability

⚡ **Zero Latency**
- Runs asynchronously in background
- Doesn't block your development workflow
- < 3 second end-to-end response time

---

## 📋 Prerequisites

1. **Node.js** v16+ installed
2. **Next.js** development server running
3. **Gemini API Key** configured in `.env.local`

---

## 🎯 Installation Steps

### Step 1: Review the Implementation Plan

```bash
# Read the detailed plan
cat BOBWATCH_WRAPPER_PLAN.md
```

### Step 2: Switch to Code Mode

The implementation requires creating multiple files and components. You'll need to switch to **Code mode** to build the wrapper.

**Recommended approach:**
```
Switch to Code mode and say:
"Implement the BobWatch Wrapper according to BOBWATCH_WRAPPER_PLAN.md"
```

### Step 3: What Will Be Created

The implementation will create:

```
scripts/
├── bobwatch-wrapper.js              # Main entry point
├── lib/
│   ├── file-watcher.js              # File monitoring
│   ├── backup-manager.js            # Backup system
│   ├── analysis-client.js           # API client
│   ├── remediation-engine.js        # Auto-fix engine
│   └── audit-logger.js              # Logging
└── config/
    └── wrapper-config.js            # Configuration

.bobwatch/
├── backups/                         # Backup storage
└── audit.log                        # Audit trail

app/api/analyze-file/
└── route.js                         # New API endpoint
```

---

## 🎮 Usage

### Start the Wrapper

**Option 1: Standalone Mode**
```bash
npm run watch
```

**Option 2: With Dev Server (Recommended)**
```bash
npm run watch:dev
```

**Option 3: Background Process**
```bash
nohup npm run watch > .bobwatch/wrapper.log 2>&1 &
```

### Expected Console Output

```
[BobWatch] 🚀 Real-Time Security Wrapper Started
[BobWatch] 📁 Watching: app/, scripts/, .bob/
[BobWatch] 🔍 Monitoring: *.js, *.json, *.yaml
[BobWatch] ✅ Ready for real-time protection

[BobWatch] 📝 File changed: app/api/auth/route.js
[BobWatch] 🔍 Analyzing for vulnerabilities...
[BobWatch] 🚨 THREAT DETECTED: EXPOSED SECRETS
[BobWatch] 💾 Backup created: .bobwatch/backups/route.js.1715939100000.backup
[BobWatch] 🛡️ Real-Time Self-Healing Active: Patched vulnerability in app/api/auth/route.js
[BobWatch] ✅ File remediated successfully
```

### Stop the Wrapper

```bash
# If running in foreground
Ctrl+C

# If running in background
npm run watch:stop
```

---

## 🔧 Configuration

Edit `scripts/config/wrapper-config.js` to customize:

```javascript
module.exports = {
  // Which directories to watch
  watchDirs: ['app', 'scripts', '.bob'],
  
  // Which file types to monitor
  filePatterns: ['.js', '.json', '.yaml'],
  
  // Auto-remediation settings
  remediation: {
    enabled: true,
    requireConfirmation: false,  // Set true for manual approval
    criticalThreatsOnly: false   // Set true to only fix CRITICAL
  },
  
  // Backup settings
  backup: {
    enabled: true,
    maxBackupsPerFile: 10
  }
};
```

---

## 📊 Monitoring & Logs

### View Audit Trail

```bash
# View all remediation actions
cat .bobwatch/audit.log

# Pretty print with jq
cat .bobwatch/audit.log | jq '.'

# Filter by threat type
cat .bobwatch/audit.log | jq 'select(.threatType | contains("EXPOSED SECRETS"))'
```

### Check Backups

```bash
# List all backups
ls -lh .bobwatch/backups/

# Restore a specific backup
cp .bobwatch/backups/route.js.1715939100000.backup app/api/auth/route.js
```

---

## 🧪 Testing

### Test with Sample Vulnerable Files

Create a test file with a known vulnerability:

```javascript
// test-vulnerable.js
const API_KEY = "sk-1234567890abcdef"; // Hardcoded secret

function authenticate(user) {
  // SQL injection vulnerability
  const query = `SELECT * FROM users WHERE username = '${user}'`;
  return db.query(query);
}
```

Save the file and watch BobWatch automatically fix it!

---

## 🎯 What Gets Detected?

### MCP Infrastructure Vulnerabilities
- ✅ Instruction boundary breaches
- ✅ Confused deputy attacks
- ✅ Privilege escalation vectors

### Traditional Security Issues
- ✅ Exposed secrets and API keys
- ✅ SQL injection vulnerabilities
- ✅ Command injection risks
- ✅ Authentication bypasses
- ✅ Path traversal vulnerabilities
- ✅ XSS vulnerabilities

---

## 🚨 Troubleshooting

### Wrapper Not Starting

**Problem:** `npm run watch` fails
**Solution:** 
```bash
# Ensure Next.js dev server is running
npm run dev

# Check if port 3000 is available
lsof -i :3000
```

### No Vulnerabilities Detected

**Problem:** Files change but no analysis happens
**Solution:**
```bash
# Check if file matches patterns
# Only .js, .json, .yaml files are monitored

# Check if directory is watched
# Only app/, scripts/, .bob/ are monitored
```

### API Endpoint Not Found

**Problem:** 404 error on `/api/analyze-file`
**Solution:**
```bash
# Ensure the endpoint was created
ls app/api/analyze-file/route.js

# Restart Next.js dev server
npm run dev
```

### Gemini API Errors

**Problem:** Analysis fails with API error
**Solution:**
```bash
# Check API key is configured
cat .env.local | grep GEMINI_API_KEY

# Verify API key is valid
# Check Gemini API quota/limits
```

---

## 📈 Performance Tips

1. **Adjust Debounce Time**
   - Increase `debounceTime` in config for slower analysis
   - Decrease for faster response (may increase API calls)

2. **Limit Concurrent Analysis**
   - Set `maxConcurrentAnalysis: 1` for slower machines
   - Increase to 5+ for powerful systems

3. **Filter File Types**
   - Remove unnecessary file patterns to reduce monitoring overhead
   - Focus on high-risk files (auth, API routes, configs)

---

## 🔐 Security Best Practices

1. **Review Audit Logs Regularly**
   ```bash
   # Weekly security review
   cat .bobwatch/audit.log | jq 'select(.timestamp > "2026-05-10")'
   ```

2. **Test Remediations**
   - Always test auto-fixed code before committing
   - Review backup files to understand changes

3. **Configure Confirmation Mode**
   - For production code, enable `requireConfirmation: true`
   - Manually approve critical fixes

4. **Backup Strategy**
   - Keep backups in version control (optional)
   - Archive old backups periodically

---

## 🎓 Learning Resources

- **Full Implementation Plan:** [`BOBWATCH_WRAPPER_PLAN.md`](./BOBWATCH_WRAPPER_PLAN.md)
- **Security Documentation:** [`SECURITY.md`](./SECURITY.md)
- **MCP Security Guide:** [`MCP_SECURITY_ENHANCEMENT_PLAN.md`](./MCP_SECURITY_ENHANCEMENT_PLAN.md)

---

## 🤝 Next Steps

1. **Switch to Code Mode** to implement the wrapper
2. **Test with sample files** to verify functionality
3. **Customize configuration** for your workflow
4. **Integrate with CI/CD** for automated security checks

---

## 💡 Pro Tips

🔥 **Hot Tip #1:** Run wrapper alongside your dev server
```bash
npm run watch:dev
```

🔥 **Hot Tip #2:** Create git hooks for pre-commit scanning
```bash
# .git/hooks/pre-commit
npm run watch -- --once
```

🔥 **Hot Tip #3:** Use VS Code tasks for one-click start
```json
// .vscode/tasks.json
{
  "label": "Start BobWatch",
  "type": "npm",
  "script": "watch:dev"
}
```

---

**Ready to implement?** Switch to Code mode and let's build this futuristic security system! 🚀

---

*Last Updated: May 17, 2026*  
*Version: 1.0.0*