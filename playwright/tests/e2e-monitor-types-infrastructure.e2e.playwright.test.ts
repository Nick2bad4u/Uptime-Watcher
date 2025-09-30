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
    "specialized infrastructure monitor types",
    {
        tag: [
            "@e2e",
            "@monitor-types",
            "@infrastructure",
        ],
        annotation: {
            type: "category",
            description:
                "E2E coverage for infrastructure-oriented monitor types including DNS, SSL, WebSocket, heartbeat, replication, and CDN checks.",
        },
    },
    () => {
        test(
            "dns monitor type toggles expected value by record type",
            {
                tag: ["@dns-monitor", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Validates DNS monitors handle record type selection and optional expected value appropriately.",
                },
            },
            async () => {
                test.setTimeout(120000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("DNS Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "dns");

                    const recordTypeSelect = window.getByLabel(
                        "Record Type (required)"
                    );
                    const expectedValueInput =
                        window.getByLabel("Expected Value");

                    await recordTypeSelect.selectOption("ANY");
                    await expect(expectedValueInput).toBeDisabled();

                    await recordTypeSelect.selectOption("A");
                    await expect(expectedValueInput).toBeEnabled();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Host (required)")
                        .fill("example.com");
                    await expectedValueInput.fill("1.1.1.1");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "ssl monitor type captures certificate configuration",
            {
                tag: ["@ssl-monitor", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Ensures SSL monitors accept host, port, and expiry warning configuration.",
                },
            },
            async () => {
                test.setTimeout(120000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("SSL Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "ssl");

                    await expect(
                        window.getByLabel("Host (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Host (required)")
                        .fill("example.com");
                    await window.getByLabel("Port (required)").fill("443");
                    await window
                        .getByLabel("Expiry Warning (days) (required)")
                        .fill("30");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "websocket monitor type enforces keepalive threshold",
            {
                tag: ["@websocket-monitor", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Validates WebSocket keepalive monitors capture URL and pong delay settings.",
                },
            },
            async () => {
                test.setTimeout(120000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("WebSocket Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "websocket-keepalive");

                    await expect(
                        window.getByLabel("WebSocket URL (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("WebSocket URL (required)")
                        .fill("wss://echo.websocket.events");
                    await window
                        .getByLabel("Max Pong Delay (ms) (required)")
                        .fill("1500");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "server heartbeat monitor enforces drift limits",
            {
                tag: ["@heartbeat-monitor", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Ensures server heartbeat monitors support status, timestamp, and drift configuration.",
                },
            },
            async () => {
                test.setTimeout(120000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("Heartbeat Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "server-heartbeat");

                    await expect(
                        window.getByLabel("Heartbeat URL (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Heartbeat URL (required)")
                        .fill("https://api.example.com/heartbeat");
                    await window
                        .getByLabel("Status Field (required)")
                        .fill("data.status");
                    await window
                        .getByLabel("Expected Status (required)")
                        .fill("ok");
                    await window
                        .getByLabel("Timestamp Field (required)")
                        .fill("data.timestamp");
                    await window
                        .getByLabel("Max Drift (seconds) (required)")
                        .fill("60");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "replication monitor type accepts replication lag settings",
            {
                tag: ["@replication-monitor", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Validates replication monitors collect primary/replica URLs and lag thresholds.",
                },
            },
            async () => {
                test.setTimeout(120000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("Replication Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "replication");

                    await expect(
                        window.getByLabel("Primary Status URL (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Primary Status URL (required)")
                        .fill("https://primary.example.com/status");
                    await window
                        .getByLabel("Replica Status URL (required)")
                        .fill("https://replica.example.com/status");
                    await window
                        .getByLabel("Timestamp Field (required)")
                        .fill("data.lastAppliedTimestamp");
                    await window
                        .getByLabel("Max Replication Lag (seconds) (required)")
                        .fill("30");

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "cdn edge consistency monitor saves edge configuration",
            {
                tag: ["@cdn-monitor", "@monitor-form"],
                annotation: {
                    type: "monitor-type",
                    description:
                        "Ensures CDN edge consistency monitors accept baseline URL and edge endpoints list.",
                },
            },
            async () => {
                test.setTimeout(120000);

                const { electronApp, window } =
                    await launchAppForMonitorTesting();

                const siteName = createUniqueName("CDN Monitor");

                try {
                    await openAddSiteModal(window);
                    await selectMonitorType(window, "cdn-edge-consistency");

                    await expect(
                        window.getByLabel("Baseline URL (required)")
                    ).toBeVisible();

                    await window
                        .getByLabel("Site Name (required)")
                        .fill(siteName);
                    await window
                        .getByLabel("Baseline URL (required)")
                        .fill("https://origin.example.com/status");
                    await window
                        .getByLabel("Edge Endpoints (required)")
                        .fill(
                            "https://edge1.example.com/status,https://edge2.example.com/status"
                        );

                    await submitMonitorForm(window);
                    await verifySiteCreated(window, siteName);
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);
