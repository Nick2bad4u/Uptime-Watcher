/**
 * Renderer type declarations for the Electron preload bridge.
 *
 * @remarks
 * Uses shared preload bridge contracts to ensure the renderer surface stays in
 * sync with the Electron preload implementation.
 */

import type { EventsDomainBridge } from "@shared/types/eventsBridge";
import type {
    ElectronBridgeApi,
    SystemDomainBridge,
} from "@shared/types/preload";

/**
 * Renderer-specific augmentation of the shared system domain bridge surface.
 *
 * @remarks
 * Extends the preload-provided {@link SystemDomainBridge} with renderer-only
 * helpers such as `quitAndInstall` that are wired through the preload script.
 *
 * @internal
 */
type RendererSystemApi = SystemDomainBridge & {
    readonly quitAndInstall: () => void;
};

declare global {
    interface Window {
        /**
         * Secure Electron API exposed through the preload bridge.
         */
        electronAPI: ElectronBridgeApi<EventsDomainBridge, RendererSystemApi>;
    }
}

/**
 * Convenient alias for the Electron API surface available in the renderer.
 *
 * @public
 */
export type ElectronAPI = Window["electronAPI"];
