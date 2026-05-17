# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Purpose

This file should contain ONLY non-obvious, project-specific information that cannot be guessed from:
- Standard framework/language practices
- File structure or naming conventions
- Configuration files (package.json, tsconfig.json, etc.)
- Common development patterns

## What to Document (Examples)

✅ **DO Include:**
- Custom utilities that replace standard approaches (e.g., "Use `safeWriteJson()` from src/utils/ instead of JSON.stringify")
- Non-standard patterns unique to this project (e.g., "API calls must use retry wrapper in src/api/utils/")
- Hidden requirements (e.g., "Database queries MUST use query builder - raw SQL will fail")
- Counterintuitive conventions (e.g., "Test files must be in same directory as source, not separate test folder")
- Critical gotchas (e.g., "Provider interface has undocumented required methods")

❌ **DON'T Include:**
- Standard npm/yarn commands visible in package.json
- Framework defaults (e.g., "React uses JSX")
- Common patterns (e.g., "tests go in __tests__ folders")
- Information derivable from file names or extensions
- Obvious build/test commands

<<<<<<< HEAD
## BobWatch Wrapper Implementation Notes

### Critical Architecture Decisions

1. **File Watcher MUST use debouncing (500ms minimum)**
   - Without debouncing, rapid file saves trigger duplicate analysis requests
   - Use `setTimeout` to batch events, not raw `fs.watch` callbacks

2. **Backup creation is MANDATORY before any file modification**
   - Never overwrite files without creating `.backup` first
   - Atomic operations: backup → validate → write → log (in that order)
   - Rollback on ANY failure during remediation

3. **API endpoint `/api/analyze-file` expects COMPLETE file content**
   - Do NOT send partial content or diffs
   - Include full file text for context-aware analysis
   - Maximum file size: 100KB (enforced by endpoint)

4. **Remediated code from Gemini MUST be validated before writing**
   - Check for syntax errors using basic parsing
   - Verify code is complete (no placeholders like "// rest of code")
   - Ensure file encoding matches original (UTF-8 default)

5. **Audit logging uses JSON Lines format (not JSON array)**
   - Each log entry is a separate JSON object on its own line
   - Enables streaming reads and log rotation without parsing entire file
   - Format: `{"timestamp":"...","filePath":"...","action":"..."}\n`

### Hidden Coupling

- **Wrapper depends on Next.js dev server running on port 3000**
  - Analysis endpoint is a Next.js API route, not standalone
  - Wrapper will fail silently if dev server is not running
  - Always start with `npm run watch:dev` (not just `npm run watch`)

- **Gemini API responses may include markdown code blocks**
  - Must strip ```json and ``` before parsing
  - Extract JSON object boundaries carefully (first `{` to last `}`)
  - Fallback to empty vulnerabilities array on parse errors

### Non-Standard Patterns

- **Backup files use timestamp in filename, not version numbers**
  - Format: `{filename}.{timestamp}.backup`
  - Timestamp is Unix epoch milliseconds for sortability
  - Cleanup keeps last 10 backups per file (not time-based retention)

- **Console output uses specific emoji prefixes for parsing**
  - `[BobWatch] 🛡️` = Remediation action
  - `[BobWatch] 🚨` = Threat detected
  - `[BobWatch] ✅` = Success
  - `[BobWatch] ❌` = Error
  - External tools may parse these for monitoring

### Performance Gotchas

- **File watcher monitors directories recursively**
  - Watching `app/` includes ALL subdirectories automatically
  - Exclude patterns MUST be checked on every event (not just at startup)
  - Large directories (>1000 files) may cause performance issues

- **Concurrent analysis requests share connection pool**
  - Default limit: 3 concurrent requests to Gemini API
  - Exceeding limit causes queuing, not errors
  - Adjust `maxConcurrentAnalysis` in config for slower/faster machines
=======
## Template Sections

### Build & Run Commands
<!-- Only include if they differ from standard package.json scripts or have special requirements -->

### Code Style & Conventions
<!-- Only include project-specific rules not covered by linter configs -->

### Custom Utilities & Patterns
<!-- Document custom utilities discovered by reading code -->

### Testing
<!-- Only include non-standard testing requirements -->

### Architecture Notes
<!-- Document hidden coupling, non-obvious dependencies, or counterintuitive patterns -->
>>>>>>> 4cf9263e733633d37503ac1b36a58b53350f7f09

---

**Instructions for AI Assistants:**
As you work on this project, update this file with non-obvious discoveries. Keep it concise (~20 lines ideal, expand only if needed). Delete obvious information. Every line should prevent a potential mistake or confusion.