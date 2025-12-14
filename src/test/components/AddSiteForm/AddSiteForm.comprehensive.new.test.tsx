import "@testing-library/jest-dom";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";
import { handleSubmit } from "../../../components/AddSiteForm/Submit";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

vi.mock("../../../components/AddSiteForm/Submit", () => ({
    handleSubmit: vi.fn(),
}));

/**
 * This suite intentionally mocks useMonitorFields so it does not depend on IPC
 * bridge readiness.
 */
vi.mock("@app/hooks/useMonitorFields", () => ({
    useMonitorFields: vi.fn(() => ({
        error: undefined,
        getFields: (monitorType: string) => {
            switch (monitorType) {
                case "http": {
                    return [
                        {
                            label: "URL",
                            name: "url",
                            required: true,
                            type: "url",
                        },
                    ];
                }
                case "port": {
                    return [
                        {
                            label: "Host",
                            name: "host",
                            required: true,
                            type: "text",
                        },
                        {
                            label: "Port",
                            name: "port",
                            required: true,
                            type: "number",
                        },
                    ];
                }
                case "ping": {
                    return [
                        {
                            label: "Host",
                            name: "host",
                            required: true,
                            type: "text",
                        },
                    ];
                }
                default: {
                    return [];
                }
            }
        },
        isLoaded: true,
    })),
}));

function resetStores(): void {
    useErrorStore.getState().clearAllErrors();

    useMonitorTypesStore.setState({
        isLoaded: true,
        monitorTypes: [
            {
                description: "HTTP monitor",
                displayName: "HTTP",
                fields: [
                    {
                        label: "URL",
                        name: "url",
                        required: true,
                        type: "url",
                    },
                ],
                type: "http",
                version: "1.0.0",
            },
            {
                description: "Port monitor",
                displayName: "Port",
                fields: [
                    {
                        label: "Host",
                        name: "host",
                        required: true,
                        type: "text",
                    },
                    {
                        label: "Port",
                        name: "port",
                        required: true,
                        type: "number",
                    },
                ],
                type: "port",
                version: "1.0.0",
            },
            {
                description: "Ping monitor",
                displayName: "Ping",
                fields: [
                    {
                        label: "Host",
                        name: "host",
                        required: true,
                        type: "text",
                    },
                ],
                type: "ping",
                version: "1.0.0",
            },
        ],
    });
}

describe("AddSiteForm (comprehensive new)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetStores();
    });

    it("renders the initial HTTP form fields", () => {
        render(<AddSiteForm />);

        expect(
            screen.getByRole("textbox", { name: /site name/i })
        ).toBeVisible();

        // Default monitor type is expected to be HTTP in the add-site flow.
        expect(screen.getByRole("textbox", { name: /url/i })).toBeVisible();
    });

    it("renders the port monitor fields when selected", async () => {
        const user = userEvent.setup();
        render(<AddSiteForm />);

        const monitorTypeSelect = screen.getByLabelText(/monitor type/i);

        // Monitor type options are loaded asynchronously via useMonitorTypes.
        await waitFor(() => {
            expect(monitorTypeSelect).toBeEnabled();
        });

        await user.selectOptions(monitorTypeSelect, "port");

        expect(screen.getByRole("textbox", { name: /host/i })).toBeVisible();
        expect(screen.getByRole("spinbutton", { name: /port/i })).toBeVisible();
    });

    it("calls handleSubmit when the user submits", async () => {
        const user = userEvent.setup();
        render(<AddSiteForm />);

        await user.type(
            screen.getByRole("textbox", { name: /site name/i }),
            "Test"
        );
        await user.type(
            screen.getByRole("textbox", { name: /url/i }),
            "https://example.com"
        );

        const form = screen.getByRole("form", { name: /add site/i });
        const submitButton = within(form).getByRole("button", {
            name: /add site/i,
        });

        await user.click(submitButton);

        expect(vi.mocked(handleSubmit)).toHaveBeenCalledTimes(1);
    });
});
