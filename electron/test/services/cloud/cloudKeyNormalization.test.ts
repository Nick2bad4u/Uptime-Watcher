/**
 * Unit coverage for cloud object key normalization.
 */

import { describe, expect, it } from "vitest";

import {
    DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES,
    assertCloudObjectKey,
    normalizeCloudObjectKey,
    normalizeProviderObjectKey,
} from "../../../services/cloud/cloudKeyNormalization";

describe("cloudKeyNormalization", () => {
    it("normalizes Windows separators and strips leading slashes by default", () => {
        expect(
            normalizeCloudObjectKey(String.raw`\\backups\\file.sqlite`)
        ).toBe("backups/file.sqlite");
        expect(normalizeCloudObjectKey("////backups//file.sqlite")).toBe(
            "backups/file.sqlite"
        );
    });

    it("rejects traversal segments by default", () => {
        expect(() => normalizeCloudObjectKey("backups/../evil")).toThrowError(
            "path traversal"
        );
        expect(() => normalizeCloudObjectKey("./evil")).toThrowError(
            "path traversal"
        );
    });

    it("enforces maxByteLength when provided", () => {
        const raw = "a".repeat(100);
        expect(
            normalizeCloudObjectKey(raw, {
                maxByteLength: 100,
                allowEmpty: false,
            })
        ).toBe(raw);

        expect(() =>
            normalizeCloudObjectKey("a".repeat(101), {
                maxByteLength: 100,
            })
        ).toThrowError("must not exceed");
    });

    it("enforces a default byte budget for provider object keys", () => {
        expect(() =>
            normalizeProviderObjectKey("a".repeat(10_000))
        ).toThrowError(`${DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES}`);
    });

    it("assertCloudObjectKey rejects empty and trailing slash keys", () => {
        expect(() => assertCloudObjectKey("")).toThrowError("cannot be empty");
        expect(() => assertCloudObjectKey("backups/")).toThrowError(
            "must not end"
        );
    });
});
