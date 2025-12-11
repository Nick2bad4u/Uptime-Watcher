/**
 * Component State Management Performance Benchmarks
 *
 * @file Performance benchmarks for React component state management operations.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Frontend-ComponentState
 *
 * @tags ["performance", "react", "state", "hooks"]
 */

import { bench, describe } from "vitest";

// Mock React hooks for benchmarking
interface HookState<T> {
    value: T;
    setValue: (newValue: T | ((prev: T) => T)) => void;
    subscribers: Set<() => void>;
}

class MockHookManager {
    private hooks = new Map<string, HookState<any>>();
    private currentHookId = 0;

    useState<T>(
        initialValue: T
    ): [T, (newValue: T | ((prev: T) => T)) => void] {
        const hookId = `useState-${this.currentHookId++}`;

        if (!this.hooks.has(hookId)) {
            const hookState: HookState<T> = {
                value: initialValue,
                setValue: (newValue) => {
                    const prevValue = hookState.value;
                    hookState.value =
                        typeof newValue === "function"
                            ? (newValue as (prev: T) => T)(prevValue)
                            : newValue;

                    // Notify subscribers (simulate re-render)
                    hookState.subscribers.forEach((callback) => callback());
                },
                subscribers: new Set(),
            };
            this.hooks.set(hookId, hookState);
        }

        const hook = this.hooks.get(hookId)!;
        return [hook.value, hook.setValue];
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    useEffect(effect: () => (() => void) | void, deps?: any[]): void {
        const hookId = `useEffect-${this.currentHookId++}`;

        // Simulate effect execution
        const cleanup = effect();

        // Store cleanup for later
        if (cleanup && typeof cleanup === "function") {
            setTimeout(cleanup, 0);
        }
    }

    useCallback<T extends (...args: any[]) => any>(
        callback: T,
        deps: any[]
    ): T {
        const hookId = `useCallback-${this.currentHookId++}`;
        // In real React, this would memoize based on deps
        return callback;
    }

    useMemo<T>(factory: () => T, deps: any[]): T {
        const hookId = `useMemo-${this.currentHookId++}`;
        // In real React, this would memoize based on deps
        return factory();
    }

    useRef<T>(initialValue: T): { current: T } {
        const hookId = `useRef-${this.currentHookId++}`;

        if (!this.hooks.has(hookId)) {
            this.hooks.set(hookId, {
                value: { current: initialValue },
                setValue: () => {},
                subscribers: new Set(),
            });
        }

        return this.hooks.get(hookId)!.value;
    }

    reset(): void {
        this.hooks.clear();
        this.currentHookId = 0;
    }
}

// Mock component implementations using hooks
class MockSiteCardComponent {
    private hookManager = new MockHookManager();
    private readonly props: {
        site: any;
        onStatusChange?: (status: string) => void;
    };

    constructor(props: {
        site: any;
        onStatusChange?: (status: string) => void;
    }) {
        this.props = props;
    }

    render() {
        const [isExpanded, setIsExpanded] = this.hookManager.useState(false);
        const [localStatus, setLocalStatus] = this.hookManager.useState(
            this.props.site.status
        );
        const [animating, setAnimating] = this.hookManager.useState(false);

        const handleToggle = this.hookManager.useCallback(() => {
            setAnimating(true);
            setIsExpanded(!isExpanded);
            setTimeout(() => setAnimating(false), 300);
        }, [isExpanded]);

        const statusColor = this.hookManager.useMemo(() => {
            switch (localStatus) {
                case "online": {
                    return "#10b981";
                }
                case "offline": {
                    return "#ef4444";
                }
                case "degraded": {
                    return "#f59e0b";
                }
                default: {
                    return "#6b7280";
                }
            }
        }, [localStatus]);

        this.hookManager.useEffect(() => {
            if (this.props.site.status !== localStatus) {
                setLocalStatus(this.props.site.status);
                this.props.onStatusChange?.(this.props.site.status);
            }
        }, [this.props.site.status]);

        return {
            isExpanded,
            localStatus,
            animating,
            statusColor,
            handleToggle,
        };
    }
}

class MockSiteListComponent {
    private hookManager = new MockHookManager();
    private readonly props: { sites: any[]; filters?: any };

    constructor(props: { sites: any[]; filters?: any }) {
        this.props = props;
    }

