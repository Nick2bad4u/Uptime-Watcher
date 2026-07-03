import { describe, expect, it } from "vitest";

import { toSerializedError } from "../../utils/errorSerialization";

describe(toSerializedError, () => {
    it("sanitizes custom error properties before returning serialized errors", () => {
        const error = Object.assign(
            new Error(
                "request failed https://example.com/callback?access_token=SECRET"
            ),
            {
                code: "E_SECRET",
                details: {
                    Authorization: "Bearer SUPER_SECRET",
                    refresh_token: "SUPER_SECRET",
                },
            }
        );

        const serialized = toSerializedError(error);

        expect(serialized.message).toContain("access_token=[redacted]");
        expect(serialized.message).not.toContain("SECRET");
        expect(serialized["code"]).toBe("E_SECRET");
        expect(serialized["details"]).toEqual({
            Authorization: "[redacted]",
            refresh_token: "[redacted]",
        });
    });

    it("handles circular custom error properties", () => {
        const context: Record<string, unknown> = { stage: "serialize" };
        context["self"] = context;

        const error = Object.assign(new Error("boom"), { context });

        const serialized = toSerializedError(error);

        expect(serialized["context"]).toEqual({
            self: "[Circular]",
            stage: "serialize",
        });
    });
});
