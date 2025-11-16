---
title: "Troubleshooting Guide"
summary: "Troubleshooting guide for common development, database, event system, error handling, build, and runtime issues in Uptime Watcher."
created: "2025-08-05"
last_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:
    - "uptime-watcher"
    - "troubleshooting"
    - "debugging"
    - "database"
    - "performance"
---

# 🔧 Troubleshooting Guide

```bash
# Copy WASM file to dist
npm run copy-wasm

# Verify WASM files are present
ls dist/*.wasm
```

**Prevention**: The `postbuild` script should handle this automatically, but sometimes fails in certain environments.uide

> **Debug Like a Pro**: Common issues, solutions, and debugging techniques for Uptime Watcher development.

## 🚨 Common Issues & Solutions

### Development Environment

#### 1. SQLite WASM Not Found

**Error**: `Error: Cannot find module 'node-sqlite3-wasm.wasm'`

**Solution**:

```bash
# Copy WASM file to dist
npm run postbuild
# Or manually copy
npm run copy-wasm
```

**Prevention**: The `postinstall` script should handle this automatically, but sometimes fails in certain environments.

#### 2. Port 5173 Already in Use

**Error**: `Port 5173 is already in use`

**Solutions**:

```bash
# Kill the process using the port
npx kill-port 5173

# Or use a different port
npm run dev -- --port 5174
```

#### 3. Electron Won't Start

**Error**: Electron starts but shows blank screen

**Solutions**:

1. **Check Vite dev server**: Ensure `npm run dev` is running on port 5173
2. **Clear cache**: Delete `.vite` and `dist` directories
3. **Rebuild**: `npm run clean && npm install && npm run copy-wasm`

#### 4. Hot Reload Not Working

**Solutions**:

1. **Restart dev server**: Stop and restart `npm run electron-dev`
2. **Check file watchers**: Ensure file system watchers aren't exceeded
3. **Reload manually**: Use Ctrl+R in Electron window
4. **Check HMR logs**: Look for HMR errors in the console

### Database Issues

#### 1. Database Locked Error

**Error**: `database is locked`

**Solutions**:

```bash
# Inspect debug output (forwards flags while starting Vite + Electron together)
npm run electron-dev -- --log-debug
# Review the console for unclosed database connections

# Force restart if processes become unresponsive
pkill -f electron
npm run electron-dev
```

**Prevention**: Always use repository pattern and transactions

#### 2. Migration Errors

**Error**: Schema/migration related errors

**Solutions**:

1. **Backup data**: Export data if needed
2. **Delete database**: Remove SQLite files in user data directory
3. **Restart**: Application will recreate with latest schema

**Database Locations**:

- **Windows**: `%APPDATA%/uptime-watcher/`
- **macOS**: `~/Library/Application Support/uptime-watcher/`
- **Linux**: `~/.config/uptime-watcher/`

#### 3. Transaction Errors

**Error**: `cannot start a transaction within a transaction`

**Solution**: Use internal repository methods within existing transactions:

```typescript
// ❌ Wrong - creates nested transaction
await databaseService.executeTransaction(async () => {
 await repository.create(data); // This creates another transaction
});

// ✅ Correct - use internal method
await databaseService.executeTransaction(async (db) => {
 repository.createInternal(db, data); // Works within transaction
});
```

### Event System Issues

#### 1. Events Not Reaching Listeners

**Error**: Event listeners not triggering

**Solutions**:

1. **Check event names**: Ensure exact name matching (case-sensitive)
2. **Verify listener registration**: Check that listeners are registered before emission
3. **Check middleware errors**: Look for middleware that might prevent emission
4. **Debug correlation IDs**: Use correlation IDs to trace event flow

```typescript
// Debug event emission
eventBus.onTyped("site:updated", (data) => {
 console.log("Event received:", data._meta.correlationId);
});

await eventBus.emitTyped("site:updated", { siteIdentifier: "123" });
```

#### 2. IPC Events Not Crossing Boundary

**Error**: Events emitted in backend not reaching frontend

**Solutions**:

1. **Check EventsService initialization**: Ensure the renderer facade initializes successfully
2. **Verify preload exposure**: If initialization fails, confirm the relevant domain exists in the preload script
3. **Inspect bridge diagnostics**: Use structured logging to verify events are forwarded across the boundary

```typescript
import { EventsService } from "src/services/EventsService";

// Frontend debugging
EventsService.initialize()
 .then(() => console.log("EventsService ready"))
 .catch((error) => console.error("EventsService failed to initialize", error));

// Backend debugging
eventBus.use(async (event, data, next) => {
 logger.debug("Event middleware", {
  event,
  correlationId: data._meta?.correlationId,
 });
 await next();
});
```

#### 3. Memory Leaks from Event Listeners

**Error**: Growing memory usage from uncleaned listeners

**Solutions**:

1. **Always clean up listeners**: Use cleanup functions returned by EventsService
2. **Use AbortController**: For automatic cleanup on component unmount
3. **Monitor listener counts**: Check event bus diagnostics

