/**
 * Hook that exposes the global prompt dialog utility.
 */

import { useCallback } from "react";

import { requestPrompt } from "../../stores/ui/usePromptDialogStore";

/** Options accepted by the prompt dialog utility. */
export type PromptDialogOptions = Parameters<typeof requestPrompt>[0];

/**
 * Returns a stable function for requesting prompt dialogs.
 */
export function usePromptDialog(): (
    options: PromptDialogOptions
) => Promise<null | string> {
    return useCallback(
        (options: PromptDialogOptions) => requestPrompt(options),
        []
    );
}
