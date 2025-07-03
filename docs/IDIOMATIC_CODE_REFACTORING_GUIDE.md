# Idiomatic Modern Coding Practices - Refactoring Guide

## Overview

This document provides specific, actionable code replacements to modernize the Uptime Watcher codebase following idiomatic modern practices. Each section shows exact "before" and "after" code examples that can be implemented immediately.

---

## Backend Refactoring (Electron Main Process)

### 1. Replace Singleton Pattern with Dependency Injection

#### File: `electron/services/database/DatabaseService.ts`

**Current Code (Lines 15-25):**

```typescript
export class DatabaseService {
    private static instance: DatabaseService | undefined;
    private database: Database | undefined;

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
```

**Replace With:**

```typescript
export interface IDatabaseService {
    getDatabase(): Database;
    initialize(): Promise<void>;
    healthCheck(): Promise<boolean>;
    close(): Promise<void>;
}

export class DatabaseService implements IDatabaseService {
    private database: Database | undefined;

    constructor(private config: DatabaseConfig) {
        // Dependency injected configuration
    }

    public getDatabase(): Database {
        if (!this.database) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.database;
    }
```

#### File: `electron/main.ts`

**Current Code (Lines 8-15):**

```typescript
import { ApplicationService } from "./services/application/ApplicationService";

async function main() {
    try {
        const applicationService = new ApplicationService();
        await applicationService.initialize();
    } catch (error) {
        console.error("Failed to initialize application:", error);
        process.exit(1);
    }
}
```

**Replace With:**

```typescript
import { Container } from './container/Container';
import { ApplicationBootstrap } from './bootstrap/ApplicationBootstrap';
import { configureDependencies } from './container/dependencies';

async function main() {
    const container = new Container();
    configureDependencies(container);
    
    const bootstrap = container.resolve<ApplicationBootstrap>('ApplicationBootstrap');
    
    try {
        await bootstrap.initialize();
        
        // Graceful shutdown handling
        process.on('SIGTERM', async () => {
            await bootstrap.shutdown();
            process.exit(0);
        });
        
        process.on('SIGINT', async () => {
            await bootstrap.shutdown();
            process.exit(0);
        });
    } catch (error) {
        logger.error('Application startup failed', error);
        process.exit(1);
    }
}
```

### 2. Extract Command Pattern from UptimeMonitor

#### File: `electron/uptimeMonitor.ts`

**Current Code (Lines 280-320):**

```typescript
public async startMonitoringForSite(identifier: string, monitorId?: string): Promise<boolean> {
    const site = this.sites.get(identifier);
    if (site) {
        if (monitorId) {
            // Start monitoring for specific monitor
            const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
            if (!monitor) return false;

            // Start using scheduler
            const started = this.monitorScheduler.startMonitor(identifier, monitor);
            if (started) {
                // Set monitoring=true for this monitor and persist
                monitor.monitoring = true;
                if (monitor.id) {
                    await this.monitorRepository.update(monitor.id, { monitoring: true });
                }
                // Emit status-update for this monitorId
                const statusUpdate = {
                    previousStatus: undefined,
                    site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
                };
                this.emit(STATUS_UPDATE_EVENT, statusUpdate);
            }
            return started;
        }
        // More complex logic continues...
    }
    return false;
}
```

**Replace With:**

```typescript
// Create new file: electron/commands/StartMonitoringCommand.ts
export class StartMonitoringCommand implements ICommand {
    constructor(
        private siteService: ISiteService,
        private monitorScheduler: IMonitorScheduler,
        private eventEmitter: EventEmitter,
        private siteId: string,
        private monitorId: string
    ) {}

    async execute(): Promise<boolean> {
        const site = await this.siteService.findById(this.siteId);
        if (!site) {
            throw new SiteNotFoundError(this.siteId);
        }

        const monitor = site.monitors.find(m => m.id === this.monitorId);
        if (!monitor) {
            throw new MonitorNotFoundError(this.monitorId);
        }

        const started = await this.monitorScheduler.startMonitor(this.siteId, monitor);
        
        if (started) {
            await this.siteService.updateMonitorStatus(this.siteId, this.monitorId, { monitoring: true });
            this.eventEmitter.emit(STATUS_UPDATE_EVENT, {
                site: await this.siteService.findById(this.siteId),
                previousStatus: undefined
            });
        }

        return started;
    }
}

// In UptimeOrchestrator (new simplified class):
export class UptimeOrchestrator {
    constructor(
        private commandBus: ICommandBus,
        private queryBus: IQueryBus
    ) {}

    async startMonitoringForSite(siteId: string, monitorId: string): Promise<boolean> {
        const command = new StartMonitoringCommand(
            this.container.resolve('SiteService'),
            this.container.resolve('MonitorScheduler'),
            this.container.resolve('EventEmitter'),
            siteId,
            monitorId
        );
        
        return await this.commandBus.execute(command);
    }
}
```