```typescript
// Proper cleanup pattern
useEffect(() => {
 const cleanupFunctions: Array<() => void> = [];

 const setupListeners = async () => {
  cleanupFunctions.push(
   await EventsService.onSiteUpdated(handleSiteUpdate),
   await EventsService.onMonitorStatusChanged(handleMonitorStatus)
  );
 };

 void setupListeners().catch(console.error);

 return () => {
  cleanupFunctions.forEach((fn) => fn());
 };
}, []);
```

### Error Handling Issues

#### 1. Unhandled Promise Rejections

**Error**: Uncaught promise rejections in async operations

**Solutions**:

1. **Use withErrorHandling utility**: Wrap async operations
2. **Check error boundaries**: Ensure React error boundaries are in place
3. **Centralized error handling**: Use error store for consistent handling

```typescript
// Use withErrorHandling wrapper
import { SiteService } from "src/services/SiteService";

const handleSiteCreation = withErrorHandling(
 async (siteData: SiteCreationData) => {
  const newSite = await SiteService.addSite(siteData);
  addSite(newSite);
 },
 {
  context: "SiteCreation",
  notifyUser: true,
 }
);
```

#### 2. Type Guard Failures

**Error**: Type validation failures in IPC communication

**Solutions**:

1. **Check type guard implementations**: Ensure type guards match current interfaces
2. **Validate data shapes**: Check that data being sent matches expected types
3. **Update shared types**: Ensure frontend and backend use same type definitions

```typescript
// Debug type validation
const data = { name: "Test Site", url: "https://test.com" };
console.log("Is valid site data:", isSiteCreationData(data));

if (!isSiteCreationData(data)) {
 console.error("Invalid data shape:", data);
}
```

#### 3. Store State Corruption

**Error**: Zustand store state becomes inconsistent

**Solutions**:

1. **Check action implementations**: Ensure state updates are immutable
2. **Use store debugging**: Enable Zustand devtools
3. **Reset store state**: Provide reset functionality for development

```typescript
// Store debugging
import { subscribeWithSelector } from "zustand/middleware";
import { devtools } from "zustand/middleware";

export const useSitesStore = create<SitesStore>()(
 devtools(
  subscribeWithSelector((set, get) => ({
   // ... store implementation
  })),
  { name: "sites-store" }
 )
);
```

### TypeScript Issues

#### 1. Type Errors in IPC

**Error**: TypeScript errors on `window.electronAPI`

**Solutions**:

1. **Check preload types**: Ensure types are properly exposed
2. **Restart TypeScript**: Reload VS Code or restart TypeScript service
3. **Check imports**: Verify type imports in components

#### 2. Module Resolution Errors

**Error**: Cannot resolve module paths

**Solutions**:

1. **Check tsconfig.json**: Verify path mappings
2. **Restart TypeScript**: Reload language service
3. **Check imports**: Use correct relative/absolute paths

### Build & Packaging Issues

#### 1. Build Fails

**Error**: Various build-time errors

**Solutions**:

```bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Check TypeScript
npm run type-check:all

# Check linting
npm run lint
```

#### 2. Missing Dependencies in Production

**Error**: Module not found in packaged app

**Solutions**:

1. **Check package.json**: Ensure dependencies (not devDependencies)
2. **Test build locally**: `npm run dist` and test the built app
3. **Check bundling**: Verify Vite/Electron builder configuration

#### 3. WASM File Missing in Package

**Error**: SQLite WASM not found in packaged app

**Solution**: Ensure `copy-wasm` script runs:

```json
// package.json
{
 "scripts": {
  "build": "... && npm run copy-wasm",
  "copy-wasm": "copyfiles node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm dist"
 }
}
```

### Runtime Issues

#### 1. Memory Leaks

**Symptoms**: App becomes slow over time, high memory usage

**Solutions**:

1. **Check event listeners**: Ensure proper cleanup
2. **Monitor stores**: Look for state that grows infinitely
3. **Database connections**: Verify proper connection management

**Debugging**:

```typescript
// Monitor memory in development
console.log(process.memoryUsage());

// Check event listener count
console.log(eventBus.listenerCount());
```

#### 2. Performance Issues

**Symptoms**: Slow UI, delayed responses

**Solutions**:

1. **Profile React**: Use React DevTools Profiler
2. **Check database queries**: Monitor query performance
3. **Optimize stores**: Use selectors to prevent unnecessary re-renders

#### 3. Notification Issues

**Error**: Desktop notifications don't work

**Solutions**:

1. **Check permissions**: Verify notification permissions
2. **Platform differences**: Test on target platforms
3. **Service worker**: Ensure notification service is running

## 🔍 Debugging Techniques

### Logging

#### Enable Debug Logging

```bash
# Maximum debugging with Electron
npm run electron-dev:debug

# Development logging
npm run dev

# Electron main process debugging
npm run debug:electron
```

#### Backend Logging

