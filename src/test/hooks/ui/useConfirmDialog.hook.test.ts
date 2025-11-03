/**
 * Tests for the {@link useConfirmDialog} hook to ensure it preserves stability
 * and delegates to the underlying confirmation store.
 */

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../stores/ui/useConfirmDialogStore", () => ({
    requestConfirmation: vi.fn(),
}));

import {
    requestConfirmation,
    type ConfirmDialogOptions,
} from "../../../stores/ui/useConfirmDialogStore";
import { useConfirmDialog } from "../../../hooks/ui/useConfirmDialog";

const mockRequestConfirmation = vi.mocked(requestConfirmation);

describe(useConfirmDialog, () => {
    beforeEach(() => {
        mockRequestConfirmation.mockReset();
    });

    it("delegates to requestConfirmation and resolves with the underlying result", async () => {
        const options: ConfirmDialogOptions = {
            message: "Delete this monitor?",
            title: "Confirm Removal",
        };
        mockRequestConfirmation.mockResolvedValueOnce(true);

        const { result } = renderHook(() => useConfirmDialog());

        await expect(result.current(options)).resolves.toBeTruthy();
        expect(mockRequestConfirmation).toHaveBeenCalledTimes(1);
        expect(mockRequestConfirmation).toHaveBeenCalledWith(options);
    });

    it("exposes a stable callback reference across renders", () => {
        const { result, rerender } = renderHook(() => useConfirmDialog());
        const initial = result.current;

        rerender();

        expect(result.current).toBe(initial);
    });
});
