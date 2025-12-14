import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { DynamicMonitorFields } from "../../../components/AddSiteForm/DynamicMonitorFields";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

const httpMonitorType: MonitorTypeConfig = {
    description: "HTTP monitor",
    displayName: "HTTP",
    fields: [
        {
            label: "URL",
            name: "url",
            placeholder: "https://example.com",
            required: true,
            type: "url",
        },
        {
            label: "Timeout",
            name: "timeout",
            placeholder: "5000",
            required: false,
            type: "number",
        },
    ],
    type: "http",
    version: "1.0.0",
};

const portMonitorType: MonitorTypeConfig = {
    description: "Port monitor",
    displayName: "Port",
    fields: [
        {
            label: "Host",
            name: "host",
            placeholder: "example.com",
            required: true,
            type: "text",
        },
        {
            label: "Port",
            name: "port",
            placeholder: "443",
            required: true,
            type: "number",
        },
    ],
    type: "port",
    version: "1.0.0",
};

describe(DynamicMonitorFields, () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useErrorStore.getState().clearStoreError("monitor-types");

        useMonitorTypesStore.setState({
            fieldConfigs: {
                http: httpMonitorType.fields,
                port: portMonitorType.fields,
            },
            isLoaded: true,
            monitorTypes: [httpMonitorType, portMonitorType],
        });
    });

    it("renders dynamic fields for the selected monitor type", async () => {
        render(
            <DynamicMonitorFields
                monitorType="http"
                values={{ url: "https://example.com" }}
                onChange={{
                    url: vi.fn(),
                }}
            />
        );

        expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Timeout")).toBeInTheDocument();
    });

    it("shows a loading message and triggers monitorTypes loading", async () => {
        const loadMonitorTypes = vi.fn(async () => undefined);

        useMonitorTypesStore.setState({
            isLoaded: false,
            loadMonitorTypes,
            monitorTypes: [],
        });

        render(
            <DynamicMonitorFields
                monitorType="http"
                values={{}}
                onChange={{}}
            />
        );

        expect(
            screen.getByText("Loading monitor fields...")
        ).toBeInTheDocument();
        expect(loadMonitorTypes).toHaveBeenCalledTimes(1);
    });

    it("shows an error alert when monitor types are unavailable", async () => {
        useErrorStore
            .getState()
            .setStoreError("monitor-types", "Failed to load configuration");

        render(
            <DynamicMonitorFields
                monitorType="http"
                values={{}}
                onChange={{}}
            />
        );

        expect(
            screen.getByText(
                "Error loading monitor fields: Failed to load configuration"
            )
        ).toBeInTheDocument();
    });

    it("shows an unknown monitor type alert", async () => {
        render(
            <DynamicMonitorFields
                monitorType="ping"
                values={{}}
                onChange={{}}
            />
        );

        expect(
            screen.getByText("Unknown monitor type: ping")
        ).toBeInTheDocument();
    });

    it("falls back to the default value for missing numeric fields", async () => {
        render(
            <DynamicMonitorFields
                monitorType="http"
                values={{ url: "https://example.com" }}
                onChange={{
                    url: vi.fn(),
                }}
            />
        );

        const timeoutField = screen.getByLabelText("Timeout");
        expect(timeoutField).toHaveValue(0);
    });
});