### 3. Replace Repository Anti-Patterns

#### File: `electron/services/database/SiteRepository.ts`

**Current Code (Lines 100-130):**

```typescript
public async upsert(site: Pick<Site, "identifier" | "name">): Promise<void> {
    try {
        const db = this.getDb();
        db.run("INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)", [
            site.identifier,
            // eslint-disable-next-line unicorn/no-null
            site.name ?? null,
        ]);
        logger.debug(`[SiteRepository] Upserted site: ${site.identifier}`);
    } catch (error) {
        logger.error(`[SiteRepository] Failed to upsert site: ${site.identifier}`, error);
        throw error;
    }
}

public async delete(identifier: string): Promise<boolean> {
    try {
        const db = this.getDb();
        const result = db.run("DELETE FROM sites WHERE identifier = ?", [identifier]);
        const deleted = (result.changes ?? 0) > 0;

        if (deleted) {
            logger.debug(`[SiteRepository] Deleted site: ${identifier}`);
        } else {
            logger.warn(`[SiteRepository] Site not found for deletion: ${identifier}`);
        }

        return deleted;
    } catch (error) {
        logger.error(`[SiteRepository] Failed to delete site: ${identifier}`, error);
        throw error;
    }
}
```

**Replace With:**

```typescript
// Create base repository
export abstract class BaseRepository<T, TId> {
    constructor(
        protected db: IDatabaseService,
        protected queryBuilder: IQueryBuilder,
        protected logger: ILogger
    ) {}

    protected async executeQuery<R>(
        query: string,
        params: any[],
        operation: string
    ): Promise<R> {
        try {
            const db = this.db.getDatabase();
            return db.prepare(query).all(...params) as R;
        } catch (error) {
            this.logger.error(`${this.constructor.name}: ${operation} failed`, {
                query,
                params,
                error
            });
            throw new RepositoryError(`${operation} failed`, error);
        }
    }

    abstract findById(id: TId): Promise<T | null>;
    abstract create(entity: Omit<T, 'id'>): Promise<T>;
    abstract update(id: TId, updates: Partial<T>): Promise<T>;
    abstract delete(id: TId): Promise<boolean>;
}

export class SiteRepository extends BaseRepository<Site, string> implements ISiteRepository {
    async upsert(site: Pick<Site, "identifier" | "name">): Promise<void> {
        const query = this.queryBuilder
            .insertOrReplace('sites')
            .values(['identifier', 'name'])
            .build();

        await this.executeQuery(
            query.sql,
            [site.identifier, site.name ?? null],
            'upsert site'
        );

        this.logger.debug('Site upserted successfully', { siteId: site.identifier });
    }

    async delete(identifier: string): Promise<boolean> {
        const query = this.queryBuilder
            .delete('sites')
            .where('identifier = ?')
            .build();

        const result = await this.executeQuery<{changes: number}>(
            query.sql,
            [identifier],
            'delete site'
        );

        const deleted = result.changes > 0;
        this.logger.debug('Site deletion completed', { 
            siteId: identifier, 
            deleted 
        });

        return deleted;
    }
}
```

### 4. Add Proper Error Classes

#### Create new file: `electron/errors/index.ts`

**Add This Code:**

```typescript
export enum ErrorCode {
    SITE_NOT_FOUND = 'SITE_NOT_FOUND',
    MONITOR_NOT_FOUND = 'MONITOR_NOT_FOUND',
    DATABASE_ERROR = 'DATABASE_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    MONITORING_ERROR = 'MONITORING_ERROR'
}

export abstract class AppError extends Error {
    abstract readonly code: ErrorCode;
    abstract readonly statusCode: number;
    abstract readonly isOperational: boolean;

    constructor(message: string, public readonly context?: Record<string, any>) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class SiteNotFoundError extends AppError {
    readonly code = ErrorCode.SITE_NOT_FOUND;
    readonly statusCode = 404;
    readonly isOperational = true;

    constructor(siteId: string) {
        super(`Site with ID '${siteId}' not found`, { siteId });
    }
}

export class MonitorNotFoundError extends AppError {
    readonly code = ErrorCode.MONITOR_NOT_FOUND;
    readonly statusCode = 404;
    readonly isOperational = true;

    constructor(monitorId: string) {
        super(`Monitor with ID '${monitorId}' not found`, { monitorId });
    }
}

export class RepositoryError extends AppError {
    readonly code = ErrorCode.DATABASE_ERROR;
    readonly statusCode = 500;
    readonly isOperational = true;

    constructor(operation: string, originalError: Error) {
        super(`Repository operation failed: ${operation}`, {
            operation,
            originalError: originalError.message
        });
    }
}

export class ValidationError extends AppError {
    readonly code = ErrorCode.VALIDATION_ERROR;
    readonly statusCode = 400;
    readonly isOperational = true;

    constructor(field: string, reason: string, value?: any) {
        super(`Validation failed for field '${field}': ${reason}`, {
            field,
            reason,
            value
        });
    }
}
```