    render() {
        const [selectedSites, setSelectedSites] = this.hookManager.useState<
            Set<string>
        >(new Set());
        const [sortOrder, setSortOrder] = this.hookManager.useState<
            "asc" | "desc"
        >("asc");
        const [loading, setLoading] = this.hookManager.useState(false);

        const filteredSites = this.hookManager.useMemo(() => {
            let filtered = Array.from(this.props.sites);

            if (this.props.filters?.status) {
                filtered = filtered.filter((site) =>
                    this.props.filters.status.includes(site.status));
            }

            if (this.props.filters?.searchTerm) {
                filtered = filtered.filter((site) =>
                    site.name
                        .toLowerCase()
                        .includes(this.props.filters.searchTerm.toLowerCase()));
            }

            return filtered.toSorted((a, b) => {
                const modifier = sortOrder === "asc" ? 1 : -1;
                return a.name.localeCompare(b.name) * modifier;
            });
        }, [
            this.props.sites,
            this.props.filters,
            sortOrder,
        ]);

        const selectSite = this.hookManager.useCallback((
            siteIdentifier: string
        ) => {
            setSelectedSites((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(siteIdentifier)) {
                    newSet.delete(siteIdentifier);
                } else {
                    newSet.add(siteIdentifier);
                }
                return newSet;
            });
        }, []);

        const selectAllSites = this.hookManager.useCallback(() => {
            setSelectedSites(new Set(filteredSites.map((site) => site.id)));
        }, [filteredSites]);

        const clearSelection = this.hookManager.useCallback(() => {
            setSelectedSites(new Set());
        }, []);

        return {
            selectedSites,
            sortOrder,
            loading,
            filteredSites,
            selectSite,
            selectAllSites,
            clearSelection,
            setSortOrder,
            setLoading,
        };
    }
}

class MockDashboardComponent {
    private hookManager = new MockHookManager();
    private readonly props: { initialData?: any };

    constructor(props: { initialData?: any }) {
        this.props = props;
    }

    render() {
        const [dashboardData, setDashboardData] = this.hookManager.useState(
            this.props.initialData || {}
        );
        const [refreshing, setRefreshing] = this.hookManager.useState(false);
        const [lastUpdated, setLastUpdated] = this.hookManager.useState(
            Date.now()
        );
        const [autoRefresh, setAutoRefresh] = this.hookManager.useState(true);
        const [refreshInterval, setRefreshInterval] =
            this.hookManager.useState(30_000);

        const refreshIntervalRef =
            this.hookManager.useRef<NodeJS.Timeout | null>(null);

        const refreshData = this.hookManager.useCallback(async () => {
            setRefreshing(true);

            // Simulate API call
            setTimeout(() => {
                setDashboardData({
                    summary: {
                        totalSites: Math.floor(Math.random() * 100),
                        onlineSites: Math.floor(Math.random() * 80),
                        uptime: 90 + Math.random() * 10,
                    },
                    recentActivity: Array.from({ length: 10 }, (_, i) => ({
                        id: `activity-${i}`,
                        message: `Activity ${i}`,
                        timestamp: Date.now() - i * 60_000,
                    })),
                });
                setLastUpdated(Date.now());
                setRefreshing(false);
            }, 100);
        }, []);

        const toggleAutoRefresh = this.hookManager.useCallback(() => {
            setAutoRefresh((prev) => !prev);
        }, []);

        // Auto-refresh effect
        this.hookManager.useEffect(() => {
            if (autoRefresh) {
                refreshIntervalRef.current = setInterval(
                    refreshData,
                    refreshInterval
                );
                return () => {
                    if (refreshIntervalRef.current) {
                        clearInterval(refreshIntervalRef.current);
                    }
                };
            }
            return undefined;
        }, [
            autoRefresh,
            refreshInterval,
            refreshData,
        ]);

        const summaryStats = this.hookManager.useMemo(() => {
            if (!dashboardData.summary) return {};

            const { totalSites, onlineSites } = dashboardData.summary;
            return {
                uptimePercentage:
                    totalSites > 0 ? (onlineSites / totalSites) * 100 : 0,
                offlineSites: totalSites - onlineSites,
                statusDistribution: {
                    online: onlineSites,
                    offline: totalSites - onlineSites,
                },
            };
        }, [dashboardData.summary]);

        return {
            dashboardData,
            refreshing,
            lastUpdated,
            autoRefresh,
            refreshInterval,
            summaryStats,
            refreshData,
            toggleAutoRefresh,
            setRefreshInterval,
        };
    }
}

