/**
 * Regression tests for the ConfirmDialog component.
 *
 * @remarks
 * Ensures the confirmation overlay keeps the highest stacking order so that it
 * always renders above feature modals like SiteDetails.
 */

import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import { ConfirmDialog } from "../../../components/common/ConfirmDialog/ConfirmDialog";
import {
    resetConfirmDialogState,
    useConfirmDialogStore,
} from "../../../stores/ui/useConfirmDialogStore";

describe(ConfirmDialog, () => {
    beforeEach(() => {
        act(() => {
            resetConfirmDialogState();
        });
    });

    afterEach(() => {
        act(() => {
            resetConfirmDialogState();
        });
    });

    it("applies a dedicated stacking class so the dialog stays above other modals", ({
        annotate,
        task,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ConfirmDialog", "component");
        annotate("Category: UI", "category");
        annotate("Type: Regression", "type");

        act(() => {
            useConfirmDialogStore.setState({
                request: {
                    cancelLabel: "Cancel",
                    confirmLabel: "Delete",
                    message: "Delete the selected site?",
                    title: "Confirm Delete",
                    tone: "danger",
                },
                resolve: vi.fn(),
            });
        });

        render(<ConfirmDialog />);

        const overlay = document.querySelector(".modal-overlay--confirm");
        expect(overlay).not.toBeNull();
        expect(overlay).toHaveClass("modal-overlay--confirm");
        expect(overlay).toHaveClass("modal-overlay");
    });
});
