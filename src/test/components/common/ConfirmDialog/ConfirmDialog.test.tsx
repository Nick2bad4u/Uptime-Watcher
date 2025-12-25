/**
 * Behavioral tests for the global {@link ConfirmDialog} component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface CapturedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    readonly "data-testid"?: string;
    readonly icon?: ReactNode;
    readonly variant?: string;
}

const buttonProps: CapturedButtonProps[] = [];

vi.mock("../../../../stores/ui/useConfirmDialogStore", () => ({
    useConfirmDialogControls: vi.fn(),
}));

vi.mock("../../../../theme/components/ThemedBox", () => ({
    ThemedBox: ({
        children,
        ...props
    }: {
        readonly children?: ReactNode;
    } & HTMLAttributes<HTMLElement>) => (
        <section {...props}>{children}</section>
    ),
}));

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({
        children,
        ...props
    }: {
        readonly children?: ReactNode;
    } & HTMLAttributes<HTMLElement>) => <span {...props}>{children}</span>,
}));

vi.mock("../../../../theme/components/ThemedButton", () => ({
    ThemedButton: ({
        children,
        icon,
        ...props
    }: {
        readonly children?: ReactNode;
    } & CapturedButtonProps) => {
        buttonProps.push(props);
        return (
            <button type="button" {...props}>
                {icon}
                {children}
            </button>
        );
    },
}));

import { useConfirmDialogControls } from "../../../../stores/ui/useConfirmDialogStore";
import { ConfirmDialog } from "../../../../components/common/ConfirmDialog/ConfirmDialog";

const mockUseConfirmDialogControls = vi.mocked(useConfirmDialogControls);

describe(ConfirmDialog, () => {
    beforeEach(() => {
        mockUseConfirmDialogControls.mockReset();
        buttonProps.length = 0;
    });

    it("returns null when no request is active", () => {
        mockUseConfirmDialogControls.mockReturnValue({
            cancel: vi.fn(),
            confirm: vi.fn(),
            request: null,
        });

        const { container } = render(<ConfirmDialog />);

        expect(container.firstChild).toBeNull();
    });

    it("renders the dialog and handles interactions for a danger-toned request", () => {
        const cancel = vi.fn();
        const confirm = vi.fn();
        mockUseConfirmDialogControls.mockReturnValue({
            cancel,
            confirm,
            request: {
                cancelLabel: "Cancel",
                confirmLabel: "Delete",
                details: "This action cannot be undone.",
                message: "Delete the monitor?",
                title: "Confirm Removal",
                tone: "danger",
            },
        });

        render(<ConfirmDialog />);

        expect(screen.getByText("Confirm Removal")).toBeInTheDocument();
        expect(screen.getByText("Delete the monitor?")).toBeInTheDocument();
        expect(
            screen.getByText("This action cannot be undone.")
        ).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("confirm-dialog-overlay"));
        expect(cancel).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId("confirm-dialog-confirm"));
        expect(confirm).toHaveBeenCalledTimes(1);

        const confirmButtonProps = buttonProps.find(
            (props) => props["data-testid"] === "confirm-dialog-confirm"
        );
        expect(confirmButtonProps?.variant).toBe("error");
    });

    it("does not cancel when interacting with the dialog content", () => {
        const cancel = vi.fn();
        const confirm = vi.fn();
        mockUseConfirmDialogControls.mockReturnValue({
            cancel,
            confirm,
            request: {
                cancelLabel: "Close",
                confirmLabel: "Okay",
                message: "Review the updates",
                title: "Information",
                tone: "default",
            },
        });

        render(<ConfirmDialog />);

        fireEvent.click(screen.getByTestId("confirm-dialog"));
        expect(cancel).not.toHaveBeenCalled();

        const confirmButtonProps = buttonProps.find(
            (props) => props["data-testid"] === "confirm-dialog-confirm"
        );
        expect(confirmButtonProps?.variant).toBe("primary");
        expect(screen.queryByText("This action cannot be undone.")).toBeNull();
    });
});