---

## Frontend Refactoring (React Application)

### 1. Split Large Zustand Store

#### File: `src/store.ts`

**Current Code (Lines 170-220):**

```typescript
export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Synchronized UI state for SiteDetails
            activeSiteDetailsTab: "overview",
            /**
             * Add a monitor to an existing site
             */
            addMonitorToSite: async (siteId, monitor) => {
                const state = get();
                state.setLoading(true);
                state.clearError();
                try {
                    // Get the current site
                    const site = state.sites.find((s) => s.identifier === siteId);
                    if (!site) throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
                    // Allow multiple monitors of the same type (uniqueness is not enforced)
                    const updatedMonitors = [...site.monitors, monitor];
                    await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to add monitor: ${error instanceof Error ? error.message : String(error)}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },
            // ... more mixed concerns
        })
    )
);
```

**Replace With:**

```typescript
// Create src/stores/siteStore.ts
interface SiteState {
    sites: Site[];
    selectedSiteId: string | null;
    loading: boolean;
    error: string | null;
}

interface SiteActions {
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    removeSite: (id: string) => void;
    setSelectedSite: (id: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useSiteStore = create<SiteState & SiteActions>()((set, get) => ({
    // State
    sites: [],
    selectedSiteId: null,
    loading: false,
    error: null,

    // Actions
    setSites: (sites) => set({ sites }),
    addSite: (site) => set((state) => ({ sites: [...state.sites, site] })),
    removeSite: (id) => set((state) => ({
        sites: state.sites.filter(s => s.identifier !== id),
        selectedSiteId: state.selectedSiteId === id ? null : state.selectedSiteId
    })),
    setSelectedSite: (id) => set({ selectedSiteId: id }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null })
}));

// Create src/stores/uiStore.ts
interface UIState {
    showSettings: boolean;
    showSiteDetails: boolean;
    activeSiteDetailsTab: string;
    siteDetailsChartTimeRange: ChartTimeRange;
    showAdvancedMetrics: boolean;
}

interface UIActions {
    setShowSettings: (show: boolean) => void;
    setShowSiteDetails: (show: boolean) => void;
    setActiveSiteDetailsTab: (tab: string) => void;
    setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;
    setShowAdvancedMetrics: (show: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()(
    persist(
        (set) => ({
            // State
            showSettings: false,
            showSiteDetails: false,
            activeSiteDetailsTab: 'overview',
            siteDetailsChartTimeRange: '24h',
            showAdvancedMetrics: false,

            // Actions
            setShowSettings: (show) => set({ showSettings: show }),
            setShowSiteDetails: (show) => set({ showSiteDetails: show }),
            setActiveSiteDetailsTab: (tab) => set({ activeSiteDetailsTab: tab }),
            setSiteDetailsChartTimeRange: (range) => set({ siteDetailsChartTimeRange: range }),
            setShowAdvancedMetrics: (show) => set({ showAdvancedMetrics: show })
        }),
        {
            name: 'uptime-watcher-ui',
            partialize: (state) => ({
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                showAdvancedMetrics: state.showAdvancedMetrics
            })
        }
    )
);

// Create src/hooks/useSiteOperations.ts
export const useSiteOperations = () => {
    const { setLoading, setError, clearError, setSites } = useSiteStore();

    const addMonitorToSite = useCallback(async (siteId: string, monitor: Monitor) => {
        setLoading(true);
        clearError();
        
        try {
            const sites = useSiteStore.getState().sites;
            const site = sites.find(s => s.identifier === siteId);
            
            if (!site) {
                throw new Error('Site not found');
            }

            const updatedMonitors = [...site.monitors, monitor];
            await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
            
            // Refresh sites from backend
            const updatedSites = await window.electronAPI.sites.getSites();
            setSites(updatedSites);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setError(`Failed to add monitor: ${message}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [setLoading, clearError, setError, setSites]);

    return {
        addMonitorToSite
    };
};
```

### 2. Add Error Boundaries

#### File: `src/App.tsx`

**Current Code (Lines 20-40):**

```typescript
function App() {
    const store = useStore();
    const { isDark } = useTheme();

    useEffect(() => {
        store.initializeApp();
        store.subscribeToStatusUpdates((update) => {
            // Handle status updates
        });

        return () => {
            store.unsubscribeFromStatusUpdates();
        };
    }, []);

    return (
        <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
            <div className="bg-background text-foreground min-h-screen">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    {/* App content */}
                </main>
            </div>
        </div>
    );
}
```

**Replace With:**

```typescript
// Create src/components/ErrorBoundary/ErrorBoundary.tsx
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{error: Error; retry: () => void}>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error to monitoring service
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
        
        // In production, send to error monitoring service
        if (process.env.NODE_ENV === 'production') {
            // errorReporter.captureException(error, { extra: errorInfo });
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
        }

        return this.props.children;
    }
}

