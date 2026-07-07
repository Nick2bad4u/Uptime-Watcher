/**
 * Regression coverage for import/export payload validation.
 */

import { describe, expect, it } from "vitest";

import { createSiteSnapshot } from "../fixtures/siteFactories";
import {
    validateExportData,
    validateImportData,
} from "../../validation/importExportSchemas";

const paddedSettingKey = " custom.setting ";

describe("importExportSchemas", () => {
    it("preserves import setting keys while trimming setting values", () => {
        const result = validateImportData({
            settings: {
                [paddedSettingKey]: " enabled ",
            },
            sites: [{ identifier: "example.com" }],
            version: "1.0",
        });

        expect(result.ok).toBeTruthy();
        if (!result.ok) {
            throw new Error("Expected import payload to pass validation");
        }

        expect(result.value.settings).toEqual({
            [paddedSettingKey]: "enabled",
        });
    });

    it("accepts empty-site import payloads from fresh app exports", () => {
        const result = validateImportData({
            exportedAt: "2026-07-02T00:00:00.000Z",
            settings: {},
            sites: [],
            version: "1.0",
        });

        expect(result.ok).toBeTruthy();
        if (!result.ok) {
            throw new Error("Expected empty-site import payload to pass");
        }

        expect(result.value.sites).toEqual([]);
    });

    it("rejects blank import setting keys without trimming valid keys", () => {
        const result = validateImportData({
            settings: {
                "   ": "value",
            },
            sites: [{ identifier: "example.com" }],
        });

        expect(result.ok).toBeFalsy();
    });

    it("accepts export payloads with non-blank setting keys", () => {
        const result = validateExportData({
            exportedAt: "2026-07-02T00:00:00.000Z",
            settings: {
                [paddedSettingKey]: "enabled",
            },
            sites: [createSiteSnapshot({ identifier: "example.com" })],
            version: "1.0",
        });

        expect(result).toBeTruthy();
    });

    it("accepts empty-site export payloads from fresh app state", () => {
        const result = validateExportData({
            exportedAt: "2026-07-02T00:00:00.000Z",
            settings: {},
            sites: [],
            version: "1.0",
        });

        expect(result).toBeTruthy();
    });

    it("rejects blank export setting keys", () => {
        const result = validateExportData({
            exportedAt: "2026-07-02T00:00:00.000Z",
            settings: {
                "   ": "value",
            },
            sites: [createSiteSnapshot({ identifier: "example.com" })],
            version: "1.0",
        });

        expect(result).toBeFalsy();
    });
});
