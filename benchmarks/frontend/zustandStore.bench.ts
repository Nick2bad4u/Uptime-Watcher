/**
 * Zustand Store Performance Benchmarks
 *
 * @file Performance benchmarks for Zustand state management operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Frontend-ZustandStore
 * @tags ["performance", "zustand", "state-management", "store"]
 */

import { bench, describe } from "vitest";

// Mock Zustand implementation for benchmarking
type StateCreator<T> = (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T
) => T;

type Subscribe<T> = (listener: (state: T, prevState: T) => void) => () => void;

interface StoreApi<T> {
    getState: () => T;
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
    subscribe: Subscribe<T>;
    destroy: () => void;
}

class MockZustandStore<T> implements StoreApi<T> {
    private state: T;
    private listeners: Set<(state: T, prevState: T) => void> = new Set();

    constructor(createState: StateCreator<T>) {
        this.state = createState(this.setState.bind(this), this.getState.bind(this));
    }

    getState = (): T => {
        return this.state;
    };

    setState = (partial: Partial<T> | ((state: T) => Partial<T>)): void => {
        const prevState = this.state;
        const nextState = typeof partial === 'function' 
            ? { ...this.state, ...partial(this.state) }
            : { ...this.state, ...partial };
        
        this.state = nextState;
        
        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener(nextState, prevState);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    };

    subscribe: Subscribe<T> = (listener) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    destroy = (): void => {
        this.listeners.clear();
    };
}

// Store interfaces and implementations
interface SiteState {
    sites: Site[];
    selectedSite: Site | null;
    loading: boolean;
    error: string | null;
    filters: SiteFilters;
    
    // Actions
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    updateSite: (id: string, updates: Partial<Site>) => void;
    removeSite: (id: string) => void;
    selectSite: (site: Site | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setFilters: (filters: Partial<SiteFilters>) => void;
    clearFilters: () => void;
}

interface Site {
    id: string;
    name: string;
    url: string;
    status: 'online' | 'offline' | 'degraded' | 'unknown';
    responseTime: number;
    uptime: number;
    lastCheck: number;
    created: number;
    tags: string[];
}

interface SiteFilters {
    status: string[];
    tags: string[];
    searchTerm: string;
    sortBy: 'name' | 'status' | 'uptime' | 'responseTime';
    sortOrder: 'asc' | 'desc';
}

interface MonitorState {
    monitors: Monitor[];
    activeMonitors: Set<string>;
    monitorHistory: MonitorHistory[];
    settings: MonitorSettings;
    
    // Actions
    setMonitors: (monitors: Monitor[]) => void;
    addMonitor: (monitor: Monitor) => void;
    updateMonitor: (id: string, updates: Partial<Monitor>) => void;
    removeMonitor: (id: string) => void;
    startMonitor: (id: string) => void;
    stopMonitor: (id: string) => void;
    addHistory: (history: MonitorHistory) => void;
    updateSettings: (settings: Partial<MonitorSettings>) => void;
}

interface Monitor {
    id: string;
    siteId: string;
    type: 'http' | 'ping' | 'port' | 'keyword';
    interval: number;
    timeout: number;
    configuration: Record<string, any>;
    enabled: boolean;
    created: number;
}

interface MonitorHistory {
    id: string;
    monitorId: string;
    timestamp: number;
    status: 'success' | 'failure';
    responseTime?: number;
    error?: string;
    metadata: Record<string, any>;
}

interface MonitorSettings {
    defaultInterval: number;
    defaultTimeout: number;
    maxConcurrentChecks: number;
    retryAttempts: number;
    alertThreshold: number;
}

interface DashboardState {
    summary: DashboardSummary;
    recentActivity: ActivityItem[];
    alerts: Alert[];
    chartData: ChartData[];
    refreshing: boolean;
    lastUpdated: number;
    
