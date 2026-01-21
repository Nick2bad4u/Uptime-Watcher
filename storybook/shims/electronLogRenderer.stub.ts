import type { RendererLogger } from "electron-log";

/**
 * A minimal stub for `electron-log/renderer` used by Storybook/Vitest.
 *
 * @remarks
 * Storybook story tests run without an Electron main process, so the real
 * `electron-log/renderer` will emit noisy warnings about missing main-process
 * initialization. This stub preserves the subset of the API that the renderer
 * code expects (log methods + `transports.console` formatting).
 */
const stub: Pick<RendererLogger, "debug" | "error" | "info" | "warn"> & {
    transports: {
        console: {
            format: string;
            level: string;
        };
        file: {
            level: string;
        };
    };
} = {
    debug: (): void => {
        // no-op
    },
    error: (): void => {
        // no-op
    },
    info: (): void => {
        // no-op
    },
    transports: {
        console: {
            format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            level: "debug",
        },
        file: {
            level: "info",
        },
    },
    warn: (): void => {
        // no-op
    },
};

export default stub;