// Create src/components/ErrorBoundary/DefaultErrorFallback.tsx
interface ErrorFallbackProps {
    error: Error;
    retry: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md mx-auto text-center p-6">
                <div className="mb-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                </div>
                <h1 className="text-xl font-semibold text-foreground mb-2">
                    Something went wrong
                </h1>
                <p className="text-muted-foreground mb-4">
                    An unexpected error occurred. Please try again.
                </p>
                {process.env.NODE_ENV === 'development' && (
                    <details className="mb-4 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground">
                            Error details
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                            {error.stack}
                        </pre>
                    </details>
                )}
                <button
                    onClick={retry}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};

// Update App.tsx
function App() {
    const { isDark } = useTheme();

    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error('App Error:', error, errorInfo);
            }}
        >
            <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
                <div className="bg-background text-foreground min-h-screen">
                    <Suspense fallback={<AppLoadingSpinner />}>
                        <Header />
                        <main className="container mx-auto px-4 py-8">
                            <ErrorBoundary fallback={MainContentErrorFallback}>
                                <AppContent />
                            </ErrorBoundary>
                        </main>
                        <ErrorBoundary>
                            <GlobalModals />
                        </ErrorBoundary>
                    </Suspense>
                </div>
            </div>
        </ErrorBoundary>
    );
}

// Create AppContent component to handle initialization
const AppContent: React.FC = () => {
    const { sites, loading, error } = useSiteStore();
    const { addMonitorToSite } = useSiteOperations();

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const sites = await window.electronAPI.sites.getSites();
                useSiteStore.getState().setSites(sites);
            } catch (error) {
                useSiteStore.getState().setError(
                    error instanceof Error ? error.message : 'Failed to initialize app'
                );
            }
        };

        initializeApp();

        // Subscribe to status updates
        const unsubscribe = subscribeToStatusUpdates((update) => {
            // Handle real-time updates
            const currentSites = useSiteStore.getState().sites;
            const updatedSites = currentSites.map(site =>
                site.identifier === update.site.identifier ? update.site : site
            );
            useSiteStore.getState().setSites(updatedSites);
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return <AppLoadingSpinner />;
    }

    if (error) {
        return <AppErrorDisplay error={error} />;
    }

    return (
        <>
            <SiteList sites={sites} />
            {/* Other components */}
        </>
    );
};
```

### 3. Replace Manual Form Logic with React Hook Form

#### File: `src/components/AddSiteForm/AddSiteForm.tsx`

**Current Code (Lines 50-100):**

```typescript
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
        setAddMode,
        setCheckInterval,
        setFormError,
        setHost,
        setMonitorType,
        setName,
        setPort,
        setSelectedExistingSite,
        setUrl,
        siteId,
        url,
    } = formState;

    // Memoized submit handler
    const onSubmit = useCallback(
        (e: React.FormEvent) =>
            handleSubmit(e, {
                ...formState,
                addMonitorToSite,
                clearError,
                createSite,
                generateUuid,
                logger,
                onSuccess: resetForm, // Reset form on successful submission
            }),
        [formState, addMonitorToSite, clearError, createSite, resetForm]
    );
