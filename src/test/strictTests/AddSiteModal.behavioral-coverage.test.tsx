/**
 * @file Behavioral coverage tests for the `AddSiteModal` component.
 */

import type { ReactNode } from "react";

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const themeState = vi.hoisted(() => ({
    isDark: false,
}));

vi.mock("../../theme/useTheme", async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import("../../theme/useTheme");
    return {
        ...actual,
        useTheme: () => ({
            isDark: themeState.isDark,
        }),
    };
});

const addSiteFormMock = vi.hoisted(() => ({
    lastOnSuccess: undefined as undefined | (() => void),
    component: ({ onSuccess }: { onSuccess: () => void }) => {
        addSiteFormMock.lastOnSuccess = onSuccess;
        return <div data-testid="add-site-form-mock" />;
    },
}));

vi.mock("../../components/AddSiteForm/AddSiteForm", () => ({
    AddSiteForm: addSiteFormMock.component,
}));

const themedBoxMock = vi.hoisted(() => ({
    component: ({ children, ...props }: { children?: ReactNode }) => (
        <div {...props}>{children}</div>
    ),
}));

vi.mock("../../theme/components/ThemedBox", () => ({
    ThemedBox: themedBoxMock.component,
}));

const themedTextMock = vi.hoisted(() => ({
    component: ({ children, ...props }: { children?: ReactNode }) => (
        <span {...props}>{children}</span>
    ),
}));

vi.mock("../../theme/components/ThemedText", () => ({
    ThemedText: themedTextMock.component,
}));

import { AddSiteModal } from "../../components/AddSiteForm/AddSiteModal";

describe("AddSiteModal coverage", () => {
    beforeEach(() => {
        themeState.isDark = false;
        addSiteFormMock.lastOnSuccess = undefined;
    });

    it("closes when overlay is clicked but not when dialog is clicked", async () => {
        const onClose = vi.fn();
        render(<AddSiteModal onClose={onClose} />);

        const overlay = screen.getByTestId("add-site-modal-overlay");
        const dialog = screen.getByTestId("add-site-modal");

        fireEvent.click(dialog);
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(
            within(overlay).getByRole("button", {
                name: /close add site modal/i,
            })
        );
        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("invokes close handler for close button and form success", async () => {
        const onClose = vi.fn();
        render(<AddSiteModal onClose={onClose} />);

        fireEvent.click(screen.getByTestId("add-site-modal-close"));
        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        expect(addSiteFormMock.lastOnSuccess).toBeTypeOf("function");
        addSiteFormMock.lastOnSuccess?.();
        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(2);
        });
    });

    it("applies dark theme modifier when theme is dark", () => {
        themeState.isDark = true;
        render(<AddSiteModal onClose={vi.fn()} />);

        expect(screen.getByTestId("add-site-modal-overlay")).toHaveClass(
            "dark"
        );
    });
});
