/**
 * Ensures monitoring error logs never include sensitive URL components.
 */

import { describe, expect, it, vi } from "vitest";

const loggerMock = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

vi.mock("../../../../electronUtils", () => ({
    isDev: () => true,
}));

vi.mock("../../../../utils/logger", () => ({
    logger: loggerMock,
}));

describe("monitoring errorHandling safe URL logging", () => {
    it("redacts query/hash/auth for cancellation debug logs", async () => {
        const { handleCheckError } =
            await import("../../../../services/monitoring/utils/errorHandling");

        const url = "https://user:pass@example.com/path?token=secret#frag";
        const error = new Error("aborted");
        error.name = "AbortError";

        handleCheckError(error, url, "cid");

        const debugMessages = loggerMock.debug.mock.calls.map((call) =>
            String(call[0])
        );

        expect(
            debugMessages.some((message) => message.includes("token=secret"))
        ).toBeFalsy();
        expect(
            debugMessages.some((message) => message.includes("user:pass"))
        ).toBeFalsy();
        expect(
            debugMessages.some((message) => message.includes("#frag"))
        ).toBeFalsy();
        expect(
            debugMessages.some((message) =>
                message.includes("https://example.com/path")
            )
        ).toBeTruthy();
    });

    it("redacts query/hash/auth for unexpected error logs", async () => {
        const { handleCheckError } =
            await import("../../../../services/monitoring/utils/errorHandling");

        const url = "https://user:pass@example.com/path?token=secret#frag";

        handleCheckError({ not: "an error" }, url, "cid");

        const errorMessages = loggerMock.error.mock.calls.map((call) =>
            String(call[0])
        );

        expect(
            errorMessages.some((message) => message.includes("token=secret"))
        ).toBeFalsy();
        expect(
            errorMessages.some((message) => message.includes("user:pass"))
        ).toBeFalsy();
        expect(
            errorMessages.some((message) => message.includes("#frag"))
        ).toBeFalsy();
        expect(
            errorMessages.some((message) =>
                message.includes("https://example.com/path")
            )
        ).toBeTruthy();
    });
});
