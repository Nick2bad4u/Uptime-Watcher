# 🔧 Troubl&#x65;__&#x53;olutions__:

```bash
# Copy WASM file to dist
npm run copy-wasm

# Verify WASM files are present
ls dist/*.wasm
```

__Prevention__: The `postbuild` script should handle this automatically, but sometimes fails in certain environments.uide

> __Debug Like a Pro__: Common issues, solutions, and debugging techniques for Uptime Watcher development.

## 🚨 Common Issues & Solutions

### Development Environment

#### 1. SQLite WASM Not Found

__Error__: `Error: Cannot find module 'node-sqlite3-wasm.wasm'`

__Solution__:

```bash
# Copy WASM file to dist
npm run postbuild
# Or manually copy
npm run copy-wasm
```

__Prevention__: The `postinstall` script should handle this automatically, but sometimes fails in certain environments.

#### 2. Port 5173 Already in Use

__Error__: `Port 5173 is already in use`

__Solutions__:

```bash
# Kill the process using the port
npx kill-port 5173

# Or use a different port
npm run dev -- --port 5174
```

#### 3. Electron Won't Start

__Error__: Electron starts but shows blank screen

__Solutions__:

1. __Check Vite dev server__: Ensure `npm run dev` is running on port 5173
2. __Clear cache__: Delete `.vite` and `dist` directories
3. __Rebuild__: `npm run clean && npm install && npm run copy-wasm`

#### 4. Hot Reload Not Working

__Solutions__:

1. __Restart dev server__: Stop and restart `npm run electron-dev`
2. __Check file watchers__: Ensure file system watchers aren't exceeded
3. __Reload manually__: Use Ctrl+R in Electron window
4. __Check HMR logs__: Look for HMR errors in the console

### Database Issues

#### 1. Database Locked Error

__Error__: `database is locked`

__Solutions__:

```bash
# Inspect debug output (forwards flags while starting Vite + Electron together)
npm run electron-dev -- --log-debug
# Review the console for unclosed database connections

# Force restart if processes become unresponsive
pkill -f electron
npm run electron-dev
```

__Prevention__: Always use repository pattern and transactions

#### 2. Migration Errors

__Error__: Schema/migration related errors

__Solutions__:

1. __Backup data__: Export data if needed
2. __Delete database__: Remove SQLite files in user data directory
3. __Restart__: Application will recreate with latest schema

__Database Locations__:

* __Windows__: `%APPDATA%/uptime-watcher/`
* __macOS__: `~/Library/Application Support/uptime-watcher/`
* __Linux__: `~/.config/uptime-watcher/`

#### 3. Transaction Errors

__Error__: `cannot start a transaction within a transaction`

__Solution__: Use internal repository methods within existing transactions:

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

__Error__: Event listeners not triggering

__Solutions__:

1. __Check event names__: Ensure exact name matching (case-sensitive)
2. __Verify listener registration__: Check that listeners are registered before emission
3. __Check middleware errors__: Look for middleware that might prevent emission
4. __Debug correlation IDs__: Use correlation IDs to trace event flow

```typescript
// Debug event emission
eventBus.onTyped("site:updated", (data) => {
 console.log("Event received:", data._meta.correlationId);
});

await eventBus.emitTyped("site:updated", { siteIdentifier: "123" });
```

#### 2. IPC Events Not Crossing Boundary

__Error__: Events emitted in backend not reaching frontend

__Solutions__:

1. __Check EventsService initialization__: Ensure the renderer facade initializes successfully
2. __Verify preload exposure__: If initialization fails, confirm the relevant domain exists in the preload script
3. __Inspect bridge diagnostics__: Use structured logging to verify events are forwarded across the boundary

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

__Error__: Growing memory usage from uncleaned listeners

__Solutions__:

1. __Always clean up listeners__: Use cleanup functions returned by EventsService
2. __Use AbortController__: For automatic cleanup on component unmount
3. __Monitor listener counts__: Check event bus diagnostics

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

__Error__: Uncaught promise rejections in async operations

__Solutions__:

1. __Use withErrorHandling utility__: Wrap async operations
2. __Check error boundaries__: Ensure React error boundaries are in place
3. __Centralized error handling__: Use error store for consistent handling

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

__Error__: Type validation failures in IPC communication

__Solutions__:

1. __Check type guard implementations__: Ensure type guards match current interfaces
2. __Validate data shapes__: Check that data being sent matches expected types
3. __Update shared types__: Ensure frontend and backend use same type definitions

