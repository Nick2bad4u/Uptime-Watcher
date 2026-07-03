import { describe, expect, it } from "vitest";

import { tryDescribeGoogleDriveApiError } from "../../../../../services/cloud/providers/googleDrive/googleDriveErrorSchemas";

describe(tryDescribeGoogleDriveApiError, () => {
    it.each([
        Number.NaN,
        Infinity,
        -Infinity,
    ])("omits non-finite response status %s", (status) => {
        const description = tryDescribeGoogleDriveApiError({
            message: "Request failed",
            response: {
                data: {
                    error: {
                        message: "Drive rejected the request",
                        status: "INVALID_ARGUMENT",
                    },
                },
                status,
            },
        });

        expect(description).toBe(
            "INVALID_ARGUMENT: Drive rejected the request"
        );
    });

    it("includes finite response status", () => {
        expect(
            tryDescribeGoogleDriveApiError({
                message: "Request failed",
                response: {
                    data: {
                        error: {
                            errors: [{ reason: "rateLimitExceeded" }],
                            message: "Too many requests",
                            status: "RESOURCE_EXHAUSTED",
                        },
                    },
                    status: 429,
                },
            })
        ).toBe(
            "429/RESOURCE_EXHAUSTED: Too many requests (reason: rateLimitExceeded)"
        );
    });
});
