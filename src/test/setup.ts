/**
 * Test setup file for Vitest. Configures testing environment for React
 * components.
 */

import { beforeEach, vi, type MockInstance } from "vitest";
import "@testing-library/jest-dom";
import fc from "fast-check";
import { resolveFastCheckEnvOverrides } from "@shared/test/utils/fastCheckEnv";

import EventEmitter from "node:events";



import { useErrorStore } from "../stores/error/useErrorStore";

// Stub problematic aria-query literal-role metadata to avoid SyntaxError
// crashes originating from third-party role maps while keeping matchers
// available. Vitest hoists vi.mock calls, so these apply before consumers are
// loaded.
vi.mock("aria-query/lib/etc/roles/ariaLiteralRoles", () => ({
    __esModule: true as const,
    default: [] as const,
}));
vi.mock("aria-query/lib/etc/roles/ariaLiteralRoles.js", () => ({
    __esModule: true as const,
    default: [] as const,
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

type GenericEmitWarning = (...emitArgs: unknown[]) => unknown;

const SUPPRESSED_WARNING_SIGNATURES = [
    "`--localstorage-file` was provided without a valid path",
] as const;

const originalEmitWarning = process.emitWarning.bind(
    process
) as GenericEmitWarning;

process.emitWarning = ((warning: unknown, ...args: unknown[]) => {
    const message =
        typeof warning === "string"
            ? warning
            : warning instanceof Error
              ? warning.message
              : "";

    if (
        message !== "" &&
        SUPPRESSED_WARNING_SIGNATURES.some((fragment) =>
            message.includes(fragment)
        )
    ) {
        return;
    }

    originalEmitWarning(warning, ...args);
}) as typeof process.emitWarning;

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

// Set default max listeners for all EventEmitter instances
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

// Set max listeners specifically for the process object
process.setMaxListeners(MAX_LISTENERS);

// Handle unhandled promise rejections from async tests
// Only suppress errors that are expected from abort/retry tests
const originalUnhandledRejection = process.listeners("unhandledRejection");

process.removeAllListeners("unhandledRejection");

process.on("unhandledRejection", (reason: unknown) => {
    // Only suppress expected test error messages
    if (
        reason instanceof Error &&
        (reason.message.includes("Always fails") ||
            reason.message.includes("Fails") ||
            reason.message.includes("Operation was aborted") ||
            reason.message.includes("string error"))
    ) {
        // These are expected test failures, ignore them
        return;
    }

    // For any other unhandled rejections, call original handlers
    for (const handler of originalUnhandledRejection) {
        if (typeof handler === "function") {
            handler(reason, new Promise(() => {}));
        }
    }
});

// Configure fast-check for property-based testing
const current = fc.readConfigureGlobal() ?? {};
const baseNumRuns = (current as { numRuns?: number }).numRuns ?? 10;
const fastCheckOverrides = resolveFastCheckEnvOverrides(baseNumRuns);

// Optional: example custom reporter (uncomment + adapt if you want structured output)
// const jsonReporter = (runDetails: any) => {
//   // e.g., write to a log file or console as JSON for CI parsing
//   // require('fs').appendFileSync('fc-report.json', JSON.stringify(runDetails) + '\n');
//   if (runDetails.failed) {
//     // default behavior is to throw; you can customize here if you prefer
//     throw new Error(`Property failed: seed=${runDetails.seed} path=${runDetails.path}`);
//   }
// };

fc.configureGlobal({
    ...current,
    ...fastCheckOverrides,

    // Reporting / debugging helpers
    verbose: 2, // 0 = quiet, 1 = medium, 2 = most verbose
    includeErrorInReport: true, // Include the original error text (helps many runners)

    // Failure and time limits
    endOnFailure: true, // Stop on first property failure
    timeout: 3000, // Per-case async timeout (ms) — allow slower async DOM/property cases
    interruptAfterTimeLimit: 5 * 60 * 1000, // Overall cap for a run (ms)
    markInterruptAsFailure: true, // Treat interrupts as failures (good for CI)
    skipAllAfterTimeLimit: 60 * 1000, // Cap time spent on skipping/shrinking (ms)

    // Duplicate handling and skipping
    maxSkipsPerRun: 100, // Tolerance for preconditions / filters
    // skipEqualValues: true, // skip duplicates while still achieving numRuns

    // Examples and sampling
    // examples: [],          // add any concrete inputs you want always tested
    // unbiased: false,    // keep default biasing unless you need unbiased generators

    // RNG / reproducibility
    // seed: undefined,    // set a specific number to reproduce runs
    // randomType: 'xorshift128plus', // default; change if you need a different generator

    // Replace reporter if you want custom behavior:
    // reporter: jsonReporter,
    // asyncReporter: async (runDetails) => { /* async reporting */ },
});

let windowOpenSpy: MockInstance | undefined;

if (typeof window !== "undefined" && typeof window.open === "function") {
    windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
}

beforeEach(() => {
    windowOpenSpy?.mockClear();

    // ErrorStore is global Zustand state used by multiple UI layers. Reset it
    // between tests to prevent cross-suite contamination.
    useErrorStore.setState({
        operationLoading: {},
        storeErrors: {},
    });
});

/**
 * Minimal mock implementation of {@link ResizeObserver} for the test
 * environment.
 */
class MockResizeObserver {
    /**
     * Callback triggered when observed elements change size.
     */
    private readonly callback: ResizeObserverCallback;

    /** Observe spy for assertions. */
    public readonly observe: ReturnType<typeof vi.fn>;

    /** Unobserve spy for assertions. */
    public readonly unobserve: ReturnType<typeof vi.fn>;

    /** Disconnect spy for assertions. */
    public readonly disconnect: ReturnType<typeof vi.fn>;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        this.observe = vi.fn();
        this.unobserve = vi.fn();
        this.disconnect = vi.fn();
    }

    /**
     * Utility helper for tests to manually trigger callbacks.
     */
    public trigger(entries: ResizeObserverEntry[] = []): void {
        this.callback(entries, this as unknown as ResizeObserver);
    }
}

globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

/**
 * Minimal Web Storage implementation used when Node.js exposes an incomplete
 * `localStorage` or `sessionStorage` shim via experimental flags.
 */
interface StorageShim {
    readonly length: number;
    clear: () => void;
    getItem: (key: string) => string | null;
    key: (index: number) => string | null;
    removeItem: (key: string) => void;
    setItem: (key: string, value: string) => void;
}

/**
 * Supported storage keys that require reliable mocks during tests.
 */
type StorageKey = "localStorage" | "sessionStorage";

/**
 * Storage methods that must exist on a usable Web Storage implementation.
 */
const STORAGE_METHODS: readonly (keyof StorageShim)[] = [
    "clear",
    "getItem",
    "key",
    "removeItem",
    "setItem",
];

/**
 * Creates an in-memory Map-backed storage implementation matching the Web
 * Storage API used by browsers.
 */
const createStorageShim = (): StorageShim => {
    const storage = new Map<string, string>();

    return {
        get length(): number {
            return storage.size;
        },
        clear(): void {
            storage.clear();
        },
        getItem(key: string): string | null {
            return storage.has(key) ? (storage.get(key) ?? null) : null;
        },
        key(index: number): string | null {
            return Array.from(storage.keys())[index] ?? null;
        },
        removeItem(key: string): void {
            storage.delete(key);
        },
        setItem(key: string, value: string): void {
            storage.set(key, String(value));
        },
    } satisfies StorageShim;
};

/**
 * Determines whether the provided value already implements the Web Storage API
 * surface that our tests rely on.
 */
const hasValidStorage = (candidate: unknown): candidate is StorageShim => {
    if (candidate === null || typeof candidate !== "object") {
        return false;
    }

    const descriptor = Reflect.getOwnPropertyDescriptor(candidate, "length");
    const lengthValue = (candidate as { length?: unknown }).length;
    const hasLength =
        typeof lengthValue === "number" ||
        (typeof descriptor?.get === "function" &&
            typeof descriptor.get.call(candidate) === "number");

    if (!hasLength) {
        return false;
    }

    return STORAGE_METHODS.every(
        (method) =>
            typeof (candidate as Record<string, unknown>)[method] === "function"
    );
};

/**
 * Ensures `globalThis` exposes a fully functional storage implementation under
 * the given key, overriding Node's placeholder when necessary.
 */
const ensureStorage = (storageKey: StorageKey): void => {
    const existing = Reflect.get(globalThis, storageKey) as unknown;

    if (hasValidStorage(existing)) {
        return;
    }

    Object.defineProperty(globalThis, storageKey, {
        configurable: true,
        enumerable: true,
        value: createStorageShim(),
        writable: true,
    });
};

ensureStorage("localStorage");
ensureStorage("sessionStorage");


// Suppress noisy CSS parse errors emitted by JSDOM for modern CSS features
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const cssParseWarningSignature = "Could not parse CSS stylesheet";

const containsCssParseWarning = (args: readonly unknown[]): boolean =>
    args.some((argument) => {
        if (typeof argument === "string") {
            return argument.includes(cssParseWarningSignature);
        }

        if (argument instanceof Error) {
            return argument.message.includes(cssParseWarningSignature);
        }

        return false;
    });

const suppressCssParseWarning = <
    Logger extends (...loggerArgs: unknown[]) => void,
>(
    logger: Logger
): Logger =>
    ((...loggerArgs: Parameters<Logger>) => {
        if (containsCssParseWarning(loggerArgs)) {
            return;
        }

        logger(...loggerArgs);
    }) as Logger;

console.error = suppressCssParseWarning(originalConsoleError);
console.warn = suppressCssParseWarning(originalConsoleWarn);

// Mock window.matchMedia for theme tests
Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock crypto API for UUID generation
Object.defineProperty(globalThis, "crypto", {
    value: {
        randomUUID: vi.fn(
            () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
        ),
        getRandomValues: vi.fn((arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        }),
    },
    writable: true,
});

// Mock document.body.classList for theme tests
Object.defineProperty(document.body, "classList", {
    value: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn(),
    },
    writable: true,
});

// Individual tests should manage their own DOM setup for getElementById

vi.mock("electron-log/renderer", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        transports: {
            console: {
                level: "debug",
                format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            },
            file: {
                level: "info",
            },
        },
    },
}));

