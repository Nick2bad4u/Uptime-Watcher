# ESLint Disabled Rules Documentation

This document tracks ESLint rules that have been disabled with explanations for why they shouldn't be fixed.

## Rules Disabled and Reasoning

### unicorn/prefer-event-target over EventEmitter

**File:** `electron/events/TypedEventBus.ts:24`  
**Rule:** `unicorn/prefer-event-target`  
**Reason:** This is a Node.js backend component that specifically needs EventEmitter for its Node.js-specific features like `setMaxListeners()`, `eventNames()`, and `listenerCount()`. EventTarget doesn't provide these APIs that are essential for the diagnostic functionality. The EventEmitter is the appropriate choice for a Node.js backend service.

**Status:** DISABLED - Using EventEmitter is intentional and necessary.

### @typescript-eslint/require-await for Repository Adapters

**File:** `electron/utils/database/repositoryAdapters.ts`  
**Rule:** `@typescript-eslint/require-await`  
**Reason:** These are adapter methods that must be async to match interface contracts, even though the underlying operations are synchronous. The adapters wrap synchronous repository methods to provide a consistent async interface.

**Status:** DISABLED - Interface compatibility requires async signatures.

### Helper Functions for Theme Utilities

**Files:** Various components and theme files  
**Rules:** `@typescript-eslint/no-unused-vars`, `unicorn/consistent-function-scoping`  
**Reason:** Helper functions extracted to outer scope for performance and consistency, but not all are used yet. They provide a consistent API for theme operations and will be used as the codebase evolves.

**Status:** KEEPING - These provide a consistent interface and will be used more widely.

---

_This document will be updated as more rules are reviewed during the ESLint fixing process._
