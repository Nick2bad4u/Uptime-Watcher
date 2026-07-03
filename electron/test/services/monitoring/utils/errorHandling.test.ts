import { STATUS_KIND } from "@shared/types";
import { describe, expect, it } from "vitest";

import {
    handleCheckError,
    isCancellationError,
} from "../../../../services/monitoring/utils/errorHandling";

describe(isCancellationError, () => {
    it("treats axios cancellations (ERR_CANCELED) as cancellation", () => {
        const error = new Error("canceled");
        (error as unknown as { code: string }).code = "ERR_CANCELED";
        error.name = "AxiosError";

        expect(isCancellationError(error)).toBeTruthy();
    });

    it("does not treat axios timeouts (ECONNABORTED) as cancellation", () => {
        const error = new Error("timeout of 1000ms exceeded");
        (error as unknown as { code: string }).code = "ECONNABORTED";
        error.name = "AxiosError";

        expect(isCancellationError(error)).toBeFalsy();
    });

    it("treats AbortError as cancellation", () => {
        const error = new Error("aborted");
        error.name = "AbortError";

        expect(isCancellationError(error)).toBeTruthy();
    });

    it("does not treat TimeoutError as cancellation", () => {
        const error = new Error("timed out");
        error.name = "TimeoutError";

        expect(isCancellationError(error)).toBeFalsy();
    });

    it("does not invoke code accessors while checking cancellation", () => {
        let getterCalls = 0;
        const error = new Error("not cancelled");
        Object.defineProperty(error, "code", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("code getter should not run");
            },
        });

        expect(isCancellationError(error)).toBeFalsy();
        expect(getterCalls).toBe(0);
    });
});

describe(handleCheckError, () => {
    it("maps maxContentLength errors to a user-friendly response-size message", () => {
        const url = "https://example.com";
        const error = new Error("maxContentLength size of 1048576 exceeded");
        (error as unknown as { code: string }).code = "ERR_BAD_RESPONSE";
        (error as unknown as { isAxiosError: boolean }).isAxiosError = true;
        error.name = "AxiosError";

        const result = handleCheckError(error, url, "cid");

        expect(result.status).toBe(STATUS_KIND.DOWN);
        expect(result.error).toContain("Response too large");
    });

    it("maps too-many-redirects errors to a user-friendly redirect message", () => {
        const url = "https://example.com";
        const error = new Error("Maximum number of redirects exceeded");
        (error as unknown as { code: string }).code =
            "ERR_FR_TOO_MANY_REDIRECTS";
        (error as unknown as { isAxiosError: boolean }).isAxiosError = true;
        error.name = "AxiosError";

        const result = handleCheckError(error, url, "cid");

        expect(result.status).toBe(STATUS_KIND.DOWN);
        expect(result.error).toContain("Too many redirects");
    });
});

describe("redirect safety errors", () => {
    it("maps unsupported redirect protocol to a user-friendly message", () => {
        const url = "https://example.com";
        const error = new Error("Unsupported redirect protocol: file:");
        (error as unknown as { code: string }).code =
            "UW_UNSUPPORTED_REDIRECT_PROTOCOL";

        const result = handleCheckError(error, url, "cid");
        expect(result.status).toBe(STATUS_KIND.DOWN);
        expect(result.error).toContain("Redirected to an unsupported URL");
    });
});