class MockFormComponent {
    private hookManager = new MockHookManager();
    private readonly props: {
        initialValues?: any;
        onSubmit?: (values: any) => void;
    };

    constructor(props: {
        initialValues?: any;
        onSubmit?: (values: any) => void;
    }) {
        this.props = props;
    }

    render() {
        const [formData, setFormData] = this.hookManager.useState(
            this.props.initialValues || {}
        );
        const [errors, setErrors] = this.hookManager.useState<
            Record<string, string>
        >({});
        const [isSubmitting, setIsSubmitting] =
            this.hookManager.useState(false);
        const [touched, setTouched] = this.hookManager.useState<
            Record<string, boolean>
        >({});

        const validateField = this.hookManager.useCallback((
            name: string,
            value: any
        ) => {
            const fieldErrors: Record<string, string> = {};

            if (name === "name" && (!value || value.trim().length < 2)) {
                fieldErrors.name = "Name must be at least 2 characters";
            }

            if (name === "url" && (!value || !value.startsWith("http"))) {
                fieldErrors.url = "URL must start with http:// or https://";
            }

            if (name === "interval" && (!value || value < 30)) {
                fieldErrors.interval = "Interval must be at least 30 seconds";
            }

            return fieldErrors;
        }, []);

        const updateField = this.hookManager.useCallback(
            (name: string, value: any) => {
                setFormData((prev) => ({ ...prev, [name]: value }));

                const fieldErrors = validateField(name, value);
                setErrors((prev) => ({ ...prev, ...fieldErrors }));

                setTouched((prev) => ({ ...prev, [name]: true }));
            },
            [validateField]
        );

        const validateForm = this.hookManager.useCallback(() => {
            const allErrors: Record<string, string> = {};

            Object.keys(formData).forEach((field) => {
                const fieldErrors = validateField(field, formData[field]);
                Object.assign(allErrors, fieldErrors);
            });

            setErrors(allErrors);
            return Object.keys(allErrors).length === 0;
        }, [formData, validateField]);

        const handleSubmit = this.hookManager.useCallback(async () => {
            setIsSubmitting(true);

            if (validateForm()) {
                try {
                    await this.props.onSubmit?.(formData);
                } catch {
                    setErrors({ submit: "Failed to submit form" });
                }
            }

            setIsSubmitting(false);
        }, [formData, validateForm]);

        const resetForm = this.hookManager.useCallback(() => {
            setFormData(this.props.initialValues || {});
            setErrors({});
            setTouched({});
        }, []);

        const isValid = this.hookManager.useMemo(
            () =>
                Object.keys(errors).length === 0 &&
                Object.keys(formData).length > 0,
            [errors, formData]
        );

        return {
            formData,
            errors,
            isSubmitting,
            touched,
            isValid,
            updateField,
            handleSubmit,
            resetForm,
            validateForm,
        };
    }
}

