# BobWatch Wrapper Scripts

This directory contains the BobWatch Real-Time IDE Middleware Wrapper and its components.

## 📁 Directory Structure

```
scripts/
├── bobwatch-wrapper.js          # Main wrapper script
├── config/
│   └── wrapper-config.js        # Configuration file
├── lib/
│   ├── file-watcher.js          # File system monitoring
│   ├── backup-manager.js        # Backup system
│   ├── analysis-client.js       # API communication
│   ├── remediation-engine.js    # Auto-remediation
│   └── audit-logger.js          # Audit logging
├── test-files/
│   └── vulnerable-example.js    # Test file with vulnerabilities
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Start the Wrapper

```bash
# Option 1: Standalone
npm run watch

# Option 2: With Next.js dev server (recommended)
npm run watch:dev

# Option 3: Background process
nohup npm run watch > .bobwatch/wrapper.log 2>&1 &
```

### 2. Stop the Wrapper

```bash
# If running in foreground
Ctrl+C

# If running in background
npm run watch:stop
```

## ⚙️ Configuration

Edit `config/wrapper-config.js` to customize:

- **watchDirs**: Directories to monitor
- **filePatterns**: File extensions to watch
- **debounceTime**: Event debouncing delay
- **remediation.enabled**: Enable/disable auto-remediation
- **backup.maxBackupsPerFile**: Backup retention count

## 🧪 Testing

Test the wrapper with the included vulnerable file:

```bash
# 1. Start the wrapper
npm run watch:dev

# 2. In another terminal, modify the test file
echo "// test change" >> scripts/test-files/vulnerable-example.js

# 3. Watch the wrapper detect and remediate vulnerabilities
```

## 📊 Monitoring

### View Audit Logs

```bash
# View all logs
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

# Restore a backup
cp .bobwatch/backups/file.js.1715939100000.backup path/to/file.js
```

## 🔧 Troubleshooting

### Wrapper Won't Start

**Problem:** `npm run watch` fails

**Solution:**
```bash
# Ensure Next.js dev server is running
npm run dev

# Check if port 3000 is available
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### No Vulnerabilities Detected

**Problem:** Files change but no analysis happens

**Solution:**
- Verify file matches patterns (only `.js`, `.json`, `.yaml`)
- Check if directory is watched (`app/`, `scripts/`, `.bob/`)
- Review console output for errors

### API Endpoint Not Found

**Problem:** 404 error on `/api/analyze-file`

**Solution:**
```bash
# Verify endpoint exists
ls app/api/analyze-file/route.js

# Restart Next.js dev server
npm run dev
```

## 📚 Documentation

- **Full Plan**: [`../BOBWATCH_WRAPPER_PLAN.md`](../BOBWATCH_WRAPPER_PLAN.md)
- **Quick Start**: [`../BOBWATCH_WRAPPER_QUICKSTART.md`](../BOBWATCH_WRAPPER_QUICKSTART.md)
- **API Spec**: [`../API_ANALYZE_FILE_SPEC.md`](../API_ANALYZE_FILE_SPEC.md)

## 🔒 Security Notes

- Backups may contain sensitive data (secrets, credentials)
- Audit logs reveal security issues in your codebase
- Do NOT commit `.bobwatch/` directory to version control
- Review auto-remediated code before committing

## 💡 Tips

1. **Run with dev server**: Use `npm run watch:dev` for best experience
2. **Review changes**: Always review auto-remediated code
3. **Keep backups**: Backups are your safety net
4. **Monitor logs**: Check audit logs regularly for security insights

## 🐛 Known Issues

- Windows: `watch:stop` script may require manual process termination
- Large files (>100KB): Not analyzed due to API limits
- Binary files: Not supported (only text files)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the full documentation
3. Check audit logs for error messages
4. Verify configuration settings

---

**Version**: 1.0.0  
**Last Updated**: May 17, 2026