    // Actions
    updateSummary: (summary: DashboardSummary) => void;
    addActivity: (activity: ActivityItem) => void;
    setAlerts: (alerts: Alert[]) => void;
    updateChartData: (data: ChartData[]) => void;
    setRefreshing: (refreshing: boolean) => void;
    refresh: () => void;
    clearActivity: () => void;
}

interface DashboardSummary {
    totalSites: number;
    onlineSites: number;
    offlineSites: number;
    degradedSites: number;
    averageUptime: number;
    averageResponseTime: number;
    totalAlerts: number;
}

interface ActivityItem {
    id: string;
    type: 'site_status' | 'monitor_created' | 'alert_triggered';
    timestamp: number;
    message: string;
    metadata: Record<string, any>;
}

interface Alert {
    id: string;
    siteId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
    acknowledged: boolean;
}

interface ChartData {
    timestamp: number;
    uptime: number;
    responseTime: number;
    activeMonitors: number;
}

// Store creators
const createSiteStore = (set: any, get: any): SiteState => ({
    sites: [],
    selectedSite: null,
    loading: false,
    error: null,
    filters: {
        status: [],
        tags: [],
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc'
    },
    
    setSites: (sites) => set({ sites }),
    addSite: (site) => set((state: SiteState) => ({ 
        sites: [...state.sites, site] 
    })),
    updateSite: (id, updates) => set((state: SiteState) => ({
        sites: state.sites.map(site => site.id === id ? { ...site, ...updates } : site)
    })),
    removeSite: (id) => set((state: SiteState) => ({
        sites: state.sites.filter(site => site.id !== id)
    })),
    selectSite: (site) => set({ selectedSite: site }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set((state: SiteState) => ({
        filters: { ...state.filters, ...filters }
    })),
    clearFilters: () => set({
        filters: {
            status: [],
            tags: [],
            searchTerm: '',
            sortBy: 'name',
            sortOrder: 'asc'
        }
    })
});

const createMonitorStore = (set: any, get: any): MonitorState => ({
    monitors: [],
    activeMonitors: new Set(),
    monitorHistory: [],
    settings: {
        defaultInterval: 60000,
        defaultTimeout: 10000,
        maxConcurrentChecks: 10,
        retryAttempts: 3,
        alertThreshold: 95
    },
    
    setMonitors: (monitors) => set({ monitors }),
    addMonitor: (monitor) => set((state: MonitorState) => ({
        monitors: [...state.monitors, monitor]
    })),
    updateMonitor: (id, updates) => set((state: MonitorState) => ({
        monitors: state.monitors.map(monitor => 
            monitor.id === id ? { ...monitor, ...updates } : monitor
        )
    })),
    removeMonitor: (id) => set((state: MonitorState) => ({
        monitors: state.monitors.filter(monitor => monitor.id !== id),
        activeMonitors: new Set([...state.activeMonitors].filter(mid => mid !== id))
    })),
    startMonitor: (id) => set((state: MonitorState) => ({
        activeMonitors: new Set([...state.activeMonitors, id])
    })),
    stopMonitor: (id) => set((state: MonitorState) => ({
        activeMonitors: new Set([...state.activeMonitors].filter(mid => mid !== id))
    })),
    addHistory: (history) => set((state: MonitorState) => ({
        monitorHistory: [...state.monitorHistory, history].slice(-1000) // Keep last 1000
    })),
    updateSettings: (settings) => set((state: MonitorState) => ({
        settings: { ...state.settings, ...settings }
    }))
});

const createDashboardStore = (set: any, get: any): DashboardState => ({
    summary: {
        totalSites: 0,
        onlineSites: 0,
        offlineSites: 0,
        degradedSites: 0,
        averageUptime: 0,
        averageResponseTime: 0,
        totalAlerts: 0
    },
    recentActivity: [],
    alerts: [],
    chartData: [],
    refreshing: false,
    lastUpdated: Date.now(),
    
    updateSummary: (summary) => set({ summary, lastUpdated: Date.now() }),
    addActivity: (activity) => set((state: DashboardState) => ({
        recentActivity: [activity, ...state.recentActivity].slice(0, 50)
    })),
    setAlerts: (alerts) => set({ alerts }),
    updateChartData: (data) => set({ chartData: data }),
    setRefreshing: (refreshing) => set({ refreshing }),
    refresh: () => {
        set({ refreshing: true });
        // Simulate async refresh
        setTimeout(() => set({ refreshing: false, lastUpdated: Date.now() }), 100);
    },
    clearActivity: () => set({ recentActivity: [] })
});

describe("Zustand Store Performance", () => {
    let siteStore: MockZustandStore<SiteState>;
    let monitorStore: MockZustandStore<MonitorState>;
    let dashboardStore: MockZustandStore<DashboardState>;

    bench("create site store", () => {
        siteStore = new MockZustandStore(createSiteStore);
    }, { warmupIterations: 10, iterations: 1000 });

    bench("create monitor store", () => {
        monitorStore = new MockZustandStore(createMonitorStore);
    }, { warmupIterations: 10, iterations: 1000 });

    bench("create dashboard store", () => {
        dashboardStore = new MockZustandStore(createDashboardStore);
    }, { warmupIterations: 10, iterations: 1000 });

    bench("get state", () => {
        siteStore = new MockZustandStore(createSiteStore);
        siteStore.getState();
    }, { warmupIterations: 10, iterations: 10000 });

    bench("set simple state", () => {
        siteStore = new MockZustandStore(createSiteStore);
        siteStore.setState({ loading: true });
    }, { warmupIterations: 10, iterations: 5000 });

    bench("set state with function", () => {
        siteStore = new MockZustandStore(createSiteStore);
        siteStore.setState((state) => ({ 
            filters: { ...state.filters, searchTerm: 'test' }
        }));
    }, { warmupIterations: 10, iterations: 3000 });

    bench("add single site", () => {
        siteStore = new MockZustandStore(createSiteStore);
        const newSite: Site = {
            id: 'site-1',
            name: 'Test Site',
            url: 'https://test.com',
            status: 'online',
            responseTime: 200,
            uptime: 99.5,
            lastCheck: Date.now(),
            created: Date.now(),
            tags: ['production', 'api']
        };
        siteStore.getState().addSite(newSite);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("update site", () => {
        siteStore = new MockZustandStore(createSiteStore);
        const site: Site = {
            id: 'site-update',
            name: 'Update Site',
            url: 'https://update.com',
            status: 'online',
            responseTime: 200,
            uptime: 99.5,
            lastCheck: Date.now(),
            created: Date.now(),
            tags: []
        };
        siteStore.getState().addSite(site);
        siteStore.getState().updateSite('site-update', { 
            status: 'offline', 
            responseTime: 5000 
        });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("bulk site operations", () => {
        siteStore = new MockZustandStore(createSiteStore);
        const sites: Site[] = Array.from({ length: 100 }, (_, i) => ({
            id: `bulk-site-${i}`,
            name: `Site ${i}`,
            url: `https://site${i}.com`,
            status: ['online', 'offline', 'degraded'][i % 3] as Site['status'],
            responseTime: Math.random() * 1000,
            uptime: 90 + Math.random() * 10,
            lastCheck: Date.now() - Math.random() * 3600000,
            created: Date.now() - Math.random() * 86400000,
            tags: [`tag${i % 5}`, `category${i % 3}`]
        }));
        siteStore.getState().setSites(sites);
    }, { warmupIterations: 5, iterations: 200 });

    bench("filter sites", () => {
        siteStore = new MockZustandStore(createSiteStore);
        // Pre-populate with sites
        const sites: Site[] = Array.from({ length: 50 }, (_, i) => ({
            id: `filter-site-${i}`,
            name: `Site ${i}`,
            url: `https://site${i}.com`,
            status: ['online', 'offline', 'degraded'][i % 3] as Site['status'],
            responseTime: Math.random() * 1000,
            uptime: 90 + Math.random() * 10,
            lastCheck: Date.now(),
            created: Date.now(),
            tags: [`tag${i % 5}`]
        }));
        siteStore.getState().setSites(sites);
        
        siteStore.getState().setFilters({
            status: ['online'],
            tags: ['tag1', 'tag2'],
            searchTerm: 'Site 1'
        });
    }, { warmupIterations: 10, iterations: 1000 });

    bench("add monitor", () => {
        monitorStore = new MockZustandStore(createMonitorStore);
        const monitor: Monitor = {
            id: 'monitor-1',
            siteId: 'site-1',
            type: 'http',
            interval: 60000,
            timeout: 10000,
            configuration: {
                method: 'GET',
                followRedirects: true,
                validateSSL: true
            },
            enabled: true,
            created: Date.now()
        };
        monitorStore.getState().addMonitor(monitor);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("start/stop monitors", () => {
        monitorStore = new MockZustandStore(createMonitorStore);
        const monitors: Monitor[] = Array.from({ length: 10 }, (_, i) => ({
            id: `control-monitor-${i}`,
            siteId: `site-${i}`,
            type: 'http',
            interval: 60000,
            timeout: 10000,
            configuration: {},
            enabled: true,
            created: Date.now()
        }));
        monitorStore.getState().setMonitors(monitors);
        
        // Start all monitors
        monitors.forEach(monitor => {
            monitorStore.getState().startMonitor(monitor.id);
        });
        
        // Stop half of them
        monitors.slice(0, 5).forEach(monitor => {
            monitorStore.getState().stopMonitor(monitor.id);
        });
    }, { warmupIterations: 10, iterations: 500 });

    bench("add monitor history", () => {
        monitorStore = new MockZustandStore(createMonitorStore);
        const history: MonitorHistory = {
            id: 'history-1',
            monitorId: 'monitor-1',
            timestamp: Date.now(),
            status: 'success',
            responseTime: 250,
            metadata: { ip: '192.168.1.1', httpCode: 200 }
        };
        monitorStore.getState().addHistory(history);
    }, { warmupIterations: 10, iterations: 3000 });

    bench("update dashboard summary", () => {
        dashboardStore = new MockZustandStore(createDashboardStore);
        const summary: DashboardSummary = {
            totalSites: 25,
            onlineSites: 22,
            offlineSites: 2,
            degradedSites: 1,
            averageUptime: 96.8,
            averageResponseTime: 450,
            totalAlerts: 3
        };
        dashboardStore.getState().updateSummary(summary);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("add dashboard activity", () => {
        dashboardStore = new MockZustandStore(createDashboardStore);
        const activity: ActivityItem = {
            id: 'activity-1',
            type: 'site_status',
            timestamp: Date.now(),
            message: 'Site Example.com went offline',
            metadata: { siteId: 'site-1', previousStatus: 'online' }
        };
        dashboardStore.getState().addActivity(activity);
    }, { warmupIterations: 10, iterations: 3000 });

    bench("store subscription", () => {
        siteStore = new MockZustandStore(createSiteStore);
        const unsubscribe = siteStore.subscribe((state, prevState) => {
            // Simulate listener work
            if (state.sites.length !== prevState.sites.length) {
                // Handle sites change
            }
        });
        
        // Trigger state change
        siteStore.getState().addSite({
            id: 'sub-site',
            name: 'Subscription Site',
            url: 'https://sub.com',
            status: 'online',
            responseTime: 300,
            uptime: 98.5,
            lastCheck: Date.now(),
            created: Date.now(),
            tags: []
        });
        
        unsubscribe();
    }, { warmupIterations: 10, iterations: 1000 });

    bench("multiple store subscriptions", () => {
        siteStore = new MockZustandStore(createSiteStore);
        const unsubscribers: (() => void)[] = [];
        
        // Add 10 subscribers
        for (let i = 0; i < 10; i++) {
            const unsubscribe = siteStore.subscribe((state) => {
                // Simulate different listener behaviors
                if (i % 2 === 0) {
                    // UI update simulation
                } else {
                    // Analytics tracking simulation
                }
            });
            unsubscribers.push(unsubscribe);
        }
        
        // Trigger state changes
        for (let i = 0; i < 5; i++) {
            siteStore.getState().addSite({
                id: `multi-sub-site-${i}`,
                name: `Multi Sub Site ${i}`,
                url: `https://multi${i}.com`,
                status: 'online',
                responseTime: 200,
                uptime: 99,
                lastCheck: Date.now(),
                created: Date.now(),
                tags: []
            });
        }
        
        // Cleanup
        unsubscribers.forEach(unsub => unsub());
    }, { warmupIterations: 5, iterations: 300 });

    bench("complex state updates", () => {
        siteStore = new MockZustandStore(createSiteStore);
        monitorStore = new MockZustandStore(createMonitorStore);
        dashboardStore = new MockZustandStore(createDashboardStore);
        
        // Simulate complex workflow
        const site: Site = {
            id: 'complex-site',
            name: 'Complex Site',
            url: 'https://complex.com',
            status: 'online',
            responseTime: 250,
            uptime: 99.5,
            lastCheck: Date.now(),
            created: Date.now(),
            tags: ['critical', 'api']
        };
        
        siteStore.getState().addSite(site);
        
        const monitor: Monitor = {
            id: 'complex-monitor',
            siteId: site.id,
            type: 'http',
            interval: 30000,
            timeout: 5000,
            configuration: { method: 'GET' },
            enabled: true,
            created: Date.now()
        };
        
        monitorStore.getState().addMonitor(monitor);
        monitorStore.getState().startMonitor(monitor.id);
        
        dashboardStore.getState().addActivity({
            id: 'complex-activity',
            type: 'monitor_created',
            timestamp: Date.now(),
            message: `Monitor created for ${site.name}`,
            metadata: { siteId: site.id, monitorId: monitor.id }
        });
    }, { warmupIterations: 5, iterations: 500 });

    bench("store destruction", () => {
        siteStore = new MockZustandStore(createSiteStore);
        // Add some subscribers
        const unsubscribe1 = siteStore.subscribe(() => {});
        const unsubscribe2 = siteStore.subscribe(() => {});
        
        siteStore.destroy();
    }, { warmupIterations: 10, iterations: 2000 });
});