describe("Component State Management Performance", () => {
    let hookManager: MockHookManager;

    bench(
        "hook manager initialization",
        () => {
            hookManager = new MockHookManager();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "useState hook",
        () => {
            hookManager = new MockHookManager();
            const [count, setCount] = hookManager.useState(0);
            setCount(1);
            setCount((prev) => prev + 1);
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "multiple useState hooks",
        () => {
            hookManager = new MockHookManager();
            const [name, setName] = hookManager.useState("");
            const [email, setEmail] = hookManager.useState("");
            const [age, setAge] = hookManager.useState(0);
            const [active, setActive] = hookManager.useState(false);

            setName("John Doe");
            setEmail("john@example.com");
            setAge(30);
            setActive(true);
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "useEffect hook",
        () => {
            hookManager = new MockHookManager();
            hookManager.useEffect(
                () =>
                    // Simulate side effect
                    () => {
                        // Cleanup
                    },
                []
            );
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "useCallback hook",
        () => {
            hookManager = new MockHookManager();
            const callback = hookManager.useCallback(
                () => "memoized function",
                []
            );
            callback();
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "useMemo hook",
        () => {
            hookManager = new MockHookManager();
            const expensiveValue = hookManager.useMemo(() => {
                // Simulate expensive calculation
                let result = 0;
                for (let i = 0; i < 100; i++) {
                    result += Math.random();
                }
                return result;
            }, []);
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "useRef hook",
        () => {
            hookManager = new MockHookManager();
            const ref = hookManager.useRef<HTMLElement | null>(null);
            ref.current = { tagName: "div" } as any;
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "site card component render",
        () => {
            const siteData = {
                id: "site-1",
                name: "Example Site",
                status: "online",
                responseTime: 250,
                uptime: 99.5,
            };

            const component = new MockSiteCardComponent({
                site: siteData,
                onStatusChange: (status) => {},
            });
            component.render();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "site list component render",
        () => {
            const sitesData = Array.from({ length: 20 }, (_, i) => ({
                id: `site-${i}`,
                name: `Site ${i}`,
                status: ["online", "offline"][i % 2],
                responseTime: Math.random() * 1000,
            }));

            const component = new MockSiteListComponent({
                sites: sitesData,
                filters: { status: ["online"], searchTerm: "" },
            });
            component.render();
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "dashboard component render",
        () => {
            const initialData = {
                summary: {
                    totalSites: 50,
                    onlineSites: 45,
                    uptime: 95.5,
                },
                recentActivity: Array.from({ length: 10 }, (_, i) => ({
                    id: `activity-${i}`,
                    message: `Activity ${i}`,
                    timestamp: Date.now() - i * 60_000,
                })),
            };

            const component = new MockDashboardComponent({ initialData });
            component.render();
        },
        { warmupIterations: 10, iterations: 300 }
    );

    bench(
        "form component render",
        () => {
            const initialValues = {
                name: "",
                url: "",
                interval: 60,
                enabled: true,
            };

            const component = new MockFormComponent({
                initialValues,
                onSubmit: async (values) => {
                    // Simulate form submission
                    await new Promise((resolve) => setTimeout(resolve, 50));
                },
            });
            component.render();
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "complex state updates",
        () => {
            const sitesData = Array.from({ length: 100 }, (_, i) => ({
                id: `complex-site-${i}`,
                name: `Complex Site ${i}`,
                status: [
                    "online",
                    "offline",
                    "degraded",
                ][i % 3],
                responseTime: Math.random() * 1000,
            }));

            const component = new MockSiteListComponent({
                sites: sitesData,
                filters: { status: [], searchTerm: "" },
            });

            const state = component.render();

            // Simulate rapid state changes
            for (let i = 0; i < 10; i++) {
                state.selectSite(`complex-site-${i}`);
            }

            state.selectAllSites();
            state.clearSelection();
            state.setSortOrder("desc");
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "form validation workflow",
        () => {
            const component = new MockFormComponent({
                initialValues: {},
                onSubmit: async () => {},
            });

            const state = component.render();

            // Simulate user input
            state.updateField("name", "Te"); // Too short
            state.updateField("name", "Test Site");
            state.updateField("url", "invalid-url");
            state.updateField("url", "https://test.com");
            state.updateField("interval", 15); // Too small
            state.updateField("interval", 60);

            state.validateForm();
            state.handleSubmit();
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "dashboard refresh cycle",
        () => {
            const component = new MockDashboardComponent({});
            const state = component.render();

            // Simulate multiple refresh cycles
            for (let i = 0; i < 5; i++) {
                state.refreshData();
            }

            state.toggleAutoRefresh();
            state.setRefreshInterval(15_000);
            state.toggleAutoRefresh();
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "massive component state",
        () => {
            hookManager = new MockHookManager();

            // Simulate component with many state variables
            const stateValues: any[] = [];
            const setters: any[] = [];

            for (let i = 0; i < 50; i++) {
                const [value, setValue] = hookManager.useState(`initial-${i}`);
                stateValues.push(value);
                setters.push(setValue);
            }

            // Update all state values
            setters.forEach((setter, index) => {
                setter(`updated-${index}`);
            });
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "hook cleanup",
        () => {
            hookManager = new MockHookManager();

            // Create multiple hooks
            for (let i = 0; i < 20; i++) {
                hookManager.useState(i);
                hookManager.useEffect(
                    () => () => {}, // Cleanup function
                    []
                );
                hookManager.useCallback(() => {}, []);
                hookManager.useMemo(() => i * 2, [i]);
                hookManager.useRef(null);
            }

            hookManager.reset();
        },
        { warmupIterations: 10, iterations: 500 }
    );
});
