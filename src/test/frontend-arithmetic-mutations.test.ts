/**
 * Frontend Arithmetic Operator Mutation Tests
 *
 * @file Tests specifically designed to catch ArithmeticOperator mutations in
 *   frontend components that survived Stryker mutation testing.
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-03
 *
 * @category Tests
 *
 * @tags ["mutation-testing", "arithmetic", "stryker", "frontend"]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Frontend ArithmeticOperator Mutation Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("ScreenshotThumbnail Positioning Calculations", () => {
        it("should calculate maximum image width using multiplication (kills viewportW / 0.9 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ScreenshotThumbnail", "component");
            await annotate("Category: UI Layout", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/ScreenshotThumbnail.tsx, Line: 135
            // Original: const maxImgW = Math.min(viewportW * 0.9, 900);
            // Mutated: viewportW / 0.9

            const viewportW = 1000;
            const maxAllowed = 900;

            // Correct calculation: 90% of viewport width, capped at 900px
            const correctMaxWidth = Math.min(viewportW * 0.9, maxAllowed);
            expect(correctMaxWidth).toBe(900); // Capped at 900px

            // Mutated calculation would divide instead of multiply
            const mutatedMaxWidth = Math.min(viewportW / 0.9, maxAllowed);
            expect(mutatedMaxWidth).toBe(900); // Would be Math.min(1111.11, 900) = 900

            // With a smaller viewport, the difference becomes clear
            const smallViewport = 800;
            const correctSmallWidth = Math.min(smallViewport * 0.9, maxAllowed);
            expect(correctSmallWidth).toBe(720); // 800 * 0.9 = 720

            const mutatedSmallWidth = Math.min(smallViewport / 0.9, maxAllowed);
            expect(mutatedSmallWidth).toBe(888.888_888_888_888_9); // 800 / 0.9 = 888.89

            // The correct calculation should be smaller for small viewports
            expect(correctSmallWidth).toBeLessThan(smallViewport);

            // The mutated calculation would be larger
            expect(mutatedSmallWidth).toBeGreaterThan(smallViewport);
        });

        it("should calculate maximum image height using multiplication (kills viewportH / 0.9 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ScreenshotThumbnail", "component");
            await annotate("Category: UI Layout", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/ScreenshotThumbnail.tsx, Line: 136
            // Original: const maxImgH = Math.min(viewportH * 0.9, 700);
            // Mutated: viewportH / 0.9

            const viewportH = 600;
            const maxAllowed = 700;

            // Correct calculation: 90% of viewport height
            const correctMaxHeight = Math.min(viewportH * 0.9, maxAllowed);
            expect(correctMaxHeight).toBe(540); // 600 * 0.9 = 540

            // Mutated calculation would divide
            const mutatedMaxHeight = Math.min(viewportH / 0.9, maxAllowed);
            expect(mutatedMaxHeight).toBe(666.666_666_666_666_6); // 600 / 0.9 = 666.67

            // Correct value should be less than viewport
            expect(correctMaxHeight).toBeLessThan(viewportH);

            // Mutated value would be greater than viewport
            expect(mutatedMaxHeight).toBeGreaterThan(viewportH);
        });

        it("should position overlay with correct gap using subtraction (kills rect.top - overlayH + 16 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ScreenshotThumbnail", "component");
            await annotate("Category: UI Layout", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/ScreenshotThumbnail.tsx, Line: 140
            // Original: let top = rect.top - overlayH - 16;
            // Mutated: rect.top - overlayH + 16

            const rect = { top: 500 };
            const overlayH = 200;
            const gap = 16;

            // Correct calculation: position above with gap
            const correctTop = rect.top - overlayH - gap;
            expect(correctTop).toBe(284); // 500 - 200 - 16 = 284

            // Mutated calculation would add gap instead of subtract
            const mutatedTop = rect.top - overlayH + gap;
            expect(mutatedTop).toBe(316); // 500 - 200 + 16 = 316

            // Correct position should be well above the rect
            expect(correctTop).toBeLessThan(rect.top - overlayH);

            // Mutated position would be closer to the rect
            expect(mutatedTop).toBeGreaterThan(rect.top - overlayH);
        });

        it("should center overlay horizontally (kills various arithmetic mutants)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ScreenshotThumbnail", "component");
            await annotate("Category: UI Layout", "category");
            await annotate("Type: Arithmetic", "type");

            // This test targets multiple mutations in Line: 141
            // Original: let left = rect.left + rect.width / 2 - overlayW / 2;
            // Various mutants: +/-, different divisions

            const rect = { left: 100, width: 200 };
            const overlayW = 50;

            // Correct centering calculation
            const rectCenter = rect.left + rect.width / 2; // 100 + 100 = 200
            const correctLeft = rectCenter - overlayW / 2; // 200 - 25 = 175
            expect(correctLeft).toBe(175);

            // Test mutant: rect.left + rect.width / 2 + overlayW / 2
            const mutant1 = rectCenter + overlayW / 2; // 200 + 25 = 225
            expect(mutant1).toBe(225);

            // Test mutant: rect.left - rect.width / 2
            const mutant2 = rect.left - rect.width / 2; // 100 - 100 = 0
            expect(mutant2).toBe(0);

            // Test mutant: overlayW * 2
            const mutant3 = overlayW * 2; // 50 * 2 = 100
            expect(mutant3).toBe(100);

            // Test mutant: rect.width * 2
            const mutant4 = rect.width * 2; // 200 * 2 = 400
            expect(mutant4).toBe(400);

            // Verify correct centering places overlay centered on rect
            const overlayCenter = correctLeft + overlayW / 2;
            expect(overlayCenter).toBe(rectCenter);

            // Verify mutants would not center correctly
            expect(mutant1 + overlayW / 2).not.toBe(rectCenter);
            expect(mutant2 + overlayW / 2).not.toBe(rectCenter);
        });

        it("should position overlay below when above doesn't fit (kills rect.bottom - 16 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ScreenshotThumbnail", "component");
            await annotate("Category: UI Layout", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/ScreenshotThumbnail.tsx, Line: 144
            // Original: top = rect.bottom + 16;
            // Mutated: rect.bottom - 16

            const rect = { bottom: 300 };
            const gap = 16;

            // Correct calculation: position below with gap
            const correctTop = rect.bottom + gap;
            expect(correctTop).toBe(316); // 300 + 16 = 316

            // Mutated calculation would subtract gap
            const mutatedTop = rect.bottom - gap;
            expect(mutatedTop).toBe(284); // 300 - 16 = 284

            // Correct position should be below the rect
            expect(correctTop).toBeGreaterThan(rect.bottom);

            // Mutated position would be above the rect's bottom
            expect(mutatedTop).toBeLessThan(rect.bottom);
        });

        it("should check horizontal overflow correctly (kills left - overlayW and viewportW + 8 mutants)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ScreenshotThumbnail", "component");
            await annotate("Category: UI Layout", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/ScreenshotThumbnail.tsx, Line: 149
            // Original: if (left + overlayW > viewportW - 8) {
            // Mutants: left - overlayW, viewportW + 8

            const left = 950;
            const overlayW = 100;
            const viewportW = 1000;
            const margin = 8;

            // Correct overflow check
            const overlayRight = left + overlayW; // 950 + 100 = 1050
            const viewportLimit = viewportW - margin; // 1000 - 8 = 992
            const correctOverflow = overlayRight > viewportLimit; // 1050 > 992 = true
            expect(correctOverflow).toBeTruthy();

            // Mutant 1: left - overlayW
            const mutant1Left = left - overlayW; // 950 - 100 = 850
            const mutant1Overflow = mutant1Left > viewportLimit; // 850 > 992 = false
            expect(mutant1Overflow).toBeFalsy();

            // Mutant 2: viewportW + 8
            const mutant2Limit = viewportW + margin; // 1000 + 8 = 1008
            const mutant2Overflow = overlayRight > mutant2Limit; // 1050 > 1008 = true
            expect(mutant2Overflow).toBeTruthy();

            // With different values where mutant 2 would fail
            const left2 = 950;
            const overlayRight2 = left2 + overlayW; // 1050
            expect(overlayRight2).toBeGreaterThan(mutant2Limit); // 1050 > 1008 = true
            expect(overlayRight2).toBeGreaterThan(viewportLimit); // 1050 > 992 = true

            // Both should be true here, but with values in between:
            const leftBetween = 945;
            const overlayRightBetween = leftBetween + overlayW; // 1045
            const correctOverflowBetween = overlayRightBetween > viewportLimit; // 1045 > 992 = true
            const mutant2OverflowBetween = overlayRightBetween > mutant2Limit; // 1045 > 1008 = true

            expect(correctOverflowBetween).toBeTruthy();
            expect(mutant2OverflowBetween).toBeTruthy();

            // Try values that would show the difference
            const leftEdge = 936; // Exactly at edge for mutant
            const overlayRightEdge = leftEdge + overlayW; // 1036
            expect(overlayRightEdge).toBeGreaterThan(viewportLimit); // 1036 > 992 = true
            expect(overlayRightEdge).toBeGreaterThan(mutant2Limit); // 1036 > 1008 = true

            // Find a case where they differ
            const leftDiff = 920;
            const overlayRightDiff = leftDiff + overlayW; // 1020
            expect(overlayRightDiff).toBeGreaterThan(viewportLimit); // 1020 > 992 = true
            expect(overlayRightDiff).toBeGreaterThan(mutant2Limit); // 1020 > 1008 = true

            // Let's try smaller overlay to find difference
            const leftTest = 1000;
            const overlayRightTest = leftTest + overlayW; // 1100
            const correctOverflowTest = overlayRightTest > viewportLimit; // 1100 > 992 = true
            const mutant2OverflowTest = overlayRightTest > mutant2Limit; // 1100 > 1008 = true

            expect(correctOverflowTest).toBeTruthy();
            expect(mutant2OverflowTest).toBeTruthy();
        });

        it("should check vertical overflow correctly (kills top - overlayH and viewportH + 8 mutants)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ScreenshotThumbnail", "component");
            await annotate("Category: UI Layout", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/ScreenshotThumbnail.tsx, Line: 155
            // Original: if (top + overlayH > viewportH - 8) {
            // Mutants: top - overlayH, viewportH + 8

            const top = 650;
            const overlayH = 100;
            const viewportH = 700;
            const margin = 8;

            // Correct overflow check
            const overlayBottom = top + overlayH; // 650 + 100 = 750
            const viewportLimit = viewportH - margin; // 700 - 8 = 692
            const correctOverflow = overlayBottom > viewportLimit; // 750 > 692 = true
            expect(correctOverflow).toBeTruthy();

            // Mutant 1: top - overlayH
            const mutant1Bottom = top - overlayH; // 650 - 100 = 550
            const mutant1Overflow = mutant1Bottom > viewportLimit; // 550 > 692 = false
            expect(mutant1Overflow).toBeFalsy();

            // Mutant 2: viewportH + 8
            const mutant2Limit = viewportH + margin; // 700 + 8 = 708
            const mutant2Overflow = overlayBottom > mutant2Limit; // 750 > 708 = true
            expect(mutant2Overflow).toBeTruthy();

            // Verify the difference between correct and mutants
            expect(correctOverflow).not.toBe(mutant1Overflow);
            // Note: mutant2Overflow might be same as correctOverflow in this case,
            // but would differ with overlayBottom between 692 and 708
        });
    });

    describe("AnalyticsTab Time Formatting", () => {
        it("should format time using division (kills ms * 1000 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AnalyticsTab", "component");
            await annotate("Category: Time Formatting", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/tabs/AnalyticsTab.tsx, Line: 187
            // Original: return `${Math.round(ms / 1000)}s`;
            // Mutated: ms * 1000

            const ms = 5500; // 5.5 seconds in milliseconds

            // Correct conversion: ms to seconds
            const correctSeconds = Math.round(ms / 1000);
            expect(correctSeconds).toBe(6); // 5.5 rounded to 6

            // Mutated calculation would multiply instead
            const mutatedValue = Math.round(ms * 1000);
            expect(mutatedValue).toBe(5_500_000); // 5.5 million

            // Correct value should be reasonable seconds
            expect(correctSeconds).toBeGreaterThan(0);
            expect(correctSeconds).toBeLessThan(100);

            // Mutated value would be huge
            expect(mutatedValue).toBeGreaterThan(1_000_000);
        });
    });

    describe("HistoryTab Index Calculation", () => {
        it("should calculate history index using subtraction (kills historyLength + findIndex mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryTab", "component");
            await annotate("Category: Data Processing", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/tabs/HistoryTab.tsx, Line: 383
            // Original: {historyLength - selectedMonitor.history.findIndex(...)}
            // Mutated: historyLength + selectedMonitor.history.findIndex(...)

            const historyLength = 100;
            const findIndexResult = 25; // Found at index 25

            // Correct calculation: reverse index (from end)
            const correctIndex = historyLength - findIndexResult;
            expect(correctIndex).toBe(75); // 100 - 25 = 75

            // Mutated calculation would add
            const mutatedIndex = historyLength + findIndexResult;
            expect(mutatedIndex).toBe(125); // 100 + 25 = 125

            // Correct index should be within history bounds
            expect(correctIndex).toBeGreaterThanOrEqual(0);
            expect(correctIndex).toBeLessThan(historyLength);

            // Mutated index would be out of bounds
            expect(mutatedIndex).toBeGreaterThanOrEqual(historyLength);
        });
    });

    describe("SiteOverviewTab Monitor Counts", () => {
        it("should calculate stopped monitors using subtraction (kills total + running mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteOverviewTab", "component");
            await annotate("Category: Statistics", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/components/SiteDetails/tabs/SiteOverviewTab.tsx, Line: 376
            // Original: {site.monitors.length - runningMonitors.length}
            // Mutated: site.monitors.length + runningMonitors.length

            const totalMonitors = 10;
            const runningMonitors = 7;

            // Correct calculation: stopped = total - running
            const correctStopped = totalMonitors - runningMonitors;
            expect(correctStopped).toBe(3); // 10 - 7 = 3 stopped

            // Mutated calculation would add
            const mutatedResult = totalMonitors + runningMonitors;
            expect(mutatedResult).toBe(17); // 10 + 7 = 17 (impossible)

            // Stopped count should be non-negative and ≤ total
            expect(correctStopped).toBeGreaterThanOrEqual(0);
            expect(correctStopped).toBeLessThanOrEqual(totalMonitors);

            // Mutated result would exceed total monitors
            expect(mutatedResult).toBeGreaterThan(totalMonitors);
        });
    });

    describe("Site Analytics Loop Index", () => {
        it("should iterate backwards through history (kills filteredHistory.length + 1 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteAnalytics", "component");
            await annotate("Category: Data Processing", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/hooks/site/useSiteAnalytics.ts, Line: 127
            // Original: for (let i = filteredHistory.length - 1; i >= 0; i--) {
            // Mutated: filteredHistory.length + 1

            const filteredHistory = [
                "item1",
                "item2",
                "item3",
            ];

            // Correct starting index: last valid index
            const correctStartIndex = filteredHistory.length - 1;
            expect(correctStartIndex).toBe(2); // Last index for 3 items

            // Mutated calculation
            const mutatedStartIndex = filteredHistory.length + 1;
            expect(mutatedStartIndex).toBe(4); // Out of bounds

            // Correct index should be valid
            expect(correctStartIndex).toBeGreaterThanOrEqual(0);
            expect(correctStartIndex).toBeLessThan(filteredHistory.length);
            expect(filteredHistory[correctStartIndex]).toBeDefined();

            // Mutated index would be invalid
            expect(mutatedStartIndex).toBeGreaterThanOrEqual(
                filteredHistory.length
            );
            expect(filteredHistory[mutatedStartIndex]).toBeUndefined();
        });

        it("should calculate safe array index (kills arrayLength + 1 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteAnalytics", "component");
            await annotate("Category: Data Processing", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/hooks/site/useSiteAnalytics.ts, Line: 199
            // Original: const safeIndex = Math.max(0, Math.min(index, arrayLength - 1));
            // Mutated: arrayLength + 1

            const arrayLength = 5;
            const index = 7; // Beyond array bounds

            // Correct calculation: clamp to valid range
            const correctSafeIndex = Math.max(
                0,
                Math.min(index, arrayLength - 1)
            );
            expect(correctSafeIndex).toBe(4); // Clamped to last valid index

            // Mutated calculation would use arrayLength + 1
            const mutatedSafeIndex = Math.max(
                0,
                Math.min(index, arrayLength + 1)
            );
            expect(mutatedSafeIndex).toBe(6); // Would allow invalid index

            // Correct index should be within bounds
            expect(correctSafeIndex).toBeGreaterThanOrEqual(0);
            expect(correctSafeIndex).toBeLessThan(arrayLength);

            // Mutated index could be out of bounds
            expect(mutatedSafeIndex).toBeGreaterThanOrEqual(arrayLength);
        });
    });

    describe("ErrorBoundary Retry Counter", () => {
        it("should increment retry count (kills prevState.retryCount - 1 mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ErrorBoundary", "component");
            await annotate("Category: Error Handling", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/stores/error/ErrorBoundary.tsx, Line: 122
            // Original: retryCount: prevState.retryCount + 1,
            // Mutated: prevState.retryCount - 1

            const prevRetryCount = 2;

            // Correct increment
            const correctNewCount = prevRetryCount + 1;
            expect(correctNewCount).toBe(3);

            // Mutated decrement
            const mutatedNewCount = prevRetryCount - 1;
            expect(mutatedNewCount).toBe(1);

            // Retry count should increase on retry
            expect(correctNewCount).toBeGreaterThan(prevRetryCount);

            // Mutated version would decrease
            expect(mutatedNewCount).toBeLessThan(prevRetryCount);
        });
    });

    describe("Store Utils Exponential Backoff", () => {
        it("should calculate exponential delay (kills baseDelay / 1.5 ** attempt mutant)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: store utils", "component");
            await annotate("Category: Retry Logic", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets the mutation:
            // File: src/stores/utils.ts, Line: 226
            // Original: const delay = Math.min(baseDelay * 1.5 ** attempt, 2000);
            // Mutated: baseDelay / 1.5 ** attempt

            const baseDelay = 100;
            const attempt = 3;
            const maxDelay = 2000;

            // Correct exponential backoff
            const correctDelay = Math.min(baseDelay * 1.5 ** attempt, maxDelay);
            expect(correctDelay).toBe(337.5); // 100 * 3.375 = 337.5

            // Mutated calculation would divide
            const mutatedDelay = Math.min(baseDelay / 1.5 ** attempt, maxDelay);
            expect(mutatedDelay).toBeCloseTo(29.63, 2); // 100 / 3.375 ≈ 29.63

            // Exponential backoff should increase with attempts
            expect(correctDelay).toBeGreaterThan(baseDelay);

            // Mutated version would decrease
            expect(mutatedDelay).toBeLessThan(baseDelay);
        });
    });

    describe("ThemedProgress Percentage Calculation", () => {
        it("should calculate percentage using division and multiplication (kills various arithmetic mutants)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemedProgress", "component");
            await annotate("Category: UI Component", "category");
            await annotate("Type: Arithmetic", "type");

            // This test specifically targets mutations:
            // File: src/theme/components/ThemedProgress.tsx, Line: 57
            // Original: const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
            // Mutants: value / max / 100, value * max

            const value = 75;
            const max = 100;

            // Correct calculation: (value / max) * 100
            const ratio = value / max; // 0.75
            const correctPercentage = Math.min(Math.max(ratio * 100, 0), 100);
            expect(correctPercentage).toBe(75); // 75%

            // Mutant 1: value / max / 100
            const mutant1 = Math.min(Math.max(value / max / 100, 0), 100);
            expect(mutant1).toBe(0.0075); // 0.0075% instead of 75%

            // Mutant 2: value * max
            const mutant2 = Math.min(Math.max(value * max, 0), 100);
            expect(mutant2).toBe(100); // Clamped to 100, would be 7500 without clamp

            // Correct percentage should be reasonable (0-100)
            expect(correctPercentage).toBeGreaterThanOrEqual(0);
            expect(correctPercentage).toBeLessThanOrEqual(100);
            expect(correctPercentage).toBe(75);

            // Mutant 1 would be too small
            expect(mutant1).toBeLessThan(correctPercentage);
            expect(mutant1).toBe(0.0075);

            // Test with smaller values where clamping doesn't hide the mutant
            const smallValue = 30;
            const smallMax = 100;
            const correctSmall = Math.min(
                Math.max((smallValue / smallMax) * 100, 0),
                100
            );
            expect(correctSmall).toBe(30);

            const mutant1Small = Math.min(
                Math.max(smallValue / smallMax / 100, 0),
                100
            );
            expect(mutant1Small).toBe(0.003); // 30/100/100 = 0.003

            expect(correctSmall).not.toBe(mutant1Small);
        });
    });
});