```typescript
// Debug type validation
const data = { name: "Test Site", url: "https://test.com" };
console.log("Is valid site data:", isSiteCreationData(data));

if (!isSiteCreationData(data)) {
 console.error("Invalid data shape:", data);
}
```

#### 3. Store State Corruption

__Error__: Zustand store state becomes inconsistent

__Solutions__:

1. __Check action implementations__: Ensure state updates are immutable
2. __Use store debugging__: Enable Zustand devtools
3. __Reset store state__: Provide reset functionality for development

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

__Error__: TypeScript errors on `window.electronAPI`

__Solutions__:

1. __Check preload types__: Ensure types are properly exposed
2. __Restart TypeScript__: Reload VS Code or restart TypeScript service
3. __Check imports__: Verify type imports in components

#### 2. Module Resolution Errors

__Error__: Cannot resolve module paths

__Solutions__:

1. __Check tsconfig.json__: Verify path mappings
2. __Restart TypeScript__: Reload language service
3. __Check imports__: Use correct relative/absolute paths

### Build & Packaging Issues

#### 1. Build Fails

__Error__: Various build-time errors

__Solutions__:

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

__Error__: Module not found in packaged app

__Solutions__:

1. __Check package.json__: Ensure dependencies (not devDependencies)
2. __Test build locally__: `npm run dist` and test the built app
3. __Check bundling__: Verify Vite/Electron builder configuration

#### 3. WASM File Missing in Package

__Error__: SQLite WASM not found in packaged app

__Solution__: Ensure `copy-wasm` script runs:

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

__Symptoms__: App becomes slow over time, high memory usage

__Solutions__:

1. __Check event listeners__: Ensure proper cleanup
2. __Monitor stores__: Look for state that grows infinitely
3. __Database connections__: Verify proper connection management

__Debugging__:

```typescript
// Monitor memory in development
console.log(process.memoryUsage());

// Check event listener count
console.log(eventBus.listenerCount());
```

#### 2. Performance Issues

__Symptoms__: Slow UI, delayed responses

__Solutions__:

1. __Profile React__: Use React DevTools Profiler
2. __Check database queries__: Monitor query performance
3. __Optimize stores__: Use selectors to prevent unnecessary re-renders

#### 3. Notification Issues

__Error__: Desktop notifications don't work

__Solutions__:

1. __Check permissions__: Verify notification permissions
2. __Platform differences__: Test on target platforms
3. __Service worker__: Ensure notification service is running

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

* __Installation__: Automatically available in development
* __Usage__: Inspect component state, props, and performance
* __Profiler__: Profile component render performance

#### Electron DevTools

* __Access__: F12 in the application window
* __Console__: Check for JavaScript errors and logs
* __Network__: Monitor network requests (though limited in Electron)
* __Sources__: Debug TypeScript/JavaScript code

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

1. __Use transactions__ for multiple operations
2. __Batch operations__ where possible
3. __Index frequently queried fields__
4. __Monitor query performance__ with logging

### Frontend Performance

1. __Use React.memo__ for expensive components
2. __Optimize Zustand selectors__ to prevent unnecessary re-renders
3. __Debounce user input__ for search/filter operations
4. __Virtualize large lists__ if needed

### Memory Management

1. __Clean up event listeners__ in useEffect cleanup
2. __Dispose of subscriptions__ when components unmount
3. __Monitor store state growth__ to prevent memory leaks
4. __Use WeakMap/WeakSet__ for caching when appropriate

## 📞 Getting Help

### Internal Resources

1. __Documentation__: Check `docs/` directory first
2. __Code Examples__: Look at existing implementations
3. __Tests__: Check test files for usage examples
4. __Architecture__: Review ADRs for design decisions

### External Resources

1. __Electron Issues__: [Electron GitHub Issues](https://github.com/electron/electron/issues)
2. __React Issues__: [React GitHub Issues](https://github.com/facebook/react/issues)
3. __Vite Issues__: [Vite GitHub Issues](https://github.com/vitejs/vite/issues)
4. __TypeScript Issues__: [TypeScript GitHub Issues](https://github.com/microsoft/TypeScript/issues)

### Reporting Issues

When reporting issues, include:

1. __Environment__: OS, Node.js version, npm version
2. __Steps to reproduce__: Exact steps to reproduce the issue
3. __Expected behavior__: What should happen
4. __Actual behavior__: What actually happens
5. __Logs__: Relevant console/file logs
6. __Code__: Minimal reproducible example

***

💡 __Pro Tip__: When debugging, start with the logs and work backwards. Most issues leave a trail in the console or log files.
