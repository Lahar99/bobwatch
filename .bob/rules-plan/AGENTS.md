# Plan Mode - Architecture Rules

This file contains non-obvious architectural patterns and constraints for Plan mode agents.

## Purpose

Document ONLY information that:
- Reveals hidden coupling between components
- Explains undocumented architectural decisions
- Identifies non-standard patterns that must be followed
- Warns about performance bottlenecks or constraints

## What to Document

✅ **Include:**
- Hidden coupling or dependencies (e.g., "Providers MUST be stateless - caching layer assumes this")
- Non-obvious communication patterns (e.g., "Webview and extension use specific IPC channel patterns only")
- Architectural constraints (e.g., "Database migrations cannot be rolled back - forward-only by design")
- Required architectural patterns (e.g., "React hooks required - external state libraries break webview isolation")
- Intentional design decisions (e.g., "Monorepo packages have circular dependency on types package (intentional)")

❌ **Exclude:**
- Standard architectural patterns visible in code structure
- Common framework patterns (MVC, MVVM, etc.)
- Obvious component relationships
- Standard dependency management

## Template

### Component Coupling
<!-- Example: "Providers MUST be stateless - hidden caching layer assumes this" -->

### Communication Patterns
<!-- Example: "Webview and extension communicate through specific IPC channel patterns only" -->

### Data Flow Constraints
<!-- Example: "Database migrations cannot be rolled back - forward-only by design" -->

### Required Patterns
<!-- Example: "React hooks required because external state libraries break webview isolation" -->

### Intentional Design Decisions
<!-- Example: "Monorepo packages have circular dependency on types package (intentional)" -->

### Performance Considerations
<!-- Example: "File watching disabled in production - causes memory leaks with large codebases" -->

---

**Note:** Plan mode focuses on high-level architecture and planning. Document constraints that would affect architectural decisions or refactoring efforts.