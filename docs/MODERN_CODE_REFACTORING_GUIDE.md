# Modern Code Refactoring Guide - Exact Replacements

This document provides specific, actionable before/after code blocks for modernizing the Uptime Watcher codebase with idiomatic patterns. Each section shows exactly what code to replace and what to replace it with.

## Table of Contents

1. [Backend Modernization](#backend-modernization)
   - [Replace Singleton Pattern with Dependency Injection](#replace-singleton-pattern-with-dependency-injection)
   - [Implement Custom Error Classes](#implement-custom-error-classes)
   - [Add Comprehensive Error Handling](#add-comprehensive-error-handling)
   - [Implement Event-Driven Architecture](#implement-event-driven-architecture)

2. [Frontend Modernization](#frontend-modernization)
   - [Split Monolithic Zustand Store](#split-monolithic-zustand-store)
   - [Add Error Boundaries](#add-error-boundaries)
   - [Implement Custom Hooks for Complex Logic](#implement-custom-hooks-for-complex-logic)
   - [Replace Manual Form Management with React Hook Form](#replace-manual-form-management-with-react-hook-form)
   - [Add Proper Memoization](#add-proper-memoization)

3. [Configuration and Tooling](#configuration-and-tooling)
   - [Enhance TypeScript Configuration](#enhance-typescript-configuration)
   - [Improve Vite Configuration](#improve-vite-configuration)

---

## Backend Modernization

### Replace Singleton Pattern with Dependency Injection

**File: `electron/services/database/DatabaseService.ts`**

**BEFORE:**

```typescript
export class DatabaseService {
    private static instance: DatabaseService;
    private _db: Database | undefined = undefined;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
}
```

**AFTER:**

```typescript
export interface IDatabaseService {
    initialize(): Promise<Database>;
    getDatabase(): Database;
    close(): Promise<void>;
    downloadBackup(): Promise<{ buffer: Buffer; fileName: string }>;
}

export class DatabaseService implements IDatabaseService {
    private _db: Database | undefined = undefined;

    constructor() {}

    public async initialize(): Promise<Database> {
        if (this._db) {
            return this._db;
        }

        try {
            const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
            logger.info(`[DatabaseService] Initializing SQLite DB at: ${dbPath}`);

            this._db = new Database(dbPath);
            await this.createTables();

            logger.info("[DatabaseService] Database initialized successfully");
            return this._db;
        } catch (error) {
            logger.error("[DatabaseService] Failed to initialize database", error);
            throw new DatabaseError("Failed to initialize database", { cause: error });
        }
    }

    // ... rest of the methods remain the same
}
```

**New File: `electron/services/ServiceContainer.ts`**

```typescript
import { DatabaseService, IDatabaseService } from "./database/DatabaseService";
import { SiteRepository, ISiteRepository } from "./database/SiteRepository";
import { HistoryRepository, IHistoryRepository } from "./database/HistoryRepository";

export interface IServiceContainer {
    getDatabaseService(): IDatabaseService;
    getSiteRepository(): ISiteRepository;
    getHistoryRepository(): IHistoryRepository;
}

export class ServiceContainer implements IServiceContainer {
    private databaseService: IDatabaseService;
    private siteRepository: ISiteRepository;
    private historyRepository: IHistoryRepository;

    constructor() {
        this.databaseService = new DatabaseService();
        this.siteRepository = new SiteRepository(this.databaseService);
        this.historyRepository = new HistoryRepository(this.databaseService);
    }

    getDatabaseService(): IDatabaseService {
        return this.databaseService;
    }

    getSiteRepository(): ISiteRepository {
        return this.siteRepository;
    }

    getHistoryRepository(): IHistoryRepository {
        return this.historyRepository;
    }
}
```

**Update `electron/services/application/ApplicationService.ts`:**

**BEFORE:**

```typescript
export class ApplicationService {
    private readonly windowService: WindowService;
    private readonly ipcService: IpcService;
    private readonly notificationService: NotificationService;
    private readonly autoUpdaterService: AutoUpdaterService;
    private readonly uptimeMonitor: UptimeMonitor;

    constructor() {
        logger.info("[ApplicationService] Initializing application services");

        // Initialize core services
        this.windowService = new WindowService();
        this.notificationService = new NotificationService();
        this.autoUpdaterService = new AutoUpdaterService();
        this.uptimeMonitor = new UptimeMonitor();

        // Initialize IPC with dependencies
        this.ipcService = new IpcService(this.uptimeMonitor, this.autoUpdaterService);
```

**AFTER:**

```typescript
import { ServiceContainer, IServiceContainer } from "../ServiceContainer";

export class ApplicationService {
    private readonly windowService: WindowService;
    private readonly ipcService: IpcService;
    private readonly notificationService: NotificationService;
    private readonly autoUpdaterService: AutoUpdaterService;
    private readonly uptimeMonitor: UptimeMonitor;
    private readonly serviceContainer: IServiceContainer;

    constructor() {
        logger.info("[ApplicationService] Initializing application services");

        // Initialize service container with dependencies
        this.serviceContainer = new ServiceContainer();
        
        // Initialize core services with dependencies
        this.windowService = new WindowService();
        this.notificationService = new NotificationService();
        this.autoUpdaterService = new AutoUpdaterService();
        this.uptimeMonitor = new UptimeMonitor(
            this.serviceContainer.getSiteRepository(),
            this.serviceContainer.getHistoryRepository()
        );

        // Initialize IPC with dependencies
        this.ipcService = new IpcService(
            this.uptimeMonitor, 
            this.autoUpdaterService,
            this.serviceContainer
        );
```

### Implement Custom Error Classes

**New File: `electron/errors/index.ts`**

```typescript
export class BaseError extends Error {
    public readonly code: string;
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        options: { code?: string; context?: Record<string, unknown>; cause?: Error } = {}
    ) {
        super(message, { cause: options.cause });
        this.name = this.constructor.name;
        this.code = options.code || this.constructor.name;
        this.context = options.context;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class DatabaseError extends BaseError {
    constructor(message: string, options: { context?: Record<string, unknown>; cause?: Error } = {}) {
        super(message, { ...options, code: 'DATABASE_ERROR' });
    }
}

export class MonitoringError extends BaseError {
    constructor(message: string, options: { context?: Record<string, unknown>; cause?: Error } = {}) {
        super(message, { ...options, code: 'MONITORING_ERROR' });
    }
}

export class ValidationError extends BaseError {
    constructor(message: string, options: { context?: Record<string, unknown>; cause?: Error } = {}) {
        super(message, { ...options, code: 'VALIDATION_ERROR' });
    }
}

export class NetworkError extends BaseError {
    constructor(message: string, options: { context?: Record<string, unknown>; cause?: Error } = {}) {
        super(message, { ...options, code: 'NETWORK_ERROR' });
    }
}
```

### Add Comprehensive Error Handling

**File: `electron/services/monitoring/HttpMonitor.ts`**

**BEFORE (typical monitoring check method):**

```typescript
public async check(): Promise<MonitorResult> {
    const startTime = Date.now();
    
    try {
        const response = await fetch(this.url, {
            method: 'GET',
            timeout: this.timeout
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            return {
                status: 'up',
                responseTime,
                timestamp: Date.now()
            };
        } else {
            return {
                status: 'down',
                responseTime,
                timestamp: Date.now(),
                error: `HTTP ${response.status}`
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        return {
            status: 'down',
            responseTime,
            timestamp: Date.now(),
            error: error.message
        };
    }
}
```

**AFTER:**

```typescript
import { NetworkError, MonitoringError } from '../../errors';

public async check(): Promise<MonitorResult> {
    const startTime = Date.now();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(this.url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Uptime-Watcher/1.0'
            }
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            return {
                status: 'up',
                responseTime,
                timestamp: Date.now(),
                details: {
                    statusCode: response.status,
                    statusText: response.statusText
                }
            };
        } else {
            throw new NetworkError(`HTTP request failed`, {
                context: {
                    url: this.url,
                    statusCode: response.status,
                    statusText: response.statusText,
                    responseTime
                }
            });
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        if (error instanceof NetworkError) {
            return {
                status: 'down',
                responseTime,
                timestamp: Date.now(),
                error: error.message,
                details: error.context
            };
        }
        
        if (error.name === 'AbortError') {
            throw new MonitoringError(`Request timeout after ${this.timeout}ms`, {
                context: { url: this.url, timeout: this.timeout, responseTime }
            });
        }
        
        throw new MonitoringError(`Monitor check failed`, {
            context: { url: this.url, responseTime },
            cause: error
        });
    }
}
```

### Implement Event-Driven Architecture

**New File: `electron/events/EventBus.ts`**

```typescript
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface IEventBus {
    emit<T = any>(event: string, data: T): boolean;
    on<T = any>(event: string, listener: (data: T) => void): void;
    off<T = any>(event: string, listener: (data: T) => void): void;
    once<T = any>(event: string, listener: (data: T) => void): void;
}

export class EventBus extends EventEmitter implements IEventBus {
    private static instance: EventBus;

    private constructor() {
        super();
        this.setMaxListeners(100); // Increase default limit
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public emit<T = any>(event: string, data: T): boolean {
        logger.debug(`[EventBus] Emitting event: ${event}`, { data });
        return super.emit(event, data);
    }

    public on<T = any>(event: string, listener: (data: T) => void): void {
        logger.debug(`[EventBus] Adding listener for event: ${event}`);
        super.on(event, listener);
    }

    public off<T = any>(event: string, listener: (data: T) => void): void {
        logger.debug(`[EventBus] Removing listener for event: ${event}`);
        super.off(event, listener);
    }

    public once<T = any>(event: string, listener: (data: T) => void): void {
        logger.debug(`[EventBus] Adding one-time listener for event: ${event}`);
        super.once(event, listener);
    }
}

// Event type definitions
export interface StatusUpdateEvent {
    siteId: string;
    monitorId: string;
    status: 'up' | 'down' | 'pending';
    responseTime?: number;
    timestamp: number;
}

export interface MonitorStartedEvent {
    siteId: string;
    monitorId: string;
    interval: number;
}

export interface MonitorStoppedEvent {
    siteId: string;
    monitorId: string;
}

export interface DatabaseErrorEvent {
    operation: string;
    error: Error;
    context?: Record<string, unknown>;
}
```

---

## Frontend Modernization

### Split Monolithic Zustand Store

**Current `src/store.ts` (611 lines) needs to be split into focused stores:**

**New File: `src/stores/siteStore.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Site, Monitor } from '../types';

interface SiteState {
    sites: Site[];
    selectedSiteId: string | undefined;
    selectedMonitorIds: Record<string, string>;
    
    // Actions
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    removeSite: (identifier: string) => void;
    setSelectedSite: (siteId: string | undefined) => void;
    setSelectedMonitorId: (siteId: string, monitorId: string) => void;
    getSelectedMonitorId: (siteId: string) => string | undefined;
    
    // Selectors
    getSelectedSite: () => Site | undefined;
    getSiteByIdentifier: (identifier: string) => Site | undefined;
}

export const useSiteStore = create<SiteState>()(
    persist(
        (set, get) => ({
            sites: [],
            selectedSiteId: undefined,
            selectedMonitorIds: {},
            
            setSites: (sites) => set({ sites }),
            
            addSite: (site) => set((state) => ({ 
                sites: [...state.sites, site] 
            })),
            
            removeSite: (identifier) => set((state) => ({
                sites: state.sites.filter(site => site.identifier !== identifier),
                selectedSiteId: state.selectedSiteId === identifier 
                    ? undefined 
                    : state.selectedSiteId,
            })),
            
            setSelectedSite: (siteId) => set({ selectedSiteId: siteId }),
            
            setSelectedMonitorId: (siteId, monitorId) => set((state) => ({
                selectedMonitorIds: {
                    ...state.selectedMonitorIds,
                    [siteId]: monitorId,
                },
            })),
            
            getSelectedMonitorId: (siteId) => {
                const ids = get().selectedMonitorIds;
                return Object.prototype.hasOwnProperty.call(ids, siteId) 
                    ? ids[siteId] 
                    : undefined;
            },
            
            getSelectedSite: () => {
                const { selectedSiteId, sites } = get();
                return selectedSiteId 
                    ? sites.find(s => s.identifier === selectedSiteId) 
                    : undefined;
            },
            
            getSiteByIdentifier: (identifier) => {
                return get().sites.find(s => s.identifier === identifier);
            },
        }),
        {
            name: 'uptime-watcher-sites',
            partialize: (state) => ({
                selectedMonitorIds: state.selectedMonitorIds,
                // Don't persist sites - they come from backend
            }),
        }
    )
);
```

**New File: `src/stores/uiStore.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChartTimeRange = '1h' | '24h' | '7d' | '30d';

interface UiState {
    // Modal states
    showSettings: boolean;
    showSiteDetails: boolean;
    
    // Site details UI state
    activeSiteDetailsTab: string;
    siteDetailsChartTimeRange: ChartTimeRange;
    showAdvancedMetrics: boolean;
    
    // Loading and error states
    isLoading: boolean;
    lastError: string | undefined;
    
    // Actions
    setShowSettings: (show: boolean) => void;
    setShowSiteDetails: (show: boolean) => void;
    setActiveSiteDetailsTab: (tab: string) => void;
    setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;
    setShowAdvancedMetrics: (show: boolean) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | undefined) => void;
    clearError: () => void;
}

export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            // Initial state
            showSettings: false,
            showSiteDetails: false,
            activeSiteDetailsTab: 'overview',
            siteDetailsChartTimeRange: '24h',
            showAdvancedMetrics: false,
            isLoading: false,
            lastError: undefined,
            
            // Actions
            setShowSettings: (show) => set({ showSettings: show }),
            setShowSiteDetails: (show) => set({ showSiteDetails: show }),
            setActiveSiteDetailsTab: (tab) => set({ activeSiteDetailsTab: tab }),
            setSiteDetailsChartTimeRange: (range) => set({ siteDetailsChartTimeRange: range }),
            setShowAdvancedMetrics: (show) => set({ showAdvancedMetrics: show }),
            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ lastError: error }),
            clearError: () => set({ lastError: undefined }),
        }),
        {
            name: 'uptime-watcher-ui',
            partialize: (state) => ({
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                showAdvancedMetrics: state.showAdvancedMetrics,
                // Don't persist loading states, errors, or modal states
            }),
        }
    )
);
```

**New File: `src/stores/settingsStore.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeName } from '../theme/types';
import { DEFAULT_HISTORY_LIMIT } from '../constants';

interface AppSettings {
    notifications: boolean;
    autoStart: boolean;
    minimizeToTray: boolean;
    theme: ThemeName;
    soundAlerts: boolean;
    historyLimit: number;
}

interface SettingsState {
    settings: AppSettings;
    
    // Actions
    updateSettings: (settings: Partial<AppSettings>) => void;
    resetSettings: () => void;
}

const defaultSettings: AppSettings = {
    autoStart: false,
    historyLimit: DEFAULT_HISTORY_LIMIT,
    minimizeToTray: true,
    notifications: true,
    soundAlerts: false,
    theme: 'system',
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings },
            })),
            
            resetSettings: () => set({ settings: defaultSettings }),
        }),
        {
            name: 'uptime-watcher-settings',
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
```

**Update components to use new stores:**

**BEFORE:**

```typescript
import { useStore } from '../store';

const { sites, isLoading, lastError, createSite } = useStore();
```

**AFTER:**

```typescript
import { useSiteStore } from '../stores/siteStore';
import { useUiStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';

const sites = useSiteStore(state => state.sites);
const { isLoading, lastError } = useUiStore();
const { settings } = useSettingsStore();
```

### Add Error Boundaries

**New File: `src/components/ErrorBoundary/ErrorBoundary.tsx`**

```typescript
import React, { Component, ReactNode } from 'react';
import { ThemedBox, ThemedText, ThemedButton } from '../../theme/components';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
        });

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ThemedBox className="error-boundary" padding="lg" rounded="lg" surface="base">
                    <div className="space-y-4">
                        <ThemedText size="lg" weight="semibold">
                            🚨 Something went wrong
                        </ThemedText>
                        
                        <ThemedText variant="secondary">
                            An unexpected error occurred. You can try refreshing the page or 
                            contact support if the problem persists.
                        </ThemedText>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4">
                                <summary className="cursor-pointer font-medium">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        
                        <div className="flex gap-2">
                            <ThemedButton variant="primary" onClick={this.handleReset}>
                                Try Again
                            </ThemedButton>
                            
                            <ThemedButton 
                                variant="secondary" 
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </ThemedButton>
                        </div>
                    </div>
                </ThemedBox>
            );
        }

        return this.props.children;
    }
}
```

**New File: `src/hooks/useAsyncError.ts`**

```typescript
import { useCallback, useState } from 'react';

export const useAsyncError = () => {
    const [, setError] = useState();
    
    return useCallback((error: Error) => {
        setError(() => {
            throw error;
        });
    }, []);
};
```

**Update `src/App.tsx` to use error boundaries:**

**BEFORE:**

```tsx
function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </Router>
        </div>
    );
}
```

**AFTER:**

```tsx
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <div className="App">
                <Router>
                    <Routes>
                        <Route path="/" element={
                            <ErrorBoundary>
                                <Dashboard />
                            </ErrorBoundary>
                        } />
                        <Route path="/settings" element={
                            <ErrorBoundary>
                                <Settings />
                            </ErrorBoundary>
                        } />
                    </Routes>
                </Router>
            </div>
        </ErrorBoundary>
    );
}
```

### Implement Custom Hooks for Complex Logic

**New File: `src/hooks/useAsyncOperation.ts`**

```typescript
import { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
}

interface AsyncOperationActions<T> {
    execute: (...args: any[]) => Promise<T>;
    reset: () => void;
}

export const useAsyncOperation = <T>(
    asyncFunction: (...args: any[]) => Promise<T>
): AsyncOperationState<T> & AsyncOperationActions<T> => {
    const [state, setState] = useState<AsyncOperationState<T>>({
        data: null,
        error: null,
        isLoading: false,
    });

    const execute = useCallback(async (...args: any[]) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        try {
            const result = await asyncFunction(...args);
            setState({ data: result, error: null, isLoading: false });
            return result;
        } catch (error) {
            const errorInstance = error instanceof Error ? error : new Error(String(error));
            setState({ data: null, error: errorInstance, isLoading: false });
            throw errorInstance;
        }
    }, [asyncFunction]);

    const reset = useCallback(() => {
        setState({ data: null, error: null, isLoading: false });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
};
```

**New File: `src/hooks/useSiteOperations.ts`**

```typescript
import { useCallback } from 'react';
import { useSiteStore } from '../stores/siteStore';
import { useUiStore } from '../stores/uiStore';
import { useAsyncOperation } from './useAsyncOperation';
import { Site, Monitor } from '../types';

export const useSiteOperations = () => {
    const { setSites, addSite, removeSite } = useSiteStore();
    const { setLoading, setError, clearError } = useUiStore();

    const createSiteOperation = useAsyncOperation(
        async (siteData: Omit<Site, 'id' | 'monitors'> & { monitors?: Monitor[] }) => {
            clearError();
            
            const monitors: Monitor[] = siteData.monitors?.length ? 
                siteData.monitors : 
                [{
                    id: crypto.randomUUID(),
                    type: 'http',
                    status: 'pending',
                    monitoring: true,
                    history: [],
                }];

            const newSite = await window.electronAPI.sites.addSite({
                ...siteData,
                monitors,
            });
            
            addSite(newSite);
            return newSite;
        }
    );

    const deleteSiteOperation = useAsyncOperation(
        async (identifier: string) => {
            clearError();
            
            // Stop all monitors for this site
            const site = useSiteStore.getState().getSiteByIdentifier(identifier);
            if (site) {
                await Promise.all(
                    site.monitors.map(monitor =>
                        window.electronAPI.monitoring.stopMonitoringForSite(
                            identifier, 
                            monitor.id
                        ).catch(err => {
                            console.warn(`Failed to stop monitor ${monitor.id}:`, err);
                        })
                    )
                );
            }
            
            await window.electronAPI.sites.removeSite(identifier);
            removeSite(identifier);
        }
    );

    const syncSitesOperation = useAsyncOperation(
        async () => {
            const sites = await window.electronAPI.sites.getSites();
            setSites(sites);
            return sites;
        }
    );

    const createSite = useCallback(async (siteData: Parameters<typeof createSiteOperation.execute>[0]) => {
        try {
            setLoading(true);
            return await createSiteOperation.execute(siteData);
        } catch (error) {
            setError(`Failed to create site: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [createSiteOperation.execute, setLoading, setError]);

    const deleteSite = useCallback(async (identifier: string) => {
        try {
            setLoading(true);
            await deleteSiteOperation.execute(identifier);
        } catch (error) {
            setError(`Failed to delete site: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [deleteSiteOperation.execute, setLoading, setError]);

    const syncSites = useCallback(async () => {
        try {
            setLoading(true);
            return await syncSitesOperation.execute();
        } catch (error) {
            setError(`Failed to sync sites: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [syncSitesOperation.execute, setLoading, setError]);

    return {
        createSite,
        deleteSite,
        syncSites,
        // Expose operation states for granular loading indicators
        createSiteState: createSiteOperation,
        deleteSiteState: deleteSiteOperation,
        syncSitesState: syncSitesOperation,
    };
};
```

### Replace Manual Form Management with React Hook Form

**Update `src/components/AddSiteForm/AddSiteForm.tsx`:**

First, install dependencies:

```bash
npm install react-hook-form @hookform/resolvers zod
```

**BEFORE (parts of the existing component):**

```tsx
export const AddSiteForm = React.memo(function AddSiteForm() {
    const { addMonitorToSite, clearError, createSite, isLoading, lastError, sites } = useStore();
    const { isDark } = useTheme();

    // Use our custom hook for form state management
    const formState = useAddSiteForm();
    const {
        addMode,
        checkInterval,
        formError,
        host,
        isFormValid,
        monitorType,
        name,
        port,
        resetForm,
        selectedExistingSite,
        // ... many more state variables
    } = formState;

    // Manual form validation and submission
    const onSubmit = useCallback(
        (e: React.FormEvent) =>
            handleSubmit(e, {
                ...formState,
                addMonitorToSite,
                clearError,
                createSite,
                generateUuid,
                logger,
                onSuccess: resetForm,
            }),
        [formState, addMonitorToSite, clearError, createSite, resetForm]
    );
```

**AFTER:**

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const addSiteSchema = z.discriminatedUnion('addMode', [
    z.object({
        addMode: z.literal('new'),
        name: z.string().min(1, 'Site name is required'),
        monitorType: z.enum(['http', 'port']),
        url: z.string().url('Please enter a valid URL').optional(),
        host: z.string().min(1, 'Host is required').optional(),
        port: z.number().min(1).max(65535).optional(),
        checkInterval: z.number().min(30000),
    }),
    z.object({
        addMode: z.literal('existing'),
        selectedExistingSite: z.string().min(1, 'Please select a site'),
        monitorType: z.enum(['http', 'port']),
        url: z.string().url('Please enter a valid URL').optional(),
        host: z.string().min(1, 'Host is required').optional(),
        port: z.number().min(1).max(65535).optional(),
        checkInterval: z.number().min(30000),
    }),
]).refine((data) => {
    if (data.monitorType === 'http') {
        return data.url && data.url.length > 0;
    }
    if (data.monitorType === 'port') {
        return data.host && data.host.length > 0 && data.port && data.port > 0;
    }
    return true;
}, {
    message: "Please provide the required fields for the selected monitor type",
    path: ["monitorType"]
});

type AddSiteFormData = z.infer<typeof addSiteSchema>;

export const AddSiteForm = React.memo(function AddSiteForm() {
    const sites = useSiteStore(state => state.sites);
    const { isLoading, lastError, clearError } = useUiStore();
    const { createSite } = useSiteOperations();
    const { isDark } = useTheme();

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid, isSubmitting }
    } = useForm<AddSiteFormData>({
        resolver: zodResolver(addSiteSchema),
        defaultValues: {
            addMode: 'new',
            monitorType: 'http',
            checkInterval: 300000, // 5 minutes
        },
        mode: 'onChange'
    });

    const addMode = watch('addMode');
    const monitorType = watch('monitorType');

    const onSubmit = handleSubmit(async (data) => {
        try {
            clearError();
            
            if (data.addMode === 'new') {
                const monitors = [{
                    id: crypto.randomUUID(),
                    type: data.monitorType,
                    status: 'pending' as const,
                    monitoring: true,
                    history: [],
                    checkInterval: data.checkInterval,
                    ...(data.monitorType === 'http' && { url: data.url }),
                    ...(data.monitorType === 'port' && { 
                        host: data.host, 
                        port: data.port 
                    }),
                }];

                await createSite({
                    identifier: crypto.randomUUID(),
                    name: data.name,
                    monitors,
                });
            } else {
                // Add monitor to existing site logic
                const monitor = {
                    id: crypto.randomUUID(),
                    type: data.monitorType,
                    status: 'pending' as const,
                    monitoring: true,
                    history: [],
                    checkInterval: data.checkInterval,
                    ...(data.monitorType === 'http' && { url: data.url }),
                    ...(data.monitorType === 'port' && { 
                        host: data.host, 
                        port: data.port 
                    }),
                };

                // Implementation for adding to existing site
                await window.electronAPI.sites.addMonitorToSite(
                    data.selectedExistingSite,
                    monitor
                );
            }
            
            reset(); // Reset form on success
        } catch (error) {
            console.error('Form submission error:', error);
            // Error is handled by the useSiteOperations hook
        }
    });

    return (
        <ThemedBox className="max-w-md mx-auto" padding="lg" rounded="lg" surface="base">
            <form className="space-y-4" onSubmit={onSubmit}>
                {/* Add Mode Toggle */}
                <Controller
                    name="addMode"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            {...field}
                            disabled={isLoading || isSubmitting}
                            id="addMode"
                            label="Add Mode"
                            options={[
                                { label: "Create New Site", value: "new" },
                                { label: "Add to Existing Site", value: "existing" },
                            ]}
                        />
                    )}
                />

                {/* Site Name (only for new site) */}
                {addMode === 'new' && (
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                disabled={isLoading || isSubmitting}
                                id="siteName"
                                label="Site Name"
                                placeholder="My Website"
                                required
                                type="text"
                                error={errors.name?.message}
                            />
                        )}
                    />
                )}

                {/* HTTP Monitor Fields */}
                {monitorType === 'http' && (
                    <Controller
                        name="url"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                disabled={isLoading || isSubmitting}
                                helpText="Enter the full URL including http:// or https://"
                                id="websiteUrl"
                                label="Website URL"
                                placeholder="https://example.com"
                                required
                                type="url"
                                error={errors.url?.message}
                            />
                        )}
                    />
                )}

                <ThemedButton
                    disabled={!isValid || isLoading || isSubmitting}
                    fullWidth
                    loading={isSubmitting}
                    type="submit"
                    variant="primary"
                >
                    {addMode === 'new' ? 'Add Site' : 'Add Monitor'}
                </ThemedButton>
            </form>
        </ThemedBox>
    );
});
```

### Add Proper Memoization

**Update components to use proper memoization:**

**BEFORE (typical component without memoization):**

```tsx
export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
    const { isDark } = useTheme();
    const { deleteSite, setSelectedSite, setShowSiteDetails } = useStore();
    
    const handleViewDetails = () => {
        setSelectedSite(site);
        setShowSiteDetails(true);
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${site.name}?`)) {
            try {
                await deleteSite(site.identifier);
            } catch (error) {
                console.error('Failed to delete site:', error);
            }
        }
    };

    const upMonitors = site.monitors.filter(m => m.status === 'up').length;
    const totalMonitors = site.monitors.length;
    const averageResponseTime = calculateAverageResponseTime(site.monitors);

    return (
        <ThemedBox>
            {/* Component content */}
        </ThemedBox>
    );
};
```

**AFTER:**

```tsx
import React, { useMemo, useCallback } from 'react';

interface SiteCardProps {
    site: Site;
}

const SiteCard: React.FC<SiteCardProps> = React.memo(({ site }) => {
    const { isDark } = useTheme();
    const setSelectedSite = useSiteStore(state => state.setSelectedSite);
    const setShowSiteDetails = useUiStore(state => state.setShowSiteDetails);
    const { deleteSite } = useSiteOperations();
    
    const handleViewDetails = useCallback(() => {
        setSelectedSite(site.identifier);
        setShowSiteDetails(true);
    }, [site.identifier, setSelectedSite, setShowSiteDetails]);

    const handleDelete = useCallback(async () => {
        if (confirm(`Are you sure you want to delete ${site.name}?`)) {
            try {
                await deleteSite(site.identifier);
            } catch (error) {
                console.error('Failed to delete site:', error);
            }
        }
    }, [site.identifier, site.name, deleteSite]);

    const siteStats = useMemo(() => ({
        upMonitors: site.monitors.filter(m => m.status === 'up').length,
        totalMonitors: site.monitors.length,
        averageResponseTime: calculateAverageResponseTime(site.monitors),
    }), [site.monitors]);

    return (
        <ThemedBox>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{site.name}</h3>
                    <p className="text-sm text-gray-600">
                        {siteStats.upMonitors}/{siteStats.totalMonitors} monitors up
                    </p>
                    {siteStats.averageResponseTime && (
                        <p className="text-xs text-gray-500">
                            Avg: {siteStats.averageResponseTime}ms
                        </p>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <ThemedButton
                        onClick={handleViewDetails}
                        size="sm"
                        variant="secondary"
                    >
                        View Details
                    </ThemedButton>
                    
                    <ThemedButton
                        onClick={handleDelete}
                        size="sm"
                        variant="danger"
                    >
                        Delete
                    </ThemedButton>
                </div>
            </div>
        </ThemedBox>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
        prevProps.site.identifier === nextProps.site.identifier &&
        prevProps.site.name === nextProps.site.name &&
        JSON.stringify(prevProps.site.monitors) === JSON.stringify(nextProps.site.monitors)
    );
});

SiteCard.displayName = 'SiteCard';

export default SiteCard;
```

---

## Configuration and Tooling

### Enhance TypeScript Configuration

**Update `tsconfig.json`:**

**BEFORE:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**AFTER:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    // Strict type checking
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    
    // Unused code detection
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    
    // Additional checks
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    
    // Path mapping for cleaner imports
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/stores/*": ["stores/*"],
      "@/utils/*": ["utils/*"],
      "@/types": ["types.ts"],
      "@/constants": ["constants.ts"]
    }
  },
  "include": [
    "src/**/*",
    "electron/**/*",
    "*.config.*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "dist-electron",
    "release"
  ],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Improve Vite Configuration

**Update `vite.config.ts`:**

**BEFORE (typical basic config):**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart: (options) => {
          if (options.startup) {
            options.startup(['--inspect=5858'])
          }
        },
        vite: {
          build: {
            minify: process.env.NODE_ENV === 'production',
            outDir: 'dist-electron'
          }
        }
      }
    ])
  ],
  // ... rest of config
})
```

**AFTER:**

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    plugins: [
      react({
        // Enable React DevTools in development
        jsxRuntime: 'automatic',
        fastRefresh: isDevelopment,
      }),
      electron([
        {
          entry: 'electron/main.ts',
          onstart: (options) => {
            if (options.startup) {
              // Enable debugging in development
              const debugArgs = isDevelopment ? ['--inspect=5858'] : [];
              options.startup(debugArgs);
            }
          },
          vite: {
            build: {
              minify: isProduction,
              outDir: 'dist-electron',
              rollupOptions: {
                external: [
                  'electron',
                  'node-sqlite3-wasm',
                  'electron-log',
                  'electron-updater',
                ],
              },
            },
            define: {
              __DEV__: isDevelopment,
              __PROD__: isProduction,
            },
          },
        },
        {
          entry: 'electron/preload.ts',
          onstart: (options) => options.reload(),
          vite: {
            build: {
              minify: isProduction,
              outDir: 'dist-electron',
            },
          },
        },
      ]),
    ],

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/hooks': resolve(__dirname, 'src/hooks'),
        '@/stores': resolve(__dirname, 'src/stores'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/types': resolve(__dirname, 'src/types.ts'),
        '@/constants': resolve(__dirname, 'src/constants.ts'),
      },
    },

    // Development server configuration
    server: {
      host: true, // Listen on all addresses
      port: 3000,
      strictPort: true,
      cors: true,
      hmr: {
        port: 3001,
      },
    },

    // Build configuration
    build: {
      outDir: 'dist',
      minify: isProduction ? 'esbuild' : false,
      sourcemap: isDevelopment ? 'inline' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching
            vendor: ['react', 'react-dom'],
            ui: ['zustand', '@emotion/react'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      devSourcemap: isDevelopment,
    },

    // Environment variables
    define: {
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },

    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'zustand',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
      ],
      exclude: ['electron'],
    },

    // Testing configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
        ],
      },
    },
  };
});
```

---

## Implementation Strategy

### Phase 1: Backend Modernization (1-2 weeks)

1. **Week 1**: Implement custom error classes and enhance error handling
2. **Week 2**: Replace singleton pattern with dependency injection, implement event-driven architecture

### Phase 2: State Management Refactoring (1 week)

1. Split monolithic Zustand store into focused stores
2. Update components to use new stores
3. Add proper error boundaries

### Phase 3: Component Modernization (1-2 weeks)

1. **Week 1**: Implement custom hooks for complex logic
2. **Week 2**: Replace manual form management with React Hook Form, add proper memoization

### Phase 4: Configuration and Tooling (1 week)

1. Enhance TypeScript configuration
2. Improve Vite configuration
3. Update path mappings and aliases
4. Add proper build optimizations

### Phase 5: Testing and Validation (1 week)

1. Add comprehensive unit tests for new hooks and utilities
2. Integration tests for refactored components
3. End-to-end testing for critical user flows
4. Performance testing and optimization

Each phase can be implemented incrementally without breaking existing functionality, allowing for continuous integration and testing throughout the modernization process.

## Dependencies to Install

```bash
# For React Hook Form and validation
npm install react-hook-form @hookform/resolvers zod

# For better TypeScript support
npm install --save-dev @types/node

# For testing (if not already installed)
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom
```

This guide provides exact code replacements that follow modern, idiomatic patterns while maintaining the existing functionality and improving code quality, maintainability, and developer experience.
