# Ask Mode - Documentation Context

This file contains non-obvious documentation patterns and context for Ask mode agents.

## Purpose

Document ONLY information that:
- Reveals counterintuitive code organization
- Identifies hidden or misnamed documentation
- Explains misleading folder structures
- Provides context not evident from file names

## What to Document

✅ **Include:**
- Counterintuitive directory purposes (e.g., "src/ contains VSCode extension code, not web app source")
- Documentation that contradicts code (e.g., "Provider examples in code are canonical - docs are outdated")
- Hidden architectural constraints (e.g., "UI runs in VSCode webview with restrictions")
- Non-obvious file locations (e.g., "Config must be in root, not in config/ folder")
- Multiple systems with similar names (e.g., "Two separate i18n systems: root for extension, ui/src for webview")

❌ **Exclude:**
- Standard documentation locations (README.md, docs/)
- Obvious folder purposes derivable from names
- Standard project structures
- Information clearly stated in existing documentation

## Template

### Directory Structure Quirks
<!-- Example: "src/ contains VSCode extension code, not source for web apps (counterintuitive)" -->

### Documentation Locations
<!-- Example: "Provider examples in src/api/providers/ are the canonical reference (docs are outdated)" -->

### Architectural Context
<!-- Example: "UI runs in VSCode webview with restrictions (no localStorage, limited APIs)" -->

### Configuration Patterns
<!-- Example: "Package.json scripts must be run from specific directories, not root" -->

### Multiple Systems
<!-- Example: "Locales in root are for extension, webview-ui/src/i18n for UI (two separate systems)" -->

---

**Note:** Ask mode focuses on helping users understand the codebase. Document anything that would confuse someone reading the code or documentation.