```

**Replace With:**

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define validation schema
const siteFormSchema = z.object({
    addMode: z.enum(['new', 'existing']),
    siteName: z.string().min(1, 'Site name is required').optional(),
    selectedSite: z.string().optional(),
    monitorType: z.enum(['http', 'port']),
    url: z.string().url('Valid URL required').optional(),
    host: z.string().min(1, 'Host is required').optional(),
    port: z.number().min(1).max(65535, 'Port must be between 1 and 65535').optional(),
    checkInterval: z.number().min(5000, 'Minimum interval is 5 seconds'),
    timeout: z.number().min(1000).max(300000).optional(),
    retryAttempts: z.number().min(0).max(10).optional()
}).superRefine((data, ctx) => {
    // Conditional validation
    if (data.addMode === 'new' && !data.siteName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['siteName'],
            message: 'Site name is required for new sites'
        });
    }

    if (data.addMode === 'existing' && !data.selectedSite) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selectedSite'],
            message: 'Please select an existing site'
        });
    }

    if (data.monitorType === 'http' && !data.url) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['url'],
            message: 'URL is required for HTTP monitoring'
        });
    }

    if (data.monitorType === 'port') {
        if (!data.host) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['host'],
                message: 'Host is required for port monitoring'
            });
        }
        if (!data.port) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['port'],
                message: 'Port is required for port monitoring'
            });
        }
    }
});

type SiteFormData = z.infer<typeof siteFormSchema>;

export const AddSiteForm: React.FC = () => {
    const { sites } = useSiteStore();
    const { loading } = useSiteStore();
    const { addMonitorToSite } = useSiteOperations();
    
    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm<SiteFormData>({
        resolver: zodResolver(siteFormSchema),
        defaultValues: {
            addMode: 'new',
            monitorType: 'http',
            checkInterval: DEFAULT_CHECK_INTERVAL,
            timeout: DEFAULT_REQUEST_TIMEOUT,
            retryAttempts: 0
        },
        mode: 'onChange'
    });

    const addMode = watch('addMode');
    const monitorType = watch('monitorType');

    const onSubmit = async (data: SiteFormData) => {
        try {
            if (data.addMode === 'new') {
                const site: Omit<Site, 'id'> = {
                    identifier: generateUuid(),
                    name: data.siteName,
                    monitors: [{
                        id: generateUuid(),
                        type: data.monitorType,
                        status: 'pending',
                        history: [],
                        monitoring: true,
                        checkInterval: data.checkInterval,
                        timeout: data.timeout,
                        retryAttempts: data.retryAttempts,
                        ...(data.monitorType === 'http' && { url: data.url }),
                        ...(data.monitorType === 'port' && { 
                            host: data.host, 
                            port: data.port 
                        })
                    }]
                };

                await window.electronAPI.sites.addSite(site);
            } else {
                const monitor: Monitor = {
                    id: generateUuid(),
                    type: data.monitorType,
                    status: 'pending',
                    history: [],
                    monitoring: true,
                    checkInterval: data.checkInterval,
                    timeout: data.timeout,
                    retryAttempts: data.retryAttempts,
                    ...(data.monitorType === 'http' && { url: data.url }),
                    ...(data.monitorType === 'port' && { 
                        host: data.host, 
                        port: data.port 
                    })
                };

                await addMonitorToSite(data.selectedSite!, monitor);
            }

            reset();
        } catch (error) {
            console.error('Form submission failed:', error);
        }
    };

    return (
        <ThemedBox className="max-w-md mx-auto" padding="lg" rounded="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                    name="addMode"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            {...field}
                            label="Add Mode"
                            options={[
                                { label: "Create New Site", value: "new" },
                                { label: "Add to Existing Site", value: "existing" }
                            ]}
                            disabled={isSubmitting || loading}
                            error={errors.addMode?.message}
                        />
                    )}
                />

                {addMode === 'existing' && (
                    <Controller
                        name="selectedSite"
                        control={control}
                        render={({ field }) => (
                            <SelectField
                                {...field}
                                label="Select Site"
                                placeholder="-- Select a site --"
                                options={sites.map(site => ({
                                    label: site.name ?? site.identifier,
                                    value: site.identifier
                                }))}
                                disabled={isSubmitting || loading}
                                error={errors.selectedSite?.message}
                                required
                            />
                        )}
                    />
                )}

                {addMode === 'new' && (
                    <Controller
                        name="siteName"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Site Name"
                                placeholder="My Website"
                                disabled={isSubmitting || loading}
                                error={errors.siteName?.message}
                                required
                            />
                        )}
                    />
                )}

                <Controller
                    name="monitorType"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            {...field}
                            label="Monitor Type"
                            options={[
                                { label: "HTTP/HTTPS", value: "http" },
                                { label: "Port Check", value: "port" }
                            ]}
                            disabled={isSubmitting || loading}
                            error={errors.monitorType?.message}
                        />
                    )}
                />

                {monitorType === 'http' && (
                    <Controller
                        name="url"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="URL"
                                placeholder="https://example.com"
                                type="url"
                                disabled={isSubmitting || loading}
                                error={errors.url?.message}
                                required
                            />
                        )}
                    />
                )}

                {monitorType === 'port' && (
                    <>
                        <Controller
                            name="host"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Host"
                                    placeholder="example.com"
                                    disabled={isSubmitting || loading}
                                    error={errors.host?.message}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="port"
                            control={control}
                            render={({ field: { value, onChange, ...field } }) => (
                                <TextField
                                    {...field}
                                    label="Port"
                                    placeholder="80"
                                    type="number"
                                    min={1}
                                    max={65535}
                                    value={value || ''}
                                    onChange={(e) => onChange(parseInt(e.target.value) || undefined)}
                                    disabled={isSubmitting || loading}
                                    error={errors.port?.message}
                                    required
                                />
                            )}
                        />
                    </>
                )}

                <Controller
                    name="checkInterval"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                        <SelectField
                            {...field}
                            label="Check Interval"
                            value={value.toString()}
                            onChange={(val) => onChange(parseInt(val))}
                            options={CHECK_INTERVALS.map(interval => ({
                                label: interval.label,
                                value: interval.value.toString()
                            }))}
                            disabled={isSubmitting || loading}
                            error={errors.checkInterval?.message}
                        />
                    )}
                />

                <div className="flex gap-2 pt-4">
                    <ThemedButton
                        type="submit"
                        disabled={!isValid || isSubmitting || loading}
                        loading={isSubmitting}
                        className="flex-1"
                    >
                        {addMode === 'new' ? 'Create Site' : 'Add Monitor'}
                    </ThemedButton>
                    
                    <ThemedButton
                        type="button"
                        variant="ghost"
                        onClick={() => reset()}
                        disabled={isSubmitting || loading}
                    >
                        Reset
                    </ThemedButton>
                </div>
            </form>
        </ThemedBox>
    );
};
```

