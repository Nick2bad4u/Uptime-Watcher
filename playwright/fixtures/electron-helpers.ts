/**
 * Electron test helpers for Playwright tests.
 *
 * @packageDocumentation Provides
 *
 * utilities for launching Electron with appropriate configurations for
 * different environments (local development vs CI).
 */

import { _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { createWriteStream, type WriteStream } from "node:fs";
import {
    access,
    copyFile,
    mkdir,
    mkdtemp,
    readdir,
    rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";

import {
    collectCoverageFromElectronApp,
    isCoverageEnabled,
} from "../utils/coverage";
import {
    registerApplicationUserDataDirectory,
    registerPageUserDataDirectory,
} from "../utils/userDataDirectoryRegistry";

const PLAYWRIGHT_CLOSE_TIMEOUT_MS = 5000;
const USER_DATA_REMOVAL_RETRY_DELAYS_MS = [
    250,
    500,
    1000,
] as const;

const isBusyFileSystemError = (error: unknown): boolean => {
    const code =
        typeof error === "object" && error !== null && "code" in error
            ? Reflect.get(error, "code")
            : undefined;

    return code === "EBUSY" || code === "ENOTEMPTY" || code === "EPERM";
};

const waitForDelay = async (delayMs: number): Promise<void> => {
    if (delayMs <= 0) {
        return;
    }

    await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, delayMs);
        timer.unref();
    });
};

const ensurePathExists = async (candidatePath: string): Promise<boolean> => {
    try {
        await access(candidatePath);
        return true;
    } catch {
        return false;
    }
};

const ensureElectronRuntimeWasm = async (): Promise<void> => {
    const workspaceRoot = process.cwd();
    const distDirectory = path.join(workspaceRoot, "dist");
    const distWasmPath = path.join(distDirectory, "node-sqlite3-wasm.wasm");

    if (await ensurePathExists(distWasmPath)) {
        return;
    }

    const sourceCandidates = [
        path.join(workspaceRoot, "assets", "node-sqlite3-wasm.wasm"),
        path.join(
            workspaceRoot,
            "node_modules",
            "node-sqlite3-wasm",
            "dist",
            "node-sqlite3-wasm.wasm"
        ),
    ];

    const sourcePath = await (async (): Promise<string | undefined> => {
        for (const candidate of sourceCandidates) {
            if (await ensurePathExists(candidate)) {
                return candidate;
            }
        }

        return undefined;
    })();

    if (!sourcePath) {
        throw new Error(
            "Unable to locate node-sqlite3-wasm.wasm for Playwright Electron launches"
        );
    }

    await mkdir(distDirectory, { recursive: true });
    await copyFile(sourcePath, distWasmPath);
};

const hasChildProcessExited = (
    childProcess: ChildProcess | null | undefined
): boolean =>
    !childProcess ||
    childProcess.exitCode !== null ||
    childProcess.signalCode !== null ||
    childProcess.killed;

const forceTerminateChildProcess = (childProcess: ChildProcess): void => {
    if (hasChildProcessExited(childProcess)) {
        return;
    }

    try {
        if (
            process.platform === "win32" &&
            typeof childProcess.pid === "number"
        ) {
            execFileSync(
                "taskkill",
                [
                    "/F",
                    "/T",
                    "/PID",
                    String(childProcess.pid),
                ],
                { stdio: "ignore" }
            );
            return;
        }

        childProcess.kill("SIGKILL");
    } catch {
        // Best-effort termination only.
    }
};

const waitForChildProcessExit = async (
    childProcess: ChildProcess | null | undefined,
    timeoutMs: number
): Promise<void> => {
    if (hasChildProcessExited(childProcess)) {
        return;
    }

    await new Promise<void>((resolve) => {
        if (!childProcess) {
            resolve();
            return;
        }

        let settled = false;

        const settle = (): void => {
            if (settled) {
                return;
            }

            settled = true;
            childProcess.off("close", settle);
            childProcess.off("exit", settle);
            resolve();
        };

        childProcess.once("close", settle);
        childProcess.once("exit", settle);

        const timer = setTimeout(() => {
            forceTerminateChildProcess(childProcess);
            settle();
        }, timeoutMs);

        timer.unref();
    });
};

const removeUserDataDirectory = async (userDataDir: string): Promise<void> => {
    if (process.env["PLAYWRIGHT_PRESERVE_USER_DATA_DIR"] === "1") {
        return;
    }

    const retrySchedule = [0, ...USER_DATA_REMOVAL_RETRY_DELAYS_MS];

    for (const [attemptIndex, delayMs] of retrySchedule.entries()) {
        if (delayMs > 0) {
            await waitForDelay(delayMs);
        }

        try {
            await rm(userDataDir, { recursive: true, force: true });
            return;
        } catch (error) {
            const isLastAttempt = attemptIndex === retrySchedule.length - 1;
            if (!isBusyFileSystemError(error) || isLastAttempt) {
                throw error;
            }
        }
    }
};

