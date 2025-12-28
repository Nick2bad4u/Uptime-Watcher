import type { UIStore } from "./types";

/** Selects the UI action used to open external URLs via the main process. */
export const selectOpenExternal = (state: UIStore): UIStore["openExternal"] =>
    state.openExternal;
