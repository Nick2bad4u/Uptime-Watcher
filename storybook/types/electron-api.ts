import type { ElectronAPI as RendererElectronAPI } from "@app/types";

/**
 * Storybook-specific alias to make it explicit that we are using the renderer
 * bridge contract while keeping the API surface identical.
 */
export type ElectronAPI = RendererElectronAPI;
