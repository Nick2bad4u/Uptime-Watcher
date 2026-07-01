/**
 * Behavioral tests for the `AddSiteModal` component ensuring overlay control,
 * theming, and form integration logic are covered.
 */

import type { UnknownRecord } from "type-fest";

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { arrayFirst, safeCastTo  } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddSiteModal } from "../../../components/AddSiteForm/AddSiteModal";

interface ThemeState {
    isDark: boolean;
}

interface BoxInvocation {
    readonly children: ReactNode;
    readonly props: UnknownRecord;
}

interface FormInvocation {
    readonly onSuccess: () => void;
}

const { themeState, boxInvocations, formInvocations, closeIconSpy } =
    vi.hoisted(() => ({
        themeState: { isDark: false },
        boxInvocations: safeCastTo<BoxInvocation[]>([]),
        formInvocations: safeCastTo<FormInvocation[]>([]),
        closeIconSpy: vi.fn(({ size }: { readonly size?: number }) => (
            <svg data-size={size} data-testid="add-site-modal-close-icon" />
        )),
    }));

vi.mock(import('../../../theme/useTheme'), () => ({
    useTheme: () => themeState,
}));

vi.mock(import('../../../theme/components/ThemedBox'), () => ({
    ThemedBox: ({
        children,
        ...props
    }: UnknownRecord & { readonly children: ReactNode }) => {
        boxInvocations.push({ children, props });
        return <div {...props}>{children}</div>;
    },
}));

vi.mock(import('../../../theme/components/ThemedText'), () => ({
    ThemedText: ({
        as,
        children,
        ...props
    }: UnknownRecord & {
        readonly as?: string;
        readonly children: ReactNode;
    }) => {
        const tagName = typeof as === "string" ? as : "span";
        return createElement(tagName, props, children);
    },
}));

vi.mock(import('../../../utils/icons'), () => ({
    AppIcons: {
        actions: {
            add: ({ size }: { readonly size?: number }) => (
                <svg
                    data-size={size}
                    data-testid="add-site-modal-action-icon"
                />
            ),
        },
        ui: {
            close: closeIconSpy,
        },
    },
}));

vi.mock(import('../../../components/AddSiteForm/AddSiteForm'), () => ({
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
        expect(typeof arrayFirst(formInvocations)!.onSuccess).toBe("function");

        fireEvent.click(screen.getByTestId("add-site-form-stub"));
        await waitFor(() => {
            expect(handleClose).toHaveBeenCalledTimes(1);
        });
    });

    it("only triggers onClose when the overlay backdrop is clicked", async () => {
        const handleClose = vi.fn();

        render(<AddSiteModal onClose={handleClose} />);

        const overlay = screen.getByTestId("add-site-modal-overlay");
        fireEvent.click(
            within(overlay).getByRole("button", {
                name: /close add site modal/i,
            })
        );
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
        expect(closeIconSpy).toHaveBeenCalledWith();
        expect(arrayFirst(closeIconSpy.mock.calls)?.[0]).toEqual({ size: 18 });
    });
});