### 4. Add Proper Memoization

#### File: `src/components/Dashboard/SiteCard/index.tsx`

**Current Code (Lines 20-50):**

```typescript
export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
    const { setSelectedSite, setShowSiteDetails } = useStore();
    const { isDark } = useTheme();

    const handleViewDetails = () => {
        setSelectedSite(site);
        setShowSiteDetails(true);
    };

    const monitors = site.monitors || [];
    const hasMonitors = monitors.length > 0;
    
    const overallStatus = hasMonitors 
        ? monitors.some(m => m.status === 'down') 
            ? 'down' 
            : monitors.some(m => m.status === 'up') 
                ? 'up' 
                : 'pending'
        : 'pending';

    const avgResponseTime = hasMonitors
        ? Math.round(
            monitors
                .filter(m => m.responseTime)
                .reduce((sum, m) => sum + (m.responseTime || 0), 0) / monitors.length
        )
        : 0;

    return (
        <ThemedBox
            className="transition-all duration-200 hover:shadow-lg cursor-pointer"
            onClick={handleViewDetails}
            padding="md"
            rounded="lg"
        >
            <SiteCardHeader site={site} status={overallStatus} />
            <SiteCardMetrics 
                monitors={monitors}
                avgResponseTime={avgResponseTime}
            />
            <SiteCardHistory monitors={monitors} />
            <SiteCardFooter site={site} />
        </ThemedBox>
    );
};
```

**Replace With:**

```typescript
interface SiteCardProps {
    site: Site;
    onViewDetails?: (site: Site) => void;
}

// Memoized calculations
const useSiteMetrics = (site: Site) => {
    return useMemo(() => {
        const monitors = site.monitors || [];
        const hasMonitors = monitors.length > 0;
        
        const overallStatus = hasMonitors 
            ? monitors.some(m => m.status === 'down') 
                ? 'down' 
                : monitors.some(m => m.status === 'up') 
                    ? 'up' 
                    : 'pending'
            : 'pending';

        const avgResponseTime = hasMonitors
            ? Math.round(
                monitors
                    .filter(m => m.responseTime)
                    .reduce((sum, m) => sum + (m.responseTime || 0), 0) / monitors.length
            )
            : 0;

        const uptimePercentage = hasMonitors
            ? monitors.reduce((sum, monitor) => {
                const history = monitor.history || [];
                if (history.length === 0) return sum;
                
                const upCount = history.filter(h => h.status === 'up').length;
                return sum + (upCount / history.length);
            }, 0) / monitors.length * 100
            : 0;

        return {
            monitors,
            hasMonitors,
            overallStatus,
            avgResponseTime,
            uptimePercentage
        };
    }, [site.monitors, site.identifier]); // Only recalculate when monitors change
};

export const SiteCard = React.memo<SiteCardProps>(({ site, onViewDetails }) => {
    const { setSelectedSite, setShowSiteDetails } = useUIStore();
    const metrics = useSiteMetrics(site);

    const handleViewDetails = useCallback(() => {
        setSelectedSite(site.identifier);
        setShowSiteDetails(true);
        onViewDetails?.(site);
    }, [site.identifier, setSelectedSite, setShowSiteDetails, onViewDetails]);

    const handleQuickAction = useCallback((action: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card click
        
        switch (action) {
            case 'check-now':
                // Handle immediate check
                break;
            case 'toggle-monitoring':
                // Handle monitoring toggle
                break;
        }
    }, [site.identifier]);

    return (
        <ThemedBox
            className="transition-all duration-200 hover:shadow-lg cursor-pointer group"
            onClick={handleViewDetails}
            padding="md"
            rounded="lg"
            data-testid={`site-card-${site.identifier}`}
        >
            <SiteCardHeader 
                site={site} 
                status={metrics.overallStatus}
                onQuickAction={handleQuickAction}
            />
            <SiteCardMetrics 
                monitors={metrics.monitors}
                avgResponseTime={metrics.avgResponseTime}
                uptimePercentage={metrics.uptimePercentage}
            />
            <SiteCardHistory monitors={metrics.monitors} />
            <SiteCardFooter 
                site={site} 
                monitorCount={metrics.monitors.length}
            />
        </ThemedBox>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for optimal re-rendering
    const prevSite = prevProps.site;
    const nextSite = nextProps.site;
    
    // Compare site identity
    if (prevSite.identifier !== nextSite.identifier) {
        return false;
    }
    
    // Compare monitor count
    if (prevSite.monitors.length !== nextSite.monitors.length) {
        return false;
    }
    
    // Compare monitor statuses and response times
    for (let i = 0; i < prevSite.monitors.length; i++) {
        const prevMonitor = prevSite.monitors[i];
        const nextMonitor = nextSite.monitors[i];
        
        if (
            prevMonitor.status !== nextMonitor.status ||
            prevMonitor.responseTime !== nextMonitor.responseTime ||
            prevMonitor.lastChecked !== nextMonitor.lastChecked ||
            prevMonitor.monitoring !== nextMonitor.monitoring
        ) {
            return false;
        }
    }
    
    return true; // Props are equal, skip re-render
});

SiteCard.displayName = 'SiteCard';
```

