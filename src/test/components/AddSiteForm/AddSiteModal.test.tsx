/**
 * Behavioral tests for the `AddSiteModal` component ensuring overlay control,
 * theming, and form integration logic are covered.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { AddSiteModal } from "../../../components/AddSiteForm/AddSiteModal";

interface ThemeState {
    isDark: boolean;
}

interface BoxInvocation {
    readonly props: Record<string, unknown>;
    readonly children: ReactNode;
}

interface FormInvocation {
    readonly onSuccess: () => void;
}

const { themeState, boxInvocations, formInvocations, closeIconSpy } =
    vi.hoisted(() => ({
        themeState: { isDark: false } as ThemeState,
        boxInvocations: [] as BoxInvocation[],
        formInvocations: [] as FormInvocation[],
        closeIconSpy: vi.fn(({ size }: { readonly size?: number }) => (
            <svg data-testid="add-site-modal-close-icon" data-size={size} />
        )),
    }));

vi.mock("../../../theme/useTheme", () => ({
    useTheme: () => themeState,
}));

vi.mock("../../../theme/components/ThemedBox", () => ({
    ThemedBox: ({
        children,
        ...props
    }: { readonly children: ReactNode } & Record<string, unknown>) => {
        boxInvocations.push({ children, props });
        return <div {...props}>{children}</div>;
    },
}));

vi.mock("../../../theme/components/ThemedText", () => ({
    ThemedText: ({ children, ...props }: { readonly children: ReactNode }) => (
        <span {...props}>{children}</span>
    ),
}));

vi.mock("../../../utils/icons", () => ({
    AppIcons: {
        actions: {
            add: ({ size }: { readonly size?: number }) => (
                <svg
                    data-testid="add-site-modal-action-icon"
                    data-size={size}
                />
            ),
        },
        ui: {
            close: closeIconSpy,
        },
    },
}));

vi.mock("../../../components/AddSiteForm/AddSiteForm", () => ({
    AddSiteForm: ({ onSuccess }: { readonly onSuccess: () => void }) => {
        formInvocations.push({ onSuccess });
        return (
            <button
                data-testid="add-site-form-stub"
                onClick={onSuccess}
                type="button"
            >
                trigger success
            </button>
        );
    },
}));

beforeEach(() => {
    themeState.isDark = false;
    closeIconSpy.mockClear();
    boxInvocations.length = 0;
    formInvocations.length = 0;
});

describe(AddSiteModal, () => {
    it("renders modal content and wires the form success handler", async () => {
        const handleClose = vi.fn();

        render(<AddSiteModal onClose={handleClose} />);

        expect(
            screen.getByRole("heading", { name: "Add New Site" })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /configure monitoring for a new property or link additional monitors to an existing site/i
            )
        ).toBeInTheDocument();
        expect(formInvocations).toHaveLength(1);
        expect(typeof formInvocations[0]!.onSuccess).toBe("function");

        fireEvent.click(screen.getByTestId("add-site-form-stub"));
        await waitFor(() => {
            expect(handleClose).toHaveBeenCalledTimes(1);
        });
    });

    it("only triggers onClose when the overlay backdrop is clicked", async () => {
        const handleClose = vi.fn();

        render(<AddSiteModal onClose={handleClose} />);

        fireEvent.click(screen.getByTestId("add-site-modal-overlay"));
        await waitFor(() => {
            expect(handleClose).toHaveBeenCalledTimes(1);
        });

        fireEvent.click(screen.getByTestId("add-site-modal"));
        await waitFor(() => {
            expect(handleClose).toHaveBeenCalledTimes(1);
        });
    });

    it("applies dark theme styling and respects explicit close action", async () => {
        const handleClose = vi.fn();
        themeState.isDark = true;

        render(<AddSiteModal onClose={handleClose} />);

        expect(screen.getByTestId("add-site-modal-overlay")).toHaveClass(
            "dark"
        );

        fireEvent.click(screen.getByTestId("add-site-modal-close"));
        await waitFor(() => {
            expect(handleClose).toHaveBeenCalledTimes(1);
        });
        expect(closeIconSpy).toHaveBeenCalled();
        expect(closeIconSpy.mock.calls[0]?.[0]).toEqual({ size: 18 });
    });
});
