# 🚀 Developer Quick Start Guide

> **Fast Track**: Get up and running with Uptime Watcher development in minutes.

## 📋 Overview

Uptime Watcher is a sophisticated Electron desktop application for monitoring website uptime with real-time updates, comprehensive analytics, and desktop notifications.

## ⚡ Quick Setup

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm**: 9+ (comes with Node.js)
- **Git**: Latest version

### 1. Clone & Install

```bash
git clone https://github.com/Nick2bad4u/Uptime-Watcher.git
cd Uptime-Watcher
npm install
```

### 2. Start Development

```bash
# Start both Vite dev server and Electron
npm run electron-dev

# Or start separately:
npm run dev          # Vite dev server (port 5173)
npm run electron     # Electron (waits for Vite)
```

### 3. Verify Setup

- Application window should open automatically
- React DevTools available in development
- Hot reload enabled for both frontend and backend changes

## 🏗️ Architecture Quick Reference

### Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Desktop**: Electron (main + renderer processes)
- **Database**: SQLite (node-sqlite3-wasm)
- **State**: Zustand (domain-specific stores)
- **Testing**: Vitest (dual configuration)
- **IPC**: Type-safe Electron contextBridge

### Project Structure

```text
uptime-watcher/
├── electron/          # Main process (Node.js backend)
│   ├── main.ts       # Entry point
│   ├── services/     # Service-oriented architecture
│   │   ├── database/ # Repository pattern
│   │   ├── ipc/      # IPC handlers
│   │   └── monitoring/ # Monitoring services
│   └── managers/     # Business logic orchestrators
├── src/              # Renderer process (React frontend)
│   ├── components/   # React components
│   ├── stores/       # Zustand state management
│   └── services/     # Frontend services
├── shared/           # Common code (types, validation)
└── docs/             # Comprehensive documentation
```

## 🛠️ Common Development Tasks

### Adding a New Feature

1. **Backend**: Add service/repository in `electron/services/`
2. **IPC**: Create type-safe handlers in `electron/services/ipc/`
3. **Frontend**: Add components and store in `src/`
4. **Types**: Define shared types in `shared/types/`
5. **Tests**: Add tests in both `electron/test/` and `src/test/`

### Database Changes

1. **Repository**: Create/modify in `electron/services/database/`
2. **Manager**: Update business logic in `electron/managers/`
3. **Migration**: Handle schema changes in DatabaseService
4. **Types**: Update interfaces in `shared/types/`

### Frontend Changes

1. **Components**: Add to `src/components/`
2. **State**: Create/modify Zustand stores in `src/stores/`
3. **Styling**: Use Tailwind CSS classes
4. **IPC**: Communicate via `window.electronAPI` (typed)

## 🔧 Available Scripts

### Development

```bash
npm run electron-dev    # Start full development environment
npm run dev            # Vite dev server only
npm run electron       # Electron only (needs Vite running)
npm run build          # Production build
npm run dist           # Build and package application
```

### Testing

```bash
npm test              # Run all tests
npm run test:electron # Backend tests only
npm run test:frontend # Frontend tests only
npm run test:watch    # Watch mode
```

### Code Quality

```bash
npm run lint          # ESLint + Stylelint
npm run lint:fix      # Auto-fix lint issues
npm run format        # Prettier formatting
npm run check-types   # TypeScript type checking
```

### Documentation

```bash
npm run docs          # Generate TypeDoc documentation
npm run context       # Generate AI context (for AI assistants)
```

## 🎯 Key Development Patterns

### 1. Repository Pattern (Database)

```typescript
// Always use repositories for database access
const sites = await siteRepository.findAll();
await siteRepository.create(newSite);
```

### 2. IPC Communication

```typescript
// Backend: electron/services/ipc/
ipcService.registerStandardizedIpcHandler(
 "sites:create",
 async (data: SiteCreationData) => {
  return await siteManager.createSite(data);
 },
 isSiteCreationData
);

// Frontend: React components
const result = await window.electronAPI.sites.create(siteData);
```

### 3. Event-Driven Updates

```typescript
// Emit events for cross-service communication
await eventBus.emitTyped("sites:added", { site: newSite });

// Listen to events
eventBus.onTyped("sites:added", (data) => {
 updateUI(data.site);
});
```

### 4. Zustand State Management

```typescript
// Domain-specific stores
export const useSitesStore = create<SitesStore>()((set, get) => ({
 sites: [],
 addSite: (site) =>
  set((state) => ({
   sites: [...state.sites, site],
  })),
 // ... other actions
}));
```

## 🚨 Important Guidelines

### DO's ✅

- **Follow TypeScript strict mode** - No `any` or type shortcuts
- **Use established patterns** - Repository, Service, IPC patterns
- **Write tests** - Both frontend and backend tests required
- **Document with TSDoc** - Follow established standards
- **Use error handling utilities** - `withErrorHandling()` for consistency

### DON'Ts ❌

- **No direct database access** - Always use repositories
- **No untyped IPC** - All communication must be typed
- **No global state** - Keep Zustand stores domain-specific
- **No direct state mutations** - Use store actions
- **No bypassing error handling** - Use established patterns

## 🐛 Debugging

### Development Tools

- **React DevTools**: Available in development mode
- **Electron DevTools**: F12 in the application window
- **VS Code Debugging**: Configured launch configurations available

### Common Issues

1. **SQLite WASM not found**: Run `npm run postbuild`
2. **IPC communication fails**: Check type definitions and handlers
3. **Hot reload not working**: Restart development server
4. **Database errors**: Check transaction safety and repository usage

### Logging

```bash
# Enable debug logging
npm run electron-dev -- --debug

# Production-level logging
npm run electron-dev -- --log-production

# Info-level logging
npm run electron-dev -- --log-info
```

## 📚 Essential Documentation

### Architecture Understanding

- [`docs/AI-CONTEXT.md`](./AI-CONTEXT.md) - AI assistant guide
- [`docs/Architecture/ADRs/`](./Architecture/ADRs/) - Architectural decisions
- [`docs/Architecture/Patterns/`](./Architecture/Patterns/) - Development patterns

### Implementation Guides

- [`docs/Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md`](./Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md)
- [`docs/Guides/UI-Feature-Development-Guide.md`](./Guides/UI-Feature-Development-Guide.md)
- [`docs/Architecture/Templates/`](./Architecture/Templates/) - Code templates

### Code Standards

- [`docs/Architecture/TSDoc-Standards.md`](./Architecture/TSDoc-Standards.md)

## 🎯 Next Steps

### For New Contributors

1. **Read**: [`docs/AI-CONTEXT.md`](./AI-CONTEXT.md) for project understanding
2. **Explore**: Run the application and explore existing features
3. **Practice**: Try adding a simple feature following the patterns
4. **Ask**: Check documentation first, then ask questions

### For AI Assistants

1. **Context**: Load [`docs/AI-CONTEXT.md`](./AI-CONTEXT.md) for comprehensive context
2. **Patterns**: Reference [`docs/Architecture/`](./Architecture/) for coding patterns
3. **Examples**: Use templates in [`docs/Architecture/Templates/`](./Architecture/Templates/)

---

🎉 **Ready to contribute!** The codebase follows strict patterns and comprehensive documentation. When in doubt, check the existing code and documentation patterns.
