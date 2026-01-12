/**
 * @file Strict coverage tests for the prompt dialog hook.
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PromptDialogOptions } from "@app/hooks/ui/usePromptDialog";

const requestPromptMock = vi.fn<
    (options: PromptDialogOptions) => Promise<null | string>
>(async () => "ok");

vi.mock("@app/stores/ui/usePromptDialogStore", () => ({
    requestPrompt: requestPromptMock,
}));

describe("usePromptDialog", () => {
    it("delegates to requestPrompt", async () => {
        const { usePromptDialog } =
            await import("@app/hooks/ui/usePromptDialog");

        const { result } = renderHook(() => usePromptDialog());

        const options: PromptDialogOptions = {
            title: "Title",
            message: "Message",
            placeholder: "Enter value",
        };

        const response = await result.current(options);

        expect(requestPromptMock).toHaveBeenCalledTimes(1);
        expect(requestPromptMock).toHaveBeenCalledWith(options);
        expect(response).toBe("ok");
    });
});
