/**
 * Regression tests for the ConfirmDialog component.
 *
 * @remarks
 * Ensures the confirmation overlay keeps the highest stacking order so that it
 * always renders above feature modals like SiteDetails.
 */

import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ConfirmDialog } from "../../../components/common/ConfirmDialog/ConfirmDialog";
import { requestConfirmation } from "../../../stores/ui/useConfirmDialogStore";

const getConfirmDialogBridge = (): {
    cancel: () => void;
} => {
    const bridge = (
        globalThis as typeof globalThis & {
            playwrightConfirmDialog?: {
                cancel: () => void;
            };
        }
    ).playwrightConfirmDialog;

    if (!bridge) {
        throw new Error("Confirm dialog automation bridge is unavailable");
    }

    return bridge;
};

describe(ConfirmDialog, () => {
    beforeEach(() => {
        act(() => {
            getConfirmDialogBridge().cancel();
        });
    });

    afterEach(() => {
        act(() => {
            getConfirmDialogBridge().cancel();
        });
    });

    it("applies a dedicated stacking class so the dialog stays above other modals", async ({
        annotate,
        task,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ConfirmDialog", "component");
        annotate("Category: UI", "category");
        annotate("Type: Regression", "type");

        let confirmation!: Promise<boolean>;
        act(() => {
            confirmation = requestConfirmation({
                confirmLabel: "Delete",
                message: "Delete the selected site?",
                title: "Confirm Delete",
                tone: "danger",
            });
        });

        render(<ConfirmDialog />);

        const overlay = document.querySelector(".modal-overlay--confirm");
        expect(overlay).not.toBeNull();
        expect(overlay).toHaveClass("modal-overlay--confirm");
        expect(overlay).toHaveClass("modal-overlay");

        act(() => {
            getConfirmDialogBridge().cancel();
        });
        await expect(confirmation).resolves.toBeFalsy();
    });
});
