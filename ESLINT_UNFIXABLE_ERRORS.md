# ESLint Unfixable Errors
<!-- markdownlint-disable -->
This document tracks ESLint errors that cannot be automatically fixed and require manual intervention or design decisions.

## Status - Current Progress
- **Total Errors Found**: 367 (131 errors, 236 warnings) 
- **Current Count**: ~336 problems (101 errors, 235 warnings)
- **Fixable with --fix**: 25 errors and 1 warning
- **Manual Fixes Completed**: ~30 errors

## Progress Made
- ✅ Fixed SiteOverviewTab.tsx promise handlers
- ✅ Fixed switch exhaustiveness cases in Header.tsx and components.tsx
- ✅ Fixed multiple nullish coalescing errors across components
- ✅ Fixed several hook floating promise errors
- ✅ Fixed Settings component promise handlers
- ✅ Fixed SiteDetails navigation promise handlers  
- ✅ Fixed some backend database async/await issues

## Remaining Unfixable/Complex Errors

### UptimeOrchestrator.ts (21 errors, 95 warnings)
**Issue**: Complex event-driven architecture with many unsafe type assignments and floating promises in event handlers.
**Reason Unfixable**: Requires major refactor of event handling system and proper TypeScript event typing. Event handlers are inherently loosely typed in the current architecture.

### Type Safety Issues (Many warnings)
**Issue**: Unsafe assignments from `any` values, particularly in IPC communications
**Reason Unfixable**: Would require complete type system overhaul for IPC communications between main and renderer processes

### Database Repository require-await Issues
**Issue**: Many database methods flagged as async without await 
**Reason Actually OK**: These use synchronous SQLite operations that return immediately. ESLint rule may be overly aggressive.

### Backend Async/Event Issues 
**Issue**: Multiple async operations in event handlers and background services
**Reason Complex**: Would require significant architecture changes to properly handle all async operations with proper error boundaries.

---

*This document tracks our progress through ESLint error fixing. We've made significant progress on component-level issues.*
