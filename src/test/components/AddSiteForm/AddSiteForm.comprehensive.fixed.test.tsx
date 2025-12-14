import "@testing-library/jest-dom";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddSiteForm } from "../../../components/AddSiteForm/AddSiteForm";
import { handleSubmit } from "../../../components/AddSiteForm/Submit";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

vi.mock("../../../components/AddSiteForm/Submit", () => ({
    handleSubmit: vi.fn(),
}));

const monitorFieldErrorState = vi.hoisted(() => ({
    shouldError: false,
}));

/**
 * Mock monitor field configs to keep the suite deterministic (no IPC).
 */
vi.mock("@app/hooks/useMonitorFields", () => ({
    useMonitorFields: vi.fn(() => ({
        error: monitorFieldErrorState.shouldError
            ? "Failed to load monitor field configurations"
            : undefined,
        getFields: (monitorType: string) => {
            if (monitorFieldErrorState.shouldError) {
                return [];
            }

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
        ],
    });
}

describe("AddSiteForm (comprehensive fixed)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        monitorFieldErrorState.shouldError = false;
        resetStores();
    });

    it("renders required URL field for HTTP", () => {
        render(<AddSiteForm />);

        expect(
            screen.getByRole("textbox", { name: /site name/i })
        ).toBeVisible();
        expect(screen.getByRole("textbox", { name: /url/i })).toBeVisible();
    });

    it("renders an error alert when monitor fields fail to load", () => {
        monitorFieldErrorState.shouldError = true;

        render(<AddSiteForm />);

        expect(
            screen.getByText(/failed to load monitor field configurations/i)
        ).toBeVisible();
    });

    it("wires submit to handleSubmit", async () => {
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