// Mock comprehensive theme for testing
const mockTheme = {
    borderRadius: {
        full: "9999px",
        lg: "0.5rem",
        md: "0.375rem",
        none: "0",
        sm: "0.125rem",
        xl: "0.75rem",
    },
    colors: {
        background: {
            modal: "rgba(0, 0, 0, 0.5)",
            primary: "#ffffff",
            secondary: "#f9fafb",
            tertiary: "#f3f4f6",
        },
        border: {
            focus: "#3b82f6",
            primary: "#e5e7eb",
            secondary: "#d1d5db",
        },
        error: "#ef4444",
        errorAlert: "#991b1b",
        hover: {
            dark: "rgba(0, 0, 0, 0.08)",
            light: "rgba(0, 0, 0, 0.03)",
            medium: "rgba(0, 0, 0, 0.05)",
        },
        info: "#3b82f6",
        primary: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
        },
        status: {
            down: "#ef4444",
            mixed: "#8b5cf6",
            paused: "#6b7280",
            pending: "#f59e0b",
            unknown: "#6b7280",
            up: "#10b981",
        },
        success: "#10b981",
        surface: {
            base: "#ffffff",
            elevated: "#ffffff",
            overlay: "#f9fafb",
        },
        text: {
            inverse: "#ffffff",
            primary: "#111827",
            secondary: "#6b7280",
            tertiary: "#9ca3af",
        },
        warning: "#f59e0b",
    },
    isDark: false,
    name: "light" as const,
    shadows: {
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    spacing: {
        "2xl": "3rem",
        "3xl": "4rem",
        lg: "1.5rem",
        md: "1rem",
        sm: "0.5rem",
        xl: "2rem",
        xs: "0.25rem",
    },
    typography: {
        fontFamily: {
            mono: [
                "SF Mono",
                "Monaco",
                "Inconsolata",
                "Roboto Mono",
                "monospace",
            ] as const,
            sans: [
                "Inter",
                "system-ui",
                "Avenir",
                "Helvetica",
                "Arial",
                "sans-serif",
            ] as const,
        },
        fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
            "5xl": "3rem",
            "6xl": "3.75rem",
        },
        fontWeight: {
            thin: 100,
            extralight: 200,
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
        },
        lineHeight: {
            none: 1,
            tight: 1.25,
            snug: 1.375,
            normal: 1.5,
            relaxed: 1.625,
            loose: 2,
        },
    },
};

