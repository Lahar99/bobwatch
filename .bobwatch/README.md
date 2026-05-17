# .bobwatch Directory

This directory is used by the BobWatch Wrapper for storing backups and audit logs.

## Structure

```
.bobwatch/
├── backups/          # Timestamped backup files
│   ├── route.js.1715939100000.backup
│   ├── auth.js.1715939200000.backup
│   └── ...
├── audit.log         # JSON Lines audit trail
└── README.md         # This file
```

## Backup Files

Backup files are created automatically before any file remediation:

- **Naming:** `{filename}.{timestamp}.backup`
- **Timestamp:** Unix epoch milliseconds
- **Retention:** Last 10 backups per file
- **Format:** Exact copy of original file

### Restoring from Backup

```bash
# List backups for a specific file
ls -lh .bobwatch/backups/route.js.*.backup

# Restore a specific backup
cp .bobwatch/backups/route.js.1715939100000.backup app/api/auth/route.js
```

## Audit Log

The audit log tracks all remediation actions in JSON Lines format:

```json
{"timestamp":"2026-05-17T09:45:00.000Z","filePath":"app/api/auth/route.js","threatType":"🚨 THREAT TYPE: EXPOSED SECRETS","action":"REMEDIATED","backupPath":".bobwatch/backups/route.js.1715939100000.backup"}
```

### Viewing Audit Logs

```bash
# View all logs
cat .bobwatch/audit.log

# Pretty print with jq
cat .bobwatch/audit.log | jq '.'

# Filter by date
cat .bobwatch/audit.log | jq 'select(.timestamp > "2026-05-17")'

# Filter by threat type
cat .bobwatch/audit.log | jq 'select(.threatType | contains("EXPOSED SECRETS"))'

# Count remediations by threat type
cat .bobwatch/audit.log | jq -r '.threatType' | sort | uniq -c
```

## Log Rotation

When `audit.log` exceeds 10MB, it will be automatically rotated:

- Current log: `audit.log`
- Rotated logs: `audit.log.1`, `audit.log.2`, etc.
- Retention: Last 5 rotated logs

## Maintenance

### Clean Old Backups

```bash
# Remove backups older than 30 days
find .bobwatch/backups -name "*.backup" -mtime +30 -delete
```

### Archive Audit Logs

```bash
# Archive logs older than 90 days
cat .bobwatch/audit.log | jq -c 'select(.timestamp < "2026-02-17")' > archive-2026-q1.log
cat .bobwatch/audit.log | jq -c 'select(.timestamp >= "2026-02-17")' > .bobwatch/audit.log.tmp
mv .bobwatch/audit.log.tmp .bobwatch/audit.log
```

## Security Notes

- This directory contains sensitive information about code vulnerabilities
- Do NOT commit to version control (already in `.gitignore`)
- Backups may contain secrets or credentials
- Audit logs reveal security issues in your codebase

## Troubleshooting

### Disk Space Issues

If backups consume too much space:

1. Reduce `maxBackupsPerFile` in `scripts/config/wrapper-config.js`
2. Run cleanup script to remove old backups
3. Consider archiving to external storage

### Missing Backups

If backups are not being created:

1. Check wrapper is running: `ps aux | grep bobwatch-wrapper`
2. Verify backup directory exists and is writable
3. Check wrapper logs for errors

---

**Created by:** BobWatch Wrapper  
**Purpose:** Backup and audit storage  
**Do Not Delete:** Required for wrapper operation