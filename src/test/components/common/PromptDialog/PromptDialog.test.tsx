/**
 * Coverage tests for the PromptDialog overlay.
 *
 * @remarks
 * PromptDialog is a central UI primitive used by destructive/advanced flows
 * (including Cloud Sync reset confirmation). Its low coverage significantly
 * impacts global thresholds, so we cover the key render + interaction paths.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import "@testing-library/jest-dom";

interface PromptRequest {
    cancelLabel: string;
    confirmLabel: string;
    message: string;
    placeholder?: string | undefined;
    title: string;
    type: string;
}

const promptControls = vi.hoisted(() => ({
    cancel: vi.fn(),
    confirm: vi.fn(),
    setValue: vi.fn(),
    request: null as null | PromptRequest,
    value: "",
}));

vi.mock("../../../../stores/ui/usePromptDialogStore", () => ({
    usePromptDialogControls: () => promptControls,
}));

import { PromptDialog } from "../../../../components/common/PromptDialog/PromptDialog";

describe(PromptDialog, () => {
    beforeEach(() => {
        vi.clearAllMocks();
        promptControls.request = null;
        promptControls.value = "";
    });

    it("renders nothing when there is no request", () => {
        const { container } = render(<PromptDialog />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders dialog content and disables confirm when value is empty", () => {
        promptControls.request = {
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Type something",
            placeholder: "Type here",
            title: "Prompt title",
            type: "text",
        };
        promptControls.value = "   ";

        render(<PromptDialog />);

        expect(screen.getByTestId("prompt-dialog-overlay")).toBeInTheDocument();
        expect(screen.getByTestId("prompt-dialog")).toBeInTheDocument();

        expect(screen.getByText("Prompt title")).toBeInTheDocument();
        expect(screen.getByText("Type something")).toBeInTheDocument();

        const confirmButton = screen.getByTestId("prompt-dialog-confirm");
        expect(confirmButton).toBeDisabled();

        const input = screen.getByLabelText("Prompt title", {
            selector: "input",
        });
        expect(input).toHaveAttribute("placeholder", "Type here");
    });

    it("calls setValue on input change and allows confirm when value is non-empty", () => {
        promptControls.request = {
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Type something",
            title: "Prompt title",
            type: "password",
        };
        promptControls.value = "ok";

        render(<PromptDialog />);

        const input = screen.getByLabelText("Prompt title", {
            selector: "input",
        });
        fireEvent.change(input, { target: { value: "new value" } });

        expect(promptControls.setValue).toHaveBeenCalledTimes(1);
        expect(promptControls.setValue).toHaveBeenCalledWith("new value");

        expect(screen.getByTestId("prompt-dialog-confirm")).toBeEnabled();
    });

    it("invokes cancel and confirm handlers", () => {
        promptControls.request = {
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Type something",
            title: "Prompt title",
            type: "text",
        };
        promptControls.value = "ok";

        render(<PromptDialog />);

        fireEvent.click(screen.getByTestId("prompt-dialog-cancel"));
        expect(promptControls.cancel).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId("prompt-dialog-confirm"));
        expect(promptControls.confirm).toHaveBeenCalledTimes(1);
    });

    it("cancels when clicking the backdrop but not when clicking inside the dialog", () => {
        promptControls.request = {
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Message",
            title: "Prompt title",
            type: "text",
        };
        promptControls.value = "ok";

        render(<PromptDialog />);

        fireEvent.click(screen.getByTestId("prompt-dialog"));
        expect(promptControls.cancel).not.toHaveBeenCalled();

        const overlay = screen.getByTestId("prompt-dialog-overlay");
        fireEvent.click(
            within(overlay).getByRole("button", { name: /close modal/i })
        );
        expect(promptControls.cancel).toHaveBeenCalledTimes(1);
    });
});