// Mock theme context globally with complete functionality
vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        ...mockTheme,
        availableThemes: [
            "light",
            "dark",
            "system",
        ],
        currentTheme: mockTheme,
        getColor: vi.fn((path: string) => {
            const keys = path.split(".");
            let value: any = mockTheme.colors;
            for (const key of keys) {
                if (value && typeof value === "object" && key in value) {
                    value = value[key];
                } else {
                    value = undefined;
                    break;
                }
            }
            return typeof value === "string"
                ? value
                : mockTheme.colors.text.primary;
        }),
        getStatusColor: vi.fn(
            (status: string) =>
                mockTheme.colors.status[
                    status as keyof typeof mockTheme.colors.status
                ] || mockTheme.colors.text.secondary
        ),
        isDark: false,
        setTheme: vi.fn(),
        systemTheme: "light" as const,
        themeManager: {
            getTheme: vi.fn(() => mockTheme),
            applyTheme: vi.fn(),
            getAvailableThemes: vi.fn(() => [
                "light",
                "dark",
                "system",
            ]),
            onSystemThemeChange: vi.fn(() => vi.fn()),
            getSystemThemePreference: vi.fn(() => "light"),
        },
        themeName: "light" as const,
        themeVersion: 1,
        toggleTheme: vi.fn(),
    }),
    useAvailabilityColors: () => ({
        getAvailabilityColor: vi.fn((percentage: number) => {
            if (percentage >= 95) return mockTheme.colors.status.up;
            if (percentage >= 80) return mockTheme.colors.warning;
            return mockTheme.colors.error;
        }),
        getAvailabilityDescription: vi.fn((percentage: number) => {
            const clampedPercentage = Math.max(0, Math.min(100, percentage));
            if (clampedPercentage >= 99.9) return "Excellent";
            if (clampedPercentage >= 99) return "Very Good";
            if (clampedPercentage >= 95) return "Good";
            if (clampedPercentage >= 90) return "Fair";
            if (clampedPercentage >= 80) return "Poor";
            if (clampedPercentage >= 50) return "Critical";
            return "Failed";
        }),
        getAvailabilityVariant: vi.fn((percentage: number) => {
            if (percentage >= 95) return "success";
            if (percentage >= 80) return "warning";
            return "danger";
        }),
    }),
    useStatusColors: () => ({
        down: mockTheme.colors.status.down,
        pending: mockTheme.colors.status.pending,
        unknown: mockTheme.colors.status.unknown,
        up: mockTheme.colors.status.up,
    }),
    useThemeClasses: () => ({
        getBackgroundClass: vi.fn((variant = "primary") => ({
            backgroundColor: `var(--color-background-${variant})`,
        })),
        getBorderClass: vi.fn((variant = "primary") => ({
            borderColor: `var(--color-border-${variant})`,
        })),
        getColor: vi.fn((path: string) => {
            const keys = path.split(".");
            let value: any = mockTheme.colors;
            for (const key of keys) {
                if (value && typeof value === "object" && key in value) {
                    value = value[key];
                } else {
                    value = undefined;
                    break;
                }
            }
            return typeof value === "string"
                ? value
                : mockTheme.colors.text.primary;
        }),
        getStatusClass: vi.fn((status: string) => ({
            color: `var(--color-status-${status})`,
        })),
        getSurfaceClass: vi.fn((variant = "base") => ({
            backgroundColor: `var(--color-surface-${variant})`,
        })),
        getTextClass: vi.fn((variant = "primary") => ({
            color: `var(--color-text-${variant})`,
        })),
    }),
    useThemeValue: vi.fn((selector) => selector(mockTheme)),
}));

// Export mocks for use in individual tests
export {  mockTheme };

// Custom test context setup for task and annotate properties
// Note: The actual type definitions are in src/types/vitest-context.d.ts
import "./vitest-context-setup";

// Provide global fail function if not already defined
if ((globalThis as any).fail === undefined) {
    (globalThis as any).fail = (message?: string): never => {
        throw new Error(message ?? "Test failed");
    };
}

export {mockElectronAPI} from "./mock-setup";