### 5. Add Custom Hooks for Common Patterns

#### Create new file: `src/hooks/useAsyncOperation.ts`

**Add This Code:**

```typescript
interface UseAsyncOperationOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    retryAttempts?: number;
    retryDelay?: number;
    immediate?: boolean;
}

interface UseAsyncOperationResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (...args: any[]) => Promise<T>;
    retry: () => Promise<T>;
    reset: () => void;
}

export const useAsyncOperation = <T>(
    asyncFunction: (...args: any[]) => Promise<T>,
    options: UseAsyncOperationOptions<T> = {}
): UseAsyncOperationResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const lastArgsRef = useRef<any[]>([]);

    const {
        onSuccess,
        onError,
        retryAttempts = 0,
        retryDelay = 1000,
        immediate = false
    } = options;

    const execute = useCallback(async (...args: any[]): Promise<T> => {
        lastArgsRef.current = args;
        setLoading(true);
        setError(null);

        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                const result = await asyncFunction(...args);
                setData(result);
                setLoading(false);
                onSuccess?.(result);
                return result;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                
                if (attempt < retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
                
                setError(lastError);
                setLoading(false);
                onError?.(lastError);
                throw lastError;
            }
        }
        
        throw lastError!;
    }, [asyncFunction, onSuccess, onError, retryAttempts, retryDelay]);

    const retry = useCallback(() => {
        return execute(...lastArgsRef.current);
    }, [execute]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    return {
        data,
        loading,
        error,
        execute,
        retry,
        reset
    };
};

// Usage example in components:
export const useSiteOperations = () => {
    const { setSites } = useSiteStore();

    const {
        execute: createSite,
        loading: creatingSite,
        error: createSiteError
    } = useAsyncOperation(
        async (siteData: Omit<Site, 'id'>) => {
            const newSite = await window.electronAPI.sites.addSite(siteData);
            
            // Refresh sites list
            const updatedSites = await window.electronAPI.sites.getSites();
            setSites(updatedSites);
            
            return newSite;
        },
        {
            onSuccess: () => {
                console.log('Site created successfully');
            },
            onError: (error) => {
                console.error('Failed to create site:', error);
            },
            retryAttempts: 2,
            retryDelay: 1000
        }
    );

    const {
        execute: deleteSite,
        loading: deletingSite,
        error: deleteSiteError
    } = useAsyncOperation(
        async (siteId: string) => {
            await window.electronAPI.sites.removeSite(siteId);
            
            // Refresh sites list
            const updatedSites = await window.electronAPI.sites.getSites();
            setSites(updatedSites);
        },
        {
            onSuccess: () => {
                console.log('Site deleted successfully');
            }
        }
    );

    return {
        createSite: {
            execute: createSite,
            loading: creatingSite,
            error: createSiteError
        },
        deleteSite: {
            execute: deleteSite,
            loading: deletingSite,
            error: deleteSiteError
        }
    };
};
```

---

## Configuration & Build System Improvements

### 1. Enhanced TypeScript Configuration

#### File: `tsconfig.json`

