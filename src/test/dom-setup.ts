/**
 * DOM-specific setup for Vitest frontend tests Enhanced DOM environment
 * configuration for better React component testing
 */

import "@testing-library/jest-dom";
import fc from "fast-check";
import { resolveFastCheckEnvOverrides } from "@shared/test/utils/fastCheckEnv";
import { afterAll, beforeAll, vi } from "vitest";
import { EventEmitter } from "node:events";

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

const idleRequestTimers = new Map<number, ReturnType<typeof setTimeout>>();
let idleRequestIdentifier = 0;

const NOOP_INTERSECTION_OBSERVER_CALLBACK: IntersectionObserverCallback = () =>
    undefined;
const NOOP_RESIZE_OBSERVER_CALLBACK: ResizeObserverCallback = () => undefined;

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
    globalThis.IntersectionObserver =
        class MockIntersectionObserver implements IntersectionObserver {
            private readonly callback: IntersectionObserverCallback;

            public readonly root: Element | Document | null;

            public readonly rootMargin: string;

            public readonly thresholds: readonly number[];

            public constructor(
                callback: IntersectionObserverCallback = NOOP_INTERSECTION_OBSERVER_CALLBACK,
                options: IntersectionObserverInit = {}
            ) {
                this.callback = callback;
                this.root = options.root ?? null;
                this.rootMargin = options.rootMargin ?? "";
                const threshold = options.threshold;
                if (Array.isArray(threshold)) {
                    this.thresholds = Object.freeze(Array.from(threshold));
                } else if (typeof threshold === "number") {
                    this.thresholds = Object.freeze([threshold]);
                } else {
                    this.thresholds = Object.freeze([]);
                }
            }

            public disconnect(): void {
                // no-op
            }

            public observe(target: Element): void {
                this.callback(
                    [
                        {
                            boundingClientRect: target.getBoundingClientRect(),
                            intersectionRatio: 0,
                            intersectionRect: target.getBoundingClientRect(),
                            isIntersecting: false,
                            rootBounds: null,
                            target,
                            time: performance.now(),
                        },
                    ],
                    this
                );
            }

            public takeRecords(): IntersectionObserverEntry[] {
                return [];
            }

            public unobserve(_target: Element): void {
                // no-op
            }
        } as unknown as typeof IntersectionObserver;

    // Mock ResizeObserver for responsive component testing
    globalThis.ResizeObserver =
        class MockResizeObserver implements ResizeObserver {
            private readonly callback: ResizeObserverCallback;

            public constructor(
                callback: ResizeObserverCallback = NOOP_RESIZE_OBSERVER_CALLBACK
            ) {
                this.callback = callback;
            }

            public disconnect(): void {
                // no-op
            }

            public observe(
                target: Element,
                _options?: ResizeObserverOptions
            ): void {
                this.callback(
                    [
                        {
                            borderBoxSize: [],
                            contentBoxSize: [],
                            contentRect: target.getBoundingClientRect(),
                            devicePixelContentBoxSize: [],
                            target,
                        },
                    ],
                    this
                );
            }

            public unobserve(_target: Element): void {
                // no-op
            }
        } as unknown as typeof ResizeObserver;

    // Mock requestIdleCallback for performance testing
    globalThis.requestIdleCallback = (
        callback: IdleRequestCallback
    ): number => {
        const handle = setTimeout(() => {
            callback({
                didTimeout: false,
                timeRemaining: () => 50,
            });
        }, 1);

        idleRequestIdentifier += 1;
        const identifier = idleRequestIdentifier;
        idleRequestTimers.set(identifier, handle);
        return identifier;
    };

    globalThis.cancelIdleCallback = (id: number): void => {
        const handle = idleRequestTimers.get(id);
        if (handle) {
            clearTimeout(handle);
            idleRequestTimers.delete(id);
        }
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
    globalThis.File = class MockFile extends Blob implements File {
        public readonly lastModified: number;

        public readonly name: string;

        public readonly webkitRelativePath = "";

        public readonly [Symbol.toStringTag] = "File";

        public constructor(
            fileBits: BlobPart[],
            fileName: string,
            options: FilePropertyBag = {}
        ) {
            super(fileBits, options);
            this.name = fileName;
            this.lastModified = options.lastModified ?? Date.now();
        }

        public override slice(
            start?: number,
            end?: number,
            contentType?: string
        ): File {
            const blobSlice = super.slice(start, end, contentType);
            return new MockFile([blobSlice], this.name, {
                lastModified: this.lastModified,
                type: contentType ?? this.type,
            });
        }
    } as unknown as typeof File;

    globalThis.FileReader = class MockFileReader
        extends EventTarget
        implements FileReader
    {
        public static readonly EMPTY = 0 as const;
        public static readonly LOADING = 1 as const;
        public static readonly DONE = 2 as const;

        public readonly EMPTY = MockFileReader.EMPTY;
        public readonly LOADING = MockFileReader.LOADING;
        public readonly DONE = MockFileReader.DONE;

        public error: DOMException | null = null;

        public onabort: FileReader["onabort"] = null;

        public onerror: FileReader["onerror"] = null;

        public onload: FileReader["onload"] = null;

        public onloadend: FileReader["onloadend"] = null;

        public onloadstart: FileReader["onloadstart"] = null;

        public onprogress: FileReader["onprogress"] = null;

        public readyState: FileReader["readyState"] = MockFileReader.EMPTY;

        public result: string | ArrayBuffer | null = null;

        public abort: FileReader["abort"] = vi.fn(() => {
            this.readyState = MockFileReader.DONE;
            this.emitProgressEvent("abort");
            this.emitProgressEvent("loadend");
        });

        public readonly readAsArrayBuffer: FileReader["readAsArrayBuffer"] =
            vi.fn(async (blob: Blob) => {
                this.readyState = MockFileReader.LOADING;
                this.emitProgressEvent("loadstart");
                const arrayBuffer = await blob.arrayBuffer();
                this.result = arrayBuffer;
                this.readyState = MockFileReader.DONE;
                this.emitProgressEvent("load");
                this.emitProgressEvent("loadend");
            });

        public readonly readAsBinaryString: FileReader["readAsBinaryString"] =
            vi.fn(async (blob: Blob) => {
                this.readyState = MockFileReader.LOADING;
                this.emitProgressEvent("loadstart");
                const arrayBuffer = await blob.arrayBuffer();
                const view = new Uint8Array(arrayBuffer);
                this.result = String.fromCodePoint(...view);
                this.readyState = MockFileReader.DONE;
                this.emitProgressEvent("load");
                this.emitProgressEvent("loadend");
            });

        public readonly readAsDataURL: FileReader["readAsDataURL"] = vi.fn(
            async (blob: Blob) => {
                this.readyState = MockFileReader.LOADING;
                this.emitProgressEvent("loadstart");
                const buffer = await blob.arrayBuffer();
                const base64 = Buffer.from(buffer).toString("base64");
                this.result = `data:${blob.type || "application/octet-stream"};base64,${base64}`;
                this.readyState = MockFileReader.DONE;
                this.emitProgressEvent("load");
                this.emitProgressEvent("loadend");
            }
        );

        public readonly readAsText: FileReader["readAsText"] = vi.fn(
            async (blob: Blob, encoding = "utf8") => {
                this.readyState = MockFileReader.LOADING;
                this.emitProgressEvent("loadstart");
                const buffer = await blob.arrayBuffer();
                this.result = new TextDecoder(encoding).decode(buffer);
                this.readyState = MockFileReader.DONE;
                this.emitProgressEvent("load");
                this.emitProgressEvent("loadend");
            }
        );

        private emitProgressEvent(
            type: "abort" | "load" | "loadend" | "loadstart"
        ): void {
            const event = new ProgressEvent(type);
            switch (type) {
                case "abort": {
                    this.onabort?.(event as ProgressEvent<FileReader>);
                    break;
                }
                case "load": {
                    this.onload?.(event as ProgressEvent<FileReader>);
                    break;
                }
                case "loadend": {
                    this.onloadend?.(event as ProgressEvent<FileReader>);
                    break;
                }
                case "loadstart": {
                    this.onloadstart?.(event as ProgressEvent<FileReader>);
                    break;
                }
                default: {
                    break;
                }
            }
            this.dispatchEvent(event);
        }
    } as unknown as typeof FileReader;

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
