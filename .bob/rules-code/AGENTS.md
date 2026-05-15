# Code Mode - Project Rules

This file contains non-obvious coding rules specific to this project for Code mode agents.

## Purpose

Document ONLY project-specific patterns that:
- Replace standard approaches with custom utilities
- Enforce non-standard conventions not covered by linters
- Prevent common mistakes unique to this codebase
- Reveal hidden requirements or coupling

## What to Document

✅ **Include:**
- Custom utility functions that must be used instead of standard library
- Required patterns for specific operations (API calls, database queries, file I/O)
- Non-obvious import orders or module dependencies
- Hidden interface requirements not enforced by TypeScript
- Directory-specific conventions that differ from project defaults

❌ **Exclude:**
- Standard language/framework practices
- Anything enforced by linters or type checkers
- Common patterns visible in file structure
- Information in package.json or config files

## Template

### Custom Utilities
<!-- Example: "Always use safeWriteJson() from src/utils/ instead of JSON.stringify for file writes (prevents corruption)" -->

### Required Patterns
<!-- Example: "API calls must use retry wrapper in src/api/utils/ (not optional despite appearance)" -->

### Import Conventions
<!-- Example: "Provider imports must follow specific order: types, utils, implementation (breaks otherwise)" -->

### Testing Requirements
<!-- Example: "Test files must be in same directory as source for vitest to work (not in separate test folder)" -->

### Critical Gotchas
<!-- Example: "Database queries MUST use query builder - raw SQL will fail silently" -->

---

**Note:** Code mode does not have access to MCP tools or browser capabilities. Keep rules focused on code patterns and conventions.