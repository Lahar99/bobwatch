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

---

**Instructions for AI Assistants:**
As you work on this project, update this file with non-obvious discoveries. Keep it concise (~20 lines ideal, expand only if needed). Delete obvious information. Every line should prevent a potential mistake or confusion.