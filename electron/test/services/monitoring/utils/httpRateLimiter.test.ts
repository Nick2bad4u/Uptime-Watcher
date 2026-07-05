import type { HttpRateLimiterConfig } from "@shared/utils/httpRateLimiter";

import { afterEach, describe, expect, it, vi } from "vitest";

const RATE_LIMIT_ENV_KEYS = [
    "UW_HTTP_MAX_CONCURRENT",
    "UW_HTTP_MAX_WAIT_MS",
    "UW_HTTP_MIN_INTERVAL_MS",
] as const;

type RateLimitEnvKey = (typeof RATE_LIMIT_ENV_KEYS)[number];

function snapshotEnv(): Partial<Record<RateLimitEnvKey, string | undefined>> {
    const snapshot: Partial<Record<RateLimitEnvKey, string | undefined>> = {};

    for (const key of RATE_LIMIT_ENV_KEYS) {
        snapshot[key] = process.env[key];
    }

    return snapshot;
}

function restoreEnv(
    snapshot: Partial<Record<RateLimitEnvKey, string | undefined>>
): void {
    for (const key of RATE_LIMIT_ENV_KEYS) {
        const value = snapshot[key];
        if (value === undefined) {
            Reflect.deleteProperty(process.env, key);
        } else {
            process.env[key] = value;
        }
    }
}

async function loadCapturedRateLimiterConfig(): Promise<HttpRateLimiterConfig> {
    let capturedConfig: HttpRateLimiterConfig | undefined;

    vi.resetModules();
    vi.doMock("@shared/utils/httpRateLimiter", () => ({
        HttpRateLimiter: class MockHttpRateLimiter {
            public readonly config: HttpRateLimiterConfig;

            public constructor(config: HttpRateLimiterConfig) {
                this.config = config;
                capturedConfig = config;
            }

            public async schedule(): Promise<never> {
                throw new Error("MockHttpRateLimiter.schedule is not used");
            }
        },
    }));

    await import("../../../../services/monitoring/utils/httpRateLimiter");

    if (!capturedConfig) {
        throw new Error("HttpRateLimiter config was not captured");
    }

    return capturedConfig;
}

describe("monitoring httpRateLimiter wrapper", () => {
    afterEach(() => {
        vi.doUnmock("@shared/utils/httpRateLimiter");
        vi.resetModules();
    });

    it("uses bounded defaults for HTTP monitor rate limiting", async () => {
        const originalEnv = snapshotEnv();
        restoreEnv({});

        try {
            const config = await loadCapturedRateLimiterConfig();

            expect(config.maxConcurrent).toBe(8);
            expect(config.maxWaitMs).toBe(30_000);
            expect(config.minIntervalMs).toBe(200);
        } finally {
            restoreEnv(originalEnv);
        }
    });

    it("caps oversized HTTP monitor rate limiter environment overrides", async () => {
        const originalEnv = snapshotEnv();
        process.env["UW_HTTP_MAX_CONCURRENT"] = "999999999";
        process.env["UW_HTTP_MAX_WAIT_MS"] = "999999999";
        process.env["UW_HTTP_MIN_INTERVAL_MS"] = "999999999";

        try {
            const config = await loadCapturedRateLimiterConfig();

            expect(config.maxConcurrent).toBe(64);
            expect(config.maxWaitMs).toBe(120_000);
            expect(config.minIntervalMs).toBe(60_000);
        } finally {
            restoreEnv(originalEnv);
        }
    });
});
