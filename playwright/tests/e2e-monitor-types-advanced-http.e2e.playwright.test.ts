import { test, expect } from "@playwright/test";

import {
    createUniqueName,
    launchAppForMonitorTesting,
    openAddSiteModal,
    selectMonitorType,
    submitMonitorForm,
    verifySiteCreated,
} from "./utils/monitorTypeTestUtils";

test.describe.serial(
    "advanced http monitor types",
    {
        tag: [
            "@e2e",
            "@monitor-types",
            "@advanced-http",
        ],
        annotation: {
            type: "category",
            description:
                "E2E coverage for HTTP-derived monitor types including keyword, status, header, JSON, and latency checks.",
        },
    },
    () => {
        test(
            "http keyword monitor supports keyword validation flow",
            {
                tag: ["@http-keyword", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Ensures HTTP keyword monitors can be configured and saved via the Add Site modal.",
                },
            },
            async () => {
                test.setTimeout(90000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("HTTP Keyword Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "http-keyword");

                    await expect(
                        window.getByLabel("Keyword (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Website URL (required)")
                        .fill("https://httpbin.org/anything");
                    await window
                        .getByLabel("Keyword (required)")
                        .fill("origin");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "http status monitor allows expected status configuration",
            {
                tag: ["@http-status", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Ensures HTTP status monitors capture target URL and expected status code fields.",
                },
            },
            async () => {
                test.setTimeout(90000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("HTTP Status Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "http-status");

                    await expect(
                        window.getByLabel("Expected Status Code (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Website URL (required)")
                        .fill("https://httpbin.org/status/204");
                    await window
                        .getByLabel("Expected Status Code (required)")
                        .fill("204");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "http header monitor captures header comparison settings",
            {
                tag: ["@http-header", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Validates HTTP header monitors support entering header name and expected value.",
                },
            },
            async () => {
                test.setTimeout(90000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("HTTP Header Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "http-header");

                    await expect(
                        window.getByLabel("Header Name (required)")
                    ).toBeVisible();
                    await expect(
                        window.getByLabel("Expected Header Value (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Website URL (required)")
                        .fill("https://httpbin.org/response-headers?foo=bar");
                    await window
                        .getByLabel("Header Name (required)")
                        .fill("foo");
                    await window
                        .getByLabel("Expected Header Value (required)")
                        .fill("bar");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "http JSON monitor supports json path validation",
            {
                tag: ["@http-json", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Ensures HTTP JSON monitors allow configuring JSON path and expected value fields.",
                },
            },
            async () => {
                test.setTimeout(90000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("HTTP JSON Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "http-json");

                    await expect(
                        window.getByLabel("JSON Path (required)")
                    ).toBeVisible();
                    await expect(
                        window.getByLabel("Expected Value (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Website URL (required)")
                        .fill("https://httpbin.org/json");
                    await window
                        .getByLabel("JSON Path (required)")
                        .fill("slideshow.title");
                    await window
                        .getByLabel("Expected Value (required)")
                        .fill("Sample Slide Show");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "http latency monitor enforces max response time threshold",
            {
                tag: ["@http-latency", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Confirms HTTP latency monitors accept threshold configuration and save correctly.",
                },
            },
            async () => {
                test.setTimeout(90000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("HTTP Latency Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "http-latency");

                    await expect(
                        window.getByLabel("Max Response Time (ms) (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Website URL (required)")
                        .fill("https://httpbin.org/delay/1");
                    await window
                        .getByLabel("Max Response Time (ms) (required)")
                        .fill("2000");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);
