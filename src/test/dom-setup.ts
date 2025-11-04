/**
 * DOM-specific setup for Vitest frontend tests Enhanced DOM environment
 * configuration for better React component testing
 */

import "@testing-library/jest-dom";
import fc from "fast-check";
import { resolveFastCheckEnvOverrides } from "@shared/test/utils/fastCheckEnv";
import { afterAll, beforeAll, vi } from "vitest";
import EventEmitter from "node:events";

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

// Set default max listeners for all EventEmitter instances
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

// Set max listeners specifically for the process object
process.setMaxListeners(MAX_LISTENERS);

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
    timeout: 1000, // Per-case async timeout (ms)
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

// Enhanced DOM polyfills for comprehensive testing support
beforeAll(() => {
    // Mock window.matchMedia for responsive design testing
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

    // Mock IntersectionObserver for component visibility testing
    globalThis.IntersectionObserver = class MockIntersectionObserver {
        root = null;
        rootMargin = "";
        thresholds = [];

        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    } as any;

    // Mock ResizeObserver for responsive component testing
    globalThis.ResizeObserver = class MockResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as any;

    // Mock requestIdleCallback for performance testing
    globalThis.requestIdleCallback = (
        callback: IdleRequestCallback
    ): number => {
        const id = setTimeout(
            () =>
                callback({
                    didTimeout: false,
                    timeRemaining: () => 50,
                }),
            1
        );
        return id as unknown as number;
    };

    globalThis.cancelIdleCallback = (id: number): void => {
        clearTimeout(id as unknown as number);
    };

    // Mock getComputedStyle for CSS-dependent tests
    globalThis.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue(""),
    });

    // Mock Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Mock Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
    });

    // Mock navigator properties
    Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: {
            writeText: vi.fn().mockResolvedValue(undefined),
            readText: vi.fn().mockResolvedValue(""),
        },
    });

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock File and FileReader for file upload testing
    globalThis.File = class MockFile {
        public readonly chunks: any[];

        public readonly name: string;

        public readonly options: any;

        public constructor(chunks: any[], name: string, options: any = {}) {
            this.chunks = chunks;
            this.name = name;
            this.options = options;
        }
        get size() {
            return this.chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        }
        get type() {
            return this.options.type || "";
        }
        get lastModified() {
            return this.options.lastModified || Date.now();
        }
    } as any;

    globalThis.FileReader = class MockFileReader {
        readAsDataURL = vi.fn();
        readAsText = vi.fn();
        result = "";
        onload = null;
        onerror = null;
    } as any;

    // Mock performance.now for timing tests
    globalThis.performance.now = vi.fn(() => Date.now());

    // Mock console methods to reduce test noise (optional)
    const originalConsole = { ...console };
    globalThis.console = {
        ...originalConsole,
        // Suppress console.log in tests unless specifically needed
        log: process.env["NODE_ENV"] === "test" ? vi.fn() : originalConsole.log,
        debug:
            process.env["NODE_ENV"] === "test"
                ? vi.fn()
                : originalConsole.debug,
        info: originalConsole.info,
        warn: originalConsole.warn,
        error: originalConsole.error,
    };
});

// Cleanup after each test
afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset DOM state
    document.body.innerHTML = "";
    document.head.innerHTML = "";
});

// Global cleanup
afterAll(() => {
    // Restore original console
    Object.assign(console, console);
});
