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

type RendererSystemApi = SystemDomainBridge;

export type ElectronAPI = ElectronBridgeApi<
    EventsDomainBridge,
    RendererSystemApi
>;

declare global {
    interface Window {
        /**
         * Secure Electron API exposed through the preload bridge.
         */
        electronAPI: ElectronAPI;
    }
}
