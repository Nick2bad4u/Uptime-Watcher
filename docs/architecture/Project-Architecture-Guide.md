<!-- markdownlint-disable -->

# 🏗️ Uptime Watcher - Complete Project Architecture Guide

> **Navigation:** [📖 Docs Home](../README.md) » [🏗️ Architecture](../README.md#architecture) » **Project Architecture**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Flow & Communication](#data-flow--communication)
6. [File Structure](#file-structure)
7. [Development Patterns](#development-patterns)
8. [Performance Architecture](#performance-architecture)
9. [Security Architecture](#security-architecture)
10. [Deployment Architecture](#deployment-architecture)

---

## 🎯 Overview

Uptime Watcher is a sophisticated Electron-based desktop application for monitoring website and service uptime. The application features a **modular, service-oriented architecture** with clean separation of concerns, following enterprise-grade patterns for maintainability and scalability.

### 🏗️ Architectural Principles

- **Separation of Concerns**: Clear boundaries between data, business logic, and presentation
- **Dependency Injection**: Services composed through clean interfaces
- **Repository Pattern**: Data access abstracted through repositories
- **Factory Pattern**: Monitor creation through extensible factory services
- **Event-Driven**: Real-time updates through event-based communication
- **Type Safety**: Full TypeScript coverage across frontend and backend

---

## 🛠️ Technology Stack

### Core Technologies

- **Runtime**: Electron 22+ (Node.js + Chromium)
- **Language**: TypeScript 5+ (Strict mode)
- **Frontend Framework**: React 18+ with hooks
- **Build Tool**: Vite 4+ with TypeScript integration
- **Package Manager**: npm

### State Management & UI
- **State Management**: Zustand with persistence middleware
- **UI Styling**: TailwindCSS + Custom CSS properties
- **Theme System**: Custom theme manager with system detection
- **Charts**: Chart.js with date-fns adapter
- **Icons**: Unicode/Emoji + custom status indicators

### Backend & Data
- **Database**: SQLite3 with node-sqlite3-wasm
- **Logging**: electron-log for cross-process logging
- **IPC**: Electron's main/renderer communication
- **Auto-Updater**: electron-updater for seamless updates
- **Testing**: Jest + Electron testing utilities

### Development Tools
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Bundle Analysis**: electron-builder
- **CI/CD**: GitHub Actions

---

## 🏭 Backend Architecture

The backend follows a **layered service architecture** with clear separation of concerns:

### 🔧 Service Layer Architecture

```
electron/
├── main.ts                          # Application entry point
├── preload.ts                       # IPC API bridge (domain-organized)
├── services/                        # Business logic layer
│   ├── application/                 # Application orchestration
│   │   ├── ApplicationService.ts    # Main app coordinator
│   │   └── index.ts
│   ├── database/                    # Data persistence layer
│   │   ├── DatabaseService.ts       # DB connection & schema
│   │   ├── SiteRepository.ts        # Site CRUD operations
│   │   ├── MonitorRepository.ts     # Monitor CRUD operations
│   │   ├── HistoryRepository.ts     # History management
│   │   ├── SettingsRepository.ts    # Application settings
│   │   └── index.ts
│   ├── monitoring/                  # Core monitoring logic
│   │   ├── HttpMonitor.ts           # HTTP health checks
│   │   ├── PortMonitor.ts           # Port connectivity checks
│   │   ├── MonitorFactory.ts        # Monitor creation factory
│   │   ├── MonitorScheduler.ts      # Interval management
│   │   ├── types.ts                 # Monitoring interfaces
│   │   └── index.ts
│   ├── ipc/                         # Inter-process communication
│   │   ├── IpcService.ts            # Domain-organized IPC handlers
│   │   └── index.ts
│   ├── window/                      # Window management
│   │   ├── WindowService.ts         # Window lifecycle & rendering
│   │   └── index.ts
│   ├── notifications/               # System notifications
│   │   ├── NotificationService.ts   # Cross-platform notifications
│   │   └── index.ts
│   └── updater/                     # Auto-update system
│       ├── AutoUpdaterService.ts    # Update management
│       └── index.ts
├── utils/                           # Shared utilities
│   ├── logger.ts                    # Centralized logging
│   └── retry.ts                     # Retry logic utilities
├── types.ts                         # Shared TypeScript interfaces
└── uptimeMonitor.ts                 # Legacy coordinator (refactored)
```

### 🗃️ Repository Pattern Implementation

```typescript
// Example: Database Service Architecture
interface Repository<T> {
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

// Concrete Implementation
class SiteRepository implements Repository<Site> {
  constructor(private db: DatabaseService) {}
  
  async create(siteData: Omit<Site, 'id'>): Promise<Site> {
    // Type-safe CRUD operations with validation
  }
  
  async getByIdentifier(identifier: string): Promise<Site | null> {
    // Loads complete site with monitors and history
  }
}
```

### ⚡ Service Composition Pattern

```typescript
// Application Service orchestrates all other services
class ApplicationService {
  constructor(
    private windowService: WindowService,
    private ipcService: IpcService,
    private notificationService: NotificationService,
    private autoUpdaterService: AutoUpdaterService,
    private uptimeMonitor: UptimeMonitor
  ) {}

  async initialize(): Promise<void> {
    // Coordinated service initialization
    await this.windowService.initialize();
    await this.ipcService.initialize();
    await this.uptimeMonitor.initialize();
    // Event wiring between services
  }
}
```

### 📊 Factory Pattern for Monitors

```typescript
class MonitorFactory {
  static getMonitor(type: MonitorType): IMonitor {
    switch (type) {
      case 'http':
        return new HttpMonitor();
      case 'port':
        return new PortMonitor();
      default:
        throw new Error(`Unknown monitor type: ${type}`);
    }
  }
}

interface IMonitor {
  check(config: MonitorConfig): Promise<MonitorResult>;
}
```

---

## ⚛️ Frontend Architecture

The frontend follows **React patterns** with **custom hooks** and **component composition**:

### 🎭 Component Architecture

```
src/
├── App.tsx                          # Main application component
├── main.tsx                         # React entry point
├── store.ts                         # Zustand state management
├── components/                      # UI component library
│   ├── common/                      # Reusable components
│   │   ├── StatusBadge.tsx          # Status indicators
│   │   ├── HistoryChart.tsx         # Data visualization
│   │   └── index.ts
│   ├── Dashboard/                   # Main dashboard components
│   │   ├── SiteList/                # Site list container
│   │   └── SiteCard/                # Individual site cards
│   │       ├── index.tsx            # Main card component
│   │       ├── SiteCardHeader.tsx   # Card header
│   │       ├── SiteCardMetrics.tsx  # Metrics display
│   │       ├── SiteCardHistory.tsx  # History visualization
│   │       ├── SiteCardFooter.tsx   # Action buttons
│   │       └── components/          # Card sub-components
│   ├── SiteDetails/                 # Detailed site view
│   │   ├── SiteDetails.tsx          # Main details container
│   │   ├── SiteDetailsHeader.tsx    # Details header
│   │   ├── SiteDetailsNavigation.tsx # Tab navigation
│   │   └── tabs/                    # Detail tabs
│   │       ├── OverviewTab.tsx      # Overview metrics
│   │       ├── AnalyticsTab.tsx     # Analytics & charts
│   │       ├── HistoryTab.tsx       # History management
│   │       ├── SettingsTab.tsx      # Site configuration
│   │       └── index.ts
│   ├── AddSiteForm/                 # Site creation form
│   │   ├── AddSiteForm.tsx          # Main form component
│   │   ├── FormFields.tsx           # Form field components
│   │   ├── Submit.tsx               # Form submission logic
│   │   └── useAddSiteForm.ts        # Form state management
│   ├── Settings/                    # Application settings
│   │   └── Settings.tsx
│   └── Header/                      # Application header
│       ├── Header.tsx
│       └── Header.css
├── hooks/                           # Custom React hooks
│   ├── useBackendFocusSync.ts       # Backend sync on focus
│   └── site/                        # Site-specific hooks
│       ├── useSite.ts               # Composite site hook
│       ├── useSiteDetails.ts        # Site details logic
│       ├── useSiteActions.ts        # Site action handlers
│       ├── useSiteMonitor.ts        # Monitor management
│       ├── useSiteStats.ts          # Statistics calculation
│       ├── useSiteAnalytics.ts      # Analytics data
│       └── index.ts
├── services/                        # Frontend services
│   ├── logger.ts                    # Client-side logging
│   └── chartConfig.ts               # Chart configuration service
├── theme/                           # Theme system
│   ├── ThemeManager.ts              # Theme management singleton
│   ├── useTheme.ts                  # Theme React hook
│   ├── components.tsx               # Themed component library
│   ├── components.css               # Theme CSS properties
│   ├── themes.ts                    # Theme definitions
│   └── types.ts                     # Theme TypeScript types
├── utils/                           # Utility functions
│   ├── time.ts                      # Time formatting utilities
│   ├── status.ts                    # Status formatting utilities
│   └── data/
│       └── generateUuid.ts          # UUID generation
├── types.ts                         # Shared TypeScript types
├── constants.ts                     # Application constants
└── index.css                        # Global styles
```

### 🎣 Custom Hook Pattern

```typescript
// Composite Hook Pattern (mirrors backend service composition)
export function useSite(site: Site) {
  // Compose multiple specialized hooks
  const monitorData = useSiteMonitor(site);
  const stats = useSiteStats(monitorData.filteredHistory);
  const actions = useSiteActions(site, monitorData.monitor);
  
  // Return unified interface
  return {
    ...monitorData,
    ...stats,
    ...actions,
    isLoading: useStore(s => s.isLoading)
  };
}

// Specialized hooks for specific concerns
function useSiteActions(site: Site, monitor: Monitor) {
  const { checkSiteNow, deleteSite } = useStore();
  
  const handleCheckNow = useCallback(async () => {
    await checkSiteNow(site.identifier, monitor.id);
  }, [site.identifier, monitor.id, checkSiteNow]);
  
  return { handleCheckNow, handleDelete: ... };
}
```

### 🎨 Theme System Architecture

```typescript
// Theme Provider Pattern
interface Theme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
  isDark: boolean;
}

// Theme Hook Integration
function useTheme() {
  const { settings, updateSettings } = useStore();
  const [currentTheme, setCurrentTheme] = useState<Theme>();
  
  const setTheme = (themeName: ThemeName) => {
    updateSettings({ theme: themeName });
  };
  
  return { currentTheme, setTheme, isDark: currentTheme.isDark };
}

// Themed Component Library
function ThemedBox({ variant, padding, children, ...props }) {
  const { currentTheme } = useTheme();
  const styles = getBoxStyles(variant, padding, currentTheme);
  
  return <div style={styles} {...props}>{children}</div>;
}
```

### 📦 State Management Architecture

```typescript
// Zustand Store with Persistence
interface AppState {
  // Core data
  sites: Site[];
  settings: AppSettings;
  
  // UI state (not persisted)
  showSettings: boolean;
  selectedSiteId: string | undefined;
  showSiteDetails: boolean;
  
  // Error handling
  lastError: string | undefined;
  isLoading: boolean;
  
  // Actions
  initializeApp: () => Promise<void>;
  createSite: (siteData: Omit<Site, 'id'>) => Promise<void>;
  deleteSite: (identifier: string) => Promise<void>;
  // ... other actions
}

// Store usage pattern
const {
  sites,
  createSite,
  setError,
  isLoading
} = useStore();
```

---

## 🔄 Data Flow & Communication

### 📡 IPC Communication Architecture

```
Frontend (Renderer Process)
         ↕ IPC
Backend (Main Process)
         ↕ SQLite
Database Storage
```

#### IPC API Organization

```typescript
// Preload.ts - Domain-organized API
window.electronAPI = {
  // Site management
  siteAPI: {
    getSites: () => ipcRenderer.invoke('get-sites'),
    addSite: (site) => ipcRenderer.invoke('add-site', site),
    updateSite: (id, updates) => ipcRenderer.invoke('update-site', id, updates),
    removeSite: (id) => ipcRenderer.invoke('remove-site', id),
    checkSiteNow: (siteId, monitorId) => ipcRenderer.invoke('check-site-now', siteId, monitorId)
  },
  
  // Monitoring controls
  monitoringAPI: {
    startMonitoringForSite: (siteId, monitorId) => ipcRenderer.invoke('start-monitoring-for-site', siteId, monitorId),
    stopMonitoringForSite: (siteId, monitorId) => ipcRenderer.invoke('stop-monitoring-for-site', siteId, monitorId)
  },
  
  // Events
  eventsAPI: {
    onStatusUpdate: (callback) => ipcRenderer.on('status-update', callback),
    removeAllListeners: (event) => ipcRenderer.removeAllListeners(event)
  }
};
```

### ⚡ Real-Time Updates

```typescript
// Backend: Event emission
class UptimeMonitor extends EventEmitter {
  async checkMonitor(monitorId: string) {
    const result = await this.performCheck(monitorId);
    
    // Update database
    await this.historyRepository.insert(result);
    
    // Get fresh site data for frontend
    const updatedSite = await this.siteRepository.getByIdentifier(siteId);
    
    // Emit real-time update
    this.emit('status-update', { site: updatedSite });
  }
}

// Frontend: Optimized incremental updates
const subscribeToStatusUpdates = (callback) => {
  window.electronAPI.onStatusUpdate((update) => {
    // Smart incremental update - only update changed site
    const updatedSites = state.sites.map(site => 
      site.identifier === update.site.identifier 
        ? { ...update.site }  // Use fresh data from backend
        : site               // Keep unchanged
    );
    
    setState({ sites: updatedSites });
    callback(update);
  });
};
```

### 🗄️ Database Architecture

```sql
-- SQLite Schema
CREATE TABLE sites (
  identifier TEXT PRIMARY KEY,
  name TEXT,
  monitoring BOOLEAN DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE monitors (
  id TEXT PRIMARY KEY,
  site_identifier TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('http', 'port')),
  url TEXT,
  host TEXT,
  port INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('up', 'down', 'pending')),
  response_time INTEGER,
  last_checked INTEGER,
  monitoring BOOLEAN DEFAULT 1,
  check_interval INTEGER DEFAULT 60000,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (site_identifier) REFERENCES sites (identifier) ON DELETE CASCADE
);

CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monitor_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('up', 'down')),
  response_time INTEGER,
  FOREIGN KEY (monitor_id) REFERENCES monitors (id) ON DELETE CASCADE
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 🏗️ File Structure

### 📂 Complete Project Structure

```
uptime-watcher/
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── tailwind.config.js               # TailwindCSS configuration
├── electron/                        # Backend (Main process)
│   ├── main.ts                      # Electron main entry
│   ├── preload.ts                   # IPC bridge
│   ├── uptimeMonitor.ts             # Legacy monitor (refactored)
│   ├── types.ts                     # Backend types
│   ├── utils.ts                     # Backend utilities
│   ├── services/                    # Service layer
│   │   ├── application/             # App coordination
│   │   ├── database/                # Data layer
│   │   ├── monitoring/              # Core monitoring
│   │   ├── ipc/                     # IPC handlers
│   │   ├── window/                  # Window management
│   │   ├── notifications/           # System notifications
│   │   └── updater/                 # Auto-updater
│   └── utils/                       # Backend utilities
│       ├── logger.ts                # Centralized logging
│       └── retry.ts                 # Retry utilities
├── src/                             # Frontend (Renderer process)
│   ├── App.tsx                      # Main React component
│   ├── main.tsx                     # React entry point
│   ├── store.ts                     # Zustand state management
│   ├── types.ts                     # Frontend types
│   ├── constants.ts                 # App constants
│   ├── components/                  # React components
│   ├── hooks/                       # Custom React hooks
│   ├── services/                    # Frontend services
│   ├── theme/                       # Theme system
│   ├── utils/                       # Frontend utilities
│   └── index.css                    # Global styles
├── public/                          # Static assets
│   └── node-sqlite3-wasm.wasm       # SQLite WebAssembly
├── dist-electron/                   # Built backend files
├── docs/                            # Documentation
│   ├── BackendRafactor.md           # Refactoring documentation
│   ├── Project-Architecture-Guide.md # This file
│   └── instructions/                # Development guides
├── icons/                           # Application icons
├── release/                         # Built application packages
└── scripts/                         # Build scripts
    └── download-sqlite3-wasm.mjs    # SQLite WASM download
```

---

## 🎯 Development Patterns

### 🔧 Service Development Pattern

```typescript
// 1. Define service interface
interface IMonitoringService {
  startMonitoring(siteId: string, monitorId: string): Promise<void>;
  stopMonitoring(siteId: string, monitorId: string): Promise<void>;
  checkMonitor(monitorId: string): Promise<MonitorResult>;
}

// 2. Implement service with dependencies
class MonitoringService implements IMonitoringService {
  constructor(
    private scheduler: MonitorScheduler,
    private monitorFactory: MonitorFactory,
    private historyRepository: HistoryRepository
  ) {}
  
  async checkMonitor(monitorId: string): Promise<MonitorResult> {
    // Implementation with proper error handling and logging
  }
}

// 3. Register in service container
class ServiceContainer {
  private services = new Map();
  
  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }
  
  get<T>(key: string): T {
    return this.services.get(key)();
  }
}
```

### ⚛️ Component Development Pattern

```typescript
// 1. Define component props interface
interface SiteCardProps {
  site: Site;
  onSelect?: (site: Site) => void;
  onCheck?: (siteId: string, monitorId: string) => void;
}

// 2. Use custom hooks for logic
function SiteCard({ site, onSelect, onCheck }: SiteCardProps) {
  // Extract business logic to custom hooks
  const {
    selectedMonitor,
    stats,
    handleCheckNow,
    handleMonitorChange
  } = useSite(site);
  
  const { getStatusColor } = useTheme();
  
  // Render with themed components
  return (
    <ThemedBox variant="elevated" padding="lg">
      <ThemedText variant="primary" size="lg">
        {site.name}
      </ThemedText>
      <StatusIndicator 
        status={selectedMonitor.status}
        color={getStatusColor(selectedMonitor.status)}
      />
    </ThemedBox>
  );
}

// 3. Export with memo for performance
export default React.memo(SiteCard);
```

### 🎣 Hook Development Pattern

```typescript
// 1. Single responsibility hooks
function useSiteMonitor(site: Site) {
  const { getSelectedMonitorId } = useStore();
  
  const selectedMonitorId = getSelectedMonitorId(site.identifier);
  const selectedMonitor = useMemo(() => 
    site.monitors.find(m => m.id === selectedMonitorId) || site.monitors[0],
    [site.monitors, selectedMonitorId]
  );
  
  return { selectedMonitor, selectedMonitorId };
}

// 2. Composite hooks that combine multiple concerns
function useSite(site: Site) {
  const monitorData = useSiteMonitor(site);
  const stats = useSiteStats(monitorData.selectedMonitor);
  const actions = useSiteActions(site, monitorData.selectedMonitor);
  
  return {
    ...monitorData,
    ...stats,
    ...actions
  };
}
```

---

## 🚀 Performance Architecture

### ⚡ Frontend Performance Optimizations

#### Smart Re-rendering
```typescript
// Memoized components prevent unnecessary re-renders
const SiteCard = React.memo(({ site }) => {
  const { stats } = useSiteStats(site);
  return <div>{/* Component JSX */}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison for shallow equality
  return prevProps.site.identifier === nextProps.site.identifier &&
         prevProps.site.monitors.length === nextProps.site.monitors.length;
});

// Optimized state selectors
const { sites } = useStore(state => ({
  sites: state.sites  // Only subscribe to sites, not entire store
}));
```

#### Incremental Updates
```typescript
// Backend sends complete updated site data
const handleStatusUpdate = (update: StatusUpdate) => {
  // Efficient update: only replace the changed site
  const updatedSites = state.sites.map(site => 
    site.identifier === update.site.identifier 
      ? { ...update.site }  // Fresh data with all monitors/history
      : site               // Unchanged sites remain same reference
  );
  
  setState({ sites: updatedSites });
};
```

### 🗄️ Backend Performance Optimizations

#### Database Query Optimization
```typescript
class SiteRepository {
  async getByIdentifier(identifier: string): Promise<Site | null> {
    // Single optimized query with JOINs instead of multiple queries
    const sql = `
      SELECT 
        s.*,
        m.id as monitor_id, m.type, m.status, m.response_time,
        h.timestamp, h.status as history_status, h.response_time as history_response_time
      FROM sites s
      LEFT JOIN monitors m ON s.identifier = m.site_identifier
      LEFT JOIN history h ON m.id = h.monitor_id
      WHERE s.identifier = ?
      ORDER BY h.timestamp DESC
      LIMIT 500
    `;
    
    // Transform flat result into nested Site object
    return this.transformToSiteObject(result);
  }
}
```

#### Concurrent Operations
```typescript
class MonitorScheduler {
  async startMonitoring(): Promise<void> {
    const sites = await this.siteRepository.findAll();
    
    // Start monitoring for all sites concurrently
    await Promise.allSettled(
      sites.flatMap(site => 
        site.monitors.map(monitor => 
          this.startMonitoringForMonitor(monitor)
        )
      )
    );
  }
}
```

---

## 🔒 Security Architecture

### 🛡️ Electron Security

#### Context Isolation
```typescript
// preload.ts - Secure IPC bridge
const electronAPI = {
  // Only expose necessary APIs
  getSites: () => ipcRenderer.invoke('get-sites'),
  addSite: (site: Omit<Site, 'id'>) => ipcRenderer.invoke('add-site', site),
  
  // Validate and sanitize inputs
  checkSiteNow: (siteId: string, monitorId: string) => {
    if (typeof siteId !== 'string' || typeof monitorId !== 'string') {
      throw new Error('Invalid parameters');
    }
    return ipcRenderer.invoke('check-site-now', siteId, monitorId);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

#### Input Validation
```typescript
class SiteRepository {
  async create(siteData: Omit<Site, 'identifier'>): Promise<Site> {
    // Validate input before database operations
    if (!siteData.name?.trim()) {
      throw new Error('Site name is required');
    }
    
    if (siteData.monitors?.some(m => !['http', 'port'].includes(m.type))) {
      throw new Error('Invalid monitor type');
    }
    
    // Sanitize input
    const sanitizedData = {
      ...siteData,
      name: siteData.name.trim()
    };
    
    return this.insertSite(sanitizedData);
  }
}
```

### 🔐 Data Security

#### SQLite Security
```typescript
class DatabaseService {
  private async initializeDatabase(): Promise<void> {
    // Use parameterized queries to prevent SQL injection
    const queries = [
      'PRAGMA foreign_keys = ON',           // Enforce referential integrity
      'PRAGMA journal_mode = WAL',         // Write-ahead logging for concurrency
      'PRAGMA synchronous = NORMAL',       // Balance performance and safety
      'PRAGMA cache_size = -64000',        // 64MB cache
      'PRAGMA temp_store = MEMORY'         // Temporary tables in memory
    ];
    
    for (const query of queries) {
      await this.db.exec(query);
    }
  }
}
```

---

## 🚀 Deployment Architecture

### 📦 Build Pipeline

```typescript
// vite.config.ts - Production build configuration
export default defineConfig({
  build: {
    target: 'chrome100',  // Modern Chromium target
    minify: 'esbuild',    // Fast minification
    sourcemap: false,     // No source maps in production
    rollupOptions: {
      external: ['electron'], // Externalize Electron APIs
    }
  },
  
  // Optimize for Electron renderer
  base: './',
  publicDir: 'public',
  
  // Bundle analysis
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});
```

### 🏗️ Electron Builder Configuration

```json
{
  "build": {
    "appId": "io.github.uptimewatcher",
    "productName": "Uptime Watcher",
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "public/node-sqlite3-wasm.wasm",
        "to": "node-sqlite3-wasm.wasm"
      }
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "msi",
          "arch": ["x64"]
        }
      ]
    },
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ]
    }
  }
}
```

### 🔄 Auto-Update Architecture

```typescript
class AutoUpdaterService {
  constructor() {
    // Configure auto-updater
    autoUpdater.checkForUpdatesAndNotify();
    
    // Handle update events
    autoUpdater.on('update-available', () => {
      this.notificationService.notify('Update available', 'Downloading...');
    });
    
    autoUpdater.on('update-downloaded', () => {
      this.windowService.showUpdateDialog();
    });
  }
  
  async checkForUpdates(): Promise<void> {
    if (isDev()) return;  // Skip in development
    
    try {
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      logger.error('Update check failed', error);
    }
  }
}
```

---

## 📈 Monitoring & Observability

### 📊 Application Metrics

```typescript
// Performance monitoring
class PerformanceMonitor {
  static measureOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - start;
      logger.performance(operation, duration);
      
      // Alert on slow operations
      if (duration > 5000) {
        logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
      }
    });
  }
}

// Usage in services
class SiteRepository {
  async findAll(): Promise<Site[]> {
    return PerformanceMonitor.measureOperation('SiteRepository.findAll', async () => {
      return this.db.all('SELECT * FROM sites');
    });
  }
}
```

### 🔍 Error Tracking

```typescript
// Centralized error handling
class ErrorReporter {
  static reportError(error: Error, context: string): void {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      version: app.getVersion(),
      platform: os.platform(),
      arch: os.arch()
    };
    
    logger.error('Application error', errorReport);
    
    // In production, could send to error tracking service
    if (!isDev()) {
      // sendToErrorTrackingService(errorReport);
    }
  }
}
```

---

## 🎉 Summary

The Uptime Watcher architecture provides:

### ✅ **Backend Excellence**
- **Modular Service Architecture** with clear separation of concerns
- **Repository Pattern** for clean data access
- **Factory Pattern** for extensible monitor types
- **Event-Driven Updates** for real-time UI synchronization
- **Type Safety** throughout the entire backend

### ✅ **Frontend Excellence**
- **React + Hooks** with custom hook composition
- **Zustand State Management** with persistence
- **Sophisticated Theme System** with automatic switching
- **Component Library** with consistent design patterns
- **Performance Optimizations** with smart re-rendering

### ✅ **Integration Excellence**
- **IPC Architecture** with domain-organized APIs
- **Real-Time Updates** with optimized incremental synchronization
- **Error Handling** with comprehensive user feedback
- **Security** with input validation and secure IPC bridges

### ✅ **Production Ready**
- **Build Pipeline** with optimized bundling
- **Auto-Updates** with seamless user experience
- **Cross-Platform** support for Windows, macOS, and Linux
- **Performance Monitoring** with centralized logging

This architecture provides a solid foundation for:
- **Maintainability**: Clear separation of concerns and modular design
- **Scalability**: Extensible patterns for new features
- **Performance**: Optimized data flow and rendering
- **Security**: Secure IPC and input validation
- **User Experience**: Real-time updates and responsive UI

The codebase successfully demonstrates enterprise-grade architecture patterns adapted for desktop application development.

## See Also

- [📚 API Reference](../api/README.md) - Complete module and service documentation
- [🚀 Developer Guide](../guides/Developer-Guide.md) - Development setup and workflow
- [🔗 IPC API Reference](../guides/IPC-API-Reference.md) - Inter-process communication details
- [🎨 Theme Usage Guide](../guides/Theme-Usage.md) - Theme system implementation
- [🧩 Component Documentation](../component-docs/Dashboard.md) - UI component architecture
- [🔄 Refactoring Documents](../refactoring/BackendRafactor.copilotmd) - Architecture evolution

---

> **Related:** [📖 Documentation Home](../README.md) | [🏗️ All Architecture Docs](../README.md#architecture)