/**
 * Launch Electron with CI-compatible configuration.
 *
 * Automatically handles:
 *
 * - Sandbox disabling in CI environments where Chrome sandbox cannot be
 *   configured
 * - Headless mode for Electron testing (prevents windows from showing)
 * - Test mode arguments for faster startup during UI testing
 *
 * **Headless Mode Implementation:** Sets HEADLESS=true environment variable
 * which is checked by the Electron app's WindowService to skip showing windows
 * during testing. This simulates headless behavior since Electron doesn't
 * support true headless mode like browsers.
 *
 * @param customArgs - Additional arguments to pass to Electron
 * @param customEnv - Additional environment variables (can override HEADLESS)
 *
 * @returns Promise resolving to Electron app instance
 */
export async function launchElectronApp(
    customArgs: string[] = [],
    customEnv: Record<string, string> = {}
): Promise<ElectronApplication> {
    await ensureElectronRuntimeWasm();

    const userDataDir = await mkdtemp(
        path.join(tmpdir(), "uptime-watcher-playwright-")
    );

    const logsOutputDir = path.join(
        process.cwd(),
        "playwright",
        "test-results",
        "runtime-logs",
        path.basename(userDataDir)
    );
    await mkdir(logsOutputDir, { recursive: true });

    const stdoutStream: WriteStream = createWriteStream(
        path.join(logsOutputDir, "electron-stdout.log"),
        { flags: "a" }
    );
    const stderrStream: WriteStream = createWriteStream(
        path.join(logsOutputDir, "electron-stderr.log"),
        { flags: "a" }
    );

    /**
     * Sanitizes NODE_OPTIONS for Playwright-launched Electron.
     *
     * @remarks
     * When running tasks from VS Code's "JavaScript Debug Terminal", VS Code
     * injects a bootloader via NODE_OPTIONS (and sometimes inspector flags).
     * That can pause the Electron main process (e.g. `--inspect-brk`) or
     * otherwise interfere with window creation, causing Playwright to time out
     * waiting for the first "window" event.
     */
    const sanitizeNodeOptions = (raw: string): string => {
        const trimmed = raw.trim();
        if (trimmed.length === 0) {
            return "";
        }

        // Remove common inspector flags.
        // Note: we intentionally keep unrelated flags such as
        // `--max_old_space_size`.
        const withoutInspector = trimmed
            .replace(/\s--inspect-brk(=\S+)?/gu, "")
            .replace(/\s--inspect(=\S+)?/gu, "")
            .replace(/\s--inspect-publish-uid=\S+/gu, "");

        // Remove VS Code js-debug bootloader injections.
        // Handles both quoted and unquoted paths.
        const withoutVsCodeBootloader = withoutInspector
            .replace(
                /\s--require\s+"?[^"]*?js-debug[^"]*?bootloader\.js"?/gu,
                ""
            )
            .replace(
                /\s--require\s+"?[^"]*?ms-vscode\.js-debug[^"]*?bootloader\.js"?/gu,
                ""
            );

        return withoutVsCodeBootloader.replace(/\s{2,}/gu, " ").trim();
    };

    const existingNodeOptions = sanitizeNodeOptions(
        process.env["NODE_OPTIONS"] ?? ""
    );
    const disableWarningOption = "--disable-warning=DEP0190";
    const nodeOptions = existingNodeOptions.includes(disableWarningOption)
        ? existingNodeOptions
        : [existingNodeOptions, disableWarningOption].filter(Boolean).join(" ");

    const cleanupTasks: Array<() => Promise<void>> = [
        async () => {
            // Persist Electron log files for debugging flaky Playwright failures.
            // These live under userData (which we delete after each run).
            try {
                const copyRelevantFiles = async (
                    directory: string,
                    relativePrefix: string
                ): Promise<void> => {
                    const entries = await readdir(directory, {
                        withFileTypes: true,
                    });

                    await Promise.all(
                        entries.map(async (entry) => {
                            const source = path.join(directory, entry.name);
                            const relative = path.join(
                                relativePrefix,
                                entry.name
                            );

                            if (entry.isDirectory()) {
                                await copyRelevantFiles(source, relative);
                                return;
                            }

                            if (
                                !entry.isFile() ||
                                (!entry.name.endsWith(".log") &&
                                    !entry.name.endsWith(".json"))
                            ) {
                                return;
                            }

                            const destination = path.join(
                                logsOutputDir,
                                relative
                            );
                            try {
                                await mkdir(path.dirname(destination), {
                                    recursive: true,
                                });
                                await copyFile(source, destination);
                            } catch (error) {
                                if (isBusyFileSystemError(error)) {
                                    return;
                                }

                                throw error;
                            }
                        })
                    );
                };

                await copyRelevantFiles(userDataDir, ".");
            } catch (error) {
                console.warn(
                    "[Playwright] Failed to collect Electron userData logs",
                    {
                        directory: userDataDir,
                        error,
                    }
                );
            }
        },
        async () => {
            await Promise.allSettled([
                new Promise<void>((resolve) =>
                    stdoutStream.end(() => resolve())
                ),
                new Promise<void>((resolve) =>
                    stderrStream.end(() => resolve())
                ),
            ]);
        },
        async () => {
            try {
                await removeUserDataDirectory(userDataDir);
            } catch (error) {
                console.warn(
                    "[Playwright] Failed to remove temporary userData directory",
                    {
                        directory: userDataDir,
                        error,
                    }
                );
            }
        },
    ];

    let cleanupTriggered = false;
    const runCleanup = async (): Promise<void> => {
        if (cleanupTriggered) {
            return;
        }

        cleanupTriggered = true;

        await Promise.allSettled(
            cleanupTasks.map(async (task) => {
                await task();
            })
        );
    };

    const app = await electron.launch({
        args: [
            ".", // Launch from project root like codegen script
            "--test-mode", // Enable lightweight mode for faster UI testing
            // Disable sandbox in CI environment to avoid SUID sandbox issues
            ...(process.env["CI"]
                ? ["--no-sandbox", "--disable-setuid-sandbox"]
                : []),
            ...customArgs,
        ],
        env: {
            ...Object.entries(process.env).reduce<Record<string, string>>(
                (accumulator, [key, value]) => {
                    if (typeof value === "string") {
                        accumulator[key] = value;
                    }
                    return accumulator;
                },
                {}
            ),
            // Don't override NODE_ENV - let it inherit from environment
            // This allows proper development vs production detection
            // Enable headless mode for Electron during testing
            HEADLESS: "true",
            PLAYWRIGHT_TEST: "true",
            PLAYWRIGHT_USER_DATA_DIR: userDataDir,
            NODE_OPTIONS: nodeOptions,
            // Disable Electron sandbox in CI
            ...(process.env["CI"] && { ELECTRON_DISABLE_SANDBOX: "1" }),
            ...customEnv,
        },
        timeout: 30000, // Add timeout like codegen script
    });

    const electronProcess = app.process();
    electronProcess?.stdout?.on("data", (chunk: Buffer) => {
        stdoutStream.write(chunk);
    });
    electronProcess?.stderr?.on("data", (chunk: Buffer) => {
        stderrStream.write(chunk);
    });

    const attachWindowMetadata = (page: Page): void => {
        registerPageUserDataDirectory(page, userDataDir);

        // Ensure a consistent viewport across CI/local runs.
        // When the Electron window is not shown (HEADLESS=true), Chromium can
        // report a smaller layout viewport which triggers responsive CSS
        // breakpoints (e.g., hiding table columns) and causes flaky assertions.
        void page
            .setViewportSize({ height: 720, width: 1280 })
            .catch(() => undefined);
    };

    registerApplicationUserDataDirectory(app, userDataDir);
    app.on("window", attachWindowMetadata);

    const originalFirstWindow = app.firstWindow.bind(app);
    (
        app as ElectronApplication & {
            firstWindow: ElectronApplication["firstWindow"];
        }
    ).firstWindow = (async () => {
        const page = await originalFirstWindow();
        attachWindowMetadata(page);
        return page;
    }) as ElectronApplication["firstWindow"];

    app.on("close", () => {
        void (async (): Promise<void> => {
            await waitForChildProcessExit(
                electronProcess,
                PLAYWRIGHT_CLOSE_TIMEOUT_MS
            );
            await runCleanup();
        })();
    });

    if (isCoverageEnabled) {
        const originalClose = app.close.bind(app);
        let coverageCollected = false;

        (
            app as ElectronApplication & {
                close: ElectronApplication["close"];
            }
        ).close = (async () => {
            let coverageError: unknown;

            if (!coverageCollected) {
                try {
                    await collectCoverageFromElectronApp(app);
                    coverageCollected = true;
                } catch (error) {
                    coverageError = error;
                }
            }

            let closeError: unknown;
            try {
                await originalClose();
            } catch (error) {
                closeError = error;
            }

            await waitForChildProcessExit(
                electronProcess,
                PLAYWRIGHT_CLOSE_TIMEOUT_MS
            );

            await runCleanup();

            if (coverageError) {
                throw coverageError;
            }

            if (closeError) {
                throw closeError;
            }
        }) as ElectronApplication["close"];
    } else {
        const originalClose = app.close.bind(app);

        (
            app as ElectronApplication & {
                close: ElectronApplication["close"];
            }
        ).close = (async () => {
            let closeError: unknown;
            try {
                await originalClose();
            } catch (error) {
                closeError = error;
            }

            await waitForChildProcessExit(
                electronProcess,
                PLAYWRIGHT_CLOSE_TIMEOUT_MS
            );

            await runCleanup();

            if (closeError) {
                throw closeError;
            }
        }) as ElectronApplication["close"];
    }

    return app;
}