**Current Code:**

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "skipDefaultLibCheck": false,
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "CommonJS",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "isolatedModules": true,
        "jsx": "react-jsx",
        "strict": true,
        "types": ["react", "react-dom", "vitest/globals", "@testing-library/jest-dom", "vite/client"],
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "forceConsistentCasingInFileNames": true,
        "outDir": "dist-electron",
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        },
        "esModuleInterop": true,
        "allowJs": true,
        "allowSyntheticDefaultImports": true
    }
}
```

**Replace With:**

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        
        // Strict type checking
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "noImplicitReturns": true,
        "noImplicitOverride": true,
        "noPropertyAccessFromIndexSignature": true,
        "noUncheckedIndexedAccess": true,
        "exactOptionalPropertyTypes": true,
        
        // Module resolution
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"],
            "@/components/*": ["src/components/*"],
            "@/hooks/*": ["src/hooks/*"],
            "@/stores/*": ["src/stores/*"],
            "@/utils/*": ["src/utils/*"],
            "@/types/*": ["src/types/*"],
            "@/services/*": ["src/services/*"]
        },
        
        // Build optimization
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "verbatimModuleSyntax": true,
        
        // Types
        "types": [
            "vite/client",
            "vitest/globals",
            "@testing-library/jest-dom"
        ]
    },
    "include": [
        "src/**/*.ts",
        "src/**/*.tsx",
        "src/**/*.test.ts",
        "src/**/*.test.tsx"
    ],
    "exclude": [
        "node_modules",
        "dist",
        "dist-electron",
        "release"
    ]
}
```

#### Create separate config for Electron: `electron/tsconfig.json`

**Add This File:**

```json
{
    "extends": "../tsconfig.json",
    "compilerOptions": {
        "target": "ES2022",
        "module": "CommonJS",
        "moduleResolution": "node",
        "outDir": "../dist-electron",
        "noEmit": false,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "composite": true,
        "incremental": true,
        "tsBuildInfoFile": "../.tsbuildinfo-electron",
        
        // Node.js specific
        "types": [
            "node",
            "electron"
        ],
        
        // Path mapping for electron
        "baseUrl": ".",
        "paths": {
            "@electron/*": ["./*"],
            "@shared/*": ["../src/types/*"]
        }
    },
    "include": [
        "**/*.ts",
        "**/*.tsx"
    ],
    "exclude": [
        "node_modules",
        "**/*.test.ts",
        "**/*.test.tsx"
    ]
}
```

### 2. Enhanced Vite Configuration

#### File: `vite.config.ts`

**Current Code (partial):**

```typescript
export default defineConfig({
  plugins: [react()],
  // Basic configuration
});
```

**Replace With:**

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = command === 'serve';
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        // Enable React Fast Refresh
        fastRefresh: isDev,
        // Optimize React in production
        babel: isProd ? {
          plugins: [
            ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
          ]
        } : undefined
      })
    ],

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/hooks': resolve(__dirname, 'src/hooks'),
        '@/stores': resolve(__dirname, 'src/stores'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/types': resolve(__dirname, 'src/types'),
        '@/services': resolve(__dirname, 'src/services')
      }
    },

    // Build optimization
    build: {
      target: 'ES2022',
      sourcemap: isDev,
      minify: isProd ? 'terser' : false,
      
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'state-vendor': ['zustand'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
            
            // Feature chunks
            'dashboard': [
              './src/components/Dashboard/SiteCard/index.tsx',
              './src/components/Dashboard/SiteList/index.tsx'
            ],
            'site-details': [
              './src/components/SiteDetails/SiteDetails.tsx',
              './src/components/SiteDetails/tabs/OverviewTab.tsx'
            ]
          },
          
          // Asset naming
          chunkFileNames: isDev ? '[name].js' : '[name]-[hash].js',
          entryFileNames: isDev ? '[name].js' : '[name]-[hash].js',
          assetFileNames: isDev ? '[name].[ext]' : '[name]-[hash].[ext]'
        }
      },

      // Terser options for production
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug']
        },
        mangle: {
          safari10: true
        }
      } : undefined,

      // Chunk size warnings
      chunkSizeWarningLimit: 1000
    },

    // Development server
    server: {
      port: 5173,
      strictPort: true,
      open: false, // Electron will handle opening
      hmr: {
        port: 5174
      }
    },

    // Environment variables
    define: {
      __DEV__: isDev,
      __VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    // CSS options
    css: {
      modules: {
        generateScopedName: isDev ? '[name]__[local]___[hash:base64:5]' : '[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },

    // Testing configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}'
        ]
      }
    }
  };
});
```

---

## Summary

This refactoring guide provides specific, actionable code replacements that will modernize the Uptime Watcher codebase. The changes focus on:

1. **Backend**: Dependency injection, command patterns, proper error handling, and repository improvements
2. **Frontend**: State management splitting, error boundaries, form libraries, memoization, and custom hooks
3. **Configuration**: Enhanced TypeScript and build configurations

Each code block can be implemented incrementally, allowing for gradual modernization without breaking existing functionality. The replacements follow current industry best practices and will significantly improve code maintainability, testability, and performance.
