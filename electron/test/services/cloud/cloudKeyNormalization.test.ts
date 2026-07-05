/**
 * Unit coverage for cloud object key normalization.
 */

import {
    assertCloudObjectKey,
    DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES,
    normalizeCloudObjectKey,
    normalizeProviderObjectKey,
} from "@shared/utils/cloudKeyNormalization";
import { describe, expect, it } from "vitest";

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
        expect(() => normalizeCloudObjectKey("backups/../evil")).toThrow(
            "path traversal"
        );
        expect(() => normalizeCloudObjectKey("./evil")).toThrow(
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
        ).toThrow("must not exceed");
    });

    it("enforces a default byte budget for provider object keys", () => {
        expect(() => normalizeProviderObjectKey("a".repeat(10_000))).toThrow(
            `${DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES}`
        );
    });

    it("rejects ASCII control characters in provider object keys", () => {
        expect(() =>
            normalizeProviderObjectKey("backups/file\u0000.sqlite")
        ).toThrow("control characters");
        expect(() =>
            normalizeProviderObjectKey("backups/file\n.sqlite")
        ).toThrow("control characters");
    });

    it("normalizes provider object keys before object-key assertions", () => {
        const normalized = normalizeProviderObjectKey(
            String.raw`  \backups\file.sqlite  `
        );

        expect(normalized).toBe("backups/file.sqlite");
        expect(() => {
            assertCloudObjectKey(normalized);
        }).not.toThrow();
    });

    it("keeps empty provider keys invalid for concrete objects", () => {
        const normalized = normalizeProviderObjectKey("  /  ");

        expect(normalized).toBe("");
        expect(() => {
            assertCloudObjectKey(normalized);
        }).toThrow("cannot be empty");
    });

    it("keeps prefix-like provider keys invalid for concrete objects", () => {
        const normalized = normalizeProviderObjectKey("backups/");

        expect(normalized).toBe("backups/");
        expect(() => {
            assertCloudObjectKey(normalized);
        }).toThrow("must not end");
    });

    it("assertCloudObjectKey rejects empty and trailing slash keys", () => {
        expect(() => {
            assertCloudObjectKey("");
        }).toThrow("cannot be empty");
        expect(() => {
            assertCloudObjectKey("backups/");
        }).toThrow("must not end");
    });
});
