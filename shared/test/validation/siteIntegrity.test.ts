/**
 * Regression coverage for shared site integrity helpers.
 */

import { describe, expect, it } from "vitest";

import type { Site } from "@shared/types";
import {
    collectDuplicateSiteIdentifiers,
    DuplicateSiteIdentifierError,
    ensureUniqueSiteIdentifiers,
} from "../../validation/siteIntegrity";

const buildSite = (identifier: string, name: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [],
    name,
});

describe("siteIntegrity", () => {
    it("collectDuplicateSiteIdentifiers returns sorted duplicate summaries", () => {
        const sites: Site[] = [
            buildSite("alpha", "Alpha"),
            buildSite("beta", "Beta"),
            buildSite("alpha", "Alpha Duplicate"),
            buildSite("beta", "Beta Duplicate"),
            buildSite("gamma", "Gamma"),
        ];

        const duplicates = collectDuplicateSiteIdentifiers(sites);

        expect(duplicates).toEqual([
            { identifier: "alpha", occurrences: 2 },
            { identifier: "beta", occurrences: 2 },
        ]);
    });

    it("ensureUniqueSiteIdentifiers allows unique identifiers", () => {
        const uniqueSites: Site[] = [
            buildSite("site-1", "Site 1"),
            buildSite("site-2", "Site 2"),
        ];

        expect(() =>
            ensureUniqueSiteIdentifiers(uniqueSites)).not.toThrowError();
    });

    it("ensureUniqueSiteIdentifiers throws descriptive error when duplicates detected", () => {
        const duplicateSites: Site[] = [
            buildSite("duplicate", "Duplicate A"),
            buildSite("duplicate", "Duplicate B"),
        ];

        expect(() =>
            ensureUniqueSiteIdentifiers(
                duplicateSites,
                "shared-test"
            )).toThrowError(DuplicateSiteIdentifierError);

        try {
            ensureUniqueSiteIdentifiers(duplicateSites, "shared-test");
        } catch (error) {
            expect(error).toBeInstanceOf(DuplicateSiteIdentifierError);
            const duplicateError = error as DuplicateSiteIdentifierError;
            expect(duplicateError.message).toContain("shared-test");
            expect(duplicateError.duplicates).toEqual([
                { identifier: "duplicate", occurrences: 2 },
            ]);
        }
    });
});