```typescript
import { logger } from "./utils/logger";

// Use structured logging
logger.debug("Operation started", { operationId, userId });
logger.info("Site created", {
 siteIdentifier: site.identifier,
 name: site.name,
});
logger.error("Database error", { error: error.message, query });
```

#### Frontend Logging

```typescript
// Use console methods with context
console.log("[SitesStore] Adding site:", site);
console.error("[API] Failed to create site:", error);

// Use store action logging (built-in)
logStoreAction("SitesStore", "addSite", { site });
```

### DevTools

#### React DevTools

- **Installation**: Automatically available in development
- **Usage**: Inspect component state, props, and performance
- **Profiler**: Profile component render performance

#### Electron DevTools

- **Access**: F12 in the application window
- **Console**: Check for JavaScript errors and logs
- **Network**: Monitor network requests (though limited in Electron)
- **Sources**: Debug TypeScript/JavaScript code

#### VS Code Debugging

Configuration available in `.vscode/launch.json`:

```json
{
 "name": "Debug Electron Main",
 "program": "${workspaceFolder}/dist/main.js",
 "request": "launch",
 "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
 "type": "node"
}
```

### Monitoring

#### Database Operations

```typescript
// Monitor transaction performance
const startTime = Date.now();
await databaseService.executeTransaction(async (db) => {
 // ... operations
});
logger.debug("Transaction completed", {
 duration: Date.now() - startTime,
});
```

#### Event Bus

```typescript
// Monitor event flow with middleware
eventBus.use(async (eventName, data, next) => {
 logger.debug(`[Event] ${eventName}`, {
  correlationId: data._meta?.correlationId,
 });
 const start = Date.now();
 await next();
 logger.debug(`[Event] ${eventName} completed`, {
  correlationId: data._meta?.correlationId,
  duration: Date.now() - start,
 });
});

// Get event bus diagnostics
const diagnostics = eventBus.getDiagnostics();
console.log("Event Bus Stats:", {
 listenerCounts: diagnostics.listenerCounts,
 middlewareCount: diagnostics.middlewareCount,
 middlewareUtilization: diagnostics.middlewareUtilization,
});
```

#### IPC Communication

```typescript
// Log IPC calls in development
if (isDev) {
 ipcMain.on("*", (event, ...args) => {
  console.log("[IPC]", event.channel, args);
 });
}
```

## 🛠️ Development Tools

### VS Code Extensions

Recommended extensions for optimal development:

```json
{
 "recommendations": [
  "ms-vscode.vscode-typescript-next",
  "bradlc.vscode-tailwindcss",
  "ms-vscode.vscode-eslint",
  "esbenp.prettier-vscode",
  "ms-vscode.vscode-jest",
  "ms-playwright.playwright"
 ]
}
```

### Package Scripts for Debugging

```bash
# Debug specific areas
npm run debug:electron        # Debug Electron main process
npm run electron-dev:debug    # Debug Electron with Vite
npm run type-check:all        # Check TypeScript across all configs
npm run lint:fix              # Auto-fix linting issues
```

### Testing During Debugging

```bash
# Run tests in watch mode
npm run test:watch

# Test specific files
npm run test -- --run SitesStore

# Backend tests only
npm run test:electron

# Frontend tests only
npm run test

# Shared tests only
npm run test:shared
```

## 🔧 Performance Optimization

### Database Performance

1. **Use transactions** for multiple operations
2. **Batch operations** where possible
3. **Index frequently queried fields**
4. **Monitor query performance** with logging

### Frontend Performance

1. **Use React.memo** for expensive components
2. **Optimize Zustand selectors** to prevent unnecessary re-renders
3. **Debounce user input** for search/filter operations
4. **Virtualize large lists** if needed

### Memory Management

1. **Clean up event listeners** in useEffect cleanup
2. **Dispose of subscriptions** when components unmount
3. **Monitor store state growth** to prevent memory leaks
4. **Use WeakMap/WeakSet** for caching when appropriate

## 📞 Getting Help

### Internal Resources

1. **Documentation**: Check `docs/` directory first
2. **Code Examples**: Look at existing implementations
3. **Tests**: Check test files for usage examples
4. **Architecture**: Review ADRs for design decisions

### External Resources

1. **Electron Issues**: [Electron GitHub Issues](https://github.com/electron/electron/issues)
2. **React Issues**: [React GitHub Issues](https://github.com/facebook/react/issues)
3. **Vite Issues**: [Vite GitHub Issues](https://github.com/vitejs/vite/issues)
4. **TypeScript Issues**: [TypeScript GitHub Issues](https://github.com/microsoft/TypeScript/issues)

### Reporting Issues

When reporting issues, include:

1. **Environment**: OS, Node.js version, npm version
2. **Steps to reproduce**: Exact steps to reproduce the issue
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Logs**: Relevant console/file logs
6. **Code**: Minimal reproducible example

---

💡 **Pro Tip**: When debugging, start with the logs and work backwards. Most issues leave a trail in the console or log files